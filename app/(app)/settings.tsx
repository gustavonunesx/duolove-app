import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../../components/ui/glass-card';
import { useAuth } from '../../hooks/use-auth';
import { usePushNotifications } from '../../hooks/use-push-notifications';
import { useSubscription } from '../../hooks/use-subscription';
import { useCouple } from '../../hooks/use-couple';
import { supabase } from '../../lib/supabase/client';

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Upgrade modal ────────────────────────────────────────────────────────────

function UpgradeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  async function handleCheckout() {
    setIsLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ interval }),
      });

      const { url } = await res.json();
      if (url) {
        onClose();
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o checkout. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  const monthlyPrice = 'R$ 19,90/mês';
  const yearlyPrice = 'R$ 159,90/ano';
  const yearlySaving = 'Economize R$ 79/ano';

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-end">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-card rounded-t-3xl border-t border-white/10 px-5 pb-10 pt-4">
          <View className="items-center mb-4">
            <View className="w-10 h-1 bg-white/20 rounded-full" />
          </View>

          <View className="items-center mb-6">
            <View className="w-14 h-14 rounded-full bg-primary/20 border border-primary items-center justify-center mb-3">
              <Feather name="star" size={26} color="#E91E8C" />
            </View>
            <Text className="text-text-primary text-xl font-bold">DuoLove Premium</Text>
            <Text className="text-text-muted text-sm text-center mt-1">
              Tudo que o amor precisa, sem limites
            </Text>
          </View>

          {/* Features */}
          <View className="gap-2.5 mb-6">
            {[
              { icon: 'droplet' as const, text: 'Temas exclusivos do casal' },
              { icon: 'image' as const, text: 'Storage ilimitado de memórias' },
              { icon: 'bar-chart-2' as const, text: 'Retrospectiva mensal' },
              { icon: 'lock' as const, text: 'Cápsulas do tempo ilimitadas' },
            ].map((f) => (
              <View key={f.text} className="flex-row items-center gap-3">
                <View className="w-7 h-7 rounded-full bg-primary/20 items-center justify-center">
                  <Feather name={f.icon} size={14} color="#E91E8C" />
                </View>
                <Text className="text-text-primary text-sm">{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Plan toggle */}
          <View className="flex-row gap-3 mb-5">
            {(['month', 'year'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setInterval(p)}
                activeOpacity={0.8}
                className={`flex-1 rounded-2xl border p-3 items-center gap-0.5 ${
                  interval === p ? 'bg-primary/20 border-primary' : 'bg-surface border-white/10'
                }`}
              >
                <Text className={`font-bold text-sm ${interval === p ? 'text-primary' : 'text-text-muted'}`}>
                  {p === 'month' ? monthlyPrice : yearlyPrice}
                </Text>
                {p === 'year' && (
                  <Text className="text-green-400 text-xs font-medium">{yearlySaving}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            activeOpacity={0.85}
            disabled={isLoading}
            className={`bg-primary rounded-2xl py-4 items-center ${isLoading ? 'opacity-60' : ''}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-bold text-base">Continuar para o pagamento</Text>
            )}
          </TouchableOpacity>

          <Text className="text-text-muted text-xs text-center mt-3">
            Cancele a qualquer momento. Renovação automática.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { preferences, isUpdating, updatePreferences } = usePushNotifications();
  const { isPremium, subscription } = useSubscription();
  const { couple } = useCouple();
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Usuário';
  const initial = displayName.charAt(0).toUpperCase();

  async function togglePref(key: 'notify_events' | 'notify_messages' | 'notify_capsules' | 'notify_invites') {
    if (!preferences) return;
    await updatePreferences({ [key]: !preferences[key] });
  }

  async function handleOpenPortal() {
    setIsOpeningPortal(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { url } = await res.json();
      if (url) await Linking.openURL(url);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o portal. Tente novamente.');
    } finally {
      setIsOpeningPortal(false);
    }
  }

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

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
                <Text className="text-primary text-xs font-bold">{initial}</Text>
              </View>
              {couple?.user2_id && (
                <View className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-secondary items-center justify-center -ml-2">
                  <Text className="text-secondary text-xs font-bold">P</Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-sm font-medium">
                {couple?.user2_id ? 'Vocês dois' : 'Aguardando parceiro(a)'}
              </Text>
              {couple?.start_date && (
                <Text className="text-text-muted text-xs">
                  Juntos desde {new Date(couple.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
              )}
            </View>
            <View className={`px-2 py-1 rounded-full ${isPremium ? 'bg-primary/20' : 'bg-green-500/20'}`}>
              <Text className={`text-xs font-medium ${isPremium ? 'text-primary' : 'text-green-400'}`}>
                {isPremium ? 'Premium' : 'Free'}
              </Text>
            </View>
          </View>

          {!isPremium && (
            <>
              <Divider />
              <SettingsRow
                icon="star"
                label="Upgrade para Premium"
                sublabel="Desbloqueie temas e recursos exclusivos"
                onPress={() => setUpgradeModalVisible(true)}
              />
            </>
          )}

          {isPremium && (
            <>
              <Divider />
              <SettingsRow
                icon="credit-card"
                label="Gerenciar assinatura"
                sublabel={renewalDate ? `Renova em ${renewalDate}` : 'Premium ativo'}
                onPress={handleOpenPortal}
                rightElement={
                  isOpeningPortal
                    ? <ActivityIndicator size="small" color="#E91E8C" />
                    : undefined
                }
              />
            </>
          )}
        </GlassCard>

        <SectionLabel label="Aparência" />
        <GlassCard className="gap-1">
          <SettingsRow icon="droplet" label="Tema do casal" sublabel="Rosa" />
          <Divider />
          <SettingsRow icon="moon" label="Modo escuro" sublabel="Sempre ativo" />
        </GlassCard>

        <SectionLabel label="Notificações" />
        <GlassCard className="gap-1">
          {isUpdating && (
            <View className="absolute right-3 top-3 z-10">
              <ActivityIndicator size="small" color="#E91E8C" />
            </View>
          )}
          <View className="flex-row items-center gap-3 py-3 px-1">
            <View className="w-8 h-8 rounded-lg items-center justify-center bg-primary/20">
              <Feather name="calendar" size={16} color="#E91E8C" />
            </View>
            <Text className="text-text-primary text-sm font-medium flex-1">Alertas de eventos</Text>
            <Switch
              value={preferences?.notify_events ?? true}
              onValueChange={() => togglePref('notify_events')}
              trackColor={{ false: '#3A3A4E', true: '#E91E8C' }}
              thumbColor="#fff"
              disabled={isUpdating || !preferences}
            />
          </View>
          <Divider />
          <View className="flex-row items-center gap-3 py-3 px-1">
            <View className="w-8 h-8 rounded-lg items-center justify-center bg-primary/20">
              <Feather name="message-circle" size={16} color="#E91E8C" />
            </View>
            <Text className="text-text-primary text-sm font-medium flex-1">Mensagens do casal</Text>
            <Switch
              value={preferences?.notify_messages ?? true}
              onValueChange={() => togglePref('notify_messages')}
              trackColor={{ false: '#3A3A4E', true: '#E91E8C' }}
              thumbColor="#fff"
              disabled={isUpdating || !preferences}
            />
          </View>
          <Divider />
          <View className="flex-row items-center gap-3 py-3 px-1">
            <View className="w-8 h-8 rounded-lg items-center justify-center bg-primary/20">
              <Feather name="lock" size={16} color="#E91E8C" />
            </View>
            <Text className="text-text-primary text-sm font-medium flex-1">Cápsulas do tempo</Text>
            <Switch
              value={preferences?.notify_capsules ?? true}
              onValueChange={() => togglePref('notify_capsules')}
              trackColor={{ false: '#3A3A4E', true: '#E91E8C' }}
              thumbColor="#fff"
              disabled={isUpdating || !preferences}
            />
          </View>
          <Divider />
          <View className="flex-row items-center gap-3 py-3 px-1">
            <View className="w-8 h-8 rounded-lg items-center justify-center bg-primary/20">
              <Feather name="user-plus" size={16} color="#E91E8C" />
            </View>
            <Text className="text-text-primary text-sm font-medium flex-1">Convites de casal</Text>
            <Switch
              value={preferences?.notify_invites ?? true}
              onValueChange={() => togglePref('notify_invites')}
              trackColor={{ false: '#3A3A4E', true: '#E91E8C' }}
              thumbColor="#fff"
              disabled={isUpdating || !preferences}
            />
          </View>
          {!preferences && (
            <View className="px-1 pb-2">
              <Text className="text-text-muted text-xs">
                Ative as notificações para gerenciar preferências.
              </Text>
            </View>
          )}
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

      <UpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
      />
    </View>
  );
}
