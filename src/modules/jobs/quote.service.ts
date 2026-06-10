import { db } from '../../config/database';
import { publishEvent } from '../../events/publisher';

export async function submitQuote(jobId: string, mechanicId: string, amount: number) {
    const job = await db('jobs')
        .where({ id: jobId, mechanic_id: mechanicId, status: 'ASSIGNED' })
        .first();

    if (!job) throw new Error('JOB_NOT_READY_FOR_QUOTE');

    await db('jobs').where({ id: jobId }).update({
        mechanic_quote: amount,
        status: 'QUOTE_PENDING',
        quote_sent_at: new Date(),
    });

    await publishEvent('QUOTE_SUBMITTED', { jobId, mechanicId, driverId: job.driver_id, amount });
    return { status: 'QUOTE_PENDING' };
}

export async function confirmQuote(jobId: string, driverId: string) {
    const job = await db('jobs')
        .where({ id: jobId, driver_id: driverId, status: 'QUOTE_PENDING' })
        .first();

    if (!job) throw new Error('NO_QUOTE_TO_CONFIRM');

    await db('jobs').where({ id: jobId }).update({
        final_amount: job.mechanic_quote,
        status: 'QUOTE_ACCEPTED',
        work_started_at: new Date(),
    });

    await publishEvent('QUOTE_ACCEPTED', { jobId, mechanicId: job.mechanic_id, driverId, finalAmount: job.mechanic_quote });
    return { status: 'QUOTE_ACCEPTED' };
}
