import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';
import AriomeLogo from '@/components/AriomeLogo';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://meditate-hub-3.preview.emergentagent.com/api';

type AuthMode = 'welcome' | 'explorer' | 'login' | 'subscribe';

export default function AuthScreen() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExplorerSignup = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send verification email
      const response = await axios.post(`${API_URL}/email/send-verification`, { email });
      
      // Navigate to verification screen
      router.push({
        pathname: '/email-verify',
        params: { email, devCode: response.data.dev_code || '' }
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.replace('/mood-selection');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, try to upgrade if user is an existing explorer
      const upgradeResponse = await axios.post(`${API_URL}/auth/upgrade-to-subscriber`, {
        email,
        name,
        password
      });
      
      // Upgrade successful - login with the returned token
      if (upgradeResponse.data.access_token) {
        await login(email, password);
        Alert.alert('Welcome!', 'Your account has been upgraded to Subscriber!');
        router.replace('/mood-selection');
        return;
      }
    } catch (upgradeErr: any) {
      // If upgrade fails with "not found" or "already has password", try regular signup
      const errorMsg = upgradeErr.response?.data?.detail || '';
      
      if (errorMsg.includes('already has a password')) {
        // User exists with password - they should login
        setError('This account already exists. Please login instead.');
        setLoading(false);
        return;
      }
      
      if (!errorMsg.includes('not found')) {
        // Some other error during upgrade
        console.log('Upgrade error:', errorMsg);
      }
      
      // If user not found as explorer, try regular signup
      try {
        await signup(email, name, password, 'subscriber', []);
        router.replace('/mood-selection');
      } catch (signupErr: any) {
        const signupError = signupErr.message || 'Signup failed';
        if (signupError.includes('already registered')) {
          setError('Email already exists. If you explored before, please use the same email and we\'ll upgrade your account.');
        } else {
          setError(signupError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContent}>
          <View style={styles.logoSection}>
            <AriomeLogo width={280} height={118} />
          </View>

          <Text style={styles.welcomeText}>
            Begin your journey to inner peace and personal growth
          </Text>

          <View style={styles.welcomeButtons}>
            <TouchableOpacity 
              style={styles.explorerButton}
              onPress={() => setMode('explorer')}
            >
              <MaterialCommunityIcons name="compass" size={24} color="#FFF" />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.explorerButtonTitle}>Explore Free</Text>
                <Text style={styles.explorerButtonSubtitle}>30-second previews of all content</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={() => setMode('subscribe')}
            >
              <LinearGradient
                colors={['#14B8A6', '#0D9488']}
                style={styles.subscribeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="crown" size={24} color="#FFF" />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.subscribeButtonTitle}>Subscribe</Text>
                  <Text style={styles.subscribeButtonSubtitle}>Full access to all content</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => setMode('login')}
            >
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <Text style={styles.loginLinkHighlight}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.creatorLink}
              onPress={() => router.push('/creator-apply')}
            >
              <MaterialCommunityIcons name="brush" size={18} color="#14B8A6" />
              <Text style={styles.creatorLinkText}>Want to create content? </Text>
              <Text style={styles.creatorLinkHighlight}>Apply as Creator</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Explorer Email Signup
  if (mode === 'explorer') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContent}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('welcome')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.formHeader}>
            <View style={styles.formIconContainer}>
              <MaterialCommunityIcons name="compass" size={40} color="#14B8A6" />
            </View>
            <Text style={styles.formTitle}>Explore ARIOME</Text>
            <Text style={styles.formSubtitle}>
              Enter your email to start exploring. You'll get 30-second previews of all our wellness content.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Your email address"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleExplorerSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Continue</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={18} color="#14B8A6" />
            <Text style={styles.infoText}>
              We'll send a verification code to your email. No password needed for Explorer access.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.switchModeLink}
            onPress={() => setMode('subscribe')}
          >
            <Text style={styles.switchModeText}>Want full access? </Text>
            <Text style={styles.switchModeHighlight}>Subscribe instead</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Login Screen
  if (mode === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContent}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('welcome')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Login to continue your wellness journey</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setMode('explorer')}
          >
            <MaterialCommunityIcons name="compass" size={20} color="#14B8A6" />
            <Text style={styles.secondaryButtonText}>Explore as Guest</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Subscribe Screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContent}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('welcome')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.formHeader}>
            <View style={styles.crownBadge}>
              <MaterialCommunityIcons name="crown" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.formTitle}>Subscribe to ARIOME</Text>
            <Text style={styles.formSubtitle}>Unlock your full wellness experience</Text>
          </View>

          <View style={styles.benefitsContainer}>
            {[
              { icon: 'infinity', text: 'Unlimited access to all content' },
              { icon: 'download', text: 'Offline downloads' },
              { icon: 'account-group', text: 'Full community access' },
              { icon: 'notebook', text: 'Personal journal & reflections' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <MaterialCommunityIcons name={benefit.icon as any} size={20} color="#14B8A6" />
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Create Password"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.subscribeActionButton, loading && styles.buttonDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            <LinearGradient
              colors={['#14B8A6', '#0D9488']}
              style={styles.subscribeActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.subscribeActionText}>Subscribe Now</Text>
                  <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchModeLink}
            onPress={() => setMode('explorer')}
          >
            <Text style={styles.switchModeText}>Just want to explore? </Text>
            <Text style={styles.switchModeHighlight}>Try free preview</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchModeLink}
            onPress={() => setMode('login')}
          >
            <Text style={styles.switchModeText}>Already a subscriber? </Text>
            <Text style={styles.switchModeHighlight}>Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  welcomeContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 4,
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#14B8A6',
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  welcomeButtons: {
    gap: 16,
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  explorerButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  explorerButtonSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  subscribeButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  subscribeButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
  },
  loginLinkText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  creatorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 4,
  },
  creatorLinkText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  creatorLinkHighlight: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  formContent: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  crownBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 16,
    marginLeft: 12,
  },
  primaryButton: {
    backgroundColor: '#14B8A6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 20,
  },
  switchModeLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
  },
  switchModeText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  switchModeHighlight: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  forgotPasswordText: {
    color: '#14B8A6',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    marginHorizontal: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#14B8A6',
  },
  benefitsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  benefitText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  subscribeActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  subscribeActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  subscribeActionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
});
