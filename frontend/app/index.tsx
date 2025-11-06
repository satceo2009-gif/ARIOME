import { Redirect } from 'expo-router';

export default function Index() {
  // Direct redirect to onboarding (allow exploration first)
  return <Redirect href="/onboarding" />;
}
