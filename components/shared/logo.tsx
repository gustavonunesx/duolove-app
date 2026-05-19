import { View, Text } from 'react-native';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-2xl';
  const tagSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <View className="items-center">
      <Text className={`${textSize} font-bold text-primary tracking-tight`}>
        duo<Text className="text-text-primary">love</Text>
      </Text>
      <Text className={`${tagSize} text-text-muted mt-0.5 tracking-widest uppercase`}>
        seu casal, sincronizado
      </Text>
    </View>
  );
}
