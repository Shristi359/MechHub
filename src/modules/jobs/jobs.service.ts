import { db } from '../../config/database';
import { acquireJobLock } from '../dispatch/lock.service';
import { cancelJobForMechanics } from '../notification/notification.service';
import { publishEvent } from '../../events/publisher';

export async function acceptJob(
    jobId: string,
    mechanicId: string
): Promise<{ status: 'ASSIGNED' | 'ALREADY_TAKEN' | 'JOB_NOT_FOUND'; holderId?: string }> {

    const job = await db('jobs')
        .where({ id: jobId })
        .whereIn('status', ['PENDING', 'DISPATCHED'])
        .first();

    if (!job) {
        return { status: 'JOB_NOT_FOUND' };
    }

    const lock = await acquireJobLock(jobId, mechanicId);

    if (!lock.acquired) {
        return { status: 'ALREADY_TAKEN', holderId: lock.holderId ?? undefined };
    }

    await db.transaction(async (trx) => {
        await trx('jobs').where({ id: jobId }).update({
            status: 'ASSIGNED',
            mechanic_id: mechanicId,
            assigned_at: new Date(),
        });

        await trx('mechanics').where({ id: mechanicId }).update({
            status: 'BUSY',
            updated_at: new Date(),
        });
    });

    const otherMechanicIds = (job.dispatched_mechanic_ids || [])
        .filter((id: string) => id !== mechanicId);

    if (otherMechanicIds.length > 0) {
        const tokens = await db('mechanics')
            .whereIn('id', otherMechanicIds)
            .whereNotNull('fcm_token')
            .pluck('fcm_token');

        await cancelJobForMechanics(tokens, jobId);
    }

    await publishEvent('JOB_ACCEPTED', {
        jobId,
        mechanicId,
        driverId: job.driver_id,
    });

    return { status: 'ASSIGNED' };
}
