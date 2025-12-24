import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Backend API URL from environment or default
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://logohomelink.preview.emergentagent.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const { data } = await api.post('/auth/signup', {
      email,
      name,
      password,
      intentions: [], // Will be set during onboarding
    });
    await AsyncStorage.setItem('auth_token', data.access_token);
    return data;
  },

  login: async ({ email, password }: { email: string; password: string }) => {
    // Backend expects form data with "username" field (OAuth2 standard)
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const { data } = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    await AsyncStorage.setItem('auth_token', data.access_token);
    return data;
  },

  upgradeToSubscriber: async ({ email, name, password }: { email: string; name: string; password: string }) => {
    const { data } = await api.post('/auth/upgrade-to-subscriber', {
      email,
      name,
      password,
    });
    await AsyncStorage.setItem('auth_token', data.access_token);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  updateProfile: async (profileData: { name?: string; bio?: string; avatar?: string }) => {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const { data } = await api.put('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
  },
};

// Stories API
export const storiesAPI = {
  getAll: async (intention?: string, format?: string) => {
    const params: any = {};
    if (intention) params.intention = intention;
    if (format) params.format = format;
    
    const { data } = await api.get('/stories', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/stories/${id}`);
    return data;
  },

  addResonance: async (id: string) => {
    const { data } = await api.post(`/stories/${id}/resonance`);
    return data;
  },
};

// Journal API
export const journalAPI = {
  createEntry: async (entry: {
    title: string;
    content: string;
    mood?: string;
    tags?: string[];
  }) => {
    const { data } = await api.post('/journal/entries', entry);
    return data;
  },

  getEntries: async () => {
    const { data } = await api.get('/journal/entries');
    return data;
  },

  createReflection: async (reflection: {
    story_id: string;
    mood?: string;
    before_reflection?: string;
    after_reflection?: string;
  }) => {
    const { data } = await api.post('/journal/reflections', reflection);
    return data;
  },

  getReflections: async () => {
    const { data } = await api.get('/journal/reflections');
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/journal/stats');
    return data;
  },
};

// Circles API
export const circlesAPI = {
  getAll: async (intention?: string) => {
    const params: any = {};
    if (intention) params.intention = intention;
    const { data } = await api.get('/circles', { params });
    return data;
  },

  create: async (circle: {
    name: string;
    description: string;
    intention?: string;
    is_private?: boolean;
  }) => {
    const { data } = await api.post('/circles', circle);
    return data;
  },

  join: async (circleId: string) => {
    const { data } = await api.post(`/circles/${circleId}/join`);
    return data;
  },

  leave: async (circleId: string) => {
    const { data } = await api.post(`/circles/${circleId}/leave`);
    return data;
  },

  getPosts: async (circleId: string) => {
    const { data } = await api.get(`/circles/${circleId}/posts`);
    return data;
  },

  createPost: async (circleId: string, post: {
    content: string;
    post_type?: string;
  }) => {
    const { data } = await api.post(`/circles/${circleId}/posts`, post);
    return data;
  },
};

// Creator API
export const creatorAPI = {
  uploadStory: async (story: {
    title: string;
    description: string;
    intentions: string[];
    format: string;
    media_url: string;
    thumbnail_url?: string;
    duration?: number;
    tags?: string[];
    is_premium?: boolean;
    price?: number;
  }) => {
    const { data } = await api.post('/creator/upload', story);
    return data;
  },

  getMyStories: async () => {
    const { data } = await api.get('/creator/my-stories');
    return data;
  },

  getAnalytics: async () => {
    const { data } = await api.get('/creator/analytics');
    return data;
  },

  deleteStory: async (storyId: string) => {
    const { data } = await api.delete(`/creator/stories/${storyId}`);
    return data;
  },

  // Creator Application
  apply: async (application: {
    name: string;
    email: string;
    password: string;
    bio: string;
    description: string;
    website?: string;
    profile_image_url?: string;
    social_media?: {
      instagram?: string;
      youtube?: string;
      twitter?: string;
      linkedin?: string;
      tiktok?: string;
      facebook?: string;
      spotify?: string;
      soundcloud?: string;
    };
  }) => {
    const { data } = await api.post('/creator-application/apply', application);
    return data;
  },

  checkApplicationStatus: async (email: string) => {
    const { data } = await api.get(`/creator-application/my-application?email=${email}`);
    return data;
  },
};

// Library API
export const libraryAPI = {
  getSavedStories: async () => {
    const { data } = await api.get('/library/saved');
    return data;
  },

  saveStory: async (storyId: string) => {
    const { data } = await api.post('/library/save', { story_id: storyId });
    return data;
  },

  unsaveStory: async (storyId: string) => {
    const { data } = await api.delete(`/library/save/${storyId}`);
    return data;
  },

  checkIfSaved: async (storyId: string) => {
    const { data } = await api.get(`/library/check-saved/${storyId}`);
    return data;
  },

  getPlayHistory: async (limit: number = 50) => {
    const { data } = await api.get(`/library/history?limit=${limit}`);
    return data;
  },

  addToHistory: async (storyId: string, progress: number = 0) => {
    const { data } = await api.post('/library/history', { story_id: storyId, progress });
    return data;
  },

  removeFromHistory: async (storyId: string) => {
    const { data } = await api.delete(`/library/history/${storyId}`);
    return data;
  },

  clearHistory: async () => {
    const { data } = await api.delete('/library/history');
    return data;
  },
};

// Speech-to-Text API
export const speechAPI = {
  transcribe: async (audioBase64: string, fileType: string = 'mp3', language: string = 'en') => {
    const { data } = await api.post('/speech/transcribe-base64', {
      audio_base64: audioBase64,
      file_type: fileType,
      language
    });
    return data;
  },
};

// AI Recommendations API
export const recommendationsAPI = {
  getPersonalized: async () => {
    const { data } = await api.post('/stories/recommendations');
    return data;
  },
};

export default api;
