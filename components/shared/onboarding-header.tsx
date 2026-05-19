import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface OnboardingHeaderProps {
  step: number;
  total: number;
  title: string;
  subtitle: string;
}

export function OnboardingHeader({ step, total, title, subtitle }: OnboardingHeaderProps) {
  const progress = useRef(new Animated.Value(step / total)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: step / total,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [step, total]);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="mb-8">
      <View className="flex-row items-center gap-3 mb-6">
        <View className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <Animated.View
            style={{ width: widthInterpolated, height: '100%', backgroundColor: '#E91E8C', borderRadius: 999 }}
          />
        </View>
        <Text className="text-text-muted text-xs">{step}/{total}</Text>
      </View>

      <Text className="text-text-primary text-2xl font-bold">{title}</Text>
      <Text className="text-text-muted text-base mt-2">{subtitle}</Text>
    </View>
  );
}
