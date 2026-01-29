import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';
import api from '@/services/api';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

interface ContentItem {
  id: string;
  title: string;
  body: string;
  author?: string;
  mood: string;
  media_type: 'video' | 'audio' | 'text';
  media_url: string;
  thumbnail: string;
  duration: number;
  preview_duration: number;
  is_premium: boolean;
  resonance_count: number;
}

const MOODS = [
  { id: 'all', name: 'All', icon: 'infinity', color: ARIOME_COLORS.consciousness.teal },
  { id: 'peaceful', name: 'Peaceful', icon: 'leaf', color: '#86EFAC' },
  { id: 'grateful', name: 'Grateful', icon: 'hand-heart', color: '#FBBF24' },
  { id: 'hopeful', name: 'Hopeful', icon: 'star-outline', color: '#7DD3FC' },
  { id: 'joyful', name: 'Joyful', icon: 'emoticon-happy-outline', color: '#F472B6' },
  { id: 'reflective', name: 'Reflective', icon: 'thought-bubble-outline', color: '#A78BFA' },
  { id: 'anxious', name: 'Anxious', icon: 'weather-cloudy', color: '#FB923C' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState('all');
  const [wisdom, setWisdom] = useState<ContentItem[]>([]);
  const [practices, setPractices] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [previewTimeLeft, setPreviewTimeLeft] = useState(0);

  const isSubscriber = user?.role === 'subscriber' || user?.role === 'creator' || user?.role === 'admin';

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedMood !== 'all' ? { mood: selectedMood } : {};
      const [wisdomRes, practicesRes] = await Promise.all([
        api.get('/wisdom', { params }),
        api.get('/practices', { params }),
      ]);
      setWisdom(wisdomRes.data);
      setPractices(practicesRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMood]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handlePlayContent = (content: ContentItem) => {
    setSelectedContent(content);
    if (content.is_premium && !isSubscriber) {
      setPreviewTimeLeft(content.preview_duration);
    }
    setShowPlayer(true);
  };

  const formatDuration = (seconds: number) => {
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hrs}h ${mins}m`;
    }
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const renderContentCard = (item: ContentItem, index: number) => {
    const moodColor = MOODS.find(m => m.id === item.mood)?.color || ARIOME_COLORS.consciousness.teal;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.contentCard, { width: CARD_WIDTH }]}
        onPress={() => handlePlayContent(item)}
        activeOpacity={0.9}
      >
        {/* Thumbnail with gradient overlay */}
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.thumbnailGradient}
          />
          
          {/* Play button */}
          <View style={styles.playButton}>
            <MaterialCommunityIcons 
              name={item.media_type === 'video' ? 'play' : 'music'} 
              size={24} 
              color="#FFF" 
            />
          </View>
          
          {/* Duration badge */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
          
          {/* Premium badge */}
          {item.is_premium && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={12} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
        
        {/* Content info */}
        <View style={styles.cardContent}>
          <View style={[styles.moodTag, { backgroundColor: moodColor + '30' }]}>
            <Text style={[styles.moodTagText, { color: moodColor }]}>{item.mood}</Text>
          </View>
          
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.resonanceInfo}>
              <MaterialCommunityIcons name="heart" size={14} color={ARIOME_COLORS.accent.rose} />
              <Text style={styles.resonanceText}>{item.resonance_count}</Text>
            </View>
            {item.author && (
              <Text style={styles.authorText}>by {item.author}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ConsciousHeader showSettings />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[ARIOME_COLORS.consciousness.tealDark, ARIOME_COLORS.background.deep]}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Explore Your Inner World</Text>
          <Text style={styles.heroSubtitle}>
            Discover content curated for your emotional journey
          </Text>
        </LinearGradient>

        {/* Mood Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.moodFilter}
          contentContainerStyle={styles.moodFilterContent}
        >
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodChip,
                selectedMood === mood.id && { backgroundColor: mood.color + '30', borderColor: mood.color }
              ]}
              onPress={() => setSelectedMood(mood.id)}
            >
              <MaterialCommunityIcons 
                name={mood.icon as any} 
                size={18} 
                color={selectedMood === mood.id ? mood.color : ARIOME_COLORS.text.muted} 
              />
              <Text style={[
                styles.moodChipText,
                selectedMood === mood.id && { color: mood.color }
              ]}>
                {mood.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
          </View>
        ) : (
          <>
            {/* Wisdom Section */}
            {wisdom.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="book-open-page-variant" size={20} color={ARIOME_COLORS.consciousness.teal} />
                  <Text style={styles.sectionTitle}>Wisdom & Insights</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {wisdom.map((item, index) => renderContentCard(item, index))}
                </ScrollView>
              </View>
            )}

            {/* Practices Section */}
            {practices.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="meditation" size={20} color={ARIOME_COLORS.accent.lavender} />
                  <Text style={styles.sectionTitle}>Guided Practices</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {practices.map((item, index) => renderContentCard(item, index))}
                </ScrollView>
              </View>
            )}

            {/* Subscribe CTA for non-subscribers */}
            {!isSubscriber && (
              <TouchableOpacity 
                style={styles.subscribeCTA}
                onPress={() => router.push('/subscription')}
              >
                <LinearGradient
                  colors={ARIOME_COLORS.gradients.premium as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeCTAGradient}
                >
                  <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
                  <View style={styles.subscribeCTAText}>
                    <Text style={styles.subscribeCTATitle}>Unlock Full Access</Text>
                    <Text style={styles.subscribeCTASubtitle}>Get unlimited content & features</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Content Player Modal */}
      <Modal visible={showPlayer} animationType="slide" transparent>
        <View style={styles.playerModal}>
          <View style={styles.playerHeader}>
            <TouchableOpacity onPress={() => setShowPlayer(false)}>
              <MaterialCommunityIcons name="close" size={24} color={ARIOME_COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.playerTitle} numberOfLines={1}>{selectedContent?.title}</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedContent && (
            <>
              {selectedContent.media_type === 'video' ? (
                <View style={styles.videoContainer}>
                  <TouchableOpacity 
                    style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {
                      const videoUrl = selectedContent.media_url.replace('/embed/', '/watch?v=');
                      Linking.openURL(videoUrl);
                    }}
                  >
                    <Image 
                      source={{ uri: selectedContent.thumbnail }} 
                      style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5 }} 
                    />
                    <MaterialCommunityIcons name="play-circle" size={80} color="#FFF" />
                    <Text style={{ color: '#FFF', marginTop: 10, fontSize: 16, fontWeight: '500' }}>Tap to Watch on YouTube</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.audioContainer}>
                  <Image source={{ uri: selectedContent.thumbnail }} style={styles.audioThumbnail} />
                  <LinearGradient
                    colors={['transparent', ARIOME_COLORS.background.deep]}
                    style={styles.audioGradient}
                  />
                  {/* Audio player would go here - using native audio APIs */}
                  <View style={styles.audioControls}>
                    <TouchableOpacity style={styles.audioPlayButton}>
                      <MaterialCommunityIcons name="play" size={40} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Preview Warning for non-subscribers */}
              {selectedContent.is_premium && !isSubscriber && (
                <View style={styles.previewWarning}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={ARIOME_COLORS.accent.amber} />
                  <Text style={styles.previewWarningText}>
                    Preview: {selectedContent.preview_duration}s • Subscribe for full access
                  </Text>
                </View>
              )}

              <View style={styles.playerContent}>
                <Text style={styles.playerDescription}>{selectedContent.body}</Text>
                {selectedContent.author && (
                  <Text style={styles.playerAuthor}>— {selectedContent.author}</Text>
                )}
              </View>
            </>
          )}
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
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: ARIOME_SPACING.xl,
    paddingTop: ARIOME_SPACING.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.xs,
  },
  heroSubtitle: {
    fontSize: 16,
    color: ARIOME_COLORS.text.muted,
  },
  moodFilter: {
    marginVertical: ARIOME_SPACING.md,
  },
  moodFilterContent: {
    paddingHorizontal: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.sm,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusRound,
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: ARIOME_SPACING.xs,
    marginRight: ARIOME_SPACING.sm,
  },
  moodChipText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  section: {
    marginBottom: ARIOME_SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.md,
    gap: ARIOME_SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  horizontalScroll: {
    paddingHorizontal: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.md,
  },
  contentCard: {
    backgroundColor: ARIOME_COLORS.background.card,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    overflow: 'hidden',
    marginRight: ARIOME_SPACING.md,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 180,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(20, 184, 166, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: ARIOME_SPACING.sm,
    right: ARIOME_SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 2,
    borderRadius: ARIOME_BORDERS.radiusSmall,
  },
  durationText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  premiumBadge: {
    position: 'absolute',
    top: ARIOME_SPACING.sm,
    right: ARIOME_SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 4,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    gap: 4,
  },
  premiumText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
  },
  cardContent: {
    padding: ARIOME_SPACING.md,
  },
  moodTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 2,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    marginBottom: ARIOME_SPACING.sm,
  },
  moodTagText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.xs,
  },
  cardBody: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ARIOME_SPACING.sm,
  },
  resonanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resonanceText: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  authorText: {
    fontSize: 11,
    color: ARIOME_COLORS.text.subtle,
    fontStyle: 'italic',
  },
  subscribeCTA: {
    marginHorizontal: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.xl,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    overflow: 'hidden',
  },
  subscribeCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.md,
  },
  subscribeCTAText: {
    flex: 1,
  },
  subscribeCTATitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  subscribeCTASubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  playerModal: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ARIOME_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: ARIOME_COLORS.background.secondary,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: ARIOME_SPACING.md,
  },
  videoContainer: {
    height: 250,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  audioContainer: {
    height: 300,
    position: 'relative',
  },
  audioThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  audioGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  audioControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: ARIOME_SPACING.xl,
  },
  audioPlayButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ARIOME_COLORS.accent.amber + '20',
    paddingVertical: ARIOME_SPACING.sm,
    gap: ARIOME_SPACING.xs,
  },
  previewWarningText: {
    fontSize: 13,
    color: ARIOME_COLORS.accent.amber,
    fontWeight: '500',
  },
  playerContent: {
    padding: ARIOME_SPACING.lg,
  },
  playerDescription: {
    fontSize: 16,
    color: ARIOME_COLORS.text.secondary,
    lineHeight: 24,
  },
  playerAuthor: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.md,
    fontStyle: 'italic',
  },
});
