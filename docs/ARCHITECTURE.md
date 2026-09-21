# Architecture

## Overview

Flavour Bites is a full-stack bakery order management system with a React SPA frontend, Express API backend, Telegram bot integration, and AI-powered chatbot. The application is structured as a modular monolith with clear domain boundaries and shared types/constants between client and server.

```
Client (Browser) ──► Express API ──► Prisma ──► PostgreSQL (Neon)
       │                    │
       │              ┌─────┴──────┐
       │              │            │
       ▼              ▼            ▼
  React SPA      Telegram Bot    Gemini AI
  (Vite + HMR)   (grammY)        (Google GenAI)
```

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ (ESM) |
| Backend | Express 4 |
| Frontend | React 19, TypeScript, TailwindCSS 4 |
| Build | Vite 6, esbuild |
| Database | PostgreSQL via Neon, Prisma ORM |
| Auth | JWT (httpOnly cookie), bcrypt, Telegram OIDC |
| Bot | grammY (Telegram), raw fetch API |
| AI | Google Gemini 2.0 Flash |
| Media | Cloudinary |
| Cache | Redis (with in-memory fallback) |
| i18n | Custom (English / Amharic) |

## Project Structure

```
src/
├── server/                    # Express backend
│   ├── core/                  # App factory + entry point
│   │   ├── createServer.ts
│   │   └── server.ts
│   ├── api/                   # HTTP boundary (thin)
│   │   ├── routes.ts          # Route aggregator
│   │   ├── routes/            # Per-module route definitions
│   │   └── controllers/       # Request/response handling
│   ├── modules/               # Domain modules (one per bounded context)
│   │   ├── auth/              # Authentication (Telegram OIDC + password)
│   │   ├── orders/            # Custom cake request lifecycle
│   │   ├── users/             # User management (admin)
│   │   ├── categories/        # Cake gallery categories
│   │   ├── gallery/           # Cake gallery items
│   │   ├── uploads/           # Image upload to Cloudinary
│   │   ├── recovery/          # Telegram account recovery
│   │   ├── reviews/           # Customer reviews
│   │   ├── stats/             # Admin analytics
│   │   ├── chatbot/           # AI assistant (Gemini)
│   │   └── contact/           # Contact form submissions
│   ├── platform/              # Cross-cutting infrastructure
│   │   ├── config/            # Prisma client, env, CORS, CSRF, security
│   │   ├── middleware/        # Auth, role guard, error handler, validate
│   │   ├── errors/            # AppError hierarchy
│   │   └── integrations/      # External service adapters
│   │       ├── telegram/      # Client, webhook, notifications
│   │       ├── redis/         # Key-value store, conversation state
│   │       ├── cloudinary/    # Image hosting
│   │       └── gemini/        # AI client
│   └── bot/                   # Telegram bot handlers
│       ├── index.ts           # grammY bot setup
│       ├── commands.ts        # /start, /order, /status, /help
│       ├── callbacks.ts       # Inline button handlers
│       └── inline.ts          # Inline query handlers
├── client/                    # React SPA
│   ├── app/                   # App composition root
│   │   ├── App.tsx            # Routing composition
│   │   └── providers/         # Auth, theme, locale, cake-selection
│   ├── features/              # Domain UI (one per bounded context)
│   │   ├── admin/             # Admin workspace
│   │   ├── auth/              # Sign-in
│   │   ├── categories/        # Category data hooks
│   │   ├── chatbot/           # AI assistant widget
│   │   ├── contact/           # Contact page
│   │   ├── core/              # Home, about, testimonials, help
│   │   ├── gallery/           # Cake gallery
│   │   ├── orders/            # Request form, my orders, tracking
│   │   ├── recovery/          # Account recovery
│   │   ├── reviews/           # Review data hooks
│   │   ├── search/            # Global cake search
│   │   └── users/             # Profile
│   ├── components/            # Shared presentational components
│   ├── i18n/                  # Translations (en, am)
│   ├── lib/                   # HTTP client, token storage
│   ├── platform/config/       # Client env loading
│   ├── styles/                # Tailwind entry
│   └── main.tsx               # React entry point
└── shared/                    # Cross-cutting concerns (client + server)
    ├── api/                   # ApiResponse types
    ├── constants/             # Business info, order status labels/emoji
    ├── types/                 # Shared domain types (User, Order, etc.)
    └── utils/                 # Pure helpers (status styles, formatting)
```

## Server Module Pattern

Each domain module follows a consistent layered architecture; HTTP lives at the boundary, business logic in services, persistence in repositories:

```
src/server/
├── api/routes/<module>.routes.ts     # Route definitions + middleware wiring
├── api/controllers/<module>.controller.ts  # Request/response handling
└── modules/<module>/
    ├── *.service.ts      # Business logic
    ├── *.repository.ts   # Data access (Prisma queries)
    ├── *.schemas.ts      # Zod validation schemas
    ├── *.types.ts        # Module-specific types
    ├── *.workflow.ts     # Domain state machines (e.g. order status)
    └── tests/            # Unit tests
```

Requests flow **inward**: route → middleware (auth, role, validation) → controller → service → repository → Prisma. Controllers depend on services, services depend on schemas for types, and repositories own all Prisma access. Higher layers never reach back into HTTP concerns.

## Client Pattern

Client code is organized by **responsibility**, not type. Each feature owns its UI and state:

```
features/<domain>/
├── components/       # Presentational components
│   └── <area>/       # Sub-folder per decomposed view surface
├── hooks/            # Stateful logic (data fetching, form state)
├── utils/            # Feature-specific helpers
└── tests/            # Component tests
```

Cross-cutting, app-wide state lives in `app/providers/` (Auth, Theme, Locale, CakeSelection) and is consumed through typed context hooks at the composition root (`App.tsx`). Views are composition roots that wire feature hooks to presentational components; business logic does not live inside JSX.

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
- **Controller-Service-Repository**: Clear separation of concerns; HTTP is a thin boundary
- **Custom error hierarchy**: `AppError` → `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ValidationError`
- **Async handler wrapper**: All async routes wrapped to forward errors to global handler
- **Zod validation at route level**: `validate()` middleware replaces `req.body` with parsed data before the controller; services consume schema-inferred types
- **Order status is a single domain concept**: `OrderStatus` (shared types) uses the canonical `InProgress` key; emoji/labels (notifications), badge colors/icons (admin UI), and workflow transitions are separate presentation/domain maps keyed consistently
- **Singleton Prisma**: Single `PrismaClient` instance reused across the app
- **Telegram-first auth**: Primary identity provider via Telegram OIDC; password as secondary option