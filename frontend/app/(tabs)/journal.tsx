import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { journalAPI } from '@/services/api';
import ConsciousHeader from '@/components/ConsciousHeader';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS, ARIOME_MOODS } from '@/constants/ariomeTheme';

export default function JournalScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEntries: 0, totalReflections: 0, streak: 0 });
  const [selectedTab, setSelectedTab] = useState('entries');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'peaceful', tags: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // All logged-in users (including explorers) can use journal
  const canUseJournal = !!token;

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [entriesData, reflectionsData, statsData] = await Promise.all([
        journalAPI.getEntries().catch(() => []),
        journalAPI.getReflections().catch(() => []),
        journalAPI.getStats().catch(() => ({ total_entries: 0, total_reflections: 0, current_streak: 0 }))
      ]);

      setEntries(entriesData || []);
      setReflections(reflectionsData || []);
      setStats({
        totalEntries: statsData?.total_entries || entriesData?.length || 0,
        totalReflections: statsData?.total_reflections || reflectionsData?.length || 0,
        streak: statsData?.current_streak || 0
      });
    } catch (error) {
      console.error('Error loading journal data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMoodEmoji = (mood: string) => {
    const moodInfo = ARIOME_MOODS.find(m => m.id === mood?.toLowerCase());
    return moodInfo ? moodInfo.icon : 'thought-bubble';
  };

  const getMoodColor = (mood: string) => {
    const moodInfo = ARIOME_MOODS.find(m => m.id === mood?.toLowerCase());
    return moodInfo ? moodInfo.color : ARIOME_COLORS.text.muted;
  };

  const handleCreateEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    if (!token) {
      Alert.alert('Login Required', 'Please login to create journal entries');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = newEntry.tags
        ? newEntry.tags.split(',').map(t => t.trim()).filter(t => t)
        : [];

      const entry = await journalAPI.createEntry({
        title: newEntry.title.trim(),
        content: newEntry.content.trim(),
        mood: newEntry.mood,
        tags: tagsArray
      });

      setEntries([entry, ...entries]);
      setStats(prev => ({ ...prev, totalEntries: prev.totalEntries + 1 }));
      setNewEntry({ title: '', content: '', mood: 'peaceful', tags: '' });
      setShowCreateModal(false);
      Alert.alert('Success', 'Journal entry saved to your account!');
    } catch (error: any) {
      console.error('Error creating entry:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Not logged in at all - show signup prompt
  if (!user && !token) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ConsciousHeader />
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="notebook-outline" size={64} color={ARIOME_COLORS.text.subtle} />
          <Text style={styles.emptyText}>Your Inner Journal</Text>
          <Text style={styles.emptySubtext}>Sign up to start journaling your reflections and growth</Text>
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.signupButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Create Button */}
      <ConsciousHeader 
        rightComponent={
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        }
      />

      {/* Explorer notice */}
      {user?.role === 'explorer' && (
        <View style={styles.explorerNotice}>
          <MaterialCommunityIcons name="notebook-edit-outline" size={18} color={ARIOME_COLORS.consciousness.teal} />
          <Text style={styles.explorerNoticeText}>
            Your journal entries are saved to your account!
          </Text>
        </View>
      )}

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="notebook" size={24} color={ARIOME_COLORS.consciousness.teal} />
          <Text style={styles.statValue}>{stats.totalEntries}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="thought-bubble" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.totalReflections}</Text>
          <Text style={styles.statLabel}>Reflections</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={24} color="#EF4444" />
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'entries' && styles.tabActive]}
          onPress={() => setSelectedTab('entries')}
        >
          <Text style={[styles.tabText, selectedTab === 'entries' && styles.tabTextActive]}>
            My Entries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'reflections' && styles.tabActive]}
          onPress={() => setSelectedTab('reflections')}
        >
          <Text style={[styles.tabText, selectedTab === 'reflections' && styles.tabTextActive]}>
            Reflections
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading your journal...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
          }
        >
          {selectedTab === 'entries' ? (
            entries.length > 0 ? (
              entries.map((entry) => (
                <TouchableOpacity key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <MaterialCommunityIcons 
                      name={getMoodEmoji(entry.mood) as any} 
                      size={24} 
                      color={getMoodColor(entry.mood)} 
                    />
                    <Text style={styles.entryDate}>{formatDate(entry.created_at)}</Text>
                  </View>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text style={styles.entryContent} numberOfLines={3}>{entry.content}</Text>
                  {entry.tags?.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {entry.tags.map((tag: string, i: number) => (
                        <View key={i} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="notebook-outline" size={64} color="#6B7280" />
                <Text style={styles.emptyText}>No entries yet</Text>
                <Text style={styles.emptySubtext}>Start journaling your thoughts</Text>
                <TouchableOpacity 
                  style={styles.createEntryBtn}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Text style={styles.createEntryBtnText}>Create First Entry</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            reflections.length > 0 ? (
              reflections.map((reflection) => (
                <View key={reflection.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <MaterialCommunityIcons 
                      name={getMoodEmoji(reflection.mood) as any} 
                      size={24} 
                      color={getMoodColor(reflection.mood)} 
                    />
                    <Text style={styles.entryDate}>{formatDate(reflection.created_at)}</Text>
                  </View>
                  {reflection.before_reflection && (
                    <View style={styles.reflectionSection}>
                      <Text style={styles.reflectionLabel}>Before</Text>
                      <Text style={styles.entryContent}>{reflection.before_reflection}</Text>
                    </View>
                  )}
                  {reflection.after_reflection && (
                    <View style={styles.reflectionSection}>
                      <Text style={styles.reflectionLabel}>After</Text>
                      <Text style={styles.entryContent}>{reflection.after_reflection}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="thought-bubble-outline" size={64} color="#6B7280" />
                <Text style={styles.emptyText}>No reflections yet</Text>
                <Text style={styles.emptySubtext}>Reflections from stories will appear here</Text>
              </View>
            )
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Create Entry Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Journal Entry</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Entry title"
              placeholderTextColor="#6B7280"
              value={newEntry.title}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What's on your mind?"
              placeholderTextColor="#6B7280"
              value={newEntry.content}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, content: text }))}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TextInput
              style={styles.input}
              placeholder="Tags (comma separated: gratitude, morning)"
              placeholderTextColor="#6B7280"
              value={newEntry.tags}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, tags: text }))}
            />

            <Text style={styles.moodLabel}>How are you feeling?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodSelector}>
              {['happy', 'peaceful', 'grateful', 'reflective', 'hopeful', 'anxious', 'sad'].map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[styles.moodOption, newEntry.mood === mood && styles.moodOptionActive]}
                  onPress={() => setNewEntry(prev => ({ ...prev, mood }))}
                >
                  <Text style={styles.moodOptionEmoji}>{getMoodEmoji(mood)}</Text>
                  <Text style={[styles.moodOptionText, newEntry.mood === mood && styles.moodOptionTextActive]}>
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
              onPress={handleCreateEntry}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Entry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explorerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
    marginHorizontal: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    gap: ARIOME_SPACING.sm,
  },
  explorerNoticeText: {
    color: ARIOME_COLORS.consciousness.teal,
    fontSize: 12,
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.lg,
  },
  statCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    marginRight: ARIOME_SPACING.md,
    minWidth: 100,
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
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: ARIOME_SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: ARIOME_COLORS.consciousness.teal,
  },
  tabText: {
    fontSize: 15,
    color: ARIOME_COLORS.text.muted,
  },
  tabTextActive: {
    color: ARIOME_COLORS.consciousness.teal,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: ARIOME_SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.md,
  },
  entryCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.md,
  },
  entryDate: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.sm,
  },
  entryContent: {
    fontSize: 14,
    color: ARIOME_COLORS.text.secondary,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: ARIOME_SPACING.md,
    gap: ARIOME_SPACING.sm,
  },
  tag: {
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 4,
    borderRadius: ARIOME_BORDERS.radiusSmall,
  },
  tagText: {
    fontSize: 12,
    color: ARIOME_COLORS.consciousness.teal,
  },
  reflectionSection: {
    marginBottom: ARIOME_SPACING.md,
  },
  reflectionLabel: {
    fontSize: 12,
    color: ARIOME_COLORS.consciousness.teal,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: ARIOME_SPACING.xl,
  },
  signupButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingHorizontal: ARIOME_SPACING.xl,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    marginTop: ARIOME_SPACING.lg,
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createEntryBtn: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    marginTop: ARIOME_SPACING.lg,
  },
  createEntryBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderTopLeftRadius: ARIOME_BORDERS.radiusXL,
    borderTopRightRadius: ARIOME_BORDERS.radiusXL,
    padding: ARIOME_SPACING.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
  },
  input: {
    backgroundColor: ARIOME_COLORS.background.primary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    color: ARIOME_COLORS.text.primary,
    fontSize: 16,
    marginBottom: ARIOME_SPACING.md,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  moodLabel: {
    color: ARIOME_COLORS.text.muted,
    fontSize: 14,
    marginBottom: ARIOME_SPACING.md,
  },
  moodSelector: {
    marginBottom: ARIOME_SPACING.lg,
  },
  moodOption: {
    alignItems: 'center',
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    backgroundColor: ARIOME_COLORS.background.primary,
    marginRight: ARIOME_SPACING.sm,
  },
  moodOptionActive: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
  },
  moodOptionEmoji: {
    fontSize: 24,
  },
  moodOptionText: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  moodOptionTextActive: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
