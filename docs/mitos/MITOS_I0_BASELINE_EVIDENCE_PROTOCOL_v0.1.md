# Mitos Public Experience — I0 Baseline Evidence Protocol v0.1

**Status:** READY FOR EXECUTION / DOCUMENTATION ONLY  
**Date:** 2026-08-19  
**Branch:** `feature/mitos-public-experience-v1`

---

## 0. Objective

I0 creates the pre-change evidence baseline for the existing Rent A Car frontend before any Mitos runtime modification.

The goal is not to improve anything.

The goal is to answer:

> What worked, what failed, and what was already visually/technically imperfect before the Mitos rebrand touched runtime?

This prevents later regressions from being confused with pre-existing behavior.

---

## 1. Evidence identity

Capture at the start of I0:

```text
repository
branch
HEAD SHA
base branch
base SHA if known
PR number/state
execution date/time
Node version
npm/pnpm/yarn version used by repository
OS/environment used for verification
```

No runtime source file should be changed during this capture.

---

## 2. Installation/start evidence

Determine and record the real commands used by the frontend.

Evidence fields:

```text
install command
success/failure
warnings
startup command
local URL
startup errors/warnings
```

Do not normalize or hide pre-existing warnings.

---

## 3. Static quality baseline

Run the repository-supported checks that already exist.

At minimum, when available:

```text
lint
typecheck
production build
tests relevant to frontend/search
```

For each command record:

```text
command
exit state
summary
pre-existing errors
pre-existing warnings
```

If a command does not exist, record `NOT AVAILABLE`; do not invent a new gate solely for I0.

---

## 4. Route registration baseline

Confirm the frontend currently registers at least:

```text
/
/search
/checkout
/checkout-session/:sessionId
/booking
/bookings
/sign-in
/sign-up
/settings
/notifications
/locations
/about
/contact
/faq
/privacy
/tos
/cookie-policy
```

Evidence should distinguish:

```text
REGISTERED
RUNTIME VERIFIED
REQUIRES AUTH / DATA
NOT TESTABLE IN CURRENT ENVIRONMENT
```

Route registration alone does not prove business behavior.

---

## 5. Home baseline

Capture `/` before rebrand.

Required observations:

```text
header identity
hero/video
current generic copy
SearchForm position
Why/service blocks
supplier/destination behavior if present
Mini/Midi/Maxi/demo price presence
map / Gallo marker presence
FAQ/footer
responsive behavior
```

Screenshots:

```text
desktop /
mobile / if practical
```

The purpose is evidence, not approval.

---

## 6. Search continuity baseline

This is the most important I0 behavior gate.

Use the existing Home `SearchForm` and record:

```text
pickup input behavior
drop-off input behavior
same-location behavior
from date/time
to date/time
submit behavior
resulting navigation
resulting query/state/payload shape when observable
```

Do not modify SearchForm to make this test easier.

### Minimum evidence

```text
Home SearchForm renders
valid input can reach /search
/search receives enough state to attempt/display results
```

If live locations/data are unavailable, document the environmental blocker and preserve structural evidence.

---

## 7. Search results baseline

Capture `/search` behavior sufficiently to compare after rebrand.

Observe:

```text
header identity
search summary/form presence
vehicle results or empty/error state
filters
currency/language presentation
navigation to next transactional step if testable
responsive layout
```

Screenshot required when route is renderable.

---

## 8. Transactional route smoke baseline

Do not create destructive/live transactions merely to satisfy I0.

Where safely possible, confirm shell/route continuity for:

```text
/checkout
/checkout-session/:sessionId
/booking
/bookings
```

Classify each as:

```text
SMOKE VERIFIED
AUTH REQUIRED
BOOKING CONTEXT REQUIRED
PAYMENT CONTEXT REQUIRED
NOT EXECUTED — SAFETY/ENVIRONMENT
```

I0 needs a comparison baseline, not a fabricated booking.

---

## 9. Identity/default baseline

Record current public defaults relevant to rebrand:

```text
WEBSITE_NAME fallback
DEFAULT_LANGUAGE
BASE_CURRENCY
payment gateway configuration behavior
contact email behavior
social/footer links
logo/brand treatment
```

This is needed to prove I1 changed presentation intentionally without silently changing business rules.

---

## 10. Evidence artifact format

When I0 is executed, create a dated evidence artifact such as:

```text
docs/mitos/evidence/
└── YYYY-MM-DD_MITOS_I0_BASELINE_EVIDENCE.md
```

Recommended sections:

```text
1. Environment
2. Git state
3. Commands/results
4. Route matrix
5. Home screenshots/observations
6. Search continuity
7. Transactional smoke matrix
8. Known pre-existing defects
9. I0 verdict
```

Screenshots or external evidence should be referenced by path/URL when persisted.

---

## 11. I0 pass criteria

I0 passes when we know enough to compare future behavior safely.

```text
Git baseline captured                 REQUIRED
frontend startup state recorded       REQUIRED
lint/build/test availability recorded REQUIRED
/ baseline captured                   REQUIRED
/search continuity characterized      REQUIRED
transactional routes classified       REQUIRED
pre-existing defects listed           REQUIRED
```

I0 does **not** require every existing feature to be healthy.

It requires the current state to be known.

---

## 12. I0 failure conditions

I0 is incomplete if:

```text
we cannot identify the branch/SHA tested
we change source before capturing baseline
we omit existing errors to make baseline look green
we cannot distinguish route registration from runtime verification
we cannot explain whether SearchForm → /search currently works
```

---

## 13. Output gate

```text
I0 PROTOCOL                      ✅ DOCUMENTED
I0 EXECUTION                     ⛔ NOT RUN YET
I0 EVIDENCE ARTIFACT             ⛔ NOT CREATED YET
I1 RUNTIME BRAND FOUNDATION      🔒 until I0 verdict
```
