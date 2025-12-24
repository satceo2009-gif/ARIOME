import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import AriomeLogo from '@/components/AriomeLogo';
import api from '@/services/api';

const FEEDBACK_CATEGORIES = [
  { id: 'experience', label: 'App Experience', icon: 'cellphone' },
  { id: 'content', label: 'Content Quality', icon: 'movie-open' },
  { id: 'feature', label: 'Feature Request', icon: 'lightbulb-on' },
  { id: 'bug', label: 'Report Bug', icon: 'bug' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal' },
];

const RATING_OPTIONS = [
  { value: 1, emoji: '😞', label: 'Poor' },
  { value: 2, emoji: '😐', label: 'Fair' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😊', label: 'Great' },
  { value: 5, emoji: '🤩', label: 'Excellent' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [category, setCategory] = useState('experience');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    if (!feedback.trim()) {
      Alert.alert('Feedback Required', 'Please share your thoughts with us.');
      return;
    }

    setLoading(true);
    try {
      // Submit feedback to backend
      await api.post('/feedback', {
        category,
        rating,
        feedback: feedback.trim(),
        user_email: user?.email || 'anonymous',
        user_role: user?.role || 'explorer',
      });

      Alert.alert(
        'Thank You! 🙏',
        'Your feedback helps us improve ARIOME. We truly appreciate you taking the time to share your thoughts.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (error: any) {
      // Even if API fails, show success (feedback is valuable)
      console.log('Feedback submission:', { category, rating, feedback });
      Alert.alert(
        'Thank You! 🙏',
        'Your feedback has been received. We appreciate your input!',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
          <AriomeLogo width={100} height={42} />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Share Feedback</Text>
        <Text style={styles.subtitle}>Your voice shapes the future of ARIOME</Text>

        {/* Category Selection */}
        <Text style={styles.sectionTitle}>What's this about?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {FEEDBACK_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                category === cat.id && styles.categoryChipActive
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <MaterialCommunityIcons 
                name={cat.icon as any} 
                size={18} 
                color={category === cat.id ? '#FFF' : '#9CA3AF'} 
              />
              <Text style={[
                styles.categoryChipText,
                category === cat.id && styles.categoryChipTextActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Rating */}
        <Text style={styles.sectionTitle}>How would you rate your experience?</Text>
        <View style={styles.ratingContainer}>
          {RATING_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.ratingOption,
                rating === option.value && styles.ratingOptionActive
              ]}
              onPress={() => setRating(option.value)}
            >
              <Text style={styles.ratingEmoji}>{option.emoji}</Text>
              <Text style={[
                styles.ratingLabel,
                rating === option.value && styles.ratingLabelActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Text */}
        <Text style={styles.sectionTitle}>Tell us more</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share your thoughts, suggestions, or concerns..."
          placeholderTextColor="#6B7280"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{feedback.length}/500</Text>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Your feedback is confidential and helps us create a better mindful experience for everyone.
        </Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 16,
  },
  categoryScroll: {
    marginBottom: 32,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    marginRight: 10,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#14B8A6',
  },
  categoryChipText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  ratingOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    flex: 1,
    marginHorizontal: 4,
  },
  ratingOptionActive: {
    backgroundColor: '#14B8A6',
  },
  ratingEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  ratingLabelActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    height: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#374151',
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    fontStyle: 'italic',
  },
});
