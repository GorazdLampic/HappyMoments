# HappyMoments Daily Use Screens — v2.5.0 (versionCode 50)

After onboarding (9 screens), the user enters daily use mode. Three bottom tabs with labels + icons + gold active indicator.

See [navigation-architecture.html](navigation-architecture.html) for full details with mockups.

---

## Tab 1: Me (Individual Milestones)

Default landing tab. Shows all individual milestones across all people.

### Layout:
- **Person filter** at top: row of person buttons (All | Me | Mom | Dad | ...). Tap to filter by one person, tap again to show all.
- **Time-chunked milestone list**: "This week" / "This month" / "Later" sections
- Each milestone shows: person name, milestone value+unit (gold mono), date with ordinal suffixes ("Sep 7th"), year only if different from current year

### No hero card:
All milestones are treated equally. No single person's milestone is emphasized over others. The time-chunked list naturally surfaces the soonest milestones at the top.

### Share flow:
1. Tap a milestone -> gold highlight + sticky share bar appears at bottom
2. Sticky bar shows selected milestone text
3. Tap "Share" button -> native share picker
4. Text also copied to clipboard automatically

### Multiple selection:
Tap additional milestones to add them to the selection. Share bar updates to reflect all selected items.

---

## Tab 2: Together (Combined/Group Milestones)

Shows combined milestones from the milestone engine (`renderCombinedTab`).

### Layout:
- **Group sub-tabs** at top when 2+ groups exist (e.g. "Family | Friends")
- **Group name** with pencil icon -> tap pencil to open full-screen group editor
- Combined milestone content: sum milestones found by `findSumMilestonesForEvents` across seconds/minutes/hours/days/weeks/months/years
- Finds: palindromes, repdigits, Pi, Fibonacci, powers of 2, round numbers, Asian auspicious, sacred numbers

### Share flow:
Same as Me tab: tap combined milestone -> sticky share bar -> Share -> native picker.

---

## Tab 3: Edit (Manage People, Groups, Settings)

### Layout (top to bottom):
1. **Group cards** — each card shows group name + members listed. Tappable to open group editor.
2. **"+ New group"** button
3. **Settings** (below group cards):
   - Appearance (dark/light theme)
   - Notifications
   - Number patterns (toggles)
   - Backup (export/import)
   - Account
   - Legal / Feedback

---

## Group Editor (Full-Screen Overlay)

Opens when tapping a group card on Edit tab, or pencil icon on Together tab.

### Elements:
- **Group name**: editable text field at top
- **Members**: inline editable name + date fields for each member
- **Add member**: name + date input row at bottom of member list
- **Remove member**: x button on each member row
- **Delete group**: destructive action at bottom
- **"Done" button**: saves all changes and returns to the previous tab

---

## Navigation Details

### 3 bottom tabs:
| Tab | Icon | Label | Purpose |
|-----|------|-------|---------|
| Me | Star | Me | Individual milestones for all people, time-chunked |
| Together | People | Together | Combined/group milestones |
| Edit | Pencil | Edit | Manage people, groups, settings |

### Active state:
- Gold icon + gold label for active tab
- Gray icon + gray label for inactive tabs
- Tab bar fixed at bottom, never scrolls away

### Transitions:
- Tab switch: instant crossfade, maintains scroll position
- Group editor: full-screen overlay, slide up, "Done" to dismiss
- Share: sticky bar at bottom, native share picker

---

## Milestone Engine (Daily Use)

- **Powers of 2**: uncapped, up to 2^30
- **Combined milestones**: `findSumMilestonesForEvents` across all time units
- **Patterns found**: palindromes, repdigits, Pi, Fibonacci, powers, round numbers, Asian auspicious, sacred numbers
- **Cosmic milestones**: max 1 globally, show description only (no redundant number)
- **Date formatting**: ordinal suffixes ("Sep 7th"), year only if different from current year

---

## Design Rules

- **Gold (#d4b876)** = things that matter (milestone values, active tab, section labels)
- **Dark theme default**, light available
- **3-level typography**: hero (mono, onboarding only), body (serif), caption
- **No shadows, no gradients**
- **`autocomplete="new-password"`** on all name inputs to suppress password managers
