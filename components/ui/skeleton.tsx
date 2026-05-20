import { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const roundedMap = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 999,
};

export function Skeleton({ width, height = 16, rounded = 'md', className, style, ...props }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fixedWidth = typeof width === 'number' ? width : undefined;

  return (
    <View
      style={fixedWidth === undefined ? { width: '100%' } : { width: fixedWidth }}
      accessibilityLabel="Carregando"
      accessibilityRole="none"
    >
      <Animated.View
        {...props}
        style={[
          {
            backgroundColor: '#2A2A4E',
            height,
            borderRadius: roundedMap[rounded],
          },
          fixedWidth !== undefined && { width: fixedWidth },
          animatedStyle,
          style,
        ]}
      />
    </View>
  );
}

export function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-card border border-white/10 rounded-2xl p-4 gap-3">
      {children}
    </View>
  );
}
