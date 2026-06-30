require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Business = require('../models/Business');
const Post = require('../models/Post');
const PromptHistory = require('../models/PromptHistory');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Invitation = require('../models/Invitation');

const DEMO_EMAIL = 'demo@localboost.ai';
const DEMO_PASSWORD = 'Demo@123';
const DEMO_BUSINESS_NAME = 'Urban Brew Cafe';

// Mocks
const MOCK_CAFE_CAPTIONS = [
  "Freshly brewed mornings start here ☕ #Coffee #CafeLife",
  "Weekend brunch just got better! Join us this Sunday. #Brunch #PuneFood",
  "Buy 2 coffees, get a croissant free. Tag your coffee buddy! 🥐 #CoffeeLovers #LocalCafe",
  "Meet our new seasonal cold brew. Perfect for the summer heat! 🧊 #ColdBrew #CafeLife",
  "Nothing beats a hot cappuccino on a rainy day. Drop by! 🌧️☕ #MonsoonVibes #PuneFood",
  "Our freshly baked bagels are selling out fast! Grab yours now. 🥯 #Bakery #Brunch",
  "Start your week right with our signature espresso. ⚡ #MondayMotivation #Coffee",
  "Did someone say chocolate chip cookies? 🍪 Baked fresh every hour! #CafeLife #Cookies",
  "The perfect corner for your remote work sessions. Free Wi-Fi and great coffee! 💻☕ #RemoteWork #LocalCafe",
  "Craving something sweet? Our red velvet cake is calling your name! 🍰 #Dessert #PuneFood"
];

const MOCK_PICSUM_IMAGES = [
  'https://picsum.photos/seed/cafe1/800/600',
  'https://picsum.photos/seed/cafe2/800/600',
  'https://picsum.photos/seed/cafe3/800/600',
  'https://picsum.photos/seed/cafe4/800/600',
  'https://picsum.photos/seed/cafe5/800/600',
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = (arr, count) => faker.helpers.arrayElements(arr, count);

async function cleanDemoData() {
  console.log('🧹 Cleaning up old demo data...');
  const existingOwner = await User.findOne({ email: DEMO_EMAIL });
  
  if (existingOwner) {
    const businesses = await Business.find({ ownerId: existingOwner._id });
    const businessIds = businesses.map(b => b._id);
    
    await Post.deleteMany({ businessId: { $in: businessIds } });
    await PromptHistory.deleteMany({ businessId: { $in: businessIds } });
    await Notification.deleteMany({ userId: existingOwner._id });
    await AuditLog.deleteMany({ businessId: { $in: businessIds } });
    await Invitation.deleteMany({ businessId: { $in: businessIds } });
    await Business.deleteMany({ ownerId: existingOwner._id });
    
    // Delete demo team members
    await User.deleteMany({ email: { $in: ['admin@localboost.ai', 'editor@localboost.ai', 'viewer@localboost.ai'] } });
    await User.deleteOne({ email: DEMO_EMAIL });
  }
}

async function seed() {
  try {
    const isClearOnly = process.argv.includes('--clear');
    
    console.log('🌱 Starting Seed Script...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'localboost'
    });
    console.log('✅ Connected to MongoDB (localboost)');

    await cleanDemoData();
    if (isClearOnly) {
      console.log('🧹 Demo data cleared successfully.');
      process.exit(0);
    }

    // 1. Demo Owner User
    console.log('👤 Creating Demo Users...');

    const owner = await User.create({
      name: 'John Carter',
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      avatarUrl: faker.image.avatar(),
    });

    // Team Members
    const adminUser = await User.create({
      name: 'Sarah Admin',
      email: 'admin@localboost.ai',
      password: DEMO_PASSWORD,
      avatarUrl: faker.image.avatar(),
    });

    const editorUser = await User.create({
      name: 'Mike Editor',
      email: 'editor@localboost.ai',
      password: DEMO_PASSWORD,
      avatarUrl: faker.image.avatar(),
    });

    const viewerUser = await User.create({
      name: 'Lisa Viewer',
      email: 'viewer@localboost.ai',
      password: DEMO_PASSWORD,
      avatarUrl: faker.image.avatar(),
    });

    // 2. Demo Business
    console.log('🏢 Creating Demo Business...');
    const business = await Business.create({
      ownerId: owner._id,
      name: DEMO_BUSINESS_NAME,
      category: 'cafe',
      industry: 'Cafe',
      description: 'Premium coffee, bakery and brunch.',
      logoUrl: 'https://picsum.photos/seed/logo/200/200',
      coverImage: {
        url: 'https://picsum.photos/seed/cover/1200/400',
        publicId: 'demo-cover'
      },
      location: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India'
      },
      settings: {
        tone: 'friendly',
        language: 'en',
        timezone: 'Asia/Kolkata',
        brandColors: ['#D4AF37', '#1A1A1A'],
        socialLinks: {
          instagram: 'https://instagram.com/urbanbrew',
          facebook: 'https://facebook.com/urbanbrew',
          website: 'https://urbanbrew.demo'
        }
      },
      members: [
        { userId: owner._id, role: 'owner', joinedAt: faker.date.recent({ days: 90 }) },
        { userId: adminUser._id, role: 'admin', joinedAt: faker.date.recent({ days: 60 }) },
        { userId: editorUser._id, role: 'editor', joinedAt: faker.date.recent({ days: 30 }) },
        { userId: viewerUser._id, role: 'viewer', joinedAt: faker.date.recent({ days: 10 }) },
      ]
    });

    // 4. Prompt History (20 entries)
    console.log('📝 Creating Prompt History...');
    const promptDocs = [];
    const platforms = ['instagram', 'facebook', 'google', 'manual'];
    const goals = ['Engagement', 'Sales', 'Awareness'];
    const audiences = ['Students', 'Professionals', 'Coffee Lovers'];
    for (let i = 0; i < 20; i++) {
      promptDocs.push({
        businessId: business._id,
        userId: owner._id,
        topic: faker.lorem.sentence(),
        tone: 'Friendly',
        goal: getRandomItem(goals),
        audience: getRandomItem(audiences),
        platform: getRandomItem(platforms),
        favorite: i < 5, // Make first 5 favorites
        createdAt: faker.date.recent({ days: 90 })
      });
    }
    await PromptHistory.insertMany(promptDocs);

    // 5 & 6. Saved Posts & Scheduled Posts (40 entries)
    console.log('📸 Creating Posts...');
    const postDocs = [];
    const postPlatforms = ['instagram', 'facebook', 'google'];
    
    // 15 Published (past 60 days)
    for (let i = 0; i < 15; i++) {
      const pCount = [0, 1, 3][Math.floor(Math.random() * 3)];
      const media = getRandomItems(MOCK_PICSUM_IMAGES, pCount).map(url => ({
        url,
        type: 'image',
        publicId: `demo-img-${Math.random()}`
      }));
      if (Math.random() > 0.8) {
        media.push({ url: 'https://picsum.photos/seed/ai/800/800', type: 'image', aiGenerated: true, publicId: 'demo-ai' });
      }

      postDocs.push({
        businessId: business._id,
        ownerId: owner._id,
        content: MOCK_CAFE_CAPTIONS[i % MOCK_CAFE_CAPTIONS.length],
        platform: getRandomItem(postPlatforms),
        status: 'published',
        media,
        publishedAt: faker.date.recent({ days: 60 }),
        createdAt: faker.date.recent({ days: 90 })
      });
    }

    // 12 Scheduled (future 30 days)
    for (let i = 0; i < 12; i++) {
      postDocs.push({
        businessId: business._id,
        ownerId: owner._id,
        content: MOCK_CAFE_CAPTIONS[(i+3) % MOCK_CAFE_CAPTIONS.length],
        platform: getRandomItem(postPlatforms),
        status: 'scheduled',
        media: [{ url: MOCK_PICSUM_IMAGES[0], type: 'image', publicId: 'demo' }],
        scheduledAt: faker.date.soon({ days: 30 }),
        createdAt: faker.date.recent({ days: 10 })
      });
    }

    // 13 Drafts (past 60 days)
    for (let i = 0; i < 13; i++) {
      postDocs.push({
        businessId: business._id,
        ownerId: owner._id,
        content: MOCK_CAFE_CAPTIONS[(i+7) % MOCK_CAFE_CAPTIONS.length],
        platform: getRandomItem(postPlatforms),
        status: 'draft',
        media: [],
        createdAt: faker.date.recent({ days: 60 })
      });
    }
    await Post.insertMany(postDocs);

    // 8. Notifications (40 entries)
    console.log('🔔 Creating Notifications...');
    const notifDocs = [];
    const nTypes = ['success', 'info', 'warning', 'error'];
    for (let i = 0; i < 40; i++) {
      notifDocs.push({
        userId: owner._id,
        title: faker.lorem.words(3),
        message: faker.lorem.sentence(),
        type: getRandomItem(nTypes),
        read: i > 10, // First 10 are unread
        createdAt: faker.date.recent({ days: 30 })
      });
    }
    await Notification.insertMany(notifDocs);

    // 10. Audit Logs (50 entries)
    console.log('📜 Creating Audit Logs...');
    const auditDocs = [];
    const actions = ['USER_LOGIN', 'BUSINESS_CREATED', 'PROMPT_GENERATED', 'POST_SAVED', 'POST_SCHEDULED', 'SETTINGS_UPDATED', 'IMAGE_UPLOADED', 'MEMBER_INVITED', 'ROLE_CHANGED'];
    for (let i = 0; i < 50; i++) {
      auditDocs.push({
        businessId: business._id,
        userId: owner._id,
        action: getRandomItem(actions),
        entity: 'System',
        entityId: business._id,
        status: 'success',
        createdAt: faker.date.recent({ days: 90 })
      });
    }
    await AuditLog.insertMany(auditDocs);

    // 11. Invitations (2 pending)
    console.log('✉️ Creating Invitations...');
    await Invitation.insertMany([
      {
        businessId: business._id,
        email: 'pending.new@localboost.ai',
        role: 'editor',
        invitedBy: owner._id,
        status: 'pending',
        expiresAt: faker.date.soon({ days: 7 })
      },
      {
        businessId: business._id,
        email: 'admin@localboost.ai', // Matches a registered user
        role: 'admin',
        invitedBy: owner._id,
        status: 'pending',
        expiresAt: faker.date.soon({ days: 7 })
      }
    ]);

    console.log(`
=============================
LocalBoost AI Demo Ready
=============================

Demo User
Email: ${DEMO_EMAIL}
Password: ${DEMO_PASSWORD}

Business
${DEMO_BUSINESS_NAME}

Team Members
admin@localboost.ai
editor@localboost.ai
viewer@localboost.ai

Password for all:
${DEMO_PASSWORD}

Seed Summary
Users: 4
Businesses: 1
Posts: 40
Prompts: 20
Notifications: 40
Audit Logs: 50
Invitations: 2
=============================
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Script Failed:', error);
    process.exit(1);
  }
}

seed();
