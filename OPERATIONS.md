# Nice Numbers — Operations & Architecture

**Single source of truth for how this app is built, deployed, and wired.**
If anything here disagrees with another doc, this file wins. Update it in the same commit as any infrastructure change.

- **Public name:** Nice Numbers · tagline **"Share & Celebrate"**
- **Primary domain:** https://nicenumbers.app  (legacy https://happymoments.app → should 301 here)
- **Repo:** https://github.com/GorazdLampic/HappyMoments  (folder/repo keep the old name; only the *display* name changed)
- **Last verified:** 4 Jul 2026 · web **v96 / 2.9.6**

### What changed since 22 Jun (4 Jul 2026)
- **Payments are LIVE.** Stripe account activated (identity verified 3 Jul); `pk_live`/`sk_live`/live webhook set. Checkout is **card-only** (`payment_method_types=card`) for both premium and gifts. Printful has a billing card on file.
- **Premium is now ACCOUNT-LESS.** No sign-in required. Purchase → Stripe → local `happymoments_premium_until`; restore via `/api/premium-status?session_id=` (strict) or `?email=`. Firebase sign-in is legacy/optional — the premium flow no longer uses it.
- **Service worker is NETWORK-FIRST** for app code (HTML/JS/CSS/JSON); images stay cache-first. Kills the stale-cache problem. `sw.js` served `no-cache`.
- **Reminder backend (opt-in, non-breaking):** `functions/api/reminders.js` + `workers/reminder-cron/` (Web Push/VAPID). See `docs/REMINDERS_BACKEND.md`. Client wiring deferred pending consent-UX review.
- **Security hardening (audit 3–4 Jul):** premium-status session grant tightened (paid+livemode+premium-only); XSS sinks fixed via `jsAttr()` double-encoding (gift picker, wizard share, deep-link `?n=`); share-preview escaped before linkify; CSP + security headers in `web/_headers`.
- **Number alignment:** row = share message = card = gift all use `formatMilestoneValue` (repdigits stay exact; clean rounds abbreviate consistently).

> **Naming truth (read once, never be confused again):** "Nice Numbers" is the **display name** (everything a user sees). "happymoments" survives only as **technical identifiers** — the package id, the Firebase project, localStorage keys, the cache name, and the legacy domain. Those MUST NOT be renamed (doing so breaks existing user data and live backends). See [Identity & naming](#identity--naming).

---

## 1. System at a glance

```
                 ┌───────────────────────────────────────────────┐
   User (web)    │  Cloudflare Pages project (one origin)         │
   ───────────►  │                                                │
                 │   Static PWA (built from web/ → dist/)         │
   User (Android)│   + Pages Functions  (functions/api/*)         │
   via Capacitor │        │                                       │
   WebView ─────►│        ├── D1 database (binding: DB)           │
                 │        ├── Stripe   (payments + webhook)       │
                 │        ├── Printful (gift fulfilment)          │
                 │        └── Firebase Auth (Google/email sign-in)│
                 └───────────────────────────────────────────────┘

  GitHub repo ──push to main──► Cloudflare Pages auto-build & deploy (WEB)
  GitHub repo ──git tag v*──► GitHub Actions ──► signed AAB/APK ──► (manual) Play Console (ANDROID)
```

Frontend talks to the backend with **relative `/api/*` calls on the same origin** — no separate API host, no CORS for first-party traffic. (`_middleware.js` CORS exists for safety / other origins.)

---

## 2. Repositories, domains, accounts

| Thing | Value | Notes |
|---|---|---|
| Git repo | `GorazdLampic/HappyMoments` (GitHub) | Branch `main` is production for web |
| Primary domain | `nicenumbers.app` | Cloudflare custom domain on the Pages project |
| Legacy domain | `happymoments.app` | Same Pages project; 301 → nicenumbers.app via `functions/_middleware.js` (live after next deploy) |
| Hosting | Cloudflare Pages | Auto-deploys from `main` |
| Database | Cloudflare D1 (binding `DB`) | Tables: `users`, `events` |
| Auth | Firebase project `happymoments-app` | Google + email sign-in |
| Payments | Stripe | Premium subscription + gift checkout |
| Gifts | Printful | Personalized print-on-demand |
| Android signing | GitHub Actions + upload keystore | See [Android release](#7-android-release-runbook) |
| Play Store | App id `si.quantumwave.happymoments` (**permanent**) | Listing display name → "Nice Numbers" |

---

## 3. Identity & naming

### Display name — fully "Nice Numbers" everywhere a user looks
PWA manifest, page `<title>`, og/twitter tags, share image cards, all 19 language files, and the Android launcher label (`android/app/src/main/res/values/strings.xml` → "Nice Numbers", fixed 22 Jun). No user-facing "HappyMoments" text remains.

### Technical "happymoments" identifiers — KEEP, do not rename
| Identifier | Where | Why it must stay |
|---|---|---|
| `applicationId si.quantumwave.happymoments` | `android/app/build.gradle` | Permanent once published; users never see it |
| localStorage keys (`happyMomentsData`, `happymoments_theme`, `_premium_until`, `_locale`, `_consent`, `_notif_prefs`, `_dk`…) | `web/*.js` | Existing users' saved data lives here — rename = data loss |
| Firebase project `happymoments-app` | `web/auth.js` | Real backend project id |
| `happymoments.app` domain + CORS entries | `_middleware.js`, link regexes | Live legacy domain (will redirect, not disappear) |
| `CACHE_NAME = happymoments-vNN` | `web/sw.js` | Internal service-worker cache key; bump per release |

---

## 4. Deploy pipelines

### Web (automatic)
`git push` to `main` → Cloudflare Pages builds and deploys → live on `nicenumbers.app` within ~1–2 min.
Cloudflare runs `node build.js` (configured in the Pages dashboard) which minifies `web/` → `dist/` and writes a versioned `sw.js`. Pages Functions are read from the repo-root `functions/` directory (not `dist/`): `functions/_middleware.js` (canonical-domain 301) runs for all routes, then `functions/api/_middleware.js` (CORS) for `/api/*`.

### Android (tag-triggered)
`git tag vNN && git push --tags` → GitHub Actions (`.github/workflows/build-android.yml`) builds a **signed release AAB** + debug APK → publishes them to the GitHub Release tagged `latest`. You then **manually** download the AAB and upload it to Play Console.

> **Current gap:** Android `versionCode`/`versionName` (94 / 2.9.4) is ~9 commits BEHIND web. The last Android tag predates the Nice Numbers rebrand. Next Android build needs: fix `strings.xml` label → bump version → new tag.

---

## 5. Services & where each is configured

| Service | Used by | Configured in | Repo touch-points |
|---|---|---|---|
| **Cloudflare Pages** | Everything (host + functions) | CF dashboard → Pages project | `build.js`, `web/_headers`, `web/_redirects` |
| **Cloudflare D1** | analytics, users, gift orders | CF dashboard → D1, bound as `DB` | `schema.sql`, all `functions/api/*` |
| **Stripe** | premium + gift payment | Stripe dashboard + CF env vars | `web/checkout.js`, `functions/api/create-checkout-session.js`, `webhook.js`, `gift-order.js` |
| **Printful** | gift fulfilment | Printful dashboard + CF env var | `functions/api/gift-order.js`, `gift-design.js`, `gift-file.js` |
| **Firebase Auth** | sign-in / premium identity | Firebase console | `web/auth.js`, `functions/api/user.js` |

---

## 6. Secrets & environment variables

All backend secrets are set in **Cloudflare Pages → Settings → Environment variables (Production)**. None are committed to the repo.

| Variable | Used by | Purpose | Status / notes |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | create-checkout-session, webhook, gift-order, health, premium-status | Stripe API auth | ✅ **LIVE** `sk_live_` (set 3 Jul) — rotate before wide launch |
| `STRIPE_WEBHOOK_SECRET` | webhook | Verify Stripe webhook signatures | ✅ **LIVE** `whsec_` (live endpoint `/api/webhook`, 3 Jul) |
| `PRINTFUL_API_TOKEN` | gift-order, webhook | Create + confirm Printful orders | Rotate before launch; delete unused `PRINTFUL_API_TOKEN2` |
| `APP_URL` | create-checkout-session, gift-order | Build success/cancel redirect URLs | `https://nicenumbers.app` |
| `ADMIN_TOKEN` | admin | Gate the admin analytics API (fails closed if unset) | Set; rotate before launch |
| `VAPID_PRIVATE_KEY` | reminder-cron worker (separate deploy) | Sign Web Push | ⏳ set as **Worker** secret when activating reminders (not Pages) |
| `DB` (binding, not a var) | all data endpoints | D1 database binding | Bound in Pages settings |

**Client-side config (in repo, not secret):**
- Firebase web config — `web/auth.js` (public by design; apiKey is not a secret for Firebase web).
- Stripe **publishable** key — `web/checkout.js` — ✅ live `pk_live_…JZzO` (matches the live account).
- VAPID **public** key — in `workers/reminder-cron/wrangler.toml` (public by design).

**⚠️ Known security items (from the 3–4 Jul audit — fixed vs open):**
- ✅ Fixed: premium session-grant strictness, XSS sinks (`jsAttr`), CSP/headers, Printful livemode gate.
- ⏳ Open (before wide launch): rotate all tokens (some pasted in chat historically); add rate-limiting to `gift-order`/`event` (needs a KV/D1 counter — Pages has no built-in); the `premium-status?email=` restore is an unauthenticated lookup (low value €1.49, but add an emailed magic-code before scaling); relabel `dataProtection.js` "encryption" (key is co-located in localStorage → obfuscation, not real protection).

---

## 7. Backend endpoints (`functions/api/`)

| Endpoint | Method | Purpose | Needs |
|---|---|---|---|
| `/api/health` | GET | Liveness + reports whether `DB`/Stripe are bound | — |
| `/api/event` | POST | Store anonymous analytics event in D1 | `DB` |
| `/api/user` | GET/POST/DELETE | Create/update user after Firebase sign-in; check premium; delete account | `DB`, Firebase ID token (✅ full RS256 signature + claims verification via Web Crypto) |
| `/api/create-checkout-session` | POST | Stripe Checkout for premium (subscription, card-only) | `STRIPE_SECRET_KEY`, `APP_URL` |
| `/api/premium-status` | GET | Account-less premium verify: `?session_id=` (strict: paid+livemode+premium) or `?email=` (restore) | `STRIPE_SECRET_KEY`, `DB` |
| `/api/webhook` | POST | Stripe webhook → activate premium (by email, account-less) + confirm Printful gift (livemode only) | `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `PRINTFUL_API_TOKEN`, `DB` |
| `/api/reminders` | POST/DELETE | Opt-in store/erase push subscription + chosen events for milestone reminders | `DB` (fails soft) |
| `/api/gift-order` | POST | Create Printful draft order + Stripe checkout | `PRINTFUL_API_TOKEN`, `STRIPE_SECRET_KEY`, `APP_URL`, `DB` |
| `/api/gift-design` | GET | Public SVG design URL Printful can fetch | — |
| `/api/gift-file` | GET | Serve client-rendered PNG print file stored in D1 | `DB` |
| `/api/admin` | GET | Analytics dashboard data (stats/journey/events/users/campaigns) | `DB`, `ADMIN_TOKEN` |
| `/api/_middleware` | — | CORS + body-size limits for all `/api/*` | — |

---

## 8. Database (Cloudflare D1)

Schema: `schema.sql` (+ tables auto-created on first use by their endpoints). Tables:
- **`users`** — `uid` (Firebase), email, display_name, `premium_until`, `stripe_customer_id`, utm_*, timestamps. (Legacy account path; account-less premium uses `premium` below.)
- **`events`** — append-only analytics: `session_id`, `user_id`, `action`, `data` (JSON), `country`, `created_at`.
- **`premium`** — account-less premium by email: `email` (PK), `premium_until`, `stripe_customer_id`, `updated_at`. Written by `webhook.js`, read by `premium-status.js`.
- **`gift_files`** — `id` (PK), `data` (base64 JPEG print file, <1.9 MB), `created`. Served by `gift-file.js` to Printful.
- **`reminders`** — opt-in: `id` (device), `subscription` (JSON), `events` (JSON `[{n,d}]`), `locale`, `tz`, timestamps. Created by `reminders.js`, read by the cron worker.

Apply schema changes via the D1 console or `wrangler d1 execute`. (No migrations framework yet — additive changes only; document any here. Note: `premium`/`gift_files`/`reminders` are created lazily with `CREATE TABLE IF NOT EXISTS` by their endpoints.)

---

## 9. Local development

```bash
npm install
npm run serve        # python dev server for the static PWA (web/)
npm run build        # produce dist/ exactly as Cloudflare does
```
Functions/D1/Stripe are not exercised by the simple python server. For full-stack local testing use Cloudflare's `wrangler pages dev dist` (binds D1 + env) — not yet scripted in package.json (TODO).

Android:
```bash
npm run android      # build + cap sync + open Android Studio
```

---

## 10. Release runbooks

### Ship a web change
1. Edit under `web/`. 2. `git commit` → `git push` to `main`. 3. Cloudflare auto-deploys. 4. Hard-refresh; the versioned `sw.js` busts the PWA cache.

### Ship an Android build
1. Fix any display strings (`strings.xml`). 2. Bump `versionCode` + `versionName` in `android/app/build.gradle` (+ bump `web/sw.js` CACHE_NAME to busy the PWA cache for web). 3. `git tag vNN && git push origin vNN`. 4. Wait for GitHub Actions → download `app-release.aab` from the `latest` GitHub Release. 5. Upload to Play Console → Internal testing.

**Signing:** the AAB is signed with the upload keystore stored in the `UPLOAD_KEYSTORE_BASE64` GitHub secret (passwords default to `happymoments2026` if `KEYSTORE_PASSWORD`/`KEY_PASSWORD` secrets are unset). Every build MUST use this same keystore or Play rejects the upload ("wrong signing key"). Health check: a successful run should have **no `keystore-backup` artifact** — if one appears, the secret was lost and a throwaway key was generated (do NOT upload that AAB). Last good build: **v95 / 2.9.5**, 22 Jun 2026.

### Rotate a secret
1. Generate new value in the service dashboard (Stripe/Printful/etc.). 2. Update it in Cloudflare Pages → Environment variables (Production). 3. Trigger a redeploy (push or "Retry deployment"). 4. Verify via `/api/health` or a live test.

### Add / update a language
Source overlays in `web/l10n/*.json` → merged via `tools/i18n-merge.js` into `web/i18n.js`. Run `tools/i18n-check` for 0 errors before commit. (19 languages live; `ar`/RTL deferred.)

---

## 11. Known open items (pointers, not the master list)

The live beta backlog and decisions live in project memory (`project_happymoments_naming.md`, `project_happymoments_beta_plan.md`). Infra-relevant highlights:
- **Stripe:** ✅ LIVE (account verified 3 Jul, live keys + webhook set, card-only). Remaining: the €1.49 Premium real-card smoke test; in Stripe dashboard turn OFF Link + EU methods (Bancontact/EPS/Satispay/MB WAY), keep only Cards, to match the intended simple checkout.
- **Printful:** ✅ personal card on file + company/VAT on invoices. Switch to company card before volume.
- **Security (audit 3–4 Jul):** ✅ premium bypass + XSS + headers fixed. Open: rotate all tokens; add rate-limiting to `gift-order`/`event`; magic-code for `premium-status?email=` before scaling; relabel dataProtection.
- **Reminders backend:** ✅ built (opt-in, non-breaking). To activate: deploy `workers/reminder-cron/` + set `VAPID_PRIVATE_KEY` worker secret + wire client behind a consent screen (see `docs/REMINDERS_BACKEND.md`).
- **Android:** web is **v96 / 2.9.6**; Android tag/build lags — bump + tag to cut a fresh AAB when shipping to Play.

---

*Maintainer note: keep this file honest. If you change a binding, secret, domain, or pipeline, edit the relevant table here in the same commit.*
