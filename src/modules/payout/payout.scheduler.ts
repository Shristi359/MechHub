import cron from 'node-cron';
import { env } from '../../config/env';
import { runDailyPayout } from './payout.service';

export function startPayoutScheduler(): void {
    const cronExpr = `0 ${env.PAYOUT_CRON_HOUR} * * *`;

    cron.schedule(cronExpr, async () => {
        const start = Date.now();
        console.log(`[Payout] Scheduled run at ${new Date().toISOString()}`);

        try {
            const result = await runDailyPayout();
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);
            console.log(`[Payout] Completed in ${elapsed}s — ${result.processedCount} mechanics, NPR ${result.totalDisbursed}`);
        } catch (err) {
            console.error('[Payout] Scheduled run failed:', err);
        }
    }, {
        timezone: env.PAYOUT_CRON_TIMEZONE,
    });

    console.log(`[Payout] Scheduler registered — runs daily at ${env.PAYOUT_CRON_HOUR}:00 ${env.PAYOUT_CRON_TIMEZONE}`);
}
