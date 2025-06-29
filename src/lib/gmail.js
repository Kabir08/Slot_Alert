// Gmail API helper functions
import { getValidAccessToken } from '../routes/api/auth/+server.js';

export async function getNewMessages(_access_token, sender) {
  // Always get a valid access token (refresh if needed)
  const access_token = await getValidAccessToken();
  if (!access_token) return [];
  // Fetch messages from Gmail API
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${encodeURIComponent(sender)}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const data = await res.json();
  if (!data.messages) return [];
  // Optionally fetch message details here
  return data.messages;
}
