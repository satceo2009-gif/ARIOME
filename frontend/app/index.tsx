import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import AriomeLogo from '@/components/AriomeLogo';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check for OAuth callback
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash.includes('session_id=')) {
        const sessionId = hash.split('session_id=')[1]?.split('&')[0];
        if (sessionId) {
          router.replace(`/auth?session_id=${sessionId}`);
          return;
        }
      }
    }
    
    setChecking(false);
  }, []);

  useEffect(() => {
    if (!loading && !checking && user) {
      router.replace('/(tabs)/reflect');
    }
  }, [user, loading, checking]);

  if (loading || checking) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and Branding */}
        <View style={styles.header}>
          <View style={styles.logoGlow} />
          <AriomeLogo width={180} height={75} />
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <MaterialCommunityIcons name="flower-tulip-outline" size={24} color={ARIOME_COLORS.consciousness.teal} />
            <View style={styles.dividerLine} />
          </View>
          
          <Text style={styles.tagline}>Conscious Living Ecosystem</Text>
        </View>

        {/* Philosophy */}
        <View style={styles.philosophyCard}>
          <Text style={styles.philosophyQuote}>"Reflection first, not content first"</Text>
          <Text style={styles.philosophyText}>
            AriOme is your companion for inner growth, self-awareness, and collective harmony.
          </Text>
        </View>

        {/* Features Preview */}
        <View style={styles.features}>
          <FeatureItem icon="thought-bubble-outline" title="Self-Reflection" color={ARIOME_COLORS.accent.lavender} />
          <FeatureItem icon="meditation" title="Practices" color={ARIOME_COLORS.accent.rose} />
          <FeatureItem icon="book-open-page-variant-outline" title="Wisdom" color={ARIOME_COLORS.consciousness.teal} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.secondaryButtonText}>I have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, color }: { icon: string; title: string; color: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  content: {
    flex: 1,
    paddingHorizontal: ARIOME_SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.xl,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
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
  tagline: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
    marginTop: ARIOME_SPACING.md,
    letterSpacing: 2,
  },
  philosophyCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.xl,
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
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: ARIOME_SPACING.xl,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ARIOME_SPACING.sm,
  },
  featureTitle: {
    fontSize: 12,
    color: ARIOME_COLORS.text.muted,
  },
  actions: {
    gap: ARIOME_SPACING.md,
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
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: ARIOME_SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: ARIOME_COLORS.text.muted,
    fontSize: 14,
  },
});
