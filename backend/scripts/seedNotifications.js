const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const User = require('../src/models/User');
const Business = require('../src/models/Business');
const Notification = require('../src/models/Notification');
const NOTIFICATION_TYPES = require('../src/constants/notificationTypes');

const seedNotifications = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'localboost' });
    console.log('Connected.');

    // Fetch existing users
    let users = await User.find({});
    
    // If not enough users, create some
    if (users.length < 3) {
      console.log('Not enough users found. Creating dummy users...');
      const dummyUsers = [
        { name: 'Alice Staff', email: 'alice.staff@example.com', password: 'password123', platformRole: 'USER' },
        { name: 'Bob Owner', email: 'bob.owner@example.com', password: 'password123', platformRole: 'USER' },
      ];
      for (const du of dummyUsers) {
        if (!users.find(u => u.email === du.email)) {
          const newUser = new User(du);
          await newUser.save();
          users.push(newUser);
        }
      }
    }

    // Fetch existing businesses
    let businesses = await Business.find({});
    if (businesses.length === 0) {
      console.log('No businesses found. Creating dummy business...');
      const newBusiness = new Business({
        name: 'Acme Corp',
        category: 'Tech',
        members: [{ userId: users[0]._id, role: 'owner' }]
      });
      await newBusiness.save();
      businesses.push(newBusiness);
    }

    console.log('Clearing existing notifications...');
    await Notification.deleteMany({});

    console.log('Seeding notifications...');
    
    const sampleNotifications = [
      { type: NOTIFICATION_TYPES.SUCCESS, title: 'Post Published', message: 'Your post "10 Tips for Local SEO" was successfully published to Facebook.' },
      { type: NOTIFICATION_TYPES.WARNING, title: 'API Connection Issue', message: 'Instagram API is experiencing delays. Some posts might be published late.' },
      { type: NOTIFICATION_TYPES.ERROR, title: 'Payment Failed', message: 'Your recent subscription payment failed. Please update your billing info.' },
      { type: NOTIFICATION_TYPES.INFO, title: 'New Feature Alert', message: 'We just launched the AI Blog Generator! Try it out now in your dashboard.' },
      { type: NOTIFICATION_TYPES.SUCCESS, title: 'Weekly Report Ready', message: 'Your weekly analytics report is ready. You gained 150 new followers this week!' },
      { type: NOTIFICATION_TYPES.WARNING, title: 'Draft Expiring', message: 'You have 3 drafts that haven\'t been modified in 30 days.' },
      { type: NOTIFICATION_TYPES.INFO, title: 'Welcome to LocalBoost', message: 'Thank you for joining. Check out our getting started guide.' },
      { type: NOTIFICATION_TYPES.SUCCESS, title: 'Campaign Completed', message: 'Your "Summer Sale" campaign finished successfully reaching 10k people.' },
    ];

    let count = 0;

    for (const user of users) {
      // Give each user 10-15 notifications
      const numNotifs = Math.floor(Math.random() * 5) + 10;
      for (let i = 0; i < numNotifs; i++) {
        const sample = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        // Approx 60% unread
        const isRead = Math.random() > 0.6;
        
        // Random date within the last 30 days
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30));
        pastDate.setHours(Math.floor(Math.random() * 24));

        await Notification.create({
          userId: user._id,
          businessId: businesses[0]._id,
          type: sample.type,
          title: sample.title,
          message: sample.message,
          isRead,
          createdAt: pastDate,
          updatedAt: pastDate
        });
        count++;
      }
    }

    console.log(`Successfully seeded ${count} notifications across ${users.length} users!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
