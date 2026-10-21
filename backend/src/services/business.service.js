// src/services/business.service.js

const mongoose = require('mongoose');
const Business = require('../models/Business');
const AuditLog = require('../models/AuditLog');
const AppError = require('../errors/AppError');
const Post = require('../models/Post');
const PromptHistory = require('../models/PromptHistory');
const Subscription = require('../models/Subscription');
const PLANS = require('../constants/plans');
const ROLES = require('../constants/roles');
const notificationService = require('./notification.service');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');

// ─── Audit Log Helper ─────────────────────────────────────────────────────────

const writeAuditLog = async ({ action, userId, businessId, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      action,
      userId,
      businessId,
      entity: 'Business',
      entityId,
      ipAddress: meta.ip || '',
      userAgent: meta.userAgent || '',
      requestId: meta.requestId || '',
      status: 'success',
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AuditLog] Failed to write "${action}" log:`, err.message);
    }
  }
};

// ─── Create Business ──────────────────────────────────────────────────────────

const createBusiness = async ({ userId, data, meta = {} }) => {
  const subscription = await Subscription.findOne({ ownerId: userId });
  if (!subscription) {
    throw new AppError('Subscription not found. Please contact support.', 404);
  }
  if (subscription.status !== 'ACTIVE') {
    throw new AppError('subscription expired, please renew', 403);
  }

  const planLimits = PLANS[subscription.planKey];
  if (!planLimits) {
    throw new AppError('Invalid subscription plan.', 500);
  }

  if (planLimits.maxBusinesses !== -1) {
    const currentBusinessCount = await Business.countDocuments({ ownerId: userId });
    if (currentBusinessCount >= planLimits.maxBusinesses) {
      throw new AppError('Business creation limit reached for your current plan.', 403);
    }
  }

  const business = await Business.create({
    ownerId: userId,
    name: data.name,
    category: data.category,
    industry: data.industry || '',
    description: data.description || '',
    location: data.location || {},
    services: data.services || [],
    members: [{ userId, role: ROLES.OWNER }],
  });

  await writeAuditLog({
    action: 'BUSINESS_CREATED',
    userId,
    businessId: business._id,
    entityId: business._id,
    meta,
  });

  await notificationService.createNotification({
    userId,
    businessId: business._id,
    title: 'Business Created',
    message: `Business ${business.name} created successfully.`,
    type: NOTIFICATION_TYPES.SUCCESS,
    entityType: 'Business',
    entityId: business._id,
  });

  return business.toJSON();
};

// ─── Get My Businesses ────────────────────────────────────────────────────────

const getMyBusinesses = async (userId) => {
  const businesses = await Business.find({ ownerId: userId });
  return businesses.map((b) => b.toJSON());
};

// ─── Get Single Business ──────────────────────────────────────────────────────

const getBusiness = async (business) => {
  return business.toJSON();
};

// ─── Update Business ──────────────────────────────────────────────────────────

const updateBusiness = async ({ business, data, userId, meta = {} }) => {
  const allowedFields = [
    'name',
    'category',
    'industry',
    'description',
    'location',
    'services',
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      business[field] = data[field];
    }
  });

  await business.save();

  await writeAuditLog({
    action: 'BUSINESS_UPDATED',
    userId,
    businessId: business._id,
    entityId: business._id,
    meta,
  });

  return business.toJSON();
};

// ─── Delete Business ──────────────────────────────────────────────────────────

const deleteBusiness = async ({ business, userId, meta = {} }) => {
  await business.softDelete(userId);

  await writeAuditLog({
    action: 'BUSINESS_DELETED',
    userId,
    businessId: business._id,
    entityId: business._id,
    meta,
  });
};

// ─── Dashboard Summary ────────────────────────────────────────────────────────

const getDashboardSummary = async (business) => {
  const businessId = business._id;

  const now = new Date();

  // Start of the current week (Monday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of the current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalPosts,
    draftPosts,
    scheduledPosts,
    publishedPosts,
    postsThisWeek,
    postsThisMonth,
    recentActivity,
    favoritePrompts,
    recentGenerations,
  ] = await Promise.all([
    Post.countDocuments({ businessId }),
    Post.countDocuments({ businessId, status: 'draft' }),
    Post.countDocuments({ businessId, status: 'scheduled' }),
    Post.countDocuments({ businessId, status: 'published' }),
    Post.countDocuments({ businessId, createdAt: { $gte: startOfWeek } }),
    Post.countDocuments({ businessId, createdAt: { $gte: startOfMonth } }),
    AuditLog.find({ businessId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    PromptHistory.countDocuments({ businessId, favorite: true }),
    PromptHistory.countDocuments({ businessId }),
  ]);

  const requiredFields = [
    business.name,
    business.category,
    business.description,
    business.location?.city,
    business.location?.country,
    business.settings?.timezone,
    business.settings?.language,
    business.settings?.tone
  ];
  
  const filledFields = requiredFields.filter(f => f && String(f).trim() !== '').length;
  const completionPercentage = Math.round((filledFields / requiredFields.length) * 100);
  const businessConfigured = filledFields === requiredFields.length;

  return {
    totalPosts,
    draftPosts,
    scheduledPosts,
    publishedPosts,
    postsThisWeek,
    postsThisMonth,
    totalCampaigns: 0,
    activeCampaigns: 0,
    recentActivity,
    favoritePrompts,
    recentGenerations,
    completionPercentage,
    businessConfigured,
  };
};

// ─── Get Settings ─────────────────────────────────────────────────────────────

const getSettings = async (business) => {
  return business.toJSON();
};

// ─── Update Settings ──────────────────────────────────────────────────────────

const updateSettings = async ({ business, data, userId, meta = {} }) => {
  // Update Root Fields
  const rootFields = ['name', 'category', 'industry', 'description', 'email', 'phone', 'logoUrl', 'services'];
  rootFields.forEach((field) => {
    if (data[field] !== undefined) {
      business[field] = data[field];
    }
  });

  // Update Location
  if (data.location) {
    const locFields = ['address', 'city', 'state', 'country'];
    locFields.forEach(f => {
      if (data.location[f] !== undefined) {
        business.location[f] = data.location[f];
      }
    });
  }

  // Update Settings
  if (data.settings) {
    const settingsFields = ['tone', 'timezone', 'language', 'targetAudience', 'autoApprovePosts', 'brandColors'];
    settingsFields.forEach((field) => {
      if (data.settings[field] !== undefined) {
        business.settings[field] = data.settings[field];
      }
    });

    if (data.settings.socialLinks) {
      const socialFields = ['instagram', 'facebook', 'linkedin', 'website'];
      socialFields.forEach(f => {
        if (data.settings.socialLinks[f] !== undefined) {
          business.settings.socialLinks[f] = data.settings.socialLinks[f];
        }
      });
    }
    
    if (data.settings.postingPreferences) {
      if (data.settings.postingPreferences.preferredDays !== undefined) {
        business.settings.postingPreferences.preferredDays = data.settings.postingPreferences.preferredDays;
      }
      if (data.settings.postingPreferences.preferredTime !== undefined) {
        business.settings.postingPreferences.preferredTime = data.settings.postingPreferences.preferredTime;
      }
    }
  } else {
    // Also support flat fields passed directly for legacy/simplicity
    const flatSettings = ['tone', 'timezone', 'language', 'targetAudience', 'autoApprovePosts'];
    flatSettings.forEach((field) => {
      if (data[field] !== undefined) {
        business.settings[field] = data[field];
      }
    });
    if (data.postingPreferences) {
      if (data.postingPreferences.preferredDays !== undefined) {
        business.settings.postingPreferences.preferredDays = data.postingPreferences.preferredDays;
      }
      if (data.postingPreferences.preferredTime !== undefined) {
        business.settings.postingPreferences.preferredTime = data.postingPreferences.preferredTime;
      }
    }
  }

  business.markModified('settings');
  business.markModified('location');
  await business.save();

  await writeAuditLog({
    action: 'SETTINGS_UPDATED',
    userId,
    businessId: business._id,
    entityId: business._id,
    meta,
  });

  await notificationService.createNotification({
    userId,
    businessId: business._id,
    title: 'Settings Updated',
    message: `Settings for ${business.name} were updated.`,
    type: NOTIFICATION_TYPES.INFO,
    entityType: 'Business',
    entityId: business._id,
  });

  return business.toJSON();
};

// ─── Get Members ──────────────────────────────────────────────────────────────

const getMembers = async (business) => {
  const populated = await business.populate({
    path: 'members.userId',
    select: 'name email avatarUrl role',
  });

  return populated.members.map((member) => ({
    user: member.userId,
    role: member.role,
    joinedAt: member.joinedAt,
  }));
};

// ─── Analytics ───────────────────────────────────────────────────────────────

const getAnalytics = async (business) => {
  const businessId = business._id;

  const [totalPosts, draftPosts, scheduledPosts, publishedPosts] = await Promise.all([
    Post.countDocuments({ businessId }),
    Post.countDocuments({ businessId, status: 'draft' }),
    Post.countDocuments({ businessId, status: 'scheduled' }),
    Post.countDocuments({ businessId, status: 'published' })
  ]);

  const [totalGenerations, favoritePrompts] = await Promise.all([
    PromptHistory.countDocuments({ businessId }),
    PromptHistory.countDocuments({ businessId, favorite: true })
  ]);

  const reusedPromptsAgg = await PromptHistory.aggregate([
    { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
    { $group: { _id: null, total: { $sum: '$reuseCount' } } }
  ]);
  const reusedPrompts = reusedPromptsAgg.length > 0 ? reusedPromptsAgg[0].total : 0;

  const averagePostsPerGeneration = totalGenerations > 0 ? Math.round(totalPosts / totalGenerations) : 0;

  const platformsAgg = await Post.aggregate([
    { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
    { $group: { _id: '$platform', posts: { $sum: 1 } } },
    { $sort: { posts: -1 } }
  ]);
  const platforms = platformsAgg.map(p => ({ platform: p._id, posts: p.posts }));

  const statusAgg = await Post.aggregate([
    { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const statusBreakdown = statusAgg.map(s => ({
    status: s._id,
    count: s.count,
    percentage: totalPosts > 0 ? Math.round((s.count / totalPosts) * 100) : 0
  }));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29); // 30 days including today
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

  const generatedAgg = await PromptHistory.aggregate([
    { $match: { businessId: new mongoose.Types.ObjectId(businessId), createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, generated: { $sum: 1 } } }
  ]);
  
  const savedAgg = await Post.aggregate([
    { $match: { businessId: new mongoose.Types.ObjectId(businessId), createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, saved: { $sum: 1 } } }
  ]);
  
  const scheduledAgg = await Post.aggregate([
    { $match: { businessId: new mongoose.Types.ObjectId(businessId), scheduledAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledAt" } }, scheduled: { $sum: 1 } } }
  ]);

  const activityMap = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    activityMap[dateStr] = { date: dateStr, generated: 0, saved: 0, scheduled: 0 };
  }

  generatedAgg.forEach(g => { if (activityMap[g._id]) activityMap[g._id].generated = g.generated; });
  savedAgg.forEach(s => { if (activityMap[s._id]) activityMap[s._id].saved = s.saved; });
  scheduledAgg.forEach(s => { if (activityMap[s._id]) activityMap[s._id].scheduled = s.scheduled; });

  const activityLast30Days = Object.values(activityMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    overview: { totalPosts, draftPosts, scheduledPosts, publishedPosts },
    generation: { totalGenerations, favoritePrompts, reusedPrompts, averagePostsPerGeneration },
    platforms,
    statusBreakdown,
    activityLast30Days
  };
};

module.exports = {
  createBusiness,
  getMyBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness,
  getDashboardSummary,
  getSettings,
  updateSettings,
  getMembers,
  getAnalytics,
};