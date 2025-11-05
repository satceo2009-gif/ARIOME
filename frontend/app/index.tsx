import { Redirect } from 'expo-router';

export default function Index() {
  // Direct redirect to auth
  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#14B8A6',
    opacity: 0.2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#14B8A6',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    letterSpacing: 2,
  },
});
