import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If loading, show spinner
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  // If user exists (including explorers), go to main app
  if (user) {
    return <Redirect href="/(tabs)/discover" />;
  }

  // No user - go to auth
  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
