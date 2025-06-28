// Pushcut/IFTTT API helper functions

export async function triggerPushcut(message) {
  const apiKey = process.env.PUSHCUT_API_KEY;
  const url = `https://api.pushcut.io/v1/notifications/trigger`; // Adjust for your Pushcut setup
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': apiKey
    },
    body: JSON.stringify({ message })
  });
  return await res.json();
}
