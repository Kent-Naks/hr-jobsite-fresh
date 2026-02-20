# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Talent Africa** is a full-stack HR job listing platform targeting East Africa (currency defaults to KES). It consists of a Next.js 15 frontend (primary application) and a Flask backend (stub/reference API with sample data). All production data flows through the Next.js API routes backed by Prisma + PostgreSQL (Neon).

## Commands

All frontend commands run from the `frontend/` directory:

```bash
# Development
npm run dev           # Start Next.js dev server on port 3000
npm run build         # Production build
npm run lint          # Run ESLint

# Database (Prisma)
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:migrate    # Apply pending migrations (dev)
npm run db:reset      # Reset and re-migrate the database
npm run db:seed       # Seed categories
npm run studio        # Open Prisma Studio (visual DB editor)

# Data Scripts
npm run import:json         # Import JSON data into the DB
npm run export:categories   # Export categories to JSON
```

Backend (from `backend/`):

```bash
python app.py         # Flask dev server (port 8000, debug mode)
docker-compose up     # Run full stack: backend (8000), frontend (3000), Postgres (5432)
```

No test suite is configured.

## Architecture

### Two Separate Applications

**Frontend (`frontend/`)** — The real application. Next.js 15 App Router with React Server Components. Handles all job listings, applications, admin CRUD, and analytics. Connects directly to PostgreSQL via Prisma.

**Backend (`backend/app.py`)** — A Flask stub with in-memory sample data and Swagger docs at `/docs`. Currently not wired to the database and not used by the frontend. It exists as a reference API / development scaffold.

### Frontend Structure

- **`src/app/`** — App Router pages and API routes
  - **Pages**: `/` (home with category grid), `/categories/[slug]` (jobs list), `/jobs/[id]` (job detail + application form), `/about`, `/contact`, `/login`
  - **Admin pages** (protected): `/admin`, `/admin/jobs/new`, `/admin/jobs/[id]`, `/admin/categories`, `/admin/analytics`
  - **API routes**: `/api/jobs`, `/api/categories`, `/api/track`, `/api/stats`, `/api/login`, `/api/logout`, `/api/admin/*`
- **`src/lib/`** — Shared utilities: `prisma.ts` (singleton client), `perfLogger.ts`, `analyticsBuffer.ts`, `validation.ts` (Zod schemas), `exportData.ts`
- **`src/app/components/`** — Shared UI: `Header`, `Footer`, `VideoHero`, `AdSlot` (Google AdSense), `FlashBanner`, `PerfInit`
- **`src/app/data/`** — Static data files

### Database Schema (Prisma)

Four models in `frontend/prisma/schema.prisma`:

- **`Category`** — `id`, `slug` (unique), `label`; has many `Job`s and one `CategoryCount`
- **`Job`** — `id` (cuid), `title`, `description`, `categoryId`, `salaryMin/Max`, `currency` (default: KES), `requireCV`, `requireCoverLetter`, `questions` (JSON), `status` (draft | published | archived), timestamps
- **`AnalyticsEvent`** — session-based page view tracking with geo/device info; unique on `(sessionId, type, path)`
- **`CategoryCount`** — precomputed job count per category (denormalized for performance)

Two database URLs are required: `DATABASE_URL` (pooled via Neon PgBouncer, used by the app) and `DIRECT_URL` (direct connection, used by Prisma migrations).

### Authentication

Middleware at `frontend/src/middleware.ts` guards all `/admin/*` and `/api/admin/*` routes by checking the `admin_session` cookie against the `ADMIN_SESSION_TOKEN` env var (a static secret token, not a JWT).

### Environment Variables

Copy `frontend/.env.example` to `frontend/.env` for local dev. Required vars:

```
DATABASE_URL=      # Neon pooled connection string
DIRECT_URL=        # Neon direct connection string (for migrations)
ADMIN_SESSION_TOKEN=  # Static admin auth token
NEXT_PUBLIC_BASE_URL=  # e.g. http://localhost:3000
```

### Deployment

- **Frontend**: Vercel (auto-deploy from `main`). Build command: `prisma generate && next build`.
- **Backend**: Render.com (service name: `talent-africa-backend`), runs Gunicorn.
- **Local full stack**: `docker-compose up` from repo root (requires Docker).

### Key Patterns

- Prisma client is a global singleton in `frontend/src/lib/prisma.ts` to prevent connection pool exhaustion during HMR. Queries >100ms are logged in development.
- After modifying `frontend/prisma/schema.prisma`, always run `npm run db:generate` before running the app.
- The Prisma schema file path must be specified explicitly in most commands (`--schema prisma/schema.prisma`) because it is not at the default location.
