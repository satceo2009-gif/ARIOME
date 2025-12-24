import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://logohomelink.preview.emergentagent.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
