import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV:       z.enum(['development', 'production', 'test']).default('development'),
    PORT:           z.coerce.number().default(3000),

    // Database
    DB_HOST:        z.string().default('localhost'),
    DB_PORT:        z.coerce.number().default(5432),
    DB_NAME:        z.string().default('mechhub'),
    DB_USER:        z.string().default('mechhub'),
    DB_PASSWORD:    z.string(),

    // Redis
    REDIS_HOST:     z.string().default('localhost'),
    REDIS_PORT:     z.coerce.number().default(6379),

    // JWT
    JWT_SECRET:     z.string().min(32),

    // FCM
    FIREBASE_PROJECT_ID:        z.string(),
    FIREBASE_CLIENT_EMAIL:      z.string(),
    FIREBASE_PRIVATE_KEY:       z.string(),

    // Payout
    PLATFORM_FEE_RATE:          z.coerce.number().default(0.10),  // 10%
    PAYOUT_CRON_TIMEZONE:       z.string().default('Asia/Kathmandu'),
    PAYOUT_CRON_HOUR:           z.coerce.number().default(18),    // 6 PM
});

export const env = envSchema.parse(process.env);
