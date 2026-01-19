import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { contentAPI } from '@/services/api';
import ConsciousHeader from '@/components/ConsciousHeader';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

interface Practice {
  id: string;
  title: string;
  body: string;
  intent_tags: string[];
  duration: string;
  category: string;
  media_type?: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'view-grid-outline' },
  { id: 'breathwork', name: 'Breathwork', icon: 'weather-windy' },
  { id: 'stillness', name: 'Stillness', icon: 'meditation' },
  { id: 'gratitude', name: 'Gratitude', icon: 'hand-heart' },
  { id: 'body', name: 'Body', icon: 'human-handsup' },
];

export default function PracticesScreen() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activePractice, setActivePractice] = useState<Practice | null>(null);

  useEffect(() => {
    loadPractices();
  }, [selectedCategory]);

  const loadPractices = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const data = await contentAPI.getPractices(params);
      setPractices(data);
    } catch (error) {
      console.error('Error loading practices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breathwork: ARIOME_COLORS.accent.sky,
      stillness: ARIOME_COLORS.accent.lavender,
      gratitude: ARIOME_COLORS.accent.amber,
      body: ARIOME_COLORS.accent.rose,
    };
    return colors[category] || ARIOME_COLORS.consciousness.teal;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      breathwork: 'weather-windy',
      stillness: 'meditation',
      gratitude: 'hand-heart',
      body: 'human-handsup',
    };
    return icons[category] || 'star-outline';
  };

  // Active Practice View
  if (activePractice) {
    const color = getCategoryColor(activePractice.category);
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.activePracticeContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setActivePractice(null)}>
            <MaterialCommunityIcons name="close" size={24} color={ARIOME_COLORS.text.primary} />
          </TouchableOpacity>

          <View style={styles.activePracticeContent}>
            <View style={[styles.activePracticeIcon, { backgroundColor: `${color}20` }]}>
              <MaterialCommunityIcons name={getCategoryIcon(activePractice.category) as any} size={48} color={color} />
            </View>
            
            <Text style={styles.activePracticeTitle}>{activePractice.title}</Text>
            <Text style={styles.activePracticeDuration}>{activePractice.duration}</Text>
            
            <View style={styles.activePracticeBody}>
              <Text style={styles.activePracticeText}>{activePractice.body}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.completeButton, { backgroundColor: color }]} onPress={() => setActivePractice(null)}>
            <MaterialCommunityIcons name="check" size={20} color="#FFF" />
            <Text style={styles.completeButtonText}>Complete Practice</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <MaterialCommunityIcons
              name={cat.icon as any}
              size={18}
              color={selectedCategory === cat.id ? '#FFF' : ARIOME_COLORS.text.muted}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === cat.id && styles.categoryTextActive,
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.practicesGrid} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Practices & Rituals</Text>
            <Text style={styles.headerSubtitle}>No streaks, no pressure. Just presence.</Text>
          </View>

          {practices.map((practice) => {
            const color = getCategoryColor(practice.category);
            return (
              <TouchableOpacity
                key={practice.id}
                style={styles.practiceCard}
                onPress={() => setActivePractice(practice)}
                activeOpacity={0.8}
              >
                <View style={[styles.practiceIcon, { backgroundColor: `${color}20` }]}>
                  <MaterialCommunityIcons name={getCategoryIcon(practice.category) as any} size={28} color={color} />
                </View>
                <View style={styles.practiceContent}>
                  <Text style={styles.practiceTitle}>{practice.title}</Text>
                  <Text style={styles.practiceDuration}>{practice.duration}</Text>
                  <Text style={styles.practiceDescription} numberOfLines={2}>{practice.body}</Text>
                </View>
                <MaterialCommunityIcons name="play-circle-outline" size={24} color={color} />
              </TouchableOpacity>
            );
          })}

          {practices.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="meditation" size={64} color={ARIOME_COLORS.text.subtle} />
              <Text style={styles.emptyText}>No practices found</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  categoryScroll: {
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
    maxHeight: 60,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusRound,
    backgroundColor: ARIOME_COLORS.background.secondary,
    marginRight: ARIOME_SPACING.sm,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
  },
  categoryText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practicesGrid: {
    padding: ARIOME_SPACING.lg,
  },
  header: {
    marginBottom: ARIOME_SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: 4,
  },
  practiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
  },
  practiceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ARIOME_SPACING.md,
  },
  practiceContent: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: 2,
  },
  practiceDuration: {
    fontSize: 12,
    color: ARIOME_COLORS.consciousness.teal,
    marginBottom: 4,
  },
  practiceDescription: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  emptyText: {
    fontSize: 16,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.md,
  },
  // Active Practice
  activePracticeContainer: {
    flex: 1,
    padding: ARIOME_SPACING.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ARIOME_COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePracticeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePracticeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ARIOME_SPACING.lg,
  },
  activePracticeTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: ARIOME_SPACING.sm,
  },
  activePracticeDuration: {
    fontSize: 14,
    color: ARIOME_COLORS.consciousness.teal,
    marginBottom: ARIOME_SPACING.xl,
  },
  activePracticeBody: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
    width: '100%',
  },
  activePracticeText: {
    fontSize: 16,
    color: ARIOME_COLORS.text.secondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    gap: ARIOME_SPACING.sm,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
