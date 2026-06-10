import { redis } from '../config/redis';
import { EVENT_STREAM, StreamEvent } from './event.types';

export async function startConsumer(config: {
    groupName: string;
    consumerName: string;
    handler: (event: StreamEvent) => Promise<void>;
}): Promise<void> {
    const { groupName, consumerName, handler } = config;

    try {
        await redis.xgroup('CREATE', EVENT_STREAM, groupName, '0', 'MKSTREAM');
        console.log(`[Consumer] Created group '${groupName}'`);
    } catch (err: any) {
        if (!err.message.includes('BUSYGROUP')) throw err;
    }

    console.log(`[Consumer] ${consumerName} listening on group '${groupName}'`);

    while (true) {
        try {
            const entries = await redis.xreadgroup(
                'GROUP', groupName, consumerName,
                'COUNT', '10',
                'BLOCK', '5000',
                'STREAMS', EVENT_STREAM, '>'
            );

            if (!entries) continue;

            for (const [, messages] of entries as any) {
                for (const [id, fields] of messages as any) {
                    const eventIndex = fields.indexOf('event');
                    const dataIndex = fields.indexOf('data');
                    const timestampIndex = fields.indexOf('timestamp');

                    if (eventIndex === -1 || dataIndex === -1 || timestampIndex === -1) {
                        console.error(`[Consumer] Malformed event data:`, fields);
                        await redis.xack(EVENT_STREAM, groupName, id);
                        continue;
                    }

                    const event: StreamEvent = {
                        event: fields[eventIndex + 1],
                        data: JSON.parse(fields[dataIndex + 1]),
                        timestamp: fields[timestampIndex + 1],
                    };

                    try {
                        await handler(event);
                        await redis.xack(EVENT_STREAM, groupName, id);
                    } catch (err) {
                        console.error(`[Consumer] ${consumerName} failed on ${id}:`, err);
                        // Do not ACK on failure
                    }
                }
            }
        } catch (err) {
            console.error(`[Consumer] ${consumerName} read error:`, err);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}
