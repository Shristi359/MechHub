import { sendPushBatch, PushPayload } from './fcm.service';
import { NearbyMechanic } from '../dispatch/geospatial.service';

export async function notifyMechanicsOfJob(
    mechanics: NearbyMechanic[],
    job: { id: string; serviceTypeName: string; estimatedFare: number }
): Promise<void> {
    const payloads: PushPayload[] = mechanics
        .filter(m => m.fcm_token)
        .map(m => ({
            token: m.fcm_token!,
            title: '🔧 New Job Request',
            body: `${job.serviceTypeName} — ${formatDistance(m.distance_meters)} away — Est. Rs.${job.estimatedFare}`,
            data: {
                type:       'JOB_OFFER',
                jobId:      job.id,
                distance:   String(Math.round(m.distance_meters)),
                fare:       String(job.estimatedFare),
                expiresAt:  String(Date.now() + 60_000),
            },
        }));

    await sendPushBatch(payloads);
}

export async function cancelJobForMechanics(
    mechanicTokens: string[],
    jobId: string
): Promise<void> {
    const payloads: PushPayload[] = mechanicTokens.map(token => ({
        token,
        title: 'Job Taken',
        body: 'Another mechanic accepted this job.',
        data: { type: 'JOB_CANCELLED', jobId },
    }));

    await sendPushBatch(payloads);
}

function formatDistance(meters: number): string {
    return meters >= 1000
        ? `${(meters / 1000).toFixed(1)} km`
        : `${Math.round(meters)} m`;
}
