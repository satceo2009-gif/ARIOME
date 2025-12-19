import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useContentStore } from '@/store/contentStore';

const { width } = Dimensions.get('window');

const MOOD_OPTIONS = [
  { id: 'healing', label: 'Healing', icon: 'heart-pulse', color: '#EC4899' },
  { id: 'growth', label: 'Growth', icon: 'trending-up', color: '#10B981' },
  { id: 'love', label: 'Love', icon: 'heart', color: '#F472B6' },
  { id: 'gratitude', label: 'Gratitude', icon: 'hand-heart', color: '#F59E0B' },
  { id: 'resilience', label: 'Resilience', icon: 'shield-check', color: '#8B5CF6' },
  { id: 'mindfulness', label: 'Mindfulness', icon: 'meditation', color: '#14B8A6' },
  { id: 'joy', label: 'Joy', icon: 'emoticon-happy', color: '#FBBF24' },
];

export default function MoodSelectionScreen() {
  const router = useRouter();
  const { setSelectedMood } = useContentStore();
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const handleContinue = () => {
    if (selectedMoods.length > 0) {
      setSelectedMood(selectedMoods[0]); // Primary mood
      router.replace('/(tabs)/discover');
    }
  };

  const handleSkip = () => {
    setSelectedMood(null);
    router.replace('/(tabs)/discover');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling today?</Text>
          <Text style={styles.subtitle}>Select one or more moods to personalize your experience</Text>
        </View>

        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedMoods.includes(mood.id);
            return (
              <TouchableOpacity
                key={mood.id}
                style={[styles.moodCard, isSelected && { borderColor: mood.color, borderWidth: 2 }]}
                onPress={() => toggleMood(mood.id)}
                activeOpacity={0.7}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={[mood.color, `${mood.color}99`]}
                    style={styles.moodGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name={mood.icon as any} size={28} color="#FFF" />
                    <Text style={styles.moodLabelSelected}>{mood.label}</Text>
                    <View style={styles.checkmark}>
                      <MaterialCommunityIcons name="check-circle" size={18} color="#FFF" />
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={styles.moodInner}>
                    <MaterialCommunityIcons name={mood.icon as any} size={28} color={mood.color} />
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedMoods.length > 0 && (
          <Text style={styles.selectedCount}>
            {selectedMoods.length} mood{selectedMoods.length > 1 ? 's' : ''} selected
          </Text>
        )}
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, selectedMoods.length === 0 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={selectedMoods.length === 0}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: (width - 52) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    position: 'relative',
  },
  moodInner: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
  },
  moodLabelSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  selectedCount: {
    textAlign: 'center',
    color: '#14B8A6',
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  continueButton: {
    backgroundColor: '#14B8A6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#374151',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
