# DuoLove — Matriz de Teste de UI (Responsividade & Performance)

Checklist reproduzível para validar o app em múltiplos tamanhos de tela e
auditar performance antes de cada release. Roda no Expo Go (dev) e em builds
EAS (produção).

> Como rodar: `npm start` e abrir o Expo Go no dispositivo/simulador alvo.
> No iOS Simulator (Xcode) e Android Emulator (Android Studio) é possível
> trocar o device sem rebuild.

---

## Dispositivos-alvo

| Plataforma | Device | Resolução (pt/dp) | Por que testar |
|---|---|---|---|
| iOS | iPhone SE (3ª gen) | 375 × 667 | Menor tela suportada — risco de overflow/corte |
| iOS | iPhone 15 | 393 × 852 | Tamanho mediano mais comum |
| iOS | iPhone 15 Pro Max | 430 × 932 | Maior tela — risco de espaçamento esticado |
| Android | Pixel 7 | 412 × 915 | Densidade alta, gestos de borda |
| Android | Pixel 4a (ou similar) | 393 × 851 | Tela menor + barra de navegação por botões |

Notch / Dynamic Island: validar que o `pt-14` dos headers não colide com a
status bar em devices com entalhe.

---

## Checklist por tela

Para **cada device** acima, verificar:

### Auth & Onboarding
- [ ] Login: campos, botões sociais e links não estouram a largura
- [ ] Signup: teclado não cobre o botão de submit (KeyboardAvoiding)
- [ ] Onboarding steps 1–4: barra de progresso e botões "Próximo" visíveis sem scroll forçado
- [ ] Transição entre telas suave (fade no auth, slide nos steps)

### App Shell
- [ ] Tab bar com 7 abas: ícones e labels não se sobrepõem nas telas estreitas (SE / Pixel 4a)
- [ ] Header (`pt-14`) respeita a safe area em devices com notch/Dynamic Island

### Dashboard
- [ ] Cards (contador, próximos eventos, status) mantêm proporção
- [ ] Contador de dias animado não trava no primeiro render

### Calendário
- [ ] Grid mensal: 7 colunas alinhadas, células quadradas em todas as larguras
- [ ] Toggle Mês/Semana/Dia legível na tela menor
- [ ] Bottom sheet de criação não ultrapassa o topo nem fica cortado embaixo

### Duo (chat IA)
- [ ] Bolhas com `maxWidth: 78%` corretas nas telas larga e estreita
- [ ] Input fixo no rodapé não é coberto pelo teclado
- [ ] Skeleton de carregamento e fallback de lazy load aparecem sem flash branco

### Memórias
- [ ] Timeline: linha vertical conecta os cards sem desalinhar
- [ ] Grade (2 colunas): cards de tamanho igual, gap consistente
- [ ] Lightbox abre ocupando a tela inteira em qualquer device

### Produtos / Linguagens do Amor / Configurações
- [ ] Produtos: cards e banner de ocasião responsivos
- [ ] Quiz: opções A/B não estouram em telas pequenas; barra de progresso visível
- [ ] Settings: switches de notificação e modal de upgrade legíveis

---

## Auditoria de performance

Rodar com o **Performance Monitor** do Expo (sacudir o device → "Show Perf Monitor")
ou Flipper / React DevTools Profiler.

- [ ] **Scroll do calendário**: sem queda abaixo de ~58 FPS ao navegar entre meses
- [ ] **Timeline de memórias**: scroll fluido com ≥ 30 memórias (`removeClippedSubviews` ativo)
- [ ] **Chat do Duo**: scroll fluido com ≥ 50 mensagens (FlatList com `windowSize`/`maxToRenderPerBatch`)
- [ ] **Lazy load**: abrir abas Duo e Linguagens do Amor mostra o `ScreenFallback` brevemente, sem travar a UI
- [ ] **Sem warnings** de "VirtualizedLists should never be nested" no console (grid usa `scrollEnabled={false}`, é esperado)
- [ ] Memória estável após navegar por todas as abas várias vezes (sem leak visível)

---

## Otimizações já aplicadas (M12)

- Transições de tela: `animation` configurado nos Stacks (root, auth, onboarding) + `premium-success` como modal slide-from-bottom.
- Lazy loading: `chat.tsx` e `love-languages.tsx` usam `React.lazy` + `Suspense` com `ScreenFallback`.
- Listas: `FlatList` do Duo e do grid de memórias com `removeClippedSubviews`, `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`.
- Imagens: `expo-image` nos memory cards, lightbox e produtos.
- Ícones validados: `icon.png` e `adaptive-icon.png` em 1024×1024.
