// Handles OAuth2 callback from Google
import { redirect } from '@sveltejs/kit';
import { redis } from '$lib/redis.js';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI ?? '';

export async function GET({ url, cookies }) {
  // Only handle callback if code and state are present
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const savedState = cookies.get('oauth_state');
  if (!code || !state || state !== savedState) {
    return new Response('Invalid or missing code/state', { status: 400 });
  }
  cookies.delete('oauth_state', { path: '/' });

  // Exchange code for tokens
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });
  const tokens = await res.json();
  if (tokens.error) return new Response('Token error: ' + tokens.error, { status: 400 });

  // Fetch user's email using the access token
  let userEmail = null;
  let userObj = null;
  if (tokens.access_token) {
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    if (userinfoRes.ok) {
      const userinfo = await userinfoRes.json();
      userEmail = userinfo.email;
      if (userEmail) {
        const userKey = `user:${userEmail}`;
        // Try to load existing user object
        const existingRaw = await redis.get(userKey);
        userObj = existingRaw ? JSON.parse(existingRaw) : {};
        // Update user object with latest info
        userObj.email = userEmail;
        userObj.access_token = tokens.access_token;
        userObj.refresh_token = tokens.refresh_token;
        userObj.token_expiry = tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null;
        userObj.alerts = userObj.alerts || [];
        // Add other fields as needed
        await redis.set(userKey, JSON.stringify(userObj));
        // Set user_email cookie
        cookies.set('user_email', userEmail, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
      }
    }
  }

  // Store tokens in httpOnly cookie for session (optional)
  if (userObj) {
    cookies.set('access_token', userObj.access_token, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
    cookies.set('refresh_token', userObj.refresh_token, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
  }

  // Redirect to your app's home or dashboard
  return redirect(302, '/');
}
