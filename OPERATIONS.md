# Nice Numbers — Operations & Architecture

**Single source of truth for how this app is built, deployed, and wired.**
If anything here disagrees with another doc, this file wins. Update it in the same commit as any infrastructure change.

- **Public name:** Nice Numbers · tagline **"Share & Celebrate"**
- **Primary domain:** https://nicenumbers.app  (legacy https://happymoments.app → should 301 here)
- **Repo:** https://github.com/GorazdLampic/HappyMoments  (folder/repo keep the old name; only the *display* name changed)
- **Last verified:** 11 Jul 2026 · Android **build 105 / 2.12.3** · web cache **v103**

### Play Store status (11 Jul 2026) — READ FIRST
- **Developer verification: PASSED.** Org account "Quantum Wave Ltd" is fully registered for Android developer verification. Not a blocker anymore.
- **Build 104 (2.12.2) is IN REVIEW** ("V pregledu") since **10 Jul 2026**. First-time review on a new account can take a few days → ~7 days. Nothing to do but wait.
  - ⚠️ **Verify the review track is Production, not just Internal testing.** In Play Console → **Release → Production**, confirm the in-review release is there. If the only in-review item is under **Testing → Internal testing**, approval will NOT reach the public — promote a release to Production.
- **Build 105 (2.12.3) is already built** (edge-to-edge deprecated-API fix, untested on device). Ship it as the next update **after** 104 is approved and live.
- **Post-approval TODO:** listing display name → "Nice Numbers" (with space); category → Lifestyle; ship + device-test 105; verify Data safety form; real-card smoke test of the €1.79 subscription.

### What changed since 4 Jul (11 Jul 2026) — Play Billing + rebrand builds
- **Android premium now goes through GOOGLE PLAY BILLING, not Stripe.** Google requires digital in-app purchases to use Play Billing. Engine: `cordova-plugin-purchase` (Fovea) **13.12.0** → Play Billing Library **7.1.1**. Client wiring in `web/billing.js`. Product id **`premium_yearly`** (must match the Play Console subscription id). Play formats the price per locale — **currently €1.79/yr** in EUR. The app reads the live Play price at runtime (no hard-coded number) so the in-app price always matches the purchase sheet.
- **Dual billing model now in effect:** **Android app premium → Play Billing (`premium_yearly`, €1.79)**; **web premium → Stripe card**; **gifts (all platforms) → Stripe + Printful**. (Confirm whether the web Stripe premium at €1.49 is being retired or kept as the web-only path — see open items.)
- **`get.html` added** — a free "download the app" chooser (Android / iPhone / Web) reachable from marketing links. The `/get` rewrite rule was removed (it caused a redirect loop); `get.html` is served directly.
- **Version jump:** 100→105 across 6–10 Jul: onboarding focus fixes, bottom-tab tappability, in-app 3-7-8 icon fix (101), billing scaffolding + first billing build (102), billing hardening for first purchase test (103), live Play price display (104), edge-to-edge API fix (105).
- **Android is no longer behind web.** The earlier "versionCode 94 behind" gap is closed — the tag pipeline is current at **105 / 2.12.3**.

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

> **Native caveat (build 109):** inside the Capacitor Android WebView the app is served from `https://localhost`, so a *relative* `/api/*` call would hit the local bundle (returning `index.html`, not JSON — this was the "DOCTYPE is not valid JSON" gift error). The web client now routes API calls through `apiUrl()` (app.js), which prefixes `https://nicenumbers.app` when `Capacitor.isNativePlatform()`. The native origins `https://localhost` + `capacitor://localhost` are in the `_middleware.js` CORS allowlist. Android *premium* still uses the native Play Billing plugin (no fetch); only *gifts* and web-premium/restore hit the backend from the app.

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

> **Status (11 Jul 2026):** Android is **current** at `versionCode 105 / 2.12.3` (billing-enabled, Nice Numbers rebrand shipped). Build 104 is in Play review; 105 is built and waiting to ship next. The old "94 behind web" gap is closed.

---

## 5. Services & where each is configured

| Service | Used by | Configured in | Repo touch-points |
|---|---|---|---|
| **Google Play Billing** | **Android** app premium subscription | Play Console → Monetize → Products → Subscriptions (`premium_yearly`) | `web/billing.js`, `cordova-plugin-purchase` 13.12.0 (Billing 7.1.1) |
| **Cloudflare Pages** | Everything (host + functions) | CF dashboard → Pages project | `build.js`, `web/_headers`, `web/_redirects` |
| **Cloudflare D1** | analytics, users, gift orders | CF dashboard → D1, bound as `DB` | `schema.sql`, all `functions/api/*` |
| **Stripe** | **web** premium + **gift** payment (all platforms) | Stripe dashboard + CF env vars | `web/checkout.js`, `functions/api/create-checkout-session.js`, `webhook.js`, `gift-order.js` |
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

### Release gate + deploy ordering (build 110) — READ BEFORE SHIPPING
To stop the "web works, native doesn't" and "deploy-order" regressions:
- **`npm run release-check`** MUST be green before tagging any build: `build.js` → `native-contract.js` (static: every `/api` call uses `apiUrl()`, every text share is native-guarded) → `test-niceness.js` → `validate-build110.js` (renders the gift design + checks number formatting / countries / reminders / celestial toggle in real Chromium) → `screenshot-tour.js` (0 page errors, 0 overflow).
- **Backend-first deploy rule:** the native app calls **production** `nicenumbers.app`. Any `functions/` change the app depends on (CORS origins, endpoints, params) MUST reach `main`/production **before** the native build that needs it ships to testers — else the app hits an un-updated backend (the build-109 "Failed to fetch" cause). After a backend deploy run **`npm run smoke`** (`prod-api-smoke.js`) to confirm `/api/health` is bound and the native origin (`https://localhost`) is echoed in CORS. Native origin allow-list lives in `functions/api/_middleware.js`.

### Ship an Android build
1. Fix any display strings (`strings.xml`). 2. Bump `versionCode` + `versionName` in `android/app/build.gradle` (+ bump `web/sw.js` CACHE_NAME to busy the PWA cache for web). 3. `git tag vNN && git push origin vNN`. 4. Wait for GitHub Actions → download `app-release.aab` from the `latest` GitHub Release. 5. Upload to Play Console → Internal testing.

**Signing:** the AAB is signed with the upload keystore stored in the `UPLOAD_KEYSTORE_BASE64` GitHub secret (passwords default to `happymoments2026` if `KEYSTORE_PASSWORD`/`KEY_PASSWORD` secrets are unset). Every build MUST use this same keystore or Play rejects the upload ("wrong signing key"). Health check: a successful run should have **no `keystore-backup` artifact** — if one appears, the secret was lost and a throwaway key was generated (do NOT upload that AAB). Latest build: **105 / 2.12.3** (11 Jul 2026); build **104 / 2.12.2** is the one currently in Play review.

### Rotate a secret
1. Generate new value in the service dashboard (Stripe/Printful/etc.). 2. Update it in Cloudflare Pages → Environment variables (Production). 3. Trigger a redeploy (push or "Retry deployment"). 4. Verify via `/api/health` or a live test.

### Add / update a language
Source overlays in `web/l10n/*.json` → merged via `tools/i18n-merge.js` into `web/i18n.js`. Run `tools/i18n-check` for 0 errors before commit. (19 languages live; `ar`/RTL deferred.)

---

## 11. Known open items (pointers, not the master list)

The live beta backlog and decisions live in project memory (`project_happymoments_naming.md`, `project_happymoments_beta_plan.md`). Infra-relevant highlights:
- **Play Billing (Android premium):** ✅ LIVE-ready — `premium_yearly` subscription (€1.79/yr, Play-formatted per locale) via `cordova-plugin-purchase`. Remaining: real-card purchase smoke test once 104 is approved; consider a receipt validator (`store.validator`, TODO in `billing.js`) before scaling.
- **Stripe:** ✅ LIVE (account verified 3 Jul, live keys + webhook set, card-only). Now scoped to **web premium + gifts** (Android premium moved to Play Billing). **Decide:** keep the €1.49 web Stripe premium as a web-only path, or retire it so pricing is unified at €1.79. Remaining regardless: real-card gift smoke test; in Stripe dashboard turn OFF Link + EU methods (Bancontact/EPS/Satispay/MB WAY), keep only Cards.
- **Printful:** ✅ personal card on file + company/VAT on invoices. Switch to company card before volume.
- **Security (audit 3–4 Jul):** ✅ premium bypass + XSS + headers fixed. Open: rotate all tokens; add rate-limiting to `gift-order`/`event`; magic-code for `premium-status?email=` before scaling; relabel dataProtection.
- **Reminders backend:** ✅ built (opt-in, non-breaking). To activate: deploy `workers/reminder-cron/` + set `VAPID_PRIVATE_KEY` worker secret + wire client behind a consent screen (see `docs/REMINDERS_BACKEND.md`).
- **Android:** ✅ current at **105 / 2.12.3**; **104 in Play review**. Post-approval: rename listing → "Nice Numbers", category → Lifestyle, ship 105, verify Data safety.

---

*Maintainer note: keep this file honest. If you change a binding, secret, domain, or pipeline, edit the relevant table here in the same commit.*
