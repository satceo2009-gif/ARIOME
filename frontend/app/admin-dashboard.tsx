import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';
import api from '@/services/api';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

interface AdminStats {
  total_users: number;
  total_reflections: number;
  total_wisdom: number;
  total_practices: number;
  total_circles: number;
  users_by_role: { [key: string]: number };
  weekly_stats: { new_users: number; new_reflections: number };
}

interface User {
  user_id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface PendingContent {
  id: string;
  title: string;
  body: string;
  creator_name: string;
  created_at: string;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingContent, setPendingContent] = useState<{ wisdom: PendingContent[]; practices: PendingContent[] }>({ wisdom: [], practices: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'Admin access required.');
      router.back();
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, contentRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/content/pending'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setPendingContent(contentRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      Alert.alert('Success', 'User role updated');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update role');
    }
  };

  const handleApprove = async (contentId: string) => {
    try {
      await api.put(`/admin/content/${contentId}/approve`);
      Alert.alert('Success', 'Content approved');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve content');
    }
  };

  const handleReject = async (contentId: string) => {
    Alert.prompt('Rejection Reason', 'Why is this content being rejected?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        onPress: async (reason) => {
          try {
            await api.put(`/admin/content/${contentId}/reject`, { reason });
            Alert.alert('Success', 'Content rejected');
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to reject content');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ConsciousHeader showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
        </View>
      </SafeAreaView>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ConsciousHeader showBack />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Platform management</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['overview', 'users', 'content'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <View style={styles.content}>
            <View style={styles.statsGrid}>
              <StatCard icon="account-group" value={stats.total_users} label="Total Users" color={ARIOME_COLORS.consciousness.teal} />
              <StatCard icon="thought-bubble" value={stats.total_reflections} label="Reflections" color={ARIOME_COLORS.accent.purple} />
              <StatCard icon="book-open-page-variant" value={stats.total_wisdom} label="Wisdom" color={ARIOME_COLORS.accent.amber} />
              <StatCard icon="meditation" value={stats.total_practices} label="Practices" color={ARIOME_COLORS.accent.rose} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <View style={styles.weeklyStats}>
                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyValue}>+{stats.weekly_stats.new_users}</Text>
                  <Text style={styles.weeklyLabel}>New Users</Text>
                </View>
                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyValue}>+{stats.weekly_stats.new_reflections}</Text>
                  <Text style={styles.weeklyLabel}>New Reflections</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Users by Role</Text>
              {Object.entries(stats.users_by_role).map(([role, count]) => (
                <View key={role} style={styles.roleRow}>
                  <Text style={styles.roleName}>{role}</Text>
                  <Text style={styles.roleCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <View style={styles.content}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={ARIOME_COLORS.text.subtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            {filteredUsers.map((u) => (
              <View key={u.user_id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.name || 'No Name'}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.roleBadge, { backgroundColor: getRoleColor(u.role) }]}
                  onPress={() => {
                    Alert.alert('Change Role', `Current: ${u.role}`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'User', onPress: () => handleRoleChange(u.user_id, 'user') },
                      { text: 'Creator', onPress: () => handleRoleChange(u.user_id, 'creator') },
                      { text: 'Admin', onPress: () => handleRoleChange(u.user_id, 'admin') },
                    ]);
                  }}
                >
                  <Text style={styles.roleText}>{u.role}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Pending Review</Text>
            
            {[...pendingContent.wisdom, ...pendingContent.practices].length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="check-circle" size={48} color={ARIOME_COLORS.semantic.success} />
                <Text style={styles.emptyText}>No pending content</Text>
              </View>
            ) : (
              [...pendingContent.wisdom, ...pendingContent.practices].map((item) => (
                <View key={item.id} style={styles.contentCard}>
                  <Text style={styles.contentTitle}>{item.title}</Text>
                  <Text style={styles.contentBody} numberOfLines={2}>{item.body}</Text>
                  <Text style={styles.contentMeta}>By {item.creator_name}</Text>
                  <View style={styles.contentActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApprove(item.id)}
                    >
                      <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                      <Text style={styles.actionText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(item.id)}
                    >
                      <MaterialCommunityIcons name="close" size={16} color="#FFF" />
                      <Text style={styles.actionText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return ARIOME_COLORS.semantic.error;
    case 'creator': return ARIOME_COLORS.accent.purple;
    default: return ARIOME_COLORS.consciousness.teal;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: ARIOME_SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: ARIOME_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: ARIOME_SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: ARIOME_COLORS.consciousness.teal,
  },
  tabText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
  },
  activeTabText: {
    color: ARIOME_COLORS.consciousness.teal,
    fontWeight: '600',
  },
  content: {
    padding: ARIOME_SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ARIOME_SPACING.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  section: {
    marginTop: ARIOME_SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.md,
  },
  weeklyStats: {
    flexDirection: 'row',
    gap: ARIOME_SPACING.md,
  },
  weeklyStat: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    alignItems: 'center',
  },
  weeklyValue: {
    fontSize: 24,
    fontWeight: '600',
    color: ARIOME_COLORS.semantic.success,
  },
  weeklyLabel: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    marginTop: 4,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: ARIOME_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  roleName: {
    fontSize: 14,
    color: ARIOME_COLORS.text.secondary,
    textTransform: 'capitalize',
  },
  roleCount: {
    fontSize: 14,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  searchInput: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    fontSize: 16,
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.md,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  userEmail: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  roleBadge: {
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 4,
    borderRadius: ARIOME_BORDERS.radiusSmall,
  },
  roleText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contentCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  contentBody: {
    fontSize: 14,
    color: ARIOME_COLORS.text.secondary,
    marginTop: 4,
  },
  contentMeta: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.xs,
  },
  contentActions: {
    flexDirection: 'row',
    gap: ARIOME_SPACING.sm,
    marginTop: ARIOME_SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    gap: 4,
  },
  approveButton: {
    backgroundColor: ARIOME_COLORS.semantic.success,
  },
  rejectButton: {
    backgroundColor: ARIOME_COLORS.semantic.error,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  emptyText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.sm,
  },
});
