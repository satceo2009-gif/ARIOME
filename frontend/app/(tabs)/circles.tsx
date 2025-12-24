import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { INTENTIONS } from '@/constants/intentions';
import { circlesAPI } from '@/services/api';
import AriomeLogo from '@/components/AriomeLogo';

export default function CirclesScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCircle, setNewCircle] = useState({ name: '', description: '', intention: '' });
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Role-based permissions
  const userRole = user?.role || 'explorer';
  const canCreateCircle = ['subscriber', 'creator', 'admin'].includes(userRole);
  const canJoinCircle = ['subscriber', 'creator', 'admin'].includes(userRole);

  const loadCircles = useCallback(async () => {
    try {
      if (token) {
        const data = await circlesAPI.getAll(selectedIntention || undefined);
        setCircles(data || []);
      } else {
        setCircles([]);
      }
    } catch (error) {
      console.error('Error loading circles:', error);
      setCircles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, selectedIntention]);

  useEffect(() => {
    loadCircles();
  }, [loadCircles]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCircles();
  };

  const handleJoinCircle = async (circleId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join circles');
      return;
    }
    
    if (!canJoinCircle) {
      Alert.alert(
        'Upgrade Required', 
        'Subscribe to ARIOME to join circles and connect with the community.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Subscribe', onPress: () => router.push('/auth') }
        ]
      );
      return;
    }
    
    setJoiningId(circleId);
    try {
      await circlesAPI.join(circleId);
      Alert.alert('Success', 'You have joined the circle!');
      loadCircles();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to join circle');
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeaveCircle = async (circleId: string) => {
    setJoiningId(circleId);
    try {
      await circlesAPI.leave(circleId);
      loadCircles();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to leave circle');
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateCircle = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to create circles');
      return;
    }

    if (!canCreateCircle) {
      Alert.alert(
        'Upgrade Required', 
        'Subscribe to ARIOME to create your own circles.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Subscribe', onPress: () => router.push('/auth') }
        ]
      );
      return;
    }

    if (!newCircle.name.trim() || !newCircle.description.trim() || !newCircle.intention) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setCreating(true);
    try {
      await circlesAPI.create({
        name: newCircle.name.trim(),
        description: newCircle.description.trim(),
        intention: newCircle.intention,
        is_private: false
      });
      Alert.alert('Success', 'Circle created successfully!');
      setNewCircle({ name: '', description: '', intention: '' });
      setShowCreateModal(false);
      loadCircles();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create circle');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateButtonPress = () => {
    if (!canCreateCircle) {
      Alert.alert(
        'Upgrade Required', 
        'Subscribe to ARIOME to create your own circles and build community.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Subscribe', onPress: () => router.push('/auth') }
        ]
      );
      return;
    }
    setShowCreateModal(true);
  };

  const getIntentionColor = (intention: string) => {
    const colors: any = {
      healing: '#EC4899',
      growth: '#10B981',
      love: '#F472B6',
      gratitude: '#F59E0B',
      resilience: '#8B5CF6',
      mindfulness: '#14B8A6',
      joy: '#FBBF24',
    };
    return colors[intention] || '#14B8A6';
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
            <AriomeLogo width={100} height={42} />
          </TouchableOpacity>
          <Text style={styles.title}>Community Circles</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group" size={64} color="#6B7280" />
          <Text style={styles.emptyText}>Login to access circles</Text>
          <Text style={styles.emptySubtext}>Join communities that resonate with your journey</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
          <AriomeLogo width={100} height={42} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Circles</Text>
        {canCreateCircle ? (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateButtonPress}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      {/* Explorer notice */}
      {userRole === 'explorer' && (
        <View style={styles.explorerNotice}>
          <MaterialCommunityIcons name="information" size={18} color="#F59E0B" />
          <Text style={styles.explorerNoticeText}>
            Explorers can view circles. Subscribe to join & create!
          </Text>
        </View>
      )}

      {/* Intention Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedIntention && styles.filterChipActive]}
          onPress={() => setSelectedIntention(null)}
        >
          <Text style={[styles.filterText, !selectedIntention && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {INTENTIONS.map((intention) => (
          <TouchableOpacity
            key={intention.id}
            style={[
              styles.filterChip,
              selectedIntention === intention.id && styles.filterChipActive,
              selectedIntention === intention.id && { backgroundColor: getIntentionColor(intention.id) }
            ]}
            onPress={() => setSelectedIntention(intention.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedIntention === intention.id && styles.filterTextActive
              ]}
            >
              {intention.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Circles List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading circles...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.circlesContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
          }
        >
          {circles.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No circles found</Text>
              <Text style={styles.emptySubtext}>
                {canCreateCircle ? 'Be the first to create one!' : 'Check back soon for new circles!'}
              </Text>
              {canCreateCircle && (
                <TouchableOpacity 
                  style={styles.createCircleButton}
                  onPress={handleCreateButtonPress}
                >
                  <Text style={styles.createCircleButtonText}>Create Circle</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            circles.map((circle) => (
              <View key={circle.id} style={styles.circleCard}>
                <View style={styles.circleHeader}>
                  <View style={[styles.circleIcon, { backgroundColor: `${getIntentionColor(circle.intention)}20` }]}>
                    <MaterialCommunityIcons name="account-group" size={32} color={getIntentionColor(circle.intention)} />
                  </View>
                  <View style={styles.circleInfo}>
                    <Text style={styles.circleName}>{circle.name}</Text>
                    <Text style={styles.circleCreator}>by {circle.creator_name}</Text>
                  </View>
                </View>
                
                <Text style={styles.circleDescription}>{circle.description}</Text>
                
                <View style={styles.intentionBadge}>
                  <View style={[styles.intentionDot, { backgroundColor: getIntentionColor(circle.intention) }]} />
                  <Text style={[styles.intentionText, { color: getIntentionColor(circle.intention) }]}>
                    {circle.intention}
                  </Text>
                </View>
                
                <View style={styles.circleFooter}>
                  <View style={styles.circleStats}>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="account-multiple" size={16} color="#9CA3AF" />
                      <Text style={styles.statText}>{circle.member_count} members</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="message-text" size={16} color="#9CA3AF" />
                      <Text style={styles.statText}>{circle.post_count} posts</Text>
                    </View>
                  </View>
                  
                  {joiningId === circle.id ? (
                    <View style={[styles.joinButton, styles.joinedButton]}>
                      <ActivityIndicator size="small" color="#14B8A6" />
                    </View>
                  ) : circle.is_member ? (
                    <TouchableOpacity 
                      style={[styles.joinButton, styles.joinedButton]}
                      onPress={() => handleLeaveCircle(circle.id)}
                    >
                      <MaterialCommunityIcons name="check" size={16} color="#14B8A6" />
                      <Text style={styles.joinedButtonText}>Joined</Text>
                    </TouchableOpacity>
                  ) : canJoinCircle ? (
                    <TouchableOpacity 
                      style={styles.joinButton}
                      onPress={() => handleJoinCircle(circle.id)}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.joinButton, styles.viewOnlyButton]}
                      onPress={() => handleJoinCircle(circle.id)}
                    >
                      <MaterialCommunityIcons name="lock" size={14} color="#9CA3AF" />
                      <Text style={styles.viewOnlyButtonText}>View</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* Create Circle Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Circle</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Circle Name"
              placeholderTextColor="#6B7280"
              value={newCircle.name}
              onChangeText={(text) => setNewCircle(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description - What is this circle about?"
              placeholderTextColor="#6B7280"
              value={newCircle.description}
              onChangeText={(text) => setNewCircle(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <Text style={styles.inputLabel}>Select Intention</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.intentionSelector}>
              {INTENTIONS.map((intention) => (
                <TouchableOpacity
                  key={intention.id}
                  style={[
                    styles.intentionChip,
                    newCircle.intention === intention.id && { backgroundColor: getIntentionColor(intention.id) }
                  ]}
                  onPress={() => setNewCircle(prev => ({ ...prev, intention: intention.id }))}
                >
                  <Text style={[
                    styles.intentionChipText,
                    newCircle.intention === intention.id && { color: '#FFF' }
                  ]}>
                    {intention.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.createModalButton, creating && styles.createModalButtonDisabled]}
              onPress={handleCreateCircle}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.createModalButtonText}>Create Circle</Text>
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
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
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
  explorerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#78350F',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  explorerNoticeText: {
    color: '#FDE68A',
    fontSize: 12,
    flex: 1,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  filterText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 14,
  },
  circlesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  circleCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  circleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  circleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  circleCreator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  circleDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 12,
    lineHeight: 20,
  },
  intentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  intentionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  intentionText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  circleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  joinButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  joinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  viewOnlyButton: {
    backgroundColor: '#374151',
    borderWidth: 0,
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  viewOnlyButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
    textAlign: 'center',
  },
  createCircleButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createCircleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  intentionSelector: {
    marginBottom: 24,
  },
  intentionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    marginRight: 8,
  },
  intentionChipText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  createModalButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createModalButtonDisabled: {
    opacity: 0.7,
  },
  createModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
