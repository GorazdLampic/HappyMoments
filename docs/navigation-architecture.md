# HappyMoments Navigation Architecture

**Version:** 1.0
**Status:** CANONICAL — this is the source of truth for app structure and navigation
**Last updated:** June 2026
**Cross-references:** [ux-guidelines.html](ux-guidelines.html) (visual specs), [onboarding-flow.md](onboarding-flow.md) (first-time experience), [user-psychology.md](user-psychology.md) (why decisions)
**Supersedes:** archive/ux-strategic-review-v2.html, archive/navigation-architecture-research.md

---

## Navigation Model: 2 Tabs + Profile Icon

```
┌─────────────────────────────────────────┐
│  HappyMoments                      👤  │  ← Profile icon (top-right)
│                                         │
│           [ screen content ]            │
│                                         │
│  ┌──────────────┐  ┌──────────────┐     │
│  │    Home      │  │   People     │     │  ← Bottom tabs
│  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────┘
```

| Element | What's in it | Usage |
|---------|-------------|-------|
| **Home** (bottom tab) | Hero card + time-chunked milestones + Together section + Add someone | 70% |
| **People** (bottom tab) | Add/edit people, per-person milestone view | 20% |
| **👤 Profile** (top-right icon) | Settings, theme, language, notifications, account, legal, export | 10% |

### Why this structure

- **2 bottom tabs, not 4:** Hick's Law — fewer choices = less confusion. Research shows 3-5 tabs optimal, but HappyMoments has only 2 primary destinations. Profile is a settings area, not a daily destination — it goes top-right like Instagram/Spotify.
- **No "Team" tab:** Combined milestones appear as a section ON the Home screen when 2+ people exist. Contextual, not forced.
- **No "Data" tab:** "Data" was a confusing label. People management moves to "People" tab. Export/import moves to Profile.
- **Profile as top-right icon:** Settings are used 10% of the time. They don't earn a bottom tab. The person icon (👤) is a known pattern from Instagram, Spotify, YouTube.

---

## Home Screen Architecture

The daily landing screen. Designed for "check and go" (5 seconds) at the top, with "stay and explore" depth below the fold.

```
┌─────────────────────────────────────┐
│                                     │
│  ★ HERO MILESTONE CARD              │  ← Glanceable (weather-app model)
│  Mom turns 20,000 days              │     One card. Gold accent.
│  June 18 — in 12 days!             │     [Share] [Remind me]
│  [Share]  [Remind me]              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  COMING UP                          │  ← Time-chunked milestone list
│  This week                          │     Max 5-7 items per chunk
│   Dad · 888 days · Tuesday          │     (Miller's Law)
│   You · 500 months · Thursday       │
│  This month                         │     Tap any → share modal
│   Sister · 12,321 days · Jun 22     │
│   Wedding · 3,000 days · Jun 28     │
│  Later                              │
│   You · 1 billion s · Aug 14        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  TOGETHER (if 2+ people)            │  ← Contextual section
│  You + Mom = 38,547 days            │     Appears automatically
│  40,000 together in Nov 2030        │     "See more combined →"
│                                     │
├─────────────────────────────────────┤
│                                     │
│  + Add someone to celebrate         │  ← Always at bottom
│                                     │
└─────────────────────────────────────┘
```

### Hero Card

The most important element. Like the temperature in a weather app — one glance tells you what matters.

**Selection algorithm:** Balance impressiveness × proximity.

```
heroScore = impressiveness × 0.6  +  proximity × 0.4
```

**Impressiveness scoring:**

| Milestone type | Score | Examples |
|---------------|-------|---------|
| Birthday (upcoming) | 150 | 48th birthday in 3 days |
| Big milestone (power of 10) | 120 | 1 billion seconds, 10,000 days |
| Saturn return | 110 | 1st Saturn return |
| Round thousands in days | 100 | 20,000 days |
| Repdigit | 90 | 11,111 days |
| Cultural/sacred | 80 | 888 days, 108 months |
| Jupiter/Chiron return | 70 | Cosmic |
| Palindrome in days | 40 | 12,321 days |
| Fibonacci | 10 | 2,584 days (most people won't recognize) |

**Proximity scoring:**

| Distance | Score |
|----------|-------|
| Today | 100 |
| This week (≤7 days) | 80-95 |
| This month (≤30 days) | 55-80 |
| This year (≤365 days) | 0-55 |
| Further | 0 |

**Key rule:** A billion seconds 6 months away CAN outscore a 2,584 (Fibonacci) in 3 days. Impressiveness matters more than proximity for truly remarkable numbers.

### Time-Chunked Milestone List

Milestones grouped by: **This week** / **This month** / **Later**

Max 5-7 items per chunk (Miller's Law). If more exist, show "and X more" with expand.

Each cell: milestone value (gold mono) + person name + date + countdown. Tap → share bottom sheet.

### "Together" Section

Appears ONLY when 2+ people are added. Shows one combined milestone (the next round combined age). "See more combined →" link.

This solves the "Team tab" problem: combined milestones are discoverable without a dedicated tab.

### "Add Someone"

Dashed-border card at the bottom. Always visible. Tapping opens the People tab with the add form focused.

---

## Milestone Coherence Rules

Not all numbers are interesting in all units. Filter by what makes sense:

| Unit | Show | Don't show |
|------|------|-----------|
| **seconds** | Round thousands, powers of 10, repdigits (11111111), Asian lucky (888888) | Palindromes, Fibonacci, alternating patterns |
| **minutes** | Same as seconds | Same as seconds |
| **hours** | Round hundreds, powers of 10, repdigits | Palindromes, Fibonacci, alternating |
| **days** | Everything — palindromes, Fibonacci, powers, round numbers all work at human scale | Nothing filtered (days are the most natural unit) |
| **weeks** | Round hundreds only | Everything else |
| **months** | Round hundreds + cultural (108, 786, 888) | Everything else |
| **years** | Everything (small numbers, all meaningful) | Nothing filtered |

### Unit display names

Full words in all views: "seconds", "minutes", "hours", "days", "weeks", "months", "years". Short forms ("s", "min", "hrs") only in very tight spaces (widgets, share cards).

---

## Tap Paths

Every action ≤ 3 taps from any screen.

| User wants to... | Path | Taps |
|-----------------|------|------|
| See what's coming up | Open app → Home (hero + list visible) | **0** |
| Share a milestone | Tap milestone → Share button (bottom sheet) | **2** |
| Add a person | Tap "Add someone" (Home bottom) or People tab → form | **2** |
| See combined milestones | Scroll Home → "Together" section → "See more" | **2** |
| Change language | Profile icon (👤) → Language | **2** |
| Enable notifications | Profile icon → Notifications toggle | **2** |
| See a person's milestones | People tab → tap person name | **2** |
| Edit/delete a person | People tab → tap person → edit/delete | **3** |
| Change theme | Profile icon → Theme toggle | **2** |
| Gift suggestion | Tap milestone near its date → "Gift idea" link | **2-3** |

---

## Transition Model

| Type | When | Animation |
|------|------|-----------|
| **Tab switch** | Home ↔ People | Instant crossfade. Maintain scroll position. |
| **Drill-down** | Tap person → their milestones. Tap "See more combined" | Slide from right. Back arrow (←) top-left. |
| **Bottom sheet** | Share flow. Add person form. Gift order. | Slide up from bottom. Drag-to-dismiss or × close. |
| **Full-screen modal** | Profile/Settings sub-pages. Onboarding. | Slide up. Close (×) top-left. |

**Max depth: 2 levels.** Tab → detail view → done. Never deeper.

---

## Feature Discovery Timing

Features appear when the user has CONTEXT to understand them. Not on a timer.

| Feature | Appears when... | How |
|---------|----------------|-----|
| Hero milestone | Always (1+ person) | Top of Home |
| Time-chunked list | Always (1+ person) | Below hero |
| "Together" section | 2+ people added | Bottom of Home, auto-appears |
| Share as image | User taps Share | Option in share bottom sheet |
| Gift suggestion | Milestone is for another person AND has high impressiveness score | Small "Gift idea" text on milestone cell |
| Notifications prompt | End of first session (onboarding Screen 5) OR Day 2 | One-time inline prompt, not modal |
| Number preferences | User opens Profile → Advanced | Expander in Profile, hidden by default |
| Export/Import | Profile section | Always available, never promoted |

---

## Empty States

Every section has a meaningful empty state that TEACHES and MOTIVATES.

| Section | Empty state copy |
|---------|-----------------|
| Home (no people) | Onboarding wizard (see onboarding-flow.md) |
| Home (1 person, no milestones this week) | "Your next milestone is in X days. Add more people to find milestones sooner!" |
| Together section (1 person) | "Add a second person to discover combined milestones — like when your ages add up to 50,000 days." |
| People tab (1 person) | "Your mom, your partner, your best friend — whose birthday do you know?" |
| Notifications off | "Never miss a milestone. We'll remind you the day before." |

---

## What Was Removed (and Why)

| Removed | Reason |
|---------|--------|
| **Team/Combined tab** | Section on Home instead. Contextual > dedicated tab. |
| **"Data" tab** | Renamed to "People" tab. Benefits, not technical terms. |
| **Settings as bottom tab** | Moved to Profile (👤) top-right. Used 10% of the time. |
| **Person filter pills** | Columns already filter by person. Redundant UI. |
| **Today highlight banner** | Hero card replaces it. |
| **History facts banner** | Users came for THEIR milestones. |
| **Highlights toggle** | Default view already shows best milestones. |
| **Gift store as banner** | Contextual links on milestone cells instead. |
| **Set switcher / Groups** | Complexity removed. One list of people. |
| **6 themes** | 2 themes: Dark and Light. |
| **Consent banner** | Auto-accepted on first wizard tap. Legal link in Profile. |

---

## Remind Me: Implementation

When user taps "Remind me" on a milestone:
1. If notifications not enabled: prompt to enable (one-time)
2. Schedule a local notification for 1 day before the milestone date
3. Show confirmation: "Reminder set for [date]"
4. Notification text: "[Name] turns [value] [unit] tomorrow! Time to celebrate."

Calendar integration: offer "Add to calendar" as secondary option in share bottom sheet (Google Calendar, .ics download). Not a separate button on the milestone card.
