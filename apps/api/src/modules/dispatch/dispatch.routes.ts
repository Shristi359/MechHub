import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { dispatchNewJob } from './dispatch.service';

export async function dispatchRoutes(fastify: FastifyInstance) {
    const app = fastify.withTypeProvider<ZodTypeProvider>();
    app.post('/jobs', {
        preHandler: [authenticate],
        schema: {
            body: z.object({
                serviceTypeId: z.string().uuid(),
                lat: z.number().min(-90).max(90),
                lng: z.number().min(-180).max(180),
                problemDescription: z.string().max(500).optional(),
            }),
        },
    }, async (req, reply) => {
        const driverId = (req as any).user.id;
        const { serviceTypeId, lat, lng, problemDescription } = req.body;

        const result = await dispatchNewJob({
            driverId, serviceTypeId, lat, lng, problemDescription,
        });

        return reply.status(201).send(result);
    });
}
