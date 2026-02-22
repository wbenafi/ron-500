import { ReactNode } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: Variant;
  size?: Size;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children: ReactNode;
}

const sizeStyles: Record<Size, ViewStyle> = {
  sm: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  md: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
};

const variantContainerStyles: Record<Exclude<Variant, 'primary' | 'danger'>, ViewStyle> = {
  secondary: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: 1,
  },
};

const variantTextStyles: Record<Variant, TextStyle> = {
  primary: { color: '#ffffff' },
  secondary: { color: colors.text },
  danger: { color: '#ffffff' },
  ghost: { color: colors.muted },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const content =
    typeof children === 'string' || typeof children === 'number' ? (
      <Text style={[styles.text, variantTextStyles[variant], textStyle]}>{children}</Text>
    ) : (
      children
    );

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variant === 'secondary' || variant === 'ghost'
          ? variantContainerStyles[variant]
          : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      {...props}
    >
      {variant === 'primary' || variant === 'danger' ? (
        <LinearGradient
          colors={variant === 'primary' ? [colors.emerald, colors.teal] : [colors.rose, '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 8,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});