import React, { ReactNode, cloneElement, isValidElement, Children } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

interface FormFieldProps {
  /** Label text displayed above the input */
  label: string;
  /** Whether the field is required (shows * indicator) */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper/hint text displayed below the input */
  hint?: string;
  /** The form input element(s) */
  children: ReactNode;
  /** Additional container style */
  className?: string;
}

/**
 * FormField - Consistent form field wrapper with label, error, and hint support
 *
 * Features:
 * - Label with required indicator (*)
 * - Error border injection on children
 * - Animated error message
 * - Optional hint text
 * - RTL-aware layout
 *
 * @example
 * <FormField label="Email" required error={errors.email}>
 *   <TextInput value={email} onChangeText={setEmail} />
 * </FormField>
 */
export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className = '',
}: FormFieldProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Clone children to inject error styling
  const enhancedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    // Check if child accepts className prop (common in RN components with NativeWind)
    const childProps = child.props as Record<string, unknown>;
    const existingClassName = (childProps.className as string) || '';

    // Add error border class if there's an error
    if (error) {
      const errorClassName = existingClassName.includes('border-')
        ? existingClassName.replace(/border-[a-z]+-\d+/g, 'border-error-500')
        : `${existingClassName} border border-error-500`;

      return cloneElement(child, {
        ...childProps,
        className: errorClassName,
      } as Record<string, unknown>);
    }

    return child;
  });

  return (
    <View style={styles.container} className={className}>
      {/* Label */}
      <View style={[styles.labelContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text
          style={[
            styles.label,
            { textAlign: isRTL ? 'right' : 'left' },
          ]}
          className="text-typography-700"
        >
          {label}
        </Text>
        {required && (
          <Text style={styles.required} className="text-error-500">
            {' *'}
          </Text>
        )}
      </View>

      {/* Input */}
      {enhancedChildren}

      {/* Error Message */}
      {error && (
        <Animated.View
          entering={FadeInDown.duration(200).springify()}
          exiting={FadeOutUp.duration(150)}
        >
          <Text
            style={[styles.error, { textAlign: isRTL ? 'right' : 'left' }]}
            className="text-error-500"
          >
            {error}
          </Text>
        </Animated.View>
      )}

      {/* Hint Text */}
      {hint && !error && (
        <Text
          style={[styles.hint, { textAlign: isRTL ? 'right' : 'left' }]}
          className="text-typography-400"
        >
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 6,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});
