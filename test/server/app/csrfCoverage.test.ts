import { describe, expect, it } from 'vitest';
import { createApp } from '@server/core/createServer.js';
import { doubleCsrfProtection } from '@server/platform/config/index.js';
import apiRoutes from '@server/api/routes.js';

/**
 * Express internals walker that inventories every state-changing route and
 * asserts the CSRF invariant that GitHub CodeQL's `js/missing-token-validation`
 * query ("Missing CSRF middleware") cannot check.
 *
 * Why this test exists: CodeQL's query only recognizes CSRF middleware from
 * the `csurf`, `lusca`, and `tiny-csrf` packages. This app protects every
 * `/api` mutation with `csrf-csrf`'s `doubleCsrfProtection`, which the query
 * cannot model, so it reports the whole API as unprotected — a permanent false
 * positive. This test enforces the same property with real router-stack
 * evidence, and is strictly stronger than the analyzer because it checks the
 * actual middleware by function identity:
 *
 *   - `doubleCsrfProtection` is mounted to guard the exact `/api` router, and
 *     cookie parsing happens only inside that CSRF-guarded surface;
 *   - every POST/PUT/PATCH/DELETE route is either reachable only through the
 *     guarded `/api` router or listed in a two-way-checked exemption set — an
 *     exemption that stops matching a real route fails too.
 */
const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

interface UnsafeRoute {
  method: string;
  path: string;
  guarded: boolean;
}

interface ExpressLayer {
  handle?: unknown;
  name?: string;
  route?: { path?: string; methods?: Record<string, boolean> };
  regexp?: RegExp;
}

/** Collect unsafe routes from a router subtree, all tagged with `guarded`. */
function collectRoutes(layers: ExpressLayer[], guarded: boolean, out: UnsafeRoute[]): void {
  for (const layer of layers) {
    if (!layer) continue;

    if (!layer.route) {
      const inner = (layer.handle as { stack?: ExpressLayer[] } | undefined)?.stack;
      if (inner) collectRoutes(inner, guarded, out);
      continue;
    }

    const methods = Object.keys(layer.route.methods ?? {}).filter((m) => UNSAFE_METHODS.has(m));
    for (const method of methods) {
      out.push({ method: method.toUpperCase(), path: layer.route.path ?? '', guarded });
    }
  }
}

async function buildInventory() {
  const app = await createApp();
  const topLevel = app._router.stack as unknown as ExpressLayer[];

  // The `apiRoutes` router is a singleton mounted under `/api` behind
  // `doubleCsrfProtection` — find it by identity so "guarded" is exact and
  // cannot be fooled by stack ordering.
  const apiMountIndex = topLevel.findIndex((layer) => layer.handle === apiRoutes);
  expect(apiMountIndex).toBeGreaterThan(-1);
  expect(topLevel[apiMountIndex]?.handle).toBe(apiRoutes);

  const csrfGuardIndex = topLevel.findIndex((layer) => layer.handle === doubleCsrfProtection);
  expect(csrfGuardIndex).toBeGreaterThan(-1);

  // Ordering is load-bearing: the CSRF guard must run before the API router.
  expect(csrfGuardIndex).toBeLessThan(apiMountIndex);

  // Cookie parsing must be scoped to the CSRF-guarded surface — never a bare,
  // app-wide `app.use(cookieParser())`. A layer is acceptable only when its
  // mount path is `/api` (the protected API surface).
  const unguardedCookieParsers = topLevel.filter(
    (layer) => !layer.route && layer.name === 'cookieParser' && !String(layer.regexp ?? '').includes('/api'),
  );
  expect(unguardedCookieParsers).toEqual([]);

  const guardedRoutes: UnsafeRoute[] = [];
  const unguardedRoutes: UnsafeRoute[] = [];

  for (const layer of topLevel) {
    if (layer.handle === apiRoutes) continue;
    collectRoutes([layer], false, unguardedRoutes);
  }
  collectRoutes(
    (topLevel[apiMountIndex].handle as { stack?: ExpressLayer[] }).stack ?? [],
    true,
    guardedRoutes,
  );

  return { guardedRoutes, unguardedRoutes };
}

const EXEMPTIONS: UnsafeRoute[] = [
  // Telegram webhook: authenticated by the x-telegram-bot-api-secret-token
  // header (timing-safe compare), never by cookies, and callable only with a
  // secret Telegram sends — CSRF is not applicable.
  { method: 'POST', path: '/bot/webhook', guarded: false },
];

describe('CSRF coverage', () => {
  it('guards every state-changing route or lists a justified exemption', async () => {
    const { guardedRoutes, unguardedRoutes } = await buildInventory();

    // Real mutations must actually sit behind the CSRF guard, otherwise the
    // exemption set below would protect an empty surface.
    expect(guardedRoutes.length).toBeGreaterThan(0);

    // The only unsafe routes outside the guarded /api router must exactly match
    // the exemption list — no more, no fewer (checked both ways).
    expect(unguardedRoutes).toEqual(EXEMPTIONS);
  });
});