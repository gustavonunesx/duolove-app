import { lazy, Suspense } from 'react';
import { ScreenFallback } from '../../components/shared/screen-fallback';

// Carregamento preguiçoso: a tela do Duo (chat IA com FlatList, hooks de
// uso/rate-limit) só é baixada ao abrir a aba, reduzindo o bundle inicial.
const DuoChatScreen = lazy(() =>
  import('../../components/chat/duo-chat-screen').then((m) => ({
    default: m.DuoChatScreen,
  }))
);

export default function ChatRoute() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <DuoChatScreen />
    </Suspense>
  );
}
