import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

export function DrawerMenuButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      activeOpacity={0.7}
      className="w-9 h-9 rounded-full bg-card border border-white/10 items-center justify-center"
      accessibilityLabel="Abrir menu"
      accessibilityRole="button"
    >
      <Feather name="menu" size={18} color="#8B8B9E" />
    </TouchableOpacity>
  );
}
