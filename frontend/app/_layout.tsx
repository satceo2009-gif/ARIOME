import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { MediaPlayerProvider } from '@/contexts/MediaPlayerContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <MediaPlayerProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="email-signup" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="story/[id]" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="change-password" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="creator" />
            <Stack.Screen name="creator-apply" />
            <Stack.Screen name="help" />
            <Stack.Screen name="about" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="terms" />
            <Stack.Screen name="feedback" />
          </Stack>
        </SafeAreaProvider>
      </MediaPlayerProvider>
    </AuthProvider>
  );
}
