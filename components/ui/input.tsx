import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { useState, ReactNode } from 'react';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
}

export function Input({ label, error, icon, rightIcon, onRightIconPress, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="w-full gap-1.5">
      {label && (
        <Text className="text-text-muted text-sm font-medium">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-card rounded-2xl px-4 border ${
          error
            ? 'border-red-500'
            : focused
            ? 'border-primary'
            : 'border-white/10'
        }`}
      >
        {icon && <View className="mr-3 opacity-60">{icon}</View>}
        <TextInput
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className="flex-1 text-text-primary text-base py-4"
          placeholderTextColor="#8B8B9E"
          style={{ color: '#F5F0EB' }}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} className="ml-3 opacity-60">
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-400 text-xs">{error}</Text>
      )}
    </View>
  );
}
