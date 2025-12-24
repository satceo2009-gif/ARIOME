import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/services/api';

interface User {
  user_id: string;
  email: string | null;
  name: string;
  picture?: string;
  role: string;
  intentions: string[];
  language: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginAsGuest: (intentions?: string[], language?: string) => Promise<void>;
  processOAuth: (sessionId: string) => Promise<void>;
  logout: () => Promise<void>;
  updateIntentions: (intentions: string[]) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      if (token) {
        const userData = await authAPI.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.log('Not authenticated');
      await AsyncStorage.removeItem('session_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authAPI.login(email, password);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await authAPI.register(email, password, name);
    setUser(data.user);
  };

  const loginAsGuest = async (intentions: string[] = [], language: string = 'en') => {
    const data = await authAPI.createGuest(intentions, language);
    setUser(data.user);
  };

  const processOAuth = async (sessionId: string) => {
    const data = await authAPI.processOAuthSession(sessionId);
    setUser(data.user);
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const updateIntentions = async (intentions: string[]) => {
    const updatedUser = await authAPI.updateProfile({ intentions });
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginAsGuest,
      processOAuth,
      logout,
      updateIntentions,
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
