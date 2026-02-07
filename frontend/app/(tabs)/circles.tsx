import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { INTENTIONS } from '@/constants/intentions';
import { circlesAPI } from '@/services/api';
import ConsciousHeader from '@/components/ConsciousHeader';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/ariomeTheme';

export default function CirclesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCircle, setNewCircle] = useState({ name: '', description: '', intention: '' });
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Role-based permissions - all authenticated users can join circles
  const canCreateCircle = !!user; // Any authenticated user can create circles
  const canJoinCircle = !!user;   // Any authenticated user can join circles

  const loadCircles = useCallback(async () => {
    try {
      // Use public endpoint for explorers or unauthenticated users
      // Use authenticated endpoint for subscribers/creators/admins
      const data = await circlesAPI.getAll(selectedIntention || undefined);
      setCircles(data || []);
    } catch (error) {
      console.error('Error loading circles:', error);
      // Try public endpoint as fallback
      try {
        const response = await fetch(
          `https://peaceful-living-5.preview.emergentagent.com/api/circles/public${selectedIntention ? `?intention=${selectedIntention}` : ''}`
        );
        const publicData = await response.json();
        setCircles(publicData || []);
      } catch (e) {
        setCircles([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedIntention]);

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
        <ConsciousHeader />

        {/* Guest notice */}
        <View style={styles.explorerNotice}>
          <MaterialCommunityIcons name="information" size={18} color={ARIOME_COLORS.accent.amber} />
          <Text style={styles.explorerNoticeText}>
            Sign up to join circles and connect with the community!
          </Text>
        </View>

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
              <Text style={[styles.filterText, selectedIntention === intention.id && styles.filterTextActive]}>
                {intention.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Circles List (view only) */}
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
                <Text style={styles.emptySubtext}>Check back soon for new circles!</Text>
              </View>
            ) : (
              circles.map((circle) => (
                <TouchableOpacity 
                  key={circle.id} 
                  style={styles.circleCard}
                  onPress={() => router.push(`/circle/${circle.id}`)}
                  activeOpacity={0.8}
                  data-testid={`circle-card-${circle.id}`}
                >
                  <View style={styles.circleHeader}>
                    <View style={[styles.circleIcon, { backgroundColor: `${getIntentionColor(circle.intention)}20` }]}>
                      <MaterialCommunityIcons name="account-group" size={32} color={getIntentionColor(circle.intention)} />
                    </View>
                    <View style={styles.circleInfo}>
                      <Text style={styles.circleName}>{circle.name}</Text>
                      <Text style={styles.circleCreator}>by {circle.creator_name}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={ARIOME_COLORS.text.muted} />
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
                    
                    <View style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Create Button */}
      <ConsciousHeader 
        rightComponent={canCreateCircle ? (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateButtonPress}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        ) : undefined}
      />

      {/* Explorer notice */}
      {!user && (
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
    backgroundColor: `${ARIOME_COLORS.accent.amber}15`,
    marginHorizontal: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    gap: ARIOME_SPACING.sm,
  },
  explorerNoticeText: {
    color: ARIOME_COLORS.accent.amber,
    fontSize: 12,
    flex: 1,
  },
  filterContainer: {
    marginBottom: ARIOME_SPACING.md,
  },
  filterContent: {
    paddingHorizontal: ARIOME_SPACING.md,
    gap: ARIOME_SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusRound,
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: ARIOME_SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    borderColor: ARIOME_COLORS.consciousness.teal,
  },
  filterText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
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
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.md,
    fontSize: 14,
  },
  circlesContainer: {
    flex: 1,
    paddingHorizontal: ARIOME_SPACING.md,
  },
  circleCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
  },
  circleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.md,
  },
  circleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ARIOME_SPACING.md,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: 17,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: 4,
  },
  circleCreator: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  circleDescription: {
    fontSize: 14,
    color: ARIOME_COLORS.text.secondary,
    marginBottom: ARIOME_SPACING.md,
    lineHeight: 20,
  },
  intentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.md,
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
    gap: ARIOME_SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  joinButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusRound,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  joinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ARIOME_COLORS.consciousness.teal,
  },
  viewOnlyButton: {
    backgroundColor: ARIOME_COLORS.background.elevated,
    borderWidth: 0,
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: ARIOME_COLORS.consciousness.teal,
    fontSize: 14,
    fontWeight: '600',
  },
  viewOnlyButtonText: {
    color: ARIOME_COLORS.text.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusRound,
  },
  viewButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.lg,
    textAlign: 'center',
  },
  createCircleButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
  },
  createCircleButtonText: {
    color: '#FFF',
    fontSize: 16,
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
    maxHeight: '80%',
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
    height: 100,
    textAlignVertical: 'top',
  },
  inputLabel: {
    color: ARIOME_COLORS.text.muted,
    fontSize: 14,
    marginBottom: ARIOME_SPACING.md,
  },
  intentionSelector: {
    marginBottom: ARIOME_SPACING.lg,
  },
  intentionChip: {
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusRound,
    backgroundColor: ARIOME_COLORS.background.primary,
    marginRight: ARIOME_SPACING.sm,
  },
  intentionChipText: {
    color: ARIOME_COLORS.text.muted,
    fontSize: 14,
  },
  createModalButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    alignItems: 'center',
  },
  createModalButtonDisabled: {
    opacity: 0.6,
  },
  createModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
