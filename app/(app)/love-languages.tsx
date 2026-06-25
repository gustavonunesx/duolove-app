import { lazy, Suspense } from 'react';
import { ScreenFallback } from '../../components/shared/screen-fallback';

// Carregamento preguiçoso: o quiz (15 perguntas + telas de resultado) só é
// baixado quando o usuário abre a aba, aliviando o bundle inicial.
const LoveLanguagesScreen = lazy(() =>
  import('../../components/love-languages/love-languages-screen').then((m) => ({
    default: m.LoveLanguagesScreen,
  }))
);

export default function LoveLanguagesRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <LoveLanguagesScreen />
    </Suspense>
  );
}
