import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>About ARIOME</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="yoga" size={80} color="#14B8A6" />
          <Text style={styles.appName}>ARIOME</Text>
          <Text style={styles.tagline}>by CNESS</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.text}>
            ARIOME is a conscious wellness broadcasting platform that blends a creator economy with mindful entertainment. 
            We're positioned against traditional meditation apps by offering intention-based discovery, reflection-first engagement, 
            and creator empowerment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="compass" size={24} color="#14B8A6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Intention-Based Discovery</Text>
              <Text style={styles.text}>Find content aligned with your personal intentions: Healing, Resilience, Love, Mindfulness, Growth, Joy, and Gratitude.</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons name="account-group" size={24} color="#14B8A6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Community Circles</Text>
              <Text style={styles.text}>Connect with like-minded individuals in intention-based communities. Share experiences and support each other's journey.</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color="#14B8A6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Reflection Journal</Text>
              <Text style={styles.text}>Document your wellness journey with personal reflections before and after each story.</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons name="creation" size={24} color="#14B8A6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Creator Empowerment</Text>
              <Text style={styles.text}>Share your wisdom and wellness expertise. Earn from your content while making a positive impact.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <Text style={styles.text}>• Consciousness & Mindfulness{"\n"}• Community & Connection{"\n"}• Creator Empowerment{"\n"}• Authentic Growth{"\n"}• Emotional Well-being</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.text}>Email: support@ariome.com{"\n"}Website: www.ariome.com{"\n"}Instagram: @ariome_wellness</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 ARIOME by CNESS</Text>
          <Text style={styles.footerText}>All rights reserved</Text>
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
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#14B8A6',
    marginTop: 4,
  },
  version: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureText: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
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
    marginTop: 4,
  },
});
