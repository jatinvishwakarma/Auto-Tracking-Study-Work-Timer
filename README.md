# Jatin Activity Tracker

A productivity and interview-preparation tracking dashboard built with **Next.js 16**, **React 19**, **Prisma 5**, and **NextAuth 5**.

## Features

- **Timer** — Start, pause, resume, and stop work sessions with automatic persistence
- **Projects** — Create and track activity across multiple projects
- **Goals** — Set daily goals with completion tracking
- **Journal** — Log daily reflections and progress
- **DSA Tracker** — Import problems from Excel/CSV, track by difficulty and status
- **Analytics** — Charts visualizing time spent and progress trends
- **Responsive** — Mobile-first design with dedicated mobile navigation
- **Google Sheets Sync** — Optional backup to Google Sheets (disabled by default)

## Tech Stack

| Layer        | Technology                                          |
|--------------|-----------------------------------------------------|
| Framework    | Next.js 16.3.4 (App Router)                         |
| UI           | React 19.2.8, Tailwind CSS, Lucide React            |
| Database     | PostgreSQL (Neon or Supabase)                       |
| ORM          | Prisma 5.20.0                                       |
| Auth         | NextAuth 5 (Credentials Provider)                   |
| Charts       | Recharts                                          |
| Imports      | XLSX, PapaParse                                     |

## Quick Start (Local Development)

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. Run Prisma migrations against your database:

```bash
npx prisma migrate dev --name init
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

### Default Login

- **Password:** Set via `AUTH_PASSWORD` in `.env` (default in example: `change-me`)

## Environment Variables

Copy `.env.example` to `.env.local` (or `.env`) and configure:

```text
# Required
DATABASE_URL              — PostgreSQL connection string (Neon/Supabase)
NEXTAUTH_SECRET           — Random string for session encryption
NEXTAUTH_URL              — App URL (http://localhost:3000 for dev)
AUTH_PASSWORD             — Login password
APP_TIME_ZONE             — IANA timezone (default: Asia/Kolkata)

# Optional (Google Sheets sync)
GOOGLE_SERVICE_ACCOUNT_KEY — Service account JSON as a string
SPREADSHEET_ID             — Google Spreadsheet ID
TIMER_SESSIONS_TAB         — Sheet tab name (default: "Timer Sessions")
DAILY_DASHBOARD_TAB        — Sheet tab name (default: "Daily Dashboard")
```

> **Note:** `NEXTAUTH_SECRET` can be generated with `openssl rand -base64 32`.

## Deployment

The app is serverless-ready and deploys to either **Netlify** (recommended) or **Vercel**.

### Deploy to Netlify (Free)

1. Push your code to a GitHub repository.
2. Go to [https://app.netlify.com](https://app.netlify.com) and sign in with GitHub.
3. Click **"Add new site"** → **"Import an existing project"**.
4. Select your GitHub repository.
5. Netlify auto-detects build settings from `netlify.toml`:
   - Build command: `npx prisma generate && npm run build`
   - Publish directory: `.next`
6. Click **"Show advanced"** → **"Add environment variables"**:
   - `DATABASE_URL` = your PostgreSQL connection string
   - `NEXTAUTH_SECRET` = a random 32+ character string
   - `AUTH_PASSWORD` = your chosen login password
   - `APP_TIME_ZONE` = `Asia/Kolkata`
   - (`NEXTAUTH_URL` can be left blank initially, set after first deploy)
7. Click **"Deploy site"**.
8. After deployment, go to **Site configuration → Environment variables**:
   - Set `NEXTAUTH_URL` to your Netlify site URL.
   - Trigger a redeploy (**Deploys → Trigger deploy → Deploy site**).
9. Open your URL — you're live!

### Deploy to Vercel (Free)

1. Push your code to a GitHub repository.
2. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **"Add New..."** → **"Project"**.
4. Select your GitHub repository.
5. Vercel auto-detects Next.js. Leave defaults.
6. Expand **"Environment Variables"** and add:
   - `DATABASE_URL` = your PostgreSQL connection string
   - `NEXTAUTH_SECRET` = a random 32+ character string
   - `AUTH_PASSWORD` = your chosen login password
   - `APP_TIME_ZONE` = `Asia/Kolkata`
   - (`NEXTAUTH_URL` can be left blank initially)
7. Click **"Deploy"**.
8. After deployment, go to **Settings → Environment Variables**:
   - Set `NEXTAUTH_URL` to your Vercel project URL.
   - Redeploy from the **Deployments** tab.
9. Open your URL — you're live!

### Local Deployment with Docker

Run a local containerized version with PostgreSQL:

```bash
cp .env.example .env.local
# Edit .env.local with your values
docker compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Post-Deployment Checklist

1. HTTPS works (automatic on both Vercel and Netlify)
2. Login works from desktop and mobile browsers
3. Timer start/stop persists across page navigations
4. DSA import works with a test Excel/CSV file
5. Data persists after a redeploy
6. No sensitive data exposed in page source (View Source)

## Project Structure

```
.
├── prisma/
│   └── schema.prisma          # Prisma schema (12 models)
├── src/
│   ├── app/
│   │   ├── (app)/             # Main app routes (timer, analytics, journal, etc.)
│   │   ├── api/               # API routes (timer, goals, dsa, journal, sync)
│   │   ├── login/             # Login page
│   │   └── layout.tsx         # Root layout
│   ├── lib/                   # Auth, DB, utilities
│   ├── components/            # UI components
│   ├── types/                 # TypeScript definitions
│   └── styles/                # Tailwind CSS
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # Favicons and icons
├── data/                      # Legacy data (not used by Next.js app)
├── _archive/                  # Legacy Express code (not maintained)
├── docs/                      # Project documentation
├── netlify.toml               # Netlify configuration
├── vercel.json                # Vercel configuration
└── docker-compose.yml         # Local deployment (PostgreSQL + app)
```

## Troubleshooting

- **Build fails**: Check that all required environment variables are set. TypeScript errors will also fail the build.
- **API routes return 500**: Verify all environment variables are configured correctly.
- **Database connection fails**: Ensure your database allows external connections (Neon and Supabase do by default).
- **Timer doesn't persist**: Check the database connection — try creating a DSA problem to verify.
- **Pages show 404**: Ensure the Next.js build completed successfully.

## License

Private project.
