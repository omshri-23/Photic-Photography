# Photic Photo

React + Vite portfolio rebuild for the original Photic Photo project.

This project is intended to be deployed as a new site, separate from the older static HTML/CSS/JS version.

## Stack

- React + Vite frontend
- Vercel serverless API routes
- Supabase for portfolio items and contact messages
- Resend for optional email notifications

## Local setup

1. Run `npm install`
2. Copy `.env.example` to `.env`
3. Fill in the Supabase and admin credentials
4. Apply `supabase/schema.sql` in the Supabase SQL editor
5. Run `npm run dev` for frontend work
6. Use `vercel dev` if you want local frontend + API route behavior together

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`

## Optional environment variables

- `NOTIFY_EMAIL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Final deployment flow

### 1. Create a new GitHub repository

Use this folder as the source:

- `C:\Users\Lenovo\Photic-Photography`

Suggested commands:

1. `git add .`
2. `git commit -m "Initial React/Vite portfolio rebuild"`
3. Create a new empty GitHub repository
4. `git remote add origin <your-new-github-repo-url>`
5. `git push -u origin main`

### 2. Create a new Supabase project

1. Open Supabase
2. Create a new project
3. Open the SQL editor
4. Paste and run:
   - `supabase/schema.sql`
5. Copy these values from Supabase project settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Create a new Vercel project

Important:

- Do not connect this app to the old Vercel project if you want the old static site to remain unchanged
- Create a completely new Vercel project for this React app

In Vercel:

1. Click `New Project`
2. Import the new GitHub repository for this folder
3. Framework preset: `Vite`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add all required environment variables
7. Deploy

### 4. Add environment variables in Vercel

Required:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`

Optional for email notifications:

- `NOTIFY_EMAIL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### 5. Admin and contact flow

- Admin login route:
  - `/admin`
- Public contact form:
  - saves messages to Supabase
- Admin dashboard:
  - shows contact messages
  - lets you add, hide, publish, or delete media

## Important separation

- Old static portfolio:
  keep it on the old Vercel project
- New React portfolio:
  deploy it as a new Vercel project from this folder

That way the old HTML site remains exactly as it was, and the new React site goes live separately.
