import { View, StyleSheet, ViewStyle } from 'react-native';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/ariomeTheme';

interface SacredCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export default function SacredCard({ children, style, elevated = false }: SacredCardProps) {
  return (
    <View style={[
      styles.container,
      elevated && styles.elevated,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ARIOME_COLORS.background.secondary,
    borderRadius: ARIOME_BORDERS.radiusLarge,
    padding: ARIOME_SPACING.lg,
    marginBottom: ARIOME_SPACING.md,
  },
  elevated: {
    backgroundColor: ARIOME_COLORS.background.elevated,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
