import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';
import api from '@/services/api';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

interface CreatorStats {
  wisdom_count: number;
  practice_count: number;
  total_content: number;
  total_resonances: number;
}

interface ContentItem {
  id: string;
  title: string;
  body: string;
  status: string;
  resonance_count: number;
  created_at: string;
}

export default function CreatorDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [content, setContent] = useState<{ wisdom: ContentItem[]; practices: ContentItem[] }>({ wisdom: [], practices: [] });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'wisdom' | 'practices'>('wisdom');
  
  const [newContent, setNewContent] = useState({
    type: 'wisdom',
    title: '',
    body: '',
    author: '',
    category: '',
    duration: '',
    intent_tags: '',
  });

  useEffect(() => {
    if (user?.role !== 'creator' && user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You need creator access to view this page.');
      router.back();
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [statsRes, contentRes] = await Promise.all([
        api.get('/creator/stats'),
        api.get('/creator/content'),
      ]);
      setStats(statsRes.data);
      setContent(contentRes.data);
    } catch (error) {
      console.error('Error loading creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newContent.title.trim() || !newContent.body.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    setCreating(true);
    try {
      await api.post('/creator/content', {
        type: newContent.type,
        title: newContent.title,
        body: newContent.body,
        author: newContent.author || undefined,
        category: newContent.category || undefined,
        duration: newContent.duration ? parseInt(newContent.duration) : undefined,
        intent_tags: newContent.intent_tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      
      Alert.alert('Success', 'Content created and submitted for review');
      setShowCreateModal(false);
      setNewContent({ type: 'wisdom', title: '', body: '', author: '', category: '', duration: '', intent_tags: '' });
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create content');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    Alert.alert('Delete Content', 'Are you sure you want to delete this content?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/creator/content/${contentId}`);
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete content');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ConsciousHeader showBack />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Creator Dashboard</Text>
          <Text style={styles.subtitle}>Manage your content</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={ARIOME_COLORS.consciousness.teal} />
            <Text style={styles.statValue}>{stats?.wisdom_count || 0}</Text>
            <Text style={styles.statLabel}>Wisdom</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="meditation" size={24} color={ARIOME_COLORS.accent.purple} />
            <Text style={styles.statValue}>{stats?.practice_count || 0}</Text>
            <Text style={styles.statLabel}>Practices</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="heart" size={24} color={ARIOME_COLORS.accent.rose} />
            <Text style={styles.statValue}>{stats?.total_resonances || 0}</Text>
            <Text style={styles.statLabel}>Resonances</Text>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
          <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
          <Text style={styles.createButtonText}>Create New Content</Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'wisdom' && styles.activeTab]}
            onPress={() => setActiveTab('wisdom')}
          >
            <Text style={[styles.tabText, activeTab === 'wisdom' && styles.activeTabText]}>Wisdom</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'practices' && styles.activeTab]}
            onPress={() => setActiveTab('practices')}
          >
            <Text style={[styles.tabText, activeTab === 'practices' && styles.activeTabText]}>Practices</Text>
          </TouchableOpacity>
        </View>

        {/* Content List */}
        <View style={styles.contentList}>
          {(activeTab === 'wisdom' ? content.wisdom : content.practices).map((item) => (
            <View key={item.id} style={styles.contentCard}>
              <View style={styles.contentHeader}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.contentBody} numberOfLines={2}>{item.body}</Text>
              <View style={styles.contentFooter}>
                <View style={styles.resonanceInfo}>
                  <MaterialCommunityIcons name="heart-outline" size={16} color={ARIOME_COLORS.text.muted} />
                  <Text style={styles.resonanceCount}>{item.resonance_count}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <MaterialCommunityIcons name="delete-outline" size={20} color={ARIOME_COLORS.semantic.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {(activeTab === 'wisdom' ? content.wisdom : content.practices).length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color={ARIOME_COLORS.text.subtle} />
              <Text style={styles.emptyText}>No {activeTab} content yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Content</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={ARIOME_COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Content Type */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, newContent.type === 'wisdom' && styles.activeType]}
                  onPress={() => setNewContent(prev => ({ ...prev, type: 'wisdom' }))}
                >
                  <Text style={[styles.typeText, newContent.type === 'wisdom' && styles.activeTypeText]}>Wisdom</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, newContent.type === 'practice' && styles.activeType]}
                  onPress={() => setNewContent(prev => ({ ...prev, type: 'practice' }))}
                >
                  <Text style={[styles.typeText, newContent.type === 'practice' && styles.activeTypeText]}>Practice</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor={ARIOME_COLORS.text.subtle}
                value={newContent.title}
                onChangeText={(text) => setNewContent(prev => ({ ...prev, title: text }))}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Content"
                placeholderTextColor={ARIOME_COLORS.text.subtle}
                value={newContent.body}
                onChangeText={(text) => setNewContent(prev => ({ ...prev, body: text }))}
                multiline
                numberOfLines={4}
              />

              {newContent.type === 'wisdom' && (
                <TextInput
                  style={styles.input}
                  placeholder="Author (optional)"
                  placeholderTextColor={ARIOME_COLORS.text.subtle}
                  value={newContent.author}
                  onChangeText={(text) => setNewContent(prev => ({ ...prev, author: text }))}
                />
              )}

              {newContent.type === 'practice' && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Category (e.g., Breathwork, Stillness)"
                    placeholderTextColor={ARIOME_COLORS.text.subtle}
                    value={newContent.category}
                    onChangeText={(text) => setNewContent(prev => ({ ...prev, category: text }))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Duration (minutes)"
                    placeholderTextColor={ARIOME_COLORS.text.subtle}
                    value={newContent.duration}
                    onChangeText={(text) => setNewContent(prev => ({ ...prev, duration: text }))}
                    keyboardType="numeric"
                  />
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder="Tags (comma-separated)"
                placeholderTextColor={ARIOME_COLORS.text.subtle}
                value={newContent.intent_tags}
                onChangeText={(text) => setNewContent(prev => ({ ...prev, intent_tags: text }))}
              />

              <TouchableOpacity
                style={[styles.submitButton, creating && styles.disabledButton]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit for Review</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return ARIOME_COLORS.semantic.success;
    case 'rejected': return ARIOME_COLORS.semantic.error;
    default: return ARIOME_COLORS.accent.amber;
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
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.sm,
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
    marginTop: ARIOME_SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    marginHorizontal: ARIOME_SPACING.lg,
    marginVertical: ARIOME_SPACING.lg,
    padding: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    gap: ARIOME_SPACING.xs,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: ARIOME_SPACING.sm,
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
  contentList: {
    padding: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.md,
  },
  contentCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.sm,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 2,
    borderRadius: ARIOME_BORDERS.radiusSmall,
  },
  statusText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contentBody: {
    fontSize: 14,
    color: ARIOME_COLORS.text.secondary,
    lineHeight: 20,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ARIOME_SPACING.sm,
    paddingTop: ARIOME_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  resonanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resonanceCount: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderTopLeftRadius: ARIOME_BORDERS.radiusLarge,
    borderTopRightRadius: ARIOME_BORDERS.radiusLarge,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ARIOME_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  modalForm: {
    padding: ARIOME_SPACING.lg,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: ARIOME_SPACING.sm,
    alignItems: 'center',
    borderRadius: ARIOME_BORDERS.radiusMedium,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  activeType: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
  },
  typeText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
  },
  activeTypeText: {
    color: '#FFF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: ARIOME_COLORS.background.deep,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    fontSize: 16,
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.md,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    padding: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    alignItems: 'center',
    marginTop: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.xl,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
