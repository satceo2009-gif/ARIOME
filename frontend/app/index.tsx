import { Redirect } from 'expo-router';

export default function Index() {
  // Direct redirect to auth
  return <Redirect href="/auth" />;
}
