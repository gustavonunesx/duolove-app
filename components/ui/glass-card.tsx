import { View, ViewProps } from 'react-native';
import { ReactNode } from 'react';

interface GlassCardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <View
      {...props}
      className={`bg-card border border-white/10 rounded-2xl p-4 ${className}`}
    >
      {children}
    </View>
  );
}
