// scripts/migrate-clean-bad-users.js
// Migration script: Delete any user:* keys in Redis that do not contain valid JSON
// Usage: node scripts/migrate-clean-bad-users.js

import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: REDIS_URL });

async function isValidJSON(str) {
  if (typeof str !== 'string') return false;
  try {
    const obj = JSON.parse(str);
    return typeof obj === 'object' && obj !== null;
  } catch (e) {
    return false;
  }
}

async function main() {
  await client.connect();
  let cursor = 0;
  let total = 0, deleted = 0;
  do {
    const [nextCursor, keys] = await client.scan(cursor, { MATCH: 'user:*', COUNT: 100 });
    cursor = Number(nextCursor);
    for (const key of keys) {
      total++;
      const value = await client.get(key);
      if (!(await isValidJSON(value))) {
        await client.del(key);
        deleted++;
      }
    }
  } while (cursor !== 0);
  await client.quit();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
