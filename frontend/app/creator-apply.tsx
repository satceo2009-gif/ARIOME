import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { creatorAPI, speechAPI } from '@/services/api';

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: 'instagram', placeholder: '@username' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube', placeholder: 'Channel URL' },
  { id: 'twitter', label: 'Twitter/X', icon: 'twitter', placeholder: '@username' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', placeholder: 'Profile URL' },
  { id: 'tiktok', label: 'TikTok', icon: 'music-note', placeholder: '@username' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook', placeholder: 'Page URL' },
  { id: 'spotify', label: 'Spotify', icon: 'spotify', placeholder: 'Artist URL' },
  { id: 'soundcloud', label: 'SoundCloud', icon: 'soundcloud', placeholder: 'Profile URL' },
];

export default function CreatorApplicationScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    description: '',
    website: '',
    profile_image_url: '',
    social_media: {} as Record<string, string>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateSocialMedia = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: { ...prev.social_media, [platform]: value }
    }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    else if (formData.bio.length < 50) newErrors.bio = 'Bio should be at least 50 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 100) newErrors.description = 'Description should be at least 100 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to use voice input');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setTranscribing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // Read the file and convert to base64
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64Audio = base64data.split(',')[1]; // Remove data URL prefix
          
          try {
            const result = await speechAPI.transcribe(base64Audio, 'm4a', 'en');
            if (result.text) {
              // Append to description
              setFormData(prev => ({
                ...prev,
                description: prev.description ? `${prev.description} ${result.text}` : result.text
              }));
            }
          } catch (error) {
            console.error('Transcription error:', error);
            Alert.alert('Error', 'Failed to transcribe audio. Please try again or type manually.');
          } finally {
            setTranscribing(false);
          }
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setTranscribing(false);
      Alert.alert('Error', 'Failed to process recording');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Filter out empty social media entries
      const filteredSocialMedia = Object.fromEntries(
        Object.entries(formData.social_media).filter(([_, value]) => value.trim())
      );

      const applicationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        bio: formData.bio.trim(),
        description: formData.description.trim(),
        website: formData.website.trim() || undefined,
        profile_image_url: formData.profile_image_url.trim() || undefined,
        social_media: filteredSocialMedia,
      };

      await creatorAPI.apply(applicationData);
      
      Alert.alert(
        '🎉 Application Submitted!',
        'Thank you for applying to become an ARIOME Creator! You will receive an email confirmation shortly. Our team will review your application within 3-5 business days.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Application error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Let's start with your account details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Your full name"
          placeholderTextColor="#6B7280"
          value={formData.name}
          onChangeText={(text) => updateField('name', text)}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="your@email.com"
          placeholderTextColor="#6B7280"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Create a password"
          placeholderTextColor="#6B7280"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Confirm your password"
          placeholderTextColor="#6B7280"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>About You</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself and your vision</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Short Bio * (min 50 chars)</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
          placeholder="A brief introduction about yourself..."
          placeholderTextColor="#6B7280"
          value={formData.bio}
          onChangeText={(text) => updateField('bio', text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{formData.bio.length}/50 min</Text>
        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>What do you want to create? * (min 100 chars)</Text>
          <TouchableOpacity
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={transcribing}
          >
            {transcribing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialCommunityIcons 
                name={isRecording ? "stop" : "microphone"} 
                size={20} 
                color="#FFF" 
              />
            )}
          </TouchableOpacity>
        </View>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording... Tap mic to stop</Text>
          </View>
        )}
        {transcribing && (
          <View style={styles.recordingIndicator}>
            <ActivityIndicator size="small" color="#14B8A6" />
            <Text style={styles.recordingText}>Transcribing your voice...</Text>
          </View>
        )}
        <TextInput
          style={[styles.input, styles.textAreaLarge, errors.description && styles.inputError]}
          placeholder="Describe your vision, the type of content you want to create, your experience, and what makes you unique. You can also use the microphone to speak your thoughts..."
          placeholderTextColor="#6B7280"
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{formData.description.length}/100 min</Text>
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Profile Image URL (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://your-image-url.com/photo.jpg"
          placeholderTextColor="#6B7280"
          value={formData.profile_image_url}
          onChangeText={(text) => updateField('profile_image_url', text)}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Website (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://yourwebsite.com"
          placeholderTextColor="#6B7280"
          value={formData.website}
          onChangeText={(text) => updateField('website', text)}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Social Media</Text>
      <Text style={styles.stepSubtitle}>Connect your social presence (all optional)</Text>

      {SOCIAL_PLATFORMS.map((platform) => (
        <View key={platform.id} style={styles.socialInputContainer}>
          <View style={styles.socialLabelRow}>
            <MaterialCommunityIcons name={platform.icon as any} size={20} color="#9CA3AF" />
            <Text style={styles.socialLabel}>{platform.label}</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder={platform.placeholder}
            placeholderTextColor="#6B7280"
            value={formData.social_media[platform.id] || ''}
            onChangeText={(text) => updateSocialMedia(platform.id, text)}
            autoCapitalize="none"
          />
        </View>
      ))}

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>📋 Application Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Name:</Text>
          <Text style={styles.summaryValue}>{formData.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Email:</Text>
          <Text style={styles.summaryValue}>{formData.email}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Bio:</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>{formData.bio}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Creator</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={styles.progressItem}>
            <View style={[styles.progressDot, step >= s && styles.progressDotActive]}>
              {step > s ? (
                <MaterialCommunityIcons name="check" size={16} color="#FFF" />
              ) : (
                <Text style={[styles.progressNumber, step >= s && styles.progressNumberActive]}>
                  {s}
                </Text>
              )}
            </View>
            {s < 3 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        {step > 1 && (
          <TouchableOpacity style={styles.backStepButton} onPress={prevStep}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#FFF" />
            <Text style={styles.backStepText}>Back</Text>
          </TouchableOpacity>
        )}
        
        {step < 3 ? (
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Application</Text>
                <MaterialCommunityIcons name="send" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: '#14B8A6',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  progressNumberActive: {
    color: '#FFF',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#374151',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#14B8A6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    height: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#EF4444',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 12,
    color: '#14B8A6',
  },
  socialInputContainer: {
    marginBottom: 16,
  },
  socialLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  socialLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  summaryBox: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    width: 60,
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  backStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#374151',
    gap: 8,
  },
  backStepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#14B8A6',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#14B8A6',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
