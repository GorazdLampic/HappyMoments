# HappyMoments User Psychology

**Version:** 1.0
**Status:** CANONICAL — this is the "why" behind every UX decision
**Last updated:** June 2026
**Cross-references:** [ux-guidelines.html](ux-guidelines.html) (how it looks), [onboarding-flow.md](onboarding-flow.md) (the journey), [navigation-architecture.md](navigation-architecture.md) (the structure)
**Supersedes:** archive/ux-research-strategic.md (distilled, not duplicated)

---

## The Core Insight

> "HappyMoments is a relationship tool disguised as a number calculator. It gives people reasons to celebrate and reconnect."

The numbers are the excuse. The celebration is the point. The reconnection is the real value.

Two use cases, equally important:

| Use case | Example | Emotional driver |
|----------|---------|-----------------|
| **Celebrate** | "Your daughter turns 5,000 days old next Tuesday!" | Joy, marking time, parental pride |
| **Reconnect** | "Hey, I just found out you turn 15,000 days next week!" | The perfect non-awkward excuse to reach out |

---

## Expert Feedback (Luka Renko + UX reviewer)

These quotes shape our design decisions:

> "Moraš voditi uporabnika po točno želeni poti... ampak najprej moraš vedeti kaj ta pot sploh je."
>
> *You must guide the user on the exact desired path... but first you must know what that path is.*

**Implication:** The onboarding is a guided story with ONE path, not a choose-your-adventure. ME → FAMILY → FRIEND → dashboard. No branching.

> "Vsakič, ko uporabnik nekaj izpolni, mora imeti nek občutek zadovoljstva. Nekaj se zgodi... kot nagrada."
>
> *Every time the user completes something, they must feel satisfaction. Something happens... like a reward.*

**Implication:** After entering birthday → counter animation. After adding a person → their milestone reveal. After sharing → "Sent!" confirmation. Never: enter data → nothing visible happens.

> "Ali naj uporabnik izbere le ENEGA družinskega člana... Tako potem uporabnik ne dobi občutka, da je to nek 'računovodski' program."
>
> *Should the user enter only ONE family member?... That way the user doesn't get the feeling that this is some 'accounting' program.*

**Implication:** During onboarding, enter ONE other person. Not a list. Not a form with "Add another." ONE person, ONE reveal, ONE share moment. The dashboard then motivates adding more — because the user now GETS IT.

> "Sedaj je odločno preveč teksta, slabo izbrani fonti."
>
> *Currently there is decidedly too much text, poorly chosen fonts.*

**Implication:** Three text levels only (hero/body/caption). No tiny text. Serif for warmth, mono for numbers. See [ux-guidelines.html](ux-guidelines.html).

---

## The Reward Map

Every user action has an immediate, visible reward. No action goes unrewarded.

| Action | Reward | Emotional feel |
|--------|--------|---------------|
| Enter MY birthday | Counter animation → my milestone revealed | "I didn't know that about myself!" |
| Enter THEIR birthday | Counter animation → their milestone revealed | "I should tell them!" |
| Tap Share | Pre-written message ready, native share sheet opens | "That was easy" |
| Share sent | Confirmation toast, analytics track | Social validation anticipation |
| Return next day | Hero card updated, new countdown | "Time is moving, this matters" |
| Add 2nd person | "Together" section appears on Home | "Wait, there's MORE?" |
| Enable reminders | "Reminder set for [date]" confirmation | Peace of mind |
| Milestone day arrives | Push notification + hero card celebration | "I remembered! I'm a good friend" |

**Anti-pattern:** Never show a data summary as a reward. "2 people tracked, 24 milestones found" is accounting. "Your mom turns 20,000 days in 12 days!" is a celebration.

---

## The Hook Model (Nir Eyal)

```
Trigger → Action → Variable Reward → Investment
```

Applied to HappyMoments:

| Component | Implementation |
|-----------|---------------|
| **Trigger** | Push notification: "Mom turns 20,000 days tomorrow!" (external). Opening app out of curiosity (internal). |
| **Action** | Open app → see hero card (5-second glance). |
| **Variable Reward** | Different milestone each time. Sometimes it's your number, sometimes someone else's. Sometimes a cosmic event. The VARIETY keeps it interesting. |
| **Investment** | Share a milestone. Add another person. Enable reminders. Each investment increases value of the next trigger. |

---

## Peak-End Rule (Daniel Kahneman)

People judge experiences by two moments: the **peak** and the **end**.

| Moment | HappyMoments implementation |
|--------|----------------------------|
| **Peak** | The counter animation rolling up to the big number. Gold glow. Sparkle particles. This is the moment that defines the product in the user's memory. |
| **End** | Every session ends with anticipation, not a dead screen. "Your next milestone is in X days" or "Remind me" creates forward-looking positive emotion. Never end on: empty state, error, "no milestones today" with nothing else. |

---

## The 5 UX Principles We Follow

Distilled from 25 researched (see archive/ux-research-strategic.md for the full list). These 5 are the ones that most directly shape our decisions:

### 1. Value Before Identity (from Duolingo)
Deliver the product's value before asking for ANY user data. We don't ask for name, email, sign-in, or preferences before showing the first milestone. The ONLY input is birthday — and that IS the product.

### 2. One Thing Per Screen (from Apple HIG, Luke Wroblewski)
Each screen has ONE primary action. The hero card IS the screen. The reveal IS the screen. Don't add navigation, options, or secondary features that compete with the primary element.

### 3. Hick's Law (from Jon Yablonski)
More choices = more time = more drop-off. This is why we have 2 tabs, not 4. Why we show one hero card, not a grid of options. Why settings are hidden in Profile, not displayed as toggles on the main screen.

### 4. Emotional Framing (from Spotify Wrapped)
"788 hours finding yourself" beats "47,283 minutes listened." Numbers must tell a story. "20,000 days alive" should feel like an achievement, not a statistic. The countdown text uses emotional language: "That's this week!" not "7 days from now."

### 5. Design the Shareable Artifact First (from Spotify Wrapped team)
If it can't be screenshotted and posted, it won't go viral. Every milestone card, every reveal screen, every share message is designed to look good when shared. The share flow produces beautiful 9:16 image cards for Instagram/Stories, not just text.

---

## Anti-Patterns: What We Never Do

| Anti-pattern | Why it's bad | What we do instead |
|-------------|-------------|-------------------|
| Show "X people tracked, Y milestones found" | Feels like a database report, not a celebration | Show the NEXT milestone: "Mom turns 20,000 days in 12 days!" |
| Ask for sign-up before value | User hasn't experienced the product yet | Sign-up only after they have data worth saving (3+ people, Day 3+) |
| Dump all milestones in a flat list | Overwhelming, no hierarchy, no story | Time-chunk: "This week" / "This month" / "Later", max 5-7 per chunk |
| Show features the user hasn't earned | Confusing, empty tabs | Progressive: "Together" appears only when 2+ people exist |
| Use tiny text for "important" info | Date and countdown ARE the actionable info | Body size (1.1rem) minimum for dates. Gold for countdowns. |
| End session on a blank screen | No reason to return | Always show the next milestone with countdown |
| Show all settings upfront | Overwhelming for new users | Profile icon → simple page. Number preferences behind "Advanced" expander. |
| Use "Data" as a tab label | Technical, not user-benefiting | "People" — describes what's IN the tab, not the data type |
| Show ugly numbers (25252525 min) | Breaks the magic — user thinks "why should I care?" | Coherence filter: only show numbers that make sense for each time unit |

---

## Persona Archetypes

Four primary archetypes (distilled from 15 personas researched):

### 1. The Parent (age 30-50)
**Goal:** Track children's milestones. Share with family.
**Emotional driver:** Parental pride, marking time passing, creating memories.
**Key feature:** Hero card showing their child's next milestone. "Your daughter turns 5,000 days old on..." → share to family WhatsApp group.
**Retention:** Milestone notifications for their children.

### 2. The Reconnector (age 25-45)
**Goal:** Find an excuse to reach out to someone they've lost touch with.
**Emotional driver:** Longing, friendship, non-awkward excuse.
**Key feature:** Pre-written share message. "Hey, I just found out you turn 15,000 days next week!" → one-tap send.
**Retention:** App reminds them of friends' milestones they'd otherwise forget.

### 3. The Number Nerd (age 18-35)
**Goal:** Discover mathematical patterns in time. Self-discovery.
**Emotional driver:** Intellectual curiosity, "cool factor," social currency.
**Key feature:** Fibonacci, palindromes, cosmic cycles, Pi connections.
**Retention:** There's always another interesting number coming.

### 4. The Family Organizer (age 35-60)
**Goal:** Track the whole family, discover group milestones.
**Emotional driver:** Family identity, connection, celebration planning.
**Key feature:** Combined milestones ("Your family's combined age reaches 100,000 days!"). Multiple people.
**Retention:** The app becomes more valuable as more family members are added.

---

## Content Freshness: Why Users Return

The app must have something NEW on every visit:

| Frequency | What's new | Source |
|-----------|-----------|--------|
| Every day | Hero card countdown changes. "12 days" → "11 days" → "10 days" | Automatic (time passes) |
| Every week | Different milestone becomes the hero (closest one rotates) | Automatic (milestone dates approach) |
| Every month | New milestones enter the "Coming up" view | Automatic (year-long horizon) |
| Each person added | ~20 new milestones appear in the timeline | User-driven |
| Each milestone shared | Social reactions create external reward loop | User-driven |

**The fundamental retention insight:** Unlike social media (which needs new content), HappyMoments generates fresh content AUTOMATICALLY from the passage of time. Every day, the countdown changes. Every week, a new milestone becomes the closest one. The user doesn't need to "do" anything — time creates value.
