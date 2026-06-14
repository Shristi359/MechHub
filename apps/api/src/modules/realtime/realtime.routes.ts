import { FastifyInstance } from 'fastify';
import { addClient, getClientCount } from './broadcaster';

export async function realtimeRoutes(fastify: FastifyInstance) {
    fastify.get('/ws', { websocket: true }, (socket, req) => {
        addClient(socket);

        console.log(`[WS] Client connected. Total: ${getClientCount()}`);

        // Send a welcome snapshot immediately
        socket.send(JSON.stringify({
            type: 'CONNECTED',
            timestamp: new Date().toISOString(),
            message: 'Connected to MechHub real-time feed',
        }));

        socket.on('close', () => {
            console.log(`[WS] Client disconnected. Total: ${getClientCount()}`);
        });

        socket.on('message', async (message: Buffer) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.type === 'LOCATION_UPDATE' && data.mechanicId && data.lat && data.lng) {
                    const { db } = await import('../../config/database');
                    
                    // Update DB
                    await db('mechanics')
                        .where({ id: data.mechanicId })
                        .update({
                            last_known_location: db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`, [data.lng, data.lat])
                        });
                        
                    // Broadcast to all clients including dispatchers
                    import('./broadcaster').then(({ broadcast }) => {
                        broadcast({
                            type: 'MECHANIC_LOCATION',
                            mechanicId: data.mechanicId,
                            lat: data.lat,
                            lng: data.lng,
                            timestamp: new Date().toISOString()
                        });
                    });
                }
            } catch (err) {
                console.error('[WS] Message error:', err);
            }
        });

        socket.on('error', (err: Error) => {
            console.error('[WS] Socket error:', err.message);
        });
    });
}
