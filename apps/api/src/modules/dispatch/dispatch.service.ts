import { db } from '../../config/database';
import { findNearestMechanics } from './geospatial.service';
import { calculateEstimatedFare } from './fare.service';
import { notifyMechanicsOfJob } from '../notification/notification.service';
import { publishEvent } from '../../events/publisher';
import { broadcast } from '../realtime/broadcaster';

export async function dispatchNewJob(params: {
    driverId: string;
    serviceTypeId: string;
    lat: number;
    lng: number;
    problemDescription?: string;
}): Promise<{ jobId: string; mechanicsNotified: number; estimatedFare: number }> {

    const { driverId, serviceTypeId, lat, lng, problemDescription } = params;

    const zone = await db('zones')
        .whereRaw(`ST_Contains(boundary::geometry, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geometry)`, [lng, lat])
        .first();

    const [job] = await db('jobs').insert({
        driver_id: driverId,
        service_type_id: serviceTypeId,
        problem_description: problemDescription,
        location: db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography`, [lng, lat]),
        zone_id: zone?.id ?? null,
        status: 'PENDING',
        dispatch_round: 1,
        round_started_at: new Date(),
    }).returning('*');

    const mechanics = await findNearestMechanics({
        lng, lat,
        radiusKm: 3,
        limit: 3,
    });

    if (mechanics.length === 0) {
        await publishEvent('JOB_CREATED', { jobId: job.id, driverId, mechanicsFound: 0 });
        broadcast({ type: 'JOB_CREATED', jobId: job.id, status: 'PENDING', serviceTypeId, timestamp: new Date().toISOString() });
        return { jobId: job.id, mechanicsNotified: 0, estimatedFare: 0 };
    }

    const nearestDistanceKm = mechanics[0].distance_meters / 1000;
    const estimatedFare = await calculateEstimatedFare(serviceTypeId, nearestDistanceKm);

    const serviceType = await db('service_types').where({ id: serviceTypeId }).first();

    await notifyMechanicsOfJob(mechanics, {
        id: job.id,
        serviceTypeName: serviceType.name,
        estimatedFare,
    });

    await db('jobs').where({ id: job.id }).update({
        status: 'DISPATCHED',
        estimated_fare: estimatedFare,
        dispatched_at: new Date(),
        dispatched_mechanic_ids: mechanics.map(m => m.id),
    });

    await publishEvent('JOB_DISPATCHED', {
        jobId: job.id,
        driverId,
        mechanicIds: mechanics.map(m => m.id),
        round: 1,
    });

    broadcast({
        type: 'JOB_DISPATCHED',
        jobId: job.id,
        status: 'DISPATCHED',
        mechanicsNotified: mechanics.length,
        estimatedFare,
        timestamp: new Date().toISOString(),
    });

    return {
        jobId: job.id,
        mechanicsNotified: mechanics.length,
        estimatedFare,
    };
}
