import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';
import api from '@/services/api';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

interface Post {
  id: string;
  content: string;
  mood?: string;
  author_id: string;
  author_name: string;
  author_picture?: string;
  likes: number;
  liked_by: string[];
  created_at: string;
}

interface CircleDetail {
  id: string;
  name: string;
  description: string;
  intention: string;
  member_count: number;
  post_count: number;
  is_member: boolean;
  posts: Post[];
}

const MOOD_COLORS: { [key: string]: string } = {
  peaceful: '#86EFAC',
  grateful: '#FBBF24',
  hopeful: '#7DD3FC',
  joyful: '#F472B6',
  reflective: '#A78BFA',
  anxious: '#FB923C',
};

export default function CircleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [circle, setCircle] = useState<CircleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (id) loadCircle();
  }, [id]);

  const loadCircle = async () => {
    try {
      const response = await api.get(`/circles/${id}`);
      setCircle(response.data);
    } catch (error) {
      console.error('Error loading circle:', error);
      Alert.alert('Error', 'Failed to load circle');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to join circles', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth') }
      ]);
      return;
    }

    setJoining(true);
    try {
      await api.post(`/circles/${id}/join`);
      loadCircle();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to join circle');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    Alert.alert('Leave Circle', 'Are you sure you want to leave this circle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/circles/${id}/leave`);
            loadCircle();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to leave circle');
          }
        }
      }
    ]);
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    setPosting(true);
    try {
      await api.post(`/circles/${id}/posts`, {
        content: newPost,
        mood: selectedMood
      });
      setNewPost('');
      setSelectedMood(null);
      loadCircle();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to like posts');
      return;
    }

    try {
      await api.post(`/circles/${id}/posts/${postId}/like`);
      loadCircle();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
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

  if (!circle) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ConsciousHeader showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Circle not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ConsciousHeader showBack />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCircle(); }} />
          }
        >
          {/* Circle Header */}
          <LinearGradient
            colors={[ARIOME_COLORS.consciousness.tealDark, ARIOME_COLORS.background.deep]}
            style={styles.header}
          >
            <Text style={styles.circleName}>{circle.name}</Text>
            <Text style={styles.circleDescription}>{circle.description}</Text>
            
            <View style={styles.stats}>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="account-group" size={20} color={ARIOME_COLORS.consciousness.teal} />
                <Text style={styles.statValue}>{circle.member_count}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="message-text" size={20} color={ARIOME_COLORS.accent.lavender} />
                <Text style={styles.statValue}>{circle.post_count}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
            </View>

            {/* Join/Leave Button */}
            {circle.is_member ? (
              <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
                <Text style={styles.leaveButtonText}>Leave Circle</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.joinButton} 
                onPress={handleJoin}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.joinButtonText}>Join Circle</Text>
                )}
              </TouchableOpacity>
            )}
          </LinearGradient>

          {/* Post Composer (only for members) */}
          {circle.is_member && (
            <View style={styles.composer}>
              <TextInput
                style={styles.composerInput}
                placeholder="Share a reflection with the circle..."
                placeholderTextColor={ARIOME_COLORS.text.subtle}
                value={newPost}
                onChangeText={setNewPost}
                multiline
                maxLength={500}
              />
              
              {/* Mood Selector */}
              <View style={styles.moodSelector}>
                <Text style={styles.moodLabel}>How are you feeling?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                    <TouchableOpacity
                      key={mood}
                      style={[
                        styles.moodChip,
                        selectedMood === mood && { backgroundColor: color + '30', borderColor: color }
                      ]}
                      onPress={() => setSelectedMood(selectedMood === mood ? null : mood)}
                    >
                      <Text style={[styles.moodChipText, selectedMood === mood && { color }]}>
                        {mood}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <TouchableOpacity
                style={[styles.postButton, !newPost.trim() && styles.postButtonDisabled]}
                onPress={handlePost}
                disabled={!newPost.trim() || posting}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.postButtonText}>Share</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Posts Feed */}
          <View style={styles.posts}>
            <Text style={styles.postsTitle}>Circle Reflections</Text>
            
            {circle.posts.length === 0 ? (
              <View style={styles.emptyPosts}>
                <MaterialCommunityIcons name="message-outline" size={48} color={ARIOME_COLORS.text.subtle} />
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>Be the first to share a reflection</Text>
              </View>
            ) : (
              circle.posts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.authorInfo}>
                      {post.author_picture ? (
                        <Image source={{ uri: post.author_picture }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <MaterialCommunityIcons name="account" size={20} color={ARIOME_COLORS.text.muted} />
                        </View>
                      )}
                      <View>
                        <Text style={styles.authorName}>{post.author_name}</Text>
                        <Text style={styles.postTime}>{formatDate(post.created_at)}</Text>
                      </View>
                    </View>
                    {post.mood && (
                      <View style={[styles.postMood, { backgroundColor: (MOOD_COLORS[post.mood] || ARIOME_COLORS.consciousness.teal) + '30' }]}>
                        <Text style={[styles.postMoodText, { color: MOOD_COLORS[post.mood] || ARIOME_COLORS.consciousness.teal }]}>
                          {post.mood}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.postContent}>{post.content}</Text>
                  
                  <View style={styles.postFooter}>
                    <TouchableOpacity 
                      style={styles.likeButton}
                      onPress={() => handleLike(post.id)}
                    >
                      <MaterialCommunityIcons 
                        name={post.liked_by?.includes(user?.user_id || '') ? 'heart' : 'heart-outline'} 
                        size={20} 
                        color={post.liked_by?.includes(user?.user_id || '') ? ARIOME_COLORS.accent.rose : ARIOME_COLORS.text.muted} 
                      />
                      <Text style={styles.likeCount}>{post.likes}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: ARIOME_COLORS.text.muted,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: ARIOME_SPACING.xl,
  },
  circleName: {
    fontSize: 28,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.sm,
  },
  circleDescription: {
    fontSize: 15,
    color: ARIOME_COLORS.text.muted,
    lineHeight: 22,
  },
  stats: {
    flexDirection: 'row',
    marginTop: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.xl,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  statLabel: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
  },
  joinButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    alignItems: 'center',
    marginTop: ARIOME_SPACING.lg,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ARIOME_COLORS.semantic.error,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    alignItems: 'center',
    marginTop: ARIOME_SPACING.lg,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.semantic.error,
  },
  composer: {
    backgroundColor: ARIOME_COLORS.background.card,
    margin: ARIOME_SPACING.lg,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
  },
  composerInput: {
    backgroundColor: ARIOME_COLORS.background.deep,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    fontSize: 15,
    color: ARIOME_COLORS.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  moodSelector: {
    marginTop: ARIOME_SPACING.md,
  },
  moodLabel: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
    marginBottom: ARIOME_SPACING.sm,
  },
  moodChip: {
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.xs,
    borderRadius: ARIOME_BORDERS.radiusRound,
    backgroundColor: ARIOME_COLORS.background.elevated,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: ARIOME_SPACING.sm,
  },
  moodChipText: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
    textTransform: 'capitalize',
  },
  postButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    alignItems: 'center',
    marginTop: ARIOME_SPACING.md,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  posts: {
    padding: ARIOME_SPACING.lg,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.md,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  emptyText: {
    fontSize: 16,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: ARIOME_COLORS.text.subtle,
    marginTop: 4,
  },
  postCard: {
    backgroundColor: ARIOME_COLORS.background.card,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ARIOME_SPACING.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ARIOME_COLORS.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  postTime: {
    fontSize: 12,
    color: ARIOME_COLORS.text.subtle,
  },
  postMood: {
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 2,
    borderRadius: ARIOME_BORDERS.radiusSmall,
  },
  postMoodText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  postContent: {
    fontSize: 15,
    color: ARIOME_COLORS.text.secondary,
    lineHeight: 22,
  },
  postFooter: {
    flexDirection: 'row',
    marginTop: ARIOME_SPACING.md,
    paddingTop: ARIOME_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: ARIOME_COLORS.background.elevated,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
  },
});
