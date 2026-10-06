# MPrnt — Threat Model

> Assessment date: 2026-10-05. Based strictly on the code present on disk at:
> `mprnt-qr` @ `6e71a72`, `mprnt-backend` @ `dd1221b`, `mprnt-admin` @ `327e936` (+ uncommitted working-tree changes, incl. `lib/security.ts`), `MPrnt/main` @ `82ddd8f` (+ uncommitted changes).
> The Raspberry Pi print agent (`pi_client/`) is **not present** in any of these repositories; its behaviour is taken only from `mprnt-backend/docs/RASPBERRY_PI_INTEGRATION.md` and is unverified.
> Hosting configuration (Railway / Vercel dashboards, DNS, database provider) is not in the repos and is marked "requires verification" wherever it matters.

Finding IDs (`F-xx`) are shared across all four documents. The full evidence for each is in [security-checklist.md](security-checklist.md#findings-register).

---

## 1. System overview

```
 Customer phone (browser)                Shop/platform staff (browser)          Marketing visitor
        │  QR scan                               │                                     │
        ▼                                        ▼                                     ▼
 ┌──────────────────┐                  ┌───────────────────────┐              ┌──────────────────┐
 │ mprnt-qr (Next)  │                  │ mprnt-admin (Next)    │              │ MPrnt/main (Next)│
 │ client-side only │                  │ server-side proxy,    │              │ contact form     │
 │ X-Session-Token  │                  │ httpOnly cookies      │              └────────┬─────────┘
 └───────┬──────────┘                  └──────────┬────────────┘                       │
         │ HTTPS (CORS)                           │ HTTPS + Bearer JWT                 │ POST /public/leads
         │                                        │ + X-MPrnt-Proxy-Secret             │
         ▼                                        ▼                                    ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────────┐
 │ mprnt-backend (Express, Railway)  /api/v1/*  + WebSocket /api/v1/ws  + /api-docs (Swagger) │
 └──────┬───────────────┬──────────────────────┬───────────────────────────┬──────────────────┘
        │ pg (TLS, no   │ S3 SDK (AWS keys)    │ HTTPS Basic auth           │ X-Printer-Id / X-Printer-Key
        │ cert verify)  │                      │                            │
        ▼               ▼                      ▼                            ▼
   PostgreSQL       S3 / MinIO bucket     Razorpay API  ◀── webhook ──  Raspberry Pi agents (per kiosk)
                                          (HMAC-signed)                 fetch docs via presigned S3 URL
```

## 2. Assets

| # | Asset | Where it lives | Why it matters |
|---|---|---|---|
| A1 | Customer documents (PDF/PNG/JPEG) and image thumbnails | S3/MinIO bucket `sessions/<sessionId>/…` and `…-thumb.jpg` | Arbitrary personal content (IDs, contracts, medical/academic papers). Primary privacy asset. |
| A2 | Payment integrity (money ↔ print) | `payment_orders`, `payments`, `print_jobs.total_amount`, Razorpay | Free prints, double charges, or charge-without-print. |
| A3 | Razorpay key secret & webhook secret | Backend env (`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) | Forge payment signatures / webhook events; issue refunds via API. |
| A4 | Admin credentials & tokens | `admin_users.password_hash` (bcrypt), `admin_refresh_tokens.token_hash`, JWT signed with `JWT_SECRET`, dashboard httpOnly cookies | Platform takeover, cross-tenant data access, pricing manipulation, refunds. |
| A5 | `JWT_SECRET` | Backend env | Forge any admin access token, incl. `super_admin`. |
| A6 | Customer session tokens | `print_sessions.access_token_hash` (SHA-256); plaintext in customer's `sessionStorage` | Access to one customer's document, job and payment. |
| A7 | Printer API keys & provisioning token | `printers.api_key_hash` (SHA-256); `PRINTER_PROVISIONING_TOKEN` env | Receive paid customer documents; falsify print status. |
| A8 | AWS / S3 credentials | Backend env | Read/delete every stored document. |
| A9 | Database & `DATABASE_URL` | Postgres (hosted) | All business, financial, audit and PII data. |
| A10 | Business data: revenue, per-shop negotiated prices, audit log | Postgres | Confidential between tenants (shops). |
| A11 | Lead PII (name, email, phone, company, message) | `leads` table | Personal data from marketing form. |
| A12 | Availability of kiosks / API | Backend process, printers | Revenue and service continuity. |

## 3. Actors

| Actor | Trust | Capabilities in this system |
|---|---|---|
| Anonymous Internet user | Untrusted | Public endpoints: create session, `/setup/kiosks`, `/public/pricing`, `/public/leads`, `/health*`, `/api-docs`, WebSocket, admin `auth/login|refresh|logout`, Razorpay webhook URL. |
| Customer | Low (holds own session token) | Upload one document per session, create/update own print job, pay, poll status. |
| Shop viewer / manager / owner | Medium, tenant-bound | Admin API scoped to own organization; owners hold `staff:write`, `refunds:issue`, `audit:read`. |
| Super admin | High | All organizations, pricing, kiosks, printer enrollment/rotation, leads, platform reports. Created only via CLI (`scripts/create-super-admin.ts`). |
| Raspberry Pi printer | Medium, kiosk-bound | Poll/claim jobs for its own kiosk, fetch document via presigned URL, report status. |
| Holder of provisioning token | High (deployment-wide) | Enroll new printers for any kiosk UUID. |
| Razorpay | Trusted third party | Calls webhook; authenticates via HMAC. |
| Hosting/infra operator (Railway, DB, S3, Vercel) | Trusted | Full access to env vars, data, logs. |
| Malicious insider (shop staff) | Medium | Abuse own-tenant permissions; attempt cross-tenant access. |

## 4. Trust boundaries

| ID | Boundary | Enforcement found in code |
|---|---|---|
| TB1 | Customer browser → backend | CORS allowlist (`CORS_ORIGIN`), `X-Session-Token` checked by `middleware/sessionAuth.ts` on every session/job/document/order route. |
| TB2 | Admin browser → admin dashboard server | httpOnly cookies, Origin/Referer check on unsafe methods (`lib/security.ts:isSameOriginRequest`), path allowlist `/admin/*` (`resolveProxyUrl`). |
| TB3 | Admin dashboard server → backend | Bearer JWT; optional `X-MPrnt-Proxy-Secret` to relay client IP (`middleware/trustedProxy.ts`). |
| TB4 | Tenant ↔ tenant (inside admin API) | `resolveTenant` (`middleware/adminAuth.ts:119-160`) + service-level `organization_id` filters. |
| TB5 | Printer → backend | Per-printer API key (`middleware/printerAuth.ts`), jobs filtered by printer's kiosk. |
| TB6 | Razorpay → backend webhook | HMAC-SHA256 over raw body (`paymentService.handleWebhook`). |
| TB7 | Backend → Postgres / S3 / Razorpay | Credentials in env; Postgres TLS **without certificate verification** (F-07). |
| TB8 | Browser → third-party script origins | QR app loads `checkout.razorpay.com` and `unpkg.com` (pdf.js worker) at runtime, no SRI/CSP (F-10). |
| TB9 | Untrusted file content → parsers | `pdf-parse` in request path, `sharp` in background worker, CUPS on the Pi (F-06). |

## 5. Entry points

Full inventory in [attack-surface.md](attack-surface.md). Summary:

- **EP1** Customer API: `POST /sessions`, `/sessions/:id/*`, `/print-jobs/:jobId*`, `/documents/:documentId*`, `/payment/*`, `GET /queue/jobs/:jobId`.
- **EP2** File upload: `POST /sessions/:sessionId/documents` (multer, memory, 10 MB).
- **EP3** Admin API: `/admin/*` (login/refresh/logout public; rest JWT).
- **EP4** Printer API: `/queue/printers/enroll|register`, `/queue/heartbeat`, `/queue/poll`, `/queue/jobs/:jobId/status`.
- **EP5** Webhook: `POST /payment/webhook`.
- **EP6** Public: `/public/leads`, `/public/pricing`, `/setup/kiosks` (GET), `/health`, `/health/ready`, `/`, `/api-docs`, `/api-docs.json`.
- **EP7** WebSocket: `ws(s)://<api>/api/v1/ws`.
- **EP8** Admin dashboard Next routes: `/api/auth/login|logout`, `/api/proxy/[...path]`, pages.
- **EP9** Frontend static apps: `mprnt-qr`, `MPrnt/main`.
- **EP10** Dev-only (blocked when `NODE_ENV=production`): `POST /setup/kiosks`, `/payment/mock/*`.

## 6. Threats, scenarios and risk

Likelihood: **L** low / **M** medium / **H** high. Impact: same scale. Severity = combined judgement.
"Existing mitigations" lists only controls verified in code.

### T1 — Unauthorized access to another customer's document or job (Information disclosure)

- **Scenario:** Attacker guesses/enumerates session IDs (`S` + 13-digit timestamp, predictable) or job/document UUIDs and calls session-scoped routes.
- **Impact:** H (private documents). **Likelihood:** L. **Severity:** Low (residual).
- **Existing mitigations:** 256-bit random session token, only SHA-256 hash stored, constant-time compare (`sessionAccessService.ts:27-37`); required on all session/job/document/order routes, and checked **before** multer reads the upload (`routes/documents.ts`); platform-wide session listing restricted to super admin (`routes/sessions.ts`); presigned URLs expire (1 h customer, 15 min printer).
- **Missing mitigations:** Session token is stored in `sessionStorage`, readable by any script on the QR origin, which has no CSP (F-10). WebSocket job-status subscription needs only a job UUID, no token (F-05; leaks status only).

### T2 — Free printing / payment fraud (Tampering, Repudiation)

- **Scenarios:** (a) client tampers with price; (b) forged `/payment/verify` signature; (c) forged webhook; (d) change settings after paying; (e) pay with Razorpay **test** credentials when production runs on a test key; (f) call mock `simulate-success` on a non-production deployment.
- **Impact:** H (revenue). **Likelihood:** (a–d) L; (e) **H if `ALLOW_TEST_PAYMENTS=true` while serving the public**; (f) depends on staging config.
- **Severity:** (a–d) Low; (e) **High — requires verification (F-09)**; (f) Medium — requires verification (F-20).
- **Existing mitigations:** price computed server-side from DB price lists and snapshotted on the job (`pricingService.ts`, `printJobService.ts`); Razorpay signature HMAC + payment↔order binding + `captured` check (`razorpayService.ts:186-232`); webhook HMAC over raw bytes, disabled with 503 if secret unset (`paymentService.ts:240-250`); paid-amount vs job-total check → `AMOUNT_MISMATCH`, job not queued; settings locked once an order exists; mock endpoints return 404 in production (`routes/payment.ts:26`); startup refuses production without a `rzp_live_` key unless `ALLOW_TEST_PAYMENTS=true` (`environment.ts:196-227`).
- **Missing mitigations:** no enforcement that `ALLOW_TEST_PAYMENTS` is off once real customers are served (only a console warning); mock mode keyed on `NODE_ENV` + key prefix only.

### T3 — Cross-tenant data access by shop staff (Information disclosure, Elevation of privilege)

- **Scenario:** Shop admin passes another org's `organizationId`, kiosk UUID or job ID.
- **Impact:** M–H. **Likelihood:** L. **Severity:** Low (residual).
- **Existing mitigations:** `resolveTenant` derives scope from the token and rejects mismatches (`adminAuth.ts:141-158`); routes without `resolveTenant` (`PATCH /kiosks/:id`, `POST /printers/:id/revoke`) scope inside the service by `req.admin.organizationId` (`fleetService.ts:97-101`, `:199-207`); `GET /admin/pricing?kioskId=` checks kiosk ownership; refunds scoped by tenant (`refundService.ts:89`); platform permissions cannot be granted via overrides (`adminUserService.ts:329-342`); super admins cannot be created, modified, reset or deleted over HTTP.
- **Missing mitigations:** none found for cross-tenant; see T4 for intra-tenant.

### T4 — Privilege escalation inside a shop (Elevation of privilege)

- **Scenario:** An owner grants `staff:write` to a manager via a permission override. That manager can `PATCH /admin/users/<own id>` with `role: owner`, or `POST /admin/users/<owner id>/reset-password`; the API returns the owner's new temporary password, so the manager can sign in as the owner.
- **Impact:** M (full control of one shop, incl. refunds). **Likelihood:** L–M. **Severity:** Medium (F-04).
- **Existing mitigations:** `staff:write` is held only by owners by default; all changes are audit-logged; changes revoke the target's refresh tokens.
- **Missing mitigations:** no role-hierarchy check (an actor can act on equal or higher roles) and no self-modification guard in `adminUserService.update` / `resetPassword`.

### T5 — Admin account compromise (Spoofing)

- **Scenarios:** credential stuffing; stolen refresh token; forged JWT; CSRF against the dashboard; open redirect after login.
- **Impact:** H (super admin = platform). **Likelihood:** L–M. **Severity:** Medium.
- **Existing mitigations:** bcrypt (12 rounds); generic error + dummy bcrypt for unknown accounts; lockout after 5 failures for 15 min; login rate limiter (default 10/15 min per IP+email); refresh tokens 384-bit random, stored hashed, rotated on use, replay detection revokes all sessions; 15-min access tokens; forced password change enforced server-side (`requirePasswordChanged`); min 12-char new password; dashboard keeps tokens in httpOnly, `Secure` (prod), `SameSite=Lax` cookies; Origin check on unsafe methods; `safeNextPath` blocks open redirect; admin pages send `frame-ancestors 'none'`, HSTS, nosniff.
- **Missing mitigations:** no MFA; no password breach/complexity check beyond length; access tokens remain valid up to 15 min after deactivation or permission change (F-14); account lockout can be triggered by anyone who knows an admin email (F-15); client IP used for limits/audit may be spoofable through the dashboard relay (F-13, verify).

### T6 — Theft of a backend secret (Spoofing, Tampering)

- **Scenarios:** `JWT_SECRET`, Razorpay secrets, AWS keys or DB URL leak via repo, logs, client bundle or error output.
- **Impact:** Critical (`JWT_SECRET` → forge super-admin token). **Likelihood:** L. **Severity:** Medium (no leak found; see [secrets.md](secrets.md)).
- **Existing mitigations:** no real secret values found in tracked files or git history (pattern scan); production refuses to start with default `JWT_SECRET`; no secrets in frontend bundles (only `NEXT_PUBLIC_API_URL`); logs do not include tokens/keys (spot-checked).
- **Missing mitigations:** no documented rotation procedure; `.env.production` is tracked in git (currently placeholders only, F-21); DB TLS does not verify the server certificate (F-07).

### T7 — Rogue or compromised printer (Spoofing, Information disclosure)

- **Scenario:** Attacker with the deployment-wide provisioning token enrolls a fake printer for a kiosk and races the real printer to claim paid jobs, receiving customer documents. Or a stolen Pi keeps its key.
- **Impact:** H. **Likelihood:** L. **Severity:** Medium (F-23).
- **Existing mitigations:** token required (prod refuses to start without it), constant-time compare, 5 failed attempts/15 min per IP; re-enrolling an existing printer ID is refused; enrollment needs the kiosk **UUID** (public listing exposes only kiosk codes); per-printer keys (256-bit, hashed); shop owners/managers can revoke; jobs scoped to the printer's kiosk.
- **Missing mitigations:** single shared provisioning secret for the whole deployment; no admin approval step for device-enrolled printers; enrollments are audit-logged (`printer.enrolled`) but nothing alerts on them.

### T8 — Malicious file upload (Tampering, DoS)

- **Scenario:** Upload a crafted PDF (parser bomb / exploit) or an arbitrary file declared as `image/png`; it is parsed by `pdf-parse` in the request, by `sharp` in the worker, and finally printed by CUPS on the Pi.
- **Impact:** M (DoS, printer-side parser exposure). **Likelihood:** M. **Severity:** Medium (F-06).
- **Existing mitigations:** session token required before upload is read; 10 MB / 1 file limit; MIME allowlist; one document per session; session creation 10/min/IP.
- **Missing mitigations:** type is the **client-declared** MIME only (no magic-byte check); no malware scan (`ENABLE_FILE_VIRUS_SCAN` in `.env.example` is unused); PDF parsing runs in the API process with no timeout; extension from the original filename goes unsanitized into the S3 key.

### T9 — Denial of service (DoS)

- **Scenarios:** WebSocket flood / large frames / subscription leak; repeated 10 MB JSON bodies; PDF parsing load; storage filling via many sessions; in-memory rate limits reset on deploy or split across instances.
- **Impact:** M. **Likelihood:** M. **Severity:** Medium (F-05, F-12, F-17).
- **Existing mitigations:** global limiter (default 100 req/min/IP), session-creation limiter (10/min/IP), printer and lead limiters; sessions expire after 15 min (hardcoded in `sessionService.calculateExpiry`; `SESSION_TIMEOUT_MINUTES` is not used for this) and files of expired sessions without an unfinished paid job are deleted.
- **Missing mitigations:** no WebSocket limits/auth; in-memory limiter store; 10 MB body limit on every JSON route.

### T10 — Customer data retained longer than intended (Privacy)

- **Scenario:** Image thumbnails (`<key>-thumb.jpg`) are written to S3 by the document worker but the expiry job deletes only the original object.
- **Impact:** M (indefinite retention of customer images). **Likelihood:** H (happens for every image upload whose session expires). **Severity:** Medium — **Confirmed** (F-03).
- **Existing mitigations:** originals of expired, unpaid/finished sessions are deleted; financial records are deliberately preserved.
- **Missing mitigations:** thumbnail deletion in the expiry path; no bucket lifecycle rule in repo; no documented retention policy for leads/audit/logs.

### T11 — Third-party script compromise in the customer app (Tampering)

- **Scenario:** `unpkg.com` serves a modified `pdf.worker.min.mjs`; the worker runs inside the QR origin and receives the customer's PDF bytes.
- **Impact:** H (document exfiltration). **Likelihood:** L. **Severity:** Medium (F-10).
- **Existing mitigations:** version pinned to the installed `pdfjs` version.
- **Missing mitigations:** no Subresource Integrity, no CSP, worker not self-hosted.

### T12 — Information disclosure via public metadata

- **Scenario:** Public Swagger (`/api-docs`, `/api-docs.json`) maps every route; `/setup/kiosks` lists all kiosk codes; `/public/pricing?kioskId=` returns each kiosk's resolved rates (added 2026-10-05), which the admin API otherwise treats as confidential between shops.
- **Impact:** L. **Likelihood:** H. **Severity:** Low (F-11, F-16).

### T13 — Vulnerable dependencies

- **Scenario:** Known advisories in Next.js 14.2.5 (all three frontends) and backend transitive packages.
- **Impact:** varies, see F-01/F-02. **Severity:** High (frontends, by `npm audit` rating) / Medium (backend).

### T14 — Loss of data / inability to recover

- **Scenario:** DB or bucket loss/corruption, ransomware via leaked AWS key.
- **Impact:** H. **Likelihood:** L. **Severity:** Medium — **requires verification** (F-19): nothing in the repos configures backups, PITR, or S3 versioning.

## 7. Risk summary

| Severity | Findings |
|---|---|
| High | F-01 (Next.js advisories), F-09 (test payments in prod — verify) |
| Medium | F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-10, F-13 (verify), F-19 (verify), F-20 (verify), F-23 |
| Low | F-11, F-12, F-14, F-15, F-16, F-17, F-18, F-21 |
| Info / Recommendation | F-22, F-24, F-25 |

No finding was rated Critical: no exploitable authentication bypass, injection, or secret leak was found in first-party code.
