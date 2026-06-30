require('dotenv').config();
const mongoose = require('mongoose');
const { fetchChatResponse } = require('./src/services/assistant.service');
const Business = require('./src/models/Business');

async function test() {
  try {
    // We need to connect to the right DB instead of 'test'
    const uri = process.env.MONGODB_URI.replace('?appName', 'localboost?appName');
    await mongoose.connect(uri);
    const business = await Business.findOne();
    if (!business) return console.log('No business found in correct DB');
    
    console.log('Testing with business:', business._id.toString());
    const result = await fetchChatResponse({
      businessId: business._id.toString(),
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Test Failed:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

test();
