import { create } from 'zustand';

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
  duration: number; // in seconds
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

interface ContentStore {
  stories: Story[];
  savedStories: string[];
  currentStory: Story | null;
  setStories: (stories: Story[]) => void;
  setCurrentStory: (story: Story | null) => void;
  toggleSaveStory: (storyId: string) => void;
  addResonance: (storyId: string) => void;
}

export const useContentStore = create<ContentStore>((set) => ({
  stories: [],
  savedStories: [],
  currentStory: null,
  
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
}));
