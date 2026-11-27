/**
 * Single source of truth for the indoor-air hacks the copilot is permitted to recommend.
 *
 * Consumed by:
 *  - `src/types/index.ts`  -> strict Zod `CopilotResponseSchema` on the client
 *  - `apps/edge-api/index.ts` -> Layer 5 egress allow-list in the Cloudflare Worker
 *
 * Keeping one canonical list prevents client and edge from drifting apart and
 * ensures an LLM can never surface an unverified hack ID.
 */
export const VERIFIED_HACK_IDS = [
  'corsi_rosenthal_box',
  'kitchen_exhaust_purge',
  'magnetic_draft_stopper',
  'midday_window_airing',
  'n95_active_commute',
  'induction_cook_swap',
] as const;

export type VerifiedHackId = (typeof VERIFIED_HACK_IDS)[number];

/** Type-safe membership check used by the edge egress firewall. */
export function isVerifiedHackId(value: unknown): value is VerifiedHackId {
  return typeof value === 'string' && (VERIFIED_HACK_IDS as readonly string[]).includes(value);
}
