import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export default function OnboardingLayout() {
  return (
    <>
      <LinearGradient
        colors={['#1A0A2E', '#0D0D0D', '#0D0D1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
    </>
  );
}
