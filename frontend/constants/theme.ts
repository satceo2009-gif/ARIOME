/**
 * AriOme Design System - Conscious Living Ecosystem
 * A calm, spacious, reflection-first design language
 */

export const ARIOME_COLORS = {
  // Background palette - deep, calming
  background: {
    deep: '#0A0A0F',
    primary: '#0F0F14',
    secondary: '#1A1A24',
    elevated: '#1F2937',
    sacred: '#141420',
  },
  
  // Consciousness accent
  consciousness: {
    teal: '#14B8A6',
    tealLight: '#2DD4BF',
    tealDark: '#0D9488',
    tealMuted: 'rgba(20, 184, 166, 0.15)',
  },
  
  // Soft accent palette
  accent: {
    lavender: '#A78BFA',
    rose: '#F472B6',
    amber: '#FBBF24',
    sage: '#86EFAC',
    sky: '#7DD3FC',
  },
  
  // Text hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    muted: '#9CA3AF',
    subtle: '#6B7280',
    disabled: '#4B5563',
  },
  
  // Semantic colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

export const ARIOME_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  sacred: 64, // Sacred white space
};

export const ARIOME_TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '300' as const, letterSpacing: 1, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '400' as const, letterSpacing: 0.5, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '500' as const, letterSpacing: 0.25, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, letterSpacing: 0.5 },
  label: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.25 },
};

export const ARIOME_BORDERS = {
  radiusSmall: 8,
  radiusMedium: 12,
  radiusLarge: 16,
  radiusXL: 24,
  radiusRound: 999,
};

export const ARIOME_SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
};

// Default reflection prompts for offline use
export const DEFAULT_PROMPTS = [
  "What quality do you want to bring into your day today?",
  "What are you grateful for in this moment?",
  "What can you let go of to rest more peacefully?",
  "If your wisest self could speak to you, what would they say?",
  "What emotion needs your attention right now?",
];
