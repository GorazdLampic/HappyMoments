# Nice Numbers — Google Play Launch Pack

Copy-paste answers for the Play Console "Set up your app" checklist + Production release.
Decisions locked: **target audience 13+**, **category Lifestyle**, payments = **Play Billing (v1.1)** — for the v1 launch, in-app premium is hidden on Android (physical gifts remain).

> **Build to release:** use **versionCode 101 / 2.11.0** (`app-release.aab` from the GitHub `latest` release). Play currently only has code 100 — do NOT ship that; it lacks the icon + tab fixes.

---

## 1. Store listing

**App name:** `Nice Numbers`

**Short description** (max 80 chars):
```
Discover and celebrate your life's special number milestones. Free.
```

**Full description** (max 4000 chars):
```
Every life is full of hidden number milestones — you just never noticed them.

Nice Numbers finds and celebrates the special numbers in your life: the day you turn 1 billion seconds old, your 10,000th day, palindrome dates, round-number anniversaries, and hundreds more. It turns ordinary dates into moments worth celebrating.

WHAT YOU CAN DO
• Solo — enter your birthday and instantly see your upcoming (and past) milestones.
• Together — add family and friends to discover shared milestones and combined numbers.
• Celebrate — beautiful share cards for any milestone, ready to send to WhatsApp, Viber, or anywhere.
• Never miss one — optional reminders for the milestones that matter.

WHY PEOPLE LOVE IT
• It's genuinely delightful — a fun, positive reason to reach out and celebrate someone.
• Private by design — your milestone data stays encrypted on your device.
• No ads. No tracking identifiers. No clutter.
• Free.

From "1 billion seconds alive" to your next palindrome birthday, Nice Numbers helps you notice — and share — the small, beautiful math of being alive.

Discover your special numbers today.
```

**Category:** Lifestyle
**Tags:** milestones, birthday, celebration, numbers
**Contact email:** `⟨TODO — confirm support email⟩`
**Website:** https://nicenumbers.app
**Privacy policy:** https://nicenumbers.app/legal.html

**Graphics needed (you must provide):**
- App icon 512×512 — ✅ have it (the 3-7-8 icon)
- Feature graphic 1024×500 — ⚠️ need to create
- Phone screenshots — ⚠️ need ≥2 (recommend 4–6; there are some in `/screenshots`)

---

## 2. Data safety form

**Does your app collect or share user data?** Yes (minimal).

| Data type | Collected? | Shared? | Purpose | Notes |
|---|---|---|---|---|
| Email address | Yes (only if you create an account) | No | Account management, premium status | Optional; deletable in Settings |
| Name (display name) | Yes (only with account) | No | Account personalization | Optional |
| Purchase history | Yes (gifts) | Yes → Printful | Order fulfilment | Physical goods only |
| Shipping address | Yes (only when ordering a gift) | Yes → Printful | Ship the physical gift | Only for gift buyers |
| App interactions (analytics) | Yes | No | Analytics / app improvement | Cookie-free, no ad IDs, respects Do-Not-Track |
| Approximate location (country) | Yes | No | Analytics (derived from IP) | Coarse, country-level only |
| Milestone data (names/dates) | **No — stays on device** | No | — | Local, AES-GCM encrypted in browser storage |

**Security:**
- ☑ Data is encrypted in transit (HTTPS)
- ☑ Users can request data deletion (Settings → delete account)
- ☐ No data is used for advertising or shared with data brokers
- ☐ No advertising identifiers collected

---

## 3. Content rating (IARC questionnaire)

- Violence: None
- Sexual content: None
- Profanity: None
- Controlled substances: None
- Gambling: None (number play is not gambling; no real-money wagering)
- User-generated content / social: Users can create and share milestone cards to other apps (no open in-app social feed)
- **Expected rating:** Everyone / PEGI 3

---

## 4. Other required declarations

- **Target audience:** 13 and older (do NOT include under-13 → avoids Families Policy obligations)
- **App access:** All features are available without special access; no login required to use the core app. (If a reviewer needs premium: N/A for v1 — premium hidden on Android.)
- **Ads:** No, this app does not contain ads.
- **Government app:** No.
- **Financial features:** No lending/banking. (Physical gift purchases only; premium disabled on Android in v1.)
- **Data safety privacy policy URL:** https://nicenumbers.app/legal.html

---

## 5. Production release steps

1. Test and release → **Production** → **Create new release**
2. Add app bundle → upload **`app-release.aab` (code 101 / 2.11.0)**
3. Release name: `2.11.0 (101)` · Release notes: e.g. *"Nice Numbers is here — discover and celebrate your special number milestones."*
4. Save → **Review release** → resolve any warnings
5. **Start rollout to Production** → submit
6. Google review (hours–few days) → **live** when approved.

---

## Open items (only you can do)
- [ ] Confirm **support email** for the listing
- [ ] Provide **feature graphic** (1024×500) + **≥2 phone screenshots**
- [ ] Upload the **code‑101** AAB (not 100)
- [ ] Decide launch timing: **launch free now** (premium hidden on Android) vs **wait for Play Billing**
