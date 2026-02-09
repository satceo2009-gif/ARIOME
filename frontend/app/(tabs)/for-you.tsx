import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContentStore } from '@/store/contentStore';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://theme-evolution.preview.emergentagent.com/api';

const MOOD_INFO: any = {
  healing: { label: 'Healing', icon: 'heart-pulse', color: '#EC4899' },
  growth: { label: 'Growth', icon: 'trending-up', color: '#10B981' },
  love: { label: 'Love', icon: 'heart', color: '#F472B6' },
  gratitude: { label: 'Gratitude', icon: 'hand-heart', color: '#F59E0B' },
  resilience: { label: 'Resilience', icon: 'shield-check', color: '#8B5CF6' },
  mindfulness: { label: 'Mindfulness', icon: 'meditation', color: '#14B8A6' },
  joy: { label: 'Joy', icon: 'emoticon-happy', color: '#FBBF24' },
};

export default function ForYouScreen() {
  const router = useRouter();
  const { selectedMood, stories, setStories } = useContentStore();
  const [loading, setLoading] = useState(true);
  const [filteredStories, setFilteredStories] = useState<any[]>([]);

  useEffect(() => {
    loadStories();
  }, [selectedMood]);

  const loadStories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/stories`);
      const allStories = response.data;
      setStories(allStories);
      
      // Filter by selected mood
      if (selectedMood) {
        const filtered = allStories.filter((s: any) => 
          s.intentions?.includes(selectedMood) || 
          s.category?.toLowerCase() === selectedMood.toLowerCase()
        );
        setFilteredStories(filtered.length > 0 ? filtered : allStories.slice(0, 10));
      } else {
        setFilteredStories(allStories.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      setFilteredStories([]);
    } finally {
      setLoading(false);
    }
  };

  const moodInfo = selectedMood ? MOOD_INFO[selectedMood] : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>For You</Text>
          {moodInfo && (
            <View style={[styles.moodBadge, { backgroundColor: `${moodInfo.color}20` }]}>
              <MaterialCommunityIcons name={moodInfo.icon} size={16} color={moodInfo.color} />
              <Text style={[styles.moodText, { color: moodInfo.color }]}>{moodInfo.label}</Text>
            </View>
          )}
        </View>

        {/* Selected Mood Section */}
        {moodInfo && (
          <View style={styles.moodSection}>
            <View style={[styles.moodCard, { backgroundColor: `${moodInfo.color}15` }]}>
              <MaterialCommunityIcons name={moodInfo.icon} size={40} color={moodInfo.color} />
              <View style={styles.moodCardContent}>
                <Text style={styles.moodCardTitle}>Today's Focus: {moodInfo.label}</Text>
                <Text style={styles.moodCardSubtitle}>
                  Content curated for your {moodInfo.label.toLowerCase()} journey
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.changeMoodBtn}
              onPress={() => router.push('/mood-selection')}
            >
              <Text style={styles.changeMoodText}>Change mood</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {moodInfo ? `${moodInfo.label} Stories` : 'Recommended For You'}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#14B8A6" />
            </View>
          ) : filteredStories.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="playlist-music" size={48} color="#6B7280" />
              <Text style={styles.emptyText}>No stories found</Text>
              <TouchableOpacity 
                style={styles.exploreBtn}
                onPress={() => router.push('/(tabs)/discover')}
              >
                <Text style={styles.exploreBtnText}>Explore All Stories</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredStories.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyCard}
                onPress={() => router.push(`/story/${story.id}`)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: story.thumbnailUrl }} style={styles.storyImage} />
                <View style={styles.storyContent}>
                  <View style={styles.storyBadge}>
                    <MaterialCommunityIcons 
                      name={story.format === 'video' ? 'video' : 'music-note'} 
                      size={12} 
                      color="#FFF" 
                    />
                    <Text style={styles.storyBadgeText}>
                      {story.format === 'video' ? 'Video' : 'Audio'}
                    </Text>
                  </View>
                  <Text style={styles.storyTitle} numberOfLines={2}>{story.title}</Text>
                  <View style={styles.storyMeta}>
                    <Text style={styles.storyCreator}>{story.creator?.name}</Text>
                    <Text style={styles.storyDuration}>
                      {Math.floor(story.duration / 60)} min
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  moodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  moodCardContent: {
    flex: 1,
  },
  moodCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  moodCardSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  changeMoodBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  changeMoodText: {
    fontSize: 13,
    color: '#14B8A6',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 16,
  },
  exploreBtn: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  storyImage: {
    width: 100,
    height: 100,
  },
  storyContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  storyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  storyBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 6,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  storyCreator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  storyDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
});
