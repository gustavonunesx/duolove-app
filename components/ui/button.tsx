import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'social';

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
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

export function Button({ onPress, children, variant = 'primary', loading, disabled, icon, fullWidth = true }: ButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`${styles.container} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#E91E8C'} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={styles.text}>{children}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
