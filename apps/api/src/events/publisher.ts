import { redis } from '../config/redis';

export async function publishEvent(
    event: string,
    data: Record<string, any>
): Promise<string> {
    const entryId = await redis.xadd(
        'dispatch-events',
        '*',
        'event', event,
        'data', JSON.stringify(data),
        'timestamp', new Date().toISOString()
    );
    console.log(`[Event] Published ${event}: ${entryId}`);
    return entryId || '';
}
