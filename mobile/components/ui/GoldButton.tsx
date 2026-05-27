import { Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { Colors, Fonts, Spacing, Radius, Tracking } from '@/constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function GoldButton({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={0.97}
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.bg : Colors.accent} size="small" />
      ) : (
        <Text style={[styles.label, variant !== 'primary' && styles.labelOutline]}>{label}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,       // 8px — button inside screen, not a card
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: {
    backgroundColor: Colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    letterSpacing: Tracking.wider,   // 1.2 — uppercase button label
    textTransform: 'uppercase',
    color: Colors.bg,
  },
  labelOutline: {
    color: Colors.accent,
  },
});
