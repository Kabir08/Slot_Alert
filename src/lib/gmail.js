// Gmail API helper functions
import { getValidAccessToken } from '$lib/auth-helpers.js';

export async function getNewMessages(_access_token, query) {
  // Always get a valid access token (refresh if needed)
  const access_token = await getValidAccessToken();
  if (!access_token) return [];
  console.log('Gmail API Query:', query);
  // Fetch the latest 5 messages matching the query
  const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const listData = await listRes.json();
  console.log('Gmail API List Response:', JSON.stringify(listData, null, 2));
  if (!listData.messages) return [];

  // Fetch metadata for each message
  const details = await Promise.all(
    listData.messages.map(async (msg) => {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=subject&metadataHeaders=from`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const msgData = await msgRes.json();
      console.log('Gmail API Message Response:', JSON.stringify(msgData, null, 2));
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

// Check if a message is unread
export async function isMessageUnread(messageId) {
  const access_token = await getValidAccessToken();
  if (!access_token) return false;
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const data = await res.json();
  return data.labelIds && data.labelIds.includes('UNREAD');
}

// Add a label to a message (creates label if needed)
export async function addLabelToMessage(messageId, labelName = 'Processed by Slot Alert') {
  const access_token = await getValidAccessToken();
  if (!access_token) return false;
  // Get or create label
  let labelId = await getOrCreateLabelId(labelName, access_token);
  if (!labelId) return false;
  // Add label to message
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
    body: JSON.stringify({ addLabelIds: [labelId] })
  });
  return res.ok;
}

// Helper to get or create a label and return its ID
async function getOrCreateLabelId(labelName, access_token) {
  // List labels
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const data = await res.json();
  let label = data.labels.find(l => l.name === labelName);
  if (label) return label.id;
  // Create label
  const createRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
    body: JSON.stringify({ name: labelName, labelListVisibility: 'labelShow', messageListVisibility: 'show' })
  });
  const createData = await createRes.json();
  return createData.id;
}
