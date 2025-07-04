import { redis } from '$lib/redis.js';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ?? '';

export async function getValidAccessToken(userEmail) {
  if (!userEmail) {
    console.error('getValidAccessToken: No userEmail provided');
    return null;
  }
  const userRaw = await redis.get(`user:${userEmail}`);
  if (!userRaw || typeof userRaw !== 'string' || !userRaw.trim().startsWith('{')) {
    console.error('getValidAccessToken: Invalid user object in Redis:', userRaw);
    return null;
  }
  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    console.error('getValidAccessToken: Failed to parse user object:', userRaw, e);
    return null;
  }
  console.log('getValidAccessToken: Parsed user object:', user);
  let access_token = user.access_token;
  const refresh_token = user.refresh_token;
  const token_expiry = user.token_expiry;
  if (!access_token) {
    console.error('getValidAccessToken: No access_token in user object:', user);
  }
  if (!refresh_token) {
    console.error('getValidAccessToken: No refresh_token in user object:', user);
  }
  if (!token_expiry) {
    console.error('getValidAccessToken: No token_expiry in user object:', user);
  }
  // Check if access_token is expired (allow 1 min clock skew)
  if (!access_token || (token_expiry && Date.now() > token_expiry - 60000)) {
    if (refresh_token) {
      console.log('getValidAccessToken: Access token expired or missing, attempting refresh...');
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
      console.log('getValidAccessToken: Refresh response:', data);
      if (data.access_token) {
        access_token = data.access_token;
        user.access_token = access_token;
        user.token_expiry = data.expires_in ? Date.now() + data.expires_in * 1000 : null;
        console.log('getValidAccessToken: Saving refreshed user to Redis:', JSON.stringify(user));
        if (typeof user !== 'object' || user === null) throw new Error('User must be an object');
        await redis.set(`user:${userEmail}`, JSON.stringify(user));
      } else {
        console.error('getValidAccessToken: Failed to refresh access token:', data);
      }
    } else {
      console.error('getValidAccessToken: No refresh_token available to refresh access token.');
    }
  }
  if (!access_token) {
    console.error('getValidAccessToken: Returning null access_token for user:', user);
  }
  return access_token;
}
