# QA Report — CruiseLinx (Professional QA Run)
**Engagement:** Smoke · Regression · Performance · Security · Accessibility · Unit · Integration · E2E
**Date:** 2026-08-03 · **Head commit:** `fcce285` (feat(api): add rate limiting to STK Push endpoint)
**Environment:** Node 22 · Next **16.2.12** · React 19 · Convex (`brilliant-iguana-748`) · Playwright + Vitest + axe-core
**Result:** ✅ **Green** — 226 Vitest + 46 Playwright = **272 automated tests passing**, lint clean, tsc clean, production build clean, all public pages WCAG-AA clean.

---

## 1. Executive summary

| Layer | Tool | Result |
|---|---|---|
| Unit | Vitest (jsdom) | ✅ 17 files / **226 passed** (was 219) |
| Integration | Vitest + mocked routes | ✅ STK push incl. new per-IP rate limiting (13 tests) |
| Component | Vitest + testing-library | ✅ |
| Accessibility (component) | axe-core in jsdom | ✅ |
| **Accessibility (full-page, NEW)** | Playwright + axe-core, WCAG 2.0/2.1/2.2 A+AA+best-practice | ✅ **11 pages, 0 violations** (was 11 failing / ~60 serious contrast nodes) |
| E2E Smoke | Playwright | ✅ **33 passed** |
| Performance (NEW) | Playwright navigation-timing budgets | ✅ 2 passed |
| Regression | `npm run build` + `tsc` + `eslint` | ✅ |
| Security | headers/CSP/CORS/CSRF/source-maps/secrets/npm audit | ✅ (4 upstream advisories, no fix yet) |

---

## 2. BLOCKERS FOUND & FIXED

### 🔴 P0 — Production build broken: `Error: Invalid header found`
`next.config.ts` (upgraded to Next 16.2.12 in commit `0773833`) rejected an `headers()` block that declared `methods: ["OPTIONS"]` — an unsupported field in the `headers()` schema that 16.2.12 now validates strictly.
- **Impact:** `npm run build` failed → no deploy, CI `build` job red.
- **Fix:** removed the invalid `methods` block (`next.config.ts`). The remaining `/api/:path*` block still emits CORS on OPTIONS preflight (verified: OPTIONS → 204 with full CORS + CSP headers).

### 🔴 P0 — CI `lint` failing: 3× `react-hooks/set-state-in-effect`
Commit `fcce285` reworked `src/app/vehicles/page.tsx` and removed the `requestAnimationFrame` wrappers, introducing 3 synchronous `setState` calls directly in effect bodies (new React hooks lint rule).
- **Impact:** `npm run lint` = 3 errors → CI `lint` job red.
- **Fix:** restored async scheduling (rAF + cleanup) for the result/`isLoadingMore` effects, and moved the reset-on-filter-change to React's documented *adjust-state-during-render* pattern (guarded by a `previousFilterKey` state). Verified lint + build + tsc clean.

---

## 3. NEW TESTS ADDED

| Test | Layer | What it verifies |
|---|---|---|
| `stkpush` rate-limit same-IP → 429 | Integration | 5 successful, 6th → `429 Too many payment requests` |
| `stkpush` per-IP isolation | Integration | Different IP passes while the same IP stays blocked |
| `/api/mpesa/stkpush` E2E rate limit | E2E | Real server: 6th request from same IP → 429 |
| `useDebounce` (5 cases) | Unit | initial value, delay, timer reset, custom delay |
| `e2e/a11y.spec.ts` (11 scans) | E2E/New | axe on every public page — contrast, headings, landmarks |
| `e2e/perf.spec.ts` (2) | E2E/New | per-route TTFB/transfer budgets + max raw JS chunk budget |

**Total added: 13** (7 unit/integration + 6 E2E).

---

## 4. COMMIT REGRESSIONS (last two commits)

The last commit is **not shippable as-is**. Two P0s (build + lint) are fixed above. Two functional changes in `fcce285` were also validated:

- **STK push rate limiting** — logic correct (checked before auth; per-IP key from `x-forwarded-for`), but it is **in-memory only** → resets on cold start and is per-isolate (same limitation as `authRateLimit` elsewhere). Verified 429 works, retry-after message computed correctly. Recommended follow-up: durable limiter.
- **`convex/auth.ts getUser`** now returns `email/phone` only to self/admin and undefined otherwise — good privacy hardening. `listBookings`/`listVehicles` now set `nextCursor: undefined` when no more pages — good.
- **`useDebounce`** in the vehicles search is well-tested (5 unit cases), debounce works; note the newly dimmed font/latency budget OK.

## 5. ACCESSIBILITY — full-page audit (WCAG 2.x A/AA, axe-core on production build)

Initial full-page scan found **`color-contrast` (serious)** on ~60 nodes across every page, plus `heading-order` and `page-has-heading-one` (spammed by the shared footer), and `landmark-unique`.

| # | Issue | Fix |
|---|---|---|
| 1 | `brand-gold-400 #d4af37` / `brand-gold-500 #bc9328` used as **text on light backgrounds and buttons with white text** → ~2.8–3.3:1 (WCAG needs 4.5:1) | Darkened the gold tokens for AA-safe contrast (measured ≥ 5.0:1 on white/cream) in `globals.css` |
| 2 | Footer/offline/empty-state text at `charcoal/40`–`/60` opacity → ~2.1–2.7:1 | raised to `/70`–`/75` (solid text nodes), incl. placeholder text in shared `Input`/`Textarea` and `transaction-history` |
| 3 | Placeholder text (`placeholder:text-charcoal/40`) failing | bumped to `/70` |
| 4 | `heading-order` — footer brand used `h4` from `h1` (skip), cards used `h3` after `h1` | footer brand → `<p>`; column titles `h2`; about/how-it-works/trust-safety cards `h2` |
| 5 | `page-has-heading-one` on `/vehicles` (skeleton loaded no `h1`) | skeleton now renders the page title `h1` |
| 6 | `landmark-unique` — two `<nav>` without labels | `aria-label="Main navigation"` / `"Mobile navigation"` |

Axe is now green across `/`, `/about`, `/how-it-works`, `/contact`, `/privacy`, `/terms`, `/trust-safety`, `/refunds`, `/vehicles`, `/login`, `/register` (11) — with an animation-settle waiter to prevent false positives from framer-motion entrance fades.

## 6. PERFORMANCE (E2E on production build)

| Route | TTFB | DOMContentLoaded | Load | Transfer | Reqs |
|---|---|---|---|---|---|
| `/` | 46 ms | 343 ms | 3.3 s * | 447 KB | 21 |
| `/about` | 72 ms | 700 ms | 746 ms | 2 KB | 15 |
| `/vehicles` | 82 ms | 200 ms | 258 ms | 9 KB | 16 |
| `/login` | 66 ms | 235 ms | 308 ms | 22 KB | 17 |

\* `/` `loadEvent` 3.3s is service-worker registration + Node/Convex bootstrap on first cold visit (foliage no LCP captured within `load`); content paints well before that.
- **Largest fetched JS:** 222 KB; **largest emitted chunk on disk:** `c36f3faa…js` = **1.8 MB** (shared runtime + mapbox, lazy-loaded only on map surfaces — pre-existing, recommend `import()` chunking of mapbox).
- All perf budgets in `e2e/perf.spec.ts` pass; blocks nothing.

## 7. SECURITY

Verified against the running production build:
- ✅ Security headers on every route incl. `/api/*` and OPTIONS preflight: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `X-XSS-Protection`, CSP (`frame-ancestors 'none'`, `connect-src` allows Convex `wss://`).
- ✅ No `X-Powered-By` (disabled in `next.config.ts`).
- ✅ CSRF: foreign-origin POST → 403; no-origin POST → 403; authenticated-flow cookie+header verified by unit tests.
- ✅ No source maps served (`.map` → 404), no `.env*` files served (404), unknown routes → 404.
- ✅ No hardcoded secrets in git-tracked files; only `.env.example` tracked.
- ✅ `/api/mapbox/token` returns a public `pk.*` token or `null`, never the raw secret.
- ✅ Service worker served correctly (`200 application/javascript`).
- ⚠️ **`npm audit`:** 4 advisories (3 high, 1 moderate) — `postcss` XSS + path traversal and `sharp`/libvips CVEs, all transitive via **`next`**, **no fix currently published** (needs Next ≥ 16.3.0-preview). Track.
- 🟠 P2 — CSP uses `script-src 'unsafe-inline' 'unsafe-eval'` (required while Next runtime inline bootstrap + dev). Fine for production correctness but consider nonce-based CSP when `middleware`→`proxy` migration happens.
- 🟡 P2 (reported previously, unchanged) — OTP still `Math.random()`; `checkEmailExists` still gated by `MPESA_CALLBACK_SECRET`; rate limiter is in-memory (cold-start reset).
- 🟡 P2 — build emits `ⓘ the "middleware" file convention is deprecated. Please use "proxy" instead` (Next 16.2+): the `src/middleware.ts` should be renamed to `proxy.ts` in a follow-up.

## 8. Regression / CI

- `npm run build` ✅ (38 pages, 10–60 s compile)
- `npx tsc --noEmit` ✅ · `npm run lint` ✅ · `npm run test:run` ✅ 226
- E2E: smoke 33 ✅ (incl. OTP + STK push rate limits, route protection, security headers, no unhandled JS errors) + a11y 11 ✅ + perf 2 ✅
- Coverage: **Stmts 88.5% · Branches 81.5% · Funcs 69.1% · Lines 90.2%**

## 9. Commands to reproduce

```bash
npm run test:run             # 226 unit/integration/component/a11y
npx vitest run --coverage    # coverage
npm run build && npm start   # prod server on :3000
npx playwright test          # 46 E2E (smoke + a11y + perf)
npx tsc --noEmit && npm run lint
npm audit                    # dependency advisories (4, no fix yet)
```

## 10. Outstanding recommendations (not blocking)

1. Migrate `middleware.ts` → `proxy.ts` (deprecation warning on Next 16.2.12).
2. Split/liquidate the 1.8 MB `c36f3faa…js` mapbox shared chunk; async-load mapbox.
3. Replace `Math.random()` OTPs with `crypto.randomInt`; de-couple `checkEmailExists` from the M-Pesa secret and hide email-exists responses (anti-enumeration).
4. Durable (Convex-backed) rate limiting for brute-force outer flights.
5. Add `npm audit` failure-gating calibrated to the still-unpatched next deps.
6. Re-run `next update` (16.2.12 → 16.3+) once the `postcss`/`sharp` fixes land — the audit block inherits from `next` itself.

## Source changes made during this run
- **Fix (build):** `next.config.ts` — removed invalid `methods` field.
- **Fix (lint):** `src/app/vehicles/page.tsx` — effect setState → rAF/render-adjust pattern.
- **Accessibility:** `src/app/globals.css` (gold palette AA), `footer.tsx`, `navbar.tsx`, `mobile-nav.tsx` (nav labels), `about/how-it-works/trust-safety` (heading order), `contact.tsx`/`offline.tsx`/`input.tsx`/`textarea.tsx`/`transaction-history.tsx` (opacity `60–40→70–75`).
- **Tests:** `src/app/api/__tests__/stkpush.test.ts` (+2), `src/hooks/__tests__/use-debounce.test.ts` (+5), `e2e/smoke.spec.ts` (+1), `e2e/a11y.spec.ts` (new), `e2e/perf.spec.ts` (new).