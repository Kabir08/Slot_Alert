// Script to test Telegram alarm from backend
import { sendTelegramAlarm } from '../src/lib/telegram.js';

(async () => {
  await sendTelegramAlarm('Test alarm from Slot Alert script!', 3);
  console.log('Telegram alarm test sent!');
})();
