// Checks Gmail for new messages from a specific sender
import { json } from '@sveltejs/kit';
import { getNewMessages } from '$lib/gmail.js';

export async function GET({ cookies, url }) {
  const access_token = cookies.get('access_token');
  const sender = url.searchParams.get('sender');
  const subject = url.searchParams.get('subject');
  const text = url.searchParams.get('text');
  if (!access_token) return json({ error: 'Missing token' }, { status: 400 });

  // Build Gmail search query
  let query = '';
  if (sender) query += `from:${sender} `;
  if (subject) query += `subject:${subject} `;
  if (text) query += `${text} `;

  const messages = await getNewMessages(access_token, query.trim());
  // Only return the fields needed for the UI
  return json({
    messages: messages.map(m => ({
      id: m.id,
      title: m.snippet,
      subject: m.subject,
      from: m.from,
      time: m.internalDate
    }))
  });
}
