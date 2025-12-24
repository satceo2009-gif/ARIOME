import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/ariomeTheme';

interface WisdomCardProps {
  item: {
    id: string;
    title: string;
    type: 'capsule' | 'audio' | 'video' | 'reflection';
    duration?: number;
    thumbnailUrl?: string;
    excerpt?: string;
    author?: string;
  };
  onPress: () => void;
  showReflectPrompt?: boolean;
}

export default function WisdomCard({ item, onPress, showReflectPrompt = true }: WisdomCardProps) {
  const getTypeIcon = () => {
    switch (item.type) {
      case 'audio': return 'headphones';
      case 'video': return 'play-circle-outline';
      case 'capsule': return 'book-open-page-variant-outline';
      case 'reflection': return 'thought-bubble-outline';
      default: return 'book-open-page-variant-outline';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'audio': return ARIOME_COLORS.accent.lavender;
      case 'video': return ARIOME_COLORS.accent.rose;
      case 'capsule': return ARIOME_COLORS.consciousness.teal;
      case 'reflection': return ARIOME_COLORS.accent.amber;
      default: return ARIOME_COLORS.consciousness.teal;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'audio': return 'Listen';
      case 'video': return 'Watch';
      case 'capsule': return 'Read';
      case 'reflection': return 'Reflect';
      default: return 'Explore';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {item.thumbnailUrl && (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      )}
      
      <View style={styles.content}>
        <View style={styles.typeContainer}>
          <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor()}20` }]}>
            <MaterialCommunityIcons name={getTypeIcon() as any} size={14} color={getTypeColor()} />
            <Text style={[styles.typeText, { color: getTypeColor() }]}>{getTypeLabel()}</Text>
          </View>
          {item.duration && (
            <Text style={styles.duration}>{Math.floor(item.duration / 60)} min</Text>
          )}
        </View>
        
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        
        {item.excerpt && (
          <Text style={styles.excerpt} numberOfLines={2}>{item.excerpt}</Text>
        )}
        
        {item.author && (
          <Text style={styles.author}>{item.author}</Text>
        )}
        
        {showReflectPrompt && (
          <View style={styles.reflectPrompt}>
            <MaterialCommunityIcons name="thought-bubble-outline" size={14} color={ARIOME_COLORS.accent.amber} />
            <Text style={styles.reflectPromptText}>Reflect after</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    overflow: 'hidden',
    marginBottom: ARIOME_SPACING.md,
  },
  thumbnail: {
    width: 100,
    height: 120,
  },
  content: {
    flex: 1,
    padding: ARIOME_SPACING.md,
    justifyContent: 'space-between',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ARIOME_SPACING.xs,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ARIOME_SPACING.sm,
    paddingVertical: 3,
    borderRadius: ARIOME_BORDERS.radiusSmall,
    gap: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  duration: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    lineHeight: 20,
  },
  excerpt: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
    lineHeight: 18,
    marginTop: 4,
  },
  author: {
    fontSize: 12,
    color: ARIOME_COLORS.text.subtle,
    marginTop: 4,
  },
  reflectPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: ARIOME_SPACING.xs,
  },
  reflectPromptText: {
    fontSize: 11,
    color: ARIOME_COLORS.accent.amber,
    fontStyle: 'italic',
  },
});
