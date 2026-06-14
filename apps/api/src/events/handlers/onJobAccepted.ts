import { StreamEvent } from '../event.types';
import { db } from '../../config/database';
import { cancelJobForMechanics } from '../../modules/notification/notification.service';

export async function handleJobAccepted(event: StreamEvent): Promise<void> {
    const { jobId, mechanicId } = event.data;

    // Optional: Cancel notifications for others if not already done inline
    const job = await db('jobs').where({ id: jobId }).first();
    if (!job) return;

    const otherMechanicIds = (job.dispatched_mechanic_ids || []).filter((id: string) => id !== mechanicId);

    if (otherMechanicIds.length > 0) {
        const tokens = await db('mechanics').whereIn('id', otherMechanicIds).whereNotNull('fcm_token').pluck('fcm_token');
        if (tokens.length > 0) {
            await cancelJobForMechanics(tokens, jobId);
        }
    }
}
