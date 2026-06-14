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
│   ├── api/             # Node.js + Fastify Backend Service
│   ├── dashboard/       # Next.js Web Dashboard for Zone Captains
│   ├── driver/          # React Native Driver App (Planned)
│   └── mechanic/        # React Native Mechanic App (Planned)
├── packages/
│   └── shared/          # Shared Types, API Client, and Constants
├── docker-compose.yml   # Infrastructure setup (Postgres + Redis)
└── plan.md              # Original Architecture Blueprint
```

## 🛠️ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* A Firebase Admin SDK service account key

### 1. Environment Variables
You need to configure environment variables for both the backend and frontend.

#### Backend (`apps/api/.env`)
Create a `.env` file in the `apps/api/` directory:

```env
PORT=8000
NODE_ENV=development

# Database (Ensure PostGIS is enabled)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=mechhub

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase Admin SDK (For Auth and Push Notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
JWT_SECRET="super_secret_jwt_key_that_is_at_least_32_characters_long"
```

#### Frontend Dashboard (`apps/dashboard/.env.local`)
Create a `.env.local` file in the `apps/dashboard/` directory using your Firebase Web SDK config:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws

# Firebase Web App Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
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
cd apps/api
npx knex migrate:latest
npx knex seed:run
cd ../..
```

### 5. Start the Application
You can run the entire monorepo (backend and frontend dashboard concurrently) from the root directory:
```bash
npm run dev
```

## 🧪 Testing

The repository includes a comprehensive End-to-End flow test that simulates job creation, dispatch, mechanic acceptance, quoting, completion, and the 6 PM payout aggregation.

To run the E2E test:
```bash
npx ts-node apps/api/scripts/test_e2e_flow.ts
```