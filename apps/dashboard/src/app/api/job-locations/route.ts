import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jobs = await db('jobs')
      .leftJoin('service_types', 'jobs.service_type_id', 'service_types.id')
      .whereNotNull('jobs.location')
      .select(
        'jobs.id',
        'jobs.status',
        'service_types.name as serviceType',
        db.raw('ST_X(jobs.location::geometry) as lng'),
        db.raw('ST_Y(jobs.location::geometry) as lat')
      )
      .limit(100);

    return NextResponse.json(jobs);
  } catch (err) {
    console.error('[job-locations]', err);
    return NextResponse.json([], { status: 500 });
  }
}
