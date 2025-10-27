import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  content: string;
  storyId?: string;
}

const MOODS = [
  { emoji: '😊', label: 'Joyful', color: '#FBBF24' },
  { emoji: '😌', label: 'Peaceful', color: '#8B5CF6' },
  { emoji: '💪', label: 'Strong', color: '#F59E0B' },
  { emoji: '💚', label: 'Healing', color: '#10B981' },
  { emoji: '🤔', label: 'Reflective', color: '#06B6D4' },
  { emoji: '😔', label: 'Heavy', color: '#6B7280' },
];

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [content, setContent] = useState('');

  const handleSaveEntry = () => {
    if (content.trim() && selectedMood) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mood: selectedMood,
        content: content.trim(),
      };
      setEntries([newEntry, ...entries]);
      setContent('');
      setSelectedMood('');
      setIsWriting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Reflection Journal</Text>
          <Text style={styles.subtitle}>Track your inner journey</Text>
        </View>
        {!isWriting && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsWriting(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isWriting && (
          <View style={styles.writingContainer}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.label}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.label && {
                      backgroundColor: `${mood.color}30`,
                      borderColor: mood.color,
                    },
                  ]}
                  onPress={() => setSelectedMood(mood.label)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      selectedMood === mood.label && { color: mood.color },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Your Reflection</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind and heart today?"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={8}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsWriting(false);
                  setContent('');
                  setSelectedMood('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!content.trim() || !selectedMood) && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveEntry}
                disabled={!content.trim() || !selectedMood}
              >
                <Text style={styles.saveButtonText}>Save Reflection</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {entries.length > 0 ? (
          <View style={styles.entriesContainer}>
            {entries.map((entry) => {
              const mood = MOODS.find((m) => m.label === entry.mood);
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.moodIndicator}>
                      <Text style={styles.entryMoodEmoji}>{mood?.emoji}</Text>
                      <Text
                        style={[
                          styles.entryMoodLabel,
                          { color: mood?.color || '#9CA3AF' },
                        ]}
                      >
                        {entry.mood}
                      </Text>
                    </View>
                    <Text style={styles.entryDate}>
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </Text>
                  </View>
                  <Text style={styles.entryContent}>{entry.content}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          !isWriting && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="notebook-outline"
                size={64}
                color="#4B5563"
              />
              <Text style={styles.emptyTitle}>Start Your Journal</Text>
              <Text style={styles.emptySubtitle}>
                Capture your thoughts, feelings, and insights from your conscious
                journey
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => setIsWriting(true)}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
                <Text style={styles.startButtonText}>Write Your First Entry</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  writingContainer: {
    padding: 20,
    backgroundColor: '#1A1A24',
    margin: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0A0A0F',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 90,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#FFF',
    minHeight: 160,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#4B5563',
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  entriesContainer: {
    padding: 20,
  },
  entryCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryMoodEmoji: {
    fontSize: 24,
  },
  entryMoodLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  entryContent: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
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
    lineHeight: 22,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14B8A6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
