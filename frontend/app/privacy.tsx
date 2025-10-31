import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: January 1, 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.text}>
We collect information you provide directly to us, including:

• Account Information: Name, email address, password, and profile information
• Content: Stories you create, reflections you write, and journal entries
• Usage Data: How you interact with our platform, including stories watched, circles joined, and engagement metrics
• Device Information: Device type, operating system, and unique device identifiers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.text}>
We use the information we collect to:

• Provide and improve our services
• Personalize your experience with intention-based recommendations
• Process transactions and send related information
• Send you technical notices and support messages
• Communicate about products, services, and events
• Monitor and analyze trends and usage
• Detect and prevent fraud and abuse
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.text}>
We do not sell your personal information. We may share your information:

• With your consent
• With service providers who perform services on our behalf
• To comply with legal obligations
• To protect rights, property, and safety
• In connection with a business transaction (merger, acquisition)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.text}>
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.text}>
You have the right to:

• Access your personal information
• Correct inaccurate data
• Request deletion of your data
• Object to processing
• Export your data
• Withdraw consent at any time
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.text}>
We retain your information for as long as necessary to provide our services and comply with legal obligations. You may delete your account at any time from Settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.text}>
Our services are not intended for users under 13 years of age. We do not knowingly collect information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. International Data Transfers</Text>
          <Text style={styles.text}>
Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
          <Text style={styles.text}>
We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.text}>
If you have questions about this Privacy Policy, contact us at:

Email: privacy@ariome.com
Address: ARIOME by CNESS, [Address]
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 ARIOME by CNESS</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 24,
    fontStyle: 'italic',
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
