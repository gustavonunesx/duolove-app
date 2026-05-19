import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { GlassCard } from '../../components/ui/glass-card';
import { validateInvite, acceptInvite } from '../../lib/supabase/couples';
import { useAuth } from '../../hooks/use-auth';

const schema = z.object({
  code: z.string().min(6, 'Código deve ter ao menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

interface InviterInfo {
  name: string;
  token: string;
}

export default function InviteScreen() {
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [inviter, setInviter] = useState<InviterInfo | null>(null);
  const { user } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onPreview = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await validateInvite(data.code);
      if (!result) {
        Alert.alert('Código inválido', 'Este código não existe ou já expirou. Peça um novo ao seu(sua) parceiro(a).');
        return;
      }
      const name = result.users?.name ?? 'Seu(sua) parceiro(a)';
      setInviter({ name, token: data.code });
    } catch {
      Alert.alert('Erro', 'Não foi possível verificar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onAccept = async () => {
    if (!inviter || !user) return;
    setAccepting(true);
    try {
      await acceptInvite(inviter.token, user.id);
      router.replace('/(app)/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Não foi possível aceitar o convite.';
      Alert.alert('Erro', message);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <View className="flex-1 px-6 pt-16 pb-10">
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} className="mb-8 flex-row items-center gap-2">
        <Ionicons name="arrow-back" size={20} color="#8B8B9E" />
        <Text className="text-text-muted text-sm">Voltar</Text>
      </TouchableOpacity>

      {/* Header */}
      <View className="mb-10">
        <Text className="text-text-primary text-3xl font-bold">Convite de casal</Text>
        <Text className="text-text-muted text-base mt-3">
          Digite o código que você recebeu do(a) seu(sua) parceiro(a).
        </Text>
      </View>

      {/* Form */}
      <View className="gap-4">
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Código de convite"
              placeholder="Ex: DUO-123456"
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.code?.message}
              icon={<Ionicons name="heart-outline" size={18} color="#8B8B9E" />}
            />
          )}
        />

        {!inviter && (
          <Button onPress={handleSubmit(onPreview)} loading={loading}>
            Verificar código
          </Button>
        )}
      </View>

      {/* Preview card */}
      {inviter && (
        <View className="mt-8 gap-4">
          <GlassCard className="items-center p-6">
            <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
              <Text className="text-4xl">💕</Text>
            </View>
            <Text className="text-text-primary text-lg font-bold">{inviter.name}</Text>
            <Text className="text-text-muted text-sm mt-1 text-center">
              quer começar uma jornada com você no DuoLove 💕
            </Text>
            <View className="flex-row items-center gap-2 mt-3 bg-primary/10 rounded-full px-4 py-1.5">
              <Ionicons name="heart" size={14} color="#E91E8C" />
              <Text className="text-primary text-xs font-medium">Convite verificado</Text>
            </View>
          </GlassCard>

          <Button onPress={onAccept} loading={accepting}>
            Aceitar convite e começar
          </Button>

          <Button variant="ghost" onPress={() => setInviter(null)}>
            Não sou eu
          </Button>
        </View>
      )}
    </View>
  );
}
