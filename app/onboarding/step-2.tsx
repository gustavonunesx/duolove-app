import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/button';
import { GlassCard } from '../../components/ui/glass-card';
import { useOnboardingStore } from '../../stores/onboarding-store';
import { OnboardingHeader } from '../../components/shared/onboarding-header';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function OnboardingStep2() {
  const { relationshipStart, setRelationshipStart } = useOnboardingStore();
  const now = new Date();
  const [year, setYear] = useState(relationshipStart?.getFullYear() ?? now.getFullYear());
  const [month, setMonth] = useState(relationshipStart?.getMonth() ?? now.getMonth());
  const [day, setDay] = useState(relationshipStart?.getDate() ?? now.getDate());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);

  const selectedDate = new Date(year, month, safeDay);
  const diffMs = Date.now() - selectedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const handleContinue = () => {
    setRelationshipStart(selectedDate);
    router.push('/onboarding/step-3');
  };

  const isFuture = selectedDate > new Date();

  return (
    <View className="flex-1 px-6 pt-16 pb-10">
      <OnboardingHeader
        step={2}
        total={4}
        title="Quando vocês começaram?"
        subtitle="Essa data vai ser o marco do relacionamento de vocês no app."
      />

      {/* Date picker */}
      <GlassCard className="p-6">
        {/* Month */}
        <View className="mb-6">
          <Text className="text-text-muted text-xs mb-3 uppercase tracking-widest">Mês</Text>
          <View className="flex-row flex-wrap gap-2">
            {MONTHS.map((m, i) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMonth(i)}
                className={`px-3 py-2 rounded-xl border ${month === i ? 'bg-primary border-primary' : 'bg-white/5 border-white/10'}`}
              >
                <Text className={`text-sm font-medium ${month === i ? 'text-white' : 'text-text-muted'}`}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Day + Year */}
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-text-muted text-xs mb-3 uppercase tracking-widest">Dia</Text>
            <View className="flex-row items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              <TouchableOpacity onPress={() => setDay(Math.max(1, day - 1))}>
                <Ionicons name="chevron-back" size={18} color="#8B8B9E" />
              </TouchableOpacity>
              <Text className="text-text-primary text-lg font-bold">{String(safeDay).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => setDay(Math.min(daysInMonth, day + 1))}>
                <Ionicons name="chevron-forward" size={18} color="#8B8B9E" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-text-muted text-xs mb-3 uppercase tracking-widest">Ano</Text>
            <View className="flex-row items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              <TouchableOpacity onPress={() => setYear(year - 1)}>
                <Ionicons name="chevron-back" size={18} color="#8B8B9E" />
              </TouchableOpacity>
              <Text className="text-text-primary text-lg font-bold">{year}</Text>
              <TouchableOpacity onPress={() => setYear(Math.min(now.getFullYear(), year + 1))}>
                <Ionicons name="chevron-forward" size={18} color="#8B8B9E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Days counter preview */}
      {!isFuture && (
        <View className="mt-6 items-center">
          <View className="flex-row items-center gap-2 bg-primary/10 rounded-full px-6 py-3 border border-primary/20">
            <Ionicons name="heart" size={16} color="#E91E8C" />
            <Text className="text-primary font-semibold text-base">
              {diffDays === 0 ? 'Começou hoje!' : `${diffDays.toLocaleString()} dias juntos`}
            </Text>
          </View>
        </View>
      )}

      <View className="flex-1" />

      <Button onPress={handleContinue} disabled={isFuture}>
        Continuar
      </Button>
    </View>
  );
}
