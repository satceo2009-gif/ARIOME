import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HelpScreen() {
  const router = useRouter();

  const helpTopics = [
    {
      icon: 'account-question',
      title: 'Getting Started',
      description: 'Learn how to use ARIOME and explore its features',
    },
    {
      icon: 'video-account',
      title: 'Watching Stories',
      description: 'How to discover, play, and interact with wellness content',
    },
    {
      icon: 'account-group',
      title: 'Community Circles',
      description: 'Join circles, post messages, and connect with others',
    },
    {
      icon: 'book-open-variant',
      title: 'Using Journal',
      description: 'Write reflections and track your wellness journey',
    },
    {
      icon: 'creation',
      title: 'Becoming a Creator',
      description: 'Upload content, manage your stories, and earn',
    },
    {
      icon: 'crown',
      title: 'Subscription & Billing',
      description: 'Manage your subscription and payment methods',
    },
  ];

  const contactOptions = [
    {
      icon: 'email',
      title: 'Email Support',
      description: 'support@ariome.com',
      action: () => Linking.openURL('mailto:support@ariome.com'),
    },
    {
      icon: 'web',
      title: 'Help Center',
      description: 'Visit our online help center',
      action: () => Linking.openURL('https://help.ariome.com'),
    },
    {
      icon: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeCard}>
          <MaterialCommunityIcons name="help-circle" size={48} color="#14B8A6" />
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeText}>Browse topics below or contact our support team</Text>
        </View>

        <Text style={styles.sectionTitle}>Help Topics</Text>
        {helpTopics.map((topic, index) => (
          <TouchableOpacity key={index} style={styles.topicCard}>
            <MaterialCommunityIcons name={topic.icon as any} size={32} color="#14B8A6" />
            <View style={styles.topicText}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDescription}>{topic.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Contact Support</Text>
        {contactOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.contactCard} onPress={option.action}>
            <MaterialCommunityIcons name={option.icon as any} size={24} color="#14B8A6" />
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactDescription}>{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I upgrade to subscriber?</Text>
            <Text style={styles.faqAnswer}>Go to Profile → Click "Upgrade to Subscriber" → Choose your plan</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I join a community circle?</Text>
            <Text style={styles.faqAnswer}>Navigate to Circles tab → Browse circles → Click "Join" on any circle</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I become a creator?</Text>
            <Text style={styles.faqAnswer}>Yes! During signup, select "Creator" role or contact support to upgrade your account</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do reflections work?</Text>
            <Text style={styles.faqAnswer}>Write your thoughts before and after watching a story. View all your reflections in the Journal tab</Text>
          </View>
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
  welcomeCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
    marginTop: 8,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  topicText: {
    flex: 1,
    marginLeft: 16,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactText: {
    flex: 1,
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 12,
    color: '#14B8A6',
  },
  faqSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 20,
  },
});
