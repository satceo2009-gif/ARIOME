import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContentStore } from '@/store/contentStore';
import { INTENTIONS } from '@/constants/intentions';

export default function Library() {
  const router = useRouter();
  const { stories, savedStories, recentlyPlayed } = useContentStore();
  const [activeTab, setActiveTab] = useState<'saved' | 'recent'>('saved');

  const mySavedStories = stories.filter((story) =>
    savedStories.includes(story.id)
  );

  // Get recently played stories with their data
  const recentlyPlayedStories = recentlyPlayed
    .map(r => {
      const story = stories.find(s => s.id === r.storyId);
      return story ? { ...story, playedAt: r.playedAt, progress: r.progress } : null;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const formatTimeAgo = (dateString: string) => {
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
            Saved Stories ({mySavedStories.length})
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
            Recently Played ({recentlyPlayedStories.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'saved' ? (
          mySavedStories.length > 0 ? (
            mySavedStories.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyCard}
                onPress={() => router.push(`/story/${story.id}`)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: story.thumbnailUrl }}
                  style={styles.storyImage}
                />
                <View style={styles.storyContent}>
                  <Text style={styles.storyTitle} numberOfLines={2}>
                    {story.title}
                  </Text>
                  <View style={styles.creatorInfo}>
                    <Image
                      source={{ uri: story.creator.avatar }}
                      style={styles.creatorAvatar}
                    />
                    <Text style={styles.creatorName}>{story.creator.name}</Text>
                  </View>
                  <View style={styles.storyMeta}>
                    <MaterialCommunityIcons
                      name={story.format === 'video' ? 'video' : 'music-note'}
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text style={styles.metaText}>
                      {Math.floor(story.duration / 60)} min
                    </Text>
                    <MaterialCommunityIcons
                      name="heart"
                      size={14}
                      color="#EC4899"
                    />
                    <Text style={styles.metaText}>{story.resonanceCount}</Text>
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
          recentlyPlayedStories.length > 0 ? (
            recentlyPlayedStories.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyCard}
                onPress={() => router.push(`/story/${story.id}`)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: story.thumbnailUrl }}
                  style={styles.storyImage}
                />
                {story.progress > 0 && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${story.progress}%` }]} />
                  </View>
                )}
                <View style={styles.storyContent}>
                  <Text style={styles.storyTitle} numberOfLines={2}>
                    {story.title}
                  </Text>
                  <View style={styles.creatorInfo}>
                    <Image
                      source={{ uri: story.creator.avatar }}
                      style={styles.creatorAvatar}
                    />
                    <Text style={styles.creatorName}>{story.creator.name}</Text>
                  </View>
                  <View style={styles.storyMeta}>
                    <MaterialCommunityIcons
                      name={story.format === 'video' ? 'video' : 'music-note'}
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text style={styles.metaText}>
                      {Math.floor(story.duration / 60)} min
                    </Text>
                    <Text style={styles.timeAgo}>{formatTimeAgo(story.playedAt)}</Text>
                  </View>
                </View>
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
