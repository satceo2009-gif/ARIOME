import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  intentions: string[];
  avatar?: string;
}

interface UserStore {
  user: User | null;
  isOnboarded: boolean;
  setUser: (user: User) => void;
  setIntentions: (intentions: string[]) => void;
  completeOnboarding: () => void;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isOnboarded: false,
  
  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem('user', JSON.stringify(user));
  },
  
  setIntentions: (intentions) => {
    set((state) => ({
      user: state.user ? { ...state.user, intentions } : null,
    }));
  },
  
  completeOnboarding: async () => {
    set({ isOnboarded: true });
    await AsyncStorage.setItem('isOnboarded', 'true');
  },
  
  logout: async () => {
    set({ user: null, isOnboarded: false });
    await AsyncStorage.multiRemove(['user', 'isOnboarded']);
  },
  
  loadUser: async () => {
    try {
      const [userData, onboardedStatus] = await AsyncStorage.multiGet(['user', 'isOnboarded']);
      if (userData[1]) {
        set({ user: JSON.parse(userData[1]) });
      }
      if (onboardedStatus[1]) {
        set({ isOnboarded: true });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  },
}));
