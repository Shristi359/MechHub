import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate';
import { acceptJob } from './jobs.service';
import { submitQuote, confirmQuote } from './quote.service';
import { completeJob } from './complete.service';

export async function jobRoutes(app: FastifyInstance) {
    app.post('/jobs/:jobId/accept', { preHandler: [authenticate] }, async (req, reply) => {
        const { jobId } = req.params as { jobId: string };
        const mechanicId = (req as any).user.id;
        const result = await acceptJob(jobId, mechanicId);
        if (result.status === 'ALREADY_TAKEN') {
            return reply.status(409).send({ error: 'JOB_ALREADY_TAKEN', assignedTo: result.holderId });
        }
        if (result.status === 'JOB_NOT_FOUND') return reply.status(404).send({ error: 'JOB_NOT_FOUND' });
        return reply.status(200).send({ status: 'ASSIGNED', jobId });
    });

    app.post('/jobs/:jobId/quote', { preHandler: [authenticate] }, async (req, reply) => {
        const { jobId } = req.params as { jobId: string };
        const mechanicId = (req as any).user.id;
        const { amount } = req.body as { amount: number };
        try {
            const result = await submitQuote(jobId, mechanicId, amount);
            return reply.send(result);
        } catch (e: any) {
            return reply.status(400).send({ error: e.message });
        }
    });

    app.post('/jobs/:jobId/confirm-quote', { preHandler: [authenticate] }, async (req, reply) => {
        const { jobId } = req.params as { jobId: string };
        const driverId = (req as any).user.id;
        try {
            const result = await confirmQuote(jobId, driverId);
            return reply.send(result);
        } catch (e: any) {
            return reply.status(400).send({ error: e.message });
        }
    });

    app.post('/jobs/:jobId/complete', { preHandler: [authenticate] }, async (req, reply) => {
        const { jobId } = req.params as { jobId: string };
        const mechanicId = (req as any).user.id;
        try {
            await completeJob(jobId, mechanicId);
            return reply.send({ status: 'COMPLETED', jobId });
        } catch (e: any) {
            return reply.status(400).send({ error: e.message });
        }
    });
}
