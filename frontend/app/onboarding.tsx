import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { contentAPI } from '@/services/api';
import AriomeLogo from '@/components/AriomeLogo';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface Intention {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { loginAsGuest } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIntentions();
  }, []);

  const loadIntentions = async () => {
    try {
      const data = await contentAPI.getIntentions();
      setIntentions(data);
    } catch (error) {
      console.error('Error loading intentions:', error);
    }
  };

  const toggleIntention = (intentionId: string) => {
    setSelectedIntentions(prev =>
      prev.includes(intentionId)
        ? prev.filter(id => id !== intentionId)
        : [...prev, intentionId]
    );
  };

  const handleContinue = async () => {
    if (step === 0) {
      setStep(1);
    } else {
      setLoading(true);
      try {
        await loginAsGuest(selectedIntentions);
        router.replace('/(tabs)/reflect');
      } catch (error) {
        console.error('Error creating guest:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await loginAsGuest([]);
      router.replace('/(tabs)/reflect');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.welcomeContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoGlow} />
            <AriomeLogo width={160} height={66} />
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <MaterialCommunityIcons name="flower-tulip-outline" size={20} color={ARIOME_COLORS.consciousness.teal} />
              <View style={styles.dividerLine} />
            </View>
            
            <Text style={styles.welcomeTitle}>Welcome to Your{"\n"}Inner Journey</Text>
            <Text style={styles.welcomeSubtitle}>A space for conscious living, reflection, and inner growth</Text>
          </View>

          {/* What AriOme Is */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is AriOme?</Text>
            
            <FeatureCard
              icon="thought-bubble-outline"
              title="Self-Reflection Engine"
              description="Daily prompts, journaling, and mood check-ins to deepen self-awareness"
              color={ARIOME_COLORS.accent.lavender}
            />
            <FeatureCard
              icon="meditation"
              title="Practices & Rituals"
              description="Breathwork, stillness, gratitude rituals without gamified pressure"
              color={ARIOME_COLORS.accent.rose}
            />
            <FeatureCard
              icon="book-open-page-variant-outline"
              title="Wisdom Library"
              description="Curated wisdom with reflect-after-consume prompts"
              color={ARIOME_COLORS.consciousness.teal}
            />
          </View>

          {/* What AriOme Is NOT */}
          <View style={styles.notSection}>
            <Text style={styles.notTitle}>What AriOme is NOT</Text>
            <View style={styles.notItems}>
              <NotItem text="Not social media" />
              <NotItem text="No gamification" />
              <NotItem text="No content overload" />
              <NotItem text="No comparison" />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Step 1: Intention Selection
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.intentionContent} showsVerticalScrollIndicator={false}>
        <View style={styles.intentionHeader}>
          <MaterialCommunityIcons name="compass-outline" size={40} color={ARIOME_COLORS.consciousness.teal} />
          <Text style={styles.intentionTitle}>What brings you here?</Text>
          <Text style={styles.intentionSubtitle}>Select the intentions that resonate with you</Text>
        </View>

        <View style={styles.intentionGrid}>
          {intentions.map((intention) => (
            <TouchableOpacity
              key={intention.id}
              style={[
                styles.intentionCard,
                selectedIntentions.includes(intention.id) && {
                  borderColor: intention.color,
                  backgroundColor: `${intention.color}15`,
                },
              ]}
              onPress={() => toggleIntention(intention.id)}
            >
              <View style={[styles.intentionIcon, { backgroundColor: `${intention.color}20` }]}>
                <MaterialCommunityIcons name={intention.icon as any} size={28} color={intention.color} />
              </View>
              <Text style={styles.intentionName}>{intention.name}</Text>
              <Text style={styles.intentionDesc}>{intention.description}</Text>
              {selectedIntentions.includes(intention.id) && (
                <View style={[styles.checkBadge, { backgroundColor: intention.color }]}>
                  <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Continue to AriOme</Text>
              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon as any} size={26} color={color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
  );
}

function NotItem({ text }: { text: string }) {
  return (
    <View style={styles.notItem}>
      <MaterialCommunityIcons name="close-circle-outline" size={16} color={ARIOME_COLORS.text.subtle} />
      <Text style={styles.notItemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  welcomeContent: {
    padding: ARIOME_SPACING.lg,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.xl,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
    opacity: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.md,
  },
  dividerLine: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 34,
    marginTop: ARIOME_SPACING.lg,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    textAlign: 'center',
    marginTop: ARIOME_SPACING.sm,
  },
  section: {
    marginBottom: ARIOME_SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: ARIOME_SPACING.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ARIOME_SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    lineHeight: 20,
  },
  notSection: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    padding: ARIOME_SPACING.md,
  },
  notTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ARIOME_COLORS.text.muted,
    marginBottom: ARIOME_SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  notItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ARIOME_SPACING.sm,
  },
  notItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notItemText: {
    fontSize: 12,
    color: ARIOME_COLORS.text.subtle,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: ARIOME_SPACING.lg,
    paddingBottom: ARIOME_SPACING.xl,
    backgroundColor: ARIOME_COLORS.background.deep,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  primaryButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ARIOME_SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.md,
    marginTop: ARIOME_SPACING.sm,
  },
  skipButtonText: {
    color: ARIOME_COLORS.text.muted,
    fontSize: 14,
  },
  // Intention selection
  intentionContent: {
    padding: ARIOME_SPACING.lg,
    paddingBottom: 160,
  },
  intentionHeader: {
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.xl,
  },
  intentionTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
  },
  intentionSubtitle: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.xs,
  },
  intentionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  intentionCard: {
    width: (width - 56) / 2,
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  intentionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ARIOME_SPACING.sm,
  },
  intentionName: {
    fontSize: 15,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: 4,
  },
  intentionDesc: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    lineHeight: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
