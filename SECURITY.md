# Security Policy

## Supported Versions
Only the latest release on `main` (`https://zerobon.pages.dev`) is actively supported with security updates.

## Security Architecture
- **Content Security Policy (`public/_headers`)**: Strict CSP limiting `script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, and explicit Open-Meteo `connect-src` allowlists.
- **Runtime Schema Validation**: Untrusted external API responses (`OpenMeteo*Schema`) and client `localStorage` (`SanctuaryProfileSchema`) are strictly validated and bounded with Zod.
- **Edge AI Firewall (`apps/edge-api/index.ts` & `src/engine/copilot-firewall.ts`)**: 5-layer pre-inference sanitization, CSPRNG delimiter isolation (`crypto.randomUUID()`), strict JSON output locking, canary leakage detection, and CWE-209 error masking.

## Reporting a Vulnerability
Please open a private security advisory on GitHub (`https://github.com/z99wE/zerobon/security/advisories`) with reproduction steps and impact details. Do not disclose vulnerabilities publicly prior to remediation.
