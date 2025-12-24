import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS, PRACTICE_TYPES } from '@/constants/ariomeTheme';

interface PracticeCardProps {
  practice: typeof PRACTICE_TYPES[0];
  onPress: () => void;
  isActive?: boolean;
}

function PracticeCard({ practice, onPress, isActive }: PracticeCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.practiceCard,
        isActive && { borderColor: practice.color, backgroundColor: `${practice.color}10` }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${practice.color}20` }]}>
        <MaterialCommunityIcons name={practice.icon as any} size={28} color={practice.color} />
      </View>
      <Text style={styles.practiceLabel}>{practice.label}</Text>
      <Text style={styles.practiceDescription}>{practice.description}</Text>
      <View style={[styles.startIndicator, { backgroundColor: practice.color }]}>
        <MaterialCommunityIcons name="play" size={14} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
}

interface PracticesGridProps {
  onSelectPractice: (practiceId: string) => void;
  activePractice?: string | null;
}

export default function PracticesGrid({ onSelectPractice, activePractice }: PracticesGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="flower-tulip-outline" size={24} color={ARIOME_COLORS.consciousness.teal} />
        <Text style={styles.title}>Daily Practices</Text>
      </View>
      <Text style={styles.subtitle}>Choose a practice to nurture your inner growth</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {PRACTICE_TYPES.map((practice) => (
          <PracticeCard
            key={practice.id}
            practice={practice}
            onPress={() => onSelectPractice(practice.id)}
            isActive={activePractice === practice.id}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: ARIOME_SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.xs,
    paddingHorizontal: ARIOME_SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    paddingHorizontal: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.md,
  },
  practiceCard: {
    width: 160,
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ARIOME_SPACING.sm,
  },
  practiceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: 4,
  },
  practiceDescription: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    lineHeight: 16,
  },
  startIndicator: {
    position: 'absolute',
    top: ARIOME_SPACING.sm,
    right: ARIOME_SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
