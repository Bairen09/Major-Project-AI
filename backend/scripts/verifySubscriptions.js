require('dotenv').config();
const mongoose = require('mongoose');
const authService = require('../src/services/auth.service');
const businessService = require('../src/services/business.service');
const subscriptionService = require('../src/services/subscription.service');
const User = require('../src/models/User');
const Subscription = require('../src/models/Subscription');
const Business = require('../src/models/Business');
const connectDB = require('../src/config/db');

async function runTests() {
  await connectDB();
  
  console.log('\n--- 1. Registration DB Check ---');
  await User.deleteOne({ email: 'test_sub_user@example.com' });
  const authRes = await authService.register({ name: 'Sub User', email: 'test_sub_user@example.com', password: 'Password123' });
  const testUserId = authRes.user._id || authRes.user.id;
  console.log('Test User ID:', testUserId);
  const sub = await Subscription.findOne({ ownerId: testUserId });
  console.log('Created sub on register:', sub ? `Found (plan: ${sub.planKey}, status: ${sub.status})` : 'Not found!');

  console.log('\n--- 2. Business Creation Rejection ---');
  try {
    await businessService.createBusiness({ userId: testUserId, data: { name: 'Biz 1', category: 'retail' }});
    console.log('Biz 1 created successfully.');
    await businessService.createBusiness({ userId: testUserId, data: { name: 'Biz 2', category: 'retail' }});
    console.log('Biz 2 created unexpectedly.');
  } catch (err) {
    console.log('Expected error on Biz 2:', err.message);
  }

  console.log('\n--- 3. Post Generation Rejection ---');
  await Subscription.updateOne({ ownerId: testUserId }, { $set: { postsUsedToday: 5 } });
  try {
    await subscriptionService.consumePostQuota(testUserId);
    console.log('Quota consumed unexpectedly!');
  } catch (err) {
    console.log('Expected error on post quota:', err.message);
  }

  console.log('\n--- 4. Atomic Race Condition Test ---');
  await Subscription.updateOne({ ownerId: testUserId }, { $set: { postsUsedToday: 4 } });
  let successes = 0;
  let failures = 0;
  const promises = Array(10).fill().map(() => 
    subscriptionService.consumePostQuota(testUserId)
      .then(() => successes++)
      .catch(() => failures++)
  );
  await Promise.all(promises);
  console.log(`Concurrent attempts: 10. Successes: ${successes}, Failures: ${failures}`);
  const finalSub = await Subscription.findOne({ ownerId: testUserId });
  console.log(`Final postsUsedToday after atomic test: ${finalSub.postsUsedToday}`);

  console.log('\n--- 5. Reminder Job Idempotent Firing ---');
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  await Subscription.updateOne({ ownerId: testUserId }, { $set: { expiresAt: threeDaysFromNow, reminderSentAt: null, status: 'ACTIVE' } });
  
  const checkReminders = async () => {
    let sent = 0;
    const activeSubs = await Subscription.find({ status: 'ACTIVE' });
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    for (const sub of activeSubs) {
      if(!sub.expiresAt) continue;
      const expiresAt = new Date(sub.expiresAt);
      const is3DaysOut = expiresAt.getFullYear() === targetDate.getFullYear() && expiresAt.getMonth() === targetDate.getMonth() && expiresAt.getDate() === targetDate.getDate();
      if (is3DaysOut && (!sub.reminderSentAt || new Date(sub.reminderSentAt) < new Date(sub.startDate || 0))) {
        sub.reminderSentAt = new Date();
        await sub.save();
        sent++;
      }
    }
    return sent;
  };
  const sentFirst = await checkReminders();
  const sentSecond = await checkReminders();
  console.log(`Reminders sent first run: ${sentFirst}`);
  console.log(`Reminders sent second run: ${sentSecond}`);

  console.log('\n--- 6. Auto-expire Job and Lockout ---');
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);
  await Subscription.updateOne({ ownerId: testUserId }, { $set: { expiresAt: pastDate } });
  
  const checkExpiry = async () => {
    let expiredCount = 0;
    const activeSubs = await Subscription.find({ status: 'ACTIVE' });
    const now = new Date();
    for (const sub of activeSubs) {
      if (new Date(sub.expiresAt) < now) {
        sub.status = 'EXPIRED';
        await sub.save();
        expiredCount++;
      }
    }
    return expiredCount;
  };
  const expiredRun = await checkExpiry();
  console.log(`Subscriptions auto-expired: ${expiredRun}`);
  try {
    await subscriptionService.consumePostQuota(testUserId);
  } catch (err) {
    console.log('Lockout test on expired:', err.message);
  }

  console.log('\n--- 7. Admin Stats Accuracy ---');
  const [planStats, statusStats] = await Promise.all([
    Subscription.aggregate([{ $group: { _id: '$planKey', count: { $sum: 1 } } }]),
    Subscription.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  console.log('Plan stats:', planStats);
  console.log('Status stats:', statusStats);

  console.log('\n--- 8. Admin Manual Plan Override ---');
  await Subscription.updateOne({ ownerId: testUserId }, { $set: { planKey: 'PRO', status: 'ACTIVE', postsUsedToday: 0 } });
  const upgradedSub = await Subscription.findOne({ ownerId: testUserId });
  console.log('Upgraded plan manually to:', upgradedSub.planKey);
  try {
    await businessService.createBusiness({ userId: testUserId, data: { name: 'Biz Upgraded', category: 'retail' }});
    console.log('Business creation post-upgrade: SUCCESS');
  } catch (err) {
    console.log('Business creation post-upgrade failed:', err.message);
  }
  
  await User.deleteOne({ email: 'test_sub_user@example.com' });
  await Subscription.deleteOne({ ownerId: testUserId });
  await Business.deleteMany({ ownerId: testUserId });

  mongoose.connection.close();
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
