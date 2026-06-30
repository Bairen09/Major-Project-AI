async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@localboost.ai', password: 'Demo@123' })
    });
    console.log(res.status);
    console.log(await res.text());
  } catch(e) {
    console.error(e);
  }
}
test();
