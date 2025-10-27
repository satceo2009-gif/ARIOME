import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { INTENTIONS } from '@/constants/intentions';
import * as Haptics from 'expo-haptics';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.name || 'Explorer'}</Text>
          <Text style={styles.email}>{user?.email || 'explorer@ariome.app'}</Text>
        </View>

        {/* Intentions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Intentions</Text>
          <View style={styles.intentionsGrid}>
            {user?.intentions?.map((intentionId) => {
              const intention = INTENTIONS.find((i) => i.id === intentionId);
              return intention ? (
                <View
                  key={intentionId}
                  style={[
                    styles.intentionBadge,
                    { backgroundColor: `${intention.color}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={intention.icon as any}
                    size={20}
                    color={intention.color}
                  />
                  <Text style={[styles.intentionText, { color: intention.color }]}>
                    {intention.name.split(' ')[0]}
                  </Text>
                </View>
              ) : null;
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="play-circle" size={32} color="#9D4EDD" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Stories Played</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="notebook" size={32} color="#9D4EDD" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Reflections</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="heart" size={32} color="#9D4EDD" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Resonance Given</Text>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <MenuItem
            icon="cog-outline"
            label="Settings"
            onPress={() => {}}
          />
          <MenuItem
            icon="bell-outline"
            label="Notifications"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-check-outline"
            label="Privacy & Security"
            onPress={() => {}}
          />
          <MenuItem
            icon="credit-card-outline"
            label="Billing & Subscriptions"
            onPress={() => {}}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-outline"
            label="About ARIOME"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>ARIOME v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#9CA3AF" />
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
    </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#9D4EDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  intentionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  intentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  intentionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A24',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#FFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
});
