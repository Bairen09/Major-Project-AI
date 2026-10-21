const crypto = require('crypto');

async function verifyE2E() {
  const BASE_URL = 'http://localhost:5000/api/v1';

  // 1. Create a Super Admin for admin routes
  // (We'll just hit the register endpoint, then directly modify the DB to make them SUPER_ADMIN,
  // then login again to get the admin JWT, or we can use the seed admin if available).
  // Actually, we can just connect to DB to create the users, get their tokens natively,
  // then use those tokens over HTTP for the tests.
  
  const mongoose = require('mongoose');
  const connectDB = require('../src/config/db');
  const User = require('../src/models/User');
  const Subscription = require('../src/models/Subscription');
  const { generateToken } = require('../src/utils/jwt');
  require('dotenv').config();

  await connectDB();

  // Setup Test User
  await User.deleteOne({ email: 'e2e_user@example.com' });
  const authService = require('../src/services/auth.service');
  const authRes = await authService.register({ name: 'E2E User', email: 'e2e_user@example.com', password: 'Password123' });
  const testUserId = authRes.user.id || authRes.user._id;
  const userToken = authRes.token;

  // Setup Test Admin
  await User.deleteOne({ email: 'e2e_admin@example.com' });
  const adminUser = await User.create({ name: 'E2E Admin', email: 'e2e_admin@example.com', password: 'Password123', platformRole: 'SUPER_ADMIN' });
  const adminToken = generateToken({ id: adminUser._id, role: adminUser.role });

  console.log('\n--- Test 2: Business Creation Rejection (HTTP) ---');
  // 2a. Create Biz 1 (Should Succeed)
  const resBiz1 = await fetch(`${BASE_URL}/businesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({ name: 'Biz 1', category: 'retail' })
  });
  const dataBiz1 = await resBiz1.json();
  console.log('Biz 1 Response:', resBiz1.status, dataBiz1.message || dataBiz1);

  // 2b. Create Biz 2 (Should Fail with 403 on FREE plan)
  const resBiz2 = await fetch(`${BASE_URL}/businesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({ name: 'Biz 2', category: 'retail' })
  });
  const dataBiz2 = await resBiz2.json();
  console.log('Biz 2 Response:', resBiz2.status, dataBiz2.message || dataBiz2);


  console.log('\n--- Test 3: Post Generation Rejection (HTTP) ---');
  // Set postsUsedToday to 5 (FREE limit) in DB, then hit HTTP POST /posts/generate
  await Subscription.updateOne({ ownerId: testUserId }, { $set: { postsUsedToday: 5 } });
  
  const resPost = await fetch(`${BASE_URL}/businesses/${dataBiz1.data?._id || dataBiz1._id}/posts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({ goal: 'awareness', platform: 'instagram' })
  });
  const dataPost = await resPost.json();
  console.log('Post Generation Response:', resPost.status, JSON.stringify(dataPost));


  console.log('\n--- Test 8: Admin Manual Plan Override (HTTP) ---');
  // Admin patches the subscription
  const sub = await Subscription.findOne({ ownerId: testUserId });
  const resPatch = await fetch(`${BASE_URL}/admin/subscriptions/${sub._id}/plan`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ planKey: 'PRO' })
  });
  const dataPatch = await resPatch.json();
  console.log('Admin Patch Response:', resPatch.status, dataPatch.message || dataPatch);
  
  // Now try Business Creation again (Should Succeed since PRO allows up to 10 businesses)
  const resBiz3 = await fetch(`${BASE_URL}/businesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({ name: 'Biz Upgraded', category: 'retail' })
  });
  const dataBiz3 = await resBiz3.json();
  console.log('Biz Post-Upgrade Response:', resBiz3.status, dataBiz3.message || dataBiz3);


  console.log('\n--- Test 6: Auto-expire Job and Lockout (HTTP) ---');
  // Admin patches expiresAt to yesterday
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);
  const resExpirePatch = await fetch(`${BASE_URL}/admin/subscriptions/${sub._id}/plan`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ expiresAt: pastDate.toISOString() })
  });
  console.log('Admin Patch Expiry Response:', resExpirePatch.status);

  // We must trigger the cron manually in the DB for the test, as the cron job only runs at midnight
  const activeSubs = await Subscription.find({ status: 'ACTIVE' });
  let expiredCount = 0;
  const now = new Date();
  for (const s of activeSubs) {
    if (new Date(s.expiresAt) < now) {
      s.status = 'EXPIRED';
      await s.save();
      expiredCount++;
    }
  }
  console.log(`(Triggered cron manually - expired ${expiredCount} subs)`);

  // Try creating a business again (Should fail with "subscription expired")
  const resBiz4 = await fetch(`${BASE_URL}/businesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({ name: 'Biz Expired', category: 'retail' })
  });
  const dataBiz4 = await resBiz4.json();
  console.log('Biz Expired Sub Response:', resBiz4.status, dataBiz4.message || dataBiz4);

  // Cleanup
  await User.deleteOne({ email: 'e2e_user@example.com' });
  await User.deleteOne({ email: 'e2e_admin@example.com' });
  await Subscription.deleteOne({ ownerId: testUserId });
  const Business = require('../src/models/Business');
  await Business.deleteMany({ ownerId: testUserId });
  
  mongoose.connection.close();
}

verifyE2E().catch(err => {
  console.error(err);
  process.exit(1);
});
