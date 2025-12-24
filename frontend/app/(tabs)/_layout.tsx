import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AriomeLogo from '@/components/AriomeLogo';
import { ARIOME_COLORS } from '@/constants/ariomeTheme';

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
            <AriomeLogo width={120} height={50} />
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
        name="self-ariome"
        options={{
          title: 'Self',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="meditation" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="for-you"
        options={{
          title: 'Wisdom',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="circles"
        options={{
          title: 'Circles',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" size={size} color={color} />
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
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          href: null,
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
