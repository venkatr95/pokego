import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-space-grotesk)', 'var(--font-geist-sans)', 'sans-serif'],
      },
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        // Pokémon type colors
        'type-normal':   '#A8A878',
        'type-fire':     '#F08030',
        'type-water':    '#6890F0',
        'type-electric': '#F8D030',
        'type-grass':    '#78C850',
        'type-ice':      '#98D8D8',
        'type-fighting': '#C03028',
        'type-poison':   '#A040A0',
        'type-ground':   '#E0C068',
        'type-flying':   '#A890F0',
        'type-psychic':  '#F85888',
        'type-bug':      '#A8B820',
        'type-rock':     '#B8A038',
        'type-ghost':    '#705898',
        'type-dragon':   '#7038F8',
        'type-dark':     '#705848',
        'type-steel':    '#B8B8D0',
        'type-fairy':    '#EE99AC',
        // App palette
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4bafd',
          400: '#7d95fb',
          500: '#5b6ef7',
          600: '#4451ec',
          700: '#3841d1',
          800: '#3037a9',
          900: '#2c3485',
          950: '#1c2057',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'holographic':     'linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #a020f0, #ff0080)',
      },
      animation: {
        'shimmer':        'shimmer 2s linear infinite',
        'float':          'float 6s ease-in-out infinite',
        'glow-pulse':     'glow-pulse 2s ease-in-out infinite',
        'card-reveal':    'card-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'holographic':    'holographic 4s linear infinite',
        'particle-float': 'particle-float 8s ease-in-out infinite',
        'spin-slow':      'spin 8s linear infinite',
        'bounce-slow':    'bounce 3s ease-in-out infinite',
        'fade-in':        'fade-in 0.5s ease forwards',
        'slide-up':       'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in':       'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bar-fill':       'bar-fill 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.8', boxShadow: '0 0 20px var(--glow-color)' },
          '50%':      { opacity: '1',   boxShadow: '0 0 40px var(--glow-color), 0 0 80px var(--glow-color)' },
        },
        'card-reveal': {
          '0%':   { transform: 'rotateY(-90deg) scale(0.8)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg) scale(1)', opacity: '1' },
        },
        holographic: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'particle-float': {
          '0%':   { transform: 'translateY(100vh) scale(0)', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { transform: 'translateY(-20px) scale(1)', opacity: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to:   { transform: 'scale(1)', opacity: '1' },
        },
        'bar-fill': {
          from: { width: '0%' },
          to:   { width: 'var(--bar-width)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px var(--glow-color)',
        'glow-md': '0 0 20px var(--glow-color)',
        'glow-lg': '0 0 40px var(--glow-color)',
        'glow-xl': '0 0 60px var(--glow-color)',
        'card':    '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
        'premium': '0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
