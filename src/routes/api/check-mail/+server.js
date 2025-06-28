// Checks Gmail for new messages from a specific sender
import { json } from '@sveltejs/kit';
import { getNewMessages } from '$lib/gmail.js';

export async function GET({ cookies, url }) {
  const access_token = cookies.get('access_token');
  const sender = url.searchParams.get('sender');
  if (!access_token || !sender) return json({ error: 'Missing token or sender' }, { status: 400 });
  const messages = await getNewMessages(access_token, sender);
  return json({ messages });
}
