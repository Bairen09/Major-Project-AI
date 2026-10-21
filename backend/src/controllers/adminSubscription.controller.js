// src/controllers/adminSubscription.controller.js

const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../errors/AppError');
const mongoose = require('mongoose');
const PLANS = require('../constants/plans');

exports.getSubscriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, planKey, status } = req.query;
    
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const query = {};
    if (planKey) query.planKey = planKey;
    if (status) query.status = status;

    const [subscriptions, total] = await Promise.all([
      Subscription.find(query)
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Subscription.countDocuments(query),
    ]);

    sendSuccess(res, 'Subscriptions retrieved', {
      subscriptions,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionStats = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [planStats, statusStats, expiringStats, expiredButActiveStats] = await Promise.all([
      // Total clients per plan
      Subscription.aggregate([
        { $group: { _id: '$planKey', count: { $sum: 1 } } }
      ]),
      // Count per status
      Subscription.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Count expiring within 7 days
      Subscription.countDocuments({
        status: 'ACTIVE',
        expiresAt: { $gte: now, $lte: sevenDaysFromNow }
      }),
      // Count expired but still marked ACTIVE (health check)
      Subscription.countDocuments({
        status: 'ACTIVE',
        expiresAt: { $lt: now }
      })
    ]);

    // Format output
    const perPlan = {};
    Object.keys(PLANS).forEach(key => perPlan[key] = 0);
    planStats.forEach(stat => perPlan[stat._id] = stat.count);

    const perStatus = { ACTIVE: 0, TRIAL: 0, EXPIRED: 0, CANCELLED: 0 };
    statusStats.forEach(stat => perStatus[stat._id] = stat.count);

    sendSuccess(res, 'Subscription stats retrieved', {
      perPlan,
      perStatus,
      expiringWithin7Days: expiringStats,
      expiredButStillActive: expiredButActiveStats,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planKey, expiresAt } = req.body;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    if (planKey && !PLANS[planKey]) {
      throw new AppError('Invalid planKey', 400);
    }

    if (planKey) subscription.planKey = planKey;
    if (expiresAt) subscription.expiresAt = new Date(expiresAt);

    await subscription.save();

    await AuditLog.create({
      action: 'ADMIN_SUBSCRIPTION_UPDATED',
      userId: req.user.id,
      entity: 'Subscription',
      entityId: subscription._id,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      requestId: req.requestId || '',
      status: 'success',
    });

    sendSuccess(res, 'Subscription updated successfully', { subscription });
  } catch (error) {
    next(error);
  }
};
