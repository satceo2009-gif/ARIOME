import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { libraryAPI } from '@/services/api';

export default function Library() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'recent'>('saved');
  const [savedStories, setSavedStories] = useState<any[]>([]);
  const [recentStories, setRecentStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLibrary = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [saved, history] = await Promise.all([
        libraryAPI.getSavedStories().catch(() => []),
        libraryAPI.getPlayHistory().catch(() => [])
      ]);

      setSavedStories(saved || []);
      setRecentStories(history || []);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const onRefresh = () => {
    setRefreshing(true);
    loadLibrary();
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Library</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="bookshelf" size={64} color="#6B7280" />
          <Text style={styles.emptyTitle}>Login to access your library</Text>
          <Text style={styles.emptySubtitle}>Save stories and track your listening history</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Text
            style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}
          >
            Saved Stories ({savedStories.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.tabActive]}
          onPress={() => setActiveTab('recent')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'recent' && styles.tabTextActive,
            ]}
          >
            Recently Played ({recentStories.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
          }
        >
          {activeTab === 'saved' ? (
            savedStories.length > 0 ? (
              savedStories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyCard}
                  onPress={() => router.push(`/story/${story.id}`)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: story.thumbnailUrl || 'https://via.placeholder.com/100' }}
                    style={styles.storyImage}
                  />
                  <View style={styles.storyContent}>
                    <Text style={styles.storyTitle} numberOfLines={2}>
                      {story.title}
                    </Text>
                    <View style={styles.creatorInfo}>
                      <Image
                        source={{ uri: story.creator?.avatar || 'https://i.pravatar.cc/150?img=1' }}
                        style={styles.creatorAvatar}
                      />
                      <Text style={styles.creatorName}>{story.creator?.name || 'Unknown'}</Text>
                    </View>
                    <View style={styles.storyMeta}>
                      <MaterialCommunityIcons
                        name={story.format === 'video' ? 'video' : 'music-note'}
                        size={14}
                        color="#9CA3AF"
                      />
                      <Text style={styles.metaText}>
                        {Math.floor((story.duration || 0) / 60)} min
                      </Text>
                      <MaterialCommunityIcons
                        name="heart"
                        size={14}
                        color="#EC4899"
                      />
                      <Text style={styles.metaText}>{story.resonanceCount || 0}</Text>
                    </View>
                  </View>
                  <View style={styles.savedBadge}>
                    <MaterialCommunityIcons name="bookmark" size={20} color="#14B8A6" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="bookmark-outline"
                  size={64}
                  color="#4B5563"
                />
                <Text style={styles.emptyTitle}>No Saved Stories</Text>
                <Text style={styles.emptySubtitle}>
                  Stories you save will appear here
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => router.push('/(tabs)/discover')}
                >
                  <Text style={styles.exploreButtonText}>Explore Stories</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            recentStories.length > 0 ? (
              recentStories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyCard}
                  onPress={() => router.push(`/story/${story.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: story.thumbnailUrl || 'https://via.placeholder.com/100' }}
                      style={styles.storyImage}
                    />
                    {story.progress > 0 && (
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${story.progress}%` }]} />
                      </View>
                    )}
                  </View>
                  <View style={styles.storyContent}>
                    <Text style={styles.storyTitle} numberOfLines={2}>
                      {story.title}
                    </Text>
                    <View style={styles.creatorInfo}>
                      <Image
                        source={{ uri: story.creator?.avatar || 'https://i.pravatar.cc/150?img=1' }}
                        style={styles.creatorAvatar}
                      />
                      <Text style={styles.creatorName}>{story.creator?.name || 'Unknown'}</Text>
                    </View>
                    <View style={styles.storyMeta}>
                      <MaterialCommunityIcons
                        name={story.format === 'video' ? 'video' : 'music-note'}
                        size={14}
                        color="#9CA3AF"
                      />
                      <Text style={styles.metaText}>
                        {Math.floor((story.duration || 0) / 60)} min
                      </Text>
                      <Text style={styles.timeAgo}>{formatTimeAgo(story.playedAt)}</Text>
                    </View>
                  </View>
                  {story.playCount > 1 && (
                    <View style={styles.playCountBadge}>
                      <Text style={styles.playCountText}>{story.playCount}x</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="history"
                  size={64}
                  color="#4B5563"
                />
                <Text style={styles.emptyTitle}>No Recent Stories</Text>
                <Text style={styles.emptySubtitle}>
                  Stories you listen to will appear here
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => router.push('/(tabs)/discover')}
                >
                  <Text style={styles.exploreButtonText}>Start Listening</Text>
                </TouchableOpacity>
              </View>
            )
          )}
          <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#14B8A6',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },
  storyImage: {
    width: 100,
    height: 120,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 100,
    height: 3,
    backgroundColor: '#374151',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
  },
  storyContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  creatorName: {
    fontSize: 13,
    color: '#FFF',
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 'auto',
  },
  savedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  playCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  playCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
