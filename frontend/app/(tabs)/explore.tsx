import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';
import api from '@/services/api';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

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
  { id: 'peaceful', name: 'Peaceful', icon: 'leaf', color: '#10B981' },
  { id: 'grateful', name: 'Grateful', icon: 'hand-heart', color: '#F59E0B' },
  { id: 'hopeful', name: 'Hopeful', icon: 'star-outline', color: '#0EA5E9' },
  { id: 'joyful', name: 'Joyful', icon: 'emoticon-happy-outline', color: '#EC4899' },
  { id: 'reflective', name: 'Reflective', icon: 'thought-bubble-outline', color: '#8B5CF6' },
  { id: 'anxious', name: 'Anxious', icon: 'weather-cloudy', color: '#F97316' },
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
  
  // Preview System State
  const [previewTimeLeft, setPreviewTimeLeft] = useState(0);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isSubscriber = user?.role === 'subscriber' || user?.role === 'creator' || user?.role === 'admin';

  // Pulse animation for subscribe button
  useEffect(() => {
    if (previewEnded) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [previewEnded]);

  // Preview countdown timer
  useEffect(() => {
    if (showPlayer && selectedContent && selectedContent.is_premium && !isSubscriber && isPlaying && !previewEnded) {
      previewTimerRef.current = setInterval(() => {
        setPreviewTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(previewTimerRef.current!);
            setPreviewEnded(true);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (previewTimerRef.current) {
        clearInterval(previewTimerRef.current);
      }
    };
  }, [showPlayer, selectedContent, isSubscriber, isPlaying, previewEnded]);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedMood !== 'all' ? { mood: selectedMood } : {};
      const [wisdomRes, practicesRes] = await Promise.all([
        api.get('/wisdom', { params }),
        api.get('/practices', { params }),
      ]);
      setWisdom(wisdomRes.data || []);
      setPractices(practicesRes.data || []);
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
    setPreviewEnded(false);
    setIsPlaying(true);
    
    if (content.is_premium && !isSubscriber) {
      setPreviewTimeLeft(content.preview_duration || 20);
    } else {
      setPreviewTimeLeft(0);
    }
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setSelectedContent(null);
    setPreviewEnded(false);
    setIsPlaying(false);
    if (previewTimerRef.current) {
      clearInterval(previewTimerRef.current);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0 min';
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hrs}h ${mins}m`;
    }
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatPreviewTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const renderContentCard = (item: ContentItem, index: number) => {
    const moodColor = MOODS.find(m => m.id === item.mood)?.color || ARIOME_COLORS.consciousness.teal;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.contentCard, { width: CARD_WIDTH }]}
        onPress={() => handlePlayContent(item)}
        activeOpacity={0.9}
        data-testid={`content-card-${item.id}`}
      >
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.thumbnailGradient}
          />
          
          {/* Play Button */}
          <View style={styles.playButton}>
            <MaterialCommunityIcons 
              name={item.media_type === 'video' ? 'play' : 'music'} 
              size={28} 
              color="#FFF" 
            />
          </View>
          
          {/* Duration Badge */}
          <View style={styles.durationBadge}>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#FFF" />
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
          
          {/* Premium Badge */}
          {item.is_premium && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={12} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}

          {/* Preview Badge for non-subscribers */}
          {item.is_premium && !isSubscriber && (
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>{item.preview_duration || 20}s preview</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <View style={[styles.moodTag, { backgroundColor: moodColor + '20' }]}>
            <Text style={[styles.moodTagText, { color: moodColor }]}>{item.mood}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.resonanceInfo}>
              <MaterialCommunityIcons name="heart" size={14} color={ARIOME_COLORS.accent.rose} />
              <Text style={styles.resonanceText}>{item.resonance_count || 0}</Text>
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
          
          {/* Content Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{wisdom.length + practices.length}</Text>
              <Text style={styles.statLabel}>Experiences</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Moods</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Growth</Text>
            </View>
          </View>
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
                selectedMood === mood.id && { backgroundColor: mood.color + '25', borderColor: mood.color }
              ]}
              onPress={() => setSelectedMood(mood.id)}
              data-testid={`mood-filter-${mood.id}`}
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
            <Text style={styles.loadingText}>Finding your content...</Text>
          </View>
        ) : (
          <>
            {/* Wisdom Section */}
            {wisdom.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="book-open-page-variant" size={22} color={ARIOME_COLORS.consciousness.teal} />
                  <Text style={styles.sectionTitle}>Wisdom & Insights</Text>
                  <Text style={styles.sectionCount}>{wisdom.length}</Text>
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
                  <MaterialCommunityIcons name="meditation" size={22} color={ARIOME_COLORS.accent.lavender} />
                  <Text style={styles.sectionTitle}>Guided Practices</Text>
                  <Text style={styles.sectionCount}>{practices.length}</Text>
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
                data-testid="subscribe-cta"
              >
                <LinearGradient
                  colors={ARIOME_COLORS.gradients.premium as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeCTAGradient}
                >
                  <MaterialCommunityIcons name="crown" size={28} color="#FFD700" />
                  <View style={styles.subscribeCTAText}>
                    <Text style={styles.subscribeCTATitle}>Unlock Full Access</Text>
                    <Text style={styles.subscribeCTASubtitle}>Get unlimited content & features</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* Content Player Modal */}
      <Modal visible={showPlayer} animationType="slide" transparent>
        <View style={styles.playerModal}>
          {/* Player Header */}
          <View style={styles.playerHeader}>
            <TouchableOpacity onPress={handleClosePlayer} data-testid="close-player">
              <MaterialCommunityIcons name="close" size={24} color={ARIOME_COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.playerTitle} numberOfLines={1}>{selectedContent?.title}</Text>
            
            {/* Preview Timer for non-subscribers */}
            {selectedContent?.is_premium && !isSubscriber && !previewEnded && (
              <View style={styles.previewTimer}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={ARIOME_COLORS.accent.amber} />
                <Text style={styles.previewTimerText}>{formatPreviewTime(previewTimeLeft)}</Text>
              </View>
            )}
            {(isSubscriber || !selectedContent?.is_premium) && <View style={{ width: 50 }} />}
          </View>

          {selectedContent && (
            <>
              {/* Video/Audio Player */}
              <View style={styles.mediaContainer}>
                {selectedContent.media_type === 'video' ? (
                  <View style={styles.videoContainer}>
                    {!previewEnded ? (
                      <iframe
                        src={`${selectedContent.media_url}?autoplay=1&modestbranding=1&rel=0`}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <Image 
                        source={{ uri: selectedContent.thumbnail }} 
                        style={{ width: '100%', height: '100%', opacity: 0.3 }} 
                      />
                    )}
                  </View>
                ) : (
                  <View style={styles.audioContainer}>
                    <Image source={{ uri: selectedContent.thumbnail }} style={styles.audioThumbnail} />
                    <LinearGradient
                      colors={['transparent', ARIOME_COLORS.background.deep]}
                      style={styles.audioGradient}
                    />
                    {!previewEnded && (
                      <View style={styles.audioControls}>
                        <audio 
                          src={selectedContent.media_url} 
                          controls 
                          autoPlay
                          style={{ width: '90%', marginTop: 20 }}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Preview Ended Overlay */}
                {previewEnded && (
                  <View style={styles.previewEndedOverlay}>
                    <View style={styles.previewEndedContent}>
                      <MaterialCommunityIcons name="lock" size={48} color={ARIOME_COLORS.accent.amber} />
                      <Text style={styles.previewEndedTitle}>Preview Ended</Text>
                      <Text style={styles.previewEndedText}>
                        Subscribe to continue watching and unlock all premium content
                      </Text>
                      
                      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <TouchableOpacity 
                          style={styles.subscribeNowButton}
                          onPress={() => {
                            handleClosePlayer();
                            router.push('/subscription');
                          }}
                          data-testid="subscribe-now-btn"
                        >
                          <LinearGradient
                            colors={ARIOME_COLORS.gradients.premium as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.subscribeNowGradient}
                          >
                            <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
                            <Text style={styles.subscribeNowText}>Subscribe Now</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>

                      <TouchableOpacity 
                        onPress={handleClosePlayer}
                        style={styles.maybeLaterButton}
                      >
                        <Text style={styles.maybeLaterText}>Maybe Later</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Preview Progress Bar for non-subscribers */}
              {selectedContent.is_premium && !isSubscriber && !previewEnded && (
                <View style={styles.previewProgressContainer}>
                  <View style={styles.previewProgressBar}>
                    <View 
                      style={[
                        styles.previewProgressFill, 
                        { width: `${(previewTimeLeft / (selectedContent.preview_duration || 20)) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.previewProgressText}>
                    {previewTimeLeft}s remaining • Subscribe for full access
                  </Text>
                </View>
              )}

              {/* Content Info */}
              {!previewEnded && (
                <View style={styles.playerContent}>
                  <Text style={styles.playerDescription}>{selectedContent.body}</Text>
                  {selectedContent.author && (
                    <Text style={styles.playerAuthor}>— {selectedContent.author}</Text>
                  )}
                </View>
              )}
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
    paddingBottom: ARIOME_SPACING.xl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.xs,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: ARIOME_COLORS.text.muted,
    marginBottom: ARIOME_SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: ARIOME_COLORS.consciousness.teal,
  },
  statLabel: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    borderWidth: 1.5,
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
  loadingText: {
    marginTop: ARIOME_SPACING.md,
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
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
    flex: 1,
  },
  sectionCount: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    backgroundColor: ARIOME_COLORS.background.secondary,
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 2,
    borderRadius: ARIOME_BORDERS.radiusSmall,
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    height: 100,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -28,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(20, 184, 166, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  durationBadge: {
    position: 'absolute',
    bottom: ARIOME_SPACING.sm,
    right: ARIOME_SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 4,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 4,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    gap: 4,
  },
  premiumText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '700',
  },
  previewBadge: {
    position: 'absolute',
    top: ARIOME_SPACING.sm,
    left: ARIOME_SPACING.sm,
    backgroundColor: ARIOME_COLORS.accent.amber,
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 4,
    borderRadius: ARIOME_BORDERS.radiusSmall,
  },
  previewBadgeText: {
    fontSize: 10,
    color: '#000',
    fontWeight: '700',
  },
  cardContent: {
    padding: ARIOME_SPACING.md,
  },
  moodTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 3,
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
    lineHeight: 22,
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
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  subscribeCTASubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // Player Modal Styles
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
  previewTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 4,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    gap: 4,
  },
  previewTimerText: {
    fontSize: 14,
    fontWeight: '700',
    color: ARIOME_COLORS.accent.amber,
  },
  mediaContainer: {
    position: 'relative',
  },
  videoContainer: {
    height: 280,
    backgroundColor: '#000',
  },
  audioContainer: {
    height: 280,
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
    paddingBottom: ARIOME_SPACING.lg,
  },
  // Preview Ended Overlay
  previewEndedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewEndedContent: {
    alignItems: 'center',
    padding: ARIOME_SPACING.xl,
  },
  previewEndedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.sm,
  },
  previewEndedText: {
    fontSize: 15,
    color: ARIOME_COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: ARIOME_SPACING.xl,
    maxWidth: 280,
  },
  subscribeNowButton: {
    borderRadius: ARIOME_BORDERS.radiusRound,
    overflow: 'hidden',
    marginBottom: ARIOME_SPACING.md,
  },
  subscribeNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.md,
    paddingHorizontal: ARIOME_SPACING.xl,
    gap: ARIOME_SPACING.sm,
  },
  subscribeNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  maybeLaterButton: {
    padding: ARIOME_SPACING.md,
  },
  maybeLaterText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
  },
  // Preview Progress Bar
  previewProgressContainer: {
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  previewProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: ARIOME_SPACING.sm,
  },
  previewProgressFill: {
    height: '100%',
    backgroundColor: ARIOME_COLORS.accent.amber,
    borderRadius: 2,
  },
  previewProgressText: {
    fontSize: 12,
    color: ARIOME_COLORS.accent.amber,
    textAlign: 'center',
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
