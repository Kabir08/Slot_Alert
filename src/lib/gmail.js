// Gmail API helper functions
import { getValidAccessToken } from '$lib/auth-helpers.js';

export async function getNewMessages(_access_token, sender) {
  // Always get a valid access token (refresh if needed)
  const access_token = await getValidAccessToken();
  if (!access_token) return [];
  // Fetch the latest 5 messages from the sender
  const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${encodeURIComponent(sender)}&maxResults=5`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const listData = await listRes.json();
  if (!listData.messages) return [];

  // Fetch metadata for each message
  const details = await Promise.all(
    listData.messages.map(async (msg) => {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=subject&metadataHeaders=from`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const msgData = await msgRes.json();
      const headers = msgData.payload.headers;
      return {
        id: msg.id,
        snippet: msgData.snippet,
        subject: headers.find(h => h.name === 'Subject')?.value || '',
        from: headers.find(h => h.name === 'From')?.value || '',
        internalDate: msgData.internalDate // timestamp in ms
      };
    })
  );
  return details;
}
