// src/services/subscription.service.js

const Subscription = require('../models/Subscription');
const PLANS = require('../constants/plans');
const AppError = require('../errors/AppError');

const consumePostQuota = async (userId) => {
  // 1. Load the subscription to get the plan and check reset date
  let subscription = await Subscription.findOne({ ownerId: userId });
  if (!subscription) {
    throw new AppError('Subscription not found. Please contact support.', 404);
  }

  if (subscription.status !== 'ACTIVE') {
    throw new AppError('subscription expired, please renew', 403);
  }

  // 2. Check if we need to reset the daily quota
  const now = new Date();
  const resetAt = new Date(subscription.postsCountResetAt);
  
  // Compare calendar dates (YYYY-MM-DD)
  const isSameDay =
    now.getFullYear() === resetAt.getFullYear() &&
    now.getMonth() === resetAt.getMonth() &&
    now.getDate() === resetAt.getDate();

  if (!isSameDay) {
    // Reset quota
    subscription = await Subscription.findOneAndUpdate(
      { _id: subscription._id },
      { $set: { postsUsedToday: 0, postsCountResetAt: now } },
      { new: true }
    );
  }

  const planLimits = PLANS[subscription.planKey];
  if (!planLimits) {
    throw new AppError('Invalid subscription plan.', 500);
  }

  // 3. Atomically increment the quota if within limits
  if (planLimits.maxPostsPerDay === -1) {
    // Unlimited plan, just increment for tracking
    await Subscription.updateOne(
      { _id: subscription._id },
      { $inc: { postsUsedToday: 1 } }
    );
  } else {
    // Atomic check-and-increment
    const updatedSub = await Subscription.findOneAndUpdate(
      {
        _id: subscription._id,
        postsUsedToday: { $lt: planLimits.maxPostsPerDay },
      },
      {
        $inc: { postsUsedToday: 1 },
      },
      { new: true }
    );

    if (!updatedSub) {
      // It couldn't find the document where postsUsedToday < limit, so quota exceeded
      throw new AppError('Daily post generation limit reached for your current plan.', 403);
    }
  }
};

module.exports = {
  consumePostQuota,
};
