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
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'ghost':
        baseStyle.push(styles.ghost);
        break;
      case 'gentle':
        baseStyle.push(styles.gentle);
        break;
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostText);
        break;
      case 'gentle':
        baseStyle.push(styles.gentleText);
        break;
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }
    
    return baseStyle;
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const iconColor = variant === 'primary' ? '#FFF' : variant === 'secondary' ? ARIOME_COLORS.consciousness.teal : ARIOME_COLORS.text.muted;

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons name={icon as any} size={iconSize} color={iconColor} style={styles.iconLeft} />
          )}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons name={icon as any} size={iconSize} color={iconColor} style={styles.iconRight} />
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
  
  // Sizes
  small: {
    paddingVertical: ARIOME_SPACING.sm,
    paddingHorizontal: ARIOME_SPACING.md,
  },
  medium: {
    paddingVertical: ARIOME_SPACING.md,
    paddingHorizontal: ARIOME_SPACING.lg,
  },
  large: {
    paddingVertical: ARIOME_SPACING.lg,
    paddingHorizontal: ARIOME_SPACING.xl,
  },
  
  // Variants
  primary: {
    backgroundColor: ARIOME_COLORS.consciousness.teal,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ARIOME_COLORS.consciousness.teal,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gentle: {
    backgroundColor: ARIOME_COLORS.consciousness.tealMuted,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  // Text
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },
  
  primaryText: {
    color: '#FFF',
  },
  secondaryText: {
    color: ARIOME_COLORS.consciousness.teal,
  },
  ghostText: {
    color: ARIOME_COLORS.text.muted,
  },
  gentleText: {
    color: ARIOME_COLORS.consciousness.teal,
  },
  disabledText: {
    color: ARIOME_COLORS.text.disabled,
  },
  
  iconLeft: {
    marginRight: ARIOME_SPACING.sm,
  },
  iconRight: {
    marginLeft: ARIOME_SPACING.sm,
  },
});
