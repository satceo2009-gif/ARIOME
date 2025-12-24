import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ARIOME_COLORS, ARIOME_SPACING, ARIOME_BORDERS } from '@/constants/ariomeTheme';

interface ConsciousButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gentle';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function ConsciousButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ConsciousButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: ARIOME_SPACING.sm, paddingHorizontal: ARIOME_SPACING.md };
      case 'large':
        return { paddingVertical: ARIOME_SPACING.lg, paddingHorizontal: ARIOME_SPACING.xl };
      default:
        return { paddingVertical: ARIOME_SPACING.md, paddingHorizontal: ARIOME_SPACING.lg };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: ARIOME_COLORS.consciousness.teal };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'gentle':
        return { backgroundColor: ARIOME_COLORS.consciousness.tealMuted };
      default:
        return { backgroundColor: ARIOME_COLORS.consciousness.teal };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return ARIOME_COLORS.consciousness.teal;
      case 'ghost':
        return ARIOME_COLORS.text.muted;
      case 'gentle':
        return ARIOME_COLORS.consciousness.teal;
      default:
        return '#FFF';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 13;
      case 'large': return 17;
      default: return 15;
    }
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const textColor = disabled ? ARIOME_COLORS.text.disabled : getTextColor();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyles(),
        getVariantStyles(),
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons name={icon as any} size={iconSize} color={textColor} style={styles.iconLeft} />
          )}
          <Text style={[styles.text, { color: textColor, fontSize: getFontSize() }, textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons name={icon as any} size={iconSize} color={textColor} style={styles.iconRight} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ARIOME_BORDERS.radiusMedium,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: ARIOME_SPACING.sm,
  },
  iconRight: {
    marginLeft: ARIOME_SPACING.sm,
  },
});
