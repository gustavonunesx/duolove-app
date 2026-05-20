import { ActivityIndicator, Text, View } from 'react-native';
import { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Pressable } from 'react-native';

type Variant = 'primary' | 'outline' | 'ghost' | 'social';

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary rounded-2xl py-4 items-center justify-center',
    text: 'text-white font-semibold text-base',
  },
  outline: {
    container: 'border border-primary rounded-2xl py-4 items-center justify-center',
    text: 'text-primary font-semibold text-base',
  },
  ghost: {
    container: 'rounded-2xl py-4 items-center justify-center',
    text: 'text-text-muted font-medium text-base',
  },
  social: {
    container: 'bg-card border border-white/10 rounded-2xl py-4 items-center justify-center flex-row gap-3',
    text: 'text-text-primary font-medium text-base',
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  variant = 'primary',
  loading,
  disabled,
  icon,
  fullWidth = true,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }

  async function handlePress() {
    if (isDisabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={animatedStyle}
      className={`${styles.container} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''}`}
      accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? children : undefined)}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#E91E8C'} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={styles.text}>{children}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}
