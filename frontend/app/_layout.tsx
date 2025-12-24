import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { ARIOME_COLORS } from '@/constants/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: ARIOME_COLORS.background.deep },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
