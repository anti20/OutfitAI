import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        isDisabled ? styles.disabled : null,
      ]}
      onPress={onPress}
      disabled={isDisabled}>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primary: {
    backgroundColor: '#7C3AED',
  },
  secondary: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryLabel: {
    color: '#ffffff',
  },
  secondaryLabel: {
    color: '#E5E7EB',
  },
});

export default Button;
