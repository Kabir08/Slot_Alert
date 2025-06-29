import { redis, connectRedis } from '$lib/redis.js';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ?? '';

export async function getValidAccessToken() {
  await connectRedis();
  let access_token = await redis.get('user:access_token');
  const refresh_token = await redis.get('user:refresh_token');
  // Optionally, check if access_token is expired (not shown here)
  if (!access_token && refresh_token) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token',
      })
    });
    const data = await res.json();
    if (data.access_token) {
      access_token = data.access_token;
      if (access_token) await redis.set('user:access_token', access_token);
    }
  }
  return access_token;
}
