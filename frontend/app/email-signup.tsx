import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/store/userStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://theme-evolution.preview.emergentagent.com/api';

export default function EmailSignupScreen() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Create email-only user (no password)
      const response = await axios.post(`${API_URL}/auth/email-signup`, {
        email,
      });

      // Store user data
      const user = {
        id: response.data.user_id,
        email: email,
        name: 'Explorer',
        role: 'explorer',
        verified: false,
      };
      
      setUser(user);
      await AsyncStorage.setItem('user_email', email);

      Alert.alert(
        'Email Sent!',
        'Please check your email to verify your address. You can now access short clips!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/discover'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/ariome-logo-dark.svg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Sign up to access short clips</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#14B8A6" />
            <Text style={styles.benefitText}>Access to short meditation clips</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#14B8A6" />
            <Text style={styles.benefitText}>Browse all stories and trailers</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#14B8A6" />
            <Text style={styles.benefitText}>No password required</Text>
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="#9CA3AF"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleEmailSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign Up with Email</Text>
          )}
        </TouchableOpacity>

        {/* Subscribe Link */}
        <View style={styles.subscribeHint}>
          <Text style={styles.hintText}>Want full access to all content?</Text>
          <TouchableOpacity onPress={() => router.push('/auth')}>
            <Text style={styles.subscribeLink}>Subscribe Now →</Text>
          </TouchableOpacity>
        </View>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.back()}
        >
          <Text style={styles.skipText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 16,
  },
  button: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subscribeHint: {
    marginTop: 32,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  subscribeLink: {
    fontSize: 16,
    color: '#14B8A6',
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
