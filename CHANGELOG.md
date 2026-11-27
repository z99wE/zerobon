# Changelog

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
