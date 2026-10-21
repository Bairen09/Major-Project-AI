const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const notificationService = require('../services/notification.service');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');

const startJobs = () => {
  // Run daily at midnight UTC
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Cron] Running daily subscription jobs...');
      const now = new Date();

      // 1. Expiry reminder: exactly 3 days from now (date-only comparison)
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + 3);
      
      const activeSubscriptions = await Subscription.find({ status: 'ACTIVE' });

      for (const sub of activeSubscriptions) {
        if (!sub.expiresAt) continue;

        const expiresAt = new Date(sub.expiresAt);
        
        const isExactly3DaysOut = 
          expiresAt.getFullYear() === targetDate.getFullYear() &&
          expiresAt.getMonth() === targetDate.getMonth() &&
          expiresAt.getDate() === targetDate.getDate();

        if (isExactly3DaysOut) {
          // Check if reminder was already sent this cycle
          const cycleStart = new Date(sub.startDate || 0);
          if (!sub.reminderSentAt || new Date(sub.reminderSentAt) < cycleStart) {
            await notificationService.createNotification({
              userId: sub.ownerId,
              title: 'Subscription Expiring Soon',
              message: `Your ${sub.planKey} subscription will expire in 3 days. Please renew to avoid interruption.`,
              type: NOTIFICATION_TYPES.WARNING,
            });

            sub.reminderSentAt = new Date();
            await sub.save();
            console.log(`[Cron] Sent expiry reminder to owner ${sub.ownerId}`);
          }
        }
        
        // 2. Auto-expire: expiresAt has already passed
        if (expiresAt < now) {
          sub.status = 'EXPIRED';
          await sub.save();
          console.log(`[Cron] Auto-expired subscription for owner ${sub.ownerId}`);
        }
      }
      
      console.log('[Cron] Daily subscription jobs completed.');
    } catch (error) {
      console.error('[Cron] Error running subscription jobs:', error);
    }
  });
};

module.exports = {
  startJobs,
};
