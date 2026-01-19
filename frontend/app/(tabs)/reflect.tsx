import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { contentAPI, reflectionAPI } from '@/services/api';
import ConsciousHeader from '@/components/ConsciousHeader';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS, DEFAULT_PROMPTS } from '@/constants/theme';

interface Mood {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface Prompt {
  id: string;
  title: string;
  body: string;
  intent_tags: string[];
  duration: string;
}

export default function ReflectScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState<Prompt | null>(null);
  const [stats, setStats] = useState({ total: 0, streak: 0 });
  const [recentReflections, setRecentReflections] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [moodsData, promptData, statsData, reflectionsData] = await Promise.all([
        contentAPI.getMoods().catch(() => []),
        contentAPI.getDailyPrompt().catch(() => null),
        reflectionAPI.getStats().catch(() => ({ total_reflections: 0, current_streak: 0 })),
        reflectionAPI.getAll({ limit: 3 }).catch(() => []),
      ]);
      
      setMoods(moodsData);
      setDailyPrompt(promptData);
      setStats({
        total: statsData?.total_reflections || 0,
        streak: statsData?.current_streak || 0,
      });
      setRecentReflections(reflectionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getMoodInfo = (moodId: string) => moods.find(m => m.id === moodId);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleReflect = () => {
    router.push({
      pathname: '/(tabs)/journal',
      params: {
        mood: selectedMood || undefined,
        prompt: dailyPrompt?.body || undefined,
        promptId: dailyPrompt?.id || undefined,
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ARIOME_COLORS.consciousness.teal} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome{user?.name ? `, ${user.name}` : ''}</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Daily Check-in Card */}
        <View style={styles.checkInCard}>
          <View style={styles.checkInHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={24} color={ARIOME_COLORS.consciousness.teal} />
            <Text style={styles.checkInTitle}>How are you feeling?</Text>
          </View>
          <Text style={styles.checkInSubtitle}>Take a moment to check in with yourself</Text>

          {/* Mood Grid */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodChip,
                  selectedMood === mood.id && { backgroundColor: `${mood.color}20`, borderColor: mood.color },
                ]}
                onPress={() => handleMoodSelect(mood.id)}
              >
                <MaterialCommunityIcons
                  name={mood.icon as any}
                  size={22}
                  color={selectedMood === mood.id ? mood.color : ARIOME_COLORS.text.muted}
                />
                <Text style={[styles.moodLabel, selectedMood === mood.id && { color: mood.color }]}>
                  {mood.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected Mood Response */}
          {selectedMood && (
            <View style={styles.moodResponse}>
              <View style={[styles.moodBadge, { backgroundColor: `${getMoodInfo(selectedMood)?.color}20` }]}>
                <MaterialCommunityIcons
                  name={getMoodInfo(selectedMood)?.icon as any}
                  size={18}
                  color={getMoodInfo(selectedMood)?.color}
                />
                <Text style={[styles.moodBadgeText, { color: getMoodInfo(selectedMood)?.color }]}>
                  {getMoodInfo(selectedMood)?.description}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Today's Reflection Prompt */}
        {dailyPrompt && (
          <TouchableOpacity style={styles.promptCard} onPress={handleReflect} activeOpacity={0.8}>
            <View style={styles.promptHeader}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color={ARIOME_COLORS.accent.amber} />
              <Text style={styles.promptLabel}>Today's Reflection</Text>
            </View>
            <Text style={styles.promptText}>{dailyPrompt.body}</Text>
            <View style={styles.promptFooter}>
              <Text style={styles.promptAction}>Tap to reflect</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={ARIOME_COLORS.text.muted} />
            </View>
          </TouchableOpacity>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="thought-bubble" size={28} color={ARIOME_COLORS.accent.lavender} />
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Reflections</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="fire" size={28} color={ARIOME_COLORS.accent.amber} />
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Recent Reflections */}
        {recentReflections.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Reflections</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/journal')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentReflections.map((reflection) => (
              <View key={reflection.id} style={styles.reflectionCard}>
                <View style={styles.reflectionHeader}>
                  <MaterialCommunityIcons
                    name={getMoodInfo(reflection.mood_after || reflection.mood_before)?.icon as any || 'thought-bubble-outline'}
                    size={20}
                    color={getMoodInfo(reflection.mood_after || reflection.mood_before)?.color || ARIOME_COLORS.text.muted}
                  />
                  <Text style={styles.reflectionDate}>{formatDate(reflection.created_at)}</Text>
                </View>
                <Text style={styles.reflectionContent} numberOfLines={2}>{reflection.content}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: ARIOME_SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    marginTop: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.lg,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: 4,
  },
  checkInCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.lg,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.xs,
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
  },
  checkInSubtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginBottom: ARIOME_SPACING.md,
  },
  moodScroll: {
    marginHorizontal: -ARIOME_SPACING.lg,
    paddingHorizontal: ARIOME_SPACING.lg,
  },
  moodChip: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.sm,
    paddingHorizontal: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    backgroundColor: ARIOME_COLORS.background.primary,
    marginRight: ARIOME_SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 72,
  },
  moodLabel: {
    fontSize: 11,
    color: ARIOME_COLORS.text.muted,
    marginTop: 4,
  },
  moodResponse: {
    marginTop: ARIOME_SPACING.md,
    paddingTop: ARIOME_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    gap: ARIOME_SPACING.sm,
    alignSelf: 'flex-start',
  },
  moodBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  promptCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: ARIOME_COLORS.accent.amber,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.sm,
  },
  promptLabel: {
    fontSize: 12,
    color: ARIOME_COLORS.accent.amber,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  promptText: {
    fontSize: 18,
    color: ARIOME_COLORS.text.primary,
    fontStyle: 'italic',
    fontWeight: '300',
    lineHeight: 26,
  },
  promptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ARIOME_SPACING.md,
  },
  promptAction: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
  },
  statsSection: {
    marginBottom: ARIOME_SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: ARIOME_SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.sm,
  },
  statLabel: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    marginTop: 2,
  },
  recentSection: {
    marginBottom: ARIOME_SPACING.lg,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.md,
  },
  viewAllText: {
    fontSize: 14,
    color: ARIOME_COLORS.consciousness.teal,
  },
  reflectionCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.sm,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.xs,
  },
  reflectionDate: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  reflectionContent: {
    fontSize: 14,
    color: ARIOME_COLORS.text.secondary,
    lineHeight: 20,
  },
});
