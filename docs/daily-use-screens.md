# HappyMoments Daily Use — Screen Strategy

## Overview

After onboarding, the user enters "daily use" mode. Three tabs at the bottom:
- **Me** — individual milestones for all people
- **Together** — combined/group milestones
- **Edit** — manage people, groups, settings

This document describes each screen, transitions, and design decisions.

---

## Tab 1: Me (Individual Milestones)

### What user sees:
- Time-chunked milestone list: "This week", "This month", "Later this year", "Next year"
- Each milestone shows: person name, milestone value+unit, date, Share button
- No hero card (all milestones equal — no person emphasized over another)
- "Together" section teaser at bottom (if 2+ people): combined group target
- "+ Add more people" prompt at bottom

### Person filter:
- Row of person buttons at top — tap to filter milestones by one person
- Tap again to show all

### Share:
- Each milestone has a "Share" pill button
- Tap → text copied to clipboard + bottom sheet shows the text
- User opens WhatsApp/Viber and pastes (full control to edit before sending)

### Transition to other tabs:
- Tap "Together" tab → see combined milestones
- Tap "Edit" tab → manage people and groups
- Tap "Together" section teaser → switch to Together tab

---

## Tab 2: Together (Combined/Group Milestones)

### Current:
- Group name with pencil icon (edit → goes to Edit tab)
- Combined milestone content from renderCombinedTab()
- Shows sum milestones, ratio milestones, time comparisons

### What SHOULD be there:
- Group name + pencil at top
- **Group switcher** if 2+ groups (tap to change which group you're viewing)
- Combined milestone hero: the next nice round number (same as onboarding)
- Below: list of combined milestones (sum, ratio, duration)
- Each with Share button
- At bottom: "Create another group" link

### Missing functionality:
- [ ] No group switcher — user has to go to Edit tab to switch
- [ ] Combined milestones only show if renderCombinedTab succeeds
- [ ] No way to see "more" combined milestones
- [ ] Share for combined milestones

---

## Tab 3: Edit (Manage People, Groups, Settings)

### Current layout (top to bottom):
1. **Dates & Events** — list of people with edit/delete
2. **Add a Date** — name + date + type
3. **Groups** — list of groups with active/switch/rename/delete + "Add group"
4. **Backup** — export/import
5. **Account** — sign in
6. **Number Patterns** — toggles for types
7. **Custom Numbers** — user-specific numbers
8. **Appearance** — dark/light
9. **Reminders** — enable notifications
10. **Invite / Feedback / Legal**

### Problems:
- Too much on one screen — user has to scroll forever
- Group management is buried below the person list
- No dedicated "edit group members" screen — you add people globally, not per-group
- No clear visual separation between "manage data" and "settings"

### Proposed improvement:
Split Edit tab into sections with clear headers, or use accordion/collapsible sections:
- **People & Groups** (primary — top)
- **Settings** (secondary — bottom, collapsed by default)

OR: Edit tab shows ONLY current group:
- Group name (editable) at top
- Members of this group
- Add member (name + date, inline)
- "Switch group" / "New group" at bottom
- Settings in a separate gear icon or 4th tab

---

## Design Questions for Gorazd

### Q1: Settings content during onboarding — show or hide?

**Arguments FOR showing (current behavior on old cached version):**
- User can explore settings if curious
- They see what's configurable (themes, notifications)
- Less code to manage visibility

**Arguments AGAINST (recommended):**
- Distracting — user should focus on the guided path
- Looks broken (half onboarding, half settings)
- Users don't need settings before they have data
- Professional apps (Instagram, Duolingo) show NOTHING except onboarding during setup

**Recommendation:** Hide during onboarding. Settings appear only after reaching dashboard. *(Already implemented in v37 but cached version still shows old.)*

### Q2: Should there be a "see more combined milestones" screen?

**Arguments FOR:**
- Combined milestones are the unique value of the app
- Showing just one combined number undersells the feature
- Sum + ratio + duration milestones are all different and interesting

**Arguments AGAINST:**
- During onboarding, one combined number is enough to plant the idea
- Too many screens = higher drop-off
- The dashboard Together tab shows full combined milestones

**Recommendation:** During onboarding, show ONE impressive combined number + individual member highlights. Save the full combined milestone exploration for the Together tab in daily use. This gives the user a reason to come back.

### Q3: Should we show already-seen individual milestones on the group reveal?

**No.** If the user already saw Nastja's milestones on Screen 5, don't repeat them on Screen 8. Only show NEW individual milestones (people added on Screen 7 that weren't seen before). The combined milestone itself IS the new content.

### Q4: Group editing — separate page or inline?

**Arguments for separate page:**
- Clean, focused experience
- User knows exactly what they're doing
- Can show full member list + add/remove
- "Done" button returns to dashboard

**Arguments for inline (current):**
- No extra navigation
- Everything visible at once

**Recommendation:** Separate page/modal for group editing. When user taps pencil next to group name:
1. Full-screen overlay with group name (editable), member list, add member form
2. "Done" button returns to previous tab
3. Same pattern used in onboarding (Screen 7) — consistent

### Q5: How should the group switcher work in daily use?

Options:
- **A. Tabs within Together tab** — one sub-tab per group (like "Family | Friends")
- **B. Dropdown** — tap group name to see list
- **C. Swipe** — swipe left/right between groups

**Recommendation:** Option A (sub-tabs) for 2-3 groups. If 4+, use dropdown.

---

## Proposed Daily Use Flow (v2)

### Tab 1: Me
```
[Person filter: All | Me | Nastja | Val]

This week
  Val: 5,000 days              Jul 12    [Share]
  Me: 18,000 days              Oct 5     [Share]

This month
  Nastja: 600 months           Sep 3     [Share]

Later this year
  Me: 50 years                 Jun 2028  [Share]
  Val: 1,000,000,000 sec       Nov 2027  [Share]

── Together ──
Family: 50,000 days combined in 142 days

[+ Add more people]
```

### Tab 2: Together
```
[Family | Friends]  ← group sub-tabs (if 2+ groups)

Family
  50,000 days combined         Oct 28    [Share]

Sum milestones
  Me + Nastja: 40,000 days     Feb 14    [Share]
  All: 50,000 days             Oct 28    [Share]

Ratios
  Val is exactly 1/2 of Me     Jun 2030  [Share]

[Create another group]
```

### Tab 3: Edit
```
── Family (active) ──
  Me          Jun 2, 1978      [edit]
  Nastja      Mar 13, 1990     [edit]
  Val         Jul 7, 2012      [edit]
  [+ Add person to Family]

── Friends ──
  Me          Jun 2, 1978
  Matej       Dec 1, 1983
  [Switch to Friends]

[+ Create new group]

── Settings ──  (collapsed)
  Appearance | Notifications | Patterns | Backup
```

---

## Next Steps

1. Decide on Q1-Q5 above
2. Fix date formatting (ordinal suffixes)
3. Don't repeat already-seen milestones on group reveal
4. Consider group switcher for Together tab
5. Consider separate group editing page
