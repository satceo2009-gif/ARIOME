import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS, REFLECTION_PROMPTS, ARIOME_MOODS } from '@/constants/ariomeTheme';

interface ReflectionInputProps {
  onSave: (reflection: {
    content: string;
    mood: string;
    prompt?: string;
  }) => void;
  initialPrompt?: string;
}

export default function ReflectionInput({ onSave, initialPrompt }: ReflectionInputProps) {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState(
    initialPrompt || REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)]
  );

  const shufflePrompt = () => {
    const newPrompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
    setCurrentPrompt(newPrompt);
  };

  const handleSave = () => {
    if (!content.trim() || !selectedMood) return;
    onSave({
      content: content.trim(),
      mood: selectedMood,
      prompt: currentPrompt,
    });
    setContent('');
    setSelectedMood(null);
  };

  const getMoodColor = (moodId: string) => {
    return ARIOME_MOODS.find(m => m.id === moodId)?.color || ARIOME_COLORS.consciousness.teal;
  };

  return (
    <View style={styles.container}>
      {/* Reflection Prompt */}
      <View style={styles.promptContainer}>
        <MaterialCommunityIcons name="lightbulb-outline" size={20} color={ARIOME_COLORS.accent.amber} />
        <Text style={styles.promptText}>{currentPrompt}</Text>
        <TouchableOpacity onPress={shufflePrompt} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="refresh" size={20} color={ARIOME_COLORS.text.muted} />
        </TouchableOpacity>
      </View>

      {/* Text Input */}
      <TextInput
        style={styles.textInput}
        placeholder="Let your thoughts flow..."
        placeholderTextColor={ARIOME_COLORS.text.disabled}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      {/* Mood Selector */}
      <Text style={styles.moodLabel}>How does this feel?</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodContainer}
      >
        {ARIOME_MOODS.slice(0, 7).map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodChip,
              selectedMood === mood.id && { 
                backgroundColor: `${mood.color}20`,
                borderColor: mood.color 
              }
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
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          (!content.trim() || !selectedMood) && styles.saveButtonDisabled
        ]}
        onPress={handleSave}
        disabled={!content.trim() || !selectedMood}
      >
        <MaterialCommunityIcons name="check" size={20} color="#FFF" />
        <Text style={styles.saveButtonText}>Save Reflection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: ARIOME_COLORS.background.primary,
    padding: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    marginBottom: ARIOME_SPACING.md,
    gap: ARIOME_SPACING.sm,
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    color: ARIOME_COLORS.text.secondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  textInput: {
    backgroundColor: ARIOME_COLORS.background.primary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
    color: ARIOME_COLORS.text.primary,
    fontSize: 16,
    minHeight: 120,
    marginBottom: ARIOME_SPACING.md,
    lineHeight: 24,
  },
  moodLabel: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginBottom: ARIOME_SPACING.sm,
  },
  moodContainer: {
    gap: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.lg,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.sm,
    paddingHorizontal: ARIOME_SPACING.md,
    backgroundColor: ARIOME_COLORS.background.primary,
    borderRadius: ARIOME_BORDERS.radiusRound,
    marginRight: ARIOME_SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  moodChipText: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
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
