import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://meditate-hub-3.preview.emergentagent.com/api';

export default function CreatorDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('analytics');

  useEffect(() => {
    if (user?.role !== 'creator' && user?.role !== 'admin') {
      Alert.alert('Access Denied', 'Creator access required');
      router.back();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsRes, storiesRes] = await Promise.all([
        axios.get(`${API_URL}/creator/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/creator/my-stories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setAnalytics(analyticsRes.data);
      setMyStories(storiesRes.data);
    } catch (error) {
      console.error('Error loading creator data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#10B981';
      case 'pending_review': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Creator Dashboard</Text>
        <MaterialCommunityIcons name="creation" size={24} color="#8B5CF6" />
      </View>

      {/* Analytics Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="video" size={32} color="#14B8A6" />
          <Text style={styles.statValue}>{analytics?.published_stories || 0}</Text>
          <Text style={styles.statLabel}>Published</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="play" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>{analytics?.total_plays || 0}</Text>
          <Text style={styles.statLabel}>Total Plays</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="heart" size={32} color="#EF4444" />
          <Text style={styles.statValue}>{analytics?.total_resonance || 0}</Text>
          <Text style={styles.statLabel}>Resonances</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="currency-usd" size={32} color="#10B981" />
          <Text style={styles.statValue}>${analytics?.total_earnings?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'analytics' && styles.tabActive]}
          onPress={() => setSelectedTab('analytics')}
        >
          <Text style={[styles.tabText, selectedTab === 'analytics' && styles.tabTextActive]}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'stories' && styles.tabActive]}
          onPress={() => setSelectedTab('stories')}
        >
          <Text style={[styles.tabText, selectedTab === 'stories' && styles.tabTextActive]}>My Stories</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'upload' && styles.tabActive]}
          onPress={() => setSelectedTab('upload')}
        >
          <Text style={[styles.tabText, selectedTab === 'upload' && styles.tabTextActive]}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'analytics' && (
          <View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Verification Status</Text>
              <View style={styles.verificationBadge}>
                <MaterialCommunityIcons 
                  name={analytics?.verification_status === 'verified' ? 'check-decagram' : 'clock'} 
                  size={24} 
                  color={analytics?.verification_status === 'verified' ? '#14B8A6' : '#F59E0B'} 
                />
                <Text style={styles.verificationText}>
                  {analytics?.verification_status === 'verified' ? 'Verified Creator' : 'Pending Verification'}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Story Status</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>Published: {analytics?.published_stories || 0}</Text>
                <Text style={styles.statusText}>Pending: {analytics?.pending_stories || 0}</Text>
                <Text style={styles.statusText}>Rejected: {analytics?.rejected_stories || 0}</Text>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'stories' && (
          <View>
            {myStories.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="video-off" size={64} color="#9CA3AF" />
                <Text style={styles.emptyText}>No stories yet</Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => setSelectedTab('upload')}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Upload Your First Story</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myStories.map((story) => (
                <View key={story.id} style={styles.storyCard}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <View style={styles.storyMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(story.status)}20` }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(story.status) }]}>
                        {story.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.storyFormat}>{story.format.toUpperCase()}</Text>
                  </View>
                  <View style={styles.storyStats}>
                    <Text style={styles.statText}>
                      <MaterialCommunityIcons name="play" size={16} color="#9CA3AF" /> {story.play_count || 0} plays
                    </Text>
                    <Text style={styles.statText}>
                      <MaterialCommunityIcons name="heart" size={16} color="#9CA3AF" /> {story.resonance_count || 0} resonances
                    </Text>
                  </View>
                  {story.rejection_reason && (
                    <Text style={styles.rejectionReason}>Reason: {story.rejection_reason}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {selectedTab === 'upload' && (
          <View style={styles.uploadForm}>
            <Text style={styles.uploadTitle}>Upload New Story</Text>
            <Text style={styles.uploadDesc}>Coming soon: Upload your wellness content directly from the app</Text>
            
            <View style={styles.uploadPlaceholder}>
              <MaterialCommunityIcons name="cloud-upload" size={64} color="#14B8A6" />
              <Text style={styles.placeholderText}>Story upload feature</Text>
              <Text style={styles.placeholderSubtext}>Upload video/audio content</Text>
            </View>

            <TouchableOpacity style={styles.comingSoonButton}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
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
    minWidth: 120,
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
    fontSize: 14,
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  storyCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  storyFormat: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  storyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  rejectionReason: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadForm: {
    paddingBottom: 32,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  uploadDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  uploadPlaceholder: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  comingSoonButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  comingSoonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
});
