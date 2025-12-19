import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useContentStore } from '@/store/contentStore';
import { INTENTIONS } from '@/constants/intentions';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const MOOD_OPTIONS = [
  { id: 'healing', label: 'Healing', icon: 'heart-pulse', color: '#EC4899', gradient: ['#EC4899', '#BE185D'] },
  { id: 'growth', label: 'Growth', icon: 'trending-up', color: '#10B981', gradient: ['#10B981', '#047857'] },
  { id: 'love', label: 'Love', icon: 'heart', color: '#F472B6', gradient: ['#F472B6', '#DB2777'] },
  { id: 'gratitude', label: 'Gratitude', icon: 'hand-heart', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
  { id: 'resilience', label: 'Resilience', icon: 'shield-check', color: '#8B5CF6', gradient: ['#8B5CF6', '#6D28D9'] },
  { id: 'mindfulness', label: 'Mindfulness', icon: 'meditation', color: '#14B8A6', gradient: ['#14B8A6', '#0D9488'] },
  { id: 'joy', label: 'Joy', icon: 'emoticon-happy', color: '#FBBF24', gradient: ['#FBBF24', '#F59E0B'] },
];

export default function MoodSelectionScreen() {
  const router = useRouter();
  const { setSelectedMood } = useContentStore();
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);

  const handleMoodSelect = (moodId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMoodId(moodId);
  };

  const handleContinue = () => {
    if (selectedMoodId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedMood(selectedMoodId);
      router.replace('/(tabs)/discover');
    }
  };

  const handleSkip = () => {
    setSelectedMood(null);
    router.replace('/(tabs)/discover');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling today?</Text>
          <Text style={styles.subtitle}>Select your current mood and we'll personalize your experience</Text>
        </View>

        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodCard,
                selectedMoodId === mood.id && styles.moodCardSelected
              ]}
              onPress={() => handleMoodSelect(mood.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedMoodId === mood.id ? mood.gradient : ['#1F2937', '#1F2937']}
                style={styles.moodGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name={mood.icon as any}
                  size={32}
                  color={selectedMoodId === mood.id ? '#FFF' : mood.color}
                />
                <Text style={[
                  styles.moodLabel,
                  selectedMoodId === mood.id && styles.moodLabelSelected
                ]}>
                  {mood.label}
                </Text>
              </LinearGradient>
              {selectedMoodId === mood.id && (
                <View style={styles.checkmark}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedMoodId && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!selectedMoodId}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  moodCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodCardSelected: {
    borderColor: '#14B8A6',
  },
  moodGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 12,
  },
  moodLabelSelected: {
    color: '#FFF',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#14B8A6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#374151',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
