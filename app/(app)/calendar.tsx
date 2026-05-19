import { useState, useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DayCell } from '../../components/calendar/day-cell';
import { EventCard, CalendarEvent } from '../../components/calendar/event-card';
import { EventFormSheet } from '../../components/calendar/event-form-sheet';
import { EventDetailSheet } from '../../components/calendar/event-detail-sheet';
import { useEvents } from '../../hooks/use-events';
import { useAuth } from '../../hooks/use-auth';
import type { EventRow } from '../../lib/supabase/events';

// Mapeia EventRow do banco para CalendarEvent da UI
function toCalendarEvent(row: EventRow, currentUserId: string): CalendarEvent {
  const typeMap: Record<string, CalendarEvent['type']> = {
    personal: 'pessoal',
    couple: 'casal',
    anniversary: 'especial',
    travel: 'viagem',
  };
  const visibilityMap: Record<string, CalendarEvent['visibility']> = {
    private: 'privado',
    shared: 'compartilhado',
  };
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    date: row.start_at.slice(0, 10),
    startTime: row.start_at.slice(11, 16),
    endTime: row.end_at.slice(11, 16),
    type: typeMap[row.type] ?? 'casal',
    color: row.color,
    visibility: visibilityMap[row.visibility] ?? 'compartilhado',
    createdBy: row.creator_id === currentUserId ? 'me' : 'partner',
  };
}

// Mapeia CalendarEvent da UI para EventInsert do banco
function toEventInsert(event: Omit<CalendarEvent, 'id' | 'createdBy'>) {
  const typeMap: Record<CalendarEvent['type'], string> = {
    pessoal: 'personal',
    casal: 'couple',
    especial: 'anniversary',
    viagem: 'travel',
  };
  const visibilityMap: Record<CalendarEvent['visibility'], string> = {
    privado: 'private',
    compartilhado: 'shared',
  };
  const date = event.date;
  const start = event.startTime ? `${date}T${event.startTime}:00` : `${date}T00:00:00`;
  const end = event.endTime ? `${date}T${event.endTime}:00` : start;
  return {
    title: event.title,
    description: event.description ?? null,
    start_at: start,
    end_at: end,
    type: typeMap[event.type] as 'personal' | 'couple' | 'anniversary' | 'travel',
    color: event.color,
    visibility: visibilityMap[event.visibility] as 'private' | 'shared',
  };
}

const SPECIAL_DATES: string[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEK_DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function today(): string {
  return toDateStr(new Date());
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Monthly grid ─────────────────────────────────────────────────────────────

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const dt = new Date(year, month - 1, d);
    cells.push({ day: d, dateStr: toDateStr(dt), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    cells.push({ day: d, dateStr: toDateStr(dt), isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const dt = new Date(year, month + 1, d);
    cells.push({ day: d, dateStr: toDateStr(dt), isCurrentMonth: false });
  }
  return cells;
}

// ─── Weekly helpers ───────────────────────────────────────────────────────────

function getWeekDates(dateStr: string): string[] {
  const d = new Date(dateStr);
  const day = d.getDay();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(sunday);
    dt.setDate(sunday.getDate() + i);
    return toDateStr(dt);
  });
}

// ─── Filter types ─────────────────────────────────────────────────────────────

type FilterType = 'todos' | 'casal' | 'pessoal';

// ─── Sub-components ───────────────────────────────────────────────────────────

function ViewToggle({ view, onChange }: { view: string; onChange: (v: string) => void }) {
  const options = [
    { key: 'month', label: 'Mês' },
    { key: 'week', label: 'Semana' },
    { key: 'day', label: 'Dia' },
  ];
  return (
    <View className="flex-row bg-card border border-white/10 rounded-2xl p-1 gap-1">
      {options.map((o) => (
        <TouchableOpacity
          key={o.key}
          onPress={() => onChange(o.key)}
          activeOpacity={0.7}
          className={`flex-1 py-1.5 rounded-xl items-center ${view === o.key ? 'bg-primary' : ''}`}
        >
          <Text className={`text-xs font-semibold ${view === o.key ? 'text-white' : 'text-text-muted'}`}>
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function FilterBar({ filter, onChange }: { filter: FilterType; onChange: (f: FilterType) => void }) {
  const opts: { key: FilterType; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'casal', label: 'Casal' },
    { key: 'pessoal', label: 'Meus' },
  ];
  return (
    <View className="flex-row gap-2">
      {opts.map((o) => (
        <TouchableOpacity
          key={o.key}
          onPress={() => onChange(o.key)}
          activeOpacity={0.7}
          className={`px-3 py-1.5 rounded-full border ${
            filter === o.key ? 'bg-primary/20 border-primary' : 'bg-card border-white/10'
          }`}
        >
          <Text className={`text-xs font-medium ${filter === o.key ? 'text-primary' : 'text-text-muted'}`}>
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Monthly view ─────────────────────────────────────────────────────────────

function MonthView({
  year,
  month,
  events,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const todayStr = today();

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  return (
    <View>
      <View className="flex-row mb-1">
        {WEEK_DAYS_SHORT.map((d) => (
          <Text key={d} className="flex-1 text-center text-text-muted text-xs font-medium py-1">{d}</Text>
        ))}
      </View>
      {Array.from({ length: 6 }, (_, row) => (
        <View key={row} className="flex-row">
          {cells.slice(row * 7, row * 7 + 7).map((cell) => (
            <DayCell
              key={cell.dateStr}
              day={cell.day}
              isToday={cell.dateStr === todayStr}
              isSelected={cell.dateStr === selectedDate}
              isCurrentMonth={cell.isCurrentMonth}
              isSpecial={SPECIAL_DATES.includes(cell.dateStr)}
              events={eventsByDate[cell.dateStr] ?? []}
              onPress={() => onSelectDate(cell.dateStr)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Weekly view ──────────────────────────────────────────────────────────────

function WeekView({
  selectedDate,
  events,
  onSelectDate,
}: {
  selectedDate: string;
  events: CalendarEvent[];
  onSelectDate: (d: string) => void;
}) {
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const todayStr = today();

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  return (
    <View>
      <View className="flex-row gap-1">
        {weekDates.map((dateStr) => {
          const d = new Date(dateStr);
          const dayNum = d.getDate();
          const dayName = WEEK_DAYS_SHORT[d.getDay()];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const hasEvents = (eventsByDate[dateStr]?.length ?? 0) > 0;

          return (
            <TouchableOpacity
              key={dateStr}
              onPress={() => onSelectDate(dateStr)}
              activeOpacity={0.7}
              className={`flex-1 items-center py-2 rounded-2xl ${isSelected ? 'bg-primary' : isToday ? 'border border-primary' : 'bg-card border border-white/5'}`}
            >
              <Text className={`text-xs ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>{dayName}</Text>
              <Text className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : isToday ? 'text-primary' : 'text-text-primary'}`}>
                {dayNum}
              </Text>
              {hasEvents && (
                <View className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white/70' : 'bg-primary'}`} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Color legend ─────────────────────────────────────────────────────────────

function ColorLegend() {
  const items = [
    { color: '#E91E8C', label: 'Casal' },
    { color: '#9B59B6', label: 'Especial' },
    { color: '#3498DB', label: 'Viagem' },
    { color: '#2ECC71', label: 'Pessoal' },
  ];
  return (
    <View className="flex-row flex-wrap gap-x-4 gap-y-1 px-1">
      {items.map((i) => (
        <View key={i.color} className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i.color }} />
          <Text className="text-text-muted text-xs">{i.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const now = new Date();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(today());
  const [filter, setFilter] = useState<FilterType>('todos');
  const [formVisible, setFormVisible] = useState(false);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);

  const { user } = useAuth();
  const { events: rawEvents, isLoading, addEvent, removeEvent } = useEvents();

  const events: CalendarEvent[] = useMemo(
    () => (user ? rawEvents.map((r) => toCalendarEvent(r, user.id)) : []),
    [rawEvents, user]
  );

  function navigatePrev() {
    if (view === 'month') {
      if (month === 0) { setYear(y => y - 1); setMonth(11); }
      else setMonth(m => m - 1);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - (view === 'week' ? 7 : 1));
      setSelectedDate(toDateStr(d));
      setYear(d.getFullYear());
      setMonth(d.getMonth());
    }
  }

  function navigateNext() {
    if (view === 'month') {
      if (month === 11) { setYear(y => y + 1); setMonth(0); }
      else setMonth(m => m + 1);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + (view === 'week' ? 7 : 1));
      setSelectedDate(toDateStr(d));
      setYear(d.getFullYear());
      setMonth(d.getMonth());
    }
  }

  function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr);
    const d = new Date(dateStr);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filter === 'casal') return e.visibility === 'compartilhado';
      if (filter === 'pessoal') return e.createdBy === 'me';
      return true;
    });
  }, [events, filter]);

  const dayEvents = useMemo(
    () => filteredEvents.filter((e) => e.date === selectedDate),
    [filteredEvents, selectedDate]
  );

  async function handleSaveEvent(data: Omit<CalendarEvent, 'id' | 'createdBy'>) {
    await addEvent(toEventInsert(data));
  }

  async function handleDeleteEvent(id: string) {
    await removeEvent(id);
    setDetailEvent(null);
  }

  const headerTitle = view === 'month'
    ? `${MONTH_NAMES[month]} ${year}`
    : view === 'week'
      ? `Semana de ${formatDate(selectedDate)}`
      : formatDate(selectedDate);

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-14 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-text-primary text-2xl font-bold">Calendário</Text>
          {isLoading && <ActivityIndicator size="small" color="#E91E8C" />}
        </View>
        <TouchableOpacity
          onPress={() => setFormVisible(true)}
          activeOpacity={0.8}
          className="w-9 h-9 bg-primary rounded-full items-center justify-center"
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* View toggle */}
        <ViewToggle view={view} onChange={(v) => setView(v as typeof view)} />

        {/* Month navigator */}
        <View className="flex-row items-center justify-between mt-4 mb-3">
          <TouchableOpacity onPress={navigatePrev} activeOpacity={0.7} className="w-9 h-9 items-center justify-center">
            <Feather name="chevron-left" size={20} color="#F5F0EB" />
          </TouchableOpacity>
          <Text className="text-text-primary font-semibold text-base">{headerTitle}</Text>
          <TouchableOpacity onPress={navigateNext} activeOpacity={0.7} className="w-9 h-9 items-center justify-center">
            <Feather name="chevron-right" size={20} color="#F5F0EB" />
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        {view === 'month' && (
          <MonthView
            year={year}
            month={month}
            events={filteredEvents}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )}
        {view === 'week' && (
          <WeekView
            selectedDate={selectedDate}
            events={filteredEvents}
            onSelectDate={handleSelectDate}
          />
        )}
        {view === 'day' && (
          <View className="bg-card border border-white/10 rounded-2xl p-4 items-center">
            <Text className="text-text-primary font-bold text-2xl">{new Date(selectedDate).getDate()}</Text>
            <Text className="text-text-muted text-sm">{MONTH_NAMES[new Date(selectedDate).getMonth()]} {new Date(selectedDate).getFullYear()}</Text>
          </View>
        )}

        {/* Color legend */}
        <View className="mt-4 mb-3">
          <ColorLegend />
        </View>

        {/* Filter */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-text-primary font-semibold text-sm">
            {view === 'day' || (view === 'week') ? 'Eventos do dia' : 'Eventos — ' + formatDate(selectedDate)}
          </Text>
          <FilterBar filter={filter} onChange={setFilter} />
        </View>

        {/* Event list */}
        {dayEvents.length === 0 ? (
          <View className="bg-card border border-white/10 rounded-2xl p-8 items-center gap-3">
            <Feather name="calendar" size={36} color="#8B8B9E" />
            <Text className="text-text-muted text-sm text-center">
              Nenhum evento para este dia 💭{'\n'}Que tal planejar algo juntos?
            </Text>
            <TouchableOpacity
              onPress={() => setFormVisible(true)}
              activeOpacity={0.8}
              className="bg-primary/10 border border-primary/30 px-5 py-2 rounded-full"
            >
              <Text className="text-primary text-sm font-medium">Criar evento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-2">
            {dayEvents.map((event) => (
              <EventCard key={event.id} event={event} onPress={() => setDetailEvent(event)} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sheets */}
      <EventFormSheet
        visible={formVisible}
        selectedDate={selectedDate}
        onClose={() => setFormVisible(false)}
        onSave={handleSaveEvent}
      />
      <EventDetailSheet
        event={detailEvent}
        visible={!!detailEvent}
        onClose={() => setDetailEvent(null)}
        onDelete={handleDeleteEvent}
      />
    </View>
  );
}
