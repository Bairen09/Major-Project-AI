const User = require('../models/User');
const Business = require('../models/Business');
const Post = require('../models/Post');
const PromptHistory = require('../models/PromptHistory');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// Helper for pagination
const getPaginationOptions = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

exports.getDashboard = async () => {
  const [
    totalUsers,
    totalBusinesses,
    totalPosts,
    totalPrompts,
    totalScheduledPosts,
    totalNotifications,
    activeUsersToday
  ] = await Promise.all([
    User.countDocuments(),
    Business.countDocuments(),
    Post.countDocuments(),
    PromptHistory.countDocuments(),
    Post.countDocuments({ status: 'scheduled' }),
    Notification.countDocuments(),
    User.countDocuments({ lastActive: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
  ]);

  // To answer "Total AI Images", maybe from prompts or posts. We don't have an Image model directly. Let's count posts with imageUrl.
  const totalAIImages = await Post.countDocuments({ 'content.image.url': { $ne: null } });

  // For monthly stats, aggregate over the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [monthlyUsers, monthlyBusinesses, monthlyRequests] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Business.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    PromptHistory.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
  ]);

  const avgPostsPerBusiness = totalBusinesses > 0 ? Math.round(totalPosts / totalBusinesses) : 0;
  
  // Advanced stats
  // Average team size
  const businessesWithTeams = await Business.find().select('members');
  let totalTeamMembers = 0;
  businessesWithTeams.forEach(b => totalTeamMembers += (b.members ? b.members.length : 0));
  const avgTeamSize = totalBusinesses > 0 ? (totalTeamMembers / totalBusinesses).toFixed(1) : 0;

  // Storage used (mock calculation: 5MB per AI image, 1MB per post)
  const storageUsedMB = (totalAIImages * 5) + (totalPosts * 1);
  const storageUsed = storageUsedMB > 1024 ? `${(storageUsedMB / 1024).toFixed(2)} GB` : `${storageUsedMB} MB`;

  // Top Categories
  const topCategoriesAgg = await Business.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]);
  const topCategories = topCategoriesAgg.map(c => c._id).filter(Boolean);

  // Top Platforms
  const topPlatformsAgg = await Post.aggregate([
    { $group: { _id: "$platform", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]);
  const topPlatforms = topPlatformsAgg.map(p => p._id).filter(Boolean);
  
  // Recent activity
  const [latestUsers, latestBusinesses, latestPrompts] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
    Business.find().sort({ createdAt: -1 }).limit(5).select('name category createdAt'),
    PromptHistory.find().sort({ createdAt: -1 }).limit(5).select('action createdAt')
  ]);

  return {
    totals: {
      users: totalUsers,
      businesses: totalBusinesses,
      posts: totalPosts,
      prompts: totalPrompts,
      aiImages: totalAIImages,
      scheduledPosts: totalScheduledPosts,
      notifications: totalNotifications,
      activeUsersToday,
    },
    monthly: {
      users: monthlyUsers,
      businesses: monthlyBusinesses,
      aiRequests: monthlyRequests,
      avgPostsPerBusiness,
      avgTeamSize,
      storageUsed,
      topCategories,
      topPlatforms
    },
    recent: {
      users: latestUsers,
      businesses: latestBusinesses,
      prompts: latestPrompts
    }
  };
};

exports.getPlatformStatus = async () => {
  // Simple health metrics
  return {
    version: '1.0.0',
    nodeVersion: process.version,
    mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  };
};

exports.getUsers = async (query) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } }
    ];
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.role) {
    filter.platformRole = query.role;
  }

  const sort = query.sort ? { [query.sort]: -1 } : { createdAt: -1 };

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  return { users, total, page, limit, pages: Math.ceil(total / limit) };
};

exports.getUserDetails = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');

  const [businesses, postsCount, promptCount, notificationsCount] = await Promise.all([
    Business.find({ 'members.userId': id }).select('name category'),
    Post.countDocuments({ createdBy: id }),
    PromptHistory.countDocuments({ userId: id }),
    Notification.countDocuments({ userId: id })
  ]);

  return {
    user,
    businesses,
    stats: {
      posts: postsCount,
      prompts: promptCount,
      notifications: notificationsCount
    }
  };
};

exports.updateUserStatus = async (id, status) => {
  const user = await User.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!user) throw new Error('User not found');
  return user;
};

exports.getBusinesses = async (query) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }

  const sort = query.sort ? { [query.sort]: -1 } : { createdAt: -1 };

  const [businesses, total] = await Promise.all([
    Business.find(filter).sort(sort).skip(skip).limit(limit).populate('members.userId', 'name email'),
    Business.countDocuments(filter)
  ]);

  return { businesses, total, page, limit, pages: Math.ceil(total / limit) };
};

exports.getBusinessDetails = async (id) => {
  const business = await Business.findById(id).populate('members.userId', 'name email status platformRole');
  if (!business) throw new Error('Business not found');

  const [postsCount, promptCount] = await Promise.all([
    Post.countDocuments({ businessId: id }),
    PromptHistory.countDocuments({ businessId: id })
  ]);

  return {
    business,
    analytics: {
      totalPosts: postsCount,
      totalPrompts: promptCount
    }
  };
};

exports.updateBusinessStatus = async (id, isActive) => {
  const business = await Business.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!business) throw new Error('Business not found');
  return business;
};

exports.deleteBusiness = async (id, adminId) => {
  const business = await Business.findById(id);
  if (!business) throw new Error('Business not found');
  
  if (typeof business.softDelete === 'function') {
      await business.softDelete(adminId);
  } else {
      business.isDeleted = true;
      business.updatedBy = adminId;
      await business.save();
  }
  return { message: 'Business soft deleted' };
};

exports.getAnalytics = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Example: group signups by day
  const dailySignups = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);

  const dailyBusinesses = await Business.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);

  return {
    dailySignups,
    dailyBusinesses
  };
};

exports.getAuditLogs = async (query) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.search) {
    filter.action = { $regex: query.search, $options: 'i' };
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name email'),
    AuditLog.countDocuments(filter)
  ]);

  return { logs, total, page, limit, pages: Math.ceil(total / limit) };
};
