import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to auth screen - users must login/signup first
  return <Redirect href="/auth" />;
}
