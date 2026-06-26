import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEK_DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayStr(): string {
  return toDateStr(new Date());
}

type Cell = { day: number; dateStr: string; isCurrentMonth: boolean };

function buildMonthGrid(year: number, month: number): Cell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    cells.push({ day: d, dateStr: toDateStr(new Date(year, month - 1, d)), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: toDateStr(new Date(year, month, d)), isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, dateStr: toDateStr(new Date(year, month + 1, d)), isCurrentMonth: false });
  }
  return cells;
}

interface CalendarGridProps {
  /** Data selecionada no formato YYYY-MM-DD */
  selectedDate?: string;
  onSelectDate: (dateStr: string) => void;
  /** Data mínima selecionável (YYYY-MM-DD). Datas anteriores ficam desabilitadas. */
  minDate?: string;
  /** Datas com marcador visual (YYYY-MM-DD) */
  markedDates?: string[];
}

export function CalendarGrid({ selectedDate, onSelectDate, minDate, markedDates = [] }: CalendarGridProps) {
  const initial = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const today = todayStr();
  const marked = useMemo(() => new Set(markedDates), [markedDates]);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  return (
    <View className="bg-surface border border-white/10 rounded-2xl p-3">
      {/* Month navigator */}
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity
          onPress={prevMonth}
          activeOpacity={0.7}
          className="w-8 h-8 items-center justify-center rounded-full"
          accessibilityLabel="Mês anterior"
          accessibilityRole="button"
        >
          <Feather name="chevron-left" size={18} color="#F5F0EB" />
        </TouchableOpacity>
        <Text className="text-text-primary font-semibold text-sm" accessibilityRole="header">
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity
          onPress={nextMonth}
          activeOpacity={0.7}
          className="w-8 h-8 items-center justify-center rounded-full"
          accessibilityLabel="Próximo mês"
          accessibilityRole="button"
        >
          <Feather name="chevron-right" size={18} color="#F5F0EB" />
        </TouchableOpacity>
      </View>

      {/* Weekday header */}
      <View className="flex-row mb-1">
        {WEEK_DAYS_SHORT.map((d) => (
          <Text key={d} className="flex-1 text-center text-text-muted text-[11px] font-medium">
            {d}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      {Array.from({ length: 6 }, (_, row) => (
        <View key={row} className="flex-row">
          {cells.slice(row * 7, row * 7 + 7).map((cell) => {
            const isSelected = cell.dateStr === selectedDate;
            const isToday = cell.dateStr === today;
            const isDisabled = !!minDate && cell.dateStr < minDate;
            const isMarked = marked.has(cell.dateStr);

            return (
              <TouchableOpacity
                key={cell.dateStr}
                disabled={isDisabled}
                onPress={() => onSelectDate(cell.dateStr)}
                activeOpacity={0.7}
                className="flex-1 aspect-square items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={cell.dateStr}
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              >
                <View
                  className={`w-9 h-9 items-center justify-center rounded-full ${
                    isSelected ? 'bg-primary' : isToday ? 'border border-primary' : ''
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? 'text-white font-bold'
                        : isDisabled
                          ? 'text-text-muted/30'
                          : !cell.isCurrentMonth
                            ? 'text-text-muted/40'
                            : isToday
                              ? 'text-primary font-semibold'
                              : 'text-text-primary'
                    }`}
                  >
                    {cell.day}
                  </Text>
                </View>
                {isMarked && !isSelected && (
                  <View className="w-1 h-1 rounded-full bg-secondary absolute bottom-0.5" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
