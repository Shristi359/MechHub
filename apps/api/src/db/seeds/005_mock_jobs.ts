import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // TRUNCATE handled by 001_zones.ts
    
    // Get related data to build valid jobs
    const drivers = await knex('drivers').select('id');
    const mechanics = await knex('mechanics').select('id');
    const serviceTypes = await knex('service_types').select('id');
    
    if (drivers.length === 0 || mechanics.length === 0 || serviceTypes.length === 0) {
        console.warn('Skipping jobs seed: Missing required dependencies (drivers, mechanics, or service_types)');
        return;
    }

    const statuses = ['PENDING', 'DISPATCHED', 'ASSIGNED', 'COMPLETED', 'CANCELLED'];
    
    const jobsToInsert = [];
    
    for (let i = 0; i < 50; i++) {
        const driverId = drivers[Math.floor(Math.random() * drivers.length)].id;
        const mechanicId = mechanics[Math.floor(Math.random() * mechanics.length)].id;
        const serviceTypeId = serviceTypes[Math.floor(Math.random() * serviceTypes.length)].id;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Random location in Kathmandu Valley roughly (27.7, 85.3)
        const lat = 27.65 + Math.random() * 0.1;
        const lng = 85.25 + Math.random() * 0.1;
        
        const hoursAgo = Math.floor(Math.random() * 48);
        const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        
        const job: any = {
            driver_id: driverId,
            service_type_id: serviceTypeId,
            problem_description: `Mock Job ${i}: Engine sputtering`,
            location: knex.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [lng, lat]),
            status: status,
            estimated_fare: Math.floor(Math.random() * 2000) + 500,
            dispatch_round: Math.floor(Math.random() * 3) + 1,
            created_at: createdAt
        };
        
        if (status !== 'PENDING') {
            job.mechanic_id = mechanicId;
            if (status === 'COMPLETED') {
                job.completed_at = new Date();
            }
        }
        
        jobsToInsert.push(job);
    }

    await knex('jobs').insert(jobsToInsert);
}
