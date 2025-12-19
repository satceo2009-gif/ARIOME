import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

// Default journal entries for display
const DEFAULT_ENTRIES = [
  {
    id: '1',
    title: 'Morning Reflection',
    content: 'Today I woke up feeling grateful for the little things in life...',
    mood: 'grateful',
    tags: ['morning', 'gratitude'],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Evening Thoughts',
    content: 'After a long day, I found peace in meditation...',
    mood: 'peaceful',
    tags: ['evening', 'meditation'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function JournalScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>(DEFAULT_ENTRIES);
  const [reflections, setReflections] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('entries');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'peaceful' });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMoodEmoji = (mood: string) => {
    const moods: any = {
      happy: '😊',
      peaceful: '😌',
      grateful: '🙏',
      sad: '😢',
      anxious: '😰',
      calm: '🧘',
      excited: '🎉',
      reflective: '🤔',
    };
    return moods[mood] || '💭';
  };

  const handleCreateEntry = () => {
    if (!newEntry.title || !newEntry.content) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }
    const entry = {
      id: Date.now().toString(),
      ...newEntry,
      tags: [],
      created_at: new Date().toISOString(),
    };
    setEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '', mood: 'peaceful' });
    setShowCreateModal(false);
    Alert.alert('Success', 'Journal entry created!');
  };

  const stats = {
    totalEntries: entries.length,
    totalReflections: reflections.length,
    streak: 7,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="notebook" size={24} color="#14B8A6" />
          <Text style={styles.statValue}>{stats.totalEntries}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="thought-bubble" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.totalReflections}</Text>
          <Text style={styles.statLabel}>Reflections</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={24} color="#EF4444" />
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'entries' && styles.tabActive]}
          onPress={() => setSelectedTab('entries')}
        >
          <Text style={[styles.tabText, selectedTab === 'entries' && styles.tabTextActive]}>
            My Entries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'reflections' && styles.tabActive]}
          onPress={() => setSelectedTab('reflections')}
        >
          <Text style={[styles.tabText, selectedTab === 'reflections' && styles.tabTextActive]}>
            Reflections
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'entries' ? (
          entries.length > 0 ? (
            entries.map((entry) => (
              <TouchableOpacity key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryMood}>{getMoodEmoji(entry.mood)}</Text>
                  <Text style={styles.entryDate}>{formatDate(entry.created_at)}</Text>
                </View>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryContent} numberOfLines={2}>{entry.content}</Text>
                {entry.tags?.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {entry.tags.map((tag: string, i: number) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="notebook-outline" size={64} color="#6B7280" />
              <Text style={styles.emptyText}>No entries yet</Text>
              <Text style={styles.emptySubtext}>Start journaling your thoughts</Text>
              <TouchableOpacity 
                style={styles.createEntryBtn}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createEntryBtnText}>Create First Entry</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="thought-bubble-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyText}>No reflections yet</Text>
            <Text style={styles.emptySubtext}>Reflections from stories will appear here</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Entry Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Journal Entry</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Entry title"
              placeholderTextColor="#6B7280"
              value={newEntry.title}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What's on your mind?"
              placeholderTextColor="#6B7280"
              value={newEntry.content}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, content: text }))}
              multiline
              numberOfLines={6}
            />

            <Text style={styles.moodLabel}>How are you feeling?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodSelector}>
              {['happy', 'peaceful', 'grateful', 'reflective', 'anxious', 'sad'].map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[styles.moodOption, newEntry.mood === mood && styles.moodOptionActive]}
                  onPress={() => setNewEntry(prev => ({ ...prev, mood }))}
                >
                  <Text style={styles.moodOptionEmoji}>{getMoodEmoji(mood)}</Text>
                  <Text style={[styles.moodOptionText, newEntry.mood === mood && styles.moodOptionTextActive]}>
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleCreateEntry}>
              <Text style={styles.saveButtonText}>Save Entry</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#14B8A6',
  },
  tabText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  entryCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryMood: {
    fontSize: 24,
  },
  entryDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#14B8A6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  createEntryBtn: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  createEntryBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  moodLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  moodSelector: {
    marginBottom: 24,
  },
  moodOption: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#374151',
    marginRight: 10,
  },
  moodOptionActive: {
    backgroundColor: '#14B8A6',
  },
  moodOptionEmoji: {
    fontSize: 24,
  },
  moodOptionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  moodOptionTextActive: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
