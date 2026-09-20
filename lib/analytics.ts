// ============================================================
// Lightweight product analytics — never sends credentials
// ============================================================

export type AnalyticsEvent =
  | 'pokemon_go_open'
  | 'collection_import'
  | 'collection_export'
  | 'collection_sync'
  | 'companion_import'
  | 'pokedex_filter'
  | 'evolution_goal_open'
  | 'missing_goal_open'
  | 'pokemon_detail_open';

type Props = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    plausible?: (event: string, options?: { props?: Props }) => void;
  }
}

/**
 * Track product events only. Never pass passwords, tokens, or Trainer auth secrets.
 */
export function track(event: AnalyticsEvent, props?: Props): void {
  if (typeof window === 'undefined') return;

  const safe: Props = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      const key = k.toLowerCase();
      if (
        key.includes('password') ||
        key.includes('token') ||
        key.includes('secret') ||
        key.includes('credential') ||
        key.includes('auth')
      ) {
        continue;
      }
      safe[k] = v;
    }
  }

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, safe);
      return;
    }
    if (typeof window.plausible === 'function') {
      window.plausible(event, { props: safe });
      return;
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...safe });
      return;
    }
  } catch {
    // ignore analytics failures
  }

  if (process.env.NODE_ENV === 'development') {
    // Local visibility only — no network
    console.debug('[analytics]', event, safe);
  }
}
