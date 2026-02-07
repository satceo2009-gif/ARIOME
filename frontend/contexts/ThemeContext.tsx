import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARIOME_COLORS, LIGHT_COLORS, DARK_COLORS, ThemeMode } from '@/constants/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof ARIOME_COLORS;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_mode');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('theme_mode', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  // Return colors based on current mode
  // For now, we use the dark mode colors as default since the app was designed dark-first
  const colors = isDarkMode ? {
    ...ARIOME_COLORS,
    background: DARK_COLORS.background,
    text: DARK_COLORS.text,
    border: DARK_COLORS.border,
    consciousness: DARK_COLORS.consciousness,
  } : {
    ...ARIOME_COLORS,
    background: LIGHT_COLORS.background,
    text: LIGHT_COLORS.text,
    border: LIGHT_COLORS.border,
    consciousness: LIGHT_COLORS.consciousness,
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
