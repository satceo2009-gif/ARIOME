import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { INTENTIONS } from '@/constants/intentions';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://mind-wellness-70.preview.emergentagent.com/api';

// Default circles data when API fails or no auth
const DEFAULT_CIRCLES = [
  {
    id: 'default-1',
    name: 'Healing Hearts',
    description: 'A supportive community for those on their healing journey. Share your experiences and find comfort in others who understand.',
    intention: 'healing',
    creator_name: 'ARIOME',
    member_count: 156,
    post_count: 42,
    is_member: false
  },
  {
    id: 'default-2',
    name: 'Mindful Moments',
    description: 'Daily mindfulness practices and meditation discussions. Learn techniques to stay present and find inner peace.',
    intention: 'mindfulness',
    creator_name: 'ARIOME',
    member_count: 234,
    post_count: 89,
    is_member: false
  },
  {
    id: 'default-3',
    name: 'Growth Seekers',
    description: 'For those committed to personal development. Share goals, celebrate wins, and support each other\'s growth.',
    intention: 'growth',
    creator_name: 'ARIOME',
    member_count: 189,
    post_count: 67,
    is_member: false
  },
  {
    id: 'default-4',
    name: 'Gratitude Circle',
    description: 'A space to share what you\'re grateful for. Cultivate appreciation and positivity together.',
    intention: 'gratitude',
    creator_name: 'ARIOME',
    member_count: 312,
    post_count: 156,
    is_member: false
  },
  {
    id: 'default-5',
    name: 'Love & Connection',
    description: 'Explore themes of love, relationships, and human connection. Build meaningful bonds with like-minded souls.',
    intention: 'love',
    creator_name: 'ARIOME',
    member_count: 145,
    post_count: 38,
    is_member: false
  },
  {
    id: 'default-6',
    name: 'Resilience Warriors',
    description: 'Building strength through adversity. Share stories of overcoming challenges and inspire others.',
    intention: 'resilience',
    creator_name: 'ARIOME',
    member_count: 98,
    post_count: 29,
    is_member: false
  },
];

export default function CirclesScreen() {
  const { token, user } = useAuth();
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCircle, setNewCircle] = useState({ name: '', description: '', intention: '' });

  useEffect(() => {
    loadCircles();
  }, [selectedIntention]);

  const loadCircles = async () => {
    setLoading(true);
    try {
      if (token) {
        const params = selectedIntention ? { intention: selectedIntention } : {};
        const response = await axios.get(`${API_URL}/circles`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        if (response.data && response.data.length > 0) {
          setCircles(response.data);
        } else {
          // Use default circles if API returns empty
          setCircles(filterCircles(DEFAULT_CIRCLES));
        }
      } else {
        // No auth - use default circles
        setCircles(filterCircles(DEFAULT_CIRCLES));
      }
    } catch (error) {
      console.error('Error loading circles:', error);
      // Fallback to default circles on error
      setCircles(filterCircles(DEFAULT_CIRCLES));
    } finally {
      setLoading(false);
    }
  };

  const filterCircles = (circleList: any[]) => {
    if (!selectedIntention) return circleList;
    return circleList.filter(c => c.intention === selectedIntention);
  };

  const handleJoinCircle = async (circleId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join circles');
      return;
    }
    
    try {
      if (circleId.startsWith('default-')) {
        // For default circles, just update local state
        setCircles(prev => prev.map(c => 
          c.id === circleId ? { ...c, is_member: true, member_count: c.member_count + 1 } : c
        ));
        Alert.alert('Success', 'You have joined the circle!');
      } else {
        await axios.post(
          `${API_URL}/circles/${circleId}/join`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert('Success', 'Joined circle');
        loadCircles();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join circle');
    }
  };

  const handleLeaveCircle = async (circleId: string) => {
    if (circleId.startsWith('default-')) {
      setCircles(prev => prev.map(c => 
        c.id === circleId ? { ...c, is_member: false, member_count: Math.max(0, c.member_count - 1) } : c
      ));
    } else {
      try {
        await axios.post(
          `${API_URL}/circles/${circleId}/leave`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        loadCircles();
      } catch (error) {
        Alert.alert('Error', 'Failed to leave circle');
      }
    }
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community Circles</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
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
        <ScrollView style={styles.circlesContainer}>
          {circles.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No circles found</Text>
              <Text style={styles.emptySubtext}>Be the first to create one!</Text>
              <TouchableOpacity 
                style={styles.createCircleButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createCircleButtonText}>Create Circle</Text>
              </TouchableOpacity>
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
                  
                  {circle.is_member ? (
                    <TouchableOpacity 
                      style={[styles.joinButton, styles.joinedButton]}
                      onPress={() => handleLeaveCircle(circle.id)}
                    >
                      <MaterialCommunityIcons name="check" size={16} color="#14B8A6" />
                      <Text style={styles.joinedButtonText}>Joined</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.joinButton}
                      onPress={() => handleJoinCircle(circle.id)}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
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
              placeholder="Description"
              placeholderTextColor="#6B7280"
              value={newCircle.description}
              onChangeText={(text) => setNewCircle(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
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
              style={styles.createModalButton}
              onPress={() => {
                if (!user) {
                  Alert.alert('Login Required', 'Please login to create circles');
                  return;
                }
                Alert.alert('Coming Soon', 'Circle creation will be available soon!');
                setShowCreateModal(false);
              }}
            >
              <Text style={styles.createModalButtonText}>Create Circle</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
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
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
  },
  joinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#14B8A6',
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
  createModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
