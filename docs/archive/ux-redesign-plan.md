# HappyMoments UX Redesign Plan
## Onboarding (Duolingo-style) + Daily Use Polish

### Design Principles
1. Onboarding = guided, one thing per screen, big fonts, emotional
2. Daily use = dashboard, information-dense but clean, bigger fonts
3. Don't lose ANY existing functionality
4. Progressive disclosure — show complexity only when user is ready

---

## PART 1: Step-by-Step Onboarding

### Current flow (problems):
- One screen with: name field + type dropdown + date fields + "Discover" button
- Too much at once for first-time user
- Small fonts, unclear purpose
- No emotional payoff until AFTER clicking the button

### New flow (4 screens):

**Screen 1: Welcome**
```
[HappyMoments logo]

Discover every reason
to celebrate

[Get Started →]
```
- Full screen, centered, big serif text
- One button, one action
- Sets the emotional tone

**Screen 2: Who**
```
Who do you want to celebrate?

[_____________]
e.g. Anna, Mom, My partner

[Next →]
```
- One input field, big, centered
- Placeholder suggestions
- Keyboard auto-opens
- Pre-filled with "My Birthday" but user can change

**Screen 3: When**
```
When is [name]'s special date?

[DD] / [MM] / [YYYY]

[Discover →]
```
- Just the date, big fields
- Auto-advance between DD/MM/YYYY (existing logic)
- Button says "Discover" — creates anticipation

**Screen 4: The Reveal (Aha moment)**
```
[name]

1,000,000,000
seconds

June 15, 2028 — 747 days from now

[Share this! →]     [Add someone else]
```
- BIG number with brief animation (count-up or fade-in)
- This IS the Aha moment
- Two clear actions: share (primary) or add more (secondary)
- After dismissing, enters the normal dashboard view

### Technical approach:
- New `onboarding-wizard` div with 4 steps
- CSS transitions between steps (slide or fade)
- Existing onboarding HTML stays as fallback
- Check localStorage `hm_onboarded` — if true, skip wizard
- The wizard stores name + date, then calls existing `handleStart()` logic
- After wizard, normal dashboard appears with the person already added

---

## PART 2: Daily Use Polish

### Font sizes (increase 20% from current):
| Element | Current | New |
|---------|---------|-----|
| Milestone numbers | 1.05rem | 1.25rem |
| Milestone units | 0.78rem | 0.95rem |
| Milestone dates | 0.82rem | 1.0rem |
| Tab labels | 0.82rem (mobile) | 1.0rem |
| Card descriptions | 0.9rem | Remove or shrink |
| Section titles | 1.12rem | 1.25rem |

### Text reduction:
| Section | Current text | New text |
|---------|-------------|----------|
| Share section | "A milestone is a reason to celebrate! Share it, plan something, or surprise someone." | Remove — the share buttons speak for themselves |
| Gift section | "Make this milestone unforgettable with a personalized gift." | Remove — product card is self-explanatory |
| Team tab | "Combined milestones for everyone in the group..." | Remove description paragraph |
| Data tab | "Add birthdays, anniversaries, and special dates..." | Remove — the form is self-explanatory |
| Calendar | "Save to calendar:" label | Keep but smaller |
| Settings patterns | Long pattern descriptions | Shorter: "Round (1000, 5000...)" stays |

### Single CTA per section:
| Section | Current CTAs | New |
|---------|-------------|-----|
| Share | WhatsApp + Viber + Email + Copy + Share... | Keep WhatsApp + one "More..." that expands others |
| Challenge | "Share with Friends" + "Share with Your Group" | One button: "Share with friends" |
| Gift | Product card + Order button | Keep as is (one product = one action) |
| Hero milestone | Share button | Keep (already single CTA) |

### Quick-share on milestones:
- The ↗ share icon on each milestone is correct
- Make it slightly bigger (16px → 20px)
- That's the primary per-milestone action

---

## PART 3: Implementation Order

1. **First: Onboarding wizard** — biggest visual impact, self-contained
2. **Second: Font sizes** — global CSS change, quick
3. **Third: Text reduction** — remove description paragraphs
4. **Fourth: CTA cleanup** — consolidate buttons

Each part is testable independently. Part 1 doesn't affect daily use. Parts 2-4 don't affect onboarding.

---

## PART 4: What NOT to change

- Tab navigation (Personal / Team / Data / Settings) — stays
- Milestone column layout — stays (power users need density)
- Connection matrix in Team settings — stays
- Language picker — stays
- Auth modal — stays
- Gift order form — stays (needs all those fields)
- Premium banner — stays (but already moved higher)
- History facts in Today section — stays

---

## Testing checklist (before releasing):

### Onboarding:
- [ ] New user sees wizard (clear localStorage to test)
- [ ] Entering name → Next works
- [ ] Entering date → Discover works
- [ ] Reveal screen shows correct milestone
- [ ] "Share this" works (Web Share API or clipboard)
- [ ] "Add someone else" loops back to Screen 2
- [ ] After wizard, dashboard shows with person added
- [ ] Returning user does NOT see wizard again
- [ ] Deep link users skip wizard (they see friend's milestones)
- [ ] All languages work in wizard

### Daily use:
- [ ] Fonts visibly larger on mobile
- [ ] No description text cluttering the view
- [ ] Share buttons work (WhatsApp, Viber, Email, Copy)
- [ ] Gift section shows for special milestones
- [ ] Team tab works
- [ ] Settings work
- [ ] Quick-share icon works on milestones
- [ ] Zoom works
- [ ] Bottom safe zone maintained
- [ ] Premium banner visible but not intrusive
