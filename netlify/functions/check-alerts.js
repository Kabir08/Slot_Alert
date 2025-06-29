// Netlify Scheduled Function: Check alerts and trigger Telegram notifications
import { redis } from '../../src/lib/redis.js';
import { getNewMessages } from '../../src/lib/gmail.js';
import { sendTelegramAlarm } from '../../src/lib/telegram.js';

export default async function handler(event, context) {
  // 1. Load all alert criteria (for demo, just one user)
  const alerts = await redis.lrange('user:alerts', 0, -1);
  if (!alerts || alerts.length === 0) {
    return {
      statusCode: 200,
      body: 'No alerts configured.'
    };
  }

  // 2. For each alert, check for new messages
  let triggered = false;
  for (const alertStr of alerts) {
    const alert = JSON.parse(alertStr);
    // Build Gmail query from alert
    let query = '';
    if (alert.sender) query += `from:${alert.sender} `;
    if (alert.subject) query += `subject:${alert.subject} `;
    if (alert.text) query += `${alert.text} `;
    const messages = await getNewMessages(process.env.GMAIL_ACCESS_TOKEN, query.trim());
    if (messages && messages.length > 0) {
      // 3. Trigger Telegram alarm
      await sendTelegramAlarm(`ALERT: New mail matched your alert!\n${JSON.stringify(messages[0], null, 2)}`);
      triggered = true;
    }
  }

  return {
    statusCode: 200,
    body: triggered ? 'Alert triggered!' : 'No new matching emails.'
  };
}

// Netlify scheduled function config
export const config = {
  schedule: '@every 10m' // every 10 minutes
};
