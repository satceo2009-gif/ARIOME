import { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

export default function Index() {
  const router = useRouter();
  const { isOnboarded, loadUser } = useUserStore();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    loadUser().then(() => {
      // Start animation
      scale.value = withSequence(
        withTiming(1, { duration: 800 }),
        withRepeat(withTiming(1.05, { duration: 1000 }), 2, true)
      );
      opacity.value = withTiming(1, { duration: 800 });

      // Navigate after animation
      setTimeout(() => {
        if (isOnboarded) {
          router.replace('/(tabs)/discover');
        } else {
          router.replace('/onboarding');
        }
      }, 2500);
    });
  }, [isOnboarded]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image 
          source={require('../assets/images/ariome-logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#14B8A6',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#14B8A6',
  },
});
