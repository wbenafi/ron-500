import { forwardRef } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerStyle, inputStyle, placeholderTextColor, ...props }, ref) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          ref={ref}
          style={[styles.input, error ? styles.inputError : null, inputStyle]}
          placeholderTextColor={placeholderTextColor || colors.muted}
          {...props}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.rose,
  },
  error: {
    color: colors.rose,
    fontSize: 12,
  },
});

export default Input;