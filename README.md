# Flavour Bites

**Designed for moments worth celebrating.** A full-stack custom bakery order management system for a celebration cake business based in Addis Ababa, Ethiopia.

---

## Features

- **Online Ordering** — Custom cake request form with image upload (Cloudinary)
- **Telegram Bot** — Place orders, track status, receive notifications via Telegram
- **Admin Dashboard** — Manage orders, users, gallery, categories, reviews, recovery requests
- **AI Assistant** — Gemini 2.0 Flash-powered chatbot for customer inquiries
- **Staff Notifications** — Real-time Telegram alerts for new orders and status changes
- **Gallery** — Browse cake designs with category filtering, search, tags
- **i18n** — English and Amharic language support
- **Dark Mode** — Light/dark theme toggle with system preference detection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, TailwindCSS 4, Vite 6, React Router 7 |
| Backend | Express 4, Node.js 22+ (ESM) |
| Database | PostgreSQL (Neon), Prisma ORM |
| Auth | JWT (30d), bcrypt (12 rounds), Telegram OIDC (PKCE) |
| Bot | grammY (Telegram) |
| AI | Google Gemini 2.0 Flash |
| Media | Cloudinary (signed direct upload) |
| Cache | Redis (hand-rolled RESP client, in-memory fallback) |
| Tests | Vitest + Testing Library + jsdom |

---

## Quick Start (Local Development with Docker)

### Prerequisites

- **Docker** + **Docker Compose v2** (v2.20+)
- **Node.js 22+** (for local npm commands)
- **pnpm** or **npm** (project uses npm)

### 1. Clone and Install

```bash
git clone <repository-url>
cd flavour-bites
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your local values (see "Environment Variables" below)
# At minimum, you need:
# - DATABASE_URL (provided by docker-compose)
# - REDIS_URL (provided by docker-compose)
# - JWT_SECRET (generate: openssl rand -hex 32)
# - TELEGRAM_BOT_TOKEN (from BotFather)
# - TELEGRAM_WEBHOOK_SECRET (generate: openssl rand -hex 32)
# - TELEGRAM_OPENID_CONNECT_CLIENT_ID (from BotFather OIDC settings)
# - TELEGRAM_OPENID_CONNECT_CLIENT_SECRET (from BotFather)
# - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
# - GEMINI_API_KEY
```

### 3. Start Infrastructure (PostgreSQL + Redis)

```bash
# Start PostgreSQL and Redis containers
docker compose -f docker-compose.dev.yml up -d --wait

# Verify they're healthy
docker compose -f docker-compose.dev.yml ps
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate deploy

# Seed with sample data (categories, gallery, orders, reviews)
npm run db:seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend + frontend concurrently
npm run dev

# OR run separately:
# Terminal 1: Backend only
npm run dev:server
# Terminal 2: Frontend only (Vite HMR)
npm run dev:web
```

**Access:**
- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/health
- Telegram Webhook: http://localhost:3000/api/telegram/webhook

---

## Docker Compose Files

### `docker-compose.dev.yml` — Local Development

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: fb_postgres
    environment:
      POSTGRES_USER: flavour
      POSTGRES_PASSWORD: flavour
      POSTGRES_DB: flavour_bites
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flavour -d flavour_bites"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: fb_redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  pgdata:
  redisdata:
```

### `docker-compose.yml` — Production-like Local Stack

```yaml
version: '3.8'

services:
  # Frontend (nginx serving built SPA)
  frontend:
    build:
      context: .
      dockerfile: .local/Dockerfile.frontend
    container_name: fb_frontend
    ports:
      - "8080:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:3000

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fb_backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - APP_URL=http://localhost:3000
      - FRONTEND_URL=http://localhost:8080
      - DATABASE_URL=postgresql://flavour:flavour@db:5432/flavour_bites
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_WEBHOOK_SECRET=${TELEGRAM_WEBHOOK_SECRET}
      - TELEGRAM_OPENID_CONNECT_CLIENT_ID=${TELEGRAM_OPENID_CONNECT_CLIENT_ID}
      - TELEGRAM_OPENID_CONNECT_CLIENT_SECRET=${TELEGRAM_OPENID_CONNECT_CLIENT_SECRET}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ALLOW_LOOPBACK_APP_URL=true
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    container_name: fb_db
    environment:
      POSTGRES_USER: flavour
      POSTGRES_PASSWORD: flavour
      POSTGRES_DB: flavour_bites
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flavour -d flavour_bites"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: fb_redis
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  pgdata:
  redisdata:
```

### `.local/Dockerfile.frontend` — Frontend Build

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:client

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist/client /usr/share/nginx/html
COPY .local/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `.local/nginx.conf` — SPA + API Proxy

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to backend
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache off;
    }

    # Static assets caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

---

## Environment Variables

Create `.env` from `.env.example` and fill in:

### Required (Infrastructure)

```bash
# Database (provided by docker-compose.dev.yml)
DATABASE_URL=postgresql://flavour:flavour@localhost:5432/flavour_bites

# Redis (provided by docker-compose.dev.yml)
REDIS_URL=redis://localhost:6379

# Prisma
PRISMA_CLIENT_ENGINE_TYPE=binary
```

### Required (Auth & Security)

```bash
# Generate with: openssl rand -hex 32
JWT_SECRET=your-64-char-hex-secret

# Generate with: openssl rand -hex 32
TELEGRAM_WEBHOOK_SECRET=your-32-char-hex-secret

# From BotFather > Bot Settings > OIDC
TELEGRAM_OPENID_CONNECT_CLIENT_ID=your-bot-id
TELEGRAM_OPENID_CONNECT_CLIENT_SECRET=your-oidc-secret

# Bot token from BotFather
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# Optional: staff group chat ID for notifications
TELEGRAM_STAFF_CHAT_ID=-1001234567890
```

### Required (External Services)

```bash
# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_FOLDER=flavour-bites

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

### App Configuration

```bash
# Backend URL (used by frontend for API calls)
VITE_API_URL=http://localhost:3000

# Frontend URL (used by backend for CORS, cookies)
FRONTEND_URL=http://localhost:5173

# Backend public URL (used for webhooks, OIDC redirects)
APP_URL=http://localhost:3000

# Allow http://localhost for cookies in dev
ALLOW_LOOPBACK_APP_URL=true

# Node environment
NODE_ENV=development
```

### Redis Configuration

```bash
# TTL for OIDC state (seconds)
REDIS_CONVERSATION_TTL_SECONDS=600

# TTL for price conversations (seconds)
REDIS_PRICE_TTL_SECONDS=1800
```

### Optional

```bash
# Cloudinary upload folder
CLOUDINARY_UPLOAD_FOLDER=flavour-bites

# Redis ports (if not default)
DEV_POSTGRES_PORT=5432
DEV_REDIS_PORT=6379

# Email/SMS (future)
# EMAIL_API_KEY=
# SMS_API_KEY=
```

---

## Running with Docker Compose (Full Stack)

### Development Mode (Hot Reload)

```bash
# Start infrastructure only
docker compose -f docker-compose.dev.yml up -d --wait

# Run migrations + seed
npx prisma migrate deploy
npm run db:seed

# Start dev servers (separate terminals)
npm run dev:server  # Backend on :3000
npm run dev:web     # Frontend on :5173 (Vite HMR)
```

### Production-like Local (Full Docker)

```bash
# Build and start all services
docker compose up --build -d

# Run migrations inside backend container
docker compose exec backend npx prisma migrate deploy

# Seed data
docker compose exec backend npm run db:seed

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

**Access:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

---

## Database Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create migration (after schema changes)
npx prisma migrate dev --name descriptive_name

# Deploy migrations (production/CI)
npx prisma migrate deploy

# Push schema without migration (dev only)
npx prisma db push

# Open Prisma Studio (GUI)
npx prisma studio

# Seed database
npm run db:seed

# Reset database (dev only - destroys data)
npx prisma migrate reset --force
```

---

## Telegram Bot Setup (Local Development)

### 1. Create Bot via BotFather

```
/newbot
# Follow prompts, get BOT_TOKEN
```

### 2. Configure OIDC (for web login)

In BotFather:
```
/setdomain yourdomain.com (or use cloudflared tunnel for local)
/setoauthcallback https://your-tunnel-url/api/auth/telegram/callback
```

### 3. For Local Development (using cloudflared)

```bash
# Terminal 1: Start cloudflared tunnel
cloudflared tunnel --url http://localhost:3000

# Copy the https URL (e.g., https://abc123.trycloudflare.com)
# Update .env:
# APP_URL=https://abc123.trycloudflare.com
# FRONTEND_URL=https://abc123.trycloudflare.com (or keep localhost:5173 for Vite)

# Update OIDC callback in BotFather:
# https://abc123.trycloudflare.com/api/auth/telegram/callback
```

### 4. Test Bot Commands

```
/start           # Welcome + deep-link to order
/status          # Your active orders
/order           # Start new order conversation
/help            # All commands
```

---

## Cloudinary Setup

1. Create account at cloudinary.com
2. Get credentials from Dashboard
3. Add to `.env`:
   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLOUDINARY_UPLOAD_FOLDER=flavour-bites
   ```

---

## Running Tests

```bash
# All tests (357)
npm test

# Client only (108 tests)
npm run test:client

# Server only (208 tests)
npm run test:server

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

---

## Useful Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev (client + server concurrently) |
| `npm run dev:server` | Backend only (tsx, nodemon) |
| `npm run dev:web` | Frontend only (Vite HMR) |
| `npm run build` | Build client + bundle server |
| `npm run build:client` | Build SPA for Vercel |
| `npm run build:server` | Bundle server with esbuild |
| `npm start` | Run production build |
| `npm run preview:build` | Build for preview (production-shaped) |
| `npm run preview:start` | Run preview build |
| `npm run preview:dev` | Preview with tsx |
| `npm test` | All tests (357) |
| `npm run test:client` | Client tests only |
| `npm run test:server` | Server tests only |
| `npm run lint` | TypeScript type check |
| `npm run db:seed` | Seed database |
| `npm run clean` | Remove dist/ |

---

## Project Structure

```
flavour-bites/
├── .local/                    # Local Docker files (gitignored)
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── seed/                  # Seed scripts
├── public/                    # Static assets + PWA/SEO
│   ├── manifest.json          # PWA manifest
│   ├── robots.txt
│   ├── sitemap.xml
│   └── *.png                  # Gallery/hero images
├── src/
│   ├── client/                # React SPA
│   │   ├── app/               # App root, providers, routing
│   │   ├── features/          # Feature modules
│   │   │   ├── admin/         # Admin dashboard (7 tabs)
│   │   │   ├── auth/          # Login, OIDC, profile
│   │   │   ├── chatbot/       # Gemini AI assistant
│   │   │   ├── gallery/       # Public gallery
│   │   │   ├── orders/        # Order form, tracking, admin
│   │   │   └── ...            # contact, profile, recovery
│   │   ├── components/        # Shared UI components
│   │   ├── lib/               # HTTP client, token storage, query client
│   │   └── platform/          # Client env, i18n
│   ├── server/                # Express API + Telegram bot
│   │   ├── api/               # HTTP boundary (routes, controllers)
│   │   ├── modules/           # Domain modules
│   │   │   ├── auth/          # Telegram OIDC, JWT, sessions
│   │   │   ├── orders/        # CRUD, state machine, audit
│   │   │   ├── gallery/       # Cloudinary + CRUD
│   │   │   ├── reviews/       # Public + admin
│   │   │   ├── users/         # Role management
│   │   │   └── ...            # categories, stats, recovery, contact
│   │   ├── platform/          # Config, middleware, Redis, Prisma
│   │   └── bot/               # grammY Telegram bot
│   └── shared/                # Cross-cutting code
│       ├── api/               # ApiResponse, ApiError, helpers
│       ├── constants/         # Business info, status styles
│       ├── types/             # Shared TypeScript types
│       └── utils/             # Auth, ids, dates, status styles
├── docker-compose.dev.yml     # Dev infrastructure (PG + Redis)
├── docker-compose.yml         # Full local stack
├── .local/                    # Local Docker files
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── .env.example               # Environment template
├── package.json
└── tsconfig.json
```

---

## Common Issues & Fixes

### Port Conflicts

```bash
# If 5432/6379/3000/5173 in use:
# Change ports in docker-compose.dev.yml or kill existing processes
lsof -i :5432
kill -9 <PID>
```

### Prisma Migration Issues

```bash
# If migration fails on fresh DB:
npx prisma migrate reset --force
npx prisma migrate deploy
```

### Telegram Webhook Fails

```bash
# Check webhook URL is https and accessible
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://your-tunnel.trycloudflare.com/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

### Redis Connection Refused

```bash
# Ensure Redis container is healthy
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs redis
```

### Cloudinary Upload Fails

```bash
# Verify credentials in .env
# Check CLOUDINARY_UPLOAD_FOLDER exists (auto-created)
```

---

## Production Deployment Checklist

- [ ] `npm run lint` passes
- [ ] `npm test` passes (357 tests)
- [ ] `npm run build` succeeds
- [ ] `npx prisma migrate deploy` on fresh DB
- [ ] `npm run db:seed` works
- [ ] Environment variables set in hosting platform
- [ ] Telegram webhook registered with production URL
- [ ] Cloudinary upload preset configured
- [ ] SSL/TLS certificates valid
- [ ] CSP headers include all external domains
- [ ] Rate limiting configured
- [ ] Monitoring/alerting set up

---

## License

Private — Flavour Bites