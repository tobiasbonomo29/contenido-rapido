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

## AI Video Generation
- The backend now supports provider-based video generation on top of `VideoDraft`.
- Current providers:
  - `openai`: real async generation using OpenAI `sora-2`
  - `mock`: local fallback for development without API keys
  - `auto`: uses `openai` when `OPENAI_API_KEY` is present, otherwise falls back to `mock`
- New environment variables:
  - `APP_BASE_URL=http://localhost:4002`
  - `VIDEO_PROVIDER=auto`
  - `VIDEO_AUTO_GENERATE_ON_APPROVAL=true`
  - `VIDEO_SYNC_MIN_AGE_MS=5000`
  - `OPENAI_API_KEY=...`
  - `OPENAI_VIDEO_MODEL=sora-2`
- Workflow:
  1. Generate a video draft for a content item
  2. Approve the draft
  3. If `VIDEO_AUTO_GENERATE_ON_APPROVAL=true`, the backend automatically starts video generation
  4. Active jobs are synchronized by the scheduler and on API reads

## Social Publishing
- The backend now supports real publishing integrations for:
  - LinkedIn Posts API
  - Facebook Pages feed publishing
- Required environment variables:
  - `FRONTEND_APP_URL=http://localhost:8084`
  - `LINKEDIN_CLIENT_ID=...`
  - `LINKEDIN_CLIENT_SECRET=...`
  - `LINKEDIN_REDIRECT_URI=http://localhost:4002/api/social-connections/oauth/linkedin/callback`
  - `LINKEDIN_API_VERSION=202602`
  - `LINKEDIN_SCOPES=openid,profile,email,w_member_social,w_organization_social,rw_organization_admin`
  - `FACEBOOK_APP_ID=...`
  - `FACEBOOK_APP_SECRET=...`
  - `FACEBOOK_REDIRECT_URI=http://localhost:4002/api/social-connections/oauth/facebook/callback`
  - `FACEBOOK_GRAPH_VERSION=v23.0`
  - `FACEBOOK_SCOPES=pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,publish_video`
- New flow:
  1. Connect a channel from `/canales`
  2. Select the connected account/page in the content scheduler
  3. Schedule the publication
  4. The cron job publishes it automatically through the real provider API
- Current production-safe scope:
  - Text publishing for LinkedIn member/org posts
  - Text/link publishing for Facebook Pages
- Media-native publishing (LinkedIn image/video assets and Facebook photo/video uploads) can be added on top of this base next.

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
