import React from 'react';
import { View, Text, Pressable, Platform, StyleSheet, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
  GestureUpdateEvent,
  GestureStateChangeEvent,
} from 'react-native-gesture-handler';
import { useToastContext, ToastConfig, ToastType } from '@/context/toast-context';

// Icons for each toast type
const CheckCircleIcon = ({ color }: { color: string }) => (
  <View style={[styles.iconContainer, { backgroundColor: color }]}>
    <Text style={styles.iconText}>✓</Text>
  </View>
);

const XCircleIcon = ({ color }: { color: string }) => (
  <View style={[styles.iconContainer, { backgroundColor: color }]}>
    <Text style={styles.iconText}>✕</Text>
  </View>
);

const WarningIcon = ({ color }: { color: string }) => (
  <View style={[styles.iconContainer, { backgroundColor: color }]}>
    <Text style={styles.iconText}>!</Text>
  </View>
);

const InfoIcon = ({ color }: { color: string }) => (
  <View style={[styles.iconContainer, { backgroundColor: color }]}>
    <Text style={styles.iconText}>i</Text>
  </View>
);

// Toast type configurations
const TOAST_STYLES: Record<ToastType, {
  bg: string;
  border: string;
  text: string;
  icon: string;
  Icon: React.FC<{ color: string }>;
}> = {
  success: {
    bg: '#22C55E',
    border: 'transparent',
    text: '#FFFFFF',
    icon: '#16A34A',
    Icon: CheckCircleIcon,
  },
  error: {
    bg: '#EF4444',
    border: 'transparent',
    text: '#FFFFFF',
    icon: '#DC2626',
    Icon: XCircleIcon,
  },
  warning: {
    bg: '#F59E0B',
    border: 'transparent',
    text: '#FFFFFF',
    icon: '#D97706',
    Icon: WarningIcon,
  },
  info: {
    bg: '#3B82F6',
    border: 'transparent',
    text: '#FFFFFF',
    icon: '#2563EB',
    Icon: InfoIcon,
  },
};

interface ToastItemProps {
  toast: ToastConfig;
  onDismiss: () => void;
  isRTL: boolean;
}

function ToastItem({ toast, onDismiss, isRTL }: ToastItemProps) {
  const style = TOAST_STYLES[toast.type];
  const { Icon } = style;
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      // Allow swipe in direction of dismissal
      const threshold = isRTL ? -event.translationX : event.translationX;
      if (threshold > 0) {
        translateX.value = event.translationX;
        opacity.value = 1 - Math.abs(event.translationX) / 200;
      }
    })
    .onEnd((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      const threshold = isRTL ? -event.translationX : event.translationX;
      if (threshold > 100) {
        // Dismiss
        translateX.value = withTiming(isRTL ? -300 : 300, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(onDismiss)();
        });
      } else {
        // Spring back
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        entering={FadeInDown.duration(300).springify()}
        exiting={FadeOutUp.duration(200)}
        style={[
          styles.toastContainer,
          {
            backgroundColor: style.bg,
            borderColor: style.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
          animatedStyle,
        ]}
      >
        <Icon color={style.icon} />

        <View style={[styles.contentContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          {toast.title && (
            <Text
              style={[
                styles.title,
                { color: style.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {toast.title}
            </Text>
          )}
          <Text
            style={[
              styles.message,
              { color: style.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={2}
          >
            {toast.message}
          </Text>
        </View>

        <Pressable
          onPress={onDismiss}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={styles.dismissButton}
        >
          <Text style={[styles.dismissText, { color: style.text }]}>✕</Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export function ToastContainer() {
  const { toasts, hideToast } = useToastContext();
  const { i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRTL = i18n.language === 'ar';

  if (toasts.length === 0) {
    return null;
  }

  // On web, we need different positioning
  const containerStyle = Platform.select({
    web: {
      position: 'fixed' as const,
      top: 20,
      left: 16,
      right: 16,
      zIndex: 9999,
    },
    default: {
      position: 'absolute' as const,
      top: Math.max(insets.top, 16),
      left: 16,
      right: 16,
      zIndex: 9999,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => hideToast(toast.id)}
          isRTL={isRTL}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  toastContainer: {
    borderRadius: 12,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.6,
  },
});
