import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../../components/shared/logo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { GlassCard } from '../../components/ui/glass-card';
import { useAuth } from '../../hooks/use-auth';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const { signUpWithEmail } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.name);
      setConfirmedEmail(data.email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        visible={!!confirmedEmail}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <GlassCard className="items-center w-full p-8">
            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-6">
              <Ionicons name="mail-open-outline" size={40} color="#E91E8C" />
            </View>
            <Text className="text-text-primary text-2xl font-bold text-center">
              Verifique seu email
            </Text>
            <Text className="text-text-muted text-base text-center mt-3 leading-6">
              Enviamos um link de confirmação para{'\n'}
              <Text className="text-primary font-semibold">{confirmedEmail}</Text>
            </Text>
            <Text className="text-text-muted text-sm text-center mt-3 leading-5">
              Abra o email e clique no link para ativar sua conta antes de continuar.
            </Text>
            <View className="w-full mt-8 gap-3">
              <Button onPress={() => router.replace('/(auth)/login')}>
                Ir para o login
              </Button>
              <Button variant="ghost" onPress={() => setConfirmedEmail('')}>
                Voltar e corrigir email
              </Button>
            </View>
          </GlassCard>
        </View>
      </Modal>

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
        <View className="flex-1 px-6 pt-16 pb-10">
          {/* Header */}
          <View className="items-center mb-10">
            <Logo size="md" />
            <Text className="text-text-primary text-2xl font-bold mt-6">Criar conta</Text>
            <Text className="text-text-muted text-base mt-2 text-center">
              Comece a jornada com quem você ama 💕
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Seu nome"
                  placeholder="Como podemos te chamar?"
                  autoCapitalize="words"
                  autoComplete="name"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name?.message}
                  icon={<Ionicons name="person-outline" size={18} color="#8B8B9E" />}
                />
              )}
            />

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
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                  icon={<Ionicons name="lock-closed-outline" size={18} color="#8B8B9E" />}
                  rightIcon={<Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8B8B9E" />}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Confirmar senha"
                  placeholder="••••••••"
                  secureTextEntry={!showConfirm}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.confirmPassword?.message}
                  icon={<Ionicons name="lock-closed-outline" size={18} color="#8B8B9E" />}
                  rightIcon={<Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#8B8B9E" />}
                  onRightIconPress={() => setShowConfirm(!showConfirm)}
                />
              )}
            />

            <View className="mt-2">
              <Button onPress={handleSubmit(onSubmit)} loading={loading}>
                Criar conta
              </Button>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-3 my-2">
              <View className="flex-1 h-px bg-white/10" />
              <Text className="text-text-muted text-xs">ou cadastre com</Text>
              <View className="flex-1 h-px bg-white/10" />
            </View>

            <Button
              variant="social"
              onPress={() => {}}
              icon={<Ionicons name="logo-google" size={20} color="#F5F0EB" />}
            >
              Continuar com Google
            </Button>
            <Button
              variant="social"
              onPress={() => {}}
              icon={<Ionicons name="logo-apple" size={20} color="#F5F0EB" />}
            >
              Continuar com Apple
            </Button>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center mt-8 gap-1">
            <Text className="text-text-muted text-sm">Já tem conta?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary text-sm font-semibold">Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}
