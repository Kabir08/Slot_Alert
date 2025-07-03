import { redis } from '$lib/redis.js';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ?? '';

export async function getValidAccessToken(userEmail) {
  if (!userEmail) return null;
  const userRaw = await redis.get(`user:${userEmail}`);
  if (!userRaw || typeof userRaw !== 'string' || !userRaw.trim().startsWith('{')) {
    console.error('Invalid user object in Redis:', userRaw);
    // Self-healing: delete the bad key
    await redis.del(`user:${userEmail}`);
    return null;
  }
  const user = JSON.parse(userRaw);
  let access_token = user.access_token;
  const refresh_token = user.refresh_token;
  const token_expiry = user.token_expiry;
  // Check if access_token is expired (allow 1 min clock skew)
  if (!access_token || (token_expiry && Date.now() > token_expiry - 60000)) {
    if (refresh_token) {
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
        user.access_token = access_token;
        user.token_expiry = data.expires_in ? Date.now() + data.expires_in * 1000 : null;
        console.log('Saving user to Redis:', JSON.stringify(user));
        await redis.set(`user:${userEmail}`, JSON.stringify(user));
      }
    }
  }
  return access_token;
}
