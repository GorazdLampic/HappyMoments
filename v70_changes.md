# v70 Changes — Screen 8 (Team Milestones) Redesign

## Files modified
- `web/app.js`
- `web/index.html`
- `web/i18n.js`
- `web/sw.js`

---

## 1. Number aesthetic scoring (app.js, ~line 2632)

**Old:** Round thousands got +50 regardless of digit count. Repdigits +40, palindromes +30.

**New scoring:**
- Repdigits (e.g. 888,888): **+80** (was +40)
- Palindromes (non-repdigit): **+60** (was +30)
- Round thousands: **+40 only if ≤6 digits** (was +50 always)
- **New penalty:** Numbers with >6 digits AND >50% zeros get **-40** (kills ugly numbers like 3,190,000,000)
- Proximity bonus unchanged

## 2. Primary CTA (app.js ~line 2693, index.html ~line 240)

**Old:** `"Continue →"`
**New:** `"Share with your group →"`

## 3. Secondary CTA (index.html ~line 241)

**Old:** `<button class="wizard-btn">Create another group</button>` — hidden after 2nd group
**New:** `<button class="wizard-btn-secondary">Add another circle of people →</button>` — always visible

## 4. Dashboard escape (index.html ~line 242)

**Old:** Full button `"Go to my dashboard →"` — conditionally shown
**New:** Plain text link, always visible, demoted:
```html
<a href="#" style="color:var(--text-muted);font-size:0.82rem;">Go to my dashboard</a>
```

## 5. Footer hidden during onboarding (app.js)

- `_wizardEnsureClean()`: adds `footer.style.display = 'none'`
- `wizardFinish()`: restores `footer.style.display = ''`

## 6. Footer simplified (index.html ~line 545, i18n.js all locales)

**Old:** `Terms & Privacy · HappyMoments © 2026 Quantum Wave Ltd`
**New:** `HappyMoments © 2026` (no Terms link, no Quantum Wave)

## 7. Terms & Privacy moved to Settings (index.html ~line 513)

Added before the hidden compat elements in `settingsTab`:
```html
<div style="text-align:center;padding:16px 0 8px;">
    <a href="legal.html" target="_blank" data-i18n="terms_privacy">Terms & Privacy</a>
</div>
```

## 8. Cache version (sw.js)

`happymoments-v69` → `happymoments-v70`

---

## Expected Screen 8 result

```
←
Some milestones belong to all of you — a reason to gather and celebrate.

888,888
hours combined
Thursday, August 20th
in 73 days

888,888 hours    Aug 20th
37,000 days      Aug 9th
[3rd best aesthetic number]

[Share with your group →]        ← primary button
[Add another circle of people →] ← secondary button
Go to my dashboard               ← plain text link

(no footer during onboarding)
```
