# DuoLove App — Plano de Execução

> Estratégia: **interface primeiro, backend depois**.
> Cada milestone é uma branch isolada, com entregas verificáveis e um commit final de fechamento.

---

## Visão Geral

| # | Branch | Foco | Tipo |
|---|---|---|---|
| M1 | `setup/foundation` | Scaffold Expo, design system, roteamento | Setup |
| M2 | `feat/auth-ui` | Telas de auth e onboarding (mock) | Frontend |
| M3 | `feat/dashboard-ui` | Dashboard, counter, shell do app | Frontend |
| M4 | `feat/calendar-ui` | Calendário completo (mock data) | Frontend |
| M5 | `feat/chat-ui` | Chat e reações (mock) | Frontend |
| M6 | `feat/memories-ui` | Timeline de memórias e upload UI | Frontend |
| M7 | `feat/backend-foundation` | Supabase, Prisma schema, auth real | Backend |
| M8 | `feat/backend-calendar` | API de eventos + Realtime sync | Backend |
| M9 | `feat/backend-social` | Chat, memórias e upload real | Backend |
| M10 | `feat/notifications` | Push notifications (Expo) + email (Resend) | Backend |
| M11 | `feat/premium-stripe` | Planos, Stripe, gating de features | Backend |
| M12 | `feat/polish` | Animações, acessibilidade, performance | Frontend |
| M13 | `chore/deploy` | Expo EAS Build + submissão às stores | Infra |

---

## M1 — Setup & Design System ✅ CONCLUÍDA

**Branch:** `setup/foundation` (commitado direto em `master`)
**Objetivo:** Projeto Expo configurado com toda a base visual do DuoLove. Nenhuma funcionalidade real — só estrutura e tokens de design.

### Entregas

- [x] Inicializar projeto com `create-expo-app` (TypeScript, blank template)
- [x] Instalar e configurar Expo Router
- [x] Instalar e configurar NativeWind v4 + Tailwind
- [x] Configurar `tailwind.config.js` com paleta DuoLove (rosa, lilás, vinho, creme, preto fosco)
- [x] Configurar `babel.config.js` com NativeWind + Reanimated
- [x] Configurar `metro.config.js` com NativeWind
- [x] Criar `global.css` (entrada do Tailwind)
- [x] Configurar `app.json` (nome DuoLove, dark mode, splash, bundleId)
- [x] Criar estrutura de pastas (`app/`, `components/`, `lib/`, `hooks/`, `types/`)
- [x] Root layout (`app/_layout.tsx`) com StatusBar dark
- [x] Roteamento base: `(auth)/` e `(app)/` com tab navigator placeholder
- [x] Telas placeholder para todas as rotas principais
- [x] `nativewind-env.d.ts` para tipos do NativeWind
- [x] `.env.example` com variáveis necessárias
- [x] `CLAUDE.md` com briefing do projeto
- [x] `docs/PRD.md` e `docs/PLAN.md`

**Commit final:**
```
feat(setup): initialize Expo project with NativeWind and Expo Router
```

---

## M2 — Auth UI & Onboarding ✅ CONCLUÍDA

**Branch:** `feat/auth-ui`
**Objetivo:** Todas as telas de autenticação e onboarding com UI completa e navegação funcional. Sem auth real — formulários com mock/redirect.

### Entregas

- [x] Layout compartilhado de auth (`app/(auth)/_layout.tsx`) com gradiente de fundo e logo
- [x] Tela de login (`app/(auth)/login.tsx`):
  - [x] Campo email + senha
  - [x] Botão "Entrar com Google"
  - [x] Botão "Entrar com Apple"
  - [x] Link para cadastro e recuperação de senha
  - [x] Estados de loading e erro
- [x] Tela de cadastro (`app/(auth)/signup.tsx`):
  - [x] Nome, email, senha
  - [x] Validação com `react-hook-form` + Zod
  - [x] Estados de loading e erro
- [x] Tela de recuperação de senha (`app/(auth)/forgot-password.tsx`)
- [x] Tela de convite do parceiro(a) (`app/(auth)/invite.tsx`):
  - [x] Input para código ou link de convite
  - [x] Preview do perfil de quem convidou (mock)
- [x] Onboarding multi-step (`app/onboarding/`):
  - [x] Layout com barra de progresso animada
  - [x] Step 1 (`step-1.tsx`): nome e foto de perfil (câmera ou galeria — UI only)
  - [x] Step 2 (`step-2.tsx`): data de início do relacionamento (date picker nativo)
  - [x] Step 3 (`step-3.tsx`): escolha de tema visual (rosa, lilás, vinho) com preview
  - [x] Step 4 (`step-4.tsx`): envio de convite ao parceiro(a) (share link mock)
  - [x] Animação de progresso entre steps com Reanimated
- [x] Componentes de UI base:
  - [x] `components/ui/button.tsx` (variantes: primary, outline, ghost, social)
  - [x] `components/ui/input.tsx` (com label, erro, ícone)
  - [x] `components/ui/glass-card.tsx`
  - [x] `components/shared/logo.tsx`
- [x] Redirect final do onboarding para `/(app)/dashboard`

**Commit final:**
```
feat(auth): add auth screens and multi-step onboarding UI
```

---

## M3 — App Shell & Dashboard UI ✅ CONCLUÍDA

**Branch:** `feat/dashboard-ui`
**Objetivo:** Shell autenticado do app com tab bar e dashboard completo usando dados mockados.

### Entregas

- [x] Tab bar (`app/(app)/_layout.tsx`) com ícones e identidade visual:
  - [x] 5 abas: Início, Calendário, Chat, Memórias, Configurações
  - [x] Ícones via `@expo/vector-icons` (Feather ou Ionicons)
  - [x] Tab bar com fundo `#1A1A2E` e tint rosa
  - [x] Badge de notificação na aba Chat
- [x] Header do app com avatar do usuário + avatar do parceiro(a) (mock)
- [x] Dashboard (`app/(app)/dashboard.tsx`):
  - [x] Card "Contador de dias juntos" com número animado (Reanimated)
  - [x] Card "Próximos eventos" (3 eventos mock com data e cor)
  - [x] Card "Datas comemorativas" (aniversários mock)
  - [x] Card "Status do parceiro(a)" (online/offline mock)
  - [x] Card "Última memória" com foto placeholder
  - [x] Scroll vertical com `ScrollView` ou `FlatList`
- [x] Estados vazios com copy afetivo ("Vocês ainda não têm eventos juntos 💭")
- [x] Skeleton loading para todos os cards (`components/ui/skeleton.tsx`)
- [x] Tela de configurações básica (`app/(app)/settings.tsx`):
  - [x] Avatar e nome do usuário
  - [x] Seção "Meu casal" (mock)
  - [x] Botão de logout (mock)

**Commit final:**
```
feat(dashboard): add app shell with tab bar and dashboard mock UI
```

---

## M4 — Calendário UI ✅ CONCLUÍDA

**Branch:** `feat/calendar-ui`
**Objetivo:** Calendário completo e interativo com dados mockados.

### Entregas

- [x] Página de calendário (`app/(app)/calendar.tsx`)
- [x] Visualização mensal: grid de dias com pontos de evento coloridos
- [x] Visualização semanal: lista de eventos por dia da semana
- [x] Visualização diária: lista de eventos do dia com horários
- [x] Toggle entre views (segmented control nativo ou tabs)
- [x] Navegação por mês/semana (swipe ou botões anterior/próximo)
- [x] Bottom sheet de criação de evento:
  - [x] Título, descrição, data/hora início e fim
  - [x] Tipo: pessoal, casal, data especial, viagem
  - [x] Cor personalizável (6 opções)
  - [x] Visibilidade: privado ou compartilhado
- [x] Bottom sheet de visualização de evento com detalhes e avatar do criador
- [x] Indicador visual de quem criou o evento (avatar no grid)
- [x] Legenda de cores por tipo
- [x] Filtro por tipo (todos / só do casal / só meus)
- [x] Highlight do dia atual e de datas especiais
- [x] Componente `components/calendar/event-card.tsx`
- [x] Componente `components/calendar/day-cell.tsx`

**Commit final:**
```
feat(calendar): add full calendar UI with mock events and all views
```

---

## M5 — Chat UI ✅ CONCLUÍDA

**Branch:** `feat/chat-ui`
**Objetivo:** Interface de chat com UI completa e dados mock.

### Entregas

- [x] Página de chat (`app/(app)/chat.tsx`)
- [x] Lista de conversas: chat geral do casal + por evento
- [x] Janela de mensagens com bolhas estilizadas:
  - [x] Diferenciação visual: próprias (direita, rosa) vs. parceiro(a) (esquerda, card)
  - [x] Timestamps nas mensagens
  - [x] Indicador de leitura (lido/entregue com ícone)
- [x] Input de mensagem com botão de envio e emoji picker
- [x] Reações com emojis (long press abre picker de reação)
- [x] Indicador "digitando..." (mock com animação de bolinha)
- [x] Scroll automático para mensagem mais recente
- [x] Aba de comentários dentro de evento (integrada ao bottom sheet do calendário)
- [x] Estado vazio: "Mandem a primeira mensagem juntos 💌"
- [x] Componentes:
  - [x] `components/chat/message-bubble.tsx`
  - [x] `components/chat/reaction-picker.tsx`
  - [x] `components/chat/message-input.tsx`

**Commit final:**
```
feat(chat): add messaging UI with reactions and event comments
```

---

## M6 — Memórias UI ✅ CONCLUÍDA

**Branch:** `feat/memories-ui`
**Objetivo:** Espaço de memórias do casal — timeline, fotos e cápsula do tempo, tudo no front com mock.

### Entregas

- [x] Página de memórias (`app/(app)/memories.tsx`)
- [x] Timeline cronológica de memórias com fotos (dados mock)
- [x] Card de memória: foto, data, título e descrição curta
- [x] Modal de visualização ampliada (lightbox com `expo-image` ou similar)
- [x] Bottom sheet de criação de memória:
  - [x] Seleção de foto (câmera ou galeria — UI only com `expo-image-picker`)
  - [x] Título, descrição, data
  - [x] Tag de tipo: viagem, date, aniversário, milestone, dia a dia
- [x] Filtro por tipo e por período
- [x] Galeria em grid (modo alternativo à timeline — toggle)
- [x] Seção "Cápsula do Tempo":
  - [x] Form para escrever mensagem e selecionar data de revelação
  - [x] Card de cápsula lacrada com countdown animado
- [x] Estado vazio: "O primeiro capítulo de vocês começa aqui ✨"
- [x] Componentes:
  - [x] `components/memories/memory-card.tsx`
  - [x] `components/memories/memory-lightbox.tsx`
  - [x] `components/memories/capsule-card.tsx`

**Commit final:**
```
feat(memories): add memory timeline, photo gallery and time capsule UI
```

---

## M7 — Backend Foundation ✅ CONCLUÍDA

**Branch:** `feat/backend-foundation`
**Objetivo:** Infraestrutura real de dados. Supabase configurado, schema SQL completo, auth funcionando de ponta a ponta.

> ⚠️ Prisma removido do escopo — não roda em React Native/Expo Go. Substituído por Supabase SDK direto, que é o padrão da indústria para apps mobile com Supabase.

### Entregas

- [x] Criar projeto no Supabase e configurar variáveis de ambiente (`.env`)
- [x] Schema SQL completo em `supabase/schema.sql` (executar no SQL Editor do Supabase):
  - [x] `users` (id, email, name, avatar_url, created_at)
  - [x] `couples` (id, user1_id, user2_id, start_date, theme, plan, created_at)
  - [x] `couple_invites` (id, couple_id, inviter_id, token, expires_at, accepted_at)
  - [x] `events` (id, couple_id, creator_id, title, description, start_at, end_at, type, color, visibility)
  - [x] `memories` (id, couple_id, creator_id, title, description, photo_url, date, tags)
  - [x] `capsules` (id, couple_id, creator_id, message, reveal_at, revealed_at)
  - [x] `messages` (id, couple_id, sender_id, event_id?, content, created_at)
  - [x] `message_reactions` (id, message_id, user_id, emoji)
  - [x] `subscriptions` (id, couple_id, stripe_customer_id, stripe_subscription_id, plan, status)
- [x] Trigger `handle_new_user` — cria perfil em `public.users` ao cadastrar via Supabase Auth
- [x] Row Level Security (RLS) em todas as tabelas + função helper `get_user_couple_id()`
- [x] Índices de performance nas colunas mais consultadas
- [x] Tipos TypeScript completos para o banco em `types/database.ts`
- [x] Cliente Supabase: `lib/supabase/client.ts` com AsyncStorage 1.23.1 para sessão persistida
- [x] Auth store Zustand em `store/auth-store.ts`
- [x] Hook `useAuth` em `hooks/use-auth.ts` (signIn, signUp, resetPassword, signOut, listener de sessão)
- [x] React Query (`QueryClientProvider`) configurado no root layout
- [x] Proteção de rotas no root layout — redirect automático baseado em sessão
- [x] Auth funcionando end-to-end: cadastro, login, logout, sessão persistida, recuperação de senha
- [x] Modal de verificação de email após cadastro
- [x] Mocks de auth substituídos nas telas: login, signup, forgot-password, settings

**Commit final:**
```
feat(backend): add Supabase setup, full schema and working auth
```

---

## M8 — Backend Calendário ✅ CONCLUÍDA

**Branch:** `feat/backend-calendar`
**Objetivo:** Eventos conectados ao banco, sincronização em tempo real via Supabase Realtime, fluxo de invite de casal real.

> Sem API routes — queries via Supabase SDK direto no cliente (padrão da M7).

### Entregas

- [x] `lib/supabase/events.ts` — getEvents, createEvent, updateEvent, deleteEvent
- [x] `lib/supabase/couples.ts` — getUserCouple, createCouple, generateInvite, validateInvite, acceptInvite
- [x] `hooks/use-couple.ts` — React Query para couple_id reativo + ensureCouple + generateInvite
- [x] `hooks/use-events.ts` — React Query + Supabase Realtime no canal `couple:{id}:events`
- [x] Substituir dados mock do calendário por dados reais (`calendar.tsx`)
- [x] Indicador de loading (ActivityIndicator) no header do calendário
- [x] Fluxo de invite de casal real:
  - [x] `invite.tsx` — validar token real via Supabase, aceitar convite e linkar contas
  - [x] `onboarding/step-4.tsx` — gera token real ao entrar no step, mostra código e compartilha
- [x] Tipagem local explícita (EventRow, CoupleRow, InviteRow) — sem generic `Database` no cliente Supabase

**Commit final:**
```
feat(backend): add events API with realtime sync and couple invite flow
```

---

## M9 — Backend Social (Chat & Memórias)

**Branch:** `feat/backend-social`
**Objetivo:** Chat em tempo real e upload de memórias funcionando com dados reais.

### Entregas

- [x] `lib/supabase/messages.ts` — getMessages, sendMessage, getReactions, addReaction, removeReaction
- [x] `hooks/use-messages.ts` — React Query + Supabase Realtime no canal `couple:{id}:messages`
- [x] Substituir mock do chat por dados reais (`chat.tsx`)
- [x] Configurar Supabase Storage bucket `memories` (com RLS por casal) — SQL em `supabase/schema.sql`
- [x] `lib/supabase/memories.ts` — getMemories, createMemory, deleteMemory, uploadMemoryPhoto
- [x] `hooks/use-memories.ts` — React Query
- [x] `lib/supabase/capsules.ts` — getCapsules, createCapsule, revealCapsule
- [x] `hooks/use-capsules.ts` — React Query
- [x] Substituir mocks de memórias e cápsulas pelas chamadas reais (`memories.tsx`)

**Commit final:**
```
feat(backend): add realtime chat, memories upload and time capsule API
```

---

## M10 — Notificações

**Branch:** `feat/notifications`
**Objetivo:** Push notifications nativas via Expo Notifications + emails via Resend.

### Entregas

- [x] Instalar e configurar `expo-notifications` + plugin no `app.json`
- [x] Registrar Expo Push Token e salvar no banco por usuário (`push_tokens` table com RLS)
- [x] `lib/supabase/push-tokens.ts` — upsertPushToken, getUserPushToken, updateNotificationPreferences
- [x] `hooks/use-push-notifications.ts` — solicita permissão, registra token, expõe preferências
- [x] Integração no root layout — PushNotificationRegistrar registra token ao autenticar
- [x] Push notifications via Supabase Edge Function (`supabase/functions/send-notifications/index.ts`):
  - [x] Lembrete de evento (24h antes)
  - [x] Alerta de aniversário (1 semana antes)
  - [x] Cápsula do tempo pronta para revelar
- [x] Tela de preferências de notificação em `settings.tsx` (switches por tipo)
- [x] Schema atualizado: tabela `push_tokens` com RLS e índice

**Commit final:**
```
feat(notifications): add push notifications and email alerts
```

---

## M11 — Premium & Stripe

**Branch:** `feat/premium-stripe`
**Objetivo:** Planos de assinatura, checkout com Stripe e gating de features premium.

### Entregas

- [x] Instalar `@stripe/stripe-react-native` + plugin no `app.json`
- [x] `lib/supabase/subscriptions.ts` — getSubscription, isPremiumActive
- [x] `hooks/use-subscription.ts` — React Query, expõe `isPremium` reativo
- [x] `components/ui/premium-gate.tsx` — bloqueia features com overlay de upgrade
- [x] Edge Functions Supabase:
  - [x] `stripe-checkout` — cria Checkout Session (mensal/anual)
  - [x] `stripe-portal` — abre Customer Portal para gerenciar assinatura
  - [x] `stripe-webhook` — sincroniza status via eventos `checkout.session.completed`, `customer.subscription.updated/deleted`
- [x] `settings.tsx` — modal de upgrade com comparativo de planos, gestão via portal Stripe
- [x] `app/premium-success.tsx` — tela animada de sucesso após checkout

**Commit final:**
```
feat(premium): add Stripe subscription flow and premium feature gating
```

---

## M12 — Polish & Qualidade

**Branch:** `feat/polish`
**Objetivo:** Refinar a experiência. Animações completas, acessibilidade, performance.

### Entregas

- [x] Revisar e completar animações Reanimated em todas as telas
- [x] Microinterações: press feedback com Reanimated em cards, botões e mensagens
- [x] Skeleton loaders consistentes em calendário, chat e memórias
- [x] Estados vazios com copy afetivo em todas as seções
- [x] Acessibilidade: `accessibilityLabel`, `accessibilityRole` em telas principais
- [x] Otimização de imagens com `expo-image` (memory cards e lightbox)
- [x] Haptic feedback nas ações principais (`expo-haptics`) — botões, reações, premium
- [x] Splash screen animada com `expo-splash-screen` (fade-in após hide)
- [x] Transições de tela suaves (animation por Stack: slide nos fluxos, fade no auth, modal no premium-success)
- [x] Teste em múltiplos tamanhos de tela (SE, 15, 15 Pro Max, Pixel 7) — matriz documentada em [docs/TESTING.md](TESTING.md)
- [x] Lazy loading de telas pesadas (`chat.tsx` e `love-languages.tsx` via `React.lazy` + `Suspense` + `ScreenFallback`)
- [x] Ícone final do app e adaptive icon Android (assets 1024×1024 validados, config em `app.json`)
- [x] Auditoria de performance (FlatList do Duo e grid de memórias com `removeClippedSubviews`/janela; `expo-image` nas imagens)

**Commit final:**
```
feat(polish): finalize animations, accessibility and performance
```

---

## M13 — Deploy

**Branch:** `chore/deploy`
**Objetivo:** App publicado na App Store e Google Play via Expo EAS.

### Entregas

- [x] Configurar conta Expo EAS e `eas.json`
- [x] Configurar variáveis de ambiente de produção no EAS
- [x] Build de produção Android: `eas build --platform android`
- [x] Build de produção iOS: `eas build --platform ios`
- [x] Configurar Supabase de produção (projeto separado do dev)
- [x] Rodar migrations em produção (schema.sql via Supabase Dashboard)
- [x] Configurar OAuth Google/Apple com bundle IDs de produção
- [x] Configurar webhook Stripe apontando para produção
- [x] Submissão à Google Play Store: `eas submit --platform android`
- [x] Submissão à Apple App Store: `eas submit --platform ios`
- [x] Smoke test completo em produção:
  - [x] Cadastro + invite de casal
  - [x] Criar e visualizar evento
  - [x] Chat em tempo real
  - [x] Upload de memória
  - [x] Checkout premium
  - [x] Push notification recebida
- [x] Configurar OTA updates com `expo-updates`
- [x] Checklist de segurança: RLS ativo, service role key não exposta

**Commit final:**
```
chore(deploy): configure EAS build and submit to App Store and Google Play
```

---

## M14 — Novas Features (IA, Quiz, Produtos, Drawer)

**Branch:** `feat/m14-new-features`
**Objetivo:** Expandir o produto com IA conselheira ("Duo"), quiz de linguagens do amor, produtos com afiliados e redesign de navegação (tab bar → drawer lateral).

### Decisões já tomadas
- Nome da IA: **Duo**
- Duo incluída no **plano Premium atual (R$19,90)** — sem novo tier
- Rate limit: **50 mensagens/mês** por casal
- Modelo: `gpt-4o-mini` via OpenAI API (trocado de Claude Haiku para aproveitar créditos existentes)
- Chat do casal **removido** — substituído pelo chat com Duo
- Navegação: bottom tab bar mantida no Expo Go (7 abas); `DrawerContent` criado mas aguarda EAS Build para ativar
- Produtos: acessível para free e premium (fonte de receita de afiliados)
- Quiz de linguagens do amor: **Premium only**
- Premium check: lê tabela `subscriptions` (não `couples.plan`) — para testar sem Stripe usar SQL abaixo

### Para testar Premium localmente (SQL Editor do Supabase)
```sql
-- Setar seu usuário como premium para testar Duo e Quiz
insert into public.subscriptions (couple_id, plan, status)
values (
  (select id from public.couples
   where user1_id = (select id from public.users where email = 'SEU_EMAIL_AQUI')),
  'premium',
  'active'
)
on conflict (couple_id) do update set plan = 'premium', status = 'active';
```

### Entregas

#### Navegação — Drawer Lateral
- [x] Instalar `@react-navigation/drawer`
- [x] Criar `components/shared/drawer-content.tsx` (avatar, nome do casal, menu com ícones, badge Premium)
- [x] `app/(app)/_layout.tsx` usa Tabs no Expo Go (7 abas: Início, Calendário, Duo, Memórias, Produtos, Amor, Config)
- [ ] Ativar Drawer substituindo Tabs após próximo EAS Build (código já pronto em `drawer-content.tsx`) — ⏸️ **bloqueado por design**: Drawer usa Reanimated nativo e só roda em EAS Build, não no Expo Go. Item de ativação fica para o próximo build EAS.

#### Duo — AI Chat
- [x] Adicionar tabelas ao `supabase/schema.sql`: `ai_messages`, `ai_usage` (com RLS)
- [x] Criar `supabase/functions/ai-chat/index.ts` (Edge Function → Claude API)
  - Auth + verificação Premium + rate limit
  - System prompt com contexto do casal (start_date, 3 próximos eventos, tema)
  - Janela deslizante: últimas 15 mensagens no contexto
  - Max 400 tokens de resposta
  - Persistir msgs + incrementar contador mensal
- [x] Criar `lib/supabase/ai-chat.ts` (`getAiMessages`, `sendAiMessage`)
- [x] Criar `hooks/use-ai-chat.ts` (React Query + contador de msgs restantes)
- [x] Reescrever `app/(app)/chat.tsx`: UI do Duo (bolhas diferenciadas, avatar "D", contador mensal)
  - Free: PremiumGate cobrindo a tela
  - Limite atingido: banner com data de renovação

#### Quiz — 5 Linguagens do Amor
- [x] Adicionar tabela `love_language_results` ao `supabase/schema.sql` (com RLS)
- [x] Criar `lib/supabase/love-languages.ts` (`getLoveLanguageResult`, `saveLoveLanguageResult`)
- [x] Criar `hooks/use-love-languages.ts` (React Query)
- [x] Criar `app/(app)/love-languages.tsx`:
  - Tela intro: explicação das 5 linguagens + botão "Começar"
  - 15 perguntas de escolha forçada (A ou B), uma por vez com animação de slide
  - Barra de progresso (1/15 → 15/15)
  - Tela de resultado: linguagem primária + secundária, barra de scores, dicas práticas
  - Se parceiro já fez: seção "Como vocês se complementam"
  - Free: PremiumGate cobrindo a tela inteira

#### Produtos Sugeridos (Afiliados)
- [x] Adicionar tabela `products` ao `supabase/schema.sql` (leitura pública, gerenciada via Supabase Dashboard)
- [x] Criar `lib/supabase/products.ts` (`getProducts`, `getProductsForOccasion`)
- [x] Criar `hooks/use-products.ts` (React Query com filtro por evento próximo ≤ 30 dias)
- [x] Criar `app/(app)/products.tsx`:
  - Banner de data importante próxima (se houver evento em ≤ 30 dias)
  - Seção "Perfeito para {evento}" + "Para qualquer momento"
  - Cards: imagem, nome, faixa de preço, botão "Ver produto" (`Linking.openURL`)
  - Acessível para free e premium

### Schema SQL — 4 novas tabelas

```sql
-- ai_messages
create table public.ai_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now() not null
);
alter table public.ai_messages enable row level security;
create policy "ai_messages: select own" on public.ai_messages
  for select using (user_id = auth.uid());
create policy "ai_messages: insert own" on public.ai_messages
  for insert with check (user_id = auth.uid() and couple_id = get_user_couple_id());

-- ai_usage (rate limit mensal)
create table public.ai_usage (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  month text not null,
  message_count integer default 0,
  unique (couple_id, month)
);
alter table public.ai_usage enable row level security;
create policy "ai_usage: select own" on public.ai_usage
  for select using (couple_id = get_user_couple_id());

-- love_language_results
create table public.love_language_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  couple_id uuid references public.couples(id) on delete cascade not null,
  primary_language text not null,
  secondary_language text,
  scores jsonb not null,
  created_at timestamptz default now() not null,
  unique (user_id)
);
alter table public.love_language_results enable row level security;
create policy "love_languages: select couple" on public.love_language_results
  for select using (couple_id = get_user_couple_id());
create policy "love_languages: insert own" on public.love_language_results
  for insert with check (user_id = auth.uid());
create policy "love_languages: update own" on public.love_language_results
  for update using (user_id = auth.uid());

-- products (afiliados — gerenciado via Supabase Dashboard)
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  affiliate_url text not null,
  price_range text,
  category text,
  occasion text[],
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.products enable row level security;
create policy "products: select all" on public.products
  for select using (is_active = true);
```

### Quiz — 15 perguntas (referência de implementação)

Cada pergunta tem 2 opções rotuladas com a linguagem correspondente:
`words` | `quality` | `acts` | `gifts` | `touch`

| # | Opção A | Linguagem A | Opção B | Linguagem B |
|---|---|---|---|---|
| 1 | Me diz que me ama e me elogia | words | Me ajuda em tarefas sem eu pedir | acts |
| 2 | Passamos tempo juntos sem distração | quality | Me abraça e fica pertinho | touch |
| 3 | Receber um presente pensado | gifts | Ouvir "estou orgulhoso(a) de você" | words |
| 4 | Fica no celular enquanto estamos juntos (negativo) | quality | Não recebe minha ajuda quando precisa (negativo) | acts |
| 5 | Um abraço longo sem motivo | touch | Um bilhetinho ou mensagem carinhosa | words |
| 6 | Lembra de data especial com algo simbólico | gifts | Reserva tempo só pra nós | quality |
| 7 | Resolve algo que me preocupava | acts | Me dá um beijo ou abraço de surpresa | touch |
| 8 | Palavras de encorajamento nos momentos difíceis | words | Um presente que mostra que pensou em mim | gifts |
| 9 | Fazemos algo juntos com atenção total | quality | Há muito contato físico entre nós | touch |
| 10 | Me surpreende com algo especial | gifts | Cuida de algo pra mim sem ser pedido | acts |
| 11 | Me fala o quanto me ama na frente de outros | words | Me dá atenção total numa conversa | quality |
| 12 | Um abraço quando estou estressado(a) | touch | Fez algo pra me facilitar a vida | acts |
| 13 | Uma lembrança sem ocasião especial | gifts | Sentar e conversar por horas | quality |
| 14 | Recebo mensagens de carinho ao longo do dia | words | Há muito toque e carinho físico | touch |
| 15 | Cuida de algo que eu precisava resolver | acts | Me traz algo que sabe que eu gosto | gifts |

**Contagem:** soma de respostas por chave. Maior = linguagem primária. Segundo maior = secundária.

### Commit final
```
feat(m14): add Duo AI chat, love languages quiz, affiliate products and drawer navigation
```

---

## Sequência

```
M1 Setup ──► M2 Auth UI ──► M3 Dashboard UI ──► M4 Calendário UI ──► M5 Chat UI
                                                                           │
                                                                           ▼
M7 Backend Base ◄── M6 Memórias UI ◄────────────────────────────────────────
     │
     ▼
M8 Backend Calendar ──► M9 Backend Social ──► M10 Notificações ──► M11 Premium
                                                                        │
                                                                        ▼
                                                            M12 Polish ──► M13 Deploy ──► M14 Novas Features
```

---

## Regras de Branch

- `master` — produção, protegida. Só recebe merge via PR após cada milestone completa.
- Cada milestone vive na sua própria branch.
- Commits no padrão Conventional Commits: `type(scope): description`
