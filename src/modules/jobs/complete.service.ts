import { db } from '../../config/database';
import { releaseJobLock } from '../dispatch/lock.service';
import { createLedgerEntry } from '../payout/ledger.service';
import { publishEvent } from '../../events/publisher';

export async function completeJob(jobId: string, mechanicId: string): Promise<void> {
    const job = await db('jobs')
        .where({ id: jobId, mechanic_id: mechanicId })
        .whereIn('status', ['QUOTE_ACCEPTED', 'IN_PROGRESS'])
        .first();

    if (!job) throw new Error('JOB_NOT_COMPLETABLE');
    if (!job.final_amount) throw new Error('NO_CONFIRMED_PRICE');

    await db.transaction(async (trx) => {
        await trx('jobs').where({ id: jobId }).update({
            status: 'COMPLETED',
            completed_at: new Date(),
        });

        await trx('mechanics').where({ id: mechanicId }).update({
            status: 'ONLINE',
            updated_at: new Date(),
        });
    });

    await releaseJobLock(jobId, mechanicId);

    await createLedgerEntry(mechanicId, jobId, Number(job.final_amount));

    await publishEvent('JOB_COMPLETED', {
        jobId,
        mechanicId,
        driverId: job.driver_id,
        finalAmount: Number(job.final_amount),
    });
}
