import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getRole } from '@/lib/get-role';

export const dynamic = 'force-dynamic';

export async function GET() {
  const role = await getRole();
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Generate the last 7 days including today
    const data = await db.raw(`
      WITH last_7_days AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        to_char(d.date, 'Mon DD') as name,
        COALESCE(SUM(me.gross_amount), 0) as revenue
      FROM last_7_days d
      LEFT JOIN mechanic_earnings me ON d.date = me.date
      GROUP BY d.date
      ORDER BY d.date ASC;
    `);

    return NextResponse.json(data.rows);
  } catch (err) {
    console.error('[analytics]', err);
    return NextResponse.json([], { status: 500 });
  }
}
