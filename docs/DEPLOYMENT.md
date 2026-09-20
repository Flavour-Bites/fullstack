# Deployment

## Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- Redis instance (optional, in-memory fallback available)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Google Gemini API Key
- Cloudinary account

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@host/db
TELEGRAM_BOT_TOKEN=your_bot_token
JWT_SECRET=your_secret_key
APP_URL=https://your-domain.com

# Optional (with defaults)
PORT=3000

# Redis (optional - falls back to in-memory)
REDIS_URL=redis://user:pass@host:6379

# Cloudinary (required for image upload)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLOUDINARY_UPLOAD_FOLDER=flavour-bites

# Telegram
TELEGRAM_STAFF_CHAT_ID=staff_chat_id
TELEGRAM_WEBHOOK_SECRET=webhook_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_key

# Frontend — REQUIRED, baked into the JS bundle at build time.
# Absolute URL of the separately-deployed backend (Render). The client only
# talks to this origin; there is no same-origin fallback.
VITE_API_URL=https://flavour-bites-8k5k.onrender.com
```

## Hosting Topology

Although the frontend and backend code live in this one repo, they are deployed and served as **two separate services** with no build-time coupling:

- **Vercel** → hosts the frontend only. It runs `npm run build:client` (`vite build`) and deploys `dist/client/`. It never runs the Express code or the server build.
- **Render** → hosts the backend API only. The Docker image runs `npm run build:server` and never touches the client build, so **no `VITE_API_URL` is needed on Render**.

The frontend bundle must contain the backend's absolute URL, so `VITE_API_URL` is baked into the JS bundle at **Vercel's build time only**:

| Variable | Where to set it | Value |
| --- | --- | --- |
| `VITE_API_URL` | **Vercel project env** → Settings → Environment Variables (scope: Production/Preview/Development) | `https://flavour-bites-8k5k.onrender.com` |
| `FRONTEND_URL` | **Render service env** (backend) — CORS allow-list + Telegram auth redirect target | `https://flavour-bites.vercel.app` |

- Vite inlines `import.meta.env.VITE_API_URL` into the JS bundle during `vite build`. Vercel runs that build, so the value you set in Vercel's Environment Variables is what ships to browsers.
- If the Render backend is unreachable, the client surfaces a real API error (network/HTML responses are normalized to `ApiError`); it never silently falls back to same-origin or to the in-repo Express.
- The backend needs `FRONTEND_URL` so its CORS allow-list (`src/server/platform/config/cors.ts`) and Telegram auth redirects (`auth.controller.ts`) target the real frontend origin.

## Installation

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

## Development

```bash
npm run dev
```

Starts both the Express API (default port 3000) and Vite dev server with HMR.

## Production Build

The client and server build independently, into separate output trees:

```bash
npm run build:client   # dist/client/   → deployed by Vercel
npm run build:server   # dist/server.cjs → run by Render (Docker)
```

`npm run build` runs both for local convenience.

```bash
npm start
```

## Local Production Mimic (docker compose)

`docker-compose.yml` reproduces the deployed topology on one machine:

| Service | Role | Host port |
| --- | --- | --- |
| `frontend` | nginx serving `dist/client/` (like Vercel) | 8080 |
| `backend` | the production Docker image (like Render), API-only | 3000 |
| `db` | PostgreSQL | 5433 |
| `redis` | Redis | 6380 |
| `db-init` | one-shot `prisma db push` for a fresh database | — |
| `seed` | one-shot sample seeder (profile `tools`) | — |

```bash
cp .env.example .env      # then fill in the real secrets
docker compose up --build
docker compose --profile tools run --rm seed   # optional sample data
```

Open http://localhost:8080 — the frontend calls http://localhost:3000.

Notes:

- The backend runs the **production** code path (`NODE_ENV=production`, `node dist/server.cjs`) against the local Postgres/Redis. `ALLOW_LOOPBACK_APP_URL=true` lets the production `APP_URL` guard accept `http://localhost:3000`; it is off by default so real deployments still fail loudly on a loopback URL.
- Cookies are marked `Secure` (and cross-site `SameSite=None`) only when `APP_URL` is HTTPS, so auth/CSRF work over the local plaintext stack.
- Telegram webhook registration is skipped for a loopback `APP_URL`, so this stack never repoints the real bot at localhost.
- `db-init` runs `prisma db push` because the migration history has no baseline (the initial migration only `ALTER`s legacy tables). `docker-entrypoint.sh` then baselines the tracked migrations (P3005), exactly as on Render. The `seed` service uses the `builder` image stage because the runtime image omits `tsx`.
- The stack reads the repo `.env` directly. Values must be parseable by Docker Compose's dotenv parser: keep generated secrets to safe characters (e.g. a 64-char hex string — not a quoted value containing quotes, `{}`, or `#`).

## Telegram Webhook

In production, the bot registers its webhook automatically on startup:

```
POST /bot/webhook
```

The webhook URL is `{APP_URL}/bot/webhook` and is secured with `TELEGRAM_WEBHOOK_SECRET`.

## Database Migrations

```bash
npx prisma db push         # Push schema changes (dev)
npx prisma migrate dev     # Create migration (staging)
npx prisma migrate deploy  # Apply migrations (production)
```

## Deploy Checklist

- [ ] All environment variables configured (no fallback defaults in production)
- [ ] `JWT_SECRET` is strong and unique
- [ ] `NODE_ENV=production` set (enables secure cookies, disables Vite middleware)
- [ ] Database migrated and seeded
- [ ] Telegram webhook secret set
- [ ] Cloudinary credentials configured
- [ ] Redis URL configured (optional but recommended for production)
