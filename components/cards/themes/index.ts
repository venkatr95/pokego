// ============================================================
// Card Theme Definitions
// ============================================================

export type CardThemeId =
  | 'classic-tcg'
  | 'neo-genesis'
  | 'ex'
  | 'gx'
  | 'v'
  | 'vmax'
  | 'vstar'
  | 'full-art'
  | 'rainbow-rare'
  | 'gold-secret'
  | 'ancient-future'
  | 'minimal-modern'
  | 'anime-style'
  | 'pixel-art'
  | 'retro-gameboy';

export interface CardTheme {
  id: CardThemeId;
  name: string;
  label: string;
  emoji: string;
  /** CSS class suffix applied to card wrapper */
  wrapperClass: string;
  /** Border radius override */
  borderRadius: string;
  /** Border width */
  borderWidth: string;
  /** Font style override */
  fontStyle: 'normal' | 'mono' | 'pixel';
  /** Show background pattern */
  backgroundPattern: BackgroundPattern;
  /** Holographic intensity 0-1 */
  holoIntensity: number;
  /** Show energy symbols (GX/V/VMAX style) */
  showEnergyBar: boolean;
  /** Show generation stamp */
  showGenStamp: boolean;
  /** Artwork scale */
  artworkScale: number;
  /** Card aspect ratio (default 380/580) */
  widthRatio: number;
  heightRatio: number;
  /** Special CSS filter on artwork */
  artworkFilter: string;
  /** Background overlay type */
  overlayStyle: 'none' | 'radial' | 'full-art' | 'pixelated' | 'film-grain' | 'scanline';
  /** Badge shape */
  badgeShape: 'pill' | 'square' | 'hexagon' | 'diamond';
  /** Stat bar style */
  statBarStyle: 'standard' | 'segmented' | 'dots' | 'hidden';
  /** Preview gradient for the selector */
  previewGradient: string;
  /** Text glow on card */
  textGlow: boolean;
}

export type BackgroundPattern =
  | 'none'
  | 'dots'
  | 'lines'
  | 'diamonds'
  | 'energy'
  | 'circuit'
  | 'stars'
  | 'japanese-lines'
  | 'hex-grid'
  | 'noise'
  | 'scanlines'
  | 'pixel-grid';

export const CARD_THEMES: Record<CardThemeId, CardTheme> = {
  'classic-tcg': {
    id: 'classic-tcg',
    name: 'Classic TCG',
    label: 'Classic',
    emoji: '🃏',
    wrapperClass: 'theme-classic',
    borderRadius: '16px',
    borderWidth: '2px',
    fontStyle: 'normal',
    backgroundPattern: 'dots',
    holoIntensity: 0.3,
    showEnergyBar: false,
    showGenStamp: true,
    artworkScale: 1,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'none',
    overlayStyle: 'radial',
    badgeShape: 'pill',
    statBarStyle: 'standard',
    previewGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textGlow: false,
  },
  'neo-genesis': {
    id: 'neo-genesis',
    name: 'Neo Genesis',
    label: 'Neo',
    emoji: '🌸',
    wrapperClass: 'theme-neo',
    borderRadius: '12px',
    borderWidth: '3px',
    fontStyle: 'normal',
    backgroundPattern: 'japanese-lines',
    holoIntensity: 0.5,
    showEnergyBar: false,
    showGenStamp: true,
    artworkScale: 1.05,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'sepia(0.2) saturate(1.2)',
    overlayStyle: 'radial',
    badgeShape: 'pill',
    statBarStyle: 'standard',
    previewGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textGlow: false,
  },
  'ex': {
    id: 'ex',
    name: 'EX Series',
    label: 'EX',
    emoji: '⭐',
    wrapperClass: 'theme-ex',
    borderRadius: '18px',
    borderWidth: '2px',
    fontStyle: 'normal',
    backgroundPattern: 'energy',
    holoIntensity: 0.6,
    showEnergyBar: true,
    showGenStamp: true,
    artworkScale: 1.1,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'saturate(1.3) contrast(1.05)',
    overlayStyle: 'full-art',
    badgeShape: 'pill',
    statBarStyle: 'standard',
    previewGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    textGlow: true,
  },
  'gx': {
    id: 'gx',
    name: 'GX Style',
    label: 'GX',
    emoji: '💥',
    wrapperClass: 'theme-gx',
    borderRadius: '20px',
    borderWidth: '2.5px',
    fontStyle: 'normal',
    backgroundPattern: 'circuit',
    holoIntensity: 0.75,
    showEnergyBar: true,
    showGenStamp: false,
    artworkScale: 1.15,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'saturate(1.4) brightness(1.05)',
    overlayStyle: 'radial',
    badgeShape: 'hexagon',
    statBarStyle: 'segmented',
    previewGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    textGlow: true,
  },
  'v': {
    id: 'v',
    name: 'V Card',
    label: 'V',
    emoji: '🔷',
    wrapperClass: 'theme-v',
    borderRadius: '20px',
    borderWidth: '2px',
    fontStyle: 'normal',
    backgroundPattern: 'lines',
    holoIntensity: 0.7,
    showEnergyBar: true,
    showGenStamp: false,
    artworkScale: 1.2,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'saturate(1.5) contrast(1.1)',
    overlayStyle: 'radial',
    badgeShape: 'diamond',
    statBarStyle: 'segmented',
    previewGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    textGlow: true,
  },
  'vmax': {
    id: 'vmax',
    name: 'VMAX',
    label: 'VMAX',
    emoji: '⚡',
    wrapperClass: 'theme-vmax',
    borderRadius: '22px',
    borderWidth: '3px',
    fontStyle: 'normal',
    backgroundPattern: 'hex-grid',
    holoIntensity: 0.9,
    showEnergyBar: true,
    showGenStamp: false,
    artworkScale: 1.3,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'saturate(1.6) brightness(1.1) contrast(1.1)',
    overlayStyle: 'full-art',
    badgeShape: 'diamond',
    statBarStyle: 'segmented',
    previewGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
    textGlow: true,
  },
  'vstar': {
    id: 'vstar',
    name: 'VSTAR',
    label: 'VSTAR',
    emoji: '🌟',
    wrapperClass: 'theme-vstar',
    borderRadius: '22px',
    borderWidth: '3px',
    fontStyle: 'normal',
    backgroundPattern: 'stars',
    holoIntensity: 1,
    showEnergyBar: true,
    showGenStamp: false,
    artworkScale: 1.25,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'saturate(1.7) brightness(1.15)',
    overlayStyle: 'full-art',
    badgeShape: 'diamond',
    statBarStyle: 'dots',
    previewGradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 50%, #667eea 100%)',
    textGlow: true,
  },
  'full-art': {
    id: 'full-art',
    name: 'Full Art',
    label: 'Full Art',
    emoji: '🖼️',
    wrapperClass: 'theme-full-art',
    borderRadius: '20px',
    borderWidth: '1.5px',
    fontStyle: 'normal',
    backgroundPattern: 'none',
    holoIntensity: 0.8,
    showEnergyBar: false,
    showGenStamp: false,
    artworkScale: 1.5,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'saturate(1.4)',
    overlayStyle: 'full-art',
    badgeShape: 'pill',
    statBarStyle: 'hidden',
    previewGradient: 'linear-gradient(135deg, #30cfd0 0%, #667eea 100%)',
    textGlow: true,
  },
  'rainbow-rare': {
    id: 'rainbow-rare',
    name: 'Rainbow Rare',
    label: 'Rainbow',
    emoji: '🌈',
    wrapperClass: 'theme-rainbow',
    borderRadius: '20px',
    borderWidth: '2px',
    fontStyle: 'normal',
    backgroundPattern: 'lines',
    holoIntensity: 1,
    showEnergyBar: false,
    showGenStamp: false,
    artworkScale: 1.2,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'saturate(1.8) hue-rotate(0deg)',
    overlayStyle: 'radial',
    badgeShape: 'pill',
    statBarStyle: 'standard',
    previewGradient: 'linear-gradient(135deg, #ff0080, #ff8c00, #ffd700, #00ff80, #00cfff, #8000ff)',
    textGlow: true,
  },
  'gold-secret': {
    id: 'gold-secret',
    name: 'Gold Secret Rare',
    label: 'Gold',
    emoji: '🥇',
    wrapperClass: 'theme-gold',
    borderRadius: '18px',
    borderWidth: '2px',
    fontStyle: 'normal',
    backgroundPattern: 'diamonds',
    holoIntensity: 0.6,
    showEnergyBar: false,
    showGenStamp: true,
    artworkScale: 1.1,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'sepia(0.4) saturate(1.5) brightness(1.05)',
    overlayStyle: 'radial',
    badgeShape: 'square',
    statBarStyle: 'standard',
    previewGradient: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%)',
    textGlow: false,
  },
  'ancient-future': {
    id: 'ancient-future',
    name: 'Ancient / Future',
    label: 'Ancient',
    emoji: '🏛️',
    wrapperClass: 'theme-ancient',
    borderRadius: '8px',
    borderWidth: '2px',
    fontStyle: 'mono',
    backgroundPattern: 'circuit',
    holoIntensity: 0.5,
    showEnergyBar: true,
    showGenStamp: false,
    artworkScale: 1.1,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'sepia(0.3) hue-rotate(180deg) saturate(1.2)',
    overlayStyle: 'radial',
    badgeShape: 'square',
    statBarStyle: 'segmented',
    previewGradient: 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #533483 100%)',
    textGlow: true,
  },
  'minimal-modern': {
    id: 'minimal-modern',
    name: 'Minimal Modern',
    label: 'Minimal',
    emoji: '◻️',
    wrapperClass: 'theme-minimal',
    borderRadius: '24px',
    borderWidth: '1px',
    fontStyle: 'normal',
    backgroundPattern: 'none',
    holoIntensity: 0.1,
    showEnergyBar: false,
    showGenStamp: false,
    artworkScale: 1.05,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'none',
    overlayStyle: 'none',
    badgeShape: 'pill',
    statBarStyle: 'standard',
    previewGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    textGlow: false,
  },
  'anime-style': {
    id: 'anime-style',
    name: 'Anime Style',
    label: 'Anime',
    emoji: '🎌',
    wrapperClass: 'theme-anime',
    borderRadius: '16px',
    borderWidth: '3px',
    fontStyle: 'normal',
    backgroundPattern: 'japanese-lines',
    holoIntensity: 0.4,
    showEnergyBar: false,
    showGenStamp: false,
    artworkScale: 1.15,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'saturate(1.6) contrast(1.1)',
    overlayStyle: 'film-grain',
    badgeShape: 'pill',
    statBarStyle: 'dots',
    previewGradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    textGlow: true,
  },
  'pixel-art': {
    id: 'pixel-art',
    name: 'Pixel Art',
    label: 'Pixel',
    emoji: '👾',
    wrapperClass: 'theme-pixel',
    borderRadius: '4px',
    borderWidth: '3px',
    fontStyle: 'pixel',
    backgroundPattern: 'pixel-grid',
    holoIntensity: 0,
    showEnergyBar: false,
    showGenStamp: true,
    artworkScale: 0.95,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'contrast(1.3) saturate(1.5)',
    overlayStyle: 'scanline',
    badgeShape: 'square',
    statBarStyle: 'segmented',
    previewGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    textGlow: false,
  },
  'retro-gameboy': {
    id: 'retro-gameboy',
    name: 'Retro Game Boy',
    label: 'Retro',
    emoji: '🕹️',
    wrapperClass: 'theme-retro',
    borderRadius: '6px',
    borderWidth: '4px',
    fontStyle: 'pixel',
    backgroundPattern: 'scanlines',
    holoIntensity: 0,
    showEnergyBar: false,
    showGenStamp: true,
    artworkScale: 0.9,
    widthRatio: 380,
    heightRatio: 580,
    artworkFilter: 'grayscale(0.8) sepia(0.5) contrast(1.3)',
    overlayStyle: 'scanline',
    badgeShape: 'square',
    statBarStyle: 'segmented',
    previewGradient: 'linear-gradient(135deg, #9ead86 0%, #7b8c6b 100%)',
    textGlow: false,
  },
};

export const THEME_ORDER: CardThemeId[] = [
  'classic-tcg', 'neo-genesis', 'ex', 'gx', 'v', 'vmax', 'vstar',
  'full-art', 'rainbow-rare', 'gold-secret', 'ancient-future',
  'minimal-modern', 'anime-style', 'pixel-art', 'retro-gameboy',
];
