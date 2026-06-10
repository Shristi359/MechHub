import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate';
import { getZoneMetrics } from './metrics.service';
import { forceBroadcast, suspendMechanic, unsuspendMechanic, manualAssign } from './controls.service';

export async function dashboardRoutes(app: FastifyInstance) {
    app.get('/dashboard/zones/:zoneId/metrics', { preHandler: [authenticate] }, async (req, reply) => {
        const { zoneId } = req.params as { zoneId: string };
        const metrics = await getZoneMetrics(zoneId);
        return reply.send(metrics);
    });

    app.post('/dashboard/jobs/:jobId/force-broadcast', { preHandler: [authenticate] }, async (req, reply) => {
        const { jobId } = req.params as { jobId: string };
        const result = await forceBroadcast(jobId);
        return reply.send(result);
    });

    app.post('/dashboard/mechanics/:id/suspend', { preHandler: [authenticate] }, async (req, reply) => {
        const { id } = req.params as { id: string };
        const result = await suspendMechanic(id);
        return reply.send(result);
    });
}
