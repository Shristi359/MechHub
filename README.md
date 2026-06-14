# MechHub Nepal

MechHub Nepal is a real-time dispatch and payout infrastructure for roadside assistance mechanics in Nepal. It connects drivers in need with the nearest available mechanics using an event-driven backend, geospatial search, and a simultaneous dispatch system.

## 🚀 Key Features

* **Instant Dispatch Algorithm**: Pings the 3 nearest mechanics simultaneously.
* **Distributed Locking (Redis SETNX)**: Guarantees only one mechanic can claim a job.
* **60-Second Escalation**: Automatically expands the search radius if no mechanic accepts.
* **Daily 6 PM Payouts**: Consistent, automated daily earnings settlement for mechanics to ensure high retention.
* **Zone-Based Management**: Operational monitoring and emergency controls via the Zone Captain Dashboard.

## 🏗️ Architecture

The system is built as a monorepo consisting of:

* **Backend**: Node.js + Fastify (REST API)
* **Database**: PostgreSQL with PostGIS for geospatial queries
* **Caching & Events**: Redis Cluster (Locks, Queues, Pub/Sub streams)
* **Push Notifications**: Firebase Cloud Messaging (FCM)
* **Frontend (Dashboard)**: Next.js + Tailwind CSS (Zone Captain operations)
* **Frontend (Mobile)**: React Native + Expo (Driver App & Mechanic App)

## 📁 Project Structure

```text
MechHub/
├── apps/
│   ├── dashboard/       # Next.js Web Dashboard for Zone Captains
│   ├── driver/          # React Native Driver App (Planned)
│   └── mechanic/        # React Native Mechanic App (Planned)
├── packages/
│   └── shared/          # Shared Types, API Client, and Constants
├── src/                 # Fastify Backend Service
│   ├── modules/         # Domain modules (dispatch, jobs, dashboard, etc.)
│   ├── events/          # Redis Stream publishers and consumers
│   └── db/              # Knex migrations and seeds
├── scripts/             # End-to-end integration tests & load testing
├── docker-compose.yml   # Infrastructure setup (Postgres + Redis)
└── plan.md              # Original Architecture Blueprint
```

## 🛠️ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* A Firebase Admin SDK service account key

### 1. Environment Variables
Create a `.env` file in the root directory based on the following template:

```env
PORT=3000
NODE_ENV=development

# Database (Ensure PostGIS is enabled)
DB_HOST=localhost
DB_PORT=5433
DB_USER=mechhub
DB_PASSWORD=mechhub_secret
DB_NAME=mechhub_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase (For push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

### 2. Start Infrastructure Services
Start the PostgreSQL (with PostGIS) and Redis containers:
```bash
docker-compose up -d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migrations & Seeds
Initialize the database schema and populate it with test zones and mechanics:
```bash
npx knex migrate:latest
npx knex seed:run
```

### 5. Start the Application
Run the backend server:
```bash
npm run dev
```

Run the Zone Captain Dashboard:
```bash
cd apps/dashboard
npm run dev
```

## 🧪 Testing

The repository includes a comprehensive End-to-End flow test that simulates job creation, dispatch, mechanic acceptance, quoting, completion, and the 6 PM payout aggregation.

To run the E2E test:
```bash
npx ts-node scripts/test_e2e_flow.ts
```


1. Administrator Access

Email: admin@mock.local
Password: any
2. Dispatcher Access

Email: dispatcher@mock.local
Password: any
3. Mechanic Access

Email: mechanic@mock.local
Password: any