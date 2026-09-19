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

# Frontend (optional — baked into the client bundle at build time)
# Unset → client calls the API on the same origin (default; the server serves
# both /api and the built SPA). Set an absolute URL only when the frontend is
# hosted cross-origin (e.g. Vercel frontend → Render API).
VITE_API_URL=https://flavour-bites-kq9n.onrender.com
```

## Hosting Topology

This repo is one monolith: a single Express server serves both the built SPA (`dist/`) and the `/api` routes. It can be hosted two ways.

### Same-origin (zero frontend config — the default)

Run the whole thing on one origin. The Docker image on Render builds `dist/`, and `createServer.ts` serves it next to `/api`, so the SPA and API share `https://flavour-bites-kq9n.onrender.com`. Leave `VITE_API_URL` unset — the client makes relative `/api` calls. Nothing to configure.

### Cross-origin (Vercel frontend → Render backend)

When the SPA is built and served by Vercel (Vite only) and the API runs on Render, the browser cannot guess the API origin, so the absolute URL must be baked into the bundle at Vercel's build time.

| Variable | Where to set it | Value |
| --- | --- | --- |
| `VITE_API_URL` | **Vercel project env** → Settings → Environment Variables (scope: Production/Preview/Development) | `https://flavour-bites-kq9n.onrender.com` |
| `FRONTEND_URL` | **Render service env** (backend) | `https://flavour-bites.vercel.app` |

- Vite inlines `import.meta.env.VITE_API_URL` into the JS bundle during `vite build`. Vercel runs that build, so the value you set in Vercel's Environment Variables is what ships.
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

```bash
npm run build
```

This produces:
- `dist/` - Vite-built frontend assets
- `dist/server.cjs` - Bundled Express server

```bash
npm start
```

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
