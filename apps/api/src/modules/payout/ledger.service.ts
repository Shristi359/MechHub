import { db } from '../../config/database';
import { env } from '../../config/env';
import { publishEvent } from '../../events/publisher';

export async function createLedgerEntry(
    mechanicId: string,
    jobId: string,
    finalAmount: number
): Promise<void> {
    const platformFee = Math.round(finalAmount * env.PLATFORM_FEE_RATE * 100) / 100;

    await db('mechanic_earnings').insert({
        mechanic_id: mechanicId,
        job_id: jobId,
        gross_amount: finalAmount,
        platform_fee: platformFee,
        payout_status: 'PENDING',
    });

    await publishEvent('PAYOUT_CREATED', {
        mechanicId,
        jobId,
        grossAmount: finalAmount,
        platformFee,
        netAmount: finalAmount - platformFee,
    });
}
