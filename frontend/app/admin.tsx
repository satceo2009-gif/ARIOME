import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://ariome-repo.preview.emergentagent.com/api';

export default function AdminDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pendingStories, setPendingStories] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('stories');

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'Admin access required');
      router.back();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, storiesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/pending-stories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStats(statsRes.data);
      setPendingStories(storiesRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (storyId: string) => {
    try {
      await axios.post(`${API_URL}/admin/stories/${storyId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Story approved');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve story');
    }
  };

  const handleReject = async (storyId: string) => {
    Alert.prompt(
      'Reject Story',
      'Enter rejection reason:',
      async (reason) => {
        try {
          await axios.post(`${API_URL}/admin/stories/${storyId}/reject`, 
            { reason },
            { headers: { Authorization: `Bearer ${token}` }}
          );
          Alert.alert('Success', 'Story rejected');
          loadData();
        } catch (error) {
          Alert.alert('Error', 'Failed to reject story');
        }
      }
    );
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
        <Text style={styles.title}>Admin Dashboard</Text>
        <MaterialCommunityIcons name="shield-account" size={24} color="#14B8A6" />
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="account-group" size={32} color="#14B8A6" />
          <Text style={styles.statValue}>{stats?.total_users || 0}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="creation" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>{stats?.total_creators || 0}</Text>
          <Text style={styles.statLabel}>Creators</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="video" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>{stats?.total_stories || 0}</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="clock" size={32} color="#EF4444" />
          <Text style={styles.statValue}>{stats?.pending_reviews || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'stories' && styles.tabActive]}
          onPress={() => setSelectedTab('stories')}
        >
          <Text style={[styles.tabText, selectedTab === 'stories' && styles.tabTextActive]}>Pending Stories</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'users' && styles.tabActive]}
          onPress={() => setSelectedTab('users')}
        >
          <Text style={[styles.tabText, selectedTab === 'users' && styles.tabTextActive]}>Users</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'stories' && (
          <View>
            {pendingStories.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="check-circle" size={64} color="#14B8A6" />
                <Text style={styles.emptyText}>No pending stories</Text>
              </View>
            ) : (
              pendingStories.map((story) => (
                <View key={story.id} style={styles.storyCard}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text style={styles.storyCreator}>by {story.creator_name}</Text>
                  <Text style={styles.storyFormat}>{story.format.toUpperCase()}</Text>
                  <View style={styles.storyActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApprove(story.id)}
                    >
                      <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(story.id)}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {selectedTab === 'users' && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>User management coming soon</Text>
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
    fontSize: 16,
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
  storyCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  storyCreator: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  storyFormat: {
    fontSize: 12,
    color: '#14B8A6',
    marginBottom: 16,
  },
  storyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
  },
});
