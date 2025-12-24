import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { contentAPI, reflectionAPI, transcribeAPI } from '@/services/api';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

interface Mood {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface Reflection {
  id: string;
  content: string;
  mood_before?: string;
  mood_after?: string;
  created_at: string;
}

export default function JournalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New reflection form state
  const [content, setContent] = useState('');
  const [moodBefore, setMoodBefore] = useState<string | null>(params.mood as string || null);
  const [moodAfter, setMoodAfter] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    loadData();
    // If coming from reflect screen with prompt
    if (params.prompt) {
      setContent(`Reflecting on: "${params.prompt}"\n\n`);
      setShowModal(true);
    }
  }, []);

  const loadData = async () => {
    try {
      const [moodsData, reflectionsData] = await Promise.all([
        contentAPI.getMoods().catch(() => []),
        reflectionAPI.getAll().catch(() => []),
      ]);
      setMoods(moodsData);
      setReflections(reflectionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodInfo = (moodId: string) => moods.find(m => m.id === moodId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      // First try OpenAI Whisper via backend
      const result = await transcribeAPI.transcribe(audioBlob);
      if (result.success && result.text) {
        setContent(prev => prev + result.text + ' ');
      }
    } catch (error) {
      console.error('Whisper transcription failed, trying Web Speech API:', error);
      // Fallback to Web Speech API
      try {
        const text = await useWebSpeechAPI();
        setContent(prev => prev + text + ' ');
      } catch (webError) {
        console.error('Web Speech API also failed:', webError);
        Alert.alert('Transcription Failed', 'Could not transcribe audio. Please type your reflection.');
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const useWebSpeechAPI = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(event.error));
      };

      recognition.start();
    });
  };

  const handleSaveReflection = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      await reflectionAPI.create({
        content: content.trim(),
        mood_before: moodBefore || undefined,
        mood_after: moodAfter || undefined,
        prompt_id: params.promptId as string || undefined,
        intent_tags: user?.intentions || [],
      });
      
      // Reset and close
      setContent('');
      setMoodBefore(null);
      setMoodAfter(null);
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving reflection:', error);
      Alert.alert('Error', 'Failed to save reflection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="notebook-outline" size={64} color={ARIOME_COLORS.text.subtle} />
          <Text style={styles.emptyTitle}>Your Inner Journal</Text>
          <Text style={styles.emptySubtitle}>Sign in to start journaling your reflections</Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/auth')}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Your Journal</Text>
            <Text style={styles.headerSubtitle}>Private space for your reflections</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
          </View>
        ) : reflections.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="notebook-edit-outline" size={64} color={ARIOME_COLORS.text.subtle} />
            <Text style={styles.emptyTitle}>No reflections yet</Text>
            <Text style={styles.emptySubtitle}>Start your inner journey by writing your first reflection</Text>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
              <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
              <Text style={styles.createButtonText}>Write Reflection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.reflectionsList}>
            {reflections.map((reflection) => (
              <View key={reflection.id} style={styles.reflectionCard}>
                <View style={styles.reflectionHeader}>
                  {reflection.mood_before && (
                    <View style={[styles.moodBadge, { backgroundColor: `${getMoodInfo(reflection.mood_before)?.color}20` }]}>
                      <MaterialCommunityIcons
                        name={getMoodInfo(reflection.mood_before)?.icon as any}
                        size={16}
                        color={getMoodInfo(reflection.mood_before)?.color}
                      />
                    </View>
                  )}
                  {reflection.mood_after && reflection.mood_before !== reflection.mood_after && (
                    <>
                      <MaterialCommunityIcons name="arrow-right" size={14} color={ARIOME_COLORS.text.subtle} />
                      <View style={[styles.moodBadge, { backgroundColor: `${getMoodInfo(reflection.mood_after)?.color}20` }]}>
                        <MaterialCommunityIcons
                          name={getMoodInfo(reflection.mood_after)?.icon as any}
                          size={16}
                          color={getMoodInfo(reflection.mood_after)?.color}
                        />
                      </View>
                    </>
                  )}
                  <Text style={styles.reflectionDate}>{formatDate(reflection.created_at)}</Text>
                </View>
                <Text style={styles.reflectionContent}>{reflection.content}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Reflection Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Reflection</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={ARIOME_COLORS.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Pre-reflection Mood */}
              <Text style={styles.moodSectionLabel}>How are you feeling before reflecting?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
                {moods.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodChip,
                      moodBefore === mood.id && { backgroundColor: `${mood.color}20`, borderColor: mood.color },
                    ]}
                    onPress={() => setMoodBefore(mood.id)}
                  >
                    <MaterialCommunityIcons
                      name={mood.icon as any}
                      size={20}
                      color={moodBefore === mood.id ? mood.color : ARIOME_COLORS.text.muted}
                    />
                    <Text style={[styles.moodChipText, moodBefore === mood.id && { color: mood.color }]}>
                      {mood.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Content Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Let your thoughts flow..."
                  placeholderTextColor={ARIOME_COLORS.text.disabled}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
                
                {/* Voice Input Button */}
                <TouchableOpacity
                  style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? (
                    <ActivityIndicator size="small" color={ARIOME_COLORS.consciousness.teal} />
                  ) : (
                    <MaterialCommunityIcons
                      name={isRecording ? 'stop' : 'microphone'}
                      size={24}
                      color={isRecording ? ARIOME_COLORS.semantic.error : ARIOME_COLORS.consciousness.teal}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {isRecording && (
                <Text style={styles.recordingText}>Recording... Tap stop when finished</Text>
              )}

              {/* Post-reflection Mood */}
              <Text style={styles.moodSectionLabel}>How do you feel after reflecting?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
                {moods.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodChip,
                      moodAfter === mood.id && { backgroundColor: `${mood.color}20`, borderColor: mood.color },
                    ]}
                    onPress={() => setMoodAfter(mood.id)}
                  >
                    <MaterialCommunityIcons
                      name={mood.icon as any}
                      size={20}
                      color={moodAfter === mood.id ? mood.color : ARIOME_COLORS.text.muted}
                    />
                    <Text style={[styles.moodChipText, moodAfter === mood.id && { color: mood.color }]}>
                      {mood.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, (!content.trim() || saving) && styles.saveButtonDisabled]}
              onPress={handleSaveReflection}
              disabled={!content.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                  <Text style={styles.saveButtonText}>Save Reflection</Text>
                </>
              )}
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
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  content: {
    padding: ARIOME_SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: ARIOME_SPACING.xl,
  },
  signInButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingHorizontal: ARIOME_SPACING.xl,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    marginTop: ARIOME_SPACING.lg,
  },
  signInButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    marginTop: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.sm,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reflectionsList: {
    gap: ARIOME_SPACING.md,
  },
  reflectionCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.sm,
  },
  moodBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reflectionDate: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    marginLeft: 'auto',
  },
  reflectionContent: {
    fontSize: 15,
    color: ARIOME_COLORS.text.secondary,
    lineHeight: 22,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderTopLeftRadius: ARIOME_BORDERS.radiusXL,
    borderTopRightRadius: ARIOME_BORDERS.radiusXL,
    padding: ARIOME_SPACING.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
  },
  moodSectionLabel: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginBottom: ARIOME_SPACING.sm,
    marginTop: ARIOME_SPACING.md,
  },
  moodScroll: {
    marginBottom: ARIOME_SPACING.md,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.sm,
    borderRadius: ARIOME_BORDERS.radiusRound,
    backgroundColor: ARIOME_COLORS.background.primary,
    marginRight: ARIOME_SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  moodChipText: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: ARIOME_SPACING.md,
  },
  textInput: {
    backgroundColor: ARIOME_COLORS.background.primary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    paddingRight: 60,
    color: ARIOME_COLORS.text.primary,
    fontSize: 16,
    minHeight: 150,
    lineHeight: 24,
  },
  voiceButton: {
    position: 'absolute',
    right: ARIOME_SPACING.sm,
    bottom: ARIOME_SPACING.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ARIOME_COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonActive: {
    backgroundColor: `${ARIOME_COLORS.semantic.error}20`,
  },
  recordingText: {
    fontSize: 12,
    color: ARIOME_COLORS.semantic.error,
    textAlign: 'center',
    marginBottom: ARIOME_SPACING.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    marginTop: ARIOME_SPACING.md,
    gap: ARIOME_SPACING.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
