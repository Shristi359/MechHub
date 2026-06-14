import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { env } from './config/env';
import { db } from './config/database';
import { redis } from './config/redis';

import { startEscalationDaemon } from './modules/escalation/escalation.daemon';
import { startPayoutScheduler } from './modules/payout/payout.scheduler';
import { startConsumer } from './events/consumer';
import { handleJobAccepted } from './events/handlers/onJobAccepted';
import { dispatchRoutes } from './modules/dispatch/dispatch.routes';
import { jobRoutes } from './modules/jobs/jobs.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { realtimeRoutes } from './modules/realtime/realtime.routes';

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

const app = Fastify({ logger: true });

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

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

    // Connect Redis (guard against double-connect on nodemon restarts)
    if (redis.status === 'close' || redis.status === 'end') {
        await redis.connect();
    }

    // Register WebSocket support
    await app.register(websocket);

    // Register Routes
    await app.register(dispatchRoutes, { prefix: '/api/v1/dispatch' });
    await app.register(jobRoutes, { prefix: '/api/v1' });
    await app.register(dashboardRoutes, { prefix: '/api/v1' });
    await app.register(realtimeRoutes, { prefix: '/api/v1' });

    // Start
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`[MechHub] Server running on port ${env.PORT}`);

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
