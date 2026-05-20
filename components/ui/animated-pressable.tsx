import { ReactNode, useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  disabled?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  scaleDown?: number;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
  accessibilityHint?: string;
}

export function AnimatedTouchable({
  onPress,
  children,
  style,
  className,
  disabled,
  haptic = 'light',
  scaleDown = 0.95,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityHint,
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: scaleDown, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  }

  async function handlePress() {
    if (disabled) return;
    if (haptic !== 'none') {
      const impactMap = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      } as const;
      await Haptics.impactAsync(impactMap[haptic]);
    }
    onPress?.();
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]} className={className}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: !!disabled }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
