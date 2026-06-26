import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

/** Gera slots de horário entre startHour e endHour no intervalo dado (minutos). */
function buildSlots(startHour: number, endHour: number, stepMinutes: number): string[] {
  const slots: string[] = [];
  const total = (endHour - startHour) * 60;
  for (let m = 0; m <= total; m += stepMinutes) {
    const hour = startHour + Math.floor(m / 60);
    const minute = m % 60;
    slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  }
  return slots;
}

interface TimeSlotPickerProps {
  label: string;
  selected?: string;
  onSelect: (time: string) => void;
  startHour?: number;
  endHour?: number;
  stepMinutes?: number;
  /** Não permitir selecionar horários < minTime (ex.: fim não pode ser antes do início) */
  minTime?: string;
}

export function TimeSlotPicker({
  label,
  selected,
  onSelect,
  startHour = 6,
  endHour = 23,
  stepMinutes = 30,
  minTime,
}: TimeSlotPickerProps) {
  const slots = useMemo(
    () => buildSlots(startHour, endHour, stepMinutes),
    [startHour, endHour, stepMinutes]
  );

  return (
    <>
      <Text className="text-text-muted text-xs font-medium mb-1.5">{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        keyboardShouldPersistTaps="handled"
      >
        {slots.map((time) => {
          const disabled = !!minTime && time < minTime;
          const active = selected === time;
          return (
            <TouchableOpacity
              key={time}
              disabled={disabled}
              onPress={() => onSelect(time)}
              activeOpacity={0.7}
              className={`px-4 py-2.5 rounded-2xl border ${
                active
                  ? 'bg-primary border-primary'
                  : disabled
                    ? 'bg-surface border-white/5'
                    : 'bg-surface border-white/10'
              }`}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${time}`}
              accessibilityState={{ selected: active, disabled }}
            >
              <Text
                className={`text-sm font-medium ${
                  active ? 'text-white' : disabled ? 'text-text-muted/30' : 'text-text-primary'
                }`}
              >
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}
