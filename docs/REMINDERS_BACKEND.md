# Milestone Reminders Backend

Opt-in, privacy-first backend so Nice Numbers can remind people about upcoming
milestones — even when the app/PWA is closed — via Web Push.

## Status
- ✅ **Storage API** (`functions/api/reminders.js`) — live, opt-in, fails soft.
- ✅ **Cron worker** (`workers/reminder-cron/`) — computes upcoming milestones + sends Web Push. **Needs one manual test send before production.**
- ✅ **VAPID keypair** — generated (public in configs; private held as a secret).
- ⏳ **Client wiring** — NOT auto-enabled yet. This is a privacy decision (syncing
  contacts' birthdates to the server needs a clear consent screen). Wire it only
  after reviewing the consent UX. See "Client integration" below.

## Data model (minimal by design)
Table `reminders` (D1):
| column | notes |
|--------|-------|
| id | random client-generated device id (no identity) |
| subscription | Web-Push subscription JSON |
| events | `[{ n: name, d: 'YYYY-MM-DD' }]` — only what the user opted to be reminded about |
| locale, tz | for localised, correctly-timed notifications |
| created_at, updated_at | timestamps |

No email, no account, no analytics linkage. The user can `DELETE /api/reminders`
(by id) at any time to erase it.

## API
- `POST /api/reminders` `{ id, subscription, events:[{n,d}], locale?, tz? }` → upsert
- `DELETE /api/reminders` `{ id }` → unsubscribe/erase

Fails soft: with no D1 bound it returns `{ok:true, stored:0}` so the client never breaks.

## VAPID keys
- **Public** (`applicationServerKey`, safe to commit): `BMvGiQt8TILpRqG-hgLovGHulzDjd32i2LvDVSnlyyejgc9y4e-NxA7nA20XMcx_icqgZChVpvBz6xkymilByBw`
- **Private**: held separately (memory + Gorazd). Set as a Worker secret — never commit.

## Activation runbook
1. `cd workers/reminder-cron`
2. Fill `wrangler.toml` D1 `database_name` + `database_id` (`npx wrangler d1 list`).
3. `npx wrangler secret put VAPID_PRIVATE_KEY` → paste the private key.
4. `npx wrangler deploy`
5. **Test send** to your own subscription before trusting it (Web Push crypto is unforgiving).
6. Confirm the cron fires (Cloudflare dashboard → Workers → triggers).

## Client integration (do after consent-UX review)
1. Add the VAPID public key to the client.
2. On opt-in: `registration.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey })`.
3. `POST /api/reminders` with a random device id, the subscription, and the chosen events.
4. Handle the `push` event in `sw.js` → `showNotification(title, { body, data:{url} })`.
5. Re-sync on event changes; `DELETE` on opt-out.

## Privacy checklist before enabling
- [ ] Explicit consent screen ("store these dates to remind you — stored securely, delete anytime").
- [ ] Only sync events the user ticks.
- [ ] Link to delete / privacy policy.
- [ ] Confirm GDPR basis (consent) + retention (delete on unsubscribe).
