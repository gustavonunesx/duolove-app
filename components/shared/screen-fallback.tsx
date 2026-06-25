import { View } from 'react-native';
import { Skeleton } from '../ui/skeleton';

/**
 * Fallback exibido enquanto uma tela com carregamento preguiçoso (React.lazy)
 * resolve seu chunk. Mantém o fundo escuro e um esqueleto leve para evitar
 * "flash" branco e jank na primeira montagem da rota.
 */
export function ScreenFallback() {
  return (
    <View className="flex-1 bg-surface px-5 pt-14" accessibilityLabel="Carregando">
      <Skeleton height={28} width="50%" rounded="lg" />
      <View className="mt-6 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={72} rounded="lg" />
        ))}
      </View>
    </View>
  );
}
