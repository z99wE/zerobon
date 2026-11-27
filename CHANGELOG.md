# Changelog

## v4.5.0 (2026-11-27)
- **Accessibility (WCAG 2.1 AA)**: Added shared `useAccessibleModal` focus-trapping, `Escape` dismissal, and focus restoration across all 5 modals; added `aria-valuetext` on sliders and `aria-expanded` on navigation popovers; verified 0 `axe-core` violations across all live-mounted components.
- **Security**: Added strict `Content-Security-Policy` headers, Zod runtime validation on external Open-Meteo APIs and `localStorage` profiles, CSPRNG delimiter isolation, and masked edge API errors.
- **Performance & Efficiency**: Code-split secondary tabs and modals with `React.lazy()` + `Suspense` (54% smaller initial bundle), memoized SVG diurnal curves, and deduplicated live air sync into `useLiveAirSync`.
- **Real-Time Intelligence**: Added global Open-Meteo geocoding and physics-informed dynamic clean-air window calculations.
