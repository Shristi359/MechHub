import { db } from '../../config/database';
import { publishEvent } from '../../events/publisher';

export async function forceBroadcast(jobId: string) {
    const job = await db('jobs').where({ id: jobId, status: 'PENDING' }).first();
    if (!job) throw new Error('JOB_NOT_PENDING');

    await db('jobs').where({ id: jobId }).update({
        dispatch_round: 4,
        round_started_at: new Date()
    });

    await publishEvent('JOB_ESCALATED', { jobId, fromRound: job.dispatch_round, toRound: 4, label: 'ZONE_BROADCAST_FORCED' });
    return { status: 'BROADCAST_INITIATED' };
}

export async function suspendMechanic(mechanicId: string) {
    await db('mechanics').where({ id: mechanicId }).update({ status: 'SUSPENDED' });
    return { status: 'SUSPENDED' };
}

export async function unsuspendMechanic(mechanicId: string) {
    await db('mechanics').where({ id: mechanicId }).update({ status: 'OFFLINE' });
    return { status: 'UNSUSPENDED' };
}

export async function manualAssign(jobId: string, mechanicId: string) {
    await db('jobs').where({ id: jobId }).update({
        status: 'ASSIGNED',
        mechanic_id: mechanicId,
        assigned_at: new Date()
    });
    return { status: 'MANUALLY_ASSIGNED' };
}
