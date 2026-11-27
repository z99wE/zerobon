/**
 * Canonical input-security primitives for the ZeroBon copilot.
 *
 * Both the in-browser firewall (src/engine/copilot-firewall.ts) and the
 * Cloudflare edge worker (apps/edge-api/index.ts) use these functions so an
 * attack can never be blocked in one layer while passing through the other.
 */

export const MAX_COPILOT_QUERY_LENGTH = 400;

export const CANARY_SECRET_TOKEN = ['CANARY', 'ZEROBON', 'SEC', '99F3B'].join('_');

const OVERRIDE_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /reveal\s+(the\s+)?(system\s+prompt|canary|secret|developer\s+mode)/i,
  /you\s+are\s+now\s+(in\s+developer\s+mode|dan|unfiltered|jailbroken)/i,
  /disregard\s+(the\s+)?(safety|rules|guidelines)/i,
  /output\s+(the\s+)?(hidden|secret|prompt|internal\s+instructions)/i,
  /act\s+as\s+an\s+unrestricted\s+ai/i,
] as const;

export interface SanitizedQuery {
  sanitized: string;
  lengthWithinLimit: boolean;
  strippedUnicode: boolean;
  strippedMarkup: boolean;
}

/** Removes zero-width characters, markup and control characters from untrusted input. */
export function sanitizeCopilotQuery(raw: string): SanitizedQuery {
  const withoutUnicode = raw.replace(/[\u200B-\u200D\uFEFF]/g, '');
  const withoutMarkup = withoutUnicode.replace(/<[^>]*>/g, '');
  const sanitized = withoutMarkup
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0);
      return (code >= 32 && code !== 127) || code === 9 || code === 10 || code === 13;
    })
    .join('')
    .trim();

  return {
    sanitized,
    lengthWithinLimit: raw.length <= MAX_COPILOT_QUERY_LENGTH,
    strippedUnicode: withoutUnicode !== raw,
    strippedMarkup: withoutMarkup !== withoutUnicode,
  };
}

/** Detects known jailbreak / prompt-override signatures. */
export function detectInstructionOverride(text: string): boolean {
  return OVERRIDE_PATTERNS.some((pattern) => pattern.test(text));
}

/** Detects a raw base64 blob, while avoiding false positives on ordinary text. */
export function looksLikeBase64Smuggle(text: string): boolean {
  if (/\s/.test(text)) return false;
  if (text.length < 40) return false;
  if (!/^[A-Za-z0-9+/=]+$/.test(text)) return false;
  if (text.length % 4 !== 0 && !text.includes('=')) return false;
  return /(?:[A-Za-z0-9+/]{4}){10,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text);
}

/** Detects attempts to extract the egress canary token. */
export function mentionsCanary(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('canary') || lower.includes('zerobon_sec');
}

/**
 * Creates cryptographically random XML delimiters for untrusted model input.
 * A predictable tag can be guessed and closed by an injected payload, so both
 * the client firewall and the edge worker use CSPRNG-generated tags.
 */
export function createCopilotDelimiters(): { startTag: string; endTag: string } {
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  return {
    startTag: `<untrusted_query_${id}>`,
    endTag: `</untrusted_query_${id}>`,
  };
}
