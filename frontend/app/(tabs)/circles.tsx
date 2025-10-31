import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { INTENTIONS } from '@/constants/intentions';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://wellness-hub-227.preview.emergentagent.com/api';

export default function CirclesScreen() {
  const { token, user } = useAuth();
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      Alert.alert('Please Login', 'Login to join circles');
      return;
    }
    loadCircles();
  }, [selectedIntention]);

  const loadCircles = async () => {
    try {
      const params = selectedIntention ? { intention: selectedIntention } : {};
      const response = await axios.get(`${API_URL}/circles`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setCircles(response.data);
    } catch (error) {
      console.error('Error loading circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async (circleId: string) => {
    try {
      await axios.post(
        `${API_URL}/circles/${circleId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Joined circle');
      loadCircles();
    } catch (error) {
      Alert.alert('Error', 'Failed to join circle');
    }
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
              selectedIntention === intention.id && styles.filterChipActive
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
        </View>
      ) : (
        <ScrollView style={styles.circlesContainer}>
          {circles.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No circles found</Text>
              <Text style={styles.emptySubtext}>Be the first to create one!</Text>
            </View>
          ) : (
            circles.map((circle) => (
              <View key={circle.id} style={styles.circleCard}>
                <View style={styles.circleHeader}>
                  <View style={styles.circleIcon}>
                    <MaterialCommunityIcons name="account-group" size={32} color="#14B8A6" />
                  </View>
                  <View style={styles.circleInfo}>
                    <Text style={styles.circleName}>{circle.name}</Text>
                    <Text style={styles.circleCreator}>by {circle.creator_name}</Text>
                  </View>
                </View>
                
                <Text style={styles.circleDescription}>{circle.description}</Text>
                
                <View style={styles.circleFooter}>
                  <View style={styles.circleStats}>
                    <Text style={styles.statText}>
                      <MaterialCommunityIcons name="account" size={14} /> {circle.member_count} members
                    </Text>
                    <Text style={styles.statText}>
                      <MaterialCommunityIcons name="post" size={14} /> {circle.post_count} posts
                    </Text>
                  </View>
                  
                  {circle.is_member ? (
                    <TouchableOpacity style={[styles.joinButton, styles.joinedButton]}>
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
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
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
    marginBottom: 16,
    lineHeight: 20,
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
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  joinButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
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
  },
});
