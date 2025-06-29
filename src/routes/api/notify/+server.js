// Triggers Pushcut/IFTTT webhook
import { json } from '@sveltejs/kit';
import { triggerPushcut } from '$lib/pushcut.js';
import { sendTelegramAlarm } from '$lib/telegram.js';

export async function POST({ request }) {
  const { message, repeat, chatId } = await request.json();
  
  // Uncomment the line below to enable Pushcut/IFTTT webhook trigger
  // const result = await triggerPushcut(message);
  
  await sendTelegramAlarm(message || 'ALARM! Check your email!', repeat || 60, chatId);
  
  return json({ success: true });
}
