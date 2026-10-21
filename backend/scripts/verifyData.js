require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Business = require('../src/models/Business');
const Subscription = require('../src/models/Subscription');
const connectDB = require('../src/config/db');

async function checkData() {
  await connectDB();

  console.log('--- Multi-Business Owners ---');
  const targetEmails = ['multi_agency@localboost.ai', 'multi_pro@localboost.ai', 'multi_starter@localboost.ai'];
  
  for (const email of targetEmails) {
    const u = await User.findOne({ email });
    if (u) {
      const sub = await Subscription.findOne({ ownerId: u._id });
      const bizCount = await Business.countDocuments({ ownerId: u._id });
      console.log(`Email: ${email} | Plan: ${sub?.planKey} | Businesses Owned: ${bizCount}`);
    } else {
      console.log(`Email: ${email} NOT FOUND`);
    }
  }

  console.log('\n--- Business Categories/Industries ---');
  const allBusinesses = await Business.find({}, 'name category industry ownerId').lean();
  allBusinesses.forEach((b, i) => {
    console.log(`${i+1}. ${b.name} - Category: ${b.category} - Industry: ${b.industry}`);
  });

  await mongoose.disconnect();
}

checkData().catch(console.error);
