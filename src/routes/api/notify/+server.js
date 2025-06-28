// Triggers Pushcut/IFTTT webhook
import { json } from '@sveltejs/kit';
import { triggerPushcut } from '$lib/pushcut.js';

export async function POST({ request }) {
  const { message } = await request.json();
  const result = await triggerPushcut(message);
  return json({ result });
}
