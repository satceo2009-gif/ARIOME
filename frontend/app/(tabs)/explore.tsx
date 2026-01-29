import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ARIOME_COLORS } from '@/constants/theme';

export default function ExploreTab() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to /explore on mount
    router.replace('/explore');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: ARIOME_COLORS.background.deep, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={ARIOME_COLORS.consciousness.teal} />
    </View>
  );
}
