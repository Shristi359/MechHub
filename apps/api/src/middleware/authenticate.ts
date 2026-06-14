import { FastifyRequest, FastifyReply } from 'fastify';
import { firebaseAuth } from '../config/firebase';

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return reply.status(401).send({ error: 'UNAUTHORIZED' });
        }
        
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        
        // Ensure FastifyRequest 'user' has expected type
        req.user = { 
            id: decodedToken.uid, 
            role: (decodedToken.role as 'driver' | 'mechanic' | 'captain') || 'driver' 
        };
    } catch (err) {
        return reply.status(401).send({ error: 'UNAUTHORIZED' });
    }
}
