import { db } from '../src/config/database';
import { redis } from '../src/config/redis';
import { dispatchNewJob } from '../src/modules/dispatch/dispatch.service';
import { acceptJob } from '../src/modules/jobs/jobs.service';
import { submitQuote, confirmQuote } from '../src/modules/jobs/quote.service';
import { completeJob } from '../src/modules/jobs/complete.service';
import { runDailyPayout } from '../src/modules/payout/payout.service';
import { v4 as uuidv4 } from 'uuid';

async function runE2E() {
    console.log('\n--- STARTING E2E HAPPY PATH FLOW TEST ---');

    // 1. Fetch Kathmandu Zone & Service Type
    const zone = await db('zones').where({ name: 'Kathmandu' }).first();
    if (!zone) throw new Error('Zone Kathmandu not found. Run seeds first.');

    const serviceType = await db('service_types').first();
    if (!serviceType) throw new Error('Service type not found. Run migrations/seeds first.');

    // 2. Generate UUIDs for driver and mechanic
    const driverId = uuidv4();
    const mechanicId = uuidv4();

    console.log(`[E2E] Created Mock Driver ID: ${driverId}`);
    console.log(`[E2E] Created Mock Mechanic ID: ${mechanicId}`);

    // 3. Insert mock driver and mechanic (ensure they are online and in Kathmandu)
    await db('drivers').insert({
        id: driverId,
        full_name: 'E2E Test Driver',
        phone: '9811112222',
        vehicle_type: 'motorcycle',
        vehicle_number: 'BA 2 PA 9999',
    });

    await db('mechanics').insert({
        id: mechanicId,
        full_name: 'E2E Test Mechanic',
        phone: '9800002222',
        rating: 4.9,
        status: 'ONLINE',
        zone_id: zone.id,
        location: db.raw(`ST_SetSRID(ST_MakePoint(85.31, 27.71), 4326)::geography`),
        fcm_token: 'test_e2e_token' // Firebase mock/token
    });

    try {
        // Step 1: Dispatch new job (Driver requests assistance)
        console.log('\n--- STEP 1: DISPATCH NEW JOB ---');
        const dispatchResult = await dispatchNewJob({
            driverId,
            serviceTypeId: serviceType.id,
            lat: 27.71,
            lng: 85.31,
            problemDescription: 'My bike won\'t start, electrical issue.'
        });
        const jobId = dispatchResult.jobId;
        console.log(`[E2E] Job created with ID: ${jobId}`);
        console.log(`[E2E] Mechanics notified count: ${dispatchResult.mechanicsNotified}`);
        console.log(`[E2E] Estimated Fare: NPR ${dispatchResult.estimatedFare}`);

        // Assert job status in database is DISPATCHED
        const jobDispatched = await db('jobs').where({ id: jobId }).first();
        console.log(`[E2E] Job status in database: ${jobDispatched.status}`);
        if (jobDispatched.status !== 'DISPATCHED') throw new Error('Assertion failed: Job should be in DISPATCHED status');

        // Step 2: Accept Job (Mechanic accepts within 300s window)
        console.log('\n--- STEP 2: MECHANIC ACCEPTS JOB ---');
        const acceptResult = await acceptJob(jobId, mechanicId);
        console.log(`[E2E] Accept Result: ${JSON.stringify(acceptResult)}`);
        if (acceptResult.status !== 'ASSIGNED') throw new Error('Assertion failed: Job should be assigned to E2E mechanic');

        const jobAssigned = await db('jobs').where({ id: jobId }).first();
        const mechanicBusy = await db('mechanics').where({ id: mechanicId }).first();
        console.log(`[E2E] Job status after accept: ${jobAssigned.status}`);
        console.log(`[E2E] Mechanic status after accept: ${mechanicBusy.status}`);
        if (jobAssigned.status !== 'ASSIGNED' || mechanicBusy.status !== 'BUSY') {
            throw new Error('Assertion failed: Incorrect status after job accept');
        }

        // Step 3: Mechanic Arrives & Submits Quote (NPR 1200)
        console.log('\n--- STEP 3: MECHANIC SUBMITS QUOTE ---');
        const quoteAmount = 1200;
        const quoteResult = await submitQuote(jobId, mechanicId, quoteAmount);
        console.log(`[E2E] Submit Quote Result: ${JSON.stringify(quoteResult)}`);
        
        const jobQuoted = await db('jobs').where({ id: jobId }).first();
        console.log(`[E2E] Job status: ${jobQuoted.status}, Mechanic Quote: NPR ${jobQuoted.mechanic_quote}`);
        if (jobQuoted.status !== 'QUOTE_PENDING' || Number(jobQuoted.mechanic_quote) !== quoteAmount) {
            throw new Error('Assertion failed: Job quote not submitted correctly');
        }

        // Step 4: Driver Confirms Quote
        console.log('\n--- STEP 4: DRIVER CONFIRMS QUOTE ---');
        const confirmResult = await confirmQuote(jobId, driverId);
        console.log(`[E2E] Confirm Quote Result: ${JSON.stringify(confirmResult)}`);

        const jobConfirmed = await db('jobs').where({ id: jobId }).first();
        console.log(`[E2E] Job status: ${jobConfirmed.status}, Final Amount: NPR ${jobConfirmed.final_amount}`);
        if (jobConfirmed.status !== 'QUOTE_ACCEPTED' || Number(jobConfirmed.final_amount) !== quoteAmount) {
            throw new Error('Assertion failed: Job quote not confirmed correctly');
        }

        // Step 5: Mechanic Completes Job
        console.log('\n--- STEP 5: MECHANIC COMPLETES JOB ---');
        await completeJob(jobId, mechanicId);
        console.log('[E2E] Job completion flow executed.');

        const jobCompleted = await db('jobs').where({ id: jobId }).first();
        const mechanicOnline = await db('mechanics').where({ id: mechanicId }).first();
        const ledgerEntry = await db('mechanic_earnings').where({ job_id: jobId }).first();

        console.log(`[E2E] Job status after completion: ${jobCompleted.status}`);
        console.log(`[E2E] Mechanic status after completion: ${mechanicOnline.status}`);
        console.log(`[E2E] Ledger Earnings - Gross: NPR ${ledgerEntry.gross_amount}, Fee: NPR ${ledgerEntry.platform_fee}, Net: NPR ${ledgerEntry.net_amount}, Status: ${ledgerEntry.payout_status}`);

        const expectedFee = quoteAmount * 0.10; // 10%
        const expectedNet = quoteAmount - expectedFee;
        if (jobCompleted.status !== 'COMPLETED' || mechanicOnline.status !== 'ONLINE') {
            throw new Error('Assertion failed: Incorrect job or mechanic status on completion');
        }
        if (Number(ledgerEntry.gross_amount) !== quoteAmount || Number(ledgerEntry.platform_fee) !== expectedFee || Number(ledgerEntry.net_amount) !== expectedNet) {
            throw new Error('Assertion failed: Ledger earnings calculations incorrect');
        }

        // Step 6: Payout Settlement (Settle at 6 PM batch)
        console.log('\n--- STEP 6: DAILY PAYOUT SETTLEMENT ---');
        const initialBalance = Number(mechanicOnline.wallet_balance);
        console.log(`[E2E] Mechanic initial wallet balance: NPR ${initialBalance}`);

        const payoutResult = await runDailyPayout();
        console.log(`[E2E] Payout Run Result: ${JSON.stringify(payoutResult)}`);

        const mechanicPaid = await db('mechanics').where({ id: mechanicId }).first();
        const ledgerPaid = await db('mechanic_earnings').where({ job_id: jobId }).first();

        const expectedBalance = initialBalance + expectedNet;
        console.log(`[E2E] Mechanic final wallet balance: NPR ${mechanicPaid.wallet_balance} (Expected: ${expectedBalance})`);
        console.log(`[E2E] Ledger Earnings Payout Status: ${ledgerPaid.payout_status}`);

        if (Number(mechanicPaid.wallet_balance) !== expectedBalance || ledgerPaid.payout_status !== 'SETTLED') {
            throw new Error('Assertion failed: Payout not settled correctly to mechanic wallet');
        }

        console.log('\n✅ ALL E2E FLOW STEPS PASSED SUCCESSFULLY!');

    } catch (e: any) {
        console.error('\n❌ E2E TEST FAILED:', e);
    } finally {
        // Clean up database entities
        console.log('\n[E2E] Cleaning up generated entities...');
        await db('mechanic_earnings').where({ mechanic_id: mechanicId }).del();
        await db('jobs').where({ driver_id: driverId }).del();
        await db('drivers').where({ id: driverId }).del();
        await db('mechanics').where({ id: mechanicId }).del();
        console.log('[E2E] Cleanup finished.');
        process.exit(0);
    }
}

runE2E().catch(console.error);
