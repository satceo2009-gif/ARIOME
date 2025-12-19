import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Story {
  id: string;
  title: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    verified: boolean;
  };
  description: string;
  intentions: string[];
  duration: number;
  format: 'audio' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  resonanceCount: number;
  reflectionPrompts: {
    before: string;
    after: string;
  };
  tags: string[];
  createdAt: string;
  isPremium: boolean;
  price?: number;
}

interface RecentlyPlayed {
  storyId: string;
  playedAt: string;
  progress: number; // percentage
}

interface ContentStore {
  stories: Story[];
  savedStories: string[];
  recentlyPlayed: RecentlyPlayed[];
  currentStory: Story | null;
  selectedMood: string | null;
  setStories: (stories: Story[]) => void;
  setCurrentStory: (story: Story | null) => void;
  toggleSaveStory: (storyId: string) => void;
  addResonance: (storyId: string) => void;
  addToRecentlyPlayed: (storyId: string, progress?: number) => void;
  setSelectedMood: (mood: string | null) => void;
  getRecentlyPlayedStories: () => Story[];
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      stories: [],
      savedStories: [],
      recentlyPlayed: [],
      currentStory: null,
      selectedMood: null,
      
      setStories: (stories) => set({ stories }),
      
      setCurrentStory: (story) => set({ currentStory: story }),
      
      toggleSaveStory: (storyId) =>
        set((state) => ({
          savedStories: state.savedStories.includes(storyId)
            ? state.savedStories.filter((id) => id !== storyId)
            : [...state.savedStories, storyId],
        })),
      
      addResonance: (storyId) =>
        set((state) => ({
          stories: state.stories.map((story) =>
            story.id === storyId
              ? { ...story, resonanceCount: story.resonanceCount + 1 }
              : story
          ),
        })),
      
      addToRecentlyPlayed: (storyId, progress = 0) =>
        set((state) => {
          const filtered = state.recentlyPlayed.filter(r => r.storyId !== storyId);
          return {
            recentlyPlayed: [
              { storyId, playedAt: new Date().toISOString(), progress },
              ...filtered
            ].slice(0, 20) // Keep only last 20
          };
        }),
      
      setSelectedMood: (mood) => set({ selectedMood: mood }),
      
      getRecentlyPlayedStories: () => {
        const state = get();
        return state.recentlyPlayed
          .map(r => state.stories.find(s => s.id === r.storyId))
          .filter((s): s is Story => s !== undefined);
      },
    }),
    {
      name: 'ariome-content-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedStories: state.savedStories,
        recentlyPlayed: state.recentlyPlayed,
        selectedMood: state.selectedMood,
      }),
    }
  )
);
