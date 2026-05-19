import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

interface OnboardingHeaderProps {
  step: number;
  total: number;
  title: string;
  subtitle: string;
}

export function OnboardingHeader({ step, total, title, subtitle }: OnboardingHeaderProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(step / total, { duration: 500 });
  }, [step, total]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View className="mb-8">
      {/* Progress bar */}
      <View className="flex-row items-center gap-3 mb-6">
        <View className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <Animated.View
            style={barStyle}
            className="h-full bg-primary rounded-full"
          />
        </View>
        <Text className="text-text-muted text-xs">
          {step}/{total}
        </Text>
      </View>

      <Text className="text-text-primary text-2xl font-bold">{title}</Text>
      <Text className="text-text-muted text-base mt-2">{subtitle}</Text>
    </View>
  );
}
