---
title: Flavour Bites — Full Project Audit
type: review
date: 2026-09-16
branch: fix/review-page
category: project-audit
tags:
  - flavour-bites
  - audit
  - project-review
  - restart-guide
status: draft
---

# 🎂 Flavour Bites — Full Project Audit

> [!tldr] What This Is
> A comprehensive deep-dive audit of the **Flavour Bites** full-stack bakery order management system. Everything you need to know to restart the project after a long hiatus: what's finished, what's started, what's faked, code quality, architecture, and a prioritized restart plan.
>
> **Audited:** 2026-09-16 · **Branch:** `fix/review-page` · **Version:** 0.0.0 (never released)

---

## 🗂️ Table of Contents

- [Project Snapshot](#📋-project-snapshot)
- [Feature Status Matrix](#✅-feature-status-matrix)
- [Backend — Fully Implemented](#🟢-backend--fully-implemented)
- [Frontend — Fully Implemented](#🟢-frontend--fully-implemented)
- [Partially Implemented](#🟡-partially-implemented)
- [Fake / Placeholder Data](#🔴-fake--placeholder-data)
- [Planned Features](#🔮-planned-features)
- [Critical Issues](#🚨-critical-issues)
- [Code Quality Assessment](#📐-code-quality-assessment)
- [Git State](#🌿-git-state)
- [Restart Plan](#🚀-restart-plan)

---

## 📋 Project Snapshot

| Attribute | Value |
|-----------|-------|
| **Product** | Custom bakery order management system (Addis Ababa, Ethiopia) |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Vite 6, React Router v7 |
| **Backend** | Express 4, Node.js (ESM), Zod v4 |
| **Database** | PostgreSQL (Neon) + Prisma ORM |
| **Auth** | JWT, bcrypt, Telegram OIDC (PKCE), password fallback |
| **Bot** | grammY (Telegram) |
| **AI** | Google Gemini 2.0 Flash |
| **Media** | Cloudinary (signed uploads) |
| **Cache/State** | Redis (hand-rolled client, in-memory fallback) |
| **Tests** | Vitest, 52 test files |
| **i18n** | Custom `t()` — English + Amharic |
| **Version** | 0.0.0 — **never formally released** |
| **Current Branch** | `fix/review-page` |

> [!info] Architecture Pattern
> Feature-based modules: `src/features/<name>/api/` (routes → controller → service → repository + schemas + types). Frontend mirrors per-feature: `components/` + `hooks/`. This pattern is **consistent and clean across all 11 backend modules.**

---

## ✅ Feature Status Matrix

> [!abstract] Legend
> - 🟢 **DONE** — real DB, real API, real integration
> - 🟡 **PARTIAL** — some real, some static/fallback
> - 🔴 **FAKE** — static/hardcoded data, no API
> - 🔮 **PLANNED** — not started

| Feature | Backend | Frontend | Bot | Tests |
|---------|:-------:|:--------:|:---:|:-----:|
| User auth (Telegram OIDC + password) | 🟢 | 🟢 | — | 🟢 |
| Custom cake ordering form | 🟢 | 🟢 | 🟢 | 🟢 |
| Order status management | 🟢 | 🟢 (admin) | 🟢 | 🟢 |
| Admin dashboard (stats/revenue) | 🟢 | 🟢 | — | 🟢 |
| Admin order CRUD | 🟢 | 🟢 | — | 🟢 |
| Admin gallery CRUD | 🟢 | 🟢 | — | ⚪ |
| Admin category CRUD | 🟢 | 🟢 | — | ⚪ |
| Admin user management | 🟢 | 🟢 | — | 🟢 |
| Admin review management | 🟢 | 🟢 | — | ⚪ |
| Account recovery via Telegram | 🟢 | 🟢 | — | 🟢 |
| Image upload (Cloudinary) | 🟢 | 🟢 | — | ⚪ |
| AI chatbot (Gemini) | 🟢 | 🟢 | — | 🟢 |
| Contact form → Telegram fan-out | 🟢 | 🟡 | — | 🟢 |
| Telegram bot commands & flows | 🟢 | — | 🟢 | 🟢 |
| Telegram staff notifications | 🟢 | — | 🟢 | 🟢 |
| i18n (EN/AM) | — | 🟢 | — | ⚪ |
| Dark mode + theme | — | 🟢 | — | ⚪ |
| CSRF protection | 🟢 | 🟡 | — | ⚪ |
| Rate limiting | 🟢 | — | — | ⚪ |
| My Orders page | 🔴 API exists | 🔴 | — | ⚪ |
| Public gallery page | 🟢 API exists | 🟡 | — | ⚪ |
| Global search | 🔴 API missing | 🔴 | — | ⚪ |
| Testimonials page | 🟢 API exists | 🔴 | — | ⚪ |
| About / Help pages | — | 🔴 static | — | ⚪ |

> [!warning] The Critical Pattern
> **The backend is ~100% finished. The frontend is the weak spot.** Real APIs exist for gallery, reviews, orders, and search — but the public-facing pages mostly read hardcoded arrays from `src/data.ts` instead of calling them.

---

## 🟢 Backend — Fully Implemented

> All 11 API modules use **real Prisma queries, real validation, real Telegram calls.** No backend module is mocked.

### 🗂️ Auth — `src/features/auth/api/`
- ✅ Real Telegram **OIDC + PKCE** flow (discovery, JWKS verification, nonce, state)
- ✅ Real JWT (30d) + bcrypt (12 rounds) password login
- ✅ State stored in Redis with 10-min TTL, single-use
- ✅ 9 endpoints: telegram login/callback/finalize, password, telegram-password, logout, me
- ⚠️ OIDC discovery cached forever (no invalidation)
- ⚠️ Missing client ID throws plain `Error` → 500

### 🗂️ Orders — `src/features/orders/api/`
- ✅ **Richest module** (9 files) — CRUD, status state machine, audit trail
- ✅ Real Prisma `$transaction` for status change + `OrderStatusEvent` audit row
- ✅ Auto-promotes to `Quoted` when price set
- ✅ Real Telegram notifications on create / status change / quote accepted
- ✅ Idempotent same-status updates, soft-delete guards
- ⚠️ **Duplication:** `orders.operations.ts` (~95% copy of `orders.repository.ts`) used by the bot
- ⚠️ `updateOrderSchema` defined but **never used** in routes — PATCH accepts arbitrary body

### 🗂️ Other Backend Modules

| Module | Status | Highlights | Caveats |
|--------|:------:|-----------|---------|
| Users | 🟢 | Good business rules (can't demote yourself/last admin/self-delete) | plain `Error` → 500 |
| Categories | 🟢 | Auto slug generation | `as any` cast + **mass-assignment risk** |
| Gallery API | 🟢 | Cloudinary delete wired on item delete | fallback to hardcoded Unsplash URL |
| Uploads | 🟢 | Direct Cloudinary proxy, SHA-1 signed, 10MB limit | `raw` body instead of multipart |
| Reviews | 🟢 | Rating 1-5, defaults for event/role/date (Addis TZ) | delete missing → 500 (P2025); spread body |
| Stats | 🟢 | 5 real aggregate queries via `Promise.all` | — |
| Recovery | 🟢 | Real Telegram send to old ID; dup-request guard | — |
| Contact | 🟢 | `Promise.allSettled` fan-out, HTML-escaped | duplicated `getStaffChatIds` |
| Chatbot | 🟢 | Real Gemini 2.0 Flash, role mapping, 20 msg limit | missing key → 500 |

### 🗂️ Infrastructure

| Component | Status | Notes |
|-----------|:------:|-------|
| **Helmet + CSP** | 🟢 | Detail-allowlisted Google/Telegram/Cloudinary/Unsplash |
| **CSRF** | 🟢 backend | double-submit cookie, httpOnly, secure in prod |
| **Rate limiting** | 🟢 | 4 limiters (auth/password/chat/recovery) |
| **Env validation** | 🟢 | Rejects weak JWT_SECRET + placeholder APP_URL |
| **DB health check** | 🟢 | 5 retries / 5s for Neon cold starts |
| **Graceful shutdown** | 🟢 | 10s force-timeout SIGTERM/SIGINT |
| **Redis** | 🟢 | Hand-rolled RESP client, in-memory fallback |
| **Telegram webhook** | 🟢 | Timing-safe secret verification |

---

## 🟢 Frontend — Fully Implemented

- 🟢 **AuthView** — real OIDC redirect + password login + register
- 🟢 **RequestFormView** — multi-step wizard, real `apiFetch`, Cloudinary upload
- 🟢 **RequestSuccessView** — success state
- 🟢 **ReferenceImageUploader** — Cloudinary direct upload
- 🟢 **OrderTrackingView** — real order timeline (data from parent route)
- 🟢 **ALL 7 Admin tabs** — Dashboard, Orders, Menu, Categories, Reviews, Users, Recovery (live CRUD)
- 🟢 **All 7 data hooks** — `useOrders`, `useGallery`, `useCategories`, `useReviews`, `useUsers`, `useRecovery`, `useAdminData`
- 🟢 **Shared UI** — Header, Footer, Toast (5 types), Skeleton, ErrorBoundary, ProtectedRoute, AnimatedPage, NotFound

---

## 🟡 Partially Implemented

> These components mostly work but mix real API calls with static fallback data.

| Component | What's Real | What's Fake |
|-----------|-------------|-------------|
| **HomeView** | Hero dynamic; fetches `/api/gallery` | Testimonials + FAQs from `data.ts` |
| **GalleryView** | Fetches `/api/gallery` | Falls back to static `GALLERY_ITEMS` |
| **CakeAssistantBot** | Real `/api/chat` calls | Graceful offline/error banner |
| **ContactView** | Form submits via API | Studio location & contact info |
| **ProfileView** | Has update API call | Some save behavior local-only |

---

## 🔴 Fake / Placeholder Data

> [!danger] THE FAKE-DATA MAP
> All static data lives in **`src/data.ts`** and is imported by 6 components. The real APIs exist behind them — they're just not wired up.

| Component | Shows | Fake Source | Real API That Exists But Isn't Used |
|-----------|-------|-------------|-------------------------------------|
| **MyOrdersView** | User's orders | `SIMULATED_ORDERS` hardcoded | `GET /api/requests` ✅ exists |
| **TestimonialsView** | Customer reviews | `TESTIMONIALS` from `data.ts` | `GET /api/reviews` ✅ exists |
| **HelpView** | FAQs | `FAQS` from `data.ts` | none — static content OK |
| **AboutView** | Ingredients/story | `INGREDIENT_SPOTLIGHTS` from `data.ts` | none — static content OK |
| **SearchModal** | Global search | Searches static `GALLERY_ITEMS` + `FAQS` | No search API exists — needs one |
| **RequestSidebar** | Step indicator | Hardcoded text | none meaningful |

> [!note] Static pages are fine
> About / Help are *supposed* to be static. Don't add API calls there. The real problems are **MyOrdersView** (fake orders shown to customers — top of the restart list) and **SearchModal** (searches 9 gallery items instead of the real catalog).

---

## 🔮 Planned Features

> [!example] What Was Planned (from `docs/FUTURE_FEATURES.md` + code archaeology)

| Feature | Status | Evidence |
|---------|:------:|----------|
| **Chapa payment integration** | 🔮 v2 | DB fields exist (`depositAmount`, `paymentStatus`, etc.); payment module stubbed but **not routed**; `cleanup/payment-removal` branch exists |
| **Email notifications** | 🔮 | Mentioned in FUTURE_FEATURES.md |
| **SMS notifications** | 🔮 | Mentioned in FUTURE_FEATURES.md |
| **Amharic chatbot** | 🔮 | Mentioned in FUTURE_FEATURES.md |
| **Order analytics dashboard** | 🔮 partial | Stats API exists (revenue/counts); richer charts/trends not built |
| **Customer portal** (reorder/favorites) | 🔮 | Mentioned in FUTURE_FEATURES.md |
| **Brand assets** (favicon, logo, real socials) | 🔮 | `public/` has only 5 PNGs; `business.ts` uses `@flavourbites_placeholder` |
| **OIDC migration** | ✅ **already done** | Backend uses OIDC; `openidconnect.md` is the (now implemented) guide |

> [!tip] Decision point
> `cleanup/payment-removal` branch suggests someone considered **removing** payment fields. Decide **once**: keep payment fields for Chapa v2, or remove them now. Don't leave half-committed schema.

---

## 🚨 Critical Issues

> [!danger] #1 — CSRF Contract Broken (HIGHEST PRIORITY)
> The backend enforces `doubleCsrfProtection` on **all** `/api` mutations, but the frontend hooks use raw `fetch` **without** `x-csrf-token` (and without credentials). Only `RequestFormView` uses the CSRF-aware `apiFetch`.
>
> **Affected:** admin CRUD, contact form, chat, profile update, logout.
> **Effect:** mutations likely fail → CSRF error maps to 500 → user sees "Internal server error".
> **File refs:** backend `src/app/config/csrf.ts` · frontend `src/shared/utils/apiClient.ts:30-46` vs `src/features/admin/components/useAdminData.ts:13`, `src/features/orders/hooks/useOrders.ts:16`, etc.
> **Fix:** make all hooks use `apiFetch` (single centralized client).

> [!danger] #2 — Mass-Assignment Risk
> Staff-level update endpoints spread the raw request body into Prisma with **no field whitelist**.
> **File refs:** `categories.service.ts:8` (`as any` cast), `categories.repository.ts:41`, `gallery.service.ts`, `reviews.repository.ts:43`
> **Fix:** whitelist updatable fields in the service layer.

> [!warning] #3 — Broken Test Scripts
> `test:auth`, `test:orders`, `test:reviews`, etc. in `package.json` point to `src/tests/modules/*` which **does not exist**. Actual tests live in `src/test/` + `src/features/*/tests/`. Only `npm test` (full run) works.

> [!warning] #4 — Order Logic Duplicated
> `orders.operations.ts` duplicates ~95% of `orders.repository.ts`. Bot uses operations; API uses repository. Two sources of truth for the order state machine.

> [!warning] #5 — Generic Errors → 500
> Business rules throw plain `Error` instead of `ValidationError`/`NotFoundError` in several services (`auth.service:52`, `orders.service:126-130, 137`, `users.service:11-18`). No Prisma `P2025` mapping → delete/get-missing → 500 instead of 404.

---

## 📐 Code Quality Assessment

> [!success] Strengths
> - ✅ **Consistent module pattern** across all 11 backend modules
> - ✅ **Real security posture**: PKCE, timing-safe comparisons, env validation, rate limits, CSP
> - ✅ **Clean error hierarchy** (`AppError` + 4 typed subclasses)
> - ✅ **Broad test coverage**: 52 files across most modules
> - ✅ **Realistic, idempotent seed**: 4 categories, 9 gallery items, 3 Ethiopian-context orders
> - ✅ **Purpose-built integrations** — custom Redis client, centralized HTTP client
> - ✅ **DB resilience**: Neon cold-start retry + graceful shutdown
> - ✅ **Zero TODO/FIXME/HACK comments** in the codebase

> [!failure] Weaknesses
> - ❌ CSRF contract mismatch (see Critical Issues)
> - ❌ Mass-assignment in staff endpoints
> - ❌ Duplicated logic (orders, getStaffChatIds ×2, status constants ×3+)
> - ❌ Dead code: unused Zod schemas (`updateOrderSchema`, `oidcCallbackSchema`), unused `shared/validators/*`
> - ❌ Inconsistent error handling style
> - ❌ No Prisma error mapping
> - ❌ Test script paths broken
> - ❌ `deliveryDate` stored as `String` not `DateTime` (poor for querying)

---

## 🗃️ Database Schema (Prisma)

### Enums
| Enum | Values |
|------|--------|
| `Role` | `customer` · `staff` · `admin` |
| `OrderStatus` | `Received` → `Designing` → `Quoted` → `Confirmed` → `InProgress` → `Ready` → `Completed` / `Cancelled` |
| `PaymentStatus` | `unpaid` · `partial` · `paid` (future use) |
| `RecoveryStatus` | `pending` · `approved` · `rejected` |

### Models
| Model | Notes |
|-------|-------|
| **User** | Manual IDs (`usr_…`), Telegram-linked, soft-delete via `deletedAt` |
| **CustomCakeRequest** | Manual ID `FB-<uuid>`, contact info, price + deposit + payment fields |
| **CakeGalleryItem** | Links to Category, flavors/tags arrays, ETB price range |
| **Category** | Slugged, soft-delete via `isActive` |
| **Review** | rating/content/author, optional user + product links |
| **RecoveryRequest** | old↔new Telegram ID |
| **OrderStatusEvent** | Audit trail — `source` records admin_api vs telegram_bot |

> [!note] Migrations
> Only **2 migrations** exist (`202606230001_telegram_first_order_foundation`, `202607130001_add_user_soft_delete`). The current schema has drifted ahead (payment fields, soft-delete enums) — **check migration drift before deploying.**

---

## 🌿 Git State

- **40+ local branches**, many abandoned mid-work
- **Remote-only branches of note:** `fix/oidc-cookie-path`, `pr-31`
- **Current:** `fix/review-page` (unmerged work)
- **Significant recent work merged:** OIDC migration, test centralization, i18n improvements, tsconfig path aliases
- **Notable local branches to inspect before deleting:** `cleanup/payment-removal`, `feat/telegram-oidc-migration`, `fix/critical-security-issues`

> [!tip] Suggestion
> Keep only: `dev`, `main`, and 1 active working branch. Merge/delete the other ~37. The repo history is clean (conventional commits, PR-based merges) — don't lose that.

---

## 🚀 Restart Plan

> [!bug] Priority 1 — Blocking (do first)
> - [ ] Fix CSRF: centralize all frontend mutations on `apiFetch`
> - [ ] Wire `MyOrdersView` to `GET /api/requests` (remove `SIMULATED_ORDERS`)
> - [ ] Fix broken `test:*` scripts in `package.json`

> [!warning] Priority 2 — Correctness & Security
> - [ ] Add field whitelists to categories/gallery/reviews update paths
> - [ ] Map Prisma `P2025` → 404 in `errorHandler`
> - [ ] Convert plain `Error`s to `ValidationError`/`NotFoundError`
> - [ ] De-duplicate `orders.operations.ts` vs `orders.repository.ts`
> - [ ] Make GalleryView + SearchModal API-backed (real catalog search)

> [!info] Priority 3 — Polish
> - [ ] Add favicon, logo, real social handles (replace `@flavourbites_placeholder`)
> - [ ] Replace Unsplash gallery placeholders with real cake photos (or accept for MVP)
> - [ ] Remove dead code (unused Zod schemas, `shared/validators/*`)
> - [ ] Add `robots.txt`, `sitemap.xml`, `manifest.json`, SEO meta polish
> - [ ] Delete stale branches; verify migration drift before deploy

> [!success] Priority 4 — Ship Checklist
> - [ ] `npx prisma migrate deploy` verified against fresh DB
> - [ ] `npm run lint` (tsc --noEmit) passes
> - [ ] `npm test` (all 52 files) passes
> - [ ] `npm run db:seed` → smoke test public + admin + bot flows
> - [ ] Decide once: Chapa payment fields (keep for v2 or remove)
> - [ ] Bump version past `0.0.0` and cut first release

---

## 📎 Linked Docs

- [[docs/ARCHITECTURE.md]] — system design, module pattern
- [[docs/FUTURE_FEATURES.md]] — planned features (payments, email, SMS)
- [[docs/API.md]] — ⚠️ **stale**: still documents legacy `/api/auth/telegram` widget, not the new OIDC flow
- [[docs/DATABASE.md]] — Prisma models
- [[docs/DEPLOYMENT.md]] — env + deploy setup
- [[openidconnect.md]] — OIDC migration guide (now implemented)

> [!abstract] Bottom Line
> **The backend is production-ready. The frontend is about 70% done.** The fastest path back: fix the CSRF contract, wire the public pages to their real APIs, fix the test scripts, then decide on payments. The architecture is sound — this is not a rewrite situation. It's a finish-the-wiring situation.