import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { contentAPI, resonanceAPI, bookmarksAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import ConsciousHeader from '@/components/ConsciousHeader';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

interface WisdomItem {
  id: string;
  title: string;
  body: string;
  author?: string;
  intent_tags: string[];
  media_type?: string;
  resonance_count: number;
}

export default function WisdomScreen() {
  const { user } = useAuth();
  const [wisdom, setWisdom] = useState<WisdomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<WisdomItem | null>(null);
  const [resonated, setResonated] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWisdom();
    if (user) loadBookmarks();
  }, [user]);

  const loadWisdom = async () => {
    try {
      const data = await contentAPI.getWisdom();
      setWisdom(data);
    } catch (error) {
      console.error('Error loading wisdom:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const data = await bookmarksAPI.getAll('wisdom');
      setBookmarked(new Set(data.map((b: any) => b.content_id)));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const handleResonate = async (item: WisdomItem) => {
    if (resonated.has(item.id)) return;
    
    try {
      await resonanceAPI.add(item.id, 'wisdom');
      setResonated(prev => new Set([...prev, item.id]));
      setWisdom(prev => prev.map(w => 
        w.id === item.id ? { ...w, resonance_count: w.resonance_count + 1 } : w
      ));
    } catch (error) {
      console.error('Error adding resonance:', error);
    }
  };

  const handleBookmark = async (item: WisdomItem) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to bookmark wisdom.');
      return;
    }

    try {
      if (bookmarked.has(item.id)) {
        await bookmarksAPI.remove(item.id);
        setBookmarked(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      } else {
        await bookmarksAPI.add(item.id, 'wisdom');
        setBookmarked(prev => new Set([...prev, item.id]));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Selected Wisdom View (Reflect-after-consume)
  if (selectedItem) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.selectedContainer}>
          <View style={styles.selectedHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
              <MaterialCommunityIcons name="close" size={24} color={ARIOME_COLORS.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.bookmarkButton} 
              onPress={() => handleBookmark(selectedItem)}
            >
              <MaterialCommunityIcons 
                name={bookmarked.has(selectedItem.id) ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={bookmarked.has(selectedItem.id) ? ARIOME_COLORS.accent.amber : ARIOME_COLORS.text.primary} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.selectedContent}>
            <View style={styles.quoteContainer}>
              <MaterialCommunityIcons name="format-quote-open" size={40} color={ARIOME_COLORS.consciousness.tealMuted} />
              <Text style={styles.quoteText}>{selectedItem.body}</Text>
              {selectedItem.author && (
                <Text style={styles.quoteAuthor}>— {selectedItem.author}</Text>
              )}
            </View>

            {/* Reflect-after-consume Prompt */}
            <View style={styles.reflectPrompt}>
              <View style={styles.reflectHeader}>
                <MaterialCommunityIcons name="thought-bubble-outline" size={20} color={ARIOME_COLORS.accent.amber} />
                <Text style={styles.reflectLabel}>Reflect</Text>
              </View>
              <Text style={styles.reflectQuestion}>What does this wisdom stir within you?</Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.selectedActions}>
            <TouchableOpacity
              style={[
                styles.resonateButton,
                resonated.has(selectedItem.id) && styles.resonatedButton
              ]}
              onPress={() => handleResonate(selectedItem)}
            >
              <MaterialCommunityIcons
                name={resonated.has(selectedItem.id) ? "heart" : "heart-outline"}
                size={20}
                color={resonated.has(selectedItem.id) ? ARIOME_COLORS.accent.rose : ARIOME_COLORS.text.primary}
              />
              <Text style={[
                styles.resonateText,
                resonated.has(selectedItem.id) && { color: ARIOME_COLORS.accent.rose }
              ]}>
                {resonated.has(selectedItem.id) ? 'Resonated' : 'This resonates'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.closeDetailButton} onPress={() => setSelectedItem(null)}>
              <Text style={styles.closeDetailText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ConsciousHeader showSettings />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wisdom Library</Text>
          <Text style={styles.headerSubtitle}>Curated insights for reflection, not consumption</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
          </View>
        ) : (
          <View style={styles.wisdomList}>
            {wisdom.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.wisdomCard}
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.8}
              >
                <View style={styles.wisdomCardHeader}>
                  <MaterialCommunityIcons name="book-open-page-variant-outline" size={20} color={ARIOME_COLORS.consciousness.teal} />
                  <Text style={styles.wisdomTitle}>{item.title}</Text>
                  <TouchableOpacity 
                    style={styles.cardBookmark}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleBookmark(item);
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={bookmarked.has(item.id) ? "bookmark" : "bookmark-outline"} 
                      size={20} 
                      color={bookmarked.has(item.id) ? ARIOME_COLORS.accent.amber : ARIOME_COLORS.text.muted} 
                    />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.wisdomBody} numberOfLines={3}>
                  {item.body}
                </Text>
                
                {item.author && (
                  <Text style={styles.wisdomAuthor}>— {item.author}</Text>
                )}
                
                <View style={styles.wisdomFooter}>
                  <View style={styles.resonanceCount}>
                    <MaterialCommunityIcons
                      name={resonated.has(item.id) ? "heart" : "heart-outline"}
                      size={16}
                      color={resonated.has(item.id) ? ARIOME_COLORS.accent.rose : ARIOME_COLORS.text.muted}
                    />
                    <Text style={styles.resonanceText}>{item.resonance_count} resonated</Text>
                  </View>
                  <Text style={styles.tapToReflect}>Tap to reflect</Text>
                </View>
              </TouchableOpacity>
            ))}

            {wisdom.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="book-open-page-variant-outline" size={64} color={ARIOME_COLORS.text.subtle} />
                <Text style={styles.emptyText}>No wisdom content yet</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  wisdomList: {
    gap: ARIOME_SPACING.md,
  },
  wisdomCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
  },
  wisdomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.sm,
  },
  wisdomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    flex: 1,
  },
  cardBookmark: {
    padding: 4,
  },
  wisdomBody: {
    fontSize: 15,
    color: ARIOME_COLORS.text.secondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  wisdomAuthor: {
    fontSize: 13,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.sm,
  },
  wisdomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ARIOME_SPACING.md,
    paddingTop: ARIOME_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  resonanceCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resonanceText: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  tapToReflect: {
    fontSize: 12,
    color: ARIOME_COLORS.consciousness.teal,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.sacred,
  },
  emptyText: {
    fontSize: 16,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.md,
  },
  // Selected View
  selectedContainer: {
    flex: 1,
    padding: ARIOME_SPACING.lg,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ARIOME_COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ARIOME_COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: ARIOME_SPACING.xl,
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.xl,
  },
  quoteText: {
    fontSize: 22,
    fontStyle: 'italic',
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: ARIOME_SPACING.md,
  },
  quoteAuthor: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.lg,
  },
  reflectPrompt: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: ARIOME_COLORS.accent.amber,
  },
  reflectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ARIOME_SPACING.sm,
    marginBottom: ARIOME_SPACING.sm,
  },
  reflectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ARIOME_COLORS.accent.amber,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reflectQuestion: {
    fontSize: 16,
    color: ARIOME_COLORS.text.secondary,
    fontStyle: 'italic',
  },
  selectedActions: {
    gap: ARIOME_SPACING.md,
  },
  resonateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ARIOME_COLORS.background.secondary,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    gap: ARIOME_SPACING.sm,
  },
  resonatedButton: {
    backgroundColor: `${ARIOME_COLORS.accent.rose}15`,
  },
  resonateText: {
    fontSize: 16,
    color: ARIOME_COLORS.text.primary,
  },
  closeDetailButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    alignItems: 'center',
  },
  closeDetailText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
