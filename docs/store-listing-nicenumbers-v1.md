# Nice Numbers — Google Play Store Listing Copy (v1)

Ready-to-paste text for the Play Console store listing and the Production release.
Reflects the live app: name **Nice Numbers**, category **Lifestyle**, target **13+**,
freemium with **working Play Billing** (yearly premium). Prices are intentionally NOT
written into the description — Play shows each user the correct localized, VAT-inclusive
price automatically.

Supersedes `docs/play-store-listing.md` (old "HappyMoments" name, wrong price/icon/URL).

---

## App name
```
Nice Numbers
```

## Short description (max 80 chars)
Primary (64):
```
Discover and celebrate your life's special number milestones.
```
Alternative (77):
```
Find the hidden number milestones in your life — and celebrate them together.
```

## Full description (max 4000; this is ~1,700)
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
• Free to start, with everything you need to begin today.

FREE
• Track your milestones and several people
• Every milestone type included
• Beautiful share cards
• Available in 20+ languages

PREMIUM (optional, yearly)
• Unlimited people and groups
• Watermark-free share cards
• No promotional banners
• Supports an independent developer

From "1 billion seconds alive" to your next palindrome birthday, Nice Numbers helps you notice — and share — the small, beautiful math of being alive.

Discover your special numbers today.
```

## "What's new" — release notes for 2.12.2 (104)
Short (recommended):
```
Nice Numbers is here — discover and celebrate the special number milestones in your life. Add the people you care about, and share a beautiful card when a milestone lands.
```
Minimal alternative:
```
Polished pricing display and reliability improvements.
```
(Use the first for the initial Production launch; the minimal one for routine updates.)

## Promotional text / tagline (optional, where allowed)
```
Share & Celebrate.
```

---

## Fields already decided (from PLAY_LAUNCH_PACK.md — no change)
- **Category:** Lifestyle
- **Tags:** milestones, birthday, celebration, numbers
- **Website:** https://nicenumbers.app
- **Privacy policy:** https://nicenumbers.app/legal.html
- **Content rating:** Everyone / PEGI 3
- **Target audience:** 13 and older

## Open — you must confirm
- **Support / contact email:** `hello@nicenumbers.app` (DECIDED). Set up via Cloudflare
  Email Routing → forward to Gorazd's Gmail (receive-only; replies go from Gmail).
  Steps: Cloudflare dashboard → nicenumbers.app → Email → Email Routing → add `hello@`
  → forward to gorazd.lampic@gmail.com (auto-adds MX/TXT). Once forwarding, it's
  readable via the Gmail connector.
- **Assets — READY in `screenshots/store/`:**
  - Feature graphic (1024×500): **`feature-A-dark.png` = CHOSEN** (dark card-style, "1,000,000,000 s" watermark). `feature-B-ivory.png` kept as alt.
  - Phone screenshots (800×1600, framed on dark brand bg with Georgia-italic captions): `store-01-solo-hero.png` ("See your milestones"), `store-02-together.png` ("Discover what you share"), `store-03-solo-list.png` ("Hundreds of milestones"), `store-04-share.png` ("Share & celebrate").
  - All use the 3-7-8 icon + brand palette (dark `#1a1a1a→#2a2233`, gold `#d4b876`, green `#a0b8a0`, Georgia italic).
- **Note:** the description now mentions premium because Play Billing is live (104).
  If you instead want a free-only launch, drop the PREMIUM block.
```
