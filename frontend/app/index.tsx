import { Redirect } from 'expo-router';

export default function Index() {
  // Show splash screen first
  return <Redirect href="/splash" />;
}
