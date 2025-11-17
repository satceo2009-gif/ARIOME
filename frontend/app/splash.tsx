import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#0A0A0F', '#1F2937', '#0A0A0F']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* ARIOME Logo */}
        <Image 
          source={require('@/assets/images/ariome-logo-dark.svg')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* By CNESS */}
        <Text style={styles.tagline}>by CNESS</Text>
        
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Welcome to ARIOME</Text>
        <Text style={styles.subtitle}>Your conscious journey begins here</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 100,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    letterSpacing: 2,
    marginBottom: 32,
    textTransform: 'uppercase',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
});
