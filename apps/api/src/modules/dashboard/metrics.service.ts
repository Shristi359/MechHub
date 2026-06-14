import { db } from '../../config/database';

export async function getZoneMetrics(zoneId: string) {
    const [online, pending, avgResponse, fulfillment, escalation, revenue] = await Promise.all([
        db('mechanics').where({ zone_id: zoneId, status: 'ONLINE' }).count('* as count').first(),
        db('jobs').where({ zone_id: zoneId }).whereIn('status', ['PENDING', 'DISPATCHED']).count('* as count').first(),
        db('jobs').where({ zone_id: zoneId, status: 'COMPLETED' })
            .whereRaw("created_at::date = CURRENT_DATE")
            .avg(db.raw("EXTRACT(EPOCH FROM (assigned_at - created_at)) as avg_seconds"))
            .first(),
        db.raw(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'COMPLETED') * 100.0 /
                NULLIF(COUNT(*), 0) as rate
            FROM jobs
            WHERE zone_id = ? AND created_at::date = CURRENT_DATE
        `, [zoneId]).then(r => r.rows[0]),
        db.raw(`
            SELECT
                COUNT(*) FILTER (WHERE dispatch_round > 1) * 100.0 /
                NULLIF(COUNT(*), 0) as rate
            FROM jobs
            WHERE zone_id = ? AND created_at::date = CURRENT_DATE
        `, [zoneId]).then(r => r.rows[0]),
        db('mechanic_earnings')
            .join('jobs', 'jobs.id', 'mechanic_earnings.job_id')
            .where({ 'jobs.zone_id': zoneId })
            .whereRaw("mechanic_earnings.created_at::date = CURRENT_DATE")
            .sum('mechanic_earnings.platform_fee as total')
            .first(),
    ]);

    return {
        onlineMechanics:    Number((online as any)?.count ?? 0),
        pendingJobs:        Number((pending as any)?.count ?? 0),
        avgResponseTimeSec: Math.round(Number((avgResponse as any)?.avg_seconds ?? 0)),
        fulfillmentRate:    Math.round(Number(fulfillment?.rate ?? 0)),
        escalationRate:     Math.round(Number(escalation?.rate ?? 0)),
        todayRevenue:       Number((revenue as any)?.total ?? 0),
    };
}
