import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AriomeLogo from '@/components/AriomeLogo';
import { ARIOME_COLORS } from '@/constants/theme';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: ARIOME_COLORS.background.deep,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.05)',
        },
        headerTitle: () => (
          <TouchableOpacity
            style={styles.headerTitle}
            onPress={() => router.push('/')}
            activeOpacity={0.7}
            accessibilityLabel="AriOme Home"
            accessibilityRole="button"
          >
            <AriomeLogo width={110} height={45} />
          </TouchableOpacity>
        ),
        headerTintColor: ARIOME_COLORS.consciousness.teal,
        tabBarStyle: {
          backgroundColor: ARIOME_COLORS.background.secondary,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: ARIOME_COLORS.consciousness.teal,
        tabBarInactiveTintColor: ARIOME_COLORS.text.subtle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="reflect"
        options={{
          title: 'Reflect',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="thought-bubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="practices"
        options={{
          title: 'Practices',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="meditation" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wisdom"
        options={{
          title: 'Wisdom',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
