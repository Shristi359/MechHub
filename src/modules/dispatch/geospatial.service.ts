import { db } from '../../config/database';

export interface NearbyMechanic {
    id: string;
    full_name: string;
    phone: string;
    rating: number;
    distance_meters: number;
    fcm_token: string | null;
}

export async function findNearestMechanics(params: {
    lng: number;
    lat: number;
    radiusKm: number;
    excludeIds?: string[];
    limit?: number;
}): Promise<NearbyMechanic[]> {
    const { lng, lat, radiusKm, excludeIds = [], limit = 3 } = params;

    let query = db('mechanics')
        .select(
            'id', 'full_name', 'phone', 'rating', 'fcm_token',
            db.raw(`
                ST_Distance(
                    location,
                    ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography
                ) AS distance_meters
            `, [lng, lat])
        )
        .where('status', 'ONLINE')
        .whereNotNull('fcm_token')
        .whereRaw(`
            ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
                ?
            )
        `, [lng, lat, radiusKm * 1000]);

    if (excludeIds.length > 0) {
        query = query.whereNotIn('id', excludeIds);
    }

    return query
        .orderByRaw('distance_meters ASC, rating DESC')
        .limit(limit);
}
