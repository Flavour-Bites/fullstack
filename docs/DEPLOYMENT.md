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

# Frontend
VITE_TELEGRAM_BOT_USERNAME=flavour_bites_bot
```

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
