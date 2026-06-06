# HappyMoments Onboarding v3 — Interactive Discovery

## The Duolingo Lesson

Duolingo's genius: **users PLAY the game before signing up.** By the time they're asked to commit, they've already experienced value. They don't want to lose their progress.

For HappyMoments, the equivalent: **users discover milestones before entering any data.** By the time we ask for THEIR birthday, they're already excited about what they'll find.

---

## The New Flow (8 screens, ~90 seconds, one tap per screen)

### Screen 1: Hook
```
[Animated sparkle background]

Every person alive has a
billion-second birthday

When's yours?

[Let's find out →]
```
Big text, warm, intriguing. One button.

### Screen 2: What excites you? (interactive preference)
```
What kind of numbers
excite you?

[Round numbers ○] (10,000 days, 1,000,000 minutes)
[Lucky numbers ○] (888, 520 — I love you)
[Math patterns ○] (Fibonacci, palindromes, Pi)  [Gorazd: put Pi on 1st place, nice plaindromes on 2nd... ]
[All of them! ●] ← default selected

[Next →]
```
This is like Duolingo's "Why are you learning?" — creates ownership.
Stores the preference to customize which milestones show first.
The selections are BIG tap targets, one column, visual.

### Screen 3: Who first? (interactive choice)
```
Let's start with...

[My own birthday 🎂]
[Someone I care about 💝]
```
Two big buttons. Simple choice. Like Duolingo's "beginner or experienced?"

### Screen 4: The Name
```
What's the name?

[_______________]
e.g. Anna, Mom, My partner

[Next →]
```
One field. Big. Centered. Keyboard opens automatically.

### Screen 5: The Date
```
When is Anna's birthday?

[DD] / [MM] / [YYYY]

[Discover →]
```
One input group. Clear label using the name they entered.

### Screen 6: THE REVEAL (the "first lesson" equivalent)
```
Anna

[counter rolls from 0 to...]

1,000,000,000
seconds

September 12, 2028
832 days from now

✨ [gold sparkles]
```
Full-screen. Dramatic. Counter animation. Sparkles. Gold glow.
This is the FIRST VALUE DELIVERY — like completing a Duolingo lesson.

### Screen 7: The Reaction + First Action
```
Anna's billion-second birthday
is 832 days away!

That's a reason to celebrate 🎉

GL: somewhere here we can ad also smth like what about your friends... enter their data (their birthday or some other date that connects you... ) and then you show the combined... and can share the one of a friend... 


[Share with Anna →]
[See more milestones]
```
The share is the PRIMARY action — like Duolingo asking you to "share your streak."
"See more milestones" is secondary.

### Screen 8: The Dashboard
```
[Normal app dashboard with milestones]
[+ Add another person]
```
The user is now in daily mode. They can add more people, explore, share.
NO signup required (like Duolingo — signup comes later).

---

## Key Design Principles

1. **One action per screen** — never two input fields, never two paragraphs
2. **Big text, minimal words** — each screen has max 2 lines of text
3. **Interactive before data** — screen 2 asks a FUN question before asking for personal data
4. **The reveal IS the product** — screen 6 is the trailer and the movie in one
5. **Share before explore** — the first instinct after "wow" should be to tell someone
6. **No signup wall** — the app works fully without an account (signup comes in settings)

## What This Changes vs Current

| Current | New |
|---------|-----|
| 3 steps (welcome, name+date, reveal) | 8 screens (hook, preference, choice, name, date, reveal, reaction, dashboard) |
| Text-heavy welcome | One-line hook |
| Combined name+date screen | Separate screens, one field each |
| Reveal goes straight to dashboard | Reveal → reaction → share prompt → dashboard |
| No preference customization | User picks number types they like |
| No emotional framing | "That's a reason to celebrate 🎉" |

## Implementation Notes

- Each screen is a `wizard-step` div with fade transition
- Preferences stored in localStorage (which number patterns to prioritize)
- The counter animation already exists — reuse it
- Progress dots at bottom (●●●○○○○○) show which step you're on
- Back button on screens 3-5 (not on hook or reveal)
- Total time: ~90 seconds for engaged user, ~60 seconds for fast tapper
