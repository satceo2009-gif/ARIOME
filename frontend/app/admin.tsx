import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://peaceful-living-5.preview.emergentagent.com/api';

export default function AdminDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingStories, setPendingStories] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('users');

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
      const [statsRes, usersRes, storiesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/pending-stories`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPendingStories(storiesRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: any = {
      explorer: { color: '#14B8A6', bg: '#14B8A620' },
      subscriber: { color: '#F59E0B', bg: '#F59E0B20' },
      creator: { color: '#8B5CF6', bg: '#8B5CF620' },
      admin: { color: '#EF4444', bg: '#EF444420' },
    };
    return badges[role] || badges.explorer;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <MaterialCommunityIcons name="crown" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>{stats?.total_subscribers || 0}</Text>
          <Text style={styles.statLabel}>Subscribers</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="creation" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>{stats?.total_creators || 0}</Text>
          <Text style={styles.statLabel}>Creators</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="video" size={32} color="#EC4899" />
          <Text style={styles.statValue}>{stats?.total_stories || 0}</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'users' && styles.tabActive]}
          onPress={() => setSelectedTab('users')}
        >
          <Text style={[styles.tabText, selectedTab === 'users' && styles.tabTextActive]}>All Users</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'stories' && styles.tabActive]}
          onPress={() => setSelectedTab('stories')}
        >
          <Text style={[styles.tabText, selectedTab === 'stories' && styles.tabTextActive]}>Pending Stories</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'users' && (
          <View>
            {users.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-group" size={64} color="#9CA3AF" />
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              users.map((u) => {
                const badge = getRoleBadge(u.role);
                return (
                  <View key={u.id} style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <View style={styles.userAvatar}>
                        <MaterialCommunityIcons name="account" size={24} color="#9CA3AF" />
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>{u.name || 'Unknown'}</Text>
                        <Text style={styles.userEmail}>{u.email}</Text>
                        <Text style={styles.userDate}>Joined {formatDate(u.created_at)}</Text>
                      </View>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.roleText, { color: badge.color }]}>{u.role}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {selectedTab === 'stories' && (
          <View>
            {pendingStories.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="check-circle" size={64} color="#14B8A6" />
                <Text style={styles.emptyText}>No pending stories</Text>
                <Text style={styles.emptySubtext}>All stories have been reviewed</Text>
              </View>
            ) : (
              pendingStories.map((story) => (
                <View key={story.id} style={styles.storyCard}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text style={styles.storyCreator}>by {story.creator_name}</Text>
                  <Text style={styles.storyFormat}>{story.format?.toUpperCase()}</Text>
                </View>
              ))
            )}
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
    minWidth: 110,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
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
  userCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  storyCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 16,
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
});
