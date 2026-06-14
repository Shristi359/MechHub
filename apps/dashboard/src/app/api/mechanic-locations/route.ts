import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mechanics = await db('mechanics')
      .whereNotNull('last_known_location')
      .andWhere('status', 'ONLINE')
      .select(
        'id',
        'full_name as name',
        'status',
        db.raw('ST_X(last_known_location::geometry) as lng'),
        db.raw('ST_Y(last_known_location::geometry) as lat')
      )
      .limit(100);

    return NextResponse.json(mechanics);
  } catch (err) {
    console.error('[mechanic-locations]', err);
    return NextResponse.json([], { status: 500 });
  }
}
