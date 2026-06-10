import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
    try {
        const decoded = await req.jwtVerify();
        req.user = decoded as { id: string; role: 'driver' | 'mechanic' | 'captain' };
    } catch (err) {
        return reply.status(401).send({ error: 'UNAUTHORIZED' });
    }
}
