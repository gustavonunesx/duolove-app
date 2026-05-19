import { TouchableOpacity, View, Text } from 'react-native';

interface CalendarEvent {
  id: string;
  color: string;
}

interface DayCellProps {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  isSpecial?: boolean;
  events: CalendarEvent[];
  onPress: () => void;
}

export function DayCell({ day, isToday, isSelected, isCurrentMonth, isSpecial, events, onPress }: DayCellProps) {
  const dotColors = events.slice(0, 3).map((e) => e.color);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 items-center py-1"
    >
      <View
        className={`w-9 h-9 rounded-full items-center justify-center
          ${isSelected ? 'bg-primary' : isToday ? 'border border-primary' : ''}
          ${isSpecial && !isSelected && !isToday ? 'bg-primary/10' : ''}
        `}
      >
        <Text
          className={`text-sm font-medium
            ${isSelected ? 'text-white' : isToday ? 'text-primary' : isCurrentMonth ? 'text-text-primary' : 'text-text-muted/40'}
          `}
        >
          {day}
        </Text>
      </View>
      <View className="flex-row gap-0.5 mt-0.5 h-2 items-center">
        {dotColors.map((color, i) => (
          <View key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        ))}
      </View>
    </TouchableOpacity>
  );
}
