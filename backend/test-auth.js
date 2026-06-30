require('dotenv').config();
const mongoose = require('mongoose');
const authService = require('./src/services/auth.service');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const email = 'demo@localboost.ai';
    const password = 'Demo@123';
    
    console.log('Calling authService.login...');
    const result = await authService.login({ email, password });
    console.log('Login Result Token:', result.token);
    
  } catch(e) {
    console.error('Error during login:', e);
  } finally {
    process.exit(0);
  }
}

test();
