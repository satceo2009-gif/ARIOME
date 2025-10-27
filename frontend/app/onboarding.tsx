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
import { INTENTIONS, Intention } from '@/constants/intentions';
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
      // Complete onboarding
      const user = {
        id: 'user_' + Date.now(),
        name: 'Explorer',
        email: 'explorer@ariome.app',
        intentions: selectedIntentions,
      };
      setUser(user);
      setIntentions(selectedIntentions);
      await completeOnboarding();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/discover');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {step === 0 ? (
        <View style={styles.welcomeContainer}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <View style={styles.logoInner} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to ARIOME</Text>
            <Text style={styles.welcomeSubtitle}>
              Your conscious journey begins here
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem
              icon="compass-outline"
              title="Intention-Based Discovery"
              description="Find stories that resonate with your current journey"
            />
            <FeatureItem
              icon="notebook-outline"
              title="Reflection & Growth"
              description="Journal your thoughts and track your transformation"
            />
            <FeatureItem
              icon="account-group-outline"
              title="Community Circles"
              description="Connect with others on similar paths"
            />
            <FeatureItem
              icon="heart-outline"
              title="Support Creators"
              description="Empower conscious storytellers through direct support"
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
            <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.intentionsContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intentionsTitle}>What brings you here today?</Text>
          <Text style={styles.intentionsSubtitle}>
            Select the intentions that resonate with you (choose at least one)
          </Text>

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
            <Text style={styles.primaryButtonText}>Continue to ARIOME</Text>
            <MaterialCommunityIcons name="check" size={24} color="#FFF" />
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
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <MaterialCommunityIcons name={icon as any} size={28} color="#9D4EDD" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function IntentionCard({
  intention,
  isSelected,
  onPress,
}: {
  intention: Intention;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.intentionCard,
        isSelected && {
          borderColor: intention.color,
          backgroundColor: `${intention.color}20`,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={intention.icon as any}
        size={32}
        color={intention.color}
      />
      <Text style={styles.intentionName}>{intention.name}</Text>
      <Text style={styles.intentionDescription}>{intention.description}</Text>
      {isSelected && (
        <View
          style={[styles.checkBadge, { backgroundColor: intention.color }]}
        >
          <MaterialCommunityIcons name="check" size={16} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  welcomeContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#9D4EDD',
    marginBottom: 24,
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9D4EDD',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  featuresContainer: {
    marginTop: 40,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#9D4EDD',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: '#4B5563',
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  intentionsContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  intentionsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  intentionsSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  intentionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  intentionCard: {
    width: (width - 56) / 2,
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 160,
  },
  intentionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  intentionDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
