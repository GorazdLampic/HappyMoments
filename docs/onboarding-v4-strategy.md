# HappyMoments Onboarding v4 — The Value-First Journey

## Design Principles

1. **Every screen delivers a surprise.** No screen is "setup" — each one reveals something new.
2. **The user never does work without reward.** Enter date → instant wow. Not: enter date → enter name → pick preferences → wait → result.
3. **Share is the natural next step, not a request.** When someone sees "Your mom turns 20,000 days on June 18th", the impulse to tell her is immediate. We just make it easy.
4. **Depth reveals gradually.** First show the hero milestone. Then reveal there are dozens more. Then show what happens when you add more people. Each layer is a surprise.
5. **The app earns trust before asking for anything.** No sign-up, no permissions, no preferences until the user has already experienced value 3+ times.

---

## The Problem with Our Current Flow

Current (v4, single screen):
```
Examples → Enter date → Reveal → Dashboard (lost)
```

Issues:
- **One wow moment**, then the user lands on a full dashboard they don't understand
- **No share prompt** at the moment of maximum excitement
- **No second person** — the viral loop (showing someone else's milestone) never starts
- **No "what's next" pull** — no reason to come back tomorrow

---

## The New Journey: 7 Screens

The metaphor: a **gift being unwrapped**, layer by layer. Each screen peels back another layer of "I didn't know that about my life."

### Screen 1: The Hook
**Goal:** Curiosity. One question that everyone wants answered.

```
┌─────────────────────────────┐
│                             │
│   Somewhere between your    │
│   31st and 32nd birthday,   │
│   you quietly turn          │
│                             │
│   1,000,000,000             │
│      seconds old.           │
│                             │
│   When's yours?             │
│                             │
│   ┌─────────────────────┐   │
│   │  DD  /  MM  / YYYY  │   │
│   └─────────────────────┘   │
│                             │
│   [ Show me ────────→ ]     │
│                             │
└─────────────────────────────┘
```

**What happens:** Date input is RIGHT HERE. No extra tap to get to it. The question ("When's yours?") is the CTA. The moment they type a date and tap "Show me", they see their billion.

**Why it works:** The hook IS the input. No wasted screen. The user's very first action in the app is answering a question about themselves — and the answer is instant.

**Drop-off risk:** LOW. The billion-seconds question is universally compelling. Date entry is 8 keystrokes.

---

### Screen 2: Your Billion (The First Wow)
**Goal:** Surprise + delight. The counter animation makes it feel alive.

```
┌─────────────────────────────┐
│                             │
│  Your billionth second      │
│                             │
│  ████████████████████       │
│  1,000,000,000              │
│     seconds alive           │
│  ████████████████████       │
│                             │
│  March 23, 2025             │
│  You passed it 1 year ago!  │
│                             │
│  [ Wow — what else? ───→ ]  │
│                             │
└─────────────────────────────┘
```

**What happens:** Animated counter rolls up to 1,000,000,000. The date is shown. If it's in the past, "You passed it X ago!" If future, "Coming in X months!"

**The key moment:** The user just learned something personal they never knew. Emotional spike. The button text is curiosity-driven: "what else?" — not "Next".

**Drop-off risk:** VERY LOW. They just got their first surprise. They want more.

---

### Screen 3: More About You (The Depth Reveal)
**Goal:** Show that the billion was just the beginning. Overwhelm (positively) with how many hidden milestones exist.

```
┌─────────────────────────────┐
│                             │
│  You have 12 milestones     │
│  coming in the next year    │
│                             │
│  ★ 12,000 days      Jul 14  │
│    500 months       Aug 3   │
│  ★ 400,000 hours    Sep 19  │
│    1,700 weeks      Oct 5   │
│  ★ Saturn return    Nov 22  │
│    ...and 7 more            │
│                             │
│  [ That's me — now          │
│    someone I love ────→ ]   │
│                             │
└─────────────────────────────┘
```

**What happens:** A quick list of their upcoming milestones (top 5, with "and X more"). Stars on the most special ones. Just enough to show depth without overwhelming.

**The transition:** The button shifts attention FROM self TO another person. This is the empathy pivot — the moment the app becomes about relationships, not just numbers.

**Drop-off risk:** LOW. The list is short, scannable, and personally meaningful. The CTA is emotionally warm.

---

### Screen 4: Add Someone You Care About
**Goal:** Second person entry. This is where the viral loop begins.

```
┌─────────────────────────────┐
│                             │
│  Who do you want to         │
│  celebrate?                 │
│                             │
│  ┌─────────────────────┐    │
│  │  Name               │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │  DD  /  MM  / YYYY  │    │
│  └─────────────────────┘    │
│                             │
│  Mom, Dad, best friend,     │
│  partner, child, colleague  │
│  — anyone whose birthday    │
│  you know.                  │
│                             │
│  [ Find their milestones ]  │
│                             │
│  Skip for now               │
│                             │
└─────────────────────────────┘
```

**What happens:** Name + date for a second person. The hint text gives warm examples. "Skip for now" is small and unemphasised — we WANT them to enter someone.

**Why name matters here:** For the first person (yourself), "Me" is fine. For a second person, the name is essential — it goes into the share message.

**Drop-off risk:** MEDIUM. This is the first time we ask for "work" without immediate reward visible. The hint text and the emotional framing ("celebrate") reduce friction. Skip is available as escape.

---

### Screen 5: Their Milestone + Share Prompt
**Goal:** The share moment. Show the second person's hero milestone and make sharing irresistible.

```
┌─────────────────────────────┐
│                             │
│  Mom turns                  │
│                             │
│  ████████████████████       │
│  20,000                     │
│     days old                │
│  ████████████████████       │
│                             │
│  June 18, 2026              │
│  That's in 13 days!         │
│                             │
│  "Hey Mom, did you know     │
│   you turn exactly 20,000   │
│   days old on June 18th?"   │
│                             │
│  [ Send to Mom ────→ ]      │
│  [ Share as image ]         │
│                             │
│  Maybe later                │
│                             │
└─────────────────────────────┘
```

**What happens:** Counter animation for the second person's hero milestone. Below it: a pre-written share message, personalised with their name. Two share options: direct message (WhatsApp/SMS) or image card.

**This is THE moment.** The user has just discovered something personal and surprising about someone they care about. The share message is ready. One tap sends it. This is where k-factor happens.

**Drop-off risk:** LOW for viewing, MEDIUM for actually sharing. "Maybe later" lets them continue without guilt. Even if they don't share now, the seed is planted.

---

### Screen 6: Together (Team Preview)
**Goal:** Show the combined milestone concept — something neither person's milestones alone could reveal.

```
┌─────────────────────────────┐
│                             │
│  You + Mom together         │
│                             │
│  Your combined age is       │
│  38,547 days                │
│                             │
│  In 1,453 days you'll hit   │
│  ★ 40,000 days together     │
│    (that's Nov 2030)        │
│                             │
│  Add more people to         │
│  discover family and        │
│  group milestones.          │
│                             │
│  [ Start exploring ───→ ]   │
│                             │
└─────────────────────────────┘
```

**What happens:** One combined milestone shown (the next round combined age). Brief, not overwhelming. Teases that more people = more discoveries.

**If they skipped Screen 4:** This screen is skipped too — go straight to Screen 7.

**Drop-off risk:** LOW. This is light and fast. It's a preview, not a deep dive.

---

### Screen 7: Welcome + What's Next
**Goal:** Transition to the dashboard with clear orientation. Give them a reason to come back.

```
┌─────────────────────────────┐
│                             │
│  You're all set!            │
│                             │
│  ✓ 2 people tracked         │
│  ✓ 24 milestones found      │
│  ✓ Next milestone: 12 days  │
│                             │
│  Come back when a           │
│  milestone is near — we'll  │
│  help you celebrate.        │
│                             │
│  [ Enable reminders ]       │
│                             │
│  [ Go to my milestones ─→ ] │
│                             │
└─────────────────────────────┘
```

**What happens:** Summary stats (people, milestones found, next one). Option to enable push notifications (the retention hook). Then into the dashboard.

**Why this screen matters:** It tells the user what the app IS now — a place you come back to when milestones approach. Without this framing, they might think "cool, I saw my billion" and never return. With it, they understand: this app watches your calendar and tells you when something special is coming.

**Drop-off risk:** NONE. This is the last screen. They're in.

---

## Metrics at Each Step

| Screen | Success metric | Target | Failure signal |
|--------|---------------|--------|----------------|
| 1. Hook + date | Date entered | >70% of page_views | If <50%, the hook text isn't compelling enough |
| 2. Your Billion | Tap "what else?" | >80% of date entries | If <60%, the billion reveal isn't exciting enough |
| 3. More About You | Tap "someone I love" | >60% of viewers | If <40%, milestone list doesn't show enough value |
| 4. Add Someone | Name+date entered (not skipped) | >50% of viewers | If <30%, the ask feels like too much work |
| 5. Share | Actual share initiated | >20% of viewers | If <10%, share message isn't compelling |
| 6. Together | View (auto) | >90% if reached | N/A |
| 7. Welcome | Enable reminders | >30% | If <15%, value prop for returning isn't clear |

**Overall funnel target:**
- Page view → date entered: >70%
- Date entered → share initiated: >15%
- Date entered → 2nd person added: >50%
- Date entered → reminders enabled: >25%

---

## Comparison: What Changes

| Aspect | v1-v3 (6 screens) | v4 (1 screen) | v5 (proposed, 7 screens) |
|--------|-------------------|---------------|--------------------------|
| Screens before first value | 4 (hook, prefs, who, name) | 0 (date on hook) | 0 (date on hook) |
| Wow moments | 1 (reveal) | 1 (reveal) | 4 (billion, list, their milestone, combined) |
| Share prompts | 1 (after reveal) | 0 (none!) | 1 (at peak emotion, screen 5) |
| People entered | 1 | 1 | 2 |
| Retention hook | None | None | Reminders prompt |
| Time to value | ~60 sec | ~15 sec | ~15 sec |
| Total time | ~90 sec | ~20 sec | ~90 sec |

**The key insight:** v4 is too fast. It gets to value instantly (good) but then drops the user on a dashboard with no guidance (bad). v5 keeps the instant value of v4 but adds a guided journey that builds emotional investment, initiates the viral loop, and sets up retention.

---

## When to Show Preferences

**NOT during onboarding.** Preferences (palindromes, lucky numbers, cosmic, sacred) go in Settings. All categories are ON by default. Reasons:
1. New users don't know what "palindromes" means in this context
2. Every preference question is a moment of doubt: "Should I turn this off?"
3. The default (all on) gives the richest first experience
4. Power users who want to filter will find Settings naturally

---

## When to Ask for Sign-in

**NOT during onboarding.** Sign-in unlocks cloud sync, multi-device, premium. But it's friction. Ask only after the user has:
1. Entered 2+ people
2. Used the app for 2+ days
3. Or: when they try a premium feature

Prompt: "Sign in to save your data across devices" — only when they have data worth saving.

---

## Implementation Notes

### Screen transitions
- Each screen slides/fades smoothly (300ms)
- Counter animations on screens 2 and 5 (1.5-2 seconds)
- No progress dots, no back arrows except on screen 4 (the "work" screen)

### State management
- Screen 1 saves date to localStorage immediately on entry
- Screen 4 saves second person on entry
- Screen 7 saves `hm_onboarded` flag → dashboard loads

### Skip paths
- Screen 4: "Skip for now" → jump to screen 7 (skip 5, 6)
- Screen 5: "Maybe later" → continue to screen 6
- All skips are de-emphasised (small text, not buttons)

### Analytics events
- `onboard_date_entered` (screen 1 → 2)
- `onboard_billion_seen` (screen 2 viewed)
- `onboard_more_tapped` (screen 2 → 3)
- `onboard_add_person` (screen 4 submitted)
- `onboard_skip_person` (screen 4 skipped)
- `onboard_share_initiated` (screen 5 share tapped)
- `onboard_share_skipped` (screen 5 "maybe later")
- `onboard_reminders_enabled` (screen 7)
- `onboard_complete` (screen 7 → dashboard)

---

## Content Variants to Test

### Screen 1 hook text (A/B test candidates):

**A (curiosity):**
"Somewhere between your 31st and 32nd birthday, you quietly turn 1,000,000,000 seconds old. When's yours?"

**B (relationship):**
"Your best friend has a hidden milestone coming up. Enter your birthday first — then find theirs."

**C (challenge):**
"How many special number milestones do you have in the next year? Most people have over 10. Find yours."

### Screen 5 share message variants:

**A (discovery):**
"Hey [name], did you know you turn exactly [value] [unit] old on [date]?"

**B (celebration):**
"[name]! You have a hidden milestone coming: [value] [unit] on [date]. We should celebrate!"

**C (curiosity pull):**
"I just found out something cool about your birthday. Check happymoments.app — enter your birthday and see."

---

## Priority and Timing

This is a **Session 2 task** — after beta friends have tested the current single-screen version and we have baseline metrics. The single-screen version tells us:
- What % of visitors enter a date (baseline conversion)
- What % share (baseline k-factor)
- Where people get confused on the dashboard

The 7-screen version optimises based on that data. If single-screen already converts at >70%, we keep it simple and only add the share prompt (screen 5). If it converts at <40%, the full 7-screen journey is needed.

**Estimated implementation: 1 session (3-4 hours).** The milestone reveal, counter animation, share mechanics, and notification prompt already exist — this is mostly rearranging existing components into a guided flow.
