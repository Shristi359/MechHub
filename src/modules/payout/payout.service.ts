import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database';
import { publishEvent } from '../../events/publisher';
import { sendPushBatch } from '../notification/fcm.service';
import { PaymentGateway } from './gateway/payment-gateway.interface';
import { EsewaGateway } from './gateway/esewa.adapter';

const gateway: PaymentGateway = new EsewaGateway();

interface PayoutSummary {
    mechanicId: string;
    totalNet: number;
    jobCount: number;
}

export async function runDailyPayout(): Promise<{
    processedCount: number;
    totalDisbursed: number;
    failures: string[];
}> {
    const batchId = uuidv4();
    const failures: string[] = [];
    let totalDisbursed = 0;

    const summaries: PayoutSummary[] = await db('mechanic_earnings')
        .where({ payout_status: 'PENDING' })
        .groupBy('mechanic_id')
        .select(
            'mechanic_id as mechanicId',
            db.raw('SUM(net_amount)::numeric as "totalNet"'),
            db.raw('COUNT(*)::integer as "jobCount"')
        );

    console.log(`[Payout] Batch ${batchId}: ${summaries.length} mechanics to process`);

    if (summaries.length === 0) {
        return { processedCount: 0, totalDisbursed: 0, failures: [] };
    }

    for (const summary of summaries) {
        try {
            await processOnePayout(summary, batchId);
            totalDisbursed += Number(summary.totalNet);
        } catch (err) {
            console.error(`[Payout] Failed for ${summary.mechanicId}:`, err);
            failures.push(summary.mechanicId);
        }
    }

    console.log(`[Payout] Batch ${batchId} complete: ${summaries.length - failures.length} success, ${failures.length} failed, NPR ${totalDisbursed} disbursed`);

    return { processedCount: summaries.length, totalDisbursed, failures };
}

async function processOnePayout(summary: PayoutSummary, batchId: string): Promise<void> {
    const { mechanicId, totalNet, jobCount } = summary;

    await db('mechanic_earnings')
        .where({ mechanic_id: mechanicId, payout_status: 'PENDING' })
        .update({ payout_status: 'PROCESSING', payout_batch_id: batchId });

    const mechanic = await db('mechanics').where({ id: mechanicId }).first();

    const gatewayResult = await gateway.transfer({
        mechanicId,
        amount: totalNet,
        phone: mechanic.phone,
    });

    if (!gatewayResult.success) {
        await db('mechanic_earnings')
            .where({ mechanic_id: mechanicId, payout_status: 'PROCESSING', payout_batch_id: batchId })
            .update({ payout_status: 'FAILED' });

        await publishEvent('PAYOUT_FAILED', { mechanicId, error: gatewayResult.error });
        throw new Error(gatewayResult.error ?? 'Gateway transfer failed');
    }

    await db.transaction(async (trx) => {
        await trx('mechanics')
            .where({ id: mechanicId })
            .increment('wallet_balance', totalNet);

        await trx('mechanic_earnings')
            .where({ mechanic_id: mechanicId, payout_status: 'PROCESSING', payout_batch_id: batchId })
            .update({
                payout_status: 'SETTLED',
                settled_at: new Date(),
            });
    });

    if (mechanic.fcm_token) {
        await sendPushBatch([{
            token: mechanic.fcm_token,
            title: '💰 Daily Payout',
            body: `NPR ${totalNet.toLocaleString()} credited — ${jobCount} job${jobCount > 1 ? 's' : ''} today`,
            data: { type: 'PAYOUT_CREDITED', amount: String(totalNet), batchId },
        }]);
    }

    await publishEvent('PAYOUT_SETTLED', {
        mechanicId,
        amount: totalNet,
        jobCount,
        batchId,
        gateway: gateway.name,
        transactionId: gatewayResult.transactionId,
    });
}
