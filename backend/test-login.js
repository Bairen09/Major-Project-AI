require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const email = 'demo@localboost.ai';
    const password = 'Demo@123';
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found!');
      return;
    }
    
    console.log('User found:', user.email);
    console.log('Stored hashed password:', user.password);
    
    const isMatch = await user.comparePassword(password);
    console.log('Does password match?', isMatch);
    
    const rawCompare = await bcrypt.compare(password, user.password);
    console.log('Does raw bcrypt match?', rawCompare);
    
    // Also check rahul
    const rahul = await User.findOne({ email: 'rahul@example.com' }).select('+password');
    if (rahul) {
      console.log('Rahul password hash:', rahul.password);
    }
    
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

test();
