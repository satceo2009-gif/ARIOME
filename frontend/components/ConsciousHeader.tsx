import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AriomeLogo from './AriomeLogo';
import { ARIOME_COLORS, ARIOME_SPACING } from '@/constants/ariomeTheme';

interface ConsciousHeaderProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  rightComponent?: React.ReactNode;
}

export default function ConsciousHeader({ 
  title, 
  showBack = false, 
  showSettings = false,
  rightComponent 
}: ConsciousHeaderProps) {
  const router = useRouter();

  const handleLogoPress = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={ARIOME_COLORS.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Center - Clickable Logo */}
      <TouchableOpacity 
        style={styles.logoContainer}
        onPress={handleLogoPress}
        activeOpacity={0.7}
      >
        <AriomeLogo width={120} height={50} />
      </TouchableOpacity>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {rightComponent ? (
          rightComponent
        ) : showSettings ? (
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color={ARIOME_COLORS.text.muted} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ARIOME_SPACING.md,
    paddingVertical: ARIOME_SPACING.md,
    backgroundColor: ARIOME_COLORS.background.deep,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  leftSection: {
    width: 50,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 50,
    alignItems: 'flex-end',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ARIOME_COLORS.background.secondary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
