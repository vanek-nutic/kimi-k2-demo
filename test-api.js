// Test script to see raw API response
// Set your API key here or pass via environment
const MOONSHOT_API_KEY = process.env.VITE_MOONSHOT_API_KEY || 'YOUR_API_KEY_HERE';
const MOONSHOT_API_URL = 'https://api.moonshot.ai/v1/chat/completions';

async function testAPI() {
  console.log('Testing API with key:', MOONSHOT_API_KEY ? 'Present' : 'Missing');

  const response = await fetch(MOONSHOT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2-turbo-preview',
      messages: [{ role: 'user', content: 'What is 2+2?' }],
      stream: true,
      temperature: 1,
      top_p: 0.8,
      reasoning_content: true,
    }),
  });

  console.log('Response status:', response.status);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let chunkCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunkCount++;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines[lines.length - 1];

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line || !line.startsWith('data: ')) continue;

      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const json = JSON.parse(data);

        // Log first 5 chunks completely
        if (chunkCount <= 5) {
          console.log(`\n=== CHUNK ${chunkCount} ===`);
          console.log('Full JSON:', JSON.stringify(json, null, 2));

          if (json.choices && json.choices[0] && json.choices[0].delta) {
            console.log('Delta keys:', Object.keys(json.choices[0].delta));
          }
        }
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    }
  }

  console.log(`\nTotal chunks: ${chunkCount}`);
}

testAPI().catch(console.error);
