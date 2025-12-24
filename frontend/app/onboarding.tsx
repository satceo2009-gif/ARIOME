import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { INTENTIONS } from '@/constants/intentions';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/ariomeTheme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const { setUser, setIntentions, completeOnboarding } = useUserStore();
  const [step, setStep] = useState(0);
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);

  const handleIntentionToggle = (intentionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIntentions((prev) =>
      prev.includes(intentionId)
        ? prev.filter((id) => id !== intentionId)
        : [...prev, intentionId]
    );
  };

  const handleContinue = async () => {
    if (step === 0) {
      setStep(1);
    } else {
      const guestUser = {
        id: 'guest_' + Date.now(),
        name: 'Explorer',
        email: '',
        role: 'explorer',
        intentions: selectedIntentions,
      };
      setUser(guestUser);
      setIntentions(selectedIntentions);
      await completeOnboarding();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/self-ariome');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {step === 0 ? (
        <View style={styles.welcomeWrapper}>
          <ScrollView 
            style={styles.welcomeScroll}
            contentContainerStyle={styles.welcomeScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Sacred Header */}
            <View style={styles.header}>
              <View style={styles.logoGlow} />
              <Text style={styles.logoText}>ARIOME</Text>
              <Text style={styles.logoTagline}>by CNESS</Text>
              
              <View style={styles.sacredDivider}>
                <View style={styles.dividerLine} />
                <MaterialCommunityIcons name="lotus" size={24} color={ARIOME_COLORS.consciousness.teal} />
                <View style={styles.dividerLine} />
              </View>
              
              <Text style={styles.welcomeTitle}>Welcome to Your{"\n"}Inner Journey</Text>
              <Text style={styles.welcomeSubtitle}>
                A space for conscious living, reflection, and inner growth
              </Text>
            </View>

            {/* Philosophy Section */}
            <View style={styles.philosophySection}>
              <Text style={styles.philosophyQuote}>
                "Consciousness first, not content first"
              </Text>
              <Text style={styles.philosophyText}>
                AriOme is not just an app. It's a companion for your inner evolution.
              </Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <FeatureItem
                icon="heart-pulse"
                title="Self-AriOme"
                description="Daily reflections, emotional check-ins, and conscious practices"
                color={ARIOME_COLORS.accent.rose}
              />
              <FeatureItem
                icon="meditation"
                title="Practices & Rituals"
                description="Breath awareness, stillness, gratitude, and intention setting"
                color={ARIOME_COLORS.accent.lavender}
              />
              <FeatureItem
                icon="book-open-page-variant-outline"
                title="Wisdom Library"
                description="Curated insights for reflection, not consumption"
                color={ARIOME_COLORS.consciousness.teal}
              />
              <FeatureItem
                icon="account-group-outline"
                title="Community Circles"
                description="Connect in shared intentions, not debates"
                color={ARIOME_COLORS.accent.amber}
              />
            </View>

            {/* What we are NOT */}
            <View style={styles.notSection}>
              <Text style={styles.notTitle}>What AriOme is NOT</Text>
              <View style={styles.notItems}>
                <NotItem text="Not social media" />
                <NotItem text="No dopamine-driven gamification" />
                <NotItem text="No ego-based comparison" />
                <NotItem text="No infinite scroll" />
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.intentionsContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intentionsHeader}>
            <MaterialCommunityIcons name="compass-outline" size={40} color={ARIOME_COLORS.consciousness.teal} />
            <Text style={styles.intentionsTitle}>What brings you here?</Text>
            <Text style={styles.intentionsSubtitle}>
              Select the intentions that resonate with you
            </Text>
          </View>

          <View style={styles.intentionsGrid}>
            {INTENTIONS.map((intention) => (
              <IntentionCard
                key={intention.id}
                intention={intention}
                isSelected={selectedIntentions.includes(intention.id)}
                onPress={() => handleIntentionToggle(intention.id)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              selectedIntentions.length === 0 && styles.primaryButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedIntentions.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue to AriOme</Text>
            <MaterialCommunityIcons name="check" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              setIntentions([]);
              router.replace('/(tabs)/self-ariome');
            }}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIconContainer, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon as any} size={26} color={color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function NotItem({ text }: { text: string }) {
  return (
    <View style={styles.notItem}>
      <MaterialCommunityIcons name="close-circle-outline" size={18} color={ARIOME_COLORS.text.subtle} />
      <Text style={styles.notItemText}>{text}</Text>
    </View>
  );
}

function IntentionCard({
  intention,
  isSelected,
  onPress,
}: {
  intention: any;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.intentionCard,
        isSelected && {
          borderColor: intention.color,
          backgroundColor: `${intention.color}15`,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.intentionIcon, { backgroundColor: `${intention.color}20` }]}>
        <MaterialCommunityIcons
          name={intention.icon as any}
          size={28}
          color={intention.color}
        />
      </View>
      <Text style={styles.intentionName}>{intention.name}</Text>
      <Text style={styles.intentionDescription}>{intention.description}</Text>
      {isSelected && (
        <View
          style={[styles.checkBadge, { backgroundColor: intention.color }]}
        >
          <MaterialCommunityIcons name="check" size={14} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  welcomeWrapper: {
    flex: 1,
  },
  welcomeScroll: {
    flex: 1,
  },
  welcomeScrollContent: {
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingBottom: ARIOME_SPACING.xl,
  },
  buttonContainer: {
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
    paddingBottom: ARIOME_SPACING.lg,
    backgroundColor: ARIOME_COLORS.background.deep,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    alignItems: 'center',
    marginTop: ARIOME_SPACING.xl,
    marginBottom: ARIOME_SPACING.lg,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
    opacity: 0.3,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '200',
    color: ARIOME_COLORS.consciousness.teal,
    letterSpacing: 8,
    marginBottom: 4,
  },
  logoTagline: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
    letterSpacing: 4,
    marginBottom: ARIOME_SPACING.lg,
  },
  sacredDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.md,
  },
  dividerLine: {
    width: 50,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: ARIOME_SPACING.sm,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: ARIOME_COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  philosophySection: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: ARIOME_COLORS.consciousness.teal,
  },
  philosophyQuote: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '300',
    color: ARIOME_COLORS.consciousness.teal,
    marginBottom: ARIOME_SPACING.sm,
  },
  philosophyText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: ARIOME_SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: ARIOME_SPACING.lg,
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  featureDescription: {
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
    fontSize: 13,
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
  primaryButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    paddingHorizontal: ARIOME_SPACING.lg,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ARIOME_SPACING.sm,
  },
  primaryButtonDisabled: {
    backgroundColor: ARIOME_COLORS.text.disabled,
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  intentionsContainer: {
    padding: ARIOME_SPACING.lg,
    paddingBottom: ARIOME_SPACING.sacred,
  },
  intentionsHeader: {
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.xl,
  },
  intentionsTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.xs,
  },
  intentionsSubtitle: {
    fontSize: 15,
    color: ARIOME_COLORS.text.muted,
    textAlign: 'center',
  },
  intentionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: ARIOME_SPACING.lg,
  },
  intentionCard: {
    width: (width - 56) / 2,
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 150,
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
  intentionDescription: {
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
  skipButton: {
    alignItems: 'center',
    paddingVertical: ARIOME_SPACING.md,
    marginTop: ARIOME_SPACING.sm,
  },
  skipButtonText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
  },
});
