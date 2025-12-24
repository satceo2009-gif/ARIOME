import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import AriomeLogo from '@/components/AriomeLogo';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login, register, processOAuth, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Handle OAuth callback
    const sessionId = params.session_id as string;
    if (sessionId) {
      handleOAuthCallback(sessionId);
    }
  }, [params.session_id]);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/reflect');
    }
  }, [user]);

  const handleOAuthCallback = async (sessionId: string) => {
    setLoading(true);
    try {
      await processOAuth(sessionId);
      router.replace('/(tabs)/reflect');
    } catch (err: any) {
      setError(err.message || 'OAuth authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Name is required');
        }
        await register(email, password, name);
      }
      router.replace('/(tabs)/reflect');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (loading && params.session_id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
          <Text style={styles.loadingText}>Completing sign in...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={ARIOME_COLORS.text.primary} />
            </TouchableOpacity>
            <AriomeLogo width={120} height={50} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' 
              ? 'Continue your inner journey' 
              : 'Begin your path to self-awareness'
            }
          </Text>

          {/* Google Sign In */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <MaterialCommunityIcons name="google" size={24} color={ARIOME_COLORS.text.primary} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'register' && (
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account-outline" size={20} color={ARIOME_COLORS.text.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={ARIOME_COLORS.text.disabled}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color={ARIOME_COLORS.text.muted} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={ARIOME_COLORS.text.disabled}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={ARIOME_COLORS.text.muted} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={ARIOME_COLORS.text.disabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle Mode */}
          <TouchableOpacity 
            style={styles.toggleMode}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            <Text style={styles.toggleModeText}>
              {mode === 'login' 
                ? "Don't have an account? " 
                : "Already have an account? "
              }
              <Text style={styles.toggleModeLink}>
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: ARIOME_SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ARIOME_SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginBottom: ARIOME_SPACING.xl,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ARIOME_COLORS.background.secondary,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    gap: ARIOME_SPACING.sm,
  },
  googleButtonText: {
    color: ARIOME_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: ARIOME_SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: ARIOME_COLORS.text.muted,
    marginHorizontal: ARIOME_SPACING.md,
    fontSize: 14,
  },
  form: {
    gap: ARIOME_SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    paddingHorizontal: ARIOME_SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: ARIOME_SPACING.md,
    paddingHorizontal: ARIOME_SPACING.sm,
    color: ARIOME_COLORS.text.primary,
    fontSize: 16,
  },
  error: {
    color: ARIOME_COLORS.semantic.error,
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    alignItems: 'center',
    marginTop: ARIOME_SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleMode: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.lg,
  },
  toggleModeText: {
    color: ARIOME_COLORS.text.muted,
    fontSize: 14,
  },
  toggleModeLink: {
    color: ARIOME_COLORS.consciousness.teal,
    fontWeight: '600',
  },
});
