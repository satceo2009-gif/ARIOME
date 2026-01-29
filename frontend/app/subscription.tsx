import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/theme';

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    features: [
      'Unlimited video & audio content',
      'Ad-free experience',
      'Exclusive guided practices',
      'Join & create circles',
      'Priority support',
    ],
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$79.99',
    period: '/year',
    savings: 'Save 33%',
    features: [
      'Everything in Monthly',
      '2 months FREE',
      'Exclusive annual content',
      'Early access to new features',
      'Premium badge on profile',
    ],
    popular: true,
  },
];

const BENEFITS = [
  { icon: 'video', title: 'Unlimited Content', desc: 'Access all 40+ videos and audio experiences' },
  { icon: 'meditation', title: 'Guided Practices', desc: 'Premium breathwork, meditation & yoga sessions' },
  { icon: 'account-group', title: 'Community Access', desc: 'Join circles and connect with like-minded souls' },
  { icon: 'star', title: 'Exclusive Features', desc: 'Weekly insights, bookmarks & advanced journaling' },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login or create an account to subscribe.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/auth') },
      ]);
      return;
    }

    setLoading(true);
    // Simulate subscription process
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Coming Soon!', 
        'Subscription payments will be available soon. Thank you for your interest!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1500);
  };

  const isSubscriber = user?.role === 'subscriber' || user?.role === 'creator' || user?.role === 'admin';

  if (isSubscriber) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={ARIOME_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.subscribedContainer}>
          <LinearGradient
            colors={ARIOME_COLORS.gradients.premium as any}
            style={styles.subscribedCard}
          >
            <MaterialCommunityIcons name="crown" size={60} color="#FFD700" />
            <Text style={styles.subscribedTitle}>You're a Subscriber!</Text>
            <Text style={styles.subscribedText}>
              Thank you for supporting AriOme. You have full access to all premium content and features.
            </Text>
          </LinearGradient>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Explore</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={ARIOME_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unlock Full Access</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[ARIOME_COLORS.consciousness.tealDark, ARIOME_COLORS.background.deep]}
          style={styles.heroSection}
        >
          <MaterialCommunityIcons name="crown" size={48} color="#FFD700" />
          <Text style={styles.heroTitle}>Become a Subscriber</Text>
          <Text style={styles.heroSubtitle}>
            Unlock unlimited access to all premium content and exclusive features
          </Text>
        </LinearGradient>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <MaterialCommunityIcons name={benefit.icon as any} size={24} color={ARIOME_COLORS.consciousness.teal} />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDesc}>{benefit.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.popular && styles.planCardPopular,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.savings && (
                    <Text style={styles.planSavings}>{plan.savings}</Text>
                  )}
                </View>
                <View style={styles.planPrice}>
                  <Text style={styles.planPriceAmount}>{plan.price}</Text>
                  <Text style={styles.planPricePeriod}>{plan.period}</Text>
                </View>
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.planFeature}>
                    <MaterialCommunityIcons name="check-circle" size={18} color={ARIOME_COLORS.consciousness.teal} />
                    <Text style={styles.planFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {selectedPlan === plan.id && (
                <View style={styles.selectedIndicator}>
                  <MaterialCommunityIcons name="check-circle" size={24} color={ARIOME_COLORS.consciousness.teal} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          <LinearGradient
            colors={ARIOME_COLORS.gradients.premium as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subscribeButtonGradient}
          >
            {loading ? (
              <Text style={styles.subscribeButtonText}>Processing...</Text>
            ) : (
              <>
                <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          Subscriptions automatically renew unless cancelled.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ARIOME_COLORS.background.deep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ARIOME_SPACING.lg,
    paddingVertical: ARIOME_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: ARIOME_COLORS.background.secondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    padding: ARIOME_SPACING.xl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginTop: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: ARIOME_COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: ARIOME_SPACING.lg,
  },
  benefitsSection: {
    padding: ARIOME_SPACING.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: ARIOME_SPACING.lg,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ARIOME_SPACING.md,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
  },
  plansSection: {
    padding: ARIOME_SPACING.lg,
  },
  planCard: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: ARIOME_COLORS.consciousness.teal,
  },
  planCardPopular: {
    backgroundColor: ARIOME_COLORS.background.card,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: ARIOME_SPACING.lg,
    backgroundColor: ARIOME_COLORS.accent.amber,
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: 4,
    borderRadius: ARIOME_BORDERS.radiusSmall,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ARIOME_SPACING.md,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: ARIOME_COLORS.text.primary,
  },
  planSavings: {
    fontSize: 12,
    color: ARIOME_COLORS.accent.sage,
    fontWeight: '600',
    marginTop: 4,
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  planPriceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: ARIOME_COLORS.text.primary,
  },
  planPricePeriod: {
    fontSize: 14,
    color: ARIOME_COLORS.text.muted,
  },
  planFeatures: {
    marginTop: ARIOME_SPACING.sm,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ARIOME_SPACING.sm,
    gap: ARIOME_SPACING.sm,
  },
  planFeatureText: {
    fontSize: 14,
    color: ARIOME_COLORS.text.secondary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: ARIOME_SPACING.md,
    right: ARIOME_SPACING.md,
  },
  subscribeButton: {
    marginHorizontal: ARIOME_SPACING.lg,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    overflow: 'hidden',
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ARIOME_SPACING.lg,
    gap: ARIOME_SPACING.sm,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  termsText: {
    fontSize: 12,
    color: ARIOME_COLORS.text.subtle,
    textAlign: 'center',
    paddingHorizontal: ARIOME_SPACING.xl,
    marginTop: ARIOME_SPACING.lg,
    lineHeight: 18,
  },
  subscribedContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: ARIOME_SPACING.lg,
  },
  subscribedCard: {
    padding: ARIOME_SPACING.xl,
    borderRadius: ARIOME_BORDERS.radiusXL,
    alignItems: 'center',
  },
  subscribedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    marginTop: ARIOME_SPACING.md,
    marginBottom: ARIOME_SPACING.sm,
  },
  subscribedText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
    paddingVertical: ARIOME_SPACING.md,
    borderRadius: ARIOME_BORDERS.radiusMedium,
    marginTop: ARIOME_SPACING.xl,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
