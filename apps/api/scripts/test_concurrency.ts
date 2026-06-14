import { acceptJob } from '../src/modules/jobs/jobs.service';
import { db } from '../src/config/database';
import { redis } from '../src/config/redis';
import { v4 as uuidv4 } from 'uuid';

async function runTest() {
    console.log('[Test] Starting concurrency load test...');

    // 1. Setup mock driver and service type
    const serviceType = await db('service_types').first();
    if (!serviceType) {
        throw new Error('No service types found. Seed the database first.');
    }
    const serviceTypeId = serviceType.id;

    const [driver] = await db('drivers').insert({
        full_name: 'Test Driver',
        phone: '9812345678',
        vehicle_type: 'car',
        vehicle_number: 'BA 1 PA 1234'
    }).returning('id');
    const driverId = driver.id;

    // Setup mock job
    const [job] = await db('jobs').insert({
        driver_id: driverId,
        service_type_id: serviceTypeId,
        location: db.raw(`ST_SetSRID(ST_MakePoint(85.3, 27.7), 4326)::geography`),
        status: 'DISPATCHED'
    }).returning('id');

    const jobId = job.id;
    console.log(`[Test] Created Job: ${jobId}`);

    // 1.5 Setup mock mechanics
    const kathmanduZone = await db('zones').where({ name: 'Kathmandu' }).first();
    const zoneId = kathmanduZone?.id || null;

    const mechanicsData = Array.from({ length: 10 }).map((_, i) => ({
        id: uuidv4(),
        full_name: `Test Mechanic ${i}`,
        phone: `980000010${i}`,
        rating: 4.5,
        status: 'ONLINE',
        zone_id: zoneId,
        location: db.raw(`ST_SetSRID(ST_MakePoint(85.31, 27.71), 4326)::geography`),
        fcm_token: `token_${i}`
    }));

    await db('mechanics').insert(mechanicsData);
    const mechanicIds = mechanicsData.map(m => m.id);

    // 2. Fire 10 simultaneous accept requests

    console.log('[Test] Firing 10 concurrent accept requests...');
    const results = await Promise.all(
        mechanicIds.map(async (mId) => {
            try {
                return await acceptJob(jobId, mId);
            } catch (err: any) {
                return { status: 'ERROR', error: err.message };
            }
        })
    );

    // 3. Assert results
    const assigned = results.filter(r => r.status === 'ASSIGNED');
    const taken = results.filter(r => r.status === 'ALREADY_TAKEN');
    const errors = results.filter(r => r.status === 'ERROR');

    console.log('\n[Test Results]');
    console.log(`ASSIGNED (Expected 1):      ${assigned.length}`);
    console.log(`ALREADY_TAKEN (Expected 9): ${taken.length}`);
    console.log(`ERRORS:                     ${errors.length}`);

    if (errors.length > 0) {
        console.log('[Test Errors]:', errors);
    }

    if (assigned.length === 1 && taken.length === 9) {
        console.log('\n✅ TEST PASSED: Exactly 1 winner guaranteed by SETNX.');
    } else {
        console.error('\n❌ TEST FAILED: Race condition detected!');
    }

    // Cleanup
    await redis.del(`job_lock:${jobId}`);
    await db('jobs').where({ id: jobId }).del();
    await db('drivers').where({ id: driverId }).del();
    await db('mechanics').whereIn('id', mechanicIds).del();
    process.exit(0);
}

runTest().catch(console.error);
