# Telegram OIDC — Test Cleanup & Legacy Removal Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all legacy Telegram Login Widget references from tests and code, leaving only the OIDC-based auth system clean and passing.

**Architecture:** The OIDC implementation is already in place in production code (`auth.service.ts`, `auth.controller.ts`, `auth.ts`). The tests still reference the removed `authService.telegramLogin` method and `verifyTelegramAuth` import. We need to update/delete stale tests and remove dead code.

**Tech Stack:** TypeScript, Vitest, Prisma, jose, Express

## Global Constraints

- All environment variables from `.env.example` must be present
- `jose` is used for JWKS/ID token verification
- Tests must pass with `npx vitest run`
- TypeScript must pass with `npx tsc --noEmit`

---

### Task 1: Fix `src/shared/utils/__tests__/auth.test.ts` — Remove legacy imports

**Files:**
- Modify: `src/shared/utils/__tests__\auth.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: clean test file that imports only existing exports from `auth.ts`

- [ ] **Step 1: Read current file**

Read `src/shared/utils/__tests__/auth.test.ts` to understand the full content.

- [ ] **Step 2: Remove `verifyTelegramAuth` import and `computeTelegramHash` helper**

Remove lines 8 (`verifyTelegramAuth` import) and lines 13-21 (`computeTelegramHash` function).

The import block at line 3-11 should become:
```ts
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  getTokenFromRequest,
  authCookieOptions,
} from '../auth.js';
```

Delete the `computeTelegramHash` function (lines 13-21).

- [ ] **Step 3: Remove `jose` import if unused**

Check if `jose` is imported at the top of the file. It's used in the `verifyOidcIdToken` tests via `vi.spyOn(jose, 'jwtVerify')`. The import `import * as jose from 'jose'` should be present. If not, add it. If `verifyTelegramAuth` was the only reason for `jose`, remove it.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/shared/utils/__tests__/auth.test.ts`
Expected: All tests PASS (the `verifyOidcIdToken` tests mock `jose.jwtVerify` so they don't need real verification)

- [ ] **Step 5: Commit**

```bash
git add src/shared/utils/__tests__/auth.test.ts
git commit -m "test: remove legacy verifyTelegramAuth from auth utils tests"
```

---

### Task 2: Fix `src/modules/auth/__tests__/auth.service.test.ts` — Remove legacy `telegramLogin` tests

**Files:**
- Modify: `src/modules/auth/__tests__/auth.service.test.ts`

**Interfaces:**
- Consumes: `authService` from `auth.service.ts` (has `initiateOidcFlow`, `handleOidcCallback`, `finalizeTelegramLogin`, `setPassword`, `getCurrentUser`, `telegramPasswordLogin`, `verifyUserPassword`)
- Produces: clean test file with no references to removed `telegramLogin` method

- [ ] **Step 1: Read current file**

Read `src/modules/auth/__tests__/auth.service.test.ts` to see all tests.

- [ ] **Step 2: Remove `verifyTelegramAuth` from mock**

Line 28 mocks `verifyTelegramAuth`. Remove it:
```ts
vi.mock('../../../shared/utils/auth.js', () => ({
  signToken: vi.fn((payload) => `token-${payload.userId}`),
  verifyPassword: vi.fn((plain, hash) => Promise.resolve(hash === `hashed:${plain}`)),
  hashPassword: vi.fn((plain) => Promise.resolve(`hashed:${plain}`)),
  authCookieOptions: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 999 },
}));
```

- [ ] **Step 3: Delete the `authService.telegramLogin` describe block**

Delete lines 59-72 (the entire `describe('authService.telegramLogin', ...)` block) since `telegramLogin` no longer exists on `authService`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/modules/auth/__tests__/auth.service.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/auth/__tests__/auth.service.test.ts
git commit -m "test: remove legacy telegramLogin tests from auth service"
```

---

### Task 3: Delete `src/modules/auth/__tests__/auth.telegram.integration.test.ts`

**Files:**
- Delete: `src/modules/auth/__tests__/auth.telegram.integration.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: legacy integration test file removed

- [ ] **Step 1: Read the file to confirm it's entirely legacy**

Read the file — all tests call `authService.telegramLogin` with HMAC-computed hashes. This entire file tests the removed legacy flow.

- [ ] **Step 2: Delete the file**

```bash
rm src/modules/auth/__tests__/auth.telegram.integration.test.ts
```

- [ ] **Step 3: Verify no other file imports from this test**

Run: `grep -r "auth.telegram.integration" src/`
Expected: No results

- [ ] **Step 4: Commit**

```bash
git add -A src/modules/auth/__tests__/auth.telegram.integration.test.ts
git commit -m "test: delete legacy Telegram HMAC integration tests"
```

---

### Task 4: Fix `src/modules/auth/__tests__/auth.controller.test.ts` — Add `finalizeTelegram` test

**Files:**
- Modify: `src/modules/auth/__tests__/auth.controller.test.ts`

**Interfaces:**
- Consumes: `authController` methods, `authService` mocks
- Produces: complete controller test coverage

- [ ] **Step 1: Read current file**

Read to understand existing tests. Currently tests `initiateTelegramLogin` and `handleTelegramCallback`. Missing: `finalizeTelegram` test.

- [ ] **Step 2: Add mock for `finalizeTelegramLogin`**

Add to the mock at line 4-10:
```ts
vi.mock('../auth.service.js', () => ({
  authService: {
    initiateOidcFlow: vi.fn(),
    handleOidcCallback: vi.fn(),
    finalizeTelegramLogin: vi.fn(),
    authCookieOptions: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 999 },
  },
}));
```

- [ ] **Step 3: Add `finalizeTelegram` test**

Append to the file:
```ts
describe('authController.finalizeTelegram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns token on valid password', async () => {
    vi.mocked(authService.finalizeTelegramLogin).mockResolvedValueOnce({
      success: true,
      token: 'jwt_app_token',
      user: { id: 'usr_1', name: 'User' } as any,
    });

    const req = mockReq({ body: { telegramId: '12345', password: 'correct' } });
    const res = mockRes();

    await authController.finalizeTelegram(req, res);

    expect(authService.finalizeTelegramLogin).toHaveBeenCalledWith('12345', 'correct');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      token: 'jwt_app_token',
      user: { id: 'usr_1', name: 'User' },
    });
  });

  it('sets auth_token cookie on success', async () => {
    vi.mocked(authService.finalizeTelegramLogin).mockResolvedValueOnce({
      success: true,
      token: 'jwt_app_token',
      user: { id: 'usr_1', name: 'User' } as any,
    });

    const req = mockReq({ body: { telegramId: '12345', password: 'correct' } });
    const res = mockRes();

    await authController.finalizeTelegram(req, res);

    expect(res.cookie).toHaveBeenCalledWith('auth_token', 'jwt_app_token', expect.any(Object));
  });
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/modules/auth/__tests__/auth.controller.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/auth/__tests__/auth.controller.test.ts
git commit -m "test: add finalizeTelegram controller tests"
```

---

### Task 5: Add OIDC flow tests to `auth.service.test.ts`

**Files:**
- Modify: `src/modules/auth/__tests__/auth.service.test.ts`

**Interfaces:**
- Consumes: `authService.initiateOidcFlow`, `authService.handleOidcCallback`
- Produces: OIDC flow test coverage

- [ ] **Step 1: Read current file state**

Read to see what's already tested and what's missing.

- [ ] **Step 2: Add `initiateOidcFlow` tests**

Append:
```ts
describe('authService.initiateOidcFlow', () => {
  beforeAll(() => {
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID = 'test_client_id';
  });

  it('returns authorizationUrl with required OIDC params', async () => {
    const result = await authService.initiateOidcFlow('https://example.com/callback');
    expect(result.authorizationUrl).toContain('client_id=test_client_id');
    expect(result.authorizationUrl).toContain('response_type=code');
    expect(result.authorizationUrl).toContain('code_challenge_method=S256');
    expect(result.authorizationUrl).toContain('scope=openid');
    expect(result.state).toBeDefined();
    expect(result.nonce).toBeDefined();
    expect(result.codeVerifier).toBeDefined();
  });

  it('throws when CLIENT_ID is missing', async () => {
    delete process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID;
    await expect(authService.initiateOidcFlow('https://example.com/callback'))
      .rejects.toThrow('TELEGRAM_OPENID_CONNECT_CLIENT_ID is not configured');
    process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID = 'test_client_id';
  });
});
```

- [ ] **Step 3: Add `handleOidcCallback` tests**

Append:
```ts
describe('authService.handleOidcCallback', () => {
  it('throws on state mismatch (CSRF)', async () => {
    await expect(authService.handleOidcCallback({
      code: 'c_123',
      state: 'state_a',
      storedState: 'state_b',
      redirectUri: 'https://example.com/callback',
    })).rejects.toThrow('Invalid OAuth state');
  });

  it('throws on missing code verifier (PKCE)', async () => {
    await expect(authService.handleOidcCallback({
      code: 'c_123',
      state: 'state_123',
      storedState: 'state_123',
      redirectUri: 'https://example.com/callback',
    })).rejects.toThrow('Missing PKCE code verifier');
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/modules/auth/__tests__/auth.service.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/auth/__tests__/auth.service.test.ts
git commit -m "test: add OIDC flow tests for auth service"
```

---

### Task 6: Clean up unused `scope` variable in `auth.service.ts`

**Files:**
- Modify: `src/modules/auth/auth.service.ts:61`

**Interfaces:**
- Consumes: nothing
- Produces: no TS6133 warning

- [ ] **Step 1: Remove unused `scope` variable**

Line 61 has `const scope = encodeURIComponent(...)` which is never used (line 66 uses the raw string directly). Delete line 61.

- [ ] **Step 2: Verify TypeScript passes**

Run: `npx tsc --noEmit 2>&1 | Select-String "auth.service.ts"`
Expected: No output (clean)

- [ ] **Step 3: Commit**

```bash
git add src/modules/auth/auth.service.ts
git commit -m "fix: remove unused scope variable in auth.service.ts"
```

---

### Task 7: Final verification — full test suite + typecheck

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: all previous tasks complete
- Produces: green CI

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS, no failures

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors related to auth (pre-existing errors in other files are OK)

- [ ] **Step 3: Run lint**

Run: `npm run lint` (if available)
Expected: No new warnings

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: final OIDC test cleanup"
```
