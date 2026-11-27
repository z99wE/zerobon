# Contributing to ZeroBon

Thank you for helping improve ZeroBon.

## Development Workflow
1. Fork or clone the repository and install dependencies with `pnpm install --frozen-lockfile`.
2. Run the full verification suite before committing:
   - `pnpm lint` (strict ESLint + React Hooks rules, 0 errors/warnings)
   - `pnpm test -- --run` (Vitest unit, security, and live-mounted `axe-core` WCAG 2.1 AA audits)
   - `pnpm build` (strict TypeScript compilation + Vite production build)
3. Keep all UI components compliant with WCAG 2.1 AA (explicit `aria-label`s, keyboard navigation, and ZeroBon brand palette contrast).
