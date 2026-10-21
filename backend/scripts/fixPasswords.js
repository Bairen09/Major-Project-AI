require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Staff = require('../src/models/Staff');
const connectDB = require('../src/config/db');

async function fixPasswords() {
  await connectDB();
  
  const correctHash = await bcrypt.hash('Password123', 12);

  const resultUser = await User.updateMany(
    { email: { $ne: 'demo@localboost.ai' } },
    { $set: { password: correctHash } }
  );
  
  const resultStaff = await Staff.updateMany(
    {},
    { $set: { password: correctHash } }
  );

  console.log(`Updated ${resultUser.modifiedCount} Users with correct password hash.`);
  console.log(`Updated ${resultStaff.modifiedCount} Staff with correct password hash.`);
  
  await mongoose.disconnect();
}

fixPasswords().catch(console.error);
