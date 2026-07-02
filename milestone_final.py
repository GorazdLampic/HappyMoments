from datetime import datetime, timedelta
from collections import defaultdict
import math

# Birth dates (midnight)
gorazd_born = datetime(1978, 6, 2, 0, 0, 0)
nastja_born = datetime(1990, 3, 13, 0, 0, 0)

# Reference date
ref = datetime(2026, 6, 8, 0, 0, 0)
end = ref + timedelta(days=730)

def combined_seconds(dt):
    return (dt - gorazd_born).total_seconds() + (dt - nastja_born).total_seconds()

cs = combined_seconds(ref)
cm = cs / 60
ch = cs / 3600
cd = cs / 86400
cw = cs / (86400 * 7)

cs_end = combined_seconds(end)
cm_end = cs_end / 60
ch_end = cs_end / 3600
cd_end = cs_end / 86400
cw_end = cs_end / (86400 * 7)

g_days = (ref - gorazd_born).days
n_days = (ref - nastja_born).days

print("=" * 80)
print("COMBINED AGES AS OF JUNE 8, 2026 (midnight)")
print("=" * 80)
print(f"  Gorazd (born 1978-06-02):  {g_days/365.25:.3f} years  ({g_days:,} days)")
print(f"  Nastja (born 1990-03-13):  {n_days/365.25:.3f} years  ({n_days:,} days)")
print(f"  Combined:                  {(g_days+n_days)/365.25:.3f} years")
print()
print(f"  Combined seconds:  {cs:>20,.0f}")
print(f"  Combined minutes:  {cm:>20,.0f}")
print(f"  Combined hours:    {ch:>20,.0f}")
print(f"  Combined days:     {cd:>20,.0f}")
print(f"  Combined weeks:    {cw:>20,.2f}")
print()

# ============================================================
milestones = []

def add(val, unit, category, desc):
    ranges = {
        "seconds": (cs, cs_end, 2),
        "minutes": (cm, cm_end, 2/60),
        "hours":   (ch, ch_end, 2/3600),
        "days":    (cd, cd_end, 2/86400),
        "weeks":   (cw, cw_end, 2/(86400*7)),
    }
    lo, hi, rate = ranges[unit]
    if lo < val < hi:
        real_secs = (val - lo) / rate
        dt = ref + timedelta(seconds=real_secs)
        milestones.append((dt, val, unit, category, desc))

# --- REPDIGITS ---
for digit in range(1, 10):
    for length in range(3, 12):
        val = int(str(digit) * length)
        for unit in ["seconds", "minutes", "hours", "days", "weeks"]:
            add(val, unit, "repdigit", f"All {digit}'s, {length} digits")

# --- PALINDROMES ---
def gen_palindromes(lo, hi):
    results = []
    for ndigits in range(4, 11):
        half = (ndigits + 1) // 2
        for i in range(10**(half-1), 10**half):
            s = str(i)
            pal = s + s[::-1] if ndigits % 2 == 0 else s + s[-2::-1]
            val = int(pal)
            if lo < val < hi:
                results.append(val)
    return results

for unit, lo, hi in [("seconds", cs, cs_end), ("minutes", cm, cm_end),
                      ("hours", ch, ch_end), ("days", cd, cd_end),
                      ("weeks", cw, cw_end)]:
    for val in gen_palindromes(lo, hi):
        add(val, unit, "palindrome", f"{val:,}")

# --- ROUND NUMBERS ---
for exp in range(3, 11):
    for mult in range(1, 10):
        val = mult * 10**exp
        for unit in ["seconds", "minutes", "hours", "days", "weeks"]:
            if mult == 1:
                add(val, unit, "round", f"10^{exp}")
            else:
                add(val, unit, "round", f"{mult} x 10^{exp}")

# --- POWERS OF 2 ---
for p in range(10, 35):
    val = 2**p
    for unit in ["seconds", "minutes", "hours", "days", "weeks"]:
        add(val, unit, "power2", f"2^{p}")

# --- PI DIGITS ---
for val in [314, 3141, 31415, 314159, 3141592, 31415926, 314159265, 3141592653]:
    for unit in ["seconds", "minutes", "hours", "days", "weeks"]:
        add(val, unit, "pi", f"First {len(str(val))} digits of pi")

# ============================================================
# SCORING
# ============================================================
def score(m):
    dt, val, unit, cat, desc = m
    sval = str(val)
    n = len(sval)

    if cat == "repdigit":
        return n ** 3  # 8 digits = 512

    elif cat == "palindrome":
        base = n ** 2
        # Bonus for "pretty" inner patterns
        unique_digits = len(set(sval))
        if unique_digits <= 2:
            base *= 2.5
        elif unique_digits <= 3:
            base *= 1.8
        elif unique_digits <= 4:
            base *= 1.3
        return base

    elif cat == "round":
        zeros = n - len(sval.rstrip('0'))
        base = zeros ** 3 * 2
        if sval[0] == '1' and all(c == '0' for c in sval[1:]):
            base *= 3  # pure 10^n
        return base

    elif cat == "power2":
        p = round(math.log2(val))
        return 30 + p * 2

    elif cat == "pi":
        return n ** 3 * 2

    return 0

scored_all = [(score(m), m) for m in milestones]
scored_all.sort(key=lambda x: -x[0])

# Select top 15 with diversity: max 3 per (unit,cat), max 5 per unit
selected = []
uc = defaultdict(int)
u = defaultdict(int)

for sc, m in scored_all:
    dt, val, unit, cat, desc = m
    if uc[(unit, cat)] < 3 and u[unit] < 5:
        # Avoid near-duplicates (same value appears as repdigit AND palindrome)
        dupe = False
        for _, prev in selected:
            if prev[1] == val and prev[2] == unit:
                dupe = True
                break
        if not dupe:
            selected.append((sc, m))
            uc[(unit, cat)] += 1
            u[unit] += 1
    if len(selected) >= 15:
        break

selected.sort(key=lambda x: x[1][0])  # sort by date

print("=" * 120)
print("TOP 15 MOST INTERESTING UPCOMING COMBINED-AGE MILESTONES")
print("Gorazd (b. 1978-06-02) + Nastja (b. 1990-03-13)")
print("Window: June 8, 2026 to June 8, 2028")
print("=" * 120)
print()
print(f"{'#':>3}  {'Approx. date':<20}  {'Combined value':>22}  {'Unit':<10}  {'Why it is interesting'}")
print("-" * 120)

for i, (sc, (dt, val, unit, cat, desc)) in enumerate(selected, 1):
    date_str = dt.strftime("%a %Y-%m-%d ~%H:%M")
    val_str = f"{val:,}"

    if cat == "repdigit":
        why = f"Repdigit: {desc}"
    elif cat == "palindrome":
        why = f"Palindrome: reads same forwards & backwards"
    elif cat == "round":
        why = f"Round number: {desc}"
    elif cat == "power2":
        why = f"Power of two: {desc}"
    elif cat == "pi":
        why = f"Pi sequence: {desc}"
    else:
        why = desc

    print(f"{i:>3}  {date_str:<20}  {val_str:>22}  {unit:<10}  {why}")

print()
print("Notes:")
print("  - Dates assume both birthdays at midnight; actual times shift by ~hours")
print("  - Combined value = sum of both persons' ages in that unit at that moment")
print("  - Rate of increase: 2 units per real unit (since there are 2 people)")
