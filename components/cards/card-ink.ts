/**
 * Fixed ink palette for Pokémon card faces.
 * Intentionally independent of app light/dark theme tokens.
 */
export const CARD_INK = {
  primary: 'rgba(255, 255, 255, 0.95)',
  secondary: 'rgba(255, 255, 255, 0.82)',
  body: 'rgba(255, 255, 255, 0.72)',
  muted: 'rgba(255, 255, 255, 0.5)',
  label: 'rgba(255, 255, 255, 0.42)',
  faint: 'rgba(255, 255, 255, 0.32)',
  track: 'rgba(255, 255, 255, 0.12)',
  panel: 'rgba(0, 0, 0, 0.32)',
  panelSoft: 'rgba(0, 0, 0, 0.24)',
  border: 'rgba(255, 255, 255, 0.08)',
} as const;
