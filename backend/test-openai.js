require('dotenv').config();

async function testOpenAI() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('Testing with key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NONE');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'hello' }]
      })
    });
    
    console.log('Status:', response.status);
    const body = await response.text();
    console.log('Body:', body);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testOpenAI();
