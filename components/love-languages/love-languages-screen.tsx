import { useRef, useState } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PremiumGateScreen } from '../ui/premium-gate';
import { AppMenuButton } from '../shared/app-menu';
import { useSubscription } from '../../hooks/use-subscription';
import { useLoveLanguages } from '../../hooks/use-love-languages';

type Language = 'words' | 'quality' | 'acts' | 'gifts' | 'touch';

type Question = {
  optionA: string;
  langA: Language;
  optionB: string;
  langB: Language;
};

const QUESTIONS: Question[] = [
  { optionA: 'Me diz que me ama e me elogia', langA: 'words', optionB: 'Me ajuda em tarefas sem eu pedir', langB: 'acts' },
  { optionA: 'Passamos tempo juntos sem distração', langA: 'quality', optionB: 'Me abraça e fica pertinho', langB: 'touch' },
  { optionA: 'Receber um presente pensado', langA: 'gifts', optionB: 'Ouvir "estou orgulhoso(a) de você"', langB: 'words' },
  { optionA: 'Fica no celular enquanto estamos juntos', langA: 'quality', optionB: 'Não recebe minha ajuda quando preciso', langB: 'acts' },
  { optionA: 'Um abraço longo sem motivo', langA: 'touch', optionB: 'Um bilhetinho ou mensagem carinhosa', langB: 'words' },
  { optionA: 'Lembra de data especial com algo simbólico', langA: 'gifts', optionB: 'Reserva tempo só pra nós', langB: 'quality' },
  { optionA: 'Resolve algo que me preocupava', langA: 'acts', optionB: 'Me dá um beijo ou abraço de surpresa', langB: 'touch' },
  { optionA: 'Palavras de encorajamento nos momentos difíceis', langA: 'words', optionB: 'Um presente que mostra que pensou em mim', langB: 'gifts' },
  { optionA: 'Fazemos algo juntos com atenção total', langA: 'quality', optionB: 'Há muito contato físico entre nós', langB: 'touch' },
  { optionA: 'Me surpreende com algo especial', langA: 'gifts', optionB: 'Cuida de algo pra mim sem ser pedido', langB: 'acts' },
  { optionA: 'Me fala o quanto me ama na frente de outros', langA: 'words', optionB: 'Me dá atenção total numa conversa', langB: 'quality' },
  { optionA: 'Um abraço quando estou estressado(a)', langA: 'touch', optionB: 'Fez algo pra me facilitar a vida', langB: 'acts' },
  { optionA: 'Uma lembrança sem ocasião especial', langA: 'gifts', optionB: 'Sentar e conversar por horas', langB: 'quality' },
  { optionA: 'Recebo mensagens de carinho ao longo do dia', langA: 'words', optionB: 'Há muito toque e carinho físico', langB: 'touch' },
  { optionA: 'Cuida de algo que eu precisava resolver', langA: 'acts', optionB: 'Me traz algo que sabe que eu gosto', langB: 'gifts' },
];

const LANGUAGE_LABELS: Record<Language, string> = {
  words: 'Palavras de Afirmação',
  quality: 'Tempo de Qualidade',
  acts: 'Atos de Serviço',
  gifts: 'Presentes',
  touch: 'Toque Físico',
};

const LANGUAGE_ICONS: Record<Language, React.ComponentProps<typeof Feather>['name']> = {
  words: 'message-square',
  quality: 'clock',
  acts: 'tool',
  gifts: 'gift',
  touch: 'heart',
};

const LANGUAGE_DESCRIPTIONS: Record<Language, string> = {
  words: 'Você se sente amado(a) através de elogios, incentivos e "eu te amo".',
  quality: 'Tempo dedicado exclusivamente a vocês, com presença total.',
  acts: 'Ações que facilitam sua vida mostram amor na prática.',
  gifts: 'Presentes simbólicos representam atenção e cuidado.',
  touch: 'Abraços, beijos e carinho físico são sua linguagem principal.',
};

type Phase = 'intro' | 'quiz' | 'result';

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <View className="absolute top-12 left-4 z-10">
        <AppMenuButton />
      </View>
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary items-center justify-center mb-4">
          <Feather name="heart" size={36} color="#E91E8C" />
        </View>
        <Text className="text-text-primary text-2xl font-bold text-center">5 Linguagens do Amor</Text>
        <Text className="text-text-muted text-sm text-center mt-2 leading-5">
          Descubra como você e seu parceiro(a) expressam e recebem amor
        </Text>
      </View>

      <View className="gap-4 mb-8">
        {(['words', 'quality', 'acts', 'gifts', 'touch'] as Language[]).map((lang) => (
          <View key={lang} className="flex-row items-center gap-3 bg-card border border-white/10 rounded-2xl p-4">
            <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
              <Feather name={LANGUAGE_ICONS[lang]} size={18} color="#E91E8C" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-sm font-semibold">{LANGUAGE_LABELS[lang]}</Text>
              <Text className="text-text-muted text-xs mt-0.5 leading-4">{LANGUAGE_DESCRIPTIONS[lang]}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={onStart}
        activeOpacity={0.85}
        className="bg-primary rounded-2xl py-4 items-center mb-4"
      >
        <Text className="text-white font-bold text-base">Começar o Quiz</Text>
      </TouchableOpacity>
      <Text className="text-text-muted text-xs text-center">15 perguntas · ~3 minutos</Text>
    </ScrollView>
  );
}

function QuizScreen({ onComplete }: { onComplete: (scores: Record<Language, number>) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<Language, number>>({ words: 0, quality: 0, acts: 0, gifts: 0, touch: 0 });
  const slideAnim = useRef(new Animated.Value(0)).current;

  const progress = (currentIndex / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentIndex];

  function handleAnswer(lang: Language) {
    const newScores = { ...scores, [lang]: scores[lang] + 1 };
    setScores(newScores);

    if (currentIndex + 1 >= QUESTIONS.length) {
      onComplete(newScores);
      return;
    }

    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    setCurrentIndex((i) => i + 1);
  }

  return (
    <View className="flex-1 bg-surface px-5 pt-14">
      {/* Progress bar */}
      <View className="mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-text-muted text-xs">{currentIndex + 1} / {QUESTIONS.length}</Text>
          <Text className="text-text-muted text-xs">{Math.round(progress)}%</Text>
        </View>
        <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </View>
      </View>

      <Animated.View style={{ transform: [{ translateX: slideAnim }] }} className="flex-1">
        <View className="flex-1 justify-center gap-6">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest text-center">
            Pergunta {currentIndex + 1}
          </Text>
          <Text className="text-text-primary text-lg font-semibold text-center leading-7">
            O que te faz sentir mais amado(a)?
          </Text>

          <TouchableOpacity
            onPress={() => handleAnswer(question.langA)}
            activeOpacity={0.8}
            className="bg-card border border-white/10 rounded-2xl p-5"
          >
            <Text className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">A</Text>
            <Text className="text-text-primary text-base leading-6">{question.optionA}</Text>
          </TouchableOpacity>

          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
              <Text className="text-text-muted text-xs font-bold">ou</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleAnswer(question.langB)}
            activeOpacity={0.8}
            className="bg-card border border-white/10 rounded-2xl p-5"
          >
            <Text className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">B</Text>
            <Text className="text-text-primary text-base leading-6">{question.optionB}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

function ResultScreen({
  scores,
  partnerResult,
  onRetake,
}: {
  scores: Record<Language, number>;
  partnerResult: { primary_language: string; secondary_language: string | null } | null;
  onRetake: () => void;
}) {
  const sorted = (Object.entries(scores) as [Language, number][]).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][0];
  const maxScore = QUESTIONS.length;

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary items-center justify-center mb-4">
          <Feather name={LANGUAGE_ICONS[primary]} size={36} color="#E91E8C" />
        </View>
        <Text className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Sua linguagem principal</Text>
        <Text className="text-text-primary text-2xl font-bold text-center">{LANGUAGE_LABELS[primary]}</Text>
        <Text className="text-text-muted text-sm text-center mt-2 leading-5 px-4">{LANGUAGE_DESCRIPTIONS[primary]}</Text>
      </View>

      {/* Score bars */}
      <View className="bg-card border border-white/10 rounded-2xl p-4 gap-3 mb-6">
        <Text className="text-text-primary text-sm font-semibold mb-1">Sua pontuação</Text>
        {sorted.map(([lang, score]) => (
          <View key={lang} className="gap-1">
            <View className="flex-row justify-between">
              <Text className="text-text-muted text-xs">{LANGUAGE_LABELS[lang]}</Text>
              <Text className="text-text-muted text-xs">{score}</Text>
            </View>
            <View className="h-2 bg-white/10 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${lang === primary ? 'bg-primary' : 'bg-secondary/60'}`}
                style={{ width: `${(score / maxScore) * 100}%` }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Secondary language */}
      <View className="bg-card border border-white/10 rounded-2xl p-4 flex-row items-center gap-3 mb-6">
        <View className="w-10 h-10 rounded-xl bg-secondary/20 items-center justify-center">
          <Feather name={LANGUAGE_ICONS[secondary]} size={18} color="#9B59B6" />
        </View>
        <View className="flex-1">
          <Text className="text-text-muted text-xs">Linguagem secundária</Text>
          <Text className="text-text-primary text-sm font-semibold">{LANGUAGE_LABELS[secondary]}</Text>
        </View>
      </View>

      {/* Partner comparison */}
      {partnerResult && (
        <View className="bg-card border border-white/10 rounded-2xl p-4 mb-6">
          <Text className="text-text-primary text-sm font-semibold mb-3">Como vocês se complementam</Text>
          <View className="flex-row gap-4">
            <View className="flex-1 items-center gap-2">
              <Text className="text-text-muted text-xs">Você</Text>
              <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
                <Feather name={LANGUAGE_ICONS[primary]} size={18} color="#E91E8C" />
              </View>
              <Text className="text-text-primary text-xs text-center">{LANGUAGE_LABELS[primary]}</Text>
            </View>
            <View className="items-center justify-center">
              <Feather name="heart" size={20} color="#8B0051" />
            </View>
            <View className="flex-1 items-center gap-2">
              <Text className="text-text-muted text-xs">Parceiro(a)</Text>
              <View className="w-10 h-10 rounded-xl bg-secondary/20 items-center justify-center">
                <Feather name={LANGUAGE_ICONS[partnerResult.primary_language as Language] ?? 'heart'} size={18} color="#9B59B6" />
              </View>
              <Text className="text-text-primary text-xs text-center">{LANGUAGE_LABELS[partnerResult.primary_language as Language] ?? partnerResult.primary_language}</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={onRetake}
        activeOpacity={0.7}
        className="border border-white/10 rounded-2xl py-3 items-center"
      >
        <Text className="text-text-muted text-sm">Refazer o quiz</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function LoveLanguagesScreen() {
  const { isPremium } = useSubscription();
  const { myResult, partnerResult, saveResult } = useLoveLanguages();
  const [phase, setPhase] = useState<Phase>(myResult ? 'result' : 'intro');
  const [scores, setScores] = useState<Record<Language, number> | null>(myResult?.scores as any ?? null);

  async function handleComplete(finalScores: Record<Language, number>) {
    const sorted = (Object.entries(finalScores) as [Language, number][]).sort((a, b) => b[1] - a[1]);
    await saveResult({
      primary_language: sorted[0][0],
      secondary_language: sorted[1][0],
      scores: finalScores,
    });
    setScores(finalScores);
    setPhase('result');
  }

  if (!isPremium) {
    return (
      <PremiumGateScreen
        title="Linguagens do Amor"
        description="Descubra como você e seu parceiro(a) expressam amor. Disponível no plano Premium."
      />
    );
  }

  if (phase === 'intro') return <IntroScreen onStart={() => setPhase('quiz')} />;
  if (phase === 'quiz') return <QuizScreen onComplete={handleComplete} />;
  if (phase === 'result' && scores) {
    return (
      <ResultScreen
        scores={scores}
        partnerResult={partnerResult}
        onRetake={() => setPhase('quiz')}
      />
    );
  }

  return <IntroScreen onStart={() => setPhase('quiz')} />;
}
