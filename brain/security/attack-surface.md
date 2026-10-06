# MPrnt — Attack Surface

> Assessment date: 2026-10-05, same code snapshot as [threat-model.md](threat-model.md).
> Base path for the backend API: `/api/v1` (`API_VERSION`, default `v1`). All routes below are relative to it unless they start with `/health`, `/api-docs` or `/`.
> "Guard" lists only middleware actually mounted on the route (verified in `src/routes/*.ts`). Every backend route additionally passes through `helmet()`, CORS, `trustedProxy`, and the global rate limiter (`app.ts:29-42`).

---

## 1. Public endpoints (no credential)

| Method & path | Guard | Purpose / exposure |
|---|---|---|
| `GET /` | global limiter | API banner (name, version). |
| `GET /health` | global limiter | Uptime + `environment` value (reveals `NODE_ENV`). |
| `GET /health/ready` | global limiter | DB ping; no error detail in body. |
| `GET /api-docs`, `GET /api-docs.json` | **none** (mounted unconditionally, `app.ts:168`) | Full OpenAPI spec and Swagger UI in every environment (F-11). |
| `POST /sessions` | `sessionRateLimiter` (10/min/IP), Joi | Creates a session for a kiosk code; returns the session token once. |
| `GET /setup/kiosks` | global limiter | Lists **all** kiosks: code, name, location, status, capabilities. Internal UUIDs and organization not exposed. |
| `POST /setup/kiosks` | `developmentOnly` (404 in production) | Creates/alters `kiosks` table and seeds rows. |
| `GET /public/pricing?kioskId=<code>` | global limiter only | Resolved B/W & colour rates + min charge for any kiosk code. Added 2026-10-05 (F-16). |
| `POST /public/leads` | `leadRateLimiter` (5/15 min/IP), Joi, honeypot field | Marketing contact form → `leads` table (PII). |
| `POST /payment/webhook` | HMAC signature (in service) | Razorpay events; 503 if secret unset, 400 on bad signature. |
| `POST /payment/mock/simulate-success`, `/simulate-failure` | `developmentOnly`, Joi, session token | Mock gateway. 404 in production. |
| `POST /admin/auth/login` | `loginRateLimiter` (default 10/15 min per IP+email, successes skipped), Joi | Admin sign-in. |
| `POST /admin/auth/refresh`, `/admin/auth/logout` | Joi only | Refresh-token exchange / revocation. Tokens are 384-bit random. |
| `ws(s)://…/api/v1/ws` | **none** | WebSocket job-status subscriptions (F-05). |

## 2. Customer endpoints (require `X-Session-Token`)

Token is verified against the owning session of the resource (`middleware/sessionAuth.ts`). Missing → 401 `SESSION_TOKEN_REQUIRED`; wrong/foreign → 403 `SESSION_TOKEN_INVALID`; unknown resource → passes through to the route's own 404.

| Method & path | Additional guards |
|---|---|
| `GET /sessions/:sessionId`, `DELETE /sessions/:sessionId` | Joi params |
| `POST /sessions/:sessionId/documents` | token checked **before** multer; multer 10 MB, 1 file, MIME allowlist |
| `GET /sessions/:sessionId/documents` | — |
| `POST /sessions/:sessionId/print-jobs`, `GET …/print-jobs` | Joi body |
| `GET /print-jobs/:jobId`, `PATCH /print-jobs/:jobId/settings` | UUID check, Joi |
| `POST /print-jobs/:jobId/payment/order`, `GET /print-jobs/:jobId/payment` | — |
| `POST /payment/verify`, `POST /payment/failure` | Joi body (orderId resolves the session) |
| `GET /payment/order/:orderId`, `GET /payment/order/:orderId/status` | — |
| `GET /documents/:documentId`, `/preview`, `/download`, `DELETE /documents/:documentId` | UUID check; delete refused for paid/queued jobs |
| `GET /queue/jobs/:jobId` | Joi params |

Identifier properties: session IDs are `S` + millisecond timestamp (**predictable**, `sessionService.ts:67`); job/document IDs are UUIDv4; order IDs are Razorpay/mocked IDs. Predictable session IDs are acceptable only because every session route also requires the 256-bit token.

## 3. Admin API (`/admin/*`)

Mounted order (`routes/admin.ts`): public auth routes → `authenticateAdmin` (JWT) → `/auth/me`, `/auth/change-password` → `requirePasswordChanged` → everything else.

| Area | Routes | Authorization |
|---|---|---|
| Organizations | `POST/GET /organizations`, `GET/PATCH/DELETE /organizations/:id`, `POST /organizations/:id/status`, `POST /organizations/:id/kiosks` | `requireSuperAdmin` |
| Users | `POST /users` | `requireSuperAdmin` |
| | `GET /users`, `GET /users/:id`, `GET /users/:id/permissions` | `resolveTenant` + `staff:read` |
| | `PATCH/DELETE /users/:id`, `POST /users/:id/reset-password`, `POST /users/:id/unlock`, `PUT /users/:id/permissions` | `resolveTenant` + `staff:write` (no role-hierarchy check, F-04) |
| Catalogue | `GET /permissions` | any authenticated admin |
| Reports | `GET /reports/summary|series|kiosks` | `resolveTenant` + `reports:read` |
| | `GET /reports/sessions` | `resolveTenant` + `sessions:read` |
| | `GET /reports/sessions/export` (CSV) | `resolveTenant` + `export:data` |
| | `GET /reports/organizations`, `GET /queue/status` | `requireSuperAdmin` |
| Operations | `GET /printers`, `GET /kiosks` | `resolveTenant` + `printers:read` |
| | `GET /attention` | `resolveTenant` + `reports:read` |
| | `GET /audit` | `resolveTenant` + `audit:read` (service re-scopes by principal) |
| | `GET /audit/actions` | `audit:read` (scoped by principal in service) |
| Kiosks | `POST /kiosks` | `requireSuperAdmin` |
| | `PATCH /kiosks/:id` | `printers:manage`; org scope enforced in `fleetService.updateKiosk` |
| Printers | `POST /printers/enroll`, `POST /printers/:printerId/rotate-key` | `requireSuperAdmin` |
| | `POST /printers/:printerId/revoke` | `printers:manage`; org scope enforced in `fleetService.printerOrganization` |
| Pricing | `GET /pricing`, `GET /pricing/lists` | `resolveTenant` + `pricing:read` (kiosk ownership checked) |
| | `POST /pricing/lists` | `pricing:write` (super admin only; not grantable to shop staff) |
| Leads | `GET /leads` | `requireSuperAdmin` |
| Refunds | `POST /print-jobs/:jobId/refund` | `resolveTenant` + `refunds:issue`; tenant re-checked in `refundService` |
| Sessions (outside `/admin`) | `GET /sessions` | `authenticateAdmin` + `requirePasswordChanged` + `requireSuperAdmin` |

## 4. Printer (Raspberry Pi) endpoints (`/queue/*`)

| Method & path | Guards |
|---|---|
| `POST /queue/printers/enroll` | `printerEnrollRateLimiter` (5 failed/15 min/IP), `X-Provisioning-Token` (constant-time), Joi. Refuses an already-enrolled printer ID. |
| `POST /queue/printers/register` | `printerRateLimiter` (120/min per IP+printer-id), `X-Printer-Id` + `X-Printer-Key` |
| `POST /queue/heartbeat`, `POST /queue/poll`, `POST /queue/jobs/:jobId/status` | same as above; jobs filtered by the authenticated printer's kiosk; status updates refused for jobs held by another printer |

Poll responses contain a presigned S3 URL (TTL `PRINTER_DOCUMENT_URL_TTL_SECONDS`, default 900 s).

## 5. Authentication / authorization surfaces

| Surface | Mechanism | Notes |
|---|---|---|
| Customer | Opaque 256-bit session token, SHA-256 at rest | Lifetime = session (15 min, hardcoded). Stored client-side in `sessionStorage`. |
| Admin | HS-signed JWT (15 min) + DB refresh token (7 days, rotated, replay-detected) | `jwt.verify` without an explicit `algorithms` list (F-14/F-22). Permissions embedded in the JWT. |
| Admin dashboard ↔ browser | httpOnly cookies, Origin check, `/admin/*` path allowlist | Middleware redirect is UI-only; real checks are in the backend. |
| Dashboard ↔ backend | Bearer JWT + optional proxy secret | Relayed client IP comes from `x-real-ip` / first `x-forwarded-for` (F-13). |
| Printer | Printer ID + 256-bit key, SHA-256 at rest | Revocable; rotation super-admin only. |
| Enrollment | Shared provisioning token | Deployment-wide (F-23). |
| Razorpay | HMAC (verify + webhook) | Constant-time comparison. |
| Legacy | `src/middleware/auth.ts` (`authenticate`/`authorize`) | **Not mounted anywhere** (dead code) but shares `JWT_SECRET` (F-22). |

## 6. User inputs

| Input | Validation found |
|---|---|
| JSON bodies (all routes) | `express.json({ limit: '10mb' })` globally (F-17); Joi with `stripUnknown: true` on routes that declare a schema. |
| URL-encoded bodies | `extended: true`, 10 MB. No route consumes form posts. |
| Query params (reports, audit, sessions list) | Joi schemas (`reportQuerySchema`, `auditQuerySchema`, `listSessionsSchema`, `periodQuerySchema`). |
| Path params | UUID / pattern validation on most routes (`validateJobIdParam`, `idParamSchema`, `validateDocumentId`, `getSessionSchema`). |
| `kioskId` on `POST /sessions` and `/public/pricing` | Looked up by code with a parameterized query. |
| Page ranges (`customRange`) | Parsed numerically server-side (`pricingService.parsePageRange`); forwarded to the Pi — docs instruct the Pi to re-validate before CUPS (unverified). |
| WebSocket messages | `JSON.parse`, `type` switch; `jobId` not validated (F-05). |
| Lead form | Joi lengths + e-mail format + honeypot. |
| Admin dashboard `?next=` | `safeNextPath` (same-origin path only). |
| QR app `?kioskId=` | Sent to `POST /sessions`; encoded in `homeHref`. |

SQL: all queries reviewed use `$n` parameters. The only interpolated SQL fragments are internal (`scope`, `sets`, `${unit}` from a fixed map in `dashboardService.getTimeSeries`, whose input is Joi-whitelisted).

## 7. File uploads

| Aspect | Current behaviour |
|---|---|
| Entry | `POST /sessions/:sessionId/documents`, field `document` |
| Auth | Session token checked before the body is read |
| Limits | 10 MB, 1 file (`middleware/upload.ts`); one document per session; session must not be expired |
| Type check | Client-declared `Content-Type` against `pdf/png/jpeg/jpg` — **no content sniffing** (F-06) |
| Storage | Memory buffer → S3 `sessions/<sessionId>/<ts>-<rand>.<ext>`; `<ext>` taken unsanitized from the original filename (F-06) |
| Parsing | `pdf-parse` synchronously in the request (page count); `sharp` resize in the background worker for images; final rendering by CUPS on the Pi |
| Malware scanning | None |
| Retention | Original deleted when the session expires (unless an unfinished paid job exists). Thumbnails `<key>-thumb.jpg` **not** deleted by the expiry job (F-03). |
| Download | Presigned URL, 1 h (customer), 15 min (printer) |

## 8. Database access

- PostgreSQL via `pg` pool (`config/database.ts`), size 2–20. Production TLS `{ rejectUnauthorized: false }` (F-07).
- One application role is used for everything (migrations, runtime, admin). No row-level security; tenancy enforced in application code.
- Migrations: `node-pg-migrate` (`migrations/*.ts`) plus raw SQL files (`migrations/0xx_*.sql`, `scripts/run-migration.ts`). Financial tables were changed to stop cascade deletes (`013_stop_financial_cascade_delete.sql`).
- Advisory locks serialize the background jobs (`utils/advisoryLock.ts`).
- Adminer (`adminer:latest`) on `:8080` in both docker-compose files — local development only.

## 9. Storage

- AWS S3 or MinIO (`S3_ENDPOINT` → path-style). Bucket name default `mprnt-documents`.
- Objects written with `ContentType` only; no explicit `ServerSideEncryption`, ACL or object tagging in code. Bucket policy, default encryption, public-access block, versioning and lifecycle rules are **not in the repo** (requires verification, F-19).
- Credentials: static access keys from env.

## 10. Webhooks

| Webhook | Verification | Behaviour |
|---|---|---|
| Razorpay `payment.captured` / `order.paid` → `POST /payment/webhook` | HMAC-SHA256 of the raw body with `RAZORPAY_WEBHOOK_SECRET`, constant-time | Other events ignored; unknown orders acknowledged; amount checked against job; idempotent on already-captured. No timestamp or event-id replay window, but processing is idempotent. |

## 11. Third-party integrations

| Service | Direction | Credential | Notes |
|---|---|---|---|
| Razorpay API | backend → `api.razorpay.com` (HTTPS, Basic auth) | key id + secret | Orders, payment fetch, refunds |
| Razorpay Checkout JS | QR browser loads `https://checkout.razorpay.com/v1/checkout.js` | key id | No SRI (Razorpay does not publish SRI hashes); no CSP on QR app |
| unpkg CDN | QR browser loads `//unpkg.com/pdfjs-dist@<ver>/build/pdf.worker.min.mjs` | — | Runtime third-party code processing the customer's PDF (F-10) |
| AWS S3 / MinIO | backend | access keys | Documents + thumbnails |
| PostgreSQL host | backend | `DATABASE_URL` | TLS without certificate verification |
| Railway (backend hosting) | — | — | Inferred from `.railwayignore`; configuration not in repo |
| Frontend hosting | — | — | `.env.production` CORS placeholder suggests Vercel; not verifiable from the repos |

## 12. Admin surfaces

- **mprnt-admin** Next.js app: pages under `app/(dashboard)/*` (organizations, staff, pricing, printers, sessions, audit, attention, leads, account); API routes `/api/auth/login`, `/api/auth/logout`, `/api/proxy/[...path]`.
- Security headers on every admin response: `frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS (`next.config.js`). No `script-src` policy (comment explains nonces would be required).
- `ThemeScript` uses `dangerouslySetInnerHTML` with a static, non-user-controlled script string.
- CSV export downloads stream through the proxy with the backend's `content-disposition`.
- Super-admin bootstrap: `scripts/create-super-admin.ts` (CLI with DB access).

## 13. Network / deployment exposure

| Item | Evidence | Note |
|---|---|---|
| Backend binds `0.0.0.0:$PORT` | `src/index.ts:13` | Expected behind the platform proxy |
| `app.set('trust proxy', 1)` | `app.ts:26` | Correct only if exactly one proxy hop sets `X-Forwarded-For` (requires verification, F-12) |
| HTTP + WebSocket on the same port | `websocketService.initialize(server, …)` | WS inherits no Express middleware (no CORS, no rate limit, no helmet) |
| Docker image | `Dockerfile` | node:22-alpine, non-root, `dumb-init`, healthcheck on `/health` |
| Local compose | `docker-compose*.yml` | Postgres 5432, MinIO 9000/9001, Adminer 8080 published on all interfaces; `:latest` tags for MinIO/mc/Adminer |
| HSTS | backend via helmet default; admin and marketing via `next.config.js` | **QR app sends none of its own** (F-10) |
| CORS | `origin: CORS_ORIGIN` list, `credentials` false unless `CORS_CREDENTIALS=true` | Committed `.env.production` holds a placeholder origin |

## 14. Dependencies

`npm audit --omit=dev` results (2026-10-05):

| Project | Summary | Packages |
|---|---|---|
| mprnt-backend | 1 critical, 3 high, 2 moderate | `tar` ≤7.5.20 (critical, via `@mapbox/node-pre-gyp` ← `bcrypt` native build), `glob` 11.0.0–11.0.3 (high, CLI) via `node-pg-migrate` (high), `@mapbox/node-pre-gyp` (high), `aws-sdk` v2 (moderate, region validation), `uuid` <11.1.1 (moderate) |
| mprnt-qr | 1 critical, 1 high | `next` 14.2.5 (fix ≥14.2.35), `postcss` (via next) |
| mprnt-admin | 1 critical, 1 high | same `next` 14.2.5 / `postcss` |
| MPrnt/main | 1 critical, 1 high | same `next` 14.2.5 / `postcss` |

Installed Next.js is **14.2.5** in all three frontends. This version range is also affected by the publicly known middleware authorization bypass (CVE-2025-29927, fixed in 14.2.25). In `mprnt-admin` the middleware only gates page rendering; data access is enforced by the backend, so the practical impact is limited to rendering empty dashboard shells (F-01).

Other notable components: `pdf-parse` 2.x and `sharp` 0.35 process untrusted files; `jsonwebtoken` 9; `bcrypt` 5; `express` 4.19; `helmet` 7; `multer` 1.4.5-lts.1; `ws` 8.

## 15. Other externally reachable surfaces

- **MPrnt/main** marketing site: static pages + contact form posting to `/public/leads`. CSP present (`script-src 'self' 'unsafe-inline'`), frame-ancestors none, HSTS preload.
- **mprnt-qr** customer app: fully client-side; reads `?kioskId=`; stores job state + session token in `sessionStorage`.
- **Raspberry Pi agents** (not in repo): outbound-only HTTPS polling per the integration doc; they also download from S3 and drive CUPS. Their own exposure (SSH, local network, OS hardening) is out of scope and unverified.
