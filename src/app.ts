import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { env } from './config/env';
import { db } from './config/database';
import { redis } from './config/redis';
import { any } from 'zod';
import { error } from 'console';

const app = Fastify({ logger: true });

async function bootstrap() {
    // Plugins
    await app.register(cors, { origin: true });
    await app.register(jwt, { secret: env.JWT_SECRET });

    // Health check
    app.get('/health', async () => {
        const dbOk = await db.raw('SELECT 1').then(() => true).catch(() => false);
        const redisOk = await redis.ping().then(r => r === 'PONG').catch(() => false);
        return {
            status: dbOk && redisOk ? 'healthy' : 'degraded',
            database: dbOk,
            redis: redisOk,
            timestamp: new Date().toISOString(),
        };
    });

    // Connect Redis
    await redis.connect();

    // Start
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`[MechHub] Server running on port ${env.PORT}`);

    // Start background processes (only after fastify is up and running)
    const { startEscalationDaemon } = require('./modules/escalation/escalation.daemon');
    const { startPayoutScheduler } = require('./modules/payout/payout.scheduler');
    const { startConsumer } = require('./events/consumer');
    const { handleJobAccepted } = require('./events/handlers/onJobAccepted');

    startEscalationDaemon();
    startPayoutScheduler();

    startConsumer({
        groupName: 'notification-group',
        consumerName: 'notifier-1',
        handler: async (event: any) => {
            if (event.event === 'JOB_ACCEPTED') await handleJobAccepted(event);
        }
    }).catch((error: any) => console.error('[Consumer] Startup error:', error));
}

bootstrap().catch(console.error);
