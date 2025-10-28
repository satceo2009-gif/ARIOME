import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useContentStore, Story } from '@/store/contentStore';
import { INTENTIONS } from '@/constants/intentions';
import { SAMPLE_STORIES } from '@/constants/sampleStories';
import { storiesAPI } from '../../services/api';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function Discover() {
  const router = useRouter();
  const { user } = useUserStore();
  const { stories, setStories } = useContentStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load stories from API
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      // Try to load from API
      const data = await storiesAPI.getAll();
      if (data && data.length > 0) {
        setStories(data);
      } else {
        // Fallback to sample data if API returns empty
        setStories(SAMPLE_STORIES);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      // Fallback to sample data if API fails
      setStories(SAMPLE_STORIES);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStories();
    setRefreshing(false);
  };

  const handleFilterPress = (intentionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(intentionId);
  };

  const filteredStories =
    selectedFilter === 'all'
      ? stories
      : stories.filter((story) => story.intentions.includes(selectedFilter));

  const userIntentions = user?.intentions || [];
  const recommendedStories = stories.filter((story) =>
    story.intentions.some((intention) => userIntentions.includes(intention))
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back, {user?.name || 'Explorer'}</Text>
          <Text style={styles.subtitle}>What intention calls to you today?</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <MaterialCommunityIcons name="magnify" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#14B8A6"
          />
        }
      >
        {/* Intention Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'all' && styles.filterChipActive,
            ]}
            onPress={() => handleFilterPress('all')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'all' && styles.filterTextActive,
              ]}
            >
              All Stories
            </Text>
          </TouchableOpacity>
          {INTENTIONS.map((intention) => (
            <TouchableOpacity
              key={intention.id}
              style={[
                styles.filterChip,
                selectedFilter === intention.id && styles.filterChipActive,
                selectedFilter === intention.id && {
                  backgroundColor: `${intention.color}30`,
                  borderColor: intention.color,
                },
              ]}
              onPress={() => handleFilterPress(intention.id)}
            >
              <MaterialCommunityIcons
                name={intention.icon as any}
                size={16}
                color={
                  selectedFilter === intention.id ? intention.color : '#9CA3AF'
                }
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === intention.id && {
                    color: intention.color,
                    fontWeight: '700',
                  },
                ]}
              >
                {intention.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended Stories */}
        {selectedFilter === 'all' && recommendedStories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>For Your Journey</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {recommendedStories.slice(0, 4).map((story) => (
                <FeaturedStoryCard
                  key={story.id}
                  story={story}
                  onPress={() => router.push(`/story/${story.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Stories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'all' ? 'Explore All Stories' : 'Filtered Stories'}
          </Text>
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onPress={() => router.push(`/story/${story.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeaturedStoryCard({
  story,
  onPress,
}: {
  story: Story;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: story.thumbnailUrl }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredBadge}>
          <MaterialCommunityIcons
            name={story.format === 'video' ? 'play-circle' : 'music-note'}
            size={16}
            color="#FFF"
          />
          <Text style={styles.featuredDuration}>
            {Math.floor(story.duration / 60)} min
          </Text>
        </View>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <View style={styles.featuredCreator}>
          <Image
            source={{ uri: story.creator.avatar }}
            style={styles.featuredAvatar}
          />
          <Text style={styles.featuredCreatorName}>{story.creator.name}</Text>
          {story.creator.verified && (
            <MaterialCommunityIcons
              name="check-decagram"
              size={14}
              color="#14B8A6"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function StoryCard({ story, onPress }: { story: Story; onPress: () => void }) {
  const intentionColor = INTENTIONS.find((i) => i.id === story.intentions[0])?.color || '#14B8A6';

  return (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: story.thumbnailUrl }} style={styles.storyImage} />
      <View style={styles.storyContent}>
        <View style={styles.storyHeader}>
          <Text style={styles.storyTitle} numberOfLines={2}>
            {story.title}
          </Text>
          {story.isPremium && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={12} color="#FBBF24" />
            </View>
          )}
        </View>
        <Text style={styles.storyDescription} numberOfLines={2}>
          {story.description}
        </Text>
        <View style={styles.storyMeta}>
          <View style={styles.creatorInfo}>
            <Image
              source={{ uri: story.creator.avatar }}
              style={styles.creatorAvatar}
            />
            <Text style={styles.creatorName}>{story.creator.name}</Text>
            {story.creator.verified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={12}
                color="#14B8A6"
              />
            )}
          </View>
          <View style={styles.storyStats}>
            <MaterialCommunityIcons
              name={story.format === 'video' ? 'video' : 'music-note'}
              size={14}
              color="#9CA3AF"
            />
            <Text style={styles.statText}>{Math.floor(story.duration / 60)}m</Text>
            <MaterialCommunityIcons name="heart-outline" size={14} color="#9CA3AF" />
            <Text style={styles.statText}>{story.resonanceCount}</Text>
          </View>
        </View>
        <View style={styles.intentionTags}>
          {story.intentions.slice(0, 2).map((intentionId) => {
            const intention = INTENTIONS.find((i) => i.id === intentionId);
            return intention ? (
              <View
                key={intentionId}
                style={[
                  styles.intentionTag,
                  { backgroundColor: `${intention.color}20` },
                ]}
              >
                <Text style={[styles.intentionTagText, { color: intention.color }]}>
                  {intention.name.split(' ')[0]}
                </Text>
              </View>
            ) : null;
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  filtersContainer: {
    paddingVertical: 12,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A24',
    marginRight: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    borderColor: '#14B8A6',
  },
  filterText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#14B8A6',
    fontWeight: '700',
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  featuredDuration: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  featuredCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  featuredCreatorName: {
    fontSize: 12,
    color: '#FFF',
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  storyImage: {
    width: 120,
    height: 160,
  },
  storyContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 8,
  },
  premiumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 12,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  creatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  creatorName: {
    fontSize: 12,
    color: '#FFF',
  },
  storyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 8,
  },
  intentionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  intentionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intentionTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
