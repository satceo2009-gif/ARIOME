import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { INTENTIONS } from '@/constants/intentions';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('explorer');
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { id: 'explorer', label: 'Explorer', icon: 'compass', desc: 'Discover & enjoy content' },
    { id: 'creator', label: 'Creator', icon: 'creation', desc: 'Share your wisdom' },
  ];

  const toggleIntention = (intentionId: string) => {
    if (selectedIntentions.includes(intentionId)) {
      setSelectedIntentions(selectedIntentions.filter(i => i !== intentionId));
    } else {
      setSelectedIntentions([...selectedIntentions, intentionId]);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (selectedIntentions.length === 0) {
      Alert.alert('Error', 'Please select at least one intention');
      return;
    }

    setLoading(true);
    try {
      await signup(email, name, password, role, selectedIntentions);
      router.replace('/(tabs)/discover');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="account-plus" size={64} color="#14B8A6" />
            <Text style={styles.title}>Join ARIOME</Text>
            <Text style={styles.subtitle}>Begin your conscious wellness journey</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>

            {/* Role Selection */}
            <Text style={styles.sectionTitle}>I want to:</Text>
            <View style={styles.rolesContainer}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, role === r.id && styles.roleCardSelected]}
                  onPress={() => setRole(r.id)}
                >
                  <MaterialCommunityIcons 
                    name={r.icon as any} 
                    size={32} 
                    color={role === r.id ? '#14B8A6' : '#9CA3AF'} 
                  />
                  <Text style={[styles.roleLabel, role === r.id && styles.roleLabelSelected]}>
                    {r.label}
                  </Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Intentions */}
            <Text style={styles.sectionTitle}>Your Intentions:</Text>
            <View style={styles.intentionsContainer}>
              {INTENTIONS.map((intention) => (
                <TouchableOpacity
                  key={intention.id}
                  style={[
                    styles.intentionChip,
                    selectedIntentions.includes(intention.id) && styles.intentionChipSelected
                  ]}
                  onPress={() => toggleIntention(intention.id)}
                >
                  <Text style={[
                    styles.intentionText,
                    selectedIntentions.includes(intention.id) && styles.intentionTextSelected
                  ]}>
                    {intention.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  form: {
    width: '100%',
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#FFF',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
    marginBottom: 16,
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  roleCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 8,
  },
  roleLabelSelected: {
    color: '#14B8A6',
  },
  roleDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  intentionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  intentionChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  intentionChipSelected: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  intentionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  intentionTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signupButtonDisabled: {
    opacity: 0.5,
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  loginLink: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
});
