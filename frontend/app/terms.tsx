import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConsciousHeader from '@/components/ConsciousHeader';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ConsciousHeader showBack />

      <ScrollView style={styles.content}>
        <Text style={styles.pageTitle}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 1, 2025</Text>

        <Text style={styles.intro}>
Welcome to ARIOME. By using our platform, you agree to these Terms of Service. Please read them carefully.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
By accessing or using ARIOME, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, please do not use our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.text}>
• You must be at least 13 years old to use ARIOME
• You are responsible for maintaining the security of your account
• You must provide accurate and complete information
• You may not share your account credentials
• You are responsible for all activity under your account
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Roles</Text>
          <Text style={styles.text}>
ARIOME offers different user roles:

• Explorer: Browse and consume content
• Subscriber: Access premium content with paid subscription
• Creator: Upload and share wellness content
• Admin: Platform moderation and management

Each role has specific rights and responsibilities.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Content Guidelines</Text>
          <Text style={styles.text}>
You agree NOT to post content that:

• Violates laws or regulations
• Infringes intellectual property rights
• Contains hate speech or discrimination
• Promotes violence or self-harm
• Contains explicit adult content
• Spreads misinformation
• Harasses or bullies others

We reserve the right to remove violating content and suspend accounts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Creator Terms</Text>
          <Text style={styles.text}>
If you are a Creator:

• You retain ownership of your content
• You grant ARIOME a license to display and distribute your content
• Content must comply with our guidelines
• All content is subject to admin review
• You are responsible for content accuracy and safety
• Earnings are subject to our monetization policies
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Subscription Terms</Text>
          <Text style={styles.text}>
For Subscribers:

• Subscriptions are billed monthly or annually
• Automatic renewal unless cancelled
• Cancel anytime from Settings
• No refunds for partial subscription periods
• Access continues until subscription expires
• Prices may change with 30 days notice
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.text}>
ARIOME and its original content, features, and functionality are owned by CNESS and are protected by international copyright, trademark, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Prohibited Activities</Text>
          <Text style={styles.text}>
You may not:

• Use automated systems (bots) without permission
• Attempt to gain unauthorized access
• Interfere with platform operation
• Impersonate others
• Collect user data without consent
• Engage in commercial activities without authorization
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Termination</Text>
          <Text style={styles.text}>
We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to ARIOME, other users, or third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Disclaimers</Text>
          <Text style={styles.text}>
ARIOME is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free. Wellness content is for informational purposes and not medical advice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
          <Text style={styles.text}>
ARIOME and CNESS shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.text}>
We reserve the right to modify these terms at any time. We will notify users of significant changes. Continued use after changes constitutes acceptance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.text}>
These Terms are governed by applicable laws. Disputes shall be resolved in appropriate courts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Contact</Text>
          <Text style={styles.text}>
For questions about these Terms, contact:

Email: legal@ariome.com
Website: www.ariome.com/legal
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 ARIOME by CNESS. All rights reserved.</Text>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFF',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  intro: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14B8A6',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
