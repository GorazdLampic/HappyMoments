# HappyMoments Beta Launch Execution Plan

**Status:** Ready to execute
**Date:** 4 June 2026
**Version:** v17 / 1.4.1

---

## Phase 0: Pre-launch Prep (Day 0 — 1-2 hours)

### Stripe: Switch to live keys
- [ ] Go to https://dashboard.stripe.com → toggle to Live mode
- [ ] Copy live publishable key (`pk_live_...`)
- [ ] Update `STRIPE_SECRET_KEY` in Cloudflare Pages → Settings → Environment Variables (Production)
- [ ] Update `STRIPE_WEBHOOK_SECRET` with new live webhook secret
- [ ] Set `ADMIN_TOKEN` env var in Cloudflare (replace hardcoded fallback)
- [ ] Edit `web/checkout.js` line 14: replace `pk_test_PLACEHOLDER_replace_with_real_key` with live key
- [ ] Test one gift order end-to-end with a real EUR 1 charge (refund after)

### Play Store
- [ ] Download latest AAB from GitHub Actions (v17)
- [ ] Upload to Play Store → Internal testing track
- [ ] Verify it installs and runs on your phone
- [ ] Take 8 screenshots (see play-store-listing.md for specs)
- [ ] Create feature graphic (1024x500)
- [ ] Promote to Closed testing (up to 100 testers via email list)

### Gift store note for testers
- Until Stripe is live, tell testers: "Use card 4242 4242 4242 4242, any future expiry, any CVC"
- Once live: real payments work, Printful creates draft orders you manually confirm

---

## Phase 1: Inner Circle (Days 1-3)

### Goal: 10-15 installs, 5+ shares, 2+ gift store tests

### Day 1 (Thursday) — Personal seeding

**Morning (15 min):**
1. Post WhatsApp Status: your own billion-second date with screenshot
2. Post Instagram Story: milestone card from the app (use Story format 1080x1920)

**During day (30 min):**
3. Send personal WhatsApp to 5 closest people (use rollout-messages.md Tier 1 template)
   - Calculate their actual milestone before sending!
   - "Veš, da boš čez [X] dni star/a točno 1 milijardo sekund? Probaj: happymoments.app"
4. Ask 2 of them specifically to test the gift store: "Probaj naročit darilo za nekoga — samo test"

**Evening:**
5. Check admin dashboard (happymoments.app/admin.html) for:
   - page_view count
   - onboard_complete rate
   - share_milestone events

### Day 2 (Friday) — Expand personal

6. Send to 5-10 more friends (Tier 2 — rollout-messages.md)
7. Post LinkedIn Post 1 (see social-media-posts.md — "I built an app in a week")
8. Post on Twitter/X: "When did you turn 1 billion seconds old? Find out: happymoments.app #WhenIsYourBillion"

### Day 3 (Saturday) — Groups

9. Post in 2-3 WhatsApp groups (sports, family, friends):
   - "Izziv: kdo ima najzanimivejši mejnik? Vpiši rojstni dan: happymoments.app"
10. Post Instagram feed post (Billion teaser — see viral-campaign-plan.md)
11. Review Day 1-2 analytics: what are people clicking? where do they drop off?

---

## Phase 2: Expand & Learn (Days 4-10)

### Goal: 50-100 users, measure k-factor, identify best channel

### Content calendar:

| Day | Platform | Action |
|-----|----------|--------|
| Mon | WhatsApp | Follow up with Tier 1: "Si probal/a? Kaj praviš?" |
| Mon | IG Story | Share a family milestone discovery |
| Tue | LinkedIn | Post 2: technical angle ("21 languages, cosmic milestones") |
| Tue | Twitter/X | Thread: "5 number milestones you didn't know existed" |
| Wed | WhatsApp | Tier 3 — 10-15 extended network contacts |
| Wed | IG/TikTok | Short video: react to your own billion-second date |
| Thu | WhatsApp groups | 3-5 new groups (sports club, parents group, hobby, work) |
| Thu | Facebook | Cross-post best-performing IG post |
| Fri | Twitter/X | "Drop your birthday, I'll tell you your next milestone" engagement bait |
| Sat | All | Review analytics, identify best platform |
| Sun | Prep | Batch-generate 7 daily content pieces for next week |

### Key metrics to track:

| Metric | Target | Where to check |
|--------|--------|----------------|
| Installs / visits | 50-100 | Admin dashboard: page_view |
| Onboarding completion | >30% | Admin: onboard_complete / page_view |
| Share rate | >10% of completed users | Admin: share_milestone / onboard_complete |
| Gift store clicks | >5 | Admin: gift_order_started |
| k-factor | >0.1 | Shares × conversion rate |
| D1 retention | >20% | Users returning next day |

---

## Phase 3: Content Ramp & Public Push (Days 11-21)

### Goal: 100-300 users, first organic shares, content library

### New content to create:

1. **Blog/SEO post**: "When Will You Turn 1 Billion Seconds Old?" → landing.html already exists, promote it
2. **Daily Nice Numbers**: Use docs/daily-nice-numbers.html to generate daily social content
3. **Cultural angles**: "In Chinese culture, 888 means fortune. When's YOUR 888 days?"
4. **Couple/family angles**: "Our combined age just hit 50,000 days"

### Platform actions:

| Week | Focus | Actions |
|------|-------|---------|
| Week 3 | Content | 3 IG posts, 3 Stories, 2 TikTok/Reels, 2 LinkedIn, daily Twitter |
| Week 3 | Groups | 5-10 new WhatsApp/Viber groups |
| Week 3 | SEO | Share landing page on forums, Q&A sites |
| Week 4 | Scale | Double down on best-performing platform |
| Week 4 | Reddit | r/InternetIsBeautiful, r/SideProject, r/dataisbeautiful |
| Week 4 | PH/HN | Product Hunt submission + Show HN (if metrics support it) |

---

## Phase 4: Production Launch (Day 21+)

### Prerequisites:
- [ ] >50 active users with positive feedback
- [ ] Gift store tested with 5+ real orders
- [ ] No critical bugs from beta feedback
- [ ] Play Store screenshots and listing finalized
- [ ] Stripe fully live with real payments working

### Actions:
- Promote Play Store from Closed testing → Production
- Submit Product Hunt
- Post Show HN
- Send press kit to 5-10 tech/lifestyle blogs
- Begin iOS Capacitor build for App Store (separate track)

---

## Content Templates (Ready to Use)

### WhatsApp personal (Slovenian):
```
Hej [ime]! Delam na eni aplikaciji in bi cenil/a tvoje mnenje.

Vpiši svoj rojstni dan na happymoments.app — pokaže ti kdaj si star/a točno milijardo sekund, 10.000 dni, in še kup zanimivih številk.

Mene je presenetilo da sem [tvoj mejnik]. Javi kaj dobiš! 🎂
```

### WhatsApp group challenge (Slovenian):
```
Izziv za skupino! 🎯

Kdo od nas ima najzanimivejši številčni mejnik? Vpišite rojstni dan:
👉 happymoments.app

Jaz sem ugotovil/a da bom [mejnik]. Kdo me premaga? 😄
```

### Instagram caption (English):
```
When's YOUR billion? 🧮

I just found out I turn 1,000,000,000 seconds old on [date].

That's a billion heartbeats. A billion moments. And I almost missed it.

Find yours → happymoments.app (link in bio)

#WhenIsYourBillion #HappyMoments #MilestoneChallenge #birthdaymilestone #billiondreams
```

### LinkedIn (English — build-in-public):
```
I built an app in a week using AI as my co-developer. Here's what happened.

[Use full Post 1 from social-media-posts.md]
```

### Twitter/X hook:
```
When did you turn 1 billion seconds old?

(Hint: it happens around age 31 years and 259 days)

Find your exact date → happymoments.app

#WhenIsYourBillion
```

---

## Daily Checklist During Beta

- [ ] Check admin dashboard (2 min)
- [ ] Reply to any feedback messages (5 min)
- [ ] Post 1 piece of content (10 min)
- [ ] Track in spreadsheet: new users, shares, feedback (2 min)

**Total daily time: ~20 minutes**

---

## Gift Store Testing Instructions for Beta Testers

Send this to testers you want to test gift ordering:

```
Prosim te da testiraš še gift store:

1. Odpri happymoments.app
2. Najdi kakšen mejnik za nekoga
3. Pri mejniku klikni na gift ikono (🎁)
4. Izberi produkt (npr. skodelica)
5. Izpolni podatke (ime, naslov — lahko izmišljen)
6. Na Stripe checkout uporabi testno kartico:
   Številka: 4242 4242 4242 4242
   Datum: katerikoli prihodnji
   CVC: katerikoli 3 številke
7. Javi mi če je šlo skozi ali kje se je zataknilo!
```

---

## Budget

| Item | Cost | When |
|------|------|------|
| Phase 1-2 (organic) | EUR 0 | Now |
| Play Store developer account | EUR 25 (already paid) | Done |
| Apple developer account | EUR 99/year | When ready for iOS |
| Paid social ads (test) | EUR 50-100 | Only if Phase 2 metrics are promising |
| Product Hunt featured | EUR 0 (free) | Week 4 |
| Year 1 total estimate | EUR 300-500 | Gradual |

---

## Decision Points

After Phase 1 (Day 3):
- If <5 installs from 15 messages → messaging isn't working, rewrite hooks
- If >10 installs but 0 shares → app delivers value but sharing flow needs work

After Phase 2 (Day 10):
- If k-factor <0.05 → focus on group mechanics, not 1:1 sharing
- If gift store gets 0 clicks → move gift banners to more prominent position
- If best platform is clear → 2x content there, reduce others

After Phase 3 (Day 21):
- If >100 active users → proceed to production launch
- If <50 → pivot: try different hook, different audience, or different platform
