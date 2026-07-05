# Architecture

## Overview

Flavour Bites is a full-stack bakery order management system with a React SPA frontend, Express API backend, Telegram bot integration, and AI-powered chatbot. The application is structured as a modular monolith with clear domain boundaries.

```
Client (Browser) ──► Express API ──► Prisma ──► PostgreSQL (Neon)
       │                    │
       │              ┌─────┴──────┐
       │              │            │
       ▼              ▼            ▼
  React SPA      Telegram Bot    Gemini AI
  (Vite + HMR)   (grammY +       (Google GenAI)
                  webhooks)
```

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ (ESM) |
| Backend | Express 4 |
| Frontend | React 19, TypeScript, TailwindCSS 4 |
| Build | Vite 6, esbuild |
| Database | PostgreSQL via Neon, Prisma ORM |
| Auth | JWT (httpOnly cookie), bcrypt, Telegram Login Widget |
| Bot | grammY (Telegram), raw fetch API |
| AI | Google Gemini 2.0 Flash |
| Media | Cloudinary |
| Cache | Redis (with in-memory fallback) |
| i18n | Custom (English / Amharic) |

## Project Structure

```
src/
├── app/                  # Core application layer
│   ├── config/           # Prisma client, rate limiter, security
│   ├── middleware/       # Auth, role guard, error handler, validation
│   ├── app.ts            # Express app factory
│   ├── server.ts         # Entry point
│   └── routes.ts         # Route aggregator
├── modules/              # Domain modules (one per bounded context)
│   ├── auth/             # Authentication (Telegram + password)
│   ├── orders/           # Custom cake request lifecycle
│   ├── users/            # User management (admin)
│   ├── categories/       # Cake gallery categories
│   ├── gallery/          # Cake gallery items
│   ├── uploads/          # Image upload to Cloudinary
│   ├── recovery/         # Telegram account recovery
│   ├── reviews/          # Customer reviews
│   ├── stats/            # Admin analytics
│   └── chatbot/          # AI assistant (Gemini)
├── integrations/         # External service adapters
│   ├── telegram/         # Client, webhook, notifications
│   ├── redis/            # Key-value store, conversation state
│   ├── cloudinary/       # Image hosting
│   └── gemini/           # AI client
├── bot/                  # Telegram bot handlers
│   ├── index.ts          # grammY bot setup
│   ├── commands.ts       # /start, /order, /status, /help
│   └── callbacks.ts      # Inline button handlers
├── shared/               # Cross-cutting concerns
│   ├── errors/           # AppError hierarchy
│   └── utils/            # Auth helpers, IDs, analytics
├── components/           # React UI components
├── i18n/                 # Translations (en, am)
├── App.tsx               # Root React component
├── types.ts              # Frontend TypeScript types
└── main.tsx              # React entry point
```

## Module Pattern

Each domain module follows a consistent layered architecture:

```
module/
├── *.routes.ts       # Route definitions + middleware wiring
├── *.controller.ts   # Request/response handling
├── *.service.ts      # Business logic
├── *.repository.ts   # Data access (Prisma queries)
├── *.schemas.ts      # Zod validation schemas
├── *.types.ts        # Module-specific types
└── __tests__/        # Unit tests
```

## Request Lifecycle

```
HTTP Request
  → Express middleware (helmet, cookie-parser, JSON body)
  → Router matching
  → Route-level middleware (auth, role guard, validation)
  → Controller method
  → Service method (business logic)
  → Repository method (Prisma query)
  → JSON Response
  → Error handler (if error thrown)
```

## Key Design Decisions

- **Modular monolith**: Easy to extract into microservices later if needed
- **Controller-Service-Repository**: Clear separation of concerns
- **Custom error hierarchy**: `AppError` → `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ValidationError`
- **Async handler wrapper**: All async routes wrapped to forward errors to global handler
- **Zod validation at route level**: Request body/query/params validated before reaching controller
- **Singleton Prisma**: Single `PrismaClient` instance reused across the app
- **Telegram-first auth**: Primary identity provider via Telegram Login Widget; password as secondary option
