import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Memory, MemoryCard, MemoryGridCard, MemoryTag } from '../../components/memories/memory-card';
import { MemoryLightbox } from '../../components/memories/memory-lightbox';
import { Capsule, CapsuleCard } from '../../components/memories/capsule-card';

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_MEMORIES: Memory[] = [
  {
    id: '1',
    title: 'Fim de semana em Campos do Jordão',
    description: 'Aquela viagem incrível que fizemos juntos. Frio, chocolate quente e muito amor.',
    date: '12 mai 2025',
    photoPlaceholder: '📸 Montanhas e neve',
    tags: ['viagem'],
    createdBy: 'me',
  },
  {
    id: '2',
    title: 'Primeiro aniversário de namoro',
    description: 'Um ano juntos e cada dia melhor. Jantar surpresa e flores.',
    date: '14 fev 2025',
    photoPlaceholder: '📸 Jantar romântico',
    tags: ['aniversário', 'date'],
    createdBy: 'partner',
    partnerInitial: 'A',
  },
  {
    id: '3',
    title: 'Nosso primeiro Natal juntos',
    description: 'A família toda reunida, presentes e muito carinho.',
    date: '25 dez 2024',
    photoPlaceholder: '📸 Árvore de Natal',
    tags: ['milestone', 'dia a dia'],
    createdBy: 'me',
  },
  {
    id: '4',
    title: 'Praia de Florianópolis',
    description: 'Sol, mar e nós dois. O melhor verão da vida.',
    date: '15 jan 2025',
    photoPlaceholder: '📸 Pôr do sol na praia',
    tags: ['viagem', 'date'],
    createdBy: 'partner',
    partnerInitial: 'A',
  },
  {
    id: '5',
    title: 'Domingo de pijama em casa',
    description: 'Filme, pipoca e a melhor companhia do mundo.',
    date: '02 mar 2025',
    photoPlaceholder: '📸 Sofá e cobertor',
    tags: ['dia a dia'],
    createdBy: 'me',
  },
];

const INITIAL_CAPSULES: Capsule[] = [
  {
    id: 'c1',
    message: 'Amor, quando você ler isso já faz 2 anos que estamos juntos. Obrigada por cada momento. Te amo infinito. ❤️',
    revealAt: '2025-02-14',
    revealedAt: '2025-02-14',
    createdBy: 'partner',
    partnerInitial: 'A',
  },
  {
    id: 'c2',
    revealAt: '2026-02-14',
    createdBy: 'me',
  },
];

const TAG_OPTIONS: MemoryTag[] = ['viagem', 'date', 'aniversário', 'milestone', 'dia a dia'];

// ─── Memory Form Sheet ────────────────────────────────────────────────────────

function MemoryFormSheet({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (m: Omit<Memory, 'id' | 'createdBy'>) => void;
}) {
  const slideAnim = useRef(new Animated.Value(700)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<MemoryTag[]>([]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 700, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      setTitle(''); setDescription(''); setDate(''); setSelectedTags([]);
    }
  }, [visible]);

  function toggleTag(tag: MemoryTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date: date.trim() || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      photoPlaceholder: '📸 Nova memória',
      tags: selectedTags.length ? selectedTags : ['dia a dia'],
    });
    onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <Animated.View className="flex-1 bg-black/60" style={{ opacity: backdropOpacity }}>
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>
        <Animated.View
          className="bg-card rounded-t-3xl border-t border-white/10"
          style={{ transform: [{ translateY: slideAnim }], marginTop: -700 }}
        >
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 bg-white/20 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-text-primary text-lg font-bold">Nova memória</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#8B8B9E" />
            </TouchableOpacity>
          </View>
          <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
            {/* Photo picker placeholder */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="h-32 bg-surface border-2 border-dashed border-white/20 rounded-2xl items-center justify-center gap-2 mb-4"
            >
              <Feather name="camera" size={28} color="#8B8B9E" />
              <Text className="text-text-muted text-sm">Toque para adicionar foto</Text>
            </TouchableOpacity>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Título da memória"
              placeholderTextColor="#8B8B9E"
              className="bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-base mb-3"
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Conta um pouquinho sobre esse momento..."
              placeholderTextColor="#8B8B9E"
              multiline
              textAlignVertical="top"
              className="bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-sm mb-3"
              style={{ height: 80 }}
            />
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="Data (ex: 15 mai 2025)"
              placeholderTextColor="#8B8B9E"
              className="bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-sm mb-4"
            />

            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Tags</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {TAG_OPTIONS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.7}
                    className={`px-3 py-1.5 rounded-full border capitalize ${
                      active ? 'bg-primary/20 border-primary' : 'bg-surface border-white/10'
                    }`}
                  >
                    <Text className={`text-sm capitalize ${active ? 'text-primary' : 'text-text-muted'}`}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              className={`bg-primary rounded-2xl py-4 items-center ${!title.trim() ? 'opacity-40' : ''}`}
              disabled={!title.trim()}
            >
              <Text className="text-white font-semibold text-base">Salvar memória</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Capsule Form Sheet ───────────────────────────────────────────────────────

function CapsuleFormSheet({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (c: Omit<Capsule, 'id' | 'createdBy'>) => void;
}) {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState('');
  const [revealDate, setRevealDate] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 500, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      setMessage(''); setRevealDate('');
    }
  }, [visible]);

  function handleSave() {
    if (!revealDate.trim()) return;
    onSave({ message: message.trim() || undefined, revealAt: revealDate.trim() });
    onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <Animated.View className="flex-1 bg-black/60" style={{ opacity: backdropOpacity }}>
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>
        <Animated.View
          className="bg-card rounded-t-3xl border-t border-white/10"
          style={{ transform: [{ translateY: slideAnim }], marginTop: -500 }}
        >
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 bg-white/20 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-text-primary text-lg font-bold">Nova cápsula do tempo</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#8B8B9E" />
            </TouchableOpacity>
          </View>
          <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
            <Text className="text-text-muted text-sm mb-4 leading-5">
              Escreva uma mensagem que só será revelada na data que você escolher. Perfeito para aniversários e surpresas! 🔒
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Escreva sua mensagem secreta..."
              placeholderTextColor="#8B8B9E"
              multiline
              textAlignVertical="top"
              className="bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-sm mb-3"
              style={{ height: 120 }}
            />
            <TextInput
              value={revealDate}
              onChangeText={setRevealDate}
              placeholder="Data de revelação (AAAA-MM-DD)"
              placeholderTextColor="#8B8B9E"
              className="bg-surface border border-white/10 rounded-2xl px-4 py-3 text-text-primary text-sm mb-6"
            />
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              className={`bg-secondary rounded-2xl py-4 items-center ${!revealDate.trim() ? 'opacity-40' : ''}`}
              disabled={!revealDate.trim()}
            >
              <Text className="text-white font-semibold text-base">Lacrar cápsula</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type MemoryView = 'timeline' | 'grid';
type FilterTag = 'todos' | MemoryTag;

export default function MemoriesScreen() {
  const [viewMode, setViewMode] = useState<MemoryView>('timeline');
  const [filterTag, setFilterTag] = useState<FilterTag>('todos');
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [capsules, setCapsules] = useState<Capsule[]>(INITIAL_CAPSULES);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [memoryFormVisible, setMemoryFormVisible] = useState(false);
  const [capsuleFormVisible, setCapsuleFormVisible] = useState(false);

  const filtered = filterTag === 'todos'
    ? memories
    : memories.filter((m) => m.tags.includes(filterTag as MemoryTag));

  function handleSaveMemory(data: Omit<Memory, 'id' | 'createdBy'>) {
    setMemories((prev) => [{ ...data, id: String(Date.now()), createdBy: 'me' }, ...prev]);
  }

  function handleSaveCapsule(data: Omit<Capsule, 'id' | 'createdBy'>) {
    setCapsules((prev) => [...prev, { ...data, id: String(Date.now()), createdBy: 'me' }]);
  }

  function handleRevealCapsule(id: string) {
    setCapsules((prev) =>
      prev.map((c) => c.id === id ? { ...c, revealedAt: new Date().toISOString().slice(0, 10) } : c)
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-14 pb-3">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text-primary text-2xl font-bold">Memórias</Text>
          <TouchableOpacity
            onPress={() => setMemoryFormVisible(true)}
            activeOpacity={0.8}
            className="w-9 h-9 bg-primary rounded-full items-center justify-center"
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* View toggle */}
        <View className="flex-row bg-card border border-white/10 rounded-2xl p-1 gap-1 mb-3">
          {(['timeline', 'grid'] as const).map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => setViewMode(v)}
              activeOpacity={0.7}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-xl ${viewMode === v ? 'bg-primary' : ''}`}
            >
              <Feather
                name={v === 'timeline' ? 'list' : 'grid'}
                size={14}
                color={viewMode === v ? '#fff' : '#8B8B9E'}
              />
              <Text className={`text-xs font-semibold ${viewMode === v ? 'text-white' : 'text-text-muted'}`}>
                {v === 'timeline' ? 'Timeline' : 'Grade'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tag filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
          <View className="flex-row gap-2 pb-1">
            {(['todos', ...TAG_OPTIONS] as FilterTag[]).map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => setFilterTag(tag)}
                activeOpacity={0.7}
                className={`px-3 py-1.5 rounded-full border capitalize whitespace-nowrap ${
                  filterTag === tag ? 'bg-primary/20 border-primary' : 'bg-card border-white/10'
                }`}
              >
                <Text className={`text-xs font-medium capitalize ${filterTag === tag ? 'text-primary' : 'text-text-muted'}`}>
                  {tag === 'todos' ? 'Todos' : tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Memory list / grid */}
        {filtered.length === 0 ? (
          <View className="bg-card border border-white/10 rounded-2xl p-8 items-center gap-3 mb-6">
            <Feather name="image" size={40} color="#8B8B9E" />
            <Text className="text-text-muted text-sm text-center">
              O primeiro capítulo de vocês começa aqui ✨
            </Text>
            <TouchableOpacity
              onPress={() => setMemoryFormVisible(true)}
              activeOpacity={0.8}
              className="bg-primary/10 border border-primary/30 px-5 py-2 rounded-full"
            >
              <Text className="text-primary text-sm font-medium">Adicionar memória</Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === 'timeline' ? (
          <View className="gap-4 mb-6">
            {filtered.map((memory, i) => (
              <View key={memory.id} className="flex-row gap-3">
                {/* Timeline line */}
                <View className="items-center" style={{ width: 20 }}>
                  <View className="w-3 h-3 rounded-full bg-primary mt-4" />
                  {i < filtered.length - 1 && (
                    <View className="w-0.5 flex-1 bg-primary/20 mt-1" />
                  )}
                </View>
                <View className="flex-1">
                  <MemoryCard memory={memory} onPress={() => setSelectedMemory(memory)} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="mb-6">
            <FlatList
              data={filtered}
              keyExtractor={(m) => m.id}
              numColumns={2}
              columnWrapperStyle={{ gap: 10 }}
              contentContainerStyle={{ gap: 10 }}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <MemoryGridCard memory={item} onPress={() => setSelectedMemory(item)} />
              )}
            />
          </View>
        )}

        {/* Cápsula do tempo section */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Feather name="lock" size={15} color="#9B59B6" />
            <Text className="text-text-primary font-semibold text-sm">Cápsula do tempo</Text>
          </View>
          <TouchableOpacity
            onPress={() => setCapsuleFormVisible(true)}
            activeOpacity={0.7}
            className="bg-secondary/10 border border-secondary/30 px-3 py-1 rounded-full"
          >
            <Text className="text-secondary text-xs font-medium">Nova cápsula</Text>
          </TouchableOpacity>
        </View>

        <View className="gap-3">
          {capsules.map((capsule) => (
            <CapsuleCard key={capsule.id} capsule={capsule} onReveal={handleRevealCapsule} />
          ))}
        </View>
      </ScrollView>

      {/* Modals */}
      <MemoryLightbox
        memory={selectedMemory}
        visible={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />
      <MemoryFormSheet
        visible={memoryFormVisible}
        onClose={() => setMemoryFormVisible(false)}
        onSave={handleSaveMemory}
      />
      <CapsuleFormSheet
        visible={capsuleFormVisible}
        onClose={() => setCapsuleFormVisible(false)}
        onSave={handleSaveCapsule}
      />
    </View>
  );
}
