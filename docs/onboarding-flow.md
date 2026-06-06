# HappyMoments Onboarding Flow

**Version:** 1.0
**Status:** CANONICAL — this is the source of truth for the onboarding journey
**Last updated:** June 2026
**Cross-references:** [ux-guidelines.html](ux-guidelines.html) (visual specs), [user-psychology.md](user-psychology.md) (why each decision)
**Supersedes:** archive/onboarding-v3-strategy.md, archive/onboarding-v4-strategy.md

---

## Design Principles

1. **Every screen delivers a surprise.** No screen is "setup."
2. **User never does work without immediate reward.** Enter date → instant wow.
3. **Share is the natural next step**, not a request.
4. **Guide the user on the exact desired path** (Luka Renko: "moraš voditi uporabnika po točno želeni poti").
5. **After each input, a feeling of satisfaction** — something happens as a reward. Never feel like accounting software.

---

## The Journey: 5 Screens

**Flow:** ME → SOMEONE I LOVE → DASHBOARD

Each screen has: the user's ACTION, the app's REWARD, and the TRANSITION to next.

---

### Screen 1: The Question + Your Date

```
┌───────────────────────────────┐
│                               │
│                               │
│   You have a                  │
│   billionth-second            │
│   birthday.                   │
│                               │
│   When is it?                 │
│                               │
│   [ DD / MM / YYYY ]          │
│                               │
│   [ Show me ]                 │
│                               │
│                               │
└───────────────────────────────┘
```

**Elements:** 3 (question, date input, button)
**User action:** Type 8 digits (birthday)
**Reward:** Curiosity answered in 3 seconds
**Psychology:** Value before identity (Duolingo principle). No name, no email, no preferences.
**Transition:** Counter animation starts → slide to Screen 2

**What is NOT here:** App name. Logo. Tagline. Language picker. Consent banner. Name field.

---

### Screen 2: Your Reveal

```
┌───────────────────────────────┐
│                               │
│                               │
│                               │
│       1,000,000,000           │
│          seconds              │
│                               │
│   Sunday, March 23, 2025      │
│   You passed it 1 year ago!   │
│                               │
│                               │
│   [ Now someone I love → ]    │
│                               │
│                               │
└───────────────────────────────┘
```

**Elements:** 4 (number, unit, date, emotional countdown) + 1 button
**User action:** Watch counter animation, absorb the result
**Reward:** Personal discovery — "I didn't know that about myself"
**Psychology:** Peak moment (Kahneman Peak-End Rule). The counter rolling up IS the product experience.
**Transition:** Button text is an empathy pivot: "Now someone I love →"

**The number:** Counter rolls from 0 to target (1.5-2s, ease-out-cubic). Gold glow on completion. Sparkle particles.

**Emotional countdown rules:**
- Past, yesterday: "That was yesterday!"
- Past, recent: "You passed it X ago"
- Future, ≤7 days: "That's this week!"
- Future, ≤30 days: "Coming in just X days"
- Future, >30 days: "X months from now"

**Milestone selection for reveal:** Balance impressiveness × proximity. Prefer:
1. Birthday (upcoming)
2. Big milestones (billion seconds, 10K days) — highest wow factor
3. Round thousands in days
4. Saturn return
5. Avoid: Fibonacci, palindromes, obscure patterns for the FIRST reveal

---

### Screen 3: Someone You Love

```
┌───────────────────────────────┐
│  ←                            │
│                               │
│   Who do you want             │
│   to celebrate?               │
│                               │
│   [ Their name          ]     │
│                               │
│   [ DD / MM / YYYY ]          │
│                               │
│   Mom, partner, best friend,  │
│   child — anyone whose        │
│   birthday you know.          │
│                               │
│   [ Find their milestones ]   │
│                               │
│   Skip for now                │
│                               │
└───────────────────────────────┘
```

**Elements:** 4 (question, name input, date input, hint) + 2 actions
**User action:** Enter a name and birthday for someone they care about
**Reward:** Transition from "my app" to "our app" — emotional investment
**Psychology:** Investment (Nir Eyal Hook Model). They now have data worth keeping.
**Transition:** Counter animation for the other person → Screen 4

**Skip path:** "Skip for now" (small, muted text) → jump to Screen 5 (dashboard). De-emphasized but always available.

**Name matters here:** For yourself, "Me" is fine. For another person, the name goes into the share message ("Hey Mom, did you know...").

---

### Screen 4: Their Reveal + Share

```
┌───────────────────────────────┐
│                               │
│   Mom turns                   │
│                               │
│       20,000                  │
│         days                  │
│                               │
│   Thursday, June 18, 2026     │
│   That's in 12 days!          │
│                               │
│   ┌─────────────────────┐     │
│   │ "Hey Mom, did you   │     │
│   │  know you turn      │     │
│   │  exactly 20,000     │     │
│   │  days old on        │     │
│   │  June 18th?"        │     │
│   └─────────────────────┘     │
│                               │
│   [ Send to Mom → ]          │
│                               │
│   Maybe later                 │
│                               │
└───────────────────────────────┘
```

**Elements:** 4 (their name, number+unit, date+countdown) + share preview + 2 actions
**User action:** See the milestone, tap "Send to Mom →"
**Reward:** A reason to reach out RIGHT NOW. The share message is pre-written.
**Psychology:** This is THE viral moment. The user just discovered something personal and surprising about someone they love. Social validation awaits.
**Transition:** After share (or "maybe later") → Screen 5

**Share button** opens native OS share sheet (Web Share API on mobile, clipboard on desktop).
**"Maybe later"** → continue to dashboard. The seed is planted even if they don't share now.

---

### Screen 5: Dashboard Landing

```
┌───────────────────────────────┐
│  HappyMoments        👤      │
│                               │
│  ★ Mom turns 20,000 days      │
│    June 18 — in 12 days!      │
│    [Share]  [Remind me]       │
│                               │
│  ─── Coming up ───            │
│  This week                    │
│   You · 500 months · Thu      │
│  This month                   │
│   Mom · 12,321 days · Jun 22  │
│                               │
│  ─── Together ───             │
│  You + Mom = 38,547 days      │
│  40,000 together in Nov 2030  │
│                               │
│  + Add someone to celebrate   │
│                               │
│  [ Home ]   [ People ]        │
│                               │
│  Want to know when            │
│  milestones are near?         │
│  [ Enable reminders ]         │
└───────────────────────────────┘
```

**What happens:** The hero card shows the SAME milestone they just saw on Screen 4 (or Screen 2 if they skipped). No disorientation — onboarding flows seamlessly into the daily app.

**Reminders prompt:** One-time prompt at the bottom. Not a modal. "Enable reminders" or dismiss by scrolling past. This is the retention hook — if they enable, they get a push notification within 24 hours with their next closest milestone.

**"Together" section:** Appears because they added 2 people. Shows one combined milestone as a teaser.

**This screen IS the daily app.** After this, they're a daily user. The onboarding deposited them into exactly the state the app shows every day.

---

## Skip Paths

| From | Skip action | Goes to |
|------|-------------|---------|
| Screen 3 | "Skip for now" | Screen 5 (dashboard) — skip their reveal and share |
| Screen 4 | "Maybe later" | Screen 5 (dashboard) — skip sharing, keep the person |

No other skips. Screen 1 and 2 are mandatory (you can't skip entering YOUR birthday — that IS the product).

---

## Metrics

| Screen | Success metric | Target |
|--------|---------------|--------|
| 1. Question + Date | Date entered | >70% of page views |
| 2. Your Reveal | Tap "Now someone I love" | >60% of reveals |
| 3. Add Someone | Name+date entered (not skipped) | >50% of viewers |
| 4. Their Reveal + Share | Share initiated | >20% of viewers |
| 5. Dashboard | Reminders enabled | >30% |

**Overall funnel:**
- Page view → date entered: >70%
- Date entered → 2nd person added: >50%
- Date entered → share initiated: >15%
- Date entered → reminders enabled: >25%

---

## Day 2-7 Retention Bridge

| Day | What happens | Goal |
|-----|-------------|------|
| **Day 1** | Onboarding → hero reveal → add person → share | First share (activation) |
| **Day 2** | Push notification: "Mom's 20,000 days is in 11 days" | Return visit |
| **Day 3** | Open app → hero card updated → time-chunked list | Explore depth |
| **Day 4-5** | If 2+ people: "Together" section with teaser | Discover combined milestones |
| **Day 7** | "You have 24 milestones coming this year" | Long-term retention |

---

## A/B Test Candidates

### Screen 1 hook text:
- **A:** "You have a billionth-second birthday. When is it?"
- **B:** "Your best friend has a hidden milestone coming. Enter your birthday first."
- **C:** "How many special number milestones do you have in the next year?"

### Screen 4 share message:
- **A:** "Hey [name], did you know you turn exactly [value] [unit] old on [date]?"
- **B:** "[name]! You have a hidden milestone coming: [value] [unit] on [date]. Let's celebrate!"
- **C:** "I just found out something cool about your birthday. Check happymoments.app"

---

## Implementation Notes

### State management
- Screen 1: saves date to localStorage on "Show me" tap
- Screen 3: saves second person to appData on "Find their milestones" tap
- Screen 5: sets `hm_onboarded = 1` → next app open goes straight to dashboard

### Analytics events
- `onboard_date_entered` (Screen 1 → 2)
- `onboard_reveal_seen` (Screen 2 viewed)
- `onboard_empathy_tapped` (Screen 2 → 3, "Now someone I love")
- `onboard_add_person` (Screen 3 submitted)
- `onboard_skip_person` (Screen 3 skipped)
- `onboard_share_initiated` (Screen 4 share tapped)
- `onboard_share_skipped` (Screen 4 "maybe later")
- `onboard_reminders_enabled` (Screen 5)
- `onboard_complete` (Screen 5 → daily use)

### Hidden elements during onboarding
- Main app header (shown after onboarding)
- Language picker (shown after onboarding, auto-detected from browser)
- Tab navigation (shown on Screen 5)
- Consent banner (auto-accepted on first tap)
