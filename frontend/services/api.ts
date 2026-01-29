import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://peaceful-living-5.preview.emergentagent.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth header to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    if (response.data.session_token) {
      await AsyncStorage.setItem('session_token', response.data.session_token);
    }
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.session_token) {
      await AsyncStorage.setItem('session_token', response.data.session_token);
    }
    return response.data;
  },
  
  createGuest: async (intentions: string[] = [], language: string = 'en') => {
    const response = await api.post('/auth/guest', { intentions, language });
    if (response.data.session_token) {
      await AsyncStorage.setItem('session_token', response.data.session_token);
    }
    return response.data;
  },
  
  processOAuthSession: async (sessionId: string) => {
    const response = await api.get(`/auth/session?session_id=${sessionId}`);
    if (response.data.session_token) {
      await AsyncStorage.setItem('session_token', response.data.session_token);
    }
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    await AsyncStorage.removeItem('session_token');
  },
  
  updateProfile: async (data: { intentions?: string[], language?: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

// Content API
export const contentAPI = {
  getPrompts: async (params?: { intent?: string, time_of_day?: string, language?: string }) => {
    const response = await api.get('/prompts', { params });
    return response.data;
  },
  
  getDailyPrompt: async () => {
    const response = await api.get('/prompts/daily');
    return response.data;
  },
  
  getPractices: async (params?: { category?: string, intent?: string, language?: string }) => {
    const response = await api.get('/practices', { params });
    return response.data;
  },
  
  getWisdom: async (params?: { intent?: string, media_type?: string, language?: string }) => {
    const response = await api.get('/wisdom', { params });
    return response.data;
  },
  
  getMoods: async () => {
    const response = await api.get('/moods');
    return response.data;
  },
  
  getIntentions: async () => {
    const response = await api.get('/intentions');
    return response.data;
  },
};

// Reflection API
export const reflectionAPI = {
  create: async (data: {
    content: string;
    prompt_id?: string;
    mood_before?: string;
    mood_after?: string;
    voice_url?: string;
    image_urls?: string[];
    intent_tags?: string[];
  }) => {
    const response = await api.post('/reflections', data);
    return response.data;
  },
  
  getAll: async (params?: { limit?: number, skip?: number }) => {
    const response = await api.get('/reflections', { params });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/reflections/stats');
    return response.data;
  },
};

// Resonance API
export const resonanceAPI = {
  add: async (contentId: string, contentType: string) => {
    const response = await api.post('/resonance', { content_id: contentId, content_type: contentType });
    return response.data;
  },
};

// Circles API
export const circlesAPI = {
  getAll: async (intention?: string) => {
    const params = intention ? { intention } : {};
    const response = await api.get('/circles', { params });
    return response.data;
  },
  
  getPublic: async (intention?: string) => {
    const params = intention ? { intention } : {};
    const response = await api.get('/circles/public', { params });
    return response.data;
  },
  
  create: async (data: { name: string; description: string; intention: string; is_private: boolean }) => {
    const response = await api.post('/circles', data);
    return response.data;
  },
  
  join: async (circleId: string) => {
    const response = await api.post(`/circles/${circleId}/join`);
    return response.data;
  },
  
  leave: async (circleId: string) => {
    const response = await api.post(`/circles/${circleId}/leave`);
    return response.data;
  },
};

// Bookmarks API
export const bookmarksAPI = {
  getAll: async (contentType?: string) => {
    const params = contentType ? { content_type: contentType } : {};
    const response = await api.get('/bookmarks', { params });
    return response.data;
  },
  
  add: async (contentId: string, contentType: string) => {
    const response = await api.post('/bookmarks', { content_id: contentId, content_type: contentType });
    return response.data;
  },
  
  remove: async (contentId: string) => {
    const response = await api.delete(`/bookmarks/${contentId}`);
    return response.data;
  },
  
  check: async (contentId: string) => {
    const response = await api.get(`/bookmarks/check/${contentId}`);
    return response.data;
  },
};

// Insights API
export const insightsAPI = {
  getWeekly: async () => {
    const response = await api.get('/insights/weekly');
    return response.data;
  },
};

// Enhanced Reflection API with search and tags
export const reflectionSearchAPI = {
  search: async (query?: string, tag?: string, mood?: string) => {
    const params: any = {};
    if (query) params.q = query;
    if (tag) params.tag = tag;
    if (mood) params.mood = mood;
    const response = await api.get('/reflections/search', { params });
    return response.data;
  },
  
  getTags: async () => {
    const response = await api.get('/reflections/tags');
    return response.data;
  },
  
  updateTags: async (reflectionId: string, tags: string[]) => {
    const response = await api.put(`/reflections/${reflectionId}/tags`, { tags });
    return response.data;
  },
};

// Transcription API
export const transcribeAPI = {
  transcribe: async (audioFile: Blob) => {
    const formData = new FormData();
    formData.append('file', audioFile, 'recording.webm');
    const response = await api.post('/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default api;
