require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Business = require('../models/Business');
const Subscription = require('../models/Subscription');
const Post = require('../models/Post');
const Campaign = require('../models/Campaign');
const Blog = require('../models/Blog');
const PromptHistory = require('../models/PromptHistory');
const Ticket = require('../models/Ticket');
const TicketMessage = require('../models/TicketMessage');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Staff = require('../models/Staff');
const connectDB = require('../config/db');

// Constants & Enums
const BUSINESS_CATEGORIES = require('../constants/businessCategories');
const PLATFORMS = require('../constants/platforms');
const POST_STATUS = require('../constants/postStatus');
const { TICKET_STATUS, TICKET_HEADERS } = require('../constants/ticket');
const CAMPAIGN_GOALS = require('../constants/campaignGoals');
const ROLES = require('../constants/roles');

const generateSlug = (name) => {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
};

const PASSWORD = 'Password123';
let defaultPasswordHash;

async function runSeed() {
  await connectDB();
  defaultPasswordHash = await bcrypt.hash(PASSWORD, 10);
  
  console.log('--- Starting Extended Seed ---');

  // --- 1. OWNERS & SUBSCRIPTIONS ---
  const ownersConfig = [
    { email: 'multi_agency@localboost.ai', name: 'Agency Owner', plan: 'AGENCY', bizCount: 3, edgeCase: null },
    { email: 'multi_pro@localboost.ai', name: 'Pro Owner', plan: 'PRO', bizCount: 3, edgeCase: null },
    { email: 'multi_starter@localboost.ai', name: 'Starter Owner', plan: 'STARTER', bizCount: 3, edgeCase: null },
    { email: 'edge_expiring@localboost.ai', name: 'Expiring Owner 1', plan: 'FREE', bizCount: 1, edgeCase: '3_DAYS_OUT' },
    { email: 'edge_expiring2@localboost.ai', name: 'Expiring Owner 2', plan: 'FREE', bizCount: 1, edgeCase: '3_DAYS_OUT' },
    { email: 'edge_past@localboost.ai', name: 'Past Active Owner', plan: 'STARTER', bizCount: 1, edgeCase: 'PAST_ACTIVE' },
    { email: 'edge_expired@localboost.ai', name: 'Expired Owner', plan: 'FREE', bizCount: 1, edgeCase: 'EXPIRED' },
    { email: 'edge_quota@localboost.ai', name: 'Quota Hit Owner', plan: 'FREE', bizCount: 1, edgeCase: 'QUOTA_HIT' },
    { email: 'solo1@localboost.ai', name: 'Solo Owner 1', plan: 'FREE', bizCount: 1, edgeCase: null },
    { email: 'solo2@localboost.ai', name: 'Solo Owner 2', plan: 'FREE', bizCount: 1, edgeCase: null },
    { email: 'solo3@localboost.ai', name: 'Solo Owner 3', plan: 'FREE', bizCount: 1, edgeCase: null }
  ];

  let businesses = [];
  let owners = [];

  for (const config of ownersConfig) {
    let user = await User.findOne({ email: config.email });
    if (!user) {
      user = await User.create({
        name: config.name,
        email: config.email,
        password: PASSWORD,
        role: ROLES.OWNER
      });
      await AuditLog.create({ action: 'USER_REGISTERED', userId: user._id, entity: 'User', entityId: user._id, ipAddress: '', userAgent: 'extendedSeed', requestId: '', status: 'success' });
    }
    owners.push(user);

    // Setup Subscription
    let sub = await Subscription.findOne({ ownerId: user._id });
    if (!sub) {
      sub = new Subscription({ ownerId: user._id, planKey: config.plan, status: 'ACTIVE' });
    } else {
      sub.planKey = config.plan; // update to ensure correct tier
    }
    
    const now = new Date();
    if (config.edgeCase === '3_DAYS_OUT') {
      const threeDaysOut = new Date();
      threeDaysOut.setDate(now.getDate() + 3);
      sub.expiresAt = threeDaysOut;
      sub.status = 'ACTIVE';
      sub.reminderSentAt = null;
    } else if (config.edgeCase === 'PAST_ACTIVE') {
      const past = new Date();
      past.setDate(now.getDate() - 1);
      sub.expiresAt = past;
      sub.status = 'ACTIVE';
    } else if (config.edgeCase === 'EXPIRED') {
      const past = new Date();
      past.setDate(now.getDate() - 5);
      sub.expiresAt = past;
      sub.status = 'EXPIRED';
    } else if (config.edgeCase === 'QUOTA_HIT') {
      sub.postsUsedToday = 5;
    }
    await sub.save();

    // --- 2. BUSINESSES ---
    let userBizCount = await Business.countDocuments({ ownerId: user._id });
    const toCreate = config.bizCount - userBizCount;
    
    for (let i = 0; i < toCreate; i++) {
      const bizName = faker.company.name() + ' ' + (i+1);
      const bizSlug = generateSlug(bizName);
      const cat = faker.helpers.arrayElement(BUSINESS_CATEGORIES);
      
      let biz = await Business.findOne({ slug: bizSlug });
      if (!biz) {
        biz = await Business.create({
          ownerId: user._id,
          name: bizName,
          slug: bizSlug,
          category: cat,
          industry: cat,
          logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(bizName)}&background=random`,
          coverImage: { url: `https://picsum.photos/seed/${bizSlug}/800/400` },
          members: [{ userId: user._id, role: ROLES.OWNER }]
        });
        await AuditLog.create({ action: 'BUSINESS_CREATED', userId: user._id, entity: 'Business', entityId: biz._id, ipAddress: '', userAgent: 'extendedSeed', requestId: '', status: 'success' });
      }
      businesses.push(biz);
    }
    if (userBizCount > 0) {
      const existing = await Business.find({ ownerId: user._id });
      existing.forEach(e => {
        if (!businesses.some(b => b._id.toString() === e._id.toString())) {
          businesses.push(e);
        }
      });
    }
  }

  // --- 3. TEAM MEMBERS ---
  console.log('Creating team members...');
  for (let i = 1; i <= 10; i++) {
    const email = `team_member${i}@localboost.ai`;
    let u = await User.findOne({ email });
    if (!u) {
      u = await User.create({ name: faker.person.fullName(), email, password: PASSWORD, role: ROLES.MEMBER });
    }
    const randomBiz = faker.helpers.arrayElement(businesses);
    if (!randomBiz.members.some(m => m.userId.toString() === u._id.toString())) {
      const role = faker.helpers.arrayElement([ROLES.EDITOR, ROLES.VIEWER]);
      randomBiz.members.push({ userId: u._id, role });
      await randomBiz.save();
      await Notification.create({ userId: u._id, businessId: randomBiz._id, title: 'Added to Business', message: `You were added to ${randomBiz.name} as ${role}`, type: 'system', isRead: faker.datatype.boolean() });
    }
  }

  // --- 4. STAFF & TICKETS ---
  console.log('Creating staff & tickets...');
  const staffUsers = [];
  for (let i = 1; i <= 3; i++) {
    const email = `support_staff${i}@localboost.ai`;
    let s = await Staff.findOne({ email });
    if (!s) {
      s = await Staff.create({ name: `Support Agent ${i}`, email, password: PASSWORD, role: 'support', createdBy: owners[0]._id });
    }
    staffUsers.push(s);
  }

  const existingTicketsCount = await Ticket.countDocuments({ subject: /^Seeded Ticket/ });
  if (existingTicketsCount === 0) {
    for (let i = 0; i < 20; i++) {
      const owner = faker.helpers.arrayElement(owners);
      const status = faker.helpers.arrayElement(Object.values(TICKET_STATUS));
      const staff = (status !== TICKET_STATUS.OPEN) ? faker.helpers.arrayElement(staffUsers) : null;
      
      const ticket = await Ticket.create({
        userId: owner._id,
        subject: `Seeded Ticket ${i}: ${faker.hacker.phrase()}`,
        description: faker.lorem.paragraph(),
        header: faker.helpers.arrayElement(TICKET_HEADERS),
        status,
        priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
        assignedTo: staff ? staff._id : null
      });

      await AuditLog.create({ action: 'TICKET_CREATED', userId: owner._id, entity: 'Ticket', entityId: ticket._id, ipAddress: '', userAgent: 'extendedSeed', requestId: '', status: 'success' });
      
      const msgCount = faker.number.int({ min: 2, max: 6 });
      let currentSender = owner._id;
      let currentSenderModel = 'user';

      for (let m = 0; m < msgCount; m++) {
        await TicketMessage.create({
          ticketId: ticket._id,
          senderId: currentSender,
          senderType: currentSenderModel,
          message: faker.lorem.paragraph()
        });
        
        if (staff) {
          if (currentSenderModel === 'user') {
            currentSender = staff._id;
            currentSenderModel = 'staff';
            await Notification.create({ userId: staff._id, title: 'New Ticket Reply', message: `User replied to ${ticket.subject}`, type: 'ticket_reply', isRead: faker.datatype.boolean() });
          } else {
            currentSender = owner._id;
            currentSenderModel = 'user';
            await Notification.create({ userId: owner._id, title: 'Ticket Updated', message: `Support replied to your ticket`, type: 'ticket_reply', isRead: faker.datatype.boolean() });
          }
        }
      }
    }
  }

  // --- 5. CONTENT (Posts, Campaigns, Blogs, Prompts) ---
  console.log('Generating content...');
  for (const biz of businesses) {
    const postCount = await Post.countDocuments({ businessId: biz._id });
    if (postCount < 8) {
      const campaigns = [];
      const numCampaigns = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < numCampaigns; i++) {
        const c = await Campaign.create({
          businessId: biz._id,
          ownerId: biz.ownerId,
          title: faker.commerce.department() + ' Campaign',
          goal: faker.helpers.arrayElement(Object.values(CAMPAIGN_GOALS)),
          status: faker.helpers.arrayElement(['draft', 'active', 'paused', 'completed']),
          startDate: faker.date.recent(),
          endDate: faker.date.soon()
        });
        campaigns.push(c);
      }

      for (let i = 0; i < 15; i++) {
        const camp = faker.datatype.boolean() ? faker.helpers.arrayElement(campaigns) : null;
        const plat = faker.helpers.arrayElement(Object.values(PLATFORMS));
        const stat = faker.helpers.arrayElement(Object.values(POST_STATUS));
        
        let scheduledAt = null;
        if (stat === POST_STATUS.SCHEDULED) {
          scheduledAt = faker.date.soon({ days: 10 });
        }

        const p = await Post.create({
          businessId: biz._id,
          campaignId: camp ? camp._id : null,
          content: faker.lorem.sentences(2) + '\n\n' + faker.helpers.arrayElements(['#marketing', '#sale', '#new', '#local'], 2).join(' '),
          platform: plat,
          status: stat,
          scheduledAt,
          aiGenerated: faker.datatype.boolean(),
          ownerId: biz.ownerId
        });
        
        if (p.aiGenerated) {
          await PromptHistory.create({
            businessId: biz._id,
            userId: biz.ownerId,
            prompt: `Generate a post for ${plat} about our new products`,
            topic: 'New Products',
            audience: 'General Audience',
            tone: 'professional',
            goal: 'awareness',
            platform: plat,
            result: p.content,
            isFavorite: faker.datatype.boolean()
          });
        }
      }

      for (let i = 0; i < 3; i++) {
        await Blog.create({
          businessId: biz._id,
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(4),
          status: faker.helpers.arrayElement(['DRAFT', 'PUBLISHED']),
          ownerId: biz.ownerId
        });
      }
    }
  }

  // --- REPORTING ---
  const totalBusinesses = await Business.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalStaff = await Staff.countDocuments();

  console.log('\n--- SEED COMPLETED ---');
  console.log(`Total Businesses in DB: ${totalBusinesses}`);
  console.log(`Total Users in DB: ${totalUsers}`);
  console.log(`Total Staff in DB: ${totalStaff}`);
  
  console.log('\n--- Edge Case Subscriptions Setup ---');
  for (const c of ownersConfig.filter(o => o.edgeCase)) {
    const u = await User.findOne({ email: c.email });
    const sub = await Subscription.findOne({ ownerId: u._id });
    console.log(`${c.email} -> Plan: ${sub.planKey}, Status: ${sub.status}, ExpiresAt: ${sub.expiresAt}, PostsUsed: ${sub.postsUsedToday}, EdgeCase: ${c.edgeCase}`);
  }

  const sampleBiz = await Business.findOne({ slug: { $ne: 'urban-brew-cafe' } }).sort({ _id: -1 });
  if (sampleBiz) {
    console.log('\n--- Image URL Verification ---');
    console.log(`Sample Biz Name: ${sampleBiz.name}`);
    console.log(`Logo URL (logoUrl field): ${sampleBiz.logoUrl}`);
    console.log(`Cover URL (coverImage.url field): ${sampleBiz.coverImage?.url}`);
  }

  await mongoose.disconnect();
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
