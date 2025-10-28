import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Audio } from 'expo-av';
import { useContentStore, Story } from '@/store/contentStore';
import { INTENTIONS } from '@/constants/intentions';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function StoryPlayer() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { stories, savedStories, toggleSaveStory, addResonance } = useContentStore();
  const [story, setStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionStep, setReflectionStep] = useState<'before' | 'after'>('before');
  const [beforeReflection, setBeforeReflection] = useState('');
  const [afterReflection, setAfterReflection] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  const videoRef = useRef<Video>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const foundStory = stories.find((s) => s.id === id);
    if (foundStory) {
      setStory(foundStory);
      setShowReflection(true);
    }

    // Configure audio mode for Android compatibility
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
        });
      } catch (error) {
        console.log('Audio mode config error:', error);
      }
    };
    
    configureAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id, stories]);

  const handlePlayPause = async () => {
    if (story?.format === 'video' && videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else if (story?.format === 'audio') {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: story.mediaUrl },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  const handleContinue = () => {
    if (reflectionStep === 'before') {
      setReflectionStep('after');
      setShowReflection(false);
    } else {
      setShowReflection(false);
    }
  };

  const handleSave = () => {
    if (story) {
      toggleSaveStory(story.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleResonance = () => {
    if (story) {
      addResonance(story.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  if (!story) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Story not found</Text>
      </SafeAreaView>
    );
  }

  const isSaved = savedStories.includes(story.id);
  const intentionColor = INTENTIONS.find((i) => i.id === story.intentions[0])?.color || '#14B8A6';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
          <MaterialCommunityIcons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#14B8A6' : '#FFF'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Media Player */}
        <View style={styles.mediaContainer}>
          {story.format === 'video' ? (
            <>
              <Video
                ref={videoRef}
                source={{ uri: story.mediaUrl }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                onPlaybackStatusUpdate={(status: any) => {
                  if (status.isLoaded) {
                    setIsPlaying(status.isPlaying);
                  }
                }}
                useNativeControls
              />
              <Image
                source={require('../../assets/images/ariome-logo.png')}
                style={styles.watermark}
                resizeMode="contain"
              />
            </>
          ) : (
            <View style={styles.audioPlayer}>
              <Image
                source={{ uri: story.thumbnailUrl }}
                style={styles.audioThumbnail}
                blurRadius={20}
              />
              <View style={styles.audioOverlay}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={handlePlayPause}
                >
                  <MaterialCommunityIcons
                    name={isPlaying ? 'pause' : 'play'}
                    size={48}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </View>
              <Image
                source={require('../../assets/images/ariome-logo.png')}
                style={styles.watermark}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Story Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.storyTitle}>{story.title}</Text>
          
          {/* Creator Info */}
          <TouchableOpacity
            style={styles.creatorSection}
            onPress={() => router.push(`/creator/${story.creator.id}`)}
          >
            <Image
              source={{ uri: story.creator.avatar }}
              style={styles.creatorAvatar}
            />
            <View style={styles.creatorInfo}>
              <View style={styles.creatorNameRow}>
                <Text style={styles.creatorName}>{story.creator.name}</Text>
                {story.creator.verified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#14B8A6"
                  />
                )}
              </View>
              <Text style={styles.creatorBio} numberOfLines={1}>
                {story.creator.bio}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resonanceButton]}
              onPress={handleResonance}
            >
              <MaterialCommunityIcons name="heart" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>
                Resonate ({story.resonanceCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.tipButton]}
              onPress={() => setShowTipModal(true)}
            >
              <MaterialCommunityIcons name="currency-usd" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Tip Creator</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Story</Text>
            <Text style={styles.description}>{story.description}</Text>
          </View>

          {/* Intentions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intentions</Text>
            <View style={styles.intentionTags}>
              {story.intentions.map((intentionId) => {
                const intention = INTENTIONS.find((i) => i.id === intentionId);
                return intention ? (
                  <View
                    key={intentionId}
                    style={[
                      styles.intentionTag,
                      { backgroundColor: `${intention.color}20` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={intention.icon as any}
                      size={16}
                      color={intention.color}
                    />
                    <Text style={[styles.intentionText, { color: intention.color }]}>
                      {intention.name}
                    </Text>
                  </View>
                ) : null;
              })}
            </View>
          </View>

          {/* Reflection Prompts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reflection Prompts</Text>
            <View style={styles.reflectionCard}>
              <Text style={styles.reflectionLabel}>Before Listening</Text>
              <Text style={styles.reflectionPrompt}>
                {story.reflectionPrompts.before}
              </Text>
            </View>
            <View style={styles.reflectionCard}>
              <Text style={styles.reflectionLabel}>After Listening</Text>
              <Text style={styles.reflectionPrompt}>
                {story.reflectionPrompts.after}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.journalButton}
              onPress={() => router.push('/(tabs)/journal')}
            >
              <MaterialCommunityIcons name="notebook" size={20} color="#14B8A6" />
              <Text style={styles.journalButtonText}>Journal Your Thoughts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Reflection Modal */}
      <Modal
        visible={showReflection}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReflection(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {reflectionStep === 'before' ? 'Before You Listen' : 'After Listening'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowReflection(false)}
                style={styles.skipButton}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalPrompt}>
              {reflectionStep === 'before'
                ? story.reflectionPrompts.before
                : story.reflectionPrompts.after}
            </Text>

            <TextInput
              style={styles.reflectionInput}
              placeholder="Take a moment to reflect..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={6}
              value={reflectionStep === 'before' ? beforeReflection : afterReflection}
              onChangeText={
                reflectionStep === 'before' ? setBeforeReflection : setAfterReflection
              }
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Tip Modal */}
      <Modal
        visible={showTipModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTipModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Support {story.creator.name}</Text>
              <TouchableOpacity onPress={() => setShowTipModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.tipDescription}>
              Show your appreciation and support this creator's conscious work
            </Text>

            <View style={styles.tipOptions}>
              {[3, 5, 10, 20].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.tipOption}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setShowTipModal(false);
                    // TODO: Implement tip payment
                  }}
                >
                  <Text style={styles.tipAmount}>${amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.customTipButton}>
              <Text style={styles.customTipText}>Custom Amount</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 26, 36, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 26, 36, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mediaContainer: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  audioPlayer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  audioThumbnail: {
    width: '100%',
    height: '100%',
  },
  audioOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(157, 78, 221, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermark: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 100,
    height: 40,
    opacity: 0.7,
  },
  infoContainer: {
    padding: 20,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A24',
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  creatorBio: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resonanceButton: {
    backgroundColor: '#EC4899',
  },
  tipButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 24,
  },
  intentionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  intentionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  intentionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reflectionCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reflectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
    marginBottom: 8,
  },
  reflectionPrompt: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 22,
  },
  journalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  journalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#14B8A6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  modalPrompt: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
    marginBottom: 20,
  },
  reflectionInput: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#FFF',
    minHeight: 150,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  tipDescription: {
    fontSize: 15,
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 22,
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  tipOption: {
    flex: 1,
    minWidth: (width - 80) / 2,
    aspectRatio: 1,
    backgroundColor: '#0A0A0F',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  tipAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14B8A6',
  },
  customTipButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  customTipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#14B8A6',
  },
  errorText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 40,
  },
});
