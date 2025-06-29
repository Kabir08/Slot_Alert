// Upstash Redis client setup for storing tokens and sessions
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// Example usage:
// await redis.set('key', 'value');
// const value = await redis.get('key');
