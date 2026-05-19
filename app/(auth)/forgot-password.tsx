import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { GlassCard } from '../../components/ui/glass-card';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  if (sent) {
    return (
      <View className="flex-1 px-6 items-center justify-center">
        <GlassCard className="items-center p-8 w-full">
          <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-6">
            <Ionicons name="mail-open-outline" size={32} color="#E91E8C" />
          </View>
          <Text className="text-text-primary text-xl font-bold text-center">Email enviado!</Text>
          <Text className="text-text-muted text-base text-center mt-3">
            Enviamos um link de recuperação para{'\n'}
            <Text className="text-primary">{getValues('email')}</Text>
          </Text>
          <View className="w-full mt-8">
            <Button onPress={() => router.back()}>Voltar para o login</Button>
          </View>
        </GlassCard>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6 pt-16 pb-10">
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} className="mb-8 flex-row items-center gap-2">
          <Ionicons name="arrow-back" size={20} color="#8B8B9E" />
          <Text className="text-text-muted text-sm">Voltar</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="mb-10">
          <Text className="text-text-primary text-3xl font-bold">Recuperar senha</Text>
          <Text className="text-text-muted text-base mt-3">
            Digite seu email e enviaremos um link para criar uma nova senha.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Email cadastrado"
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

          <View className="mt-2">
            <Button onPress={handleSubmit(onSubmit)} loading={loading}>
              Enviar link de recuperação
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
