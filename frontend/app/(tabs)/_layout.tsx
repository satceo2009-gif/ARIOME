import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View, StyleSheet } from 'react-native';
import AriomeLogo from '@/components/AriomeLogo';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0A0A0F',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#1F2937',
        },
        headerTitle: () => (
          <View style={styles.headerTitle}>
            <AriomeLogo width={140} height={59} />
          </View>
        ),
        headerTintColor: '#14B8A6',
        tabBarStyle: {
          backgroundColor: '#1A1A24',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#14B8A6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="for-you"
        options={{
          title: 'For You',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart-outline" size={size} color={color} />
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
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
          ),
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
