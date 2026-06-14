import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        if (times > 10) return null;     // stop retrying after 10 attempts
        return Math.min(times * 100, 3000);
    },
    lazyConnect: true,                   // connect explicitly in app.ts
});

redis.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
    console.log('[Redis] Connected');
});
