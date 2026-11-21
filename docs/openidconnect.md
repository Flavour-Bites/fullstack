# OpenID Connect (OIDC) Migration Guide for Telegram

## 1. Goal
Replace the legacy Telegram Login Widget (hash‑based verification) with Telegram’s official **OpenID Connect (OIDC) Authorization Code Flow with PKCE** while keeping the existing user experience.

---

## 2. Prerequisites
| Item | Description |
|------|-------------|
| **Telegram Bot** | Must be created via BotFather. Enable **OAuth2.0** in the *Bot Settings* → *OAuth2.0* and note the **Client ID** and **Client Secret**. |
| **Redirect URI** | `https://<YOUR_DOMAIN>/api/auth/telegram/callback` (must be registered in BotFather). |
| **Environment variables** | Add the following to `.env` (and to the production config):
```env
TELEGRAM_OPENID_CONNECT_CLIENT_ID=your_client_id
TELEGRAM_OPENID_CONNECT_CLIENT_SECRET=your_client_secret
APP_URL=https://your.domain.com   # used for building absolute redirect URLs
TELEGRAM_WEBHOOK_SECRET=…          # keep existing webhook secret
JWT_SECRET=…                       # secret for signing our own JWTs
```
| **Dependencies** | `npm install jose` – used for JWKS fetching and ID‑token verification. |

---

## 3. Backend – API Endpoints
| Endpoint | Method | Purpose | Implementation notes |
|----------|--------|---------|---------------------|
| `/api/auth/telegram/login` | **GET** | Initiates the OIDC flow. Generates a **code verifier** & **code challenge** (S256), stores `state` & `nonce` in a signed, httpOnly cookie, and redirects the user to Telegram’s authorization URL. |
| `/api/auth/telegram/callback` | **GET** | Handles the redirect from Telegram. Validates `state` cookie, exchanges the authorization **code** for an **access token** and **ID token**, verifies the ID token signature using Telegram’s JWKS (`https://oauth.telegram.org/.well‑known/jwks.json`), extracts verified claims (`sub`, `name`, `username`, `photo_url`, `email` etc.), creates/updates a **User** record, signs our own JWT (`jwt.sign(...)`), and returns `{ success: true, token, user }`. |
| `/api/auth/telegram/finalize` | **POST** | (Optional) If you still need a password‑based step, accept `{ telegramId, password }`, verify the password against your DB, then issue our JWT as above. |

### 3.1. Core OIDC Helper Functions (`src/shared/utils/auth.ts`)
```ts
import * as jose from 'jose';
import { randomBytes, createHash } from 'node:crypto';

const TELEG_JWKS_URL = 'https://oauth.telegram.org/.well-known/jwks.json';
let remoteJWKS: jose.RemoteJWKSet | null = null;

export async function getJwks(): Promise<jose.RemoteJWKSet> {
  if (!remoteJWKS) remoteJWKS = jose.createRemoteJWKSet(new URL(TELEG_JWKS_URL));
  return remoteJWKS;
}

/** PKCE helpers */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = createHash('sha256').update(verifier).digest();
  return Buffer.from(hash).toString('base64url');
}

/** Verify Telegram ID Token */
export async function verifyTelegramIdToken(idToken: string, expectedNonce: string) {
  const jwks = await getJwks();
  const { payload } = await jose.jwtVerify(idToken, jwks, {
    issuer: 'https://oauth.telegram.org',
    audience: process.env.TELEGRAM_OPENID_CONNECT_CLIENT_ID,
  });
  if (payload.nonce !== expectedNonce) throw new Error('Invalid nonce');
  return payload as Record<string, any>;
}
```
> **Note:** All functions are pure and can be unit‑tested in isolation.

### 3.2. `auth.service.ts` Changes
* Add methods `initiateOidcFlow`, `handleOidcCallback` that use the helpers above.
* Remove the old `verifyTelegramAuth` and any HMAC‑based logic.
* Keep `authCookieOptions` (httpOnly, sameSite, secure) – now also store `state` and `nonce`.
* Ensure the service returns `authCookieOptions` for both endpoints so the controller can set cookies.

### 3.3. `auth.controller.ts`
* **Login route** – call `authService.initiateOidcFlow(req, res)` and `res.redirect(authUrl)`.
* **Callback route** – call `authService.handleOidcCallback(req, res)`; on success set the **session JWT** as an httpOnly cookie and also return JSON for the frontend (`{ success:true, token, user }`).

---

## 4. Frontend – `AuthView.tsx`
1. **State & hooks** (already added in the file):
   ```tsx
   const { showToast } = useToast();
   const [loading, setLoading] = useState(false);
   const [password, setPassword] = useState('');
   const [telegramId, setTelegramId] = useState<string>('');
   const [step, setStep] = useState<'telegram' | 'password'>('telegram');
   ```
2. **Login button** – calls `/api/auth/telegram/login`. No extra parameters needed; the backend creates `state`/`nonce` cookies and redirects.
3. **Callback handling** – after Telegram redirects back to the app (the page reloads), the **frontend** should read the JSON response from `/api/auth/telegram/callback` (e.g., via `useEffect` on mount) to:
   * Store the returned JWT (`setToken(data.token)`).
   * Persist the user object in `localStorage`.
   * Show a toast (`showToast(...)`).
   * Call `onAuthSuccess(data.user)` to inform parent components.
4. **Password step** (optional) – unchanged, but now uses the verified `telegramId` from the OIDC payload.
5. **Cleanup** – remove all imports that are no longer used (`useEffect`, `useRef`).
6. **Export** – the component is now the default export used throughout the app.

---

## 5. Database (`prisma/schema.prisma`)
```prisma
model User {
  id                String   @id @default(uuid())
  telegramId        String   @unique   // maps to `sub` claim from Telegram OIDC
  telegramUsername  String?
  name              String?
  email             String?   // if you request the `email` scope
  avatarUrl         String?
  passwordHash      String?   // still optional for password‑based step
  // …other fields (createdAt, updatedAt, …)
}
```
* Run `npx prisma generate && npx prisma migrate dev` after updating the schema.
* Existing legacy columns (`telegramId`, `telegramUsername`, etc.) can stay – they will be populated from the OIDC claims.

---

## 6. Tests
* **Auth service unit tests** – mock `jose.jwtVerify` and the remote JWKS request. Verify that `initiateOidcFlow` creates a proper `code_challenge` and sets the `state`/`nonce` cookie.
* **Callback integration test** – simulate a request with a valid `code` and matching `state` cookie, assert that the returned payload contains `user` and a signed JWT.
* **Frontend component tests** (`AuthView.test.tsx`):
  * Mock `fetch('/api/auth/telegram/login')` and ensure the button triggers a redirect.
  * Mock the callback response and verify that `setToken`, `localStorage.setItem`, `showToast`, and `onAuthSuccess` are called.
* Remove legacy tests that reference `verifyTelegramAuth`.

---

## 7. Removal of Legacy Telegram Login Widget
1. Delete `src/shared/utils/auth.ts` functions related to `verifyTelegramAuth` and `computeTelegramHash`.
2. Remove any UI that still references the old widget (e.g., `telegram-widget.js` script tags, `onTelegramAuth` callbacks).
3. Clean up `.env` – the old `TELEGRAM_BOT_TOKEN` is only needed for webhook handling; it is **not** used for OIDC.
4. Run a full TypeScript build (`npm run lint`) to ensure no leftover references.

---

## 8. Security Checklist
- **PKCE**: Use `S256` code challenge (already in helpers).
- **State & Nonce**: Store in a signed, httpOnly cookie; validate on callback.
- **JWKS caching**: `jose.createRemoteJWKSet` handles caching and rotation.
- **HTTPS**: Ensure `APP_URL` points to an HTTPS endpoint; production cookies must have `secure: true`.
- **CSRF protection**: The `state` parameter protects against CSRF; verify it exactly.
- **Token storage**: Store our JWT in an httpOnly cookie *and* optionally in memory for API calls. Do **not** store raw ID tokens client‑side.

---

## 9. Checklist for Colleagues
- [ ] Register OAuth2.0 client in BotFather and add `CLIENT_ID`/`CLIENT_SECRET` to `.env`.
- [ ] Install `jose` and run `npm install`.
- [ ] Implement the helper functions in `src/shared/utils/auth.ts` (see Section 3.1).
- [ ] Update `auth.service.ts` to expose `initiateOidcFlow` & `handleOidcCallback`.
- [ ] Adjust `auth.controller.ts` routes accordingly.
- [ ] Remove legacy `verifyTelegramAuth` code and associated imports.
- [ ] Add the state/nonce cookie handling in the controller.
- [ ] Modify `AuthView.tsx` to use the new hooks/state (already added).
- [ ] Update Prisma schema and run migrations.
- [ ] Add/adjust unit and integration tests as described in Section 6.
- [ ] Run `npm run lint && npm test` – all TypeScript errors should be gone.
- [ ] Deploy to a staging environment and perform a manual OIDC login flow.

---

**With these steps completed, the application will be fully migrated to Telegram’s official OpenID Connect flow, and the legacy widget will be safely removed.**
