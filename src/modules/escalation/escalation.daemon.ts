import { findStaleJobs, escalateJob } from './escalation.service';
import { DAEMON_POLL_INTERVAL_MS } from './escalation.config';

let isRunning = false;

export async function startEscalationDaemon(): Promise<void> {
    if (isRunning) return;
    isRunning = true;

    console.log('[Escalation] Daemon started — polling every 5 seconds');

    while (isRunning) {
        try {
            const staleJobs = await findStaleJobs();

            for (const job of staleJobs) {
                await escalateJob(job);
            }
        } catch (err) {
            console.error('[Escalation] Error in scan cycle:', err);
        }

        await new Promise(resolve => setTimeout(resolve, DAEMON_POLL_INTERVAL_MS));
    }
}

export function stopEscalationDaemon(): void {
    isRunning = false;
    console.log('[Escalation] Daemon stopped');
}
