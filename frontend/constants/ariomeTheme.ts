/**
 * AriOme Conscious Design System
 * A calm, spacious, consciousness-first design language
 */

export const ARIOME_COLORS = {
  // Primary Palette - Soft, calming tones
  background: {
    deep: '#0A0A0F',
    primary: '#0F0F14',
    secondary: '#1A1A24',
    elevated: '#1F2937',
    sacred: '#141420',
  },
  
  // Consciousness Colors
  consciousness: {
    teal: '#14B8A6',
    tealLight: '#2DD4BF',
    tealDark: '#0D9488',
    tealMuted: 'rgba(20, 184, 166, 0.15)',
  },
  
  // Soft accent colors
  accent: {
    lavender: '#A78BFA',
    rose: '#F472B6',
    amber: '#FBBF24',
    sage: '#86EFAC',
    sky: '#7DD3FC',
  },
  
  // Text colors with hierarchy
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
  
  // Intention colors (keeping existing)
  intentions: {
    healing: '#EC4899',
    growth: '#10B981',
    love: '#F472B6',
    gratitude: '#F59E0B',
    resilience: '#8B5CF6',
    mindfulness: '#14B8A6',
    joy: '#FBBF24',
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
  // Headings - soft, peaceful
  h1: {
    fontSize: 32,
    fontWeight: '300' as const,
    letterSpacing: 1,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.25,
    lineHeight: 28,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  
  // Captions
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  
  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.25,
  },
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
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};

// Moods for emotional check-ins (keeping all existing + enhancing)
export const ARIOME_MOODS = [
  { id: 'healing', label: 'Healing', icon: 'heart-pulse', color: '#EC4899', description: 'Seeking comfort and recovery' },
  { id: 'growth', label: 'Growth', icon: 'trending-up', color: '#10B981', description: 'Ready to evolve and learn' },
  { id: 'love', label: 'Love', icon: 'heart', color: '#F472B6', description: 'Feeling connected and caring' },
  { id: 'gratitude', label: 'Gratitude', icon: 'hand-heart', color: '#F59E0B', description: 'Appreciating what is' },
  { id: 'resilience', label: 'Resilience', icon: 'shield-check', color: '#8B5CF6', description: 'Finding inner strength' },
  { id: 'mindfulness', label: 'Mindfulness', icon: 'meditation', color: '#14B8A6', description: 'Present and aware' },
  { id: 'joy', label: 'Joy', icon: 'emoticon-happy', color: '#FBBF24', description: 'Celebrating life' },
  { id: 'peaceful', label: 'Peaceful', icon: 'leaf', color: '#86EFAC', description: 'Calm and serene' },
  { id: 'reflective', label: 'Reflective', icon: 'thought-bubble', color: '#A78BFA', description: 'Contemplating deeply' },
  { id: 'hopeful', label: 'Hopeful', icon: 'star-outline', color: '#7DD3FC', description: 'Looking forward with optimism' },
];

// Daily reflection prompts
export const REFLECTION_PROMPTS = [
  "What are you grateful for in this moment?",
  "What intention would you like to set for today?",
  "What does your inner wisdom want you to know?",
  "How can you show kindness to yourself today?",
  "What lesson is life presenting to you right now?",
  "What would bring you peace in this moment?",
  "What are you ready to release?",
  "How have you grown recently?",
  "What brings you joy when you think about it?",
  "What does self-love look like for you today?",
];

// Conscious pause durations
export const PAUSE_DURATIONS = [
  { id: 'brief', label: '1 minute', seconds: 60, description: 'A moment of stillness' },
  { id: 'short', label: '3 minutes', seconds: 180, description: 'A gentle pause' },
  { id: 'medium', label: '5 minutes', seconds: 300, description: 'A mindful break' },
  { id: 'extended', label: '10 minutes', seconds: 600, description: 'A deeper practice' },
];

// Practice types
export const PRACTICE_TYPES = [
  { id: 'breath', label: 'Breath Awareness', icon: 'weather-windy', color: '#7DD3FC', description: 'Connect with your breath' },
  { id: 'stillness', label: 'Stillness Practice', icon: 'meditation', color: '#A78BFA', description: 'Find inner quiet' },
  { id: 'gratitude', label: 'Gratitude Ritual', icon: 'hand-heart', color: '#F59E0B', description: 'Cultivate thankfulness' },
  { id: 'intention', label: 'Intention Setting', icon: 'compass-outline', color: '#14B8A6', description: 'Set conscious intentions' },
  { id: 'reflection', label: 'Self-Inquiry', icon: 'thought-bubble-outline', color: '#F472B6', description: 'Explore your inner world' },
];
