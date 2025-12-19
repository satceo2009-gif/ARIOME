import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'https://mind-wellness-70.preview.emergentagent.com/api';

export default function EmailVerifyScreen() {
  const router = useRouter();
  const { email, devCode } = useLocalSearchParams<{ email: string; devCode?: string }>();
  const { emailSignup } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [displayDevCode, setDisplayDevCode] = useState<string | null>(devCode || null);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-fill code if devCode is provided
  useEffect(() => {
    if (devCode && devCode.length === 6) {
      const codeArray = devCode.split('');
      setCode(codeArray);
    }
  }, [devCode]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/email/verify-code`, {
        email: email,
        code: codeToVerify
      });

      if (response.data.verified) {
        // Create explorer account
        await emailSignup(email as string);
        
        // Mark mood selection as needed
        await AsyncStorage.setItem('has_selected_mood', 'false');
        
        Alert.alert(
          'Welcome to ARIOME! 🎉',
          'Your email has been verified. Explore our wellness content!',
          [{ text: 'Start Exploring', onPress: () => router.replace('/mood-selection') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResending(true);
    try {
      const response = await axios.post(`${API_URL}/email/send-verification`, { email });
      setCountdown(60);
      // Show dev code if available (for testing)
      if (response.data.dev_code) {
        setDisplayDevCode(response.data.dev_code);
        const codeArray = response.data.dev_code.split('');
        setCode(codeArray);
      }
      Alert.alert('Code Sent', 'A new verification code has been sent to your email');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#14B8A6', '#0D9488']}
              style={styles.iconGradient}
            >
              <MaterialCommunityIcons name="email-check" size={48} color="#FFF" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>We've sent a 6-digit code to</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputs.current[index] = ref}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={() => handleVerify()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity 
            onPress={handleResendCode} 
            disabled={countdown > 0 || resending}
          >
            <Text style={[
              styles.resendLink,
              (countdown > 0 || resending) && styles.resendLinkDisabled
            ]}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dev Code Display - For Testing */}
        {displayDevCode && (
          <View style={styles.devCodeBox}>
            <MaterialCommunityIcons name="developer-board" size={20} color="#F59E0B" />
            <View style={styles.devCodeContent}>
              <Text style={styles.devCodeLabel}>Test Mode - Your Code:</Text>
              <Text style={styles.devCodeValue}>{displayDevCode}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color="#14B8A6" />
          <Text style={styles.infoText}>
            As an Explorer, you'll get 30-second previews of all content. Subscribe for full access!
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#14B8A6',
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  verifyButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  resendText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  resendLink: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#6B7280',
  },
  devCodeBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  devCodeContent: {
    flex: 1,
  },
  devCodeLabel: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 4,
  },
  devCodeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
});
