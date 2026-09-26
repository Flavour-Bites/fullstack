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
> **Audited:** 2026-09-16 · **Updated:** 2026-09-26 · **Branch:** `feat/telegram-bot-messaging-permission` · **Version:** 0.0.0 (never released)

---

## ♻️ Post-Refactor Status (2026-09-21)

> The audit below is accurate for **2026-09-16**. A subsequent clean-architecture refactor (branch `refactor/clean-architecture`) changed the layout and cleared several items. Read this section first; the numbered doc sections remain the dated snapshot.

### What Changed Since the Audit

- **Monorepo layout** replaces the old feature-monolith layout. The legacy paths cited throughout this document no longer exist:
  - Server: `src/server/{core,api/routes,api/controllers,modules,platform,bot}`
  - Client: `src/client/{app,app/providers,features,components,lib,platform,i18n,styles}`
  - Shared: `src/shared/{api,constants,types,utils}` (imported by both sides via `@shared/*`)
  - `src/data.ts`, `src/features/*/api`, `src/shared/utils/apiClient.ts`, `src/types.ts` were relocated/removed during the refactor.
- **✅ Critical #4 (Order logic duplicated) is fixed.** The bot now uses the single `orders.repository.ts`; `orders.operations.ts` was deleted.
- **✅ Duplicated utilities removed.** `getStaffChatIds` and other cross-module duplicates were consolidated; dead code (`analytics`, unused helpers) deleted.
- **✅ Order-status keys reconciled.** The canonical key is `InProgress` (was `'In Progress'` in client code); admin badge colors/icons moved to `src/client/features/admin/components/statusPresentation.ts` and status transitions live in `orders.workflow.ts`. Emoji/labels, badges, and workflow remain separate presentation/domain maps over one `OrderStatus` type in `src/shared/types`.
- **✅ God components decomposed** into feature hooks + presentational subcomponents: `ProfileView`, `RequestFormView`, `CakeAssistantBot` (view composition roots; logic in `users/hooks/useProfileForm.ts`, `orders/hooks/useRequestForm.ts`, `chatbot/hooks/useCakeChat.ts`).
- **✅ Admin layer consolidated.** Types moved to `src/client/features/admin/types.ts`, the data hook to `admin/hooks/useAdminData.ts`, CSV export to `admin/utils/ordersCsv.ts`.
- **✅ App composition root slimmed.** App-level state lives in `src/client/app/providers/` (Theme, Locale, Auth, CakeSelection) with `main.tsx` composing `AppProviders`.
- **✅ Test tooling is real.** The broken per-module `test:*` scripts were dropped; run `npm test` (54 files / 356 tests), `npm run test:client` (27 files / 102 tests), or `npm run test:server` (22 files / 207 tests). `npm run lint` = `tsc --noEmit`.

### Still Open (unchanged by the refactor)

- **SearchModal**: searches static `GALLERY_ITEMS` + `FAQS` from `src/client/data.ts` — no real search API exists.
- **TestimonialsView**: uses hardcoded `TESTIMONIALS` from `data.ts` instead of `GET /api/reviews`.
- **Brand assets**: i18n files still use `@flavourbites_placeholder.com` email; seed data uses Unsplash placeholder images.
- **Migration drift**: 4th migration (`20260925000000_rename_quoted_to_priced`) missing from `migration_lock.toml`; will fail `prisma migrate deploy`.
- **Chapa payment fields**: schema has payment columns but no integration code exists — decide keep or remove.
- **Version**: still `0.0.0` in `package.json`.

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
| CSRF protection | 🟢 | 🟢 | — | ⚪ |
| Rate limiting | 🟢 | — | — | ⚪ |
| My Orders page | 🟢 API exists | 🟢 | — | ⚪ |
| Public gallery page | 🟢 API exists | 🟢 | — | ⚪ |
| Global search | 🔴 API missing | 🔴 | — | ⚪ |
| Testimonials page | 🟢 API exists | 🟡 | — | ⚪ |
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
- ✅ Auto-promotes to `Priced` when price set
- ✅ Real Telegram notifications on create / status change / price confirmed
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
| **HomeView** | Hero dynamic; fetches `/api/gallery` | Testimonials from `data.ts` |
| **GalleryView** | Fetches `/api/gallery` with Skeletons | None (static GALLERY_ITEMS removed) |
| **CakeAssistantBot** | Real `/api/chat` calls | Graceful offline/error banner |
| **ContactView** | Form submits via API | Studio location & contact info |
| **ProfileView** | Has update API call | Some save behavior local-only |

---

## 🔴 Fake / Placeholder Data

> [!danger] THE FAKE-DATA MAP
> Static data lives in **`src/client/data.ts`** and is imported by components. Most APIs now wired up; remaining gaps below.

| Component | Shows | Fake Source | Real API That Exists But Isn't Used |
|-----------|-------|-------------|-------------------------------------|
| **TestimonialsView** | Customer reviews | `TESTIMONIALS` from `data.ts` | `GET /api/reviews` ✅ exists (currently 0 DB rows) |
| **RequestSidebar** | Step indicator | Hardcoded text | none meaningful |

> [!note] Fixed since audit
> **MyOrdersView** — uses real `GET /api/requests` via `useOrders` hook.
> **GalleryView** — uses real `GET /api/gallery` with zero static fallback.
> **SearchModal** — searches live cakes via `GET /api/gallery`; zero static cake fallback.
> **HomeView** — showcase and hero use live `GET /api/gallery` data.
> About / Help are *supposed* to be static editorial copy — no API needed.

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

## 🚨 Critical Issues — **ALL RESOLVED**

> ✅ **#1 — CSRF Contract** — **FIXED.** All frontend mutations use centralized `http` client (`src/client/lib/http.ts`) which auto-attaches CSRF tokens for non-GET requests. Verified across all feature hooks (`useOrders`, `useGallery`, `useCategories`, `useReviews`, `useUsers`, `useRequestForm`, `useProfileForm`, `useContactForm`, `useCakeChat`, `useRecovery`, `useAdminData`).

> ✅ **#2 — Mass-Assignment Risk** — **FIXED.** All update endpoints use Zod schema validation with field whitelists:
> - Categories: `categoryUpdateSchema = categorySchema.partial()` validated in routes
> - Gallery: `galleryUpdateSchema = gallerySchema.partial()` validated in routes
> - Reviews: `updateReviewSchema` explicitly defines allowed fields validated in routes
> - Services use typed input types from schemas (`CategoryUpdateInput`, `GalleryUpdateInput`, `UpdateReviewInput`).

> ✅ **#3 — Broken Test Scripts** — **FIXED.** Package.json scripts work correctly:
> - `npm test` → 55 files / 360 tests pass
> - `npm run test:client` → 27 files / 103 tests pass
> - `npm run test:server` → 23 files / 210 tests pass

> ✅ **#4 — Order Logic Duplicated** — **FIXED.** `orders.operations.ts` was deleted; bot now uses single `orders.repository.ts`.

> ✅ **#5 — Generic Errors → 500** — **FIXED.**
> - Prisma P2025 mapped to 404 in `src/server/platform/middleware/errorHandler.ts:23-27`
> - All services use typed `AppError` subclasses (`ValidationError`, `NotFoundError`, `AuthenticationError`, `AuthorizationError`)
> - `auth.service.ts`, `orders.service.ts`, `users.service.ts` — no plain `Error` throws remain.

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

> [!failure] Weaknesses (Remaining)
> - ❌ **SearchModal** — no real search API; searches static data
> - ❌ **TestimonialsView** — uses static data instead of `GET /api/reviews`
> - ❌ **Unsplash placeholders** in Prisma seed (`prisma/seed/gallery.ts`)
> - ❌ **Placeholder email** in i18n files (`@flavourbites_placeholder.com`)
> - ❌ **Migration drift** — 4th migration missing from `migration_lock.toml`
> - ❌ **Chapa payment fields** — schema has fields but no integration
> - ❌ **Version** — still `0.0.0`
> - ❌ **deliveryDate stored as String** not `DateTime` (poor for querying)
>
> > [!note] Fixed since audit
> > - CSRF contract mismatch — resolved
> > - Mass-assignment in staff endpoints — resolved
> > - Duplicated logic (orders, getStaffChatIds, status constants) — resolved
> > - Dead code (unused Zod schemas, shared/validators) — resolved
> > - Inconsistent error handling — resolved (typed AppError hierarchy)
> > - No Prisma error mapping — resolved (P2025 → 404)
> > - Test script paths broken — resolved

---

## 🗃️ Database Schema (Prisma)

### Enums
| Enum | Values |
|------|--------|
| `Role` | `customer` · `staff` · `admin` |
| `OrderStatus` | `Received` → `Designing` → `Priced` → `Confirmed` → `InProgress` → `Ready` → `Completed` / `Cancelled` |
| `PaymentStatus` | `unpaid` · `partial` · `paid` (future use) |
| `RecoveryStatus` | `pending` · `approved` · `rejected` |

### Models
| Model | Notes |
|-------|-------|
| **User** | Manual IDs (`usr_…`), Telegram-linked, soft-delete via `deletedAt` |
| **CustomCakeRequest** | Manual ID `FB-<uuid>`, contact info, price + deposit + payment fields |
| **Product** | Links to Category, flavors/tags arrays, ETB price range |
| **Category** | Slugged, soft-delete via `isActive` |
| **Review** | rating/content/author, optional user + product links |
| **RecoveryRequest** | old↔new Telegram ID |
| **OrderStatusEvent** | Audit trail — `source` records admin_api vs telegram_bot |

> [!note] Migrations
> **3 migrations applied** (`202606230001_telegram_first_order_foundation`, `202607130001_add_user_soft_delete`, `20260925000000_rename_quoted_to_priced`). **But** `prisma/migrations/migration_lock.toml` only lists the first 2 — the 4th migration is missing from the lock file. **Will fail `prisma migrate deploy` in CI/production** until lock file is updated or migrations are squashed.

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

## 🚀 Restart Plan (Updated — Most Items Complete)

> [!bug] Priority 1 — **COMPLETE** ✅
> - ✅ Fix CSRF: centralized on `http` client (all hooks use it)
> - ✅ Wire `MyOrdersView` to `GET /api/requests` (uses `useOrders`)
> - ✅ Fix broken `test:*` scripts (all work: 55 files / 360 tests)

> [!warning] Priority 2 — **MOSTLY COMPLETE** ✅
> - ✅ Field whitelists on categories/gallery/reviews update paths
> - ✅ Prisma P2025 → 404 mapping in `errorHandler`
> - ✅ Plain `Error`s → typed `AppError` subclasses
> - ✅ `orders.operations.ts` deleted (single `orders.repository.ts`)
> - ✅ GalleryView API-backed (uses `useGallery` hook)
> - ⚠️ **SearchModal** — still searches static data; needs real search API

> [!info] Priority 3 — Polish (Remaining)
> - [ ] Replace placeholder email in i18n (`@flavourbites_placeholder.com` in `en.ts`/`am.ts`)
> - [ ] Replace Unsplash placeholders in Prisma seed (`prisma/seed/gallery.ts`)
> - [ ] **SEO assets exist** — `robots.txt`, `sitemap.xml`, `manifest.json` ✅
> - [ ] Delete stale branches (40+ local); verify migration drift before deploy

> [!success] Priority 4 — Ship Checklist (Remaining)
> - [ ] Fix migration lock file (`migration_lock.toml` missing 4th migration)
> - [ ] `npm run lint` passes ✅
> - [ ] `npm test` passes ✅ (55 files / 360 tests)
> - [ ] `npm run db:seed` → smoke test public + admin + bot flows
> - [ ] Decide once: Chapa payment fields (keep for v2 or remove schema fields)
> - [ ] Bump version past `0.0.0` and cut first release

---

## 📎 Linked Docs

- [[docs/ARCHITECTURE.md]] — system design, module pattern
- [[docs/FUTURE_FEATURES.md]] — planned features (payments, email, SMS)
- [[docs/API.md]] — ⚠️ **stale**: still documents legacy `/api/auth/telegram` widget, not the new OIDC flow
- [[docs/DATABASE.md]] — Prisma models
- [[docs/DEPLOYMENT.md]] — env + deploy setup
- [[openidconnect.md]] — OIDC migration guide (now implemented)

> [!abstract] Bottom Line (Updated)
> **Backend: production-ready. Frontend: ~90% done.** All Priority 1 & 2 critical issues resolved. Remaining work is Polish (placeholder content, search API) and Ship (migration lock, version bump, Chapa decision). This is a **finish-the-polish** situation, not a rewrite.