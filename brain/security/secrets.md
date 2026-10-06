# MPrnt — Secrets Assessment

> Assessment date: 2026-10-05, same code snapshot as [threat-model.md](threat-model.md).
> **No secret values are reproduced in this document.** Files were inspected with values masked; only variable names, file locations, lengths/shape and placeholder status are reported.

---

## 1. Where secrets are expected

### mprnt-backend (`src/config/environment.ts`)

| Variable | Purpose | Required at production start? (`missingProductionSettings`, `environment.ts:196-227`) | Impact if leaked |
|---|---|---|---|
| `JWT_SECRET` | Signs admin access JWTs (HS256 default) | Yes — refuses the literal default `change_this_secret`; **no length/entropy check** | **Critical**: forge a `super_admin` token |
| `RAZORPAY_KEY_ID` | Razorpay key id (public-ish, sent to browser in order response) | Yes — must be `rzp_live_…`, or `rzp_test_…` with `ALLOW_TEST_PAYMENTS=true` | Low on its own |
| `RAZORPAY_KEY_SECRET` | Razorpay API Basic auth + payment-signature HMAC | Yes (non-empty) | **High**: forge `/payment/verify` signatures, call Razorpay API (refunds, payment data) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook HMAC | **No** — webhook answers 503 when unset | High: forge "payment captured" events |
| `DATABASE_URL` / `DB_*` | Postgres connection | No | **Critical**: all data |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | S3/MinIO access | **No** | **High**: read/delete all customer documents |
| `PRINTER_PROVISIONING_TOKEN` | Shared secret to enroll printers | Yes (non-empty) | Medium–High: enroll rogue printer (see F-23) |
| `ADMIN_PROXY_SECRET` | Lets the admin dashboard relay real client IPs | **No** — feature silently off when unset | Medium: spoof client IP for rate limits and audit log |
| `ALLOW_TEST_PAYMENTS` | Flag, not a secret | — | If `true` in prod: customers can pay with test credentials (F-09) |

Listed in `.env.example` but **not read anywhere in `src/`** (verified by grep): `SENTRY_DSN`, `NEW_RELIC_LICENSE_KEY`, `ADMIN_EMAIL`, `ADMIN_DEFAULT_PASSWORD`, `ENABLE_FILE_VIRUS_SCAN`, `DOCUMENT_RETENTION_DAYS`. `.env.production` also lists `REDIS_URL`, which the code no longer uses. Keeping unused secret-shaped variables invites someone to fill them in for no benefit.

Per-record secrets created by the backend:

| Secret | Generation | Storage | Shown to |
|---|---|---|---|
| Customer session token | `crypto.randomBytes(32)` hex | SHA-256 hash only (`print_sessions.access_token_hash`) | Customer once, in `POST /sessions` response |
| Admin refresh token | `crypto.randomBytes(48)` base64url | SHA-256 hash (`admin_refresh_tokens.token_hash`) | Dashboard server → httpOnly cookie |
| Admin password | bcrypt, `BCRYPT_ROUNDS` (default 12) | `admin_users.password_hash` | — |
| Temporary admin password | `adminUserService.generatePassword` | bcrypt hash | Returned once in the reset/create API response |
| Printer API key | `mprnt_pk_` + `randomBytes(32)` base64url | SHA-256 hash + prefix (`printerAuthService.ts:36-46`) | Once, at enroll/rotate |
| Super-admin initial password | `scripts/create-super-admin.ts` | bcrypt hash | **Printed to stdout** (`create-super-admin.ts:82-83`) |

### mprnt-admin

| Variable | Purpose | Notes |
|---|---|---|
| `MPRNT_API_URL` | Backend base URL | Not secret. `http://` for a remote host is auto-upgraded to `https://` (`lib/session.ts:23-42`). |
| `MPRNT_PROXY_SECRET` | Must equal backend `ADMIN_PROXY_SECRET` | Server-side only (no `NEXT_PUBLIC_` prefix). Sent on every proxied request. |

Runtime secrets held by the dashboard: admin access JWT (`mprnt_at`) and refresh token (`mprnt_rt`) in **httpOnly** cookies, `Secure` when `NODE_ENV=production`, `SameSite=Lax` (`lib/session.ts:48-87`). `mprnt_profile` is deliberately non-httpOnly and carries no secret (role/permissions display hint only).

### mprnt-qr

| Variable | Purpose | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | Public by design (inlined into the bundle). No other env vars are read. |

Runtime secret: the customer's session token, stored in `sessionStorage` under `mprnt-qr:job` (`lib/jobState.ts`, `context/PrintJobContext.tsx:44-55`) and sent as `X-Session-Token`.

### MPrnt/main

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` | Public URLs only. No secrets. |

## 2. Environment / configuration handling

- Backend loads `.env` via `dotenv` (`environment.ts:1-3`) and otherwise reads `process.env` (Railway injects variables; `.railwayignore` excludes `.env`, `.env.local`, `.env.*.local`, `*.example`).
- The production guard throws at import time if critical settings are missing (good), but covers only 4 settings (F-08).
- Insecure fallbacks exist in code: `JWT_SECRET` → `'change_this_secret'` (blocked in prod by the guard), `DB_PASSWORD` → `''`, AWS keys → `''`.
- Docker image: multi-stage, runs as non-root `nodejs` user; env is not baked into the image (only `package*.json`, `dist/` copied). `.dockerignore` exists.

## 3. Hardcoded-secret risks

| Location | What | Real secret? | Classification |
|---|---|---|---|
| `mprnt-backend/.env.production` (**tracked in git**) | 23 keys incl. `DATABASE_URL`, `RAZORPAY_KEY_*`, `AWS_*` | **No** — DB URL is a template (`user`/`password`@`host`); Razorpay/AWS values are placeholder-like; `PRINTER_PROVISIONING_TOKEN` empty. | Security weakness (F-21): a tracked prod env file is where a real value is most likely to be pasted later. |
| `mprnt-backend/.env` and `.env.production.secrets.local` | Local env files | Not inspected for values; both are **git-ignored** (`.gitignore:14,16`, confirmed with `git check-ignore`) and absent from history. | OK — keep local. `.env.production.secrets.local` has `0600` permissions. |
| `mprnt-admin/.env.local` | Local env | Git-ignored (`.env*.local`). Not tracked. | OK |
| `src/config/swagger.ts:266` | Example `rzp_test_` key id | **No** — digits-only sequential dummy (`…1234567890`). | Info |
| `docker-compose.yml`, `docker-compose.minimal.yml` | `POSTGRES_PASSWORD`, `MINIO_ROOT_USER/PASSWORD` | Local-development defaults; Postgres `5432`, MinIO `9000/9001`, Adminer `8080` published on all interfaces. | Security weakness (low): never reuse these for a hosted environment; bind to `127.0.0.1` locally. |
| `src/config/environment.ts:106` | `'change_this_secret'` default | Placeholder; rejected in production. | OK with guard |
| `src/routes/setup.ts` | Seed kiosks | No secrets. | OK |

No admin user, password or API key is seeded by migrations (`migrations/1726999999011_seed-sample-data.ts` seeds kiosks only).

## 4. Client-side exposure risks

| Item | Finding |
|---|---|
| Frontend bundles | Only `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SITE_URL` are exposed. No server secret uses a `NEXT_PUBLIC_` prefix. |
| Razorpay key id | Returned to the QR client in the order response and passed to Checkout. Expected — key ids are public; the **key secret** never leaves the backend. |
| Customer session token | In `sessionStorage` — readable by any JavaScript on the QR origin. The QR app has **no CSP** and loads a third-party worker from `unpkg.com` (F-10). Blast radius: one 15-minute session. |
| Admin tokens | Never reach browser JavaScript (httpOnly cookies, server-side proxy). Good. |
| Temporary passwords | Shown in the admin UI once after reset/create (by design). |
| Presigned S3 URLs | Customer gets a 1-hour URL for its own document (`documentService.getDownloadUrl` default `3600`). The Pi gets a 15-minute URL. Anyone holding the URL can download until expiry. |

## 5. Git / history exposure

Method: `git log -p --all` for each repo, scanning added lines for AWS access key IDs (`AKIA…`), Razorpay key IDs (`rzp_live_` / `rzp_test_` + 10+ chars) and PEM private-key headers; plus every historical value of `RAZORPAY_KEY_SECRET=` checked for placeholder shape (values not printed).

| Repo | Result |
|---|---|
| mprnt-backend | 2 hits, both the dummy swagger example above. Historical `RAZORPAY_KEY_SECRET=` values in `.env.example`, `.env.production` and `BACKEND_IMPLEMENTATION_GUIDE.md` are placeholder-like. Stash `stash@{0}` (with untracked-files tree `b7c356a`) contains no env/secret/key files. Remote: `github.com/mprnt/backend` (no embedded credentials in the remote URL). |
| mprnt-qr, mprnt-admin, MPrnt/main | No env files tracked except `.env.example`; no key-pattern hits. |

**Limitation:** pattern scanning cannot find high-entropy secrets without a recognizable prefix (e.g. JWT secrets, DB passwords, webhook secrets). Run a dedicated scanner (e.g. `gitleaks detect` / `trufflehog git`) on all four repos before treating history as clean. This is a **potential risk requiring verification**, not a finding.

## 6. Logging / error exposure

Verified in code:

- Error handler returns `message` (+ optional `code`) for `AppError`, and a generic `Internal server error` for anything else. Stack traces are logged server-side only (`middleware/errorHandler.ts`).
- No `logger` call was found that logs session tokens, refresh/access tokens, passwords, printer keys, Razorpay secrets or presigned URLs. Printer enrollment logs the key **prefix** only.
- Production HTTP logging uses `morgan('combined')` into winston: URLs (which contain session IDs, job IDs, order IDs — not tokens) and client IPs are logged. Tokens travel in headers and are not logged.
- Logged personal/sensitive data: customer document **filenames**, S3 keys, client IPs, and failed-login attempted e-mail addresses (audit table, `adminAuthService.ts:177`). Users sometimes type a password into the e-mail field; those values would be stored in `audit_logs`.
- Logs go to stdout **and** to `logs/*.log` files inside the container (`utils/logger.ts`), which are lost on redeploy (F-18).
- `scripts/create-super-admin.ts` prints the generated password to stdout. If run through a hosting provider's shell/job runner, that output may be retained in platform logs (F-25).
- WebSocket errors log the raw error object (`websocketService.ts`), no secrets involved.

## 7. Secret rotation requirements

No rotation procedure, key versioning, or dual-key support exists in code. Requirements derived from how each secret is used:

| Secret | Rotation effect in this codebase | Recommended trigger / cadence |
|---|---|---|
| `JWT_SECRET` | Immediately invalidates all admin access tokens (≤15 min anyway); refresh tokens are DB-backed and keep working, so admins are not logged out. Safe to rotate any time. | On any suspicion; at least yearly; on staff departure with infra access. Use ≥32 random bytes. |
| `RAZORPAY_KEY_SECRET` | Regenerate in Razorpay dashboard, update env, redeploy. In-flight checkouts whose handler runs after the switch will fail signature verification and fall back to the order-status path. | On suspicion; at launch when moving from test to live keys. |
| `RAZORPAY_WEBHOOK_SECRET` | Update in Razorpay webhook settings and env together; events signed with the old secret during the gap are rejected (400) and retried by Razorpay. | On suspicion; yearly. |
| AWS keys | Create the new key, deploy, then deactivate the old one (IAM supports 2 active keys). | 90 days or on suspicion. Scope the IAM policy to the single bucket. |
| `DATABASE_URL` password | Provider-side rotation + redeploy. | On suspicion / staff change. |
| `PRINTER_PROVISIONING_TOKEN` | Only affects **new** enrollments; existing printers keep their own keys. | After each provisioning batch, or keep it unset (endpoint returns 503) except while enrolling. Note: production currently **requires** it to be set to start. |
| Printer API keys | `POST /admin/printers/:id/rotate-key` (super admin), revoke via `/revoke`. | On device loss/theft immediately; otherwise periodically. |
| `ADMIN_PROXY_SECRET` / `MPRNT_PROXY_SECRET` | Must change on both services at once; during the gap the backend falls back to the dashboard's own IP (no outage). | On suspicion; yearly. |
| Admin refresh tokens | Revoked on password change, reset, deactivation, deletion, role change, permission change, org suspension, and replay detection. | Automatic. |

## 8. Findings summary (secrets-related)

| ID | Classification | Severity | Summary |
|---|---|---|---|
| F-08 | Missing control | Medium | Production start-up check does not require `RAZORPAY_WEBHOOK_SECRET`, `ADMIN_PROXY_SECRET`, AWS keys, a real `CORS_ORIGIN`, or a minimum `JWT_SECRET` strength. |
| F-07 | Security weakness | Medium | Postgres TLS with `rejectUnauthorized: false` in production — DB credentials and data are exposed to an on-path attacker if the DB is reached over an untrusted network. |
| F-09 | Potential risk requiring verification | High | `ALLOW_TEST_PAYMENTS=true` lets production run on a Razorpay test key. |
| F-21 | Security weakness | Low | `.env.production` tracked in git (placeholders today). |
| F-25 | Recommendation | Info | Super-admin bootstrap prints the password to stdout. |
| — | Potential risk requiring verification | — | Run a full entropy-based secret scan of git history (pattern scan only so far). |
| — | Recommendation | — | Remove unused secret-shaped variables (`SENTRY_DSN`, `NEW_RELIC_LICENSE_KEY`, `ADMIN_DEFAULT_PASSWORD`, `REDIS_URL`, …) from example/prod env files or wire them up. |

Full evidence → risk → fix entries: [security-checklist.md](security-checklist.md#findings-register).
