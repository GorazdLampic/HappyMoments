# HappyMoments Onboarding Steps — v2.5.0 (versionCode 50)

9-screen progressive reveal. See [onboarding-flow.html](onboarding-flow.html) for full details with mockups.

---

## Screen 1: Your Date
- **Show:** Inspiration examples + "What about you?" + DD/MM/YYYY input
- **User enters:** Birthday (DD/MM/YYYY). Auto-advance triggers when day>=4 and month>=2.
- **Primary button:** `Show me` (or auto-advance)
- **Transition:** Counter animation starts -> Screen 2

## Screen 2: Your Hero Reveal
- **Show:** Counter animation rolling up to big gold number + unit + date + emotional countdown
- **User enters:** Nothing
- **Rules:** No cosmic milestones in hero reveal
- **Primary button:** `See more of my milestones` -> Screen 3

## Screen 3: Your Milestones List
- **Show:** 8 milestones within 730-day window, all tappable to share
- **User enters:** Nothing
- **Share:** Tap any milestone -> gold highlight + floating "Share ->" bubble -> native share picker
- **Primary button:** `Now someone you care about ->` -> Screen 4
- **Back button:** Yes (returns to Screen 2)

## Screen 4: Add ONE Person
- **Show:** "Now someone you care about" + name text input + role hint chips (Partner/Mom/Dad/Sister/Brother) + DD/MM/YYYY input
- **User enters:** Name (or tap role chip to pre-fill) + their birthday
- **Input:** `autocomplete="new-password"` on name field to suppress password managers
- **Primary button:** `Show their milestone` -> Screen 5
- **Back button:** Yes

## Screen 5: Their Hero Reveal + Milestones (merged)
- **Show:** Counter animation for their hero, then milestone list appears AFTER animation finishes. All tappable to share.
- **User enters:** Nothing
- **Share:** Tap any milestone -> gold highlight + floating "Share ->" bubble
- **Primary button:** `See what's special together ->` -> Screen 6
- **Back button:** Yes

## Screen 6: Combined Milestones + Group Name
- **Show:** 6 combined milestones from FULL engine (palindromes, repdigits, Pi, powers of 2) across all time units (seconds/minutes/hours/days/weeks/months/years). Group name input (auto-suggested, e.g. "Family").
- **User enters:** Group name (optional, auto-suggested)
- **Share:** Tap any combined milestone -> gold highlight + floating "Share ->" bubble
- **Primary button:** `Add more people to this group ->` -> Screen 7
- **Back button:** Yes

## Screen 7: Group Builder
- **Show:** Name + date input on one row. Growing member list below (You + person from Screen 4 already listed). "See milestones" button appears after 2+ new members added.
- **User enters:** Additional names + birthdays. Each added person appears in list immediately.
- **Input:** `autocomplete="new-password"` on name fields
- **Primary button:** `See milestones ->` (appears at 2+ members) -> Screen 8
- **Back button:** Yes

## Screen 8: Group Reveal
- **Show:** Group combined milestones + individual milestones for NEW members only (people added in Screen 7, not re-showing Screen 5 milestones). Pencil icon to edit group. All milestones tappable.
- **User enters:** Nothing
- **Share:** Tap any milestone -> gold highlight + floating "Share ->" bubble
- **Edit:** Pencil icon opens group editor
- **Primary button:** `Continue ->` -> Screen 9
- **Back button:** Yes

## Screen 9: Share Screen
- **Show:** Each person's milestone with share preview text. Ready-to-send messages.
- **User enters:** Nothing (optionally taps to share)
- **Primary button:** `Go to my dashboard ->` -> Me tab (daily use)
- **Back button:** Yes

---

## Global Rules

- **Back buttons:** Present on all screens 3-9
- **Resume banner:** If onboarding is interrupted (app closed), resume banner appears on next open
- **Share everywhere:** Tap any milestone on screens 3, 5, 6, 8 -> gold highlight + floating "Share ->" bubble -> native share picker
- **No cosmic milestones** in hero reveal (Screen 2). Max 1 cosmic milestone globally, description only.
- **Date formatting:** Ordinal suffixes ("Sep 7th"), year only if different from current year
- **On completion:** User lands on Me tab with 3 bottom tabs (Me | Together | Edit)
