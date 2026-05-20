import { useRef, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, disabled = false, placeholder = 'Mensagem...' }: MessageInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View className="flex-row items-end gap-2 px-4 py-3 bg-surface border-t border-white/10">
      <View className={`flex-1 bg-card border rounded-2xl px-4 py-2.5 min-h-[44px] justify-center ${disabled ? 'border-white/5 opacity-50' : 'border-white/10'}`}>
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#8B8B9E"
          multiline
          maxLength={1000}
          editable={!disabled}
          className="text-text-primary text-sm"
          style={{ maxHeight: 100 }}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
      </View>
      <TouchableOpacity
        onPress={handleSend}
        activeOpacity={0.8}
        disabled={!canSend}
        className={`w-11 h-11 rounded-full items-center justify-center ${canSend ? 'bg-primary' : 'bg-card border border-white/10'}`}
      >
        <Feather name="send" size={18} color={canSend ? '#fff' : '#8B8B9E'} />
      </TouchableOpacity>
    </View>
  );
}
