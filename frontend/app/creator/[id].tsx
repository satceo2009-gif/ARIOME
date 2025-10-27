import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CreatorProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // This would normally fetch creator data from API
  const creator = {
    name: 'Dr. Sarah Williams',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Grief counselor and mindfulness teacher with 15 years of experience',
    verified: true,
    followers: 12500,
    storiesCount: 48,
    totalResonance: 125000,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialCommunityIcons name="share-variant" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image source={{ uri: creator.avatar }} style={styles.avatar} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{creator.name}</Text>
            {creator.verified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={24}
                color="#9D4EDD"
              />
            )}
          </View>
          <Text style={styles.bio}>{creator.bio}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{creator.followers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{creator.storiesCount}</Text>
              <Text style={styles.statLabel}>Stories</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{(creator.totalResonance / 1000).toFixed(1)}K</Text>
              <Text style={styles.statLabel}>Resonance</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.followButton}>
              <MaterialCommunityIcons name="account-plus" size={20} color="#FFF" />
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tipButton}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#FFF" />
              <Text style={styles.tipButtonText}>Tip</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.storiesSection}>
          <Text style={styles.sectionTitle}>Stories</Text>
          <Text style={styles.comingSoon}>Creator stories coming soon...</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 26, 36, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 26, 36, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#9D4EDD',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bio: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#9D4EDD',
    paddingVertical: 14,
    borderRadius: 12,
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  tipButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  storiesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 40,
  },
});
