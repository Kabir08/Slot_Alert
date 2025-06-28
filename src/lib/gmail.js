// Gmail API helper functions

export async function getNewMessages(access_token, sender) {
  // Fetch messages from Gmail API
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${encodeURIComponent(sender)}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const data = await res.json();
  if (!data.messages) return [];
  // Optionally fetch message details here
  return data.messages;
}
