// Script to test Telegram alarm from backend
import { sendTelegramAlarm } from '../src/lib/telegram.js';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  await sendTelegramAlarm('Test alarm from Slot Alert script!', 3);
})();
