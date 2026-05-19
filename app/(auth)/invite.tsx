import { View, Text, TouchableOpacity } from 'react-native';
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
  code: z.string().min(6, 'Código deve ter ao menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

const MOCK_INVITER = {
  name: 'Ana Lima',
  avatar: '👩',
};

export default function InviteScreen() {
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onPreview = async (_data: FormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPreviewing(true);
    }, 800);
  };

  const onAccept = () => {
    router.replace('/(app)/dashboard');
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
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.code?.message}
              icon={<Ionicons name="heart-outline" size={18} color="#8B8B9E" />}
            />
          )}
        />

        {!previewing && (
          <Button onPress={handleSubmit(onPreview)} loading={loading}>
            Verificar código
          </Button>
        )}
      </View>

      {/* Preview card */}
      {previewing && (
        <View className="mt-8 gap-4">
          <GlassCard className="items-center p-6">
            <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
              <Text className="text-4xl">{MOCK_INVITER.avatar}</Text>
            </View>
            <Text className="text-text-primary text-lg font-bold">{MOCK_INVITER.name}</Text>
            <Text className="text-text-muted text-sm mt-1 text-center">
              quer começar uma jornada com você no DuoLove 💕
            </Text>
            <View className="flex-row items-center gap-2 mt-3 bg-primary/10 rounded-full px-4 py-1.5">
              <Ionicons name="heart" size={14} color="#E91E8C" />
              <Text className="text-primary text-xs font-medium">Convite verificado</Text>
            </View>
          </GlassCard>

          <Button onPress={onAccept}>
            Aceitar convite e começar
          </Button>

          <Button variant="ghost" onPress={() => setPreviewing(false)}>
            Não sou eu
          </Button>
        </View>
      )}
    </View>
  );
}
