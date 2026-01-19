import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'What is ARIOME?',
    answer: 'ARIOME is a conscious wellness platform that offers guided meditations, healing stories, and mindfulness content. Our mission is to help you on your journey to inner peace and personal growth.'
  },
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Tap "Sign Up" on the welcome screen. You can start as an Explorer with just your email, or create a full account with password to become a Subscriber with unlimited access.'
  },
  {
    category: 'Getting Started',
    question: 'What\'s the difference between Explorer and Subscriber?',
    answer: 'Explorers can browse stories and watch short clips/trailers. Subscribers get full access to all content, including premium stories, community circles, and journal features.'
  },
  {
    category: 'Content & Stories',
    question: 'How do I find stories?',
    answer: 'Use the Discover tab to browse all stories. Filter by intention (Healing, Love, Growth, etc.) or search for specific topics. Tap any story card to start listening.'
  },
  {
    category: 'Content & Stories',
    question: 'Can I save stories for later?',
    answer: 'Yes! Tap the bookmark icon on any story to save it to your Library. Access your saved stories anytime from the Library tab.'
  },
  {
    category: 'Content & Stories',
    question: 'What are reflection prompts?',
    answer: 'Each story includes "Before" and "After" reflection prompts to help you engage more deeply with the content. You can journal your responses in the Journal tab.'
  },
  {
    category: 'Community',
    question: 'How do I join a Circle?',
    answer: 'Go to the Circles tab, browse available circles by intention, and tap "Join" on any circle. Once joined, you can view posts and share your own reflections.'
  },
  {
    category: 'Community',
    question: 'Can I create my own Circle?',
    answer: 'Yes! Tap the + button on the Circles tab to create a new circle. Choose an intention, add a description, and invite others to join your community.'
  },
  {
    category: 'Journal',
    question: 'How do I write a journal entry?',
    answer: 'Go to the Journal tab and tap the + button. Write your thoughts, select a mood, and add tags to organize your entries. Your journal is private and only visible to you.'
  },
  {
    category: 'Account & Billing',
    question: 'How do I upgrade to Subscriber?',
    answer: 'Go to Profile → tap "Upgrade to Subscriber" → choose your plan (monthly or yearly). Payment is securely processed, and you\'ll get immediate access to all content.'
  },
  {
    category: 'Account & Billing',
    question: 'How do I change my password?',
    answer: 'Go to Profile → Settings → Change Password. Enter your current password and your new password to update it.'
  },
  {
    category: 'Account & Billing',
    question: 'How do I cancel my subscription?',
    answer: 'Go to Profile → Settings → Billing & Subscription → Cancel Subscription. You\'ll continue to have access until the end of your billing period.'
  },
  {
    category: 'Creators',
    question: 'How do I become a Creator?',
    answer: 'When signing up, select "Creator" as your role. You\'ll need to submit your profile for verification. Once approved, you can upload your own wellness content and earn from your stories.'
  },
  {
    category: 'Creators',
    question: 'How do tips work?',
    answer: 'Subscribers can tip creators directly from the story player. Tips go directly to the creator after a small platform fee. Check your Creator Dashboard for earnings.'
  },
  {
    category: 'Technical',
    question: 'Why won\'t videos play?',
    answer: 'Ensure you have a stable internet connection. Try refreshing the app or clearing the cache. If issues persist, contact support.'
  },
  {
    category: 'Technical',
    question: 'How do I report a problem?',
    answer: 'Go to Profile → Help & Support → Contact Us, or email support@ariome.com with details about the issue.'
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(FAQ_DATA.map(f => f.category)))];
  
  const filteredFAQ = selectedCategory === 'All' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(f => f.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ConsciousHeader showBack />

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <MaterialCommunityIcons name="help-circle" size={48} color="#14B8A6" />
          <Text style={styles.welcomeTitle}>How can we help?</Text>
          <Text style={styles.welcomeText}>Find answers to common questions below</Text>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {filteredFAQ.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqCard}
            onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <View style={styles.faqQuestion}>
                <Text style={styles.faqCategory}>{faq.category}</Text>
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
              </View>
              <MaterialCommunityIcons 
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#14B8A6" 
              />
            </View>
            {expandedIndex === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact Section */}
        <Text style={styles.sectionTitle}>Still need help?</Text>
        <View style={styles.contactSection}>
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => Linking.openURL('mailto:support@ariome.com')}
          >
            <MaterialCommunityIcons name="email" size={32} color="#14B8A6" />
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactDesc}>support@ariome.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactCard}>
            <MaterialCommunityIcons name="chat" size={32} color="#F59E0B" />
            <Text style={styles.contactTitle}>Live Chat</Text>
            <Text style={styles.contactDesc}>Available 9am-5pm</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>ARIOME v1.0.0</Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => router.push('/privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>•</Text>
            <TouchableOpacity onPress={() => router.push('/terms')}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
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
    marginBottom: 24,
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
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#14B8A6',
  },
  categoryText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    flex: 1,
    marginRight: 16,
  },
  faqCategory: {
    fontSize: 11,
    color: '#14B8A6',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  contactSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 12,
  },
  contactDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appVersion: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLink: {
    fontSize: 12,
    color: '#14B8A6',
  },
  legalDivider: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 8,
  },
});
