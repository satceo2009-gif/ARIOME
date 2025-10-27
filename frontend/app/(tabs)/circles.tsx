import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Circles() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Circles</Text>
        <Text style={styles.subtitle}>Connect with like-minded souls</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.comingSoonContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="account-group"
              size={48}
              color="#9D4EDD"
            />
          </View>
          <Text style={styles.comingSoonTitle}>Community Circles</Text>
          <Text style={styles.comingSoonText}>
            Join circles of reflection where you can:
          </Text>
          <View style={styles.featuresList}>
            <FeatureItem text="Share your journey with others" />
            <FeatureItem text="Participate in group reflections" />
            <FeatureItem text="Create story chains" />
            <FeatureItem text="Join live AMA sessions" />
          </View>
          <Text style={styles.launchText}>Coming Soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresList: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 15,
    color: '#FFF',
    marginLeft: 12,
  },
  launchText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9D4EDD',
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    borderRadius: 12,
  },
});
