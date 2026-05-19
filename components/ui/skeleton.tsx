import { useEffect, useRef } from 'react';
import { Animated, View, ViewProps } from 'react-native';

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
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const fixedWidth = typeof width === 'number' ? width : undefined;

  return (
    <View style={fixedWidth === undefined ? { width: '100%' } : { width: fixedWidth }}>
      <Animated.View
        {...props}
        style={[
          {
            backgroundColor: '#2A2A4E',
            height,
            borderRadius: roundedMap[rounded],
            opacity,
          },
          fixedWidth !== undefined && { width: fixedWidth },
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
