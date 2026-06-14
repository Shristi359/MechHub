import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { getZoneMetrics } from './metrics.service';
import { forceBroadcast, suspendMechanic, unsuspendMechanic, manualAssign } from './controls.service';

export async function dashboardRoutes(fastify: FastifyInstance) {
    const app = fastify.withTypeProvider<ZodTypeProvider>();
    app.get('/dashboard/zones/:zoneId/metrics', { 
        preHandler: [authenticate],
        schema: {
            params: z.object({ zoneId: z.string().uuid() })
        }
    }, async (req, reply) => {
        const { zoneId } = req.params;
        const metrics = await getZoneMetrics(zoneId);
        return reply.send(metrics);
    });

    app.post('/dashboard/jobs/:jobId/force-broadcast', { 
        preHandler: [authenticate],
        schema: {
            params: z.object({ jobId: z.string().uuid() })
        }
    }, async (req, reply) => {
        const { jobId } = req.params;
        const result = await forceBroadcast(jobId);
        return reply.send(result);
    });

    app.post('/dashboard/mechanics/:id/suspend', { 
        preHandler: [authenticate],
        schema: {
            params: z.object({ id: z.string().uuid() })
        }
    }, async (req, reply) => {
        const { id } = req.params;
        const result = await suspendMechanic(id);
        return reply.send(result);
    });
}
