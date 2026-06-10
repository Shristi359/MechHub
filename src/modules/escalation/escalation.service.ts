import { db } from '../../config/database';
import { ESCALATION_TIMEOUT_MS, ESCALATION_ROUNDS, MAX_ROUNDS } from './escalation.config';
import { findNearestMechanics } from '../dispatch/geospatial.service';
import { notifyMechanicsOfJob } from '../notification/notification.service';
import { publishEvent } from '../../events/publisher';

export async function findStaleJobs() {
    const cutoff = new Date(Date.now() - ESCALATION_TIMEOUT_MS);

    return db('jobs')
        .whereIn('status', ['PENDING', 'DISPATCHED'])
        .where('round_started_at', '<', cutoff)
        .where('dispatch_round', '<=', MAX_ROUNDS)
        .select('*');
}

export async function escalateJob(job: any): Promise<void> {
    const currentRound = job.dispatch_round;
    const nextRound = ESCALATION_ROUNDS.find(r => r.round === currentRound + 1);

    if (!nextRound) {
        const updated = await db('jobs')
            .where({ id: job.id })
            .whereIn('status', ['PENDING', 'DISPATCHED'])
            .update({ status: 'UNFULFILLED' })
            .returning('id');

        if (updated.length > 0) {
            await publishEvent('JOB_UNFULFILLED', { jobId: job.id });
        }
        return;
    }

    let newMechanics;

    if (nextRound.label === 'ZONE_BROADCAST') {
        newMechanics = await db('mechanics')
            .where({ zone_id: job.zone_id, status: 'ONLINE' })
            .whereNotNull('fcm_token')
            .whereNotIn('id', job.dispatched_mechanic_ids || [])
            .select('id', 'full_name', 'phone', 'rating', 'fcm_token',
                db.raw(`0 AS distance_meters`));
    } else {
        const [lngRaw, latRaw] = await db.raw(`
            SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
            FROM jobs WHERE id = ?
        `, [job.id]).then(r => [r.rows[0].lng, r.rows[0].lat]);

        newMechanics = await findNearestMechanics({
            lng: lngRaw,
            lat: latRaw,
            radiusKm: nextRound.radiusKm!,
            excludeIds: job.dispatched_mechanic_ids || [],
            limit: nextRound.batchSize!,
        });
    }

    if (newMechanics.length === 0 && nextRound.label !== 'ZONE_BROADCAST') {
        await db('jobs').where({ id: job.id })
            .whereIn('status', ['PENDING', 'DISPATCHED'])
            .update({
                dispatch_round: nextRound.round,
                round_started_at: new Date(),
            });
        return;
    }

    if (newMechanics.length > 0) {
        const serviceType = await db('service_types').where({ id: job.service_type_id }).first();
        await notifyMechanicsOfJob(newMechanics, {
            id: job.id,
            serviceTypeName: serviceType?.name ?? 'Roadside Assistance',
            estimatedFare: job.estimated_fare ?? 0,
        });
    }

    const updatedIds = newMechanics.map((m: any) => m.id);
    const updated = await db('jobs').where({ id: job.id })
        .whereIn('status', ['PENDING', 'DISPATCHED'])
        .update({
            status: 'DISPATCHED',
            dispatch_round: nextRound.round,
            round_started_at: new Date(),
            dispatched_mechanic_ids: db.raw(
                'dispatched_mechanic_ids || ?::uuid[]',
                ['{' + updatedIds.join(',') + '}']
            ),
        })
        .returning('id');

    if (updated.length > 0) {
        await publishEvent('JOB_ESCALATED', {
            jobId: job.id,
            fromRound: currentRound,
            toRound: nextRound.round,
            label: nextRound.label,
            newMechanicsCount: newMechanics.length,
        });
    }
}
