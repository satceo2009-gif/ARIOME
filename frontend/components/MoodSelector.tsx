import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ARIOME_MOODS, ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/ariomeTheme';

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelect: (moodId: string) => void;
  showDescription?: boolean;
  horizontal?: boolean;
}

export default function MoodSelector({ 
  selectedMood, 
  onSelect, 
  showDescription = false,
  horizontal = false 
}: MoodSelectorProps) {
  if (horizontal) {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContainer}
      >
        {ARIOME_MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.horizontalMoodItem,
                isSelected && { backgroundColor: `${mood.color}20`, borderColor: mood.color }
              ]}
              onPress={() => onSelect(mood.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name={mood.icon as any} 
                size={24} 
                color={isSelected ? mood.color : ARIOME_COLORS.text.muted} 
              />
              <Text style={[
                styles.horizontalMoodLabel,
                isSelected && { color: mood.color }
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {ARIOME_MOODS.map((mood) => {
        const isSelected = selectedMood === mood.id;
        return (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodCard,
              isSelected && { 
                backgroundColor: `${mood.color}15`, 
                borderColor: mood.color,
                borderWidth: 2 
              }
            ]}
            onPress={() => onSelect(mood.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              { backgroundColor: `${mood.color}20` }
            ]}>
              <MaterialCommunityIcons 
                name={mood.icon as any} 
                size={28} 
                color={mood.color} 
              />
            </View>
            <Text style={[
              styles.moodLabel,
              isSelected && { color: mood.color, fontWeight: '600' }
            ]}>
              {mood.label}
            </Text>
            {showDescription && (
              <Text style={styles.moodDescription}>{mood.description}</Text>
            )}
            {isSelected && (
              <View style={[styles.checkmark, { backgroundColor: mood.color }]}>
                <MaterialCommunityIcons name="check" size={14} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: '48%',
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ARIOME_SPACING.sm,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
    textAlign: 'center',
  },
  moodDescription: {
    fontSize: 11,
    color: ARIOME_COLORS.text.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    paddingHorizontal: ARIOME_SPACING.md,
    gap: ARIOME_SPACING.sm,
  },
  horizontalMoodItem: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.md,
    paddingHorizontal: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    backgroundColor: ARIOME_COLORS.background.secondary,
    marginRight: ARIOME_SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
  },
  horizontalMoodLabel: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    marginTop: 6,
    fontWeight: '500',
  },
});
