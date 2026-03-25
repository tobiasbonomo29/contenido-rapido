# Personal Content Management System - Backend

A modular Node.js + Express backend for managing recurring content workflows for LinkedIn and Facebook.

## Tech Stack
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT authentication
- Zod validation
- Multer uploads
- node-cron scheduling

## Setup
1. Install dependencies
   - `npm install`
2. Configure environment variables
   - Copy `.env.example` to `.env` and update values
3. Create database
   - Create a PostgreSQL database named `pcms` (or your preferred name)

## Database
- Run migrations:
  - `npm run migrate`
- Seed demo data:
  - `npm run seed`

## Run Locally
- Development server:
  - `npm run dev`
- Production build:
  - `npm run build`
  - `npm start`

## Test Endpoints
Example login:
```
POST http://localhost:4000/api/auth/login
{
  "email": "demo@pcms.local",
  "password": "password123"
}
```

## Main Architectural Decisions
- Layered architecture with controllers, services, repositories, and validators
- Prisma for data access and migrations
- Zod validation per route and centralized error handling
- Cron-based publication job processing with a service abstraction

## Future Integrations
- Real social platform APIs for publishing
- S3 or cloud storage for uploads
- Production-grade job queue (BullMQ)
- External AI video generation providers
