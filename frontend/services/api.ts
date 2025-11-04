import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Backend API URL from environment or default
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://ariome-repo.preview.emergentagent.com/api';

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
  signup: async (email: string, name: string, password: string, intentions: string[]) => {
    const { data } = await api.post('/auth/signup', {
      email,
      name,
      password,
      intentions,
    });
    await AsyncStorage.setItem('auth_token', data.access_token);
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
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
};

// AI Recommendations API
export const recommendationsAPI = {
  getPersonalized: async () => {
    const { data } = await api.post('/stories/recommendations');
    return data;
  },
};

export default api;
