import { db } from '../../config/database';

export async function calculateEstimatedFare(
    serviceTypeId: string,
    distanceKm: number
): Promise<number> {
    const serviceType = await db('service_types')
        .where({ id: serviceTypeId, is_active: true })
        .first();

    if (!serviceType) {
        throw new Error('INVALID_SERVICE_TYPE');
    }

    const fare = Number(serviceType.base_fare) +
                 (distanceKm * Number(serviceType.per_km_rate));

    return Math.round(fare * 100) / 100;
}
