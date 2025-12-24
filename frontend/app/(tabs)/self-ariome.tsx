import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';
import SacredCard from '@/components/SacredCard';
import MoodSelector from '@/components/MoodSelector';
import ReflectionInput from '@/components/ReflectionInput';
import PracticesGrid from '@/components/PracticesGrid';
import ConsciousPause from '@/components/ConsciousPause';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS, ARIOME_MOODS, REFLECTION_PROMPTS } from '@/constants/ariomeTheme';
import { journalAPI } from '@/services/api';

export default function SelfAriomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [todayPrompt, setTodayPrompt] = useState('');
  const [stats, setStats] = useState({ reflections: 0, streak: 0, practices: 0 });
  const [recentReflections, setRecentReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get today's reflection prompt
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTodayPrompt(REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length]);
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [entriesData, statsData] = await Promise.all([
        journalAPI.getEntries().catch(() => []),
        journalAPI.getStats().catch(() => ({ total_entries: 0, current_streak: 0 }))
      ]);
      setRecentReflections(entriesData?.slice(0, 3) || []);
      setStats({
        reflections: statsData?.total_entries || 0,
        streak: statsData?.current_streak || 0,
        practices: 0 // Will be populated when we add practices tracking
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleSaveReflection = async (reflection: { content: string; mood: string; prompt?: string }) => {
    try {
      await journalAPI.createEntry({
        title: `Reflection - ${new Date().toLocaleDateString()}`,
        content: reflection.content,
        mood: reflection.mood,
        tags: ['reflection', 'self-ariome']
      });
      setShowReflection(false);
      loadData();
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
  };

  const handleSelectPractice = (practiceId: string) => {
    if (practiceId === 'breath' || practiceId === 'stillness') {
      setShowPause(true);
    } else if (practiceId === 'reflection') {
      setShowReflection(true);
    } else if (practiceId === 'gratitude') {
      router.push('/(tabs)/journal');
    }
  };

  const getMoodInfo = (moodId: string) => {
    return ARIOME_MOODS.find(m => m.id === moodId);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (showPause) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ConsciousPause 
          onComplete={() => setShowPause(false)}
          onCancel={() => setShowPause(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ConsciousHeader showSettings />
      
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
          <Text style={styles.greeting}>Welcome back{user?.name ? `, ${user.name}` : ''}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>

        {/* Daily Emotional Check-in */}
        <SacredCard style={styles.checkInCard}>
          <View style={styles.checkInHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={24} color={ARIOME_COLORS.consciousness.teal} />
            <Text style={styles.checkInTitle}>How are you feeling?</Text>
          </View>
          <Text style={styles.checkInSubtitle}>Take a moment to check in with yourself</Text>
          
          <MoodSelector 
            selectedMood={selectedMood} 
            onSelect={handleMoodSelect}
            horizontal
          />
          
          {selectedMood && (
            <View style={styles.moodResponse}>
              <View style={[styles.moodResponseBadge, { backgroundColor: `${getMoodInfo(selectedMood)?.color}20` }]}>
                <MaterialCommunityIcons 
                  name={getMoodInfo(selectedMood)?.icon as any} 
                  size={20} 
                  color={getMoodInfo(selectedMood)?.color} 
                />
                <Text style={[styles.moodResponseText, { color: getMoodInfo(selectedMood)?.color }]}>
                  {getMoodInfo(selectedMood)?.description}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.reflectButton}
                onPress={() => setShowReflection(true)}
              >
                <MaterialCommunityIcons name="pencil-outline" size={18} color={ARIOME_COLORS.consciousness.teal} />
                <Text style={styles.reflectButtonText}>Add a reflection</Text>
              </TouchableOpacity>
            </View>
          )}
        </SacredCard>

        {/* Today's Reflection Prompt */}
        {!showReflection && (
          <TouchableOpacity 
            style={styles.promptCard}
            onPress={() => setShowReflection(true)}
            activeOpacity={0.8}
          >
            <View style={styles.promptHeader}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color={ARIOME_COLORS.accent.amber} />
              <Text style={styles.promptLabel}>Today's Reflection</Text>
            </View>
            <Text style={styles.promptText}>{todayPrompt}</Text>
            <View style={styles.promptAction}>
              <Text style={styles.promptActionText}>Tap to reflect</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={ARIOME_COLORS.text.muted} />
            </View>
          </TouchableOpacity>
        )}

        {/* Reflection Input (shown when triggered) */}
        {showReflection && (
          <View style={styles.reflectionSection}>
            <View style={styles.reflectionHeader}>
              <Text style={styles.reflectionTitle}>Your Reflection</Text>
              <TouchableOpacity onPress={() => setShowReflection(false)}>
                <MaterialCommunityIcons name="close" size={24} color={ARIOME_COLORS.text.muted} />
              </TouchableOpacity>
            </View>
            <ReflectionInput 
              onSave={handleSaveReflection}
              initialPrompt={todayPrompt}
            />
          </View>
        )}

        {/* Practices Section */}
        <PracticesGrid 
          onSelectPractice={handleSelectPractice}
        />

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="thought-bubble" size={28} color={ARIOME_COLORS.accent.lavender} />
              <Text style={styles.statValue}>{stats.reflections}</Text>
              <Text style={styles.statLabel}>Reflections</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="fire" size={28} color={ARIOME_COLORS.accent.amber} />
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="meditation" size={28} color={ARIOME_COLORS.consciousness.teal} />
              <Text style={styles.statValue}>{stats.practices}</Text>
              <Text style={styles.statLabel}>Practices</Text>
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
                <View style={styles.reflectionCardHeader}>
                  <MaterialCommunityIcons 
                    name={getMoodInfo(reflection.mood)?.icon as any || 'thought-bubble'} 
                    size={20} 
                    color={getMoodInfo(reflection.mood)?.color || ARIOME_COLORS.text.muted} 
                  />
                  <Text style={styles.reflectionDate}>{formatDate(reflection.created_at)}</Text>
                </View>
                <Text style={styles.reflectionContent} numberOfLines={2}>{reflection.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Not logged in prompt */}
        {!token && (
          <SacredCard elevated>
            <View style={styles.loginPrompt}>
              <MaterialCommunityIcons name="account-heart" size={48} color={ARIOME_COLORS.consciousness.teal} />
              <Text style={styles.loginPromptTitle}>Start Your Inner Journey</Text>
              <Text style={styles.loginPromptText}>
                Create an account to save your reflections, track your progress, and build a meaningful practice.
              </Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.loginButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </SacredCard>
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
  welcomeSection: {
    marginTop: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.lg,
  },
  greeting: {
    fontSize: 28,
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
  moodResponse: {
    marginTop: ARIOME_SPACING.md,
    paddingTop: ARIOME_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  moodResponseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    gap: ARIOME_SPACING.sm,
    alignSelf: 'flex-start',
  },
  moodResponseText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reflectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: ARIOME_SPACING.sm,
  },
  reflectButtonText: {
    color: ARIOME_COLORS.consciousness.teal,
    fontSize: 14,
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
  promptAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ARIOME_SPACING.md,
  },
  promptActionText: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
  },
  reflectionSection: {
    marginBottom: ARIOME_SPACING.lg,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.md,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
  },
  statsSection: {
    marginTop: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.sm,
  },
  statLabel: {
    fontSize: 11,
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
  reflectionCardHeader: {
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
  loginPrompt: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.lg,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.sm,
  },
  loginPromptText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: ARIOME_SPACING.lg,
  },
  loginButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    paddingHorizontal: ARIOME_SPACING.xl,
    borderRadius: ARIOME_BORDERS.radiusMedium,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
