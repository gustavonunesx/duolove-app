import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../../components/ui/glass-card';
import { useAuth } from '../../hooks/use-auth';

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest px-1 mb-2 mt-4">{label}</Text>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
  danger,
  rightElement,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  sublabel?: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-3 px-1"
    >
      <View
        className="w-8 h-8 rounded-lg items-center justify-center"
        style={{ backgroundColor: danger ? '#FF4D4D20' : '#E91E8C20' }}
      >
        <Feather name={icon} size={16} color={danger ? '#FF4D4D' : '#E91E8C'} />
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-text-primary'}`}>{label}</Text>
        {sublabel ? <Text className="text-text-muted text-xs">{sublabel}</Text> : null}
      </View>
      {rightElement ?? <Feather name="chevron-right" size={16} color="#8B8B9E" />}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="h-px bg-white/5 mx-1" />;
}

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Usuário';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-surface">
      <View className="px-5 pt-14 pb-4">
        <Text className="text-text-primary text-2xl font-bold">Configurações</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <GlassCard className="flex-row items-center gap-4 mb-2">
          <View className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary items-center justify-center">
            <Text className="text-primary text-2xl font-bold">{initial}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-bold text-lg">{displayName}</Text>
            <Text className="text-text-muted text-sm">{user?.email ?? ''}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} className="bg-primary/10 px-3 py-1.5 rounded-full">
            <Text className="text-primary text-xs font-semibold">Editar</Text>
          </TouchableOpacity>
        </GlassCard>

        <SectionLabel label="Meu casal" />
        <GlassCard className="gap-1">
          <View className="flex-row items-center gap-3 py-2">
            <View className="flex-row">
              <View className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary items-center justify-center z-10">
                <Text className="text-primary text-xs font-bold">G</Text>
              </View>
              <View className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-secondary items-center justify-center -ml-2">
                <Text className="text-secondary text-xs font-bold">A</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-sm font-medium">Gustavo & Ana</Text>
              <Text className="text-text-muted text-xs">Juntos desde 14 fev 2023</Text>
            </View>
            <View className="bg-green-500/20 px-2 py-1 rounded-full">
              <Text className="text-green-400 text-xs font-medium">Free</Text>
            </View>
          </View>
          <Divider />
          <SettingsRow icon="star" label="Upgrade para Premium" sublabel="Desbloqueie temas e recursos exclusivos" />
        </GlassCard>

        <SectionLabel label="Aparência" />
        <GlassCard className="gap-1">
          <SettingsRow icon="droplet" label="Tema do casal" sublabel="Rosa" />
          <Divider />
          <SettingsRow icon="moon" label="Modo escuro" sublabel="Sempre ativo" />
        </GlassCard>

        <SectionLabel label="Notificações" />
        <GlassCard className="gap-1">
          <SettingsRow icon="bell" label="Alertas de eventos" />
          <Divider />
          <SettingsRow icon="calendar" label="Lembretes de datas especiais" />
          <Divider />
          <SettingsRow icon="message-circle" label="Mensagens do casal" />
        </GlassCard>

        <SectionLabel label="Conta" />
        <GlassCard className="gap-1">
          <SettingsRow icon="shield" label="Privacidade e segurança" />
          <Divider />
          <SettingsRow icon="help-circle" label="Ajuda e suporte" />
          <Divider />
          <SettingsRow
            icon="log-out"
            label="Sair"
            danger
            onPress={signOut}
            rightElement={<View />}
          />
        </GlassCard>

        <Text className="text-text-muted text-xs text-center mt-6">DuoLove v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
