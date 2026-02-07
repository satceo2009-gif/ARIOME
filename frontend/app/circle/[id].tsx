import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

interface Circle {
  id: string;
  name: string;
  description: string;
  intention: string;
  creator_name: string;
  member_count: number;
  post_count: number;
  is_private: boolean;
}

interface Post {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  likes: number;
  liked_by_user?: boolean;
}

const INTENTION_COLORS: Record<string, string> = {
  healing: '#10B981',
  mindfulness: '#0EA5E9',
  growth: '#8B5CF6',
  joy: '#EC4899',
  gratitude: '#F59E0B',
  resilience: '#F97316',
  love: '#F472B6',
};

export default function CircleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [circle, setCircle] = useState<Circle | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const intentionColor = circle ? (INTENTION_COLORS[circle.intention] || ARIOME_COLORS.consciousness.teal) : ARIOME_COLORS.consciousness.teal;

  const loadCircleData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load circle details
      const circleRes = await api.get(`/circles/${id}`);
      setCircle(circleRes.data);
      
      // Load posts
      const postsRes = await api.get(`/circles/${id}/posts`);
      setPosts(postsRes.data || []);
      
      // Check if user is a member
      if (user && circleRes.data.members) {
        setIsMember(circleRes.data.members.includes(user.user_id));
      }
    } catch (error) {
      console.error('Error loading circle:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadCircleData();
  }, [loadCircleData]);

  const handleJoin = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join circles.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/auth') },
      ]);
      return;
    }

    try {
      await api.post(`/circles/${id}/join`);
      setIsMember(true);
      if (circle) {
        setCircle({ ...circle, member_count: circle.member_count + 1 });
      }
    } catch (error) {
      console.error('Error joining circle:', error);
      Alert.alert('Error', 'Failed to join circle. Please try again.');
    }
  };

  const handleLeave = async () => {
    try {
      await api.delete(`/circles/${id}/join`);
      setIsMember(false);
      if (circle) {
        setCircle({ ...circle, member_count: Math.max(0, circle.member_count - 1) });
      }
    } catch (error) {
      console.error('Error leaving circle:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    if (!user) {
      Alert.alert('Login Required', 'Please login to post.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/auth') },
      ]);
      return;
    }
    if (!isMember) {
      Alert.alert('Join Required', 'Join this circle to post.');
      return;
    }

    setPosting(true);
    try {
      const res = await api.post(`/circles/${id}/posts`, { content: newPost.trim() });
      setPosts([res.data, ...posts]);
      setNewPost('');
      if (circle) {
        setCircle({ ...circle, post_count: circle.post_count + 1 });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.liked_by_user ? post.likes - 1 : post.likes + 1,
          liked_by_user: !post.liked_by_user,
        };
      }
      return post;
    }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
          <Text style={styles.loadingText}>Loading circle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!circle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={ARIOME_COLORS.text.muted} />
          <Text style={styles.errorText}>Circle not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} data-testid="back-btn">
          <MaterialCommunityIcons name="arrow-left" size={24} color={ARIOME_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{circle.name}</Text>
        <TouchableOpacity data-testid="more-btn">
          <MaterialCommunityIcons name="dots-vertical" size={24} color={ARIOME_COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Circle Info Card */}
          <LinearGradient
            colors={[intentionColor + '30', ARIOME_COLORS.background.deep]}
            style={styles.circleInfo}
          >
            <View style={[styles.intentionBadge, { backgroundColor: intentionColor + '30' }]}>
              <Text style={[styles.intentionText, { color: intentionColor }]}>
                {circle.intention}
              </Text>
            </View>
            
            <Text style={styles.circleName}>{circle.name}</Text>
            <Text style={styles.circleDescription}>{circle.description}</Text>
            
            <View style={styles.circleStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={20} color={ARIOME_COLORS.text.muted} />
                <Text style={styles.statValue}>{circle.member_count}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="message-text" size={20} color={ARIOME_COLORS.text.muted} />
                <Text style={styles.statValue}>{circle.post_count}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account" size={20} color={ARIOME_COLORS.text.muted} />
                <Text style={styles.statValue}>{circle.creator_name}</Text>
                <Text style={styles.statLabel}>Created by</Text>
              </View>
            </View>

            {/* Join/Leave Button */}
            {user && (
              <TouchableOpacity
                style={[styles.joinButton, isMember && styles.leaveButton]}
                onPress={isMember ? handleLeave : handleJoin}
                data-testid={isMember ? 'leave-btn' : 'join-btn'}
              >
                <MaterialCommunityIcons 
                  name={isMember ? 'check' : 'plus'} 
                  size={20} 
                  color={isMember ? ARIOME_COLORS.consciousness.teal : '#FFF'} 
                />
                <Text style={[styles.joinButtonText, isMember && styles.leaveButtonText]}>
                  {isMember ? 'Joined' : 'Join Circle'}
                </Text>
              </TouchableOpacity>
            )}
            
            {!user && (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.joinButtonText}>Login to Join</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>

          {/* Create Post Section */}
          {isMember && (
            <View style={styles.createPostSection}>
              <Text style={styles.sectionTitle}>Share with the circle</Text>
              <View style={styles.postInputContainer}>
                <TextInput
                  style={styles.postInput}
                  placeholder="What's on your mind?"
                  placeholderTextColor={ARIOME_COLORS.text.subtle}
                  multiline
                  value={newPost}
                  onChangeText={setNewPost}
                  data-testid="post-input"
                />
                <TouchableOpacity
                  style={[styles.postButton, !newPost.trim() && styles.postButtonDisabled]}
                  onPress={handleCreatePost}
                  disabled={posting || !newPost.trim()}
                  data-testid="submit-post-btn"
                >
                  {posting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <MaterialCommunityIcons name="send" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Posts Feed */}
          <View style={styles.postsSection}>
            <Text style={styles.sectionTitle}>Community Feed</Text>
            
            {posts.length === 0 ? (
              <View style={styles.emptyPosts}>
                <MaterialCommunityIcons name="message-text-outline" size={48} color={ARIOME_COLORS.text.subtle} />
                <Text style={styles.emptyPostsText}>No posts yet</Text>
                <Text style={styles.emptyPostsSubtext}>Be the first to share!</Text>
              </View>
            ) : (
              posts.map((post) => (
                <View key={post.id} style={styles.postCard} data-testid={`post-${post.id}`}>
                  <View style={styles.postHeader}>
                    <View style={styles.postAvatar}>
                      <Text style={styles.postAvatarText}>
                        {post.user_name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View style={styles.postMeta}>
                      <Text style={styles.postAuthor}>{post.user_name}</Text>
                      <Text style={styles.postTime}>{formatDate(post.created_at)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.postContent}>{post.content}</Text>
                  
                  <View style={styles.postActions}>
                    <TouchableOpacity 
                      style={styles.postAction}
                      onPress={() => handleLikePost(post.id)}
                    >
                      <MaterialCommunityIcons 
                        name={post.liked_by_user ? 'heart' : 'heart-outline'} 
                        size={20} 
                        color={post.liked_by_user ? ARIOME_COLORS.accent.rose : ARIOME_COLORS.text.muted} 
                      />
                      <Text style={[styles.postActionText, post.liked_by_user && { color: ARIOME_COLORS.accent.rose }]}>
                        {post.likes || 0}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.postAction}>
                      <MaterialCommunityIcons name="comment-outline" size={20} color={ARIOME_COLORS.text.muted} />
                      <Text style={styles.postActionText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 40 }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: ARIOME_COLORS.background.secondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: ARIOME_SPACING.md,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: ARIOME_SPACING.md,
    color: ARIOME_COLORS.text.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ARIOME_SPACING.xl,
  },
  errorText: {
    fontSize: 18,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.xl,
  },
  backButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingHorizontal: ARIOME_SPACING.xl,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  circleInfo: {
    padding: ARIOME_SPACING.xl,
    alignItems: 'center',
  },
  intentionBadge: {
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.xs,
    borderRadius: ARIOME_BORDERS.radiusRound,
    marginBottom: ARIOME_SPACING.md,
  },
  intentionText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  circleName: {
    fontSize: 26,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.sm,
    textAlign: 'center',
  },
  circleDescription: {
    fontSize: 15,
    color: ARIOME_COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: ARIOME_SPACING.lg,
  },
  circleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: ARIOME_COLORS.text.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingHorizontal: ARIOME_SPACING.xl,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusRound,
    gap: ARIOME_SPACING.sm,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: ARIOME_COLORS.consciousness.teal,
  },
  leaveButtonText: {
    color: ARIOME_COLORS.consciousness.teal,
  },
  createPostSection: {
    padding: ARIOME_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: ARIOME_COLORS.background.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.md,
  },
  postInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.sm,
  },
  postInput: {
    flex: 1,
    minHeight: 80,
    maxHeight: 150,
    fontSize: 15,
    color: ARIOME_COLORS.text.primary,
    padding: ARIOME_SPACING.sm,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: ARIOME_COLORS.text.disabled,
  },
  postsSection: {
    padding: ARIOME_SPACING.lg,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  emptyPostsText: {
    fontSize: 18,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.md,
  },
  emptyPostsSubtext: {
    fontSize: 14,
    color: ARIOME_COLORS.text.subtle,
    marginTop: ARIOME_SPACING.xs,
  },
  postCard: {
    backgroundColor: ARIOME_COLORS.background.card,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.md,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ARIOME_SPACING.md,
  },
  postAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.consciousness.teal,
  },
  postMeta: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  postTime: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: ARIOME_COLORS.text.secondary,
    lineHeight: 22,
  },
  postActions: {
    flexDirection: 'row',
    marginTop: ARIOME_SPACING.md,
    paddingTop: ARIOME_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: ARIOME_SPACING.xl,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.xs,
  },
  postActionText: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
  },
});
