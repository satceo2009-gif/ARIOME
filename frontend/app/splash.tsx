import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 800 });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    const checkOnboardingAndNavigate = async () => {
      // Wait for auth to load
      if (loading) return;
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Show splash for 2 seconds
      
      // Check if user has completed mood selection before
      const hasSelectedMood = await AsyncStorage.getItem('has_selected_mood');
      
      if (user) {
        // Logged in user - go to discover or mood selection
        if (hasSelectedMood) {
          router.replace('/(tabs)/discover');
        } else {
          router.replace('/mood-selection');
        }
      } else {
        // Not logged in - go to auth screen first
        router.replace('/auth');
      }
      
      setCheckingOnboarding(false);
    };

    const timer = setTimeout(checkOnboardingAndNavigate, 100);
    return () => clearTimeout(timer);
  }, [loading, user]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#0A0A0F', '#1A1A2E', '#0A0A0F']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image
            source={require('../assets/images/ariome-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={styles.title}>ARIOME</Text>
          <Text style={styles.subtitle}>Conscious Wellness</Text>
        </Animated.View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#14B8A6" />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>by CSEA</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#14B8A6',
    marginTop: 8,
    letterSpacing: 2,
  },
  loadingContainer: {
    marginTop: 40,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
