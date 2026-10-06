# MPrnt — Security Checklist & Findings Register

> Assessment date: 2026-10-05, same code snapshot as [threat-model.md](threat-model.md).
> Nothing in the codebase was changed for this assessment.

**Legend**

- `[x]` control present and verified in code
- `[ ]` control missing or incomplete → see linked finding
- `[?]` cannot be verified from the repositories (hosting/console configuration)

**Finding classes** (used in the register): **Confirmed vulnerability** · **Security weakness** · **Missing control** · **Potential risk requiring verification** · **Recommendation**

---

## Part A — Checklist

### 1. Authentication
- [x] Admin passwords hashed with bcrypt, cost from `BCRYPT_ROUNDS` (default 12) — `adminAuthService.ts`, `adminUserService.ts`
- [x] Unknown-account logins spend a dummy bcrypt compare and return the same generic error — `adminAuthService.ts:96-102`
- [x] Account lockout: 5 failures → 15 min, evaluated in Postgres (timezone-safe) — `adminAuthService.ts:45-46, 84-112`
- [x] Login rate limiter keyed by IP + e-mail — `routes/admin.ts` (`loginRateLimiter`)
- [x] Temporary passwords force a change before any other route works (server-enforced) — `requirePasswordChanged`
- [x] New password minimum length 12 — `adminValidator.ts:29`
- [x] Super admins cannot be created, edited, reset or deleted over HTTP; CLI only — `ASSIGNABLE_ROLES`, `adminUserService`
- [x] Customer access uses a 256-bit per-session secret — `sessionAccessService.ts`
- [x] Printer access uses per-device 256-bit keys, hashed at rest — `printerAuthService.ts`
- [ ] Multi-factor authentication for admins (especially super admins) — **Missing control** (Recommendation R-1)
- [ ] Protection against targeted lockout of known admin e-mails — F-15
- [ ] Password strength/breach check beyond length — Recommendation R-2

### 2. Authorization / RBAC
- [x] Role → permission map with per-user grant/deny overrides — `types/admin.ts`
- [x] Platform permissions cannot be granted to shop staff — `adminUserService.ts:329-342`
- [x] Tenant scope derived from the token; mismatched `organizationId` rejected and logged — `adminAuth.ts:119-160`
- [x] Routes without `resolveTenant` scope inside the service (kiosk update, printer revoke) — `fleetService.ts:97-101, 199-207`
- [x] Pricing kiosk lookups check ownership — `adminController.getPricing`
- [x] Refunds re-check tenant in the service — `refundService.ts:89`
- [x] Customer resources bound to their session via token on every route — `sessionAuth.ts`
- [ ] Role hierarchy / self-modification guard in staff management — F-04
- [ ] Permission changes take effect immediately (access JWT stays valid ≤15 min) — F-14

### 3. Session / token security
- [x] Session and refresh tokens stored only as SHA-256 hashes
- [x] Constant-time comparison for session tokens, printer keys, provisioning token, proxy secret, Razorpay HMACs
- [x] Refresh tokens rotated on use; replay of a revoked token revokes all of the user's sessions — `adminAuthService.ts:298-306`
- [x] Refresh tokens revoked on password change/reset, deactivation, deletion, role change, permission change, org suspension
- [x] Admin tokens never exposed to browser JS (httpOnly, `Secure` in prod, `SameSite=Lax`) — `mprnt-admin/lib/session.ts`
- [x] Customer sessions expire after 15 min (hardcoded) and are cleaned up every minute
- [ ] JWT verification pins the algorithm — Recommendation (F-22)
- [ ] Customer session token protected from script access (stored in `sessionStorage`, no CSP) — F-10

### 4. Input validation
- [x] Joi schemas with `stripUnknown` on body/query/params for most routes — `middleware/validate.ts`
- [x] UUID validation before DB lookups of job/document IDs
- [x] Page ranges parsed and bounded server-side — `pricingService.parsePageRange`
- [x] Lead form length limits + honeypot
- [ ] WebSocket message validation (`jobId` unvalidated, unbounded subscriptions) — F-05
- [ ] Global 10 MB JSON body limit is far above any route's need — F-17

### 5. Injection
- [x] All SQL reviewed is parameterized; the only interpolated fragment (`date_trunc` unit) comes from a fixed map over a Joi-whitelisted value — `dashboardService.ts:327-332`
- [x] No shell execution with user input in the backend
- [x] Razorpay API path built from server-held IDs
- [ ] CSV export does not neutralize spreadsheet formulas (only the printer name is free text) — F-24
- [?] Page range forwarded to CUPS on the Pi must be re-validated there (doc says so; Pi code not in repo)

### 6. XSS / CSRF
- [x] React escaping in all frontends; only `dangerouslySetInnerHTML` is a static theme script — `mprnt-admin/components/ThemeScript.tsx`
- [x] Admin dashboard: Origin/Referer check on all unsafe methods, `SameSite=Lax` cookies — `lib/security.ts`, proxy route
- [x] Admin open-redirect protection on `?next=` — `safeNextPath`
- [x] Backend is token-based (no ambient cookies), so CSRF does not apply to it directly
- [x] Admin and marketing apps set `frame-ancestors 'none'`/`X-Frame-Options: DENY`
- [ ] QR app has no CSP, no framing protection, no other security headers — F-10
- [ ] Admin CSP has no `script-src` (documented trade-off) — Recommendation R-3

### 7. API security
- [x] `helmet()` defaults on the backend
- [x] Generic 500 responses; no stack traces to clients — `errorHandler.ts`
- [x] Mock/setup write endpoints blocked in production — `developmentOnly`
- [x] Platform-wide session listing restricted to super admins
- [ ] Swagger UI/spec publicly reachable in production, with stale "no authentication" text — F-11
- [ ] Public per-kiosk pricing endpoint added without considering rate confidentiality — F-16

### 8. Rate limiting / abuse
- [x] Global limiter (default 100 req/min/IP); session creation 10/min/IP; leads 5/15 min; login 10/15 min per IP+email; printers 120/min per IP+id; enrollment 5 failures/15 min
- [x] Rate limiter runs after `trustedProxy` so limits key on the real admin IP (when configured)
- [ ] Limiter store is in-memory (per instance, reset on deploy) — F-12
- [ ] No WebSocket connection/message limits — F-05
- [?] `trust proxy 1` matches the real proxy chain — F-12
- [?] Relayed admin client IP cannot be spoofed via `X-Forwarded-For` — F-13

### 9. File uploads
- [x] Auth checked before the upload is read
- [x] Size (10 MB) and count (1) limits; one document per session; expired sessions rejected
- [x] MIME allowlist (pdf/png/jpeg)
- [x] Random component in object keys; files served only through presigned URLs
- [ ] File content verification (magic bytes) — F-06
- [ ] Malware scanning — F-06
- [ ] PDF parsing isolated from the request path / time-limited — F-06
- [ ] Extension sanitized before use in the object key — F-06

### 10. Database security
- [x] Parameterized queries throughout
- [x] Financial records protected from cascade deletes (`013_stop_financial_cascade_delete.sql`)
- [x] Secrets (session/refresh tokens, printer keys) stored hashed
- [ ] TLS certificate verification for the DB connection — F-07
- [?] Least-privilege DB role (one role appears to run migrations and the app)
- [?] DB not reachable from the public internet; IP allowlisting at provider

### 11. Secrets
- [x] No real secrets found in tracked files or (pattern-scanned) git history — see [secrets.md](secrets.md)
- [x] Production refuses to start without provisioning token, non-default JWT secret, Razorpay key/secret
- [x] Dashboard proxy secret and admin tokens stay server-side
- [ ] Start-up check for webhook secret, proxy secret, AWS keys, real CORS origin, JWT secret strength — F-08
- [ ] Tracked `.env.production` — F-21
- [ ] Documented rotation procedure — see [secrets.md §7](secrets.md#7-secret-rotation-requirements)
- [?] Full entropy-based history scan (gitleaks/trufflehog)

### 12. Encryption
- [x] HTTPS assumed for all public endpoints; admin dashboard upgrades a remote `http://` API URL to `https://`
- [x] HSTS on backend (helmet default), admin and marketing sites
- [ ] DB TLS without certificate verification — F-07
- [?] S3 default encryption (SSE) — not set in code (`PutObjectCommand` has no `ServerSideEncryption`)
- [?] HSTS for the QR app at the hosting layer — F-10

### 13. CORS
- [x] Explicit origin allowlist from `CORS_ORIGIN`; credentials off by default
- [?] Production `CORS_ORIGIN` set to the real QR/marketing origins (committed file has a placeholder)
- [ ] WebSocket has no Origin check (CORS does not apply to WS) — F-05

### 14. Dependency security
- [ ] Next.js 14.2.5 in all three frontends has critical/high advisories — F-01
- [ ] Backend transitive advisories (`tar`, `glob`/`node-pg-migrate`, `aws-sdk` v2, `uuid`) — F-02
- [ ] Automated dependency scanning in CI (none found in repos) — Recommendation R-4
- [ ] Docker/compose images pinned (compose uses `:latest` for MinIO, mc, Adminer) — Recommendation R-5

### 15. Logging / monitoring
- [x] Structured JSON logs (winston); HTTP access logs in production
- [x] Audit log for admin actions incl. failed logins, lockouts, permission changes, exports, refunds, printer enrollment/revocation, with real client IP when proxy secret is configured
- [x] Security-relevant warnings: cross-tenant attempts, permission denials, bad session tokens, bad printer credentials, refresh-token replay
- [ ] Error tracking / alerting (Sentry DSN declared but unused) — F-18
- [ ] Durable log storage (file transport writes into the container) — F-18
- [ ] Alert on new printer enrollment / super-admin login — Recommendation (F-23)

### 16. Admin security
- [x] Dashboard keeps tokens server-side, enforces Origin checks, restricts proxy to `/admin/*`
- [x] Clickjacking protection on the dashboard
- [x] Suspended organizations cannot sign in or refresh
- [ ] MFA — R-1
- [ ] Intra-tenant privilege boundaries in staff management — F-04
- [ ] Next.js middleware bypass advisory affects the dashboard's page gating (backend still enforces) — F-01

### 17. Deployment / infrastructure
- [x] Non-root container, multi-stage build, `dumb-init`, healthcheck
- [x] `.env*` excluded from Docker/Railway uploads
- [ ] Swagger exposed in production — F-11
- [?] `ALLOW_TEST_PAYMENTS` is not `true` while serving real customers — F-09
- [?] No non-production deployment runs with `NODE_ENV≠production` on a public URL — F-20
- [?] Platform proxy hop count matches `trust proxy 1` — F-12
- [?] Single vs multiple backend instances (affects rate limiting and WS state) — F-12

### 18. Data privacy
- [x] Expired session originals deleted from S3; payment/financial records retained deliberately
- [x] Customer documents only reachable with the session token or a time-limited presigned URL
- [ ] Image thumbnails deleted with the session — F-03 (**confirmed defect**)
- [ ] Documented retention for leads, audit logs, application logs — Recommendation R-6
- [ ] Logged personal data minimized (document filenames, attempted e-mails in audit) — Recommendation R-7
- [?] Privacy policy/terms (QR `app/terms/page.tsx` exists) match actual retention

### 19. Error handling
- [x] Operational errors return controlled messages and codes; unexpected errors return a generic message
- [x] Body-parser errors mapped to 4xx, not 500
- [x] Readiness endpoint hides DB error detail
- [x] Login distinguishes 401/423/429 without revealing whether an account exists
- [ ] Some messages echo client input (e.g. upload MIME type, 404 route path) — low risk in JSON; Recommendation R-8

### 20. Backup / recovery
- [?] Postgres automated backups / point-in-time recovery — F-19
- [?] S3 versioning / replication / object lock — F-19
- [ ] Documented restore procedure and tested restore — F-19
- [x] Financial history survives session cleanup (no cascade deletes)

---

## Part B — Findings register

Format: **Severity → Evidence → Risk → Affected location → Why it matters → Recommended fix**

### F-01 · Confirmed vulnerability · **High** — Next.js 14.2.5 with known advisories in all frontends
- **Evidence:** `node_modules/next/package.json` = 14.2.5 in `mprnt-qr`, `mprnt-admin`, `MPrnt/main`. `npm audit --omit=dev` reports `next` critical (GHSA-gp8f-8m3g-qvj9 cache poisoning, GHSA-g77x-44xx-532m image-optimizer DoS, among others) and `postcss` high; fix available at `next@14.2.35`. 14.2.5 is also in the range affected by CVE-2025-29927 (middleware bypass, fixed 14.2.25).
- **Risk:** cache poisoning / DoS of the public apps; bypass of `mprnt-admin/middleware.ts` page gating.
- **Affected location:** `mprnt-qr/package.json`, `mprnt-admin/package.json`, `MPrnt/main/package.json`.
- **Why it matters:** these are the internet-facing entry points. Admin data stays protected because the backend enforces auth, but the frontends themselves are exposed.
- **Recommended fix:** upgrade to `next@14.2.35` or later in all three apps, rebuild, and re-run `npm audit`.

### F-02 · Confirmed vulnerability · **Medium** — Vulnerable backend dependencies
- **Evidence:** `npm audit --omit=dev` in `mprnt-backend`: `tar` ≤7.5.20 (critical; via `@mapbox/node-pre-gyp`, used by `bcrypt`'s native build), `glob` 11.0.0–11.0.3 (high; CLI `-c` command injection) via `node-pg-migrate` (high), `aws-sdk` v2 (moderate, region validation), `uuid` <11.1.1 (moderate).
- **Risk:** mostly install/build-time or CLI-only paths. `aws-sdk` v2 is also end-of-life.
- **Affected location:** `mprnt-backend/package.json` (`bcrypt`, `node-pg-migrate`, `aws-sdk`, `uuid`).
- **Why it matters:** build pipelines that extract dependency tarballs run with deploy credentials. The runtime uses `@aws-sdk/client-s3` v3 in `storageService.ts`, and no import of `aws-sdk` v2 exists in `src/` or `scripts/`, so v2 is an unused dependency.
- **Recommended fix:** `npm audit fix`; upgrade `node-pg-migrate`; remove the unused `aws-sdk` v2 dependency; move migration tooling to `devDependencies` if not needed at runtime.

### F-03 · Confirmed vulnerability (privacy) · **Medium** — Image thumbnails are never deleted when sessions expire
- **Evidence:** `workers/documentProcessor.ts:62-68` uploads `${s3Key}-thumb.jpg` for every image. `jobs/sessionExpiryJob.ts:79` deletes only `doc.s3_key` and then the `documents` row, so the thumbnail key is lost. Only the customer-initiated `documentService.deleteDocument` (`:202-207`) deletes thumbnails.
- **Risk:** downscaled copies of every uploaded customer image stay in the bucket indefinitely, with no DB reference to find them.
- **Affected location:** `src/jobs/sessionExpiryJob.ts`, `src/workers/documentProcessor.ts`.
- **Why it matters:** this contradicts the clear intent of the expiry job (privacy cleanup), and customer images can contain IDs and other personal data.
- **Recommended fix:** in the expiry job, also delete `${doc.s3_key}-thumb.jpg` for image documents. Add a bucket lifecycle rule as a backstop (e.g. expire `sessions/` objects after N days). Run a one-off cleanup of orphaned `*-thumb.jpg` objects.

### F-04 · Security weakness · **Medium** — No role hierarchy or self-modification guard in staff management
- **Evidence:** `adminUserService.update` (`:173-216`) and `resetPassword` (`:250-273`) only refuse when the target is `super_admin`. There is no comparison of the actor's role with the target's, and no `id === actor` check in `update`. `resetPassword` returns the new temporary password to the caller (`adminController.resetAdminPassword`). `staff:write` is not in the platform-only list, so an owner can grant it to a manager or viewer (`setPermissionOverride`).
- **Risk:** any holder of `staff:write` can promote themselves to `owner` (`PATCH /admin/users/<self>`) or reset an owner's password and sign in as them.
- **Affected location:** `src/services/adminUserService.ts`, `src/routes/admin.ts` (`/users/:id*`).
- **Why it matters:** a delegated permission meant for managing junior staff becomes full shop takeover, including refunds.
- **Recommended fix:** reject actions where the target's role rank is ≥ the actor's (owner > manager > viewer); forbid changing one's own role, active flag or permissions; consider making `staff:write` non-grantable below `owner`.

### F-05 · Security weakness · **Medium** — Unauthenticated, unbounded WebSocket endpoint
- **Evidence:** `services/websocketService.ts:16` creates `new WebSocketServer({ server, path })` with no `verifyClient`, no Origin check and no `maxPayload` (the `ws` default is 100 MiB). Any client can `subscribe` to any string `jobId` without the session token. `subscribe` overwrites `this.clients[clientId]` (`:54`) but leaves earlier subscriptions in `this.subscriptions`, and `handleDisconnect` removes only the last one, so subscription entries leak.
- **Risk:** memory exhaustion / DoS; job-status disclosure to anyone holding a job UUID (status + paid timestamp only).
- **Affected location:** `src/services/websocketService.ts`, `src/index.ts:20`.
- **Why it matters:** WS traffic bypasses Express middleware, including the rate limiter and CORS.
- **Recommended fix:** require the session token (e.g. first message or query) and verify it owns the job; validate `jobId` as a UUID; one subscription per connection, or clean up all of them on close; set `maxPayload` (e.g. 4 KB), a per-IP connection cap, and an Origin allowlist. Alternatively remove WS if the QR app's polling (`lib/polling.ts`) is sufficient.

### F-06 · Security weakness · **Medium** — Upload type trusted from the client; untrusted parsing in-process; no scanning
- **Evidence:** `middleware/upload.ts:11-13` checks `file.mimetype` (the client-sent part `Content-Type`) only. `documentService.ts:93` runs `pdf-parse` on the buffer inside the request. `storageService.ts:47` uses `originalFilename.split('.').pop()` unsanitized in the S3 key. No malware scanning (`ENABLE_FILE_VIRUS_SCAN` exists only in `.env.example`).
- **Risk:** arbitrary bytes labelled `image/png` reach `sharp` and, after payment, CUPS on the Pi; malicious or very complex PDFs can tie up the API event loop; odd characters end up in object keys.
- **Affected location:** `src/middleware/upload.ts`, `src/services/documentService.ts`, `src/services/storageService.ts`, `src/workers/documentProcessor.ts`.
- **Why it matters:** file parsers are a common exploit surface, and the API process is shared by all customers and admins.
- **Recommended fix:** verify magic bytes (`%PDF-`, PNG/JPEG signatures) and reject mismatches; derive the extension from the verified type, not the filename; run page counting with a timeout or in a worker thread; set `sharp`'s `limitInputPixels`; consider ClamAV or a cloud scanner before queuing a job for print.

### F-07 · Security weakness · **Medium** — Database TLS without certificate verification
- **Evidence:** `config/database.ts:35` — `ssl: env.node_env === 'production' ? { rejectUnauthorized: false } : undefined`.
- **Risk:** an on-path attacker between the API and Postgres can impersonate the DB and capture credentials and data.
- **Affected location:** `src/config/database.ts`.
- **Why it matters:** the DB holds everything, including financial data, audit logs and lead PII. Real exposure depends on whether traffic crosses an untrusted network (verify the provider topology).
- **Recommended fix:** supply the provider CA (`ssl: { ca, rejectUnauthorized: true }`) or use `sslmode=verify-full` in `DATABASE_URL`; keep the DB on a private network.

### F-08 · Missing control · **Medium** — Incomplete production configuration guard
- **Evidence:** `environment.ts:196-209` checks only `PRINTER_PROVISIONING_TOKEN`, `JWT_SECRET ≠ default`, the Razorpay key shape and `RAZORPAY_KEY_SECRET`. Not checked: `RAZORPAY_WEBHOOK_SECRET` (the webhook then returns 503), `ADMIN_PROXY_SECRET` (IP relay off), AWS credentials (default `''`), `CORS_ORIGIN` (default `http://localhost:3000`), and JWT secret length.
- **Risk:** a production deploy silently loses webhook-based payment recovery, per-admin IP attribution, or uses a weak JWT secret.
- **Affected location:** `src/config/environment.ts`.
- **Why it matters:** these failures are invisible until an incident (e.g. a customer charged but never printed because the webhook was off).
- **Recommended fix:** extend `missingProductionSettings` to require these, and enforce `JWT_SECRET` ≥ 32 bytes.

### F-09 · Potential risk requiring verification · **High** — Production may accept Razorpay test payments
- **Evidence:** `environment.ts:142, 200-206, 219-226` allow `rzp_test_` keys in production when `ALLOW_TEST_PAYMENTS=true`, with only a console warning. Commit `fb1cc4e` ("Allow an rzp_test_ key in production…") introduced this; the code comment says "Remove it at launch."
- **Risk:** if enabled while kiosks serve the public, anyone can complete checkout with Razorpay's public test cards/UPI and receive real prints for free.
- **Affected location:** backend runtime env (Railway), `src/config/environment.ts`.
- **Why it matters:** this is direct revenue loss, invisible in the dashboard because the orders show as paid.
- **Recommended fix:** check the production env now. Remove the flag before public launch, or make it fail closed after a date or for kiosks marked live, and show a "TEST MODE" banner in the QR app whenever a test key is active.

### F-10 · Security weakness · **Medium** — Customer app has no security headers and loads runtime third-party code
- **Evidence:** `mprnt-qr/next.config.js` is empty (no CSP, `X-Frame-Options`, `nosniff`, HSTS, `poweredByHeader:false`). `app/preview/page.tsx:12` loads `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`. `app/payment/page.tsx` injects `checkout.razorpay.com/v1/checkout.js`. The session token is in `sessionStorage` (`context/PrintJobContext.tsx:44-55`).
- **Risk:** a compromised CDN or any XSS gets the customer's document bytes (the pdf worker receives them) and session token; the payment page can be framed (clickjacking).
- **Affected location:** `mprnt-qr/next.config.js`, `app/preview/page.tsx`, `app/payment/page.tsx`.
- **Why it matters:** this is the app every customer uses, and it handles their private documents and payments.
- **Recommended fix:** self-host the pdf.js worker (copy from `node_modules/pdfjs-dist` into `public/`); add a CSP like the marketing site's, with `script-src` allowing `checkout.razorpay.com`, `frame-src` for Razorpay, `frame-ancestors 'none'`, and `connect-src` for the API; add `nosniff`, `Referrer-Policy` and HSTS; set `poweredByHeader:false`.

### F-11 · Security weakness · **Low** — Swagger UI and spec public in production, with stale security text
- **Evidence:** `app.ts:168` calls `setupSwagger(app)` unconditionally; `config/swagger.ts:269-284` mounts `/api-docs` and `/api-docs.json`. The description (`swagger.ts:22`) says "Currently no authentication required" and misstates the rate limits.
- **Risk:** a complete map of the internal/admin/printer endpoints for attackers; the misleading docs could lead integrators astray.
- **Affected location:** `src/app.ts`, `src/config/swagger.ts`.
- **Why it matters:** this is cheap reconnaissance that removes guesswork.
- **Recommended fix:** mount Swagger only when `NODE_ENV !== 'production'`, or behind admin auth; correct the description.

### F-12 · Security weakness · **Low** (verify) — Rate limiting is in-memory and depends on `trust proxy 1`
- **Evidence:** every `rateLimit(...)` in `middleware/rateLimiter.ts` and `routes/admin.ts` uses the default memory store; `app.ts:26` sets `trust proxy` to `1`.
- **Risk:** limits multiply with instance count and reset on every deploy. If the proxy chain is not exactly one hop, `req.ip` becomes the proxy's address (all users share one bucket) or becomes spoofable.
- **Affected location:** `src/middleware/rateLimiter.ts`, `src/app.ts`.
- **Why it matters:** the login, enrollment and session-creation limits are brute-force defences.
- **Recommended fix:** confirm Railway's hop count and set `trust proxy` accordingly; use a shared store (e.g. a Postgres-backed store, since Redis was intentionally dropped) if you run more than one instance.

### F-13 · Potential risk requiring verification · **Medium** — Admin client IP relayed from browser-controllable headers
- **Evidence:** `mprnt-admin/lib/session.ts:153-156` takes `x-real-ip`, else the **first** `x-forwarded-for` entry, and sends it with the proxy secret. The backend trusts it (`middleware/trustedProxy.ts:51-55`).
- **Risk:** if the dashboard's host appends to (rather than overwrites) `X-Forwarded-For`, an attacker can send any IP. That bypasses the per-IP part of the login limiter and writes false IPs into the audit log.
- **Affected location:** `mprnt-admin/lib/session.ts`, `mprnt-backend/src/middleware/trustedProxy.ts`.
- **Why it matters:** both the login rate limit and the audit trail rely on this IP.
- **Recommended fix:** confirm what the hosting platform guarantees. Prefer the platform's trusted header (e.g. `x-vercel-forwarded-for` / `x-real-ip` set by the edge), or the **last** untrusted hop, rather than the first `x-forwarded-for` entry.

### F-14 · Security weakness · **Low** — Access tokens outlive revocation; JWT algorithm not pinned
- **Evidence:** `adminAuthService.verifyAccessToken` (`:364-389`) trusts `perms`/`role`/`org` from the JWT without a DB check. Revocation (`revokeAllForUser`) affects refresh tokens only. `jwt.verify(token, secret)` is called without an `algorithms` option.
- **Risk:** a deactivated or demoted admin keeps their old permissions for up to `ADMIN_ACCESS_TOKEN_TTL` (15 min).
- **Affected location:** `src/services/adminAuthService.ts`.
- **Why it matters:** offboarding, or responding to a compromised account, is not immediate.
- **Recommended fix:** pass `{ algorithms: ['HS256'] }`. Optionally add a per-user `token_version` or `password_changed_at` check, or keep the TTL short and document it.

### F-15 · Security weakness · **Low** — Targeted lockout of admin accounts
- **Evidence:** 5 failed passwords lock an account for 15 min regardless of source (`adminAuthService.ts:184-202`). The login limiter is keyed by IP+e-mail, so distributed attempts are not throttled per account before the lock.
- **Risk:** anyone who knows an admin's e-mail can keep that admin locked out.
- **Affected location:** `src/services/adminAuthService.ts`, `src/routes/admin.ts`.
- **Why it matters:** this could block a super admin during an incident.
- **Recommended fix:** use progressive delays or a CAPTCHA instead of a hard lock, or lock per (account, IP); alert on repeated lockouts.

### F-16 · Security weakness · **Low** — Public per-kiosk pricing endpoint
- **Evidence:** `src/routes/public.ts:51-70` (added 2026-10-05) returns resolved rates for any kiosk code. `GET /setup/kiosks` lists every kiosk code. Meanwhile `adminController.getPricing` explicitly blocks shop admins from reading another shop's kiosk rates ("negotiated rates").
- **Risk:** competitors or other tenants can enumerate every shop's customer-facing rates.
- **Affected location:** `src/routes/public.ts`, `src/routes/setup.ts`.
- **Why it matters:** this is inconsistent with the confidentiality the admin API enforces. Customers see these prices at the kiosk anyway, so impact is low.
- **Recommended fix:** decide whether customer-facing rates are confidential. If so, serve them through the session (e.g. `GET /sessions/:id/pricing` with the session token) instead of a public lookup.

### F-17 · Security weakness · **Low** — Oversized global body limits
- **Evidence:** `app.ts:46-56` sets `express.json({ limit: '10mb' })` and `urlencoded({ extended: true, limit: '10mb' })` for all routes. No JSON route needs more than a few KB.
- **Risk:** cheap memory/CPU amplification on unauthenticated routes.
- **Affected location:** `src/app.ts`.
- **Why it matters:** together with the in-memory limiter, this lowers the cost of DoS.
- **Recommended fix:** set the default to ~100 KB; keep the raw-body capture for the webhook; drop `urlencoded` if unused.

### F-18 · Missing control · **Low** — No error tracking/alerting; logs written inside the container
- **Evidence:** `SENTRY_DSN`/`NEW_RELIC_*` appear only in `.env.example`; there is no SDK in `src/`. `utils/logger.ts` adds `File` transports under `logs/` (the Dockerfile creates `logs/` in the image).
- **Risk:** security events (replay detection, cross-tenant attempts, lockouts) are logged but nobody is alerted; file logs vanish on redeploy.
- **Affected location:** `src/utils/logger.ts`, deployment.
- **Why it matters:** detection and response depend on someone noticing.
- **Recommended fix:** ship stdout to the platform's log drain; add alerting on `warn`-level security events and 5xx rates; drop the file transports in containers.

### F-19 · Potential risk requiring verification · **Medium** — Backups and recovery not defined in the repos
- **Evidence:** no backup, PITR, S3 versioning or lifecycle configuration in any repository or doc reviewed.
- **Risk:** permanent loss of financial and audit history, or of in-flight paid documents.
- **Affected location:** hosting (DB provider, S3).
- **Why it matters:** refunds and dispute handling rely on payment history.
- **Recommended fix:** confirm that DB automated backups and PITR are enabled; enable S3 versioning, with a lifecycle rule balanced against F-03 retention goals; document and test a restore.

### F-20 · Potential risk requiring verification · **Medium** — Mock payment paths gated only by `NODE_ENV`
- **Evidence:** `routes/payment.ts:26-33` blocks `/payment/mock/*` only when `NODE_ENV === 'production'`; `razorpayService.isTestKey()` (`:125`) switches to the in-memory mock gateway when the key id does not start with `rzp_`.
- **Risk:** a publicly reachable staging/preview backend with `NODE_ENV≠production` lets anyone with a session mark their job paid. If it shares a DB, bucket or printers with production, those prints are free.
- **Affected location:** `src/routes/payment.ts`, `src/services/razorpayService.ts`.
- **Why it matters:** environment misconfiguration is a common way these paths leak.
- **Recommended fix:** gate mock endpoints on an explicit `ENABLE_MOCK_PAYMENTS=true` flag that production refuses to start with; never point non-production environments at production printers or data.

### F-21 · Security weakness · **Low** — Production env file tracked in git
- **Evidence:** `git ls-files` includes `mprnt-backend/.env.production`. Its values are placeholders today (verified without printing them).
- **Risk:** a future edit could commit live secrets to a GitHub repository.
- **Affected location:** `mprnt-backend/.env.production`.
- **Why it matters:** secrets in git history are hard to purge and must be rotated.
- **Recommended fix:** rename it to `.env.production.example`, add `.env.production` to `.gitignore`, and add a pre-commit secret scanner (the repo already has `.husky/pre-commit`).

### F-22 · Recommendation — Remove dead legacy JWT middleware
- **Evidence:** `src/middleware/auth.ts` (`authenticate`/`authorize`) is not imported by any route (`routes/queue.ts:178` notes it was retired), yet it verifies tokens with the same `JWT_SECRET` and trusts a `role` claim.
- **Why it matters:** if it is re-mounted by mistake, it would accept any admin JWT and authorize on a claim that admin tokens do not carry in that shape.
- **Fix:** delete the file.

### F-23 · Security weakness · **Medium** — Deployment-wide printer provisioning secret
- **Evidence:** `middleware/printerAuth.ts:72-98` uses one `PRINTER_PROVISIONING_TOKEN` for all kiosks; `POST /queue/printers/enroll` accepts any kiosk UUID (`queueValidator.enrollPrinterSchema`). Existing mitigations: re-enrolling an existing printer ID is refused (`fleetService.ts:152`); 5 failed attempts/15 min; kiosk UUIDs are not publicly listed; revocation is available to shop managers.
- **Risk:** whoever holds the token (e.g. from one Pi's SD card) can add a rogue printer to any kiosk whose UUID they know, and receive that kiosk's paid documents by winning polls.
- **Affected location:** `src/middleware/printerAuth.ts`, `src/routes/queue.ts`, `src/services/fleetService.ts`.
- **Why it matters:** a single physical compromise affects the whole fleet.
- **Recommended fix:** prefer admin-side enrollment (`POST /admin/printers/enroll`, already exists); keep the provisioning token unset outside enrollment windows (this requires relaxing the production start-up check); or require super-admin approval for device-enrolled printers. Every enrollment is already audit-logged (`printer.enrolled` in `queueController.ts:35` and `adminController.ts:413`); add an alert on that event.

### F-24 · Recommendation · Info — CSV formula neutralisation
- **Evidence:** `dashboardService.ts:607-610` escapes quotes/commas/newlines but not leading `= + - @`. The only free-text column is the printer name (set by a super admin or a printer).
- **Fix:** prefix such cells with `'`.

### F-25 · Recommendation · Info — Bootstrap password printed to stdout
- **Evidence:** `scripts/create-super-admin.ts:82-83`.
- **Fix:** run it only from a local terminal against the production DB, never as a hosted job whose output is retained; the forced first-login change limits the exposure.

### Additional recommendations (not tied to a defect)
- **R-1** Add TOTP/WebAuthn MFA, required for `super_admin` and `owner`.
- **R-2** Check new passwords against a breached-password list (k-anonymity API or local list).
- **R-3** Admin CSP: add a nonce-based `script-src` when feasible.
- **R-4** Add `npm audit --omit=dev` (or Dependabot/Renovate) and a secret scanner to CI for all four repos.
- **R-5** Pin compose images by version/digest; bind dev ports to `127.0.0.1`.
- **R-6** Define retention for `leads`, `audit_logs`, `admin_refresh_tokens` (pruning exists for tokens: `pruneExpiredTokens`), and logs.
- **R-7** Avoid logging original filenames (log the document ID); avoid storing `attemptedEmail` verbatim for unknown accounts, or truncate/hash it.
- **R-8** Avoid echoing raw client input in error messages (`upload.ts:18`, `errorHandler.ts:82`).
- **R-9** Customer session IDs are timestamp-based (`sessionService.ts:67`). They are safe only because of the token; switching to random IDs adds defence in depth.
- **R-10** Re-assess the Raspberry Pi agent separately (not in these repos): key storage on the device, CUPS input validation, OS hardening.
