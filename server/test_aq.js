require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

async function testGenerate() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
      })
    });
    
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Response:", JSON.stringify(json, null, 2));
    
    console.log("Headers:");
    res.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });

  } catch (err) {
    console.log("Fetch error:", err.message);
  }
}

testGenerate();
