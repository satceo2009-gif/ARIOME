import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://mind-wellness-70.preview.emergentagent.com/api';

export default function JournalScreen() {
  const { token, user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('entries');

  useEffect(() => {
    if (!user) {
      Alert.alert('Please Login', 'Login to access journal');
      return;
    }
    loadJournalData();
  }, []);

  const loadJournalData = async () => {
    try {
      const [entriesRes, reflectionsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/journal/entries`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/journal/reflections`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/journal/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setEntries(entriesRes.data);
      setReflections(reflectionsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMoodEmoji = (mood: string) => {
    const moods: any = {
      happy: '😊',
      peaceful: '😌',
      grateful: '🙏',
      sad: '😢',
      anxious: '😰',
      calm: '🧘',
    };
    return moods[mood] || '💭';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        <TouchableOpacity style={styles.createButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="book-open-variant" size={32} color="#14B8A6" />
          <Text style={styles.statValue}>{stats?.total_entries || 0}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="lightbulb" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>{stats?.total_reflections || 0}</Text>
          <Text style={styles.statLabel}>Reflections</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="calendar" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>{new Date().toLocaleDateString('en-US', { day: 'numeric' })}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'entries' && styles.tabActive]}
          onPress={() => setSelectedTab('entries')}
        >
          <Text style={[styles.tabText, selectedTab === 'entries' && styles.tabTextActive]}>My Entries</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'reflections' && styles.tabActive]}
          onPress={() => setSelectedTab('reflections')}
        >
          <Text style={[styles.tabText, selectedTab === 'reflections' && styles.tabTextActive]}>Story Reflections</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {selectedTab === 'entries' && (
            <View>
              {entries.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="book-open-variant" size={64} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No journal entries yet</Text>
                  <Text style={styles.emptySubtext}>Start writing your thoughts</Text>
                </View>
              ) : (
                entries.map((entry) => (
                  <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryDate}>{formatDate(entry.created_at)}</Text>
                      {entry.mood && (
                        <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                      )}
                    </View>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryContent} numberOfLines={3}>
                      {entry.content}
                    </Text>
                    {entry.tags && entry.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {entry.tags.map((tag: string, idx: number) => (
                          <View key={idx} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          {selectedTab === 'reflections' && (
            <View>
              {reflections.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="lightbulb" size={64} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No story reflections yet</Text>
                  <Text style={styles.emptySubtext}>Watch stories and reflect on them</Text>
                </View>
              ) : (
                reflections.map((reflection) => (
                  <View key={reflection.id} style={styles.reflectionCard}>
                    <View style={styles.reflectionHeader}>
                      <MaterialCommunityIcons name="lightbulb" size={24} color="#F59E0B" />
                      <Text style={styles.reflectionDate}>{formatDate(reflection.created_at)}</Text>
                    </View>
                    
                    {reflection.mood && (
                      <View style={styles.moodBadge}>
                        <Text style={styles.moodText}>{getMoodEmoji(reflection.mood)} {reflection.mood}</Text>
                      </View>
                    )}
                    
                    {reflection.before_reflection && (
                      <View style={styles.reflectionSection}>
                        <Text style={styles.reflectionLabel}>Before:</Text>
                        <Text style={styles.reflectionText}>{reflection.before_reflection}</Text>
                      </View>
                    )}
                    
                    {reflection.after_reflection && (
                      <View style={styles.reflectionSection}>
                        <Text style={styles.reflectionLabel}>After:</Text>
                        <Text style={styles.reflectionText}>{reflection.after_reflection}</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
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
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#14B8A6',
  },
  tabText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  entryCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  moodEmoji: {
    fontSize: 24,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#14B8A6',
  },
  reflectionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reflectionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  moodBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  moodText: {
    fontSize: 14,
    color: '#F59E0B',
  },
  reflectionSection: {
    marginBottom: 12,
  },
  reflectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  reflectionText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
});
