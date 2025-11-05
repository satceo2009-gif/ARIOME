import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const { isOnboarded, loadUser } = useUserStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Direct redirect to auth
  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#14B8A6',
    opacity: 0.2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#14B8A6',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    letterSpacing: 2,
  },
});
