import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // TRUNCATE handled by 001_zones.ts

    // Inserts seed entries
    await knex('drivers').insert([
        {
            id: 'd1000000-0000-0000-0000-000000000001',
            full_name: 'Rahul Shrestha',
            phone: '+9779841000001',
            vehicle_type: 'CAR',
            vehicle_number: 'BA 21 PA 1111'
        },
        {
            id: 'd2000000-0000-0000-0000-000000000002',
            full_name: 'Sita Sharma',
            phone: '+9779801000002',
            vehicle_type: 'SUV',
            vehicle_number: 'BA 22 PA 2222'
        },
        {
            id: 'd3000000-0000-0000-0000-000000000003',
            full_name: 'Nabin Thapa',
            phone: '+9779851000003',
            vehicle_type: 'BIKE',
            vehicle_number: 'BA 23 PA 3333'
        },
        {
            id: 'd4000000-0000-0000-0000-000000000004',
            full_name: 'Anita Gurung',
            phone: '+9779811000004',
            vehicle_type: 'CAR',
            vehicle_number: 'BA 24 PA 4444'
        },
        {
            id: 'd5000000-0000-0000-0000-000000000005',
            full_name: 'Ramesh Maharjan',
            phone: '+9779861000005',
            vehicle_type: 'TRUCK',
            vehicle_number: 'BA 25 PA 5555'
        }
    ]);
}
