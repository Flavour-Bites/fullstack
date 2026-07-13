# Flavour Bites — Full System Review

**Date:** 2026-07-13
**Severity Scale:** Critical | High | Medium | Low | Info
**Scope:** v1 release — payment integration (Chapa) excluded, see `docs/FUTURE_FEATURES.md`

---

## Executive Summary

Flavour Bites is a well-structured modular monolith with clean architecture, good separation of concerns, and solid fundamentals. The codebase is production-quality in many areas but has several security gaps, dead code, and consistency issues that should be addressed before scale.

**Overall Score: 7/10**

| Category | Score | Notes |
|----------|-------|-------|
| Architecture | 8/10 | Clean module boundaries, good layering |
| Security | 5/10 | Several critical gaps (webhook, chatbot, recovery) |
| Code Quality | 7/10 | Good patterns, some dead code and duplication |
| Test Coverage | 6/10 | Good unit tests, missing integration tests |
| Performance | 7/10 | N+1 in stats, Redis fallback is solid |
| Production Readiness | 6/10 | Missing env validation, CSP disabled |

---

## Layer 1: Architecture Overview

### Strengths

- **Clean modular monolith**: Each domain module follows controller → service → repository → Prisma pattern consistently
- **Good error hierarchy**: `AppError` → `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ValidationError` with proper HTTP status codes
- **Async handler wrapper**: All async routes wrapped to forward errors to global handler
- **Zod validation at route level**: Request body/query/params validated before reaching controller
- **Singleton Prisma**: Single `PrismaClient` instance reused across the app
- **Telegram-first auth**: Primary identity provider via Telegram Login Widget with password as secondary option
- **Redis with in-memory fallback**: Graceful degradation when Redis is unavailable

### Issues

#### **[HIGH] CSP disabled globally** — `src/app/config/security.ts:3`
```ts
export const securityConfig = helmet({ contentSecurityPolicy: false });
```
CSP is completely disabled. This removes a key XSS mitigation layer. The chatbot injects AI-generated HTML responses that could contain malicious content.

**Fix:** Enable CSP with a whitelist for Cloudinary, Google Fonts, and your domain.

#### **[HIGH] No environment variable validation at startup** — `src/app/server.ts`
The server starts without validating required env vars (`DATABASE_URL`, `JWT_SECRET`, `TELEGRAM_BOT_TOKEN`). Missing vars cause runtime crashes instead of immediate failure.

**Fix:** Add startup validation with `zod` or a simple check that throws on missing required vars.

#### **[MEDIUM] Telegram webhook registered on every app creation** — `src/app/app.ts:20-30`
`createApp()` fires `setWebhook` on every cold start. This is an unawaited `fetch` with `.catch()` swallowing errors silently.

**Fix:** Move webhook registration to a dedicated startup function with proper logging and retry logic.

#### **[MEDIUM] Dual entry points create confusion** — `src/modules/orders/`
Both `orders.repository.ts` and `orders.operations.ts` contain nearly identical logic. The service uses the repository; `operations.ts` appears to be dead code.

**Fix:** Delete `orders.operations.ts` or consolidate into the repository.

---

## Layer 2: Module-by-Module Deep Dive

### Auth Module

#### **[CRITICAL] JWT secret has hardcoded fallback** — `src/shared/utils/auth.ts:5`
```ts
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_do_not_use_in_prod';
```
If `JWT_SECRET` is missing in production, the app silently uses a known string. Any attacker can forge valid JWTs.

**Fix:** Throw on startup if `JWT_SECRET` is not set in production.

#### **[HIGH] No rate limiting on password brute-force** — `src/modules/auth/auth.routes.ts`
The `authLimiter` (100 requests per 15 minutes) is applied to Telegram login and password login, but:
- 100 requests/15min is very generous for password attempts
- No per-user rate limiting (attacker can try different telegramIds)
- `POST /api/auth/password/verify` has no rate limiting at all

**Fix:** Reduce auth limiter to 10-20 attempts/15min. Add per-user rate limiting for password verification.

#### **[HIGH] Password minimum is only 6 characters** — `src/modules/auth/auth.schemas.ts:16`
```ts
password: z.string().min(6, 'Password must be at least 6 characters.'),
```
6 characters is too short for a production system. Combined with bcrypt rounds of 12 (good), but weak passwords undermine this.

**Fix:** Increase to minimum 8 characters with complexity requirements.

#### **[MEDIUM] Auth errors are generic** — `src/modules/auth/auth.service.ts`
All auth failures throw generic `Error` instead of `AuthenticationError`. This makes it harder to distinguish between "account not found" and "wrong password" in logs (intentional for security) but the error messages themselves leak information:
- "Account not found" vs "That password is not correct" — tells attacker whether an account exists

**Fix:** Use uniform error messages: "Invalid credentials" for both cases.

### Orders Module

#### **[HIGH] Status transitions not validated** — `src/modules/orders/orders.controller.ts:39-52`
The `PATCH /api/requests/:id` endpoint accepts any `OrderStatus` without validating against `ORDER_WORKFLOW`. A customer's order could jump from `Received` to `Completed` or go backwards.

**Fix:** Validate status transitions against `ORDER_WORKFLOW` before allowing changes.

#### **[HIGH] Customers can soft-delete any order** — `src/modules/orders/orders.routes.ts:14`
```ts
router.delete('/:id', requireAuth, ordersController.softDelete);
```
The route has no `requireRole` guard. The controller checks ownership for customers, but staff/admin can delete any order without restriction. More importantly, the DELETE endpoint should probably be restricted to admin/staff only.

**Fix:** Add `requireRole('admin', 'staff')` or at minimum verify ownership for all roles.

#### **[MEDIUM] `updateDesignAndNotes` bypasses repository** — `src/modules/orders/orders.service.ts:106-119`
This method directly calls `getPrisma()` instead of going through the repository layer, breaking the architectural pattern.

**Fix:** Move this query to `orders.repository.ts`.

#### **[MEDIUM] Dead code: `orders.operations.ts`** — 198 lines
Contains `createOrder`, `updateOrderStatus`, `updateOrderCommercials`, `softDeleteOrder`, `restoreOrder` — all duplicated in `orders.repository.ts`. The service imports from the repository, not operations.

**Fix:** Delete this file.

### Users Module

#### **[MEDIUM] No check for last admin demotion** — `src/modules/users/users.service.ts:14-16`
An admin can demote themselves if another admin exists, but there's no check to prevent demoting the *last* admin. The system could end up with zero admins.

**Fix:** Count admins before allowing demotion; reject if this would be the last one.

#### **[LOW] Hard delete for users** — `src/modules/users/users.repository.ts:23`
Users are hard-deleted (`prisma.user.delete`). This orphaned their orders (the `userId` FK becomes null). Consider soft-delete like orders.

### Categories Module

#### **[LOW] PATCH endpoint has no validation** — `src/modules/categories/categories.routes.ts:9`
The `PATCH /api/categories/:id` route doesn't use `validate()`. The service accepts `Record<string, unknown>` and passes it directly to Prisma, which could accept unexpected fields.

**Fix:** Add a Zod update schema and validate on the route.

### Gallery Module

#### **[MEDIUM] Auto-creates categories on gallery create** — `src/modules/gallery/gallery.repository.ts:32-49`
`resolveCategoryId` silently creates a new category if the slug doesn't exist. This means any gallery create request can create orphan categories without admin approval.

**Fix:** Return an error if the category doesn't exist, or require explicit category creation.

#### **[LOW] No validation on PATCH** — `src/modules/gallery/gallery.routes.ts:10`
Similar to categories — the PATCH route doesn't validate input.

### Uploads Module

#### **[MEDIUM] No file size validation at route level** — `src/modules/uploads/uploads.routes.ts:8`
The Zod schema validates `size` as a number, but the actual Cloudinary upload doesn't enforce a max size. The 12MB JSON limit in `app.ts` is the only guard.

**Fix:** Add max size validation in the Zod schema (e.g., `z.number().max(10 * 1024 * 1024)`).

### Recovery Module

#### **[HIGH] No authentication on recovery creation** — `src/modules/recovery/recovery.routes.ts:7`
```ts
router.post('/', validate(recoveryCreateSchema), recoveryController.create);
```
Anyone can submit a recovery request without authentication. An attacker could spam recovery requests or attempt to hijack accounts by submitting fake old→new telegram ID mappings.

**Fix:** Require authentication or add CAPTCHA/rate limiting.

#### **[MEDIUM] No verification of old Telegram ID ownership** — `src/modules/recovery/recovery.service.ts`
When a recovery request is approved, the service doesn't verify that the requester actually owns the old Telegram ID. The admin approves based on trust alone.

**Fix:** Add a verification step (e.g., message the old Telegram account) before allowing recovery.

### Reviews Module

#### **[LOW] `date` field uses `toLocaleDateString`** — `src/modules/reviews/reviews.repository.ts:28`
```ts
date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
```
This stores a formatted string, not a `DateTime`. Sorting by date won't work correctly. The `createdAt` field already handles ordering.

**Fix:** Either store as `DateTime` or remove the `date` field entirely (use `createdAt`).

### Stats Module

#### **[MEDIUM] N+1 potential and full table scans** — `src/modules/stats/stats.service.ts`
`getStats()` calls `findMany` on all three tables without pagination or limits. With large datasets, this will be slow.

**Fix:** Use Prisma aggregate functions (`count`, `avg`) instead of fetching all records.

### Chatbot Module

#### **[HIGH] No rate limiting on chat endpoint** — `src/modules/chatbot/chatbot.routes.ts`
The `POST /api/chat` endpoint has no rate limiting. An attacker could spam Gemini API calls, running up costs or causing rate limit errors for legitimate users.

**Fix:** Add rate limiting (e.g., 20 requests/minute per IP).

#### **[HIGH] No authentication required** — `src/modules/chatbot/chatbot.routes.ts`
The chat endpoint is publicly accessible. While the chatbot is meant for customers, unauthenticated access means:
- No user tracking for abuse
- Potential for prompt injection attacks
- API cost exposure

**Fix:** At minimum, add rate limiting. Consider requiring auth for chatbot access.

#### **[MEDIUM] System prompt injection risk** — `src/modules/chatbot/chatbot.service.ts`
User messages are passed directly to Gemini without sanitization. While Gemini has built-in safety, the system prompt could be bypassed with crafted inputs.

**Fix:** Add input sanitization and limit message length.

### Contact Module

#### **[MEDIUM] HTML injection in Telegram messages** — `src/modules/contact/contact.service.ts:14-21`
Contact form submissions are sent to staff via Telegram with HTML parse mode. User-provided `name`, `email`, `subject`, and `message` are interpolated directly into HTML strings without escaping.

**Fix:** Escape HTML entities in user input before sending.

### Payment Module

> **Note:** Payment integration (Chapa) is excluded from v1. The module exists in `src/modules/payment/` but is not routed. These issues are documented for when payments are activated in v2.

#### **[HIGH] Webhook has no signature verification** — `src/modules/payment/payment.routes.ts:12`
```ts
router.post('/webhook', paymentController.webhook);
```
The Chapa webhook endpoint has no authentication. Anyone can POST to it and mark orders as paid.

**Fix:** Verify Chapa's webhook signature using `CHAPA_WEBHOOK_SECRET`.

#### **[HIGH] Webhook order lookup is fragile** — `src/modules/payment/payment.service.ts:93-94`
```ts
const order = await prisma.customCakeRequest.findFirst({
  where: { id: { startsWith: txRef.split('-').slice(0, -1).join('-') } },
});
```
This tries to match an order ID by prefix, which is fragile and could match wrong orders. The `txRef` format is `FB-{timestamp}-{random}` but order IDs are `FB-{random}`.

**Fix:** Store the `txRef` → `orderId` mapping when initiating payment, or use a dedicated `paymentId` field.

#### **[MEDIUM] Mock mode auto-verifies payments** — `src/modules/payment/payment.service.ts:64-66`
```ts
if (paymentConfig.isMockMode) {
  return { success: true, status: 'complete', amount: 0, currency: 'ETB' };
}
```
In mock mode, `verify()` always returns `complete`. This could be exploited in development to bypass payment.

**Fix:** Make mock mode behavior configurable or add explicit dev-only guards.

---

## Layer 3: Cross-Cutting Analysis

### Security

| Issue | Severity | Location |
|-------|----------|----------|
| JWT secret hardcoded fallback | CRITICAL | `shared/utils/auth.ts:5` |
| CSP disabled | HIGH | `config/security.ts:3` |
| Webhook no signature verification | HIGH | `payment.routes.ts:12` |
| Recovery no auth | HIGH | `recovery.routes.ts:7` |
| Chatbot no rate limiting | HIGH | `chatbot.routes.ts` |
| Auth rate limiting too generous | HIGH | `config/rateLimiter.ts` |
| Password minimum 6 chars | HIGH | `auth.schemas.ts:16` |
| HTML injection in contact | MEDIUM | `contact.service.ts` |
| Chatbot prompt injection risk | MEDIUM | `chatbot.service.ts` |

### Performance

| Issue | Severity | Location |
|-------|----------|----------|
| Stats full table scans | MEDIUM | `stats.service.ts` |
| Redis reconnection per request | LOW | `redisClient.ts` (socket created per `send()`) |
| No pagination on list endpoints | LOW | Multiple modules |

### Reliability

| Issue | Severity | Location |
|-------|----------|----------|
| Unawaited webhook registration | MEDIUM | `app.ts:22` |
| Telegram notification failures silently caught | INFO | Multiple `.catch()` blocks |
| Redis fallback works but loses state | INFO | `redisClient.ts` |

### Test Coverage

| Module | Unit Tests | Integration Tests | Notes |
|--------|-----------|-------------------|-------|
| auth | Yes | No | Good coverage of service layer |
| orders | Yes | No | Workflow tests are solid |
| users | Yes | No | |
| categories | No | No | Missing |
| gallery | No | No | Missing |
| uploads | No | No | Missing |
| recovery | Yes | No | |
| reviews | Yes | No | |
| stats | Yes | No | |
| chatbot | No | No | Missing |
| payment | No | No | Missing — critical gap |
| contact | No | No | Missing |
| telegram | Yes | No | Good coverage |
| redis | Yes | No | Good coverage |
| shared/utils | Yes | No | Good coverage |

**Missing integration tests:** No tests that exercise the full HTTP request lifecycle (middleware → controller → service → repository → Prisma). Consider adding Supertest-based integration tests for critical paths.

### API Consistency

| Issue | Severity | Location |
|-------|----------|----------|
| Inconsistent response shapes | LOW | Some endpoints return `{ success, request }` vs `{ success, orders }` |
| PATCH endpoints missing validation | MEDIUM | categories, gallery |
| `DELETE /api/requests/:id` vs `DELETE /api/gallery/:id` | INFO | Orders uses soft-delete, gallery uses hard-delete |

### i18n

- English and Amharic translations appear complete
- No missing keys observed in component usage
- Consider adding translation validation to CI

### Production Readiness

| Issue | Severity | Location |
|-------|----------|----------|
| No env var validation | HIGH | `server.ts` |
| CSP disabled | HIGH | `config/security.ts` |
| `dotenv/config` imported twice | LOW | `app.ts:1` and `server.ts:1` |
| Build script uses CJS output | INFO | `package.json` — consider ESM for Node 20+ |

---

## Recommendations (Priority Order)

### Critical (Fix Before Production)
1. **Remove JWT secret fallback** — Throw if `JWT_SECRET` is not set
2. **Add env var validation** — Validate all required vars at startup

### High (Fix Before Scale)
3. **Enable CSP** — Configure strict CSP with necessary allowlists
4. **Add webhook signature verification** for Chapa payments
5. **Add rate limiting** to chatbot and recovery endpoints
6. **Validate order status transitions** against `ORDER_WORKFLOW`
7. **Add authentication** to recovery creation endpoint
8. **Increase password minimum** to 8+ characters
9. **Fix contact HTML injection** — escape user input

### Medium (Fix Soon)
10. **Delete `orders.operations.ts`** — dead code
11. **Add validation** to categories/gallery PATCH endpoints
12. **Move `updateDesignAndNotes`** to repository layer
13. **Add admin count check** before demotion
14. **Use Prisma aggregates** in stats module
15. **Store txRef → orderId mapping** for payment webhook
16. **Escape HTML** in contact form Telegram messages

### Low (Backlog)
17. Add pagination to list endpoints
18. Add integration tests for critical paths
19. Fix review `date` field to use DateTime
20. Consider soft-delete for users
21. Add translation validation to CI
22. Consider ESM output for production build
