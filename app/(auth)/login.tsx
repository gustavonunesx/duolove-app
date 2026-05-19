import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../../components/shared/logo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../hooks/use-auth';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      router.replace('/(app)/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao entrar. Verifique suas credenciais.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-20 pb-10">
          {/* Header */}
          <View className="items-center mb-12">
            <Logo size="lg" />
            <Text className="text-text-muted text-base mt-4 text-center">
              Bem-vindo(a) de volta 💕
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Email"
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                  icon={<Ionicons name="mail-outline" size={18} color="#8B8B9E" />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Senha"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                  icon={<Ionicons name="lock-closed-outline" size={18} color="#8B8B9E" />}
                  rightIcon={
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#8B8B9E"
                    />
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              )}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              className="items-end"
            >
              <Text className="text-primary text-sm">Esqueceu a senha?</Text>
            </TouchableOpacity>

            <View className="mt-2">
              <Button onPress={handleSubmit(onSubmit)} loading={loading}>
                Entrar
              </Button>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-3 my-2">
              <View className="flex-1 h-px bg-white/10" />
              <Text className="text-text-muted text-xs">ou continue com</Text>
              <View className="flex-1 h-px bg-white/10" />
            </View>

            {/* Social buttons */}
            <Button
              variant="social"
              onPress={() => {}}
              icon={<Ionicons name="logo-google" size={20} color="#F5F0EB" />}
            >
              Entrar com Google
            </Button>
            <Button
              variant="social"
              onPress={() => {}}
              icon={<Ionicons name="logo-apple" size={20} color="#F5F0EB" />}
            >
              Entrar com Apple
            </Button>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center mt-8 gap-1">
            <Text className="text-text-muted text-sm">Não tem conta?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-primary text-sm font-semibold">Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
