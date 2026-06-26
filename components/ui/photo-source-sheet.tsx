import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ImageSource } from '../../lib/utils/pick-image';

interface PhotoSourceSheetProps {
  visible: boolean;
  onClose: () => void;
  onPick: (source: ImageSource) => void;
}

const OPTIONS: { source: ImageSource; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { source: 'camera', label: 'Câmera', icon: 'camera' },
  { source: 'library', label: 'Galeria', icon: 'image' },
  { source: 'files', label: 'Arquivos', icon: 'folder' },
];

export function PhotoSourceSheet({ visible, onClose, onPick }: PhotoSourceSheetProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} accessibilityViewIsModal>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} accessibilityLabel="Fechar">
          <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', opacity: backdropOpacity }} />
        </Pressable>

        <Animated.View
          className="bg-card rounded-t-3xl border-t border-white/10 px-5 pt-3 pb-8"
          style={{ transform: [{ translateY: slideAnim }] }}
        >
          <View className="items-center pb-3">
            <View className="w-10 h-1 bg-white/20 rounded-full" />
          </View>
          <Text className="text-text-primary text-base font-bold mb-3" accessibilityRole="header">
            Adicionar foto
          </Text>

          <View className="gap-2">
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.source}
                onPress={() => { onClose(); onPick(opt.source); }}
                activeOpacity={0.7}
                className="flex-row items-center gap-3 bg-surface border border-white/10 rounded-2xl px-4 py-3.5"
                accessibilityRole="button"
                accessibilityLabel={opt.label}
              >
                <View className="w-9 h-9 rounded-xl bg-primary/15 items-center justify-center">
                  <Feather name={opt.icon} size={18} color="#E91E8C" />
                </View>
                <Text className="text-text-primary text-sm font-medium">{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
