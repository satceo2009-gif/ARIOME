import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://logohomelink.preview.emergentagent.com/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'explorer' | 'subscriber' | 'creator' | 'admin';
  avatar: string;
  subscription_status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  isExplorer: boolean;
  isSubscriber: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string, role: string, intentions: string[]) => Promise<void>;
  emailSignup: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  canAccessFullContent: () => boolean;
  canAccessShortClips: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { access_token, user: userData } = response.data;
      
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const signup = async (email: string, name: string, password: string, role: string, intentions: string[]) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        name,
        password,
        role: role || 'subscriber',
        intentions
      });

      const { access_token, user: userData } = response.data;
      
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Signup failed');
    }
  };

  // Email-only signup for Explorer access (short clips only)
  const emailSignup = async (email: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/email-signup`, { email });
      
      // Create a temporary explorer user locally
      const explorerUser: User = {
        id: response.data.user_id,
        email: email,
        name: 'Explorer',
        role: 'explorer',
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        subscription_status: 'free'
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(explorerUser));
      setUser(explorerUser);
      // Note: No token for email-only signup, limited access
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Email signup failed');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Access control helpers
  const isGuest = !user;
  const isExplorer = user?.role === 'explorer';
  const isSubscriber = user?.role === 'subscriber' || user?.role === 'creator' || user?.role === 'admin';

  // Full content access: Subscribers, Creators, Admins
  const canAccessFullContent = () => {
    return user?.role === 'subscriber' || user?.role === 'creator' || user?.role === 'admin';
  };

  // Short clips access: Explorers + above
  const canAccessShortClips = () => {
    return user !== null; // Any logged in user
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isGuest,
      isExplorer,
      isSubscriber,
      login, 
      signup, 
      emailSignup,
      logout, 
      refreshUser,
      canAccessFullContent,
      canAccessShortClips
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
