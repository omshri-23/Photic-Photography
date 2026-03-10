# Photic Photography

A modern photography portfolio web app built with React + Vite, backed by Supabase (database + storage) and deployed on Vercel. It includes a public showcase site and an admin workflow for managing portfolio items and contact submissions.

## Live Demo

- Live: `https://photic-photo.vercel.app/` (update if different)
- Repository: `https://github.com/omshri-23/Photic-Photography`

## Features

- Photography-first portfolio experience (images + videos)
- Admin dashboard for adding/publishing/hiding content
- Contact form stored in Supabase
- Vercel Serverless Functions for admin/auth + uploads
- Optional email notifications via Resend

## Tech Stack

- React
- Vite
- Supabase (Postgres + Storage)
- Vercel Functions (`/api/*`)
- Resend (optional)

## Architecture (Quick)

- Frontend: React SPA
- Backend: Vercel Serverless Functions in `api/`
- Data: Supabase tables + storage bucket
- Auth: simple admin login that issues a JWT (stored client-side) and protects admin API routes

## Requirements

- Node.js `^18.0.0 || ^20.0.0 || >=22.0.0`
- npm

## Local Setup

1. Install deps

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Create Supabase schema

- Open Supabase SQL Editor
- Run `supabase/schema.sql`
- Create a storage bucket (default: `portfolio-media`)

4. Run locally

```bash
npm run dev
```

Optional (run Vercel functions locally too):

```bash
vercel dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill values.

Required:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never expose in the browser)
- `SUPABASE_STORAGE_BUCKET` (default: `portfolio-media`)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET` (long random string, used to sign admin JWTs)

Optional:

- `NOTIFY_EMAIL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Deployment (Vercel)

1. Import the repo into Vercel
2. Framework preset: `Vite`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add the environment variables in Vercel (same list as above)
6. Ensure your Supabase schema is applied and your storage bucket exists

## Admin

- Admin route: `/admin`
- Admin APIs live under `api/` and require a valid admin token

## Security Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` private. It must only exist in serverless env vars (Vercel), not client-side code.
- Use a strong `ADMIN_PASSWORD` and a long `ADMIN_TOKEN_SECRET` (rotate if needed).
- If you want stricter protection, add rate limiting and IP allowlisting for admin endpoints.

## License

All rights reserved. See `LICENSE`.
