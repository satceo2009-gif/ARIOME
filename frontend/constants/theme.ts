/**
 * AriOme Design System - Conscious Living Ecosystem
 * A calm, spacious, reflection-first design language
 * Modern + Zen + Premium with Bi-Modal (Light/Dark) support
 */

// Theme mode type
export type ThemeMode = 'light' | 'dark';

// Light Mode Colors
export const LIGHT_COLORS = {
  background: {
    deep: '#FDFCF8',
    primary: '#F9FAFB',
    secondary: '#F3F4F6',
    elevated: '#FFFFFF',
    sacred: '#F5F5F4',
    card: '#FFFFFF',
    overlay: 'rgba(253, 252, 248, 0.95)',
  },
  text: {
    primary: '#1C1917',
    secondary: '#57534E',
    muted: '#78716C',
    subtle: '#A8A29E',
    disabled: '#D6D3D1',
    accent: '#0D9488',
  },
  border: '#E7E5E4',
  consciousness: {
    teal: '#0D9488',
    tealLight: '#14B8A6',
    tealDark: '#0F766E',
    tealMuted: 'rgba(13, 148, 136, 0.1)',
    tealGlow: 'rgba(13, 148, 136, 0.2)',
  },
};

// Dark Mode Colors (default)
export const DARK_COLORS = {
  background: {
    deep: '#0A0A0F',
    primary: '#0F0F14',
    secondary: '#1A1A24',
    elevated: '#1F2937',
    sacred: '#141420',
    card: '#12121A',
    overlay: 'rgba(10, 10, 15, 0.95)',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#E5E7EB',
    muted: '#9CA3AF',
    subtle: '#6B7280',
    disabled: '#4B5563',
    accent: '#14B8A6',
  },
  border: '#27272A',
  consciousness: {
    teal: '#14B8A6',
    tealLight: '#2DD4BF',
    tealDark: '#0D9488',
    tealMuted: 'rgba(20, 184, 166, 0.15)',
    tealGlow: 'rgba(20, 184, 166, 0.3)',
  },
};

export const ARIOME_COLORS = {
  // Background palette - deep, calming with subtle warmth
  background: {
    deep: '#0A0A0F',
    primary: '#0F0F14',
    secondary: '#1A1A24',
    elevated: '#1F2937',
    sacred: '#141420',
    card: '#12121A',
    overlay: 'rgba(10, 10, 15, 0.95)',
  },
  
  // Consciousness accent - Premium teal
  consciousness: {
    teal: '#14B8A6',
    tealLight: '#2DD4BF',
    tealDark: '#0D9488',
    tealMuted: 'rgba(20, 184, 166, 0.15)',
    tealGlow: 'rgba(20, 184, 166, 0.3)',
  },
  
  // Soft accent palette - Mood colors
  accent: {
    lavender: '#A78BFA',
    purple: '#8B5CF6',
    rose: '#F472B6',
    pink: '#EC4899',
    amber: '#FBBF24',
    orange: '#F97316',
    sage: '#86EFAC',
    green: '#10B981',
    sky: '#7DD3FC',
    blue: '#3B82F6',
    gold: '#D4AF37',
  },
  
  // Mood-specific colors
  mood: {
    peaceful: { primary: '#86EFAC', secondary: '#10B981', gradient: ['#10B981', '#059669'] },
    grateful: { primary: '#FBBF24', secondary: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    hopeful: { primary: '#7DD3FC', secondary: '#0EA5E9', gradient: ['#0EA5E9', '#0284C7'] },
    reflective: { primary: '#A78BFA', secondary: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
    joyful: { primary: '#F472B6', secondary: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
    anxious: { primary: '#FB923C', secondary: '#F97316', gradient: ['#F97316', '#EA580C'] },
    sad: { primary: '#60A5FA', secondary: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
    energized: { primary: '#FBBF24', secondary: '#EAB308', gradient: ['#EAB308', '#CA8A04'] },
    curious: { primary: '#C084FC', secondary: '#A855F7', gradient: ['#A855F7', '#9333EA'] },
    content: { primary: '#34D399', secondary: '#10B981', gradient: ['#10B981', '#059669'] },
  },
  
  // Text hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E7EB',
    muted: '#9CA3AF',
    subtle: '#6B7280',
    disabled: '#4B5563',
    accent: '#14B8A6',
  },
  
  // Semantic colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Premium gradients
  gradients: {
    premium: ['#14B8A6', '#8B5CF6'],
    gold: ['#D4AF37', '#F59E0B'],
    zen: ['#1A1A24', '#0A0A0F'],
    calm: ['#0D9488', '#14B8A6'],
    sunset: ['#F472B6', '#FBBF24'],
    ocean: ['#0EA5E9', '#14B8A6'],
  },
};

export const ARIOME_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  sacred: 64,
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
  glow: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  premium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
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
