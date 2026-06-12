# HappyMoments i18n Style Guide & Glossary — v1 (12 Jun 2026)

Briefing document for the per-language translation pipeline (translator agent → native critic agent).
Covers 19 target locales. Arabic (ar) is DEFERRED to its own RTL release. English (en) is the source.

---

## §0 GLOBAL RULES (apply to every language)

### 0.1 Product & register
HappyMoments celebrates *numeric milestones* of people's lives: birthdays measured in days/weeks/hours/minutes ("10,000 days alive"), "happy numbers" (round numbers, palindromes, repdigits, Fibonacci, powers of 2, scientifically meaningful numbers), and *combined* milestones of groups ("36,000 days together"). Tone: **warm, celebratory, personal, playful** — like a friend pointing out something delightful. Never corporate, never bureaucratic, never sales-y. Light humor welcome; avoid kitsch overload and exclamation-mark inflation (max one per message).

### 0.2 Technical contract
- Translations live in `web/i18n.js` → `TRANSLATIONS.<locale>`. The key set must EXACTLY match `TRANSLATIONS.en` (validator enforces parity).
- **Placeholders are verbatim tokens**: `{name}`, `{names}`, `{count}`, `{noun}`, `{group}`, `{time}`, `{unit}`, `{date}`, `{value}`, `{why}`, `{countdown}`, `{max}`, `{month}`, `{error}`. Never translate, inflect, or drop a placeholder that exists in the EN string; never add one that doesn't. **Word order is yours** — restructure the sentence around the placeholders as the language demands.
- Keys consumed as HTML (`wiz_inspo_*`) may contain tags like `<b>`/`<br>` — preserve the tag structure, translate only the text.
- Digits, dates and number formatting are done by the app (`toLocaleString`) — never hardcode formatted numbers.

### 0.3 Length budgets
- Validator warns at >1.6× the EN length (zh/ja/ko/th exempt). Stay under it.
- **Hard cases**: tab labels (`tab_*`), buttons (`save`, `cancel`, `wiz_*` CTAs), badges (`ed_active_badge`) — keep as short as the language allows; aim ≤14 chars for tab/button labels. The bottom tab bar must fit on a 360 px screen.

### 0.4 Brand & fixed terms
- **HappyMoments** and **happymoments.app** are never translated or transliterated.
- **Premium** stays "Premium" unless the language section says otherwise.
- `historyFacts.js` stays English (out of scope). Currency "€1.49 / €4.99" stays as-is.

### 0.5 Glossary — one consistent target term per concept (no synonym drift)
| EN term | Concept |
|---|---|
| milestone | a special numeric moment to celebrate (NOT a project milestone — pick the warmest natural word) |
| happy number | brand-flavoured term for a special number; translate the *feeling*, keep it light |
| group | a user-created set of people |
| team | the tab showing the group ("Team" tab) — may be rendered as "together"-style word if more natural |
| member | person in a group |
| combined | summed across people ("days combined") |
| share | send to others via share sheet — use the established native verb of each platform culture |
| reminder | notification before a milestone |
| backup / import / export | data operations — use the platform-conventional terms |
| upgrade | move to Premium |
| palindrome, Fibonacci, power of 2 | mathematical terms — use the standard native math term |
| repdigit | digits all the same (e.g. 44,444) — most languages have no term; describe it naturally and consistently |

### 0.6 Anti-calque rule (hard requirement)
Do not transplant English structure or vocabulary where a native expression exists. The critic agent must do an explicit calque sweep (each language section lists known traps). When a borrowed word IS the natural everyday choice (e.g. "app"), keep it — naturalness beats purism. Test: *would a native speaker who has never seen the English source write this?*

### 0.7 Address form
Use the informal/warm address defined in each language section, consistently across ALL keys and share messages. Never mix formal and informal in one locale.

### 0.8 Plural tables
Each locale ships `PLURALS.<locale>` for 11 nouns: day, week, month, year, hour, minute, second, milestone, person, group, member — with the CLDR categories listed in the language section (selected at runtime via `Intl.PluralRules`). Missing categories fall back to `other`. NOTE: the app shows values up to billions of seconds — Romance languages with a CLDR `many` category (es/fr/it/pt) MUST include it, it fires at ≥10⁶.

### 0.9 Share messages (transcreation, not translation)
- New languages get `SHARE_MESSAGES_I18N.<lang>` in `web/shareMessages.js`: **~30–36 messages** across the 12 categories (birthday, round, repdigit, palindrome, fibonacci, power_of_2, scientific, sequential, alternating, combined, ratio, generic) — minimum 2 per category, 4+ for birthday/combined/generic. Plus one `APP_SHARE_LINK_I18N` entry and one `SHARE_DATE_FALLBACK_I18N` entry.
- These are **transcreated**: write what a native speaker would *actually send* to a friend on WhatsApp/LINE/Viber. Adapt metaphors, references, and humor to the culture. Placeholders as in EN: `{name} {value} {unit} {date} {countdown} {why}`.
- Already done (skip, do not modify): pt, hi, zh, ja, es. pt_BR reuses pt at runtime.

### 0.10 Localized example names
Wizard example keys (`wiz_ex_school_*`, `wiz_ex_uni_*`, `wiz_ex_office_*`) and share messages use first names. Use the common native names from the language section — never keep English names.

### 0.11 Number-word keys
`num_million` / `num_billion` are appended after a digit ("850 million" → "850 {num_million}"). The engine divides strictly by 10⁶/10⁹. East/South Asian languages with 10⁴-based or lakh/crore systems: translate with the standard word for million/billion even if a native grouping would differ — the critic notes naturalness issues for a future engine fix, but must not change the arithmetic meaning.

---

## §1 Spanish (es) — *partial: ~50 base keys exist, ~335 missing*
- **Address**: tú, consistently. Neutral Latin-American-compatible Spanish (avoid vosotros in UI strings; "ustedes" contexts don't arise).
- **Plurals**: one / many / other (many fires ≥10⁶ — required!). day: día/días.
- **Traps**: "soportar" ≠ support; "aplicación" → "app" is fine; "compartir" for share; avoid "realizar" officialese — use "hacer"; "billón" = 10¹² in Spanish — `num_billion` must be "mil millones".
- **Names**: Lucía, Mateo, Sofía, Diego.
- **Share messages**: already exist — skip.

## §2 German (de) — *partial: ~280 keys exist, ~239 missing*
- **Address**: du (lowercase), consistently.
- **Plurals**: one / other. day: Tag/Tage.
- **Traps**: "Reminder" → Erinnerung; "Event" → Ereignis or Termin for dates (pick one, stay consistent); "Milestone" → Meilenstein; avoid denglish ("sharen", "downloaden" → teilen, herunterladen); compounds get LONG — watch the 1.6× budget, prefer short words (e.g. "Teilen" not "Weiterleiten").
- **Names**: Anna, Lukas, Mia, Jonas.
- **Share messages**: needed.

## §3 French (fr) — *partial: ~280 keys exist, ~239 missing*
- **Address**: tu, consistently.
- **Plurals**: one / many / other (many required). day: jour/jours.
- **Traps**: "digital" → numérique; "supporter" ≠ support (→ prendre en charge); share → partager; "célébrer" fine but vary with "fêter"; French headline style avoids Title Case; apostrophes typographiques (') welcome; mind non-breaking space before ! and ? (use U+00A0 or omit punctuation).
- **Names**: Léa, Hugo, Chloé, Louis.
- **Share messages**: needed.

## §4 Italian (it)
- **Address**: tu, consistently.
- **Plurals**: one / many / other (many required). day: giorno/giorni.
- **Traps**: "supportare" is accepted IT now but prefer "aiutare/assistere" where natural; share → condividere; "milestone" is used in business IT — for this app prefer "traguardo"; avoid "performare".
- **Names**: Giulia, Marco, Sofia, Luca.
- **Share messages**: needed.

## §5 Portuguese — European (pt)
- **Address**: tu (PT-PT informal), consistently — NOTE: runtime share messages fall back to the Brazilian set (você); that mismatch is accepted for now, flag only.
- **Plurals**: one / many / other (many required). day: dia/dias.
- **Traps**: "partilhar" (PT) vs "compartilhar" (BR) — use partilhar; "ecrã" not "tela"; "telemóvel" not "celular"; avoid BR forms throughout.
- **Names**: Maria, Tiago, Inês, Afonso.
- **Share messages**: exist (Brazilian) — skip.

## §6 Portuguese — Brazilian (pt_BR)
- **Address**: você, consistently.
- **Plurals**: one / many / other. day: dia/dias.
- **Traps**: mirror of §5 — use compartilhar, tela, celular; warm BR diminutives OK sparingly.
- **Names**: Ana, João, Beatriz, Pedro.
- **Share messages**: covered by pt at runtime — skip.

## §7 Croatian (hr)
- **Address**: ti, consistently.
- **Plurals**: one / few / other. day: dan/dana/dana (one: dan, few: dana, other: dana).
- **Traps**: "šerati" → podijeliti; "event" → događaj; "milestone" → prekretnica (or "važan dan" where warmer); avoid anglicisms ("aplikacija" → "apka" is too colloquial; keep "aplikacija").
- **Names**: Ana, Luka, Ivana, Marko.
- **Share messages**: needed.

## §8 Slovenian (sl) — *partial: ~280 keys exist, ~239 missing. Gorazd reviews personally — calibration language.*
- **Address**: ti, consistently.
- **Plurals**: one / two / few / other — FULL dual required. day: dan/dneva/dnevi/dni; year: leto/leti/leta/let; milestone → mejnik: mejnik/mejnika/mejniki/mejnikov.
- **Traps** (from prior SL work): no calques — "emergentno", "šerati", "definitivno" out; share → deliti/deli; "milestone" → mejnik; "event" → dogodek; natural colloquial-but-correct register; sweep with the anti-calque glossary before finishing.
- **Names**: Ana, Luka, Maja, Žan.
- **Share messages**: needed.

## §9 Dutch (nl)
- **Address**: je/jij, consistently.
- **Plurals**: one / other. day: dag/dagen.
- **Traps**: share → delen; "event" → gebeurtenis (dates) but "evenement" only for organized events — here use gebeurtenis or "datum"; Dutch tolerates English loans — keep only the truly natural ones ("app", "backup").
- **Names**: Emma, Daan, Sanne, Bram.
- **Share messages**: needed.

## §10 Polish (pl)
- **Address**: ty (forms, not the pronoun itself — Polish drops pronouns), consistently informal.
- **Plurals**: one / few / many / other. day: dzień/dni/dni/dnia(other=fractional); year: rok/lata/lat; milestone → "kamień milowy" is heavy — prefer "wyjątkowy moment" or "okrągła liczba" framing where natural, but ONE consistent choice for the noun key.
- **Traps**: "szerować" → udostępnić; "event" → wydarzenie; avoid officialese ("dokonać", "realizować") — celebratory casual.
- **Names**: Zosia, Jakub, Ania, Piotr.
- **Share messages**: needed.

## §11 Russian (ru)
- **Address**: ты, consistently.
- **Plurals**: one / few / many / other. day: день/дня/дней; year: год/года/лет.
- **Traps**: "шерить" → поделиться; "ивент" → событие; "майлстоун" → веха is formal — prefer "особая дата"/"круглое число" framing, one consistent noun; avoid bureaucratic Russian — warm conversational register.
- **Names**: Анна, Дмитрий, Ольга, Максим.
- **Share messages**: needed.

## §12 Chinese Simplified (zh)
- **Address**: 你 (not 您) — warm informal.
- **Plurals**: other only (single form per noun). Measure words: the engine concatenates digit + unit; use 天/周/个月/年/小时/分钟/秒 — no 个 before 天/年.
- **Number culture**: native counting is 万/亿-based. `num_million`=百万, `num_billion`=十亿 — accepted compromise; critic flags naturalness issues only. The milestone engine already generates 万-based milestone values separately.
- **Traps**: no spaces around placeholders unless natural; full-width punctuation （，。！）; avoid translationese 被-passives; keep celebratory phrasing short and punchy.
- **Names**: 小明, 丽丽, 王伟, 李娜.
- **Share messages**: exist — skip.

## §13 Hindi (hi)
- **Address**: आप with warm tone (safer than तुम across regions), consistently.
- **Plurals**: one / other. day: दिन/दिन.
- **Number culture**: colloquial uses लाख/करोड़; `num_million`=मिलियन, `num_billion`=अरब — critic flags naturalness only.
- **Traps**: avoid heavy Sanskritized formal Hindi; everyday Hindustani register; English loans common in app UI (शेयर is acceptable for share) — pick the natural Delhi-newspaper register.
- **Names**: प्रिया (Priya), राहुल (Rahul), अंजलि (Anjali).
- **Share messages**: exist — skip.

## §14 Bengali (bn)
- **Address**: তুমি (warm informal), consistently.
- **Plurals**: one / other. day: দিন/দিন.
- **Number culture**: লাখ/কোটি colloquial; `num_million`=মিলিয়ন, `num_billion`=বিলিয়ন — flag only.
- **Traps**: avoid Kolkata-vs-Dhaka loaded vocabulary — neutral standard Bengali; no heavy তৎসম formal register.
- **Names**: রিয়া, রাহুল, মিতা.
- **Share messages**: needed.

## §15 Japanese (ja)
- **Address/register**: warm polite です/ます base for UI; share messages may be casual (友達口調). No keigo beyond ます.
- **Plurals**: other only. Units: 日/週間/か月/年/時間/分/秒.
- **Number culture**: 万/億-based; `num_million`=百万, `num_billion`=10億 — critic flags only.
- **Traps**: avoid katakana flooding — マイルストーン out, use 記念日/節目; no literal exclamation inflation; particles must make placeholder grammar work ({name}さん — use さん with names in share messages).
- **Names**: さくら, ゆうた, はな.
- **Share messages**: exist — skip.

## §16 Vietnamese (vi)
- **Address**: bạn, consistently.
- **Plurals**: other only. day: ngày.
- **Traps**: diacritics must be complete and correct (validator can't check this — critic must); avoid English order calques; warm phrasing uses "nhé/nha" sparingly in share messages, not in UI labels.
- **Names**: Linh, Minh, Hoa.
- **Share messages**: needed.

## §17 Indonesian (id)
- **Address**: kamu (warm informal — this app is personal), consistently; NOT Anda.
- **Plurals**: other only. day: hari.
- **Traps**: avoid stiff formal register (mohon/silakan officialese) — celebratory casual; "share" → bagikan; reduplication plurals not needed with numerals.
- **Names**: Putri, Budi, Sari.
- **Share messages**: needed.

## §18 Thai (th) — *most keys missing (~370)*
- **Address**: คุณ with warm particles in share messages (นะ/เลย) — UI labels without particles.
- **Plurals**: other only. day: วัน.
- **Traps**: no spaces between Thai words (spaces only around placeholders/numbers as Thai convention puts spaces around digits); length exempt from 1.6× but keep labels short; avoid royal/formal vocabulary.
- **Names**: น้ำ, ต้น, ฝน.
- **Share messages**: needed.

## §19 Korean (ko) — *most keys missing (~370)*
- **Address/register**: 해요체 (polite informal) for UI and share messages, consistently. No 합쇼체.
- **Plurals**: other only. Units: 일/주/개월/년/시간/분/초.
- **Number culture**: 만/억-based; `num_million`=백만, `num_billion`=10억 — flag only.
- **Traps**: particle alternation after placeholders (이/가, 은/는, 을/를) — structure sentences so the particle after a placeholder works for any name (use 님/씨 or restructure to avoid post-placeholder particles where possible); avoid konglish where native exists.
- **Names**: 지민, 서연, 민준.
- **Share messages**: needed.

---

## §20 Deliverable contract per language (what each translator agent returns)
1. **Full `TRANSLATIONS.<locale>` block** — every key in `TRANSLATIONS.en`, translated per this guide. Existing partial translations may be kept where good, improved where weak (critic decides).
2. **`PLURALS.<locale>` table** — 11 nouns × the locale's CLDR categories (§0.8).
3. **Share messages** (only languages marked "needed"): `SHARE_MESSAGES_I18N.<lang>` ~30–36 across 12 categories + `APP_SHARE_LINK_I18N` + `SHARE_DATE_FALLBACK_I18N` entries.
4. The **critic agent** (independent, native-linguist persona) adversarially reviews all three: calque sweep, register consistency, placeholder integrity, length budget, plural correctness, share-message naturalness ("would I actually send this?") — and rewrites. Critic's version is final.
5. Automated gates after merge: `node tools/i18n-check.js` (parity + placeholders + length), `tour --lang=<xx>` screenshot run, visual fit review.
