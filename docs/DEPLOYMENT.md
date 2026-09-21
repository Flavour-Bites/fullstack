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

## Local Development (Docker Postgres + Redis)

For everyday development the dev servers run against a local Postgres + Redis
provided by `docker-compose.dev.yml` (tracked; not used by any deployment).
The dev scripts override `DATABASE_URL`/`REDIS_URL` to point at those
containers, so no `.env` changes are needed.

```bash
npm run dev:db        # start Postgres (5432) + Redis (6379), wait for health
npm run db:push       # first time / after schema changes (no migration baseline yet)
npm run db:seed       # optional sample data
npm run dev           # Vite (localhost:5173) + nodemon API (localhost:3000), both watch
# or individually: npm run dev:web  /  npm run dev:server
```

Notes:

- Host ports are overridable: `DEV_POSTGRES_PORT=5430 DEV_REDIS_PORT=6380 npm run dev:db`
  (e.g. if a system Postgres already owns 5432). Server and `db:push` scripts
  pick up the same override.
- Dev servers are http + loopback: cookies are `Lax`/non-`Secure` and the
  Telegram webhook registration is skipped, so the real bot is never touched.
- `dev:db:down` stops the containers but keeps the data (`down -v` wipes it).
- To archive a deployed-like db check without changing `.env`, run the
  production-mimic stack in `.local/` instead (see below).

## Local Production Mimic

A gitignored, local-only replica of the deployed topology (frontend/nginx like
Vercel, backend like Render, local Postgres + Redis) lives in `.local/`. It is
**not shipped** — `.local/` is excluded from git and every Docker build. It
includes optional cloudflared quick-tunnel mode that reproduces the cross-origin
HTTPS behavior of production (`Secure` + `SameSite=None` cookies, CORS, real
Telegram OIDC + webhook).

See `.local/README.md` for the full guide.

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
