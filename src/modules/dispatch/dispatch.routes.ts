import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate';
import { dispatchNewJob } from './dispatch.service';

export async function dispatchRoutes(app: FastifyInstance) {
    app.post('/jobs', {
        preHandler: [authenticate],
        schema: {
            body: {
                type: 'object',
                required: ['serviceTypeId', 'lat', 'lng'],
                properties: {
                    serviceTypeId:      { type: 'string', format: 'uuid' },
                    lat:                { type: 'number', minimum: -90, maximum: 90 },
                    lng:                { type: 'number', minimum: -180, maximum: 180 },
                    problemDescription: { type: 'string', maxLength: 500 },
                },
            },
        },
    }, async (req, reply) => {
        const driverId = (req as any).user.id;
        const { serviceTypeId, lat, lng, problemDescription } = req.body as any;

        const result = await dispatchNewJob({
            driverId, serviceTypeId, lat, lng, problemDescription,
        });

        return reply.status(201).send(result);
    });
}
