import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import AriomeLogo from '@/components/AriomeLogo';

export default function Index() {
  const router = useRouter();
  const { isOnboarded, loadUser } = useUserStore();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initApp = async () => {
      await loadUser();
      
      // Optional: Play ambient sound if available
      // (gracefully skips if file doesn't exist)
      try {
        // Uncomment when splash.mp3 is added to assets/sounds/
        // const { sound } = await Audio.Sound.createAsync(
        //   require('../assets/sounds/splash.mp3'),
        //   { shouldPlay: true, volume: 0.3 }
        // );
        // setTimeout(() => sound.unloadAsync(), 2000);
      } catch (error) {
        // Silent fail - no audio needed
      }

      // Start animations
      Animated.parallel([
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Scale up with bounce
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        // Glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Navigate after animation - Always show onboarding/welcome
      setTimeout(() => {
        router.replace('/onboarding');
      }, 2500);
    };

    initApp();
  }, [isOnboarded]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#1A1A24', '#0A0A0F']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Ambient glow effect */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            opacity: glowOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <AriomeLogo width={300} height={130} />
      </Animated.View>
    </View>
  );
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
});
