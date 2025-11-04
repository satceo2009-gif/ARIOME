export interface Intention {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const INTENTIONS: Intention[] = [
  {
    id: 'healing',
    name: 'Healing & Recovery',
    icon: 'heart-plus-outline',
    color: '#10B981',
    description: 'Find comfort and support in your healing journey',
  },
  {
    id: 'resilience',
    name: 'Resilience & Strength',
    icon: 'shield-check-outline',
    color: '#F59E0B',
    description: 'Build inner strength and overcome challenges',
  },
  {
    id: 'love',
    name: 'Love & Relationships',
    icon: 'heart-outline',
    color: '#EC4899',
    description: 'Nurture connections and deepen relationships',
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness & Peace',
    icon: 'meditation',
    color: '#8B5CF6',
    description: 'Cultivate presence and inner calm',
  },
  {
    id: 'growth',
    name: 'Growth & Transformation',
    icon: 'sprout-outline',
    color: '#06B6D4',
    description: 'Embrace change and personal evolution',
  },
  {
    id: 'joy',
    name: 'Joy & Celebration',
    icon: 'emoticon-happy-outline',
    color: '#FBBF24',
    description: 'Celebrate life and cultivate joy',
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    icon: 'hand-heart-outline',
    color: '#F97316',
    description: 'Cultivate thankfulness and appreciation',
  },
];
