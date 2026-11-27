# Changelog

## v4.6.3 (2026-11-28)
- **Testing**: Added coverage-gap suites for tenant rules, telemetry fallbacks, profile validation, optical thresholds, feature-flag-off behavior, and focus edge cases (suite: 171 tests across 24 files). Coverage is ~95% statements and ~87% branches.
- **Verification**: Lighthouse on the deployed site reports Accessibility, Best Practices, and SEO at 100.


## v4.6.2 (2026-11-28)
- **Security**: Replaced predictable `Math.random()` prompt delimiters with shared `crypto.randomUUID()`-based delimiters in both the client firewall and edge worker; added a regression test for delimiter uniqueness and shape.
- **Efficiency**: Deduplicated concurrent `fetchLiveAirQuality` calls for the same city and removed the unused `three` dependency, its unreferenced builder module, and its build config entry.
- **Code Quality**: Extracted the routine flip card from `DailyRoutineOptimizer` into a focused module (component reduced from 434 to 222 lines).
- **Testing**: Added request-dedup, cache-reuse, and edge HTML-stripping tests; suite remains at 155 tests across 22 files.


## v4.6.1 (2026-11-28)
- **Code Quality**: Layered `InversionRadar` into geometry/telemetry/strategy modules and `IndoorAirHacks` into flip-card and blueprint-dialog modules; both parent components roughly halved in size with no visual regression.
- **Testing**: Added targeted branch tests for physics edges, optical turbulence, base64 guards, edge API routes, modal keyboard traps, and the live-air sync hook (suite: 155 tests across 22 files). Branch coverage rose from ~71% to ~83%.
- **Browser Verification**: The browser check now clicks through every tab before capturing screenshots.


## v4.6.0 (2026-11-28)
- **Code Quality**: Split `GhostFibers` into a settings/JSX component, a dedicated WebGL renderer hook, shader module, and explicit settings types; removed the unused duplicate Rust WASM physics crate so the TypeScript engine is the only implementation.
- **Security**: Removed the invalid `X-Frame-Options` `<meta>` tag from `index.html` that both Chromium and WebKit rejected; the restriction is enforced by the real HTTP header in `public/_headers`.
- **Testing**: Added V8 coverage reporting (`pnpm test:coverage`) with text, JSON summary, and HTML output.
- **Browser Verification**: Added `pnpm check:browsers`, driving Chromium and WebKit at desktop and mobile widths with console/page-error, overflow, heading, language, and canvas checks plus screenshots.
- **Dependencies**: Added `@vitest/coverage-v8` and `@playwright/test` as dev dependencies.


## v4.5.1 (2026-11-27)
- **Code Quality**: Extended strict TypeScript checking to the Cloudflare Worker (`tsconfig.json` now includes `apps/`); added `pnpm typecheck` and a single `pnpm verify` gate used by CI.
- **Security**: Centralized `VERIFIED_HACK_IDS` in a shared module and added a Layer-5 egress allow-list that strips unverified Gemini `iaq_hack_ids` before they reach the client.
- **Code Quality**: Split the GhostFibers WebGL shaders and matrix helpers into a dedicated module, reducing the component from 1,140 to 617 lines without behaviour changes.
- **Security**: Unified client and edge input security in `copilot-security.ts` (sanitisation, override detection, canary and base64-smuggling checks); added an egress allow-list that strips unverified Gemini `iaq_hack_ids`; the edge now applies the full override pattern set instead of a single regex.
- **Accessibility**: Dialogs now move keyboard focus inside on open (in addition to trapping and restoring it); the city picker dialog declares `aria-modal="true"`.
- **Efficiency**: Vitest now uses the `vmThreads` pool, removing the repeated jsdom-environment warning.
- **Testing**: Added boundary/invariant, shared-security, cross-layer consistency, and modal-focus suites (suite: 92 → 130 tests across 20 files).
- **Documentation**: Added an Engineering Rigor section to the README documenting the verification gate and quality controls.

## v4.5.0 (2026-11-27)
- **Accessibility (WCAG 2.1 AA)**: Added shared `useAccessibleModal` focus-trapping, `Escape` dismissal, and focus restoration across all 5 modals; added `aria-valuetext` on sliders and `aria-expanded` on navigation popovers; verified 0 `axe-core` violations across all live-mounted components.
- **Security**: Added strict `Content-Security-Policy` headers, Zod runtime validation on external Open-Meteo APIs and `localStorage` profiles, CSPRNG delimiter isolation, and masked edge API errors.
- **Performance & Efficiency**: Code-split secondary tabs and modals with `React.lazy()` + `Suspense` (54% smaller initial bundle), memoized SVG diurnal curves, and deduplicated live air sync into `useLiveAirSync`.
- **Real-Time Intelligence**: Added global Open-Meteo geocoding and physics-informed dynamic clean-air window calculations.
