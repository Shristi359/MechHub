import { WebSocket } from '@fastify/websocket';

// Set of all currently connected dashboard clients
const clients = new Set<WebSocket>();

export function addClient(ws: WebSocket) {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
}

export function broadcast(payload: object) {
    const message = JSON.stringify(payload);
    for (const client of clients) {
        if (client.readyState === 1 /* OPEN */) {
            client.send(message);
        }
    }
}

export function getClientCount() {
    return clients.size;
}
