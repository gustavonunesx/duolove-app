# DuoLove App — Briefing para Claude

## O que é o DuoLove

App móvel de calendário compartilhado para casais. Combina agendamento, comunicação e conexão emocional numa plataforma única. Publicado na App Store e Google Play.

Site de marketing (separado): repositório `duolove-web` (Next.js).

PRD completo: [docs/PRD.md](docs/PRD.md)
Plano de milestones: [docs/PLAN.md](docs/PLAN.md)
Matriz de teste de UI/performance: [docs/TESTING.md](docs/TESTING.md)

---

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo (SDK 54) + Expo Router |
| Linguagem | TypeScript |
| Estilização | NativeWind v4 (Tailwind para React Native) |
| Animações | React Native Reanimated |
| Banco de Dados | PostgreSQL via Supabase |
| Auth | Supabase Auth (OAuth Google/Apple) |
| Storage | Supabase Storage |
| Notificações Push | Expo Notifications |
| Pagamentos | Stripe (React Native SDK) |
| Build/Deploy | Expo EAS → App Store + Google Play |

---

## Estrutura de Pastas

```
duolove-app/
├── app/                        # Expo Router (file-based routing)
│   ├── _layout.tsx             # Root layout (providers, StatusBar)
│   ├── index.tsx               # Redirect para (auth)/login
│   ├── (auth)/                 # Telas públicas (sem tab bar)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── invite.tsx
│   ├── (app)/                  # Telas autenticadas (com tab bar)
│   │   ├── _layout.tsx         # Tab navigator (7 abas; Drawer pronto em drawer-content.tsx para EAS Build)
│   │   ├── dashboard.tsx
│   │   ├── calendar.tsx
│   │   ├── chat.tsx            # Duo AI (Premium only, gpt-4o-mini via Edge Function)
│   │   ├── memories.tsx
│   │   ├── products.tsx        # Produtos afiliados (free + premium)
│   │   ├── love-languages.tsx  # Quiz 5 linguagens do amor (Premium only)
│   │   └── settings.tsx
│   └── onboarding/             # Fluxo de onboarding (fora das tabs)
│       ├── _layout.tsx
│       ├── step-1.tsx
│       ├── step-2.tsx
│       ├── step-3.tsx
│       └── step-4.tsx
├── components/
│   ├── ui/                     # Primitivos (Button, Input, Card, etc.)
│   ├── calendar/               # Componentes do calendário
│   ├── chat/                   # Componentes de mensagens
│   └── shared/                 # Componentes reutilizáveis
├── lib/
│   ├── supabase/               # Cliente Supabase (client.ts)
│   └── utils/                  # Utilitários compartilhados
├── hooks/                      # Custom React hooks
├── types/                      # Tipos TypeScript compartilhados
├── assets/                     # Ícones, splash, imagens
└── global.css                  # Entrada do NativeWind
```

---

## Design Identity

### Paleta de Cores

| Papel | Cor | Hex |
|---|---|---|
| Primário | Rosa | `#E91E8C` |
| Secundário | Lilás | `#9B59B6` |
| Superfície | Preto fosco | `#0D0D0D` |
| Card | Vidro escuro | `#1A1A2E` |
| Texto principal | Creme | `#F5F0EB` |
| Texto secundário | Cinza quente | `#8B8B9E` |
| Acento vinho | Rosa escuro | `#8B0051` |

### Estilo Visual
- Dark-first: modo escuro é a experiência principal
- Bordas totalmente arredondadas (`rounded-2xl`, `rounded-full`)
- Animações com Reanimated v3 (migrado na M12 — todas as telas e componentes)
- Tom íntimo e afetivo — nunca corporativo

---

## Convenções de Código

- TypeScript estrito — sem `any`
- Zod para validação de runtime em formulários
- NativeWind para estilização (classes Tailwind no JSX nativo)
- Estado servidor: React Query (`@tanstack/react-query`)
- Estado cliente: Zustand
- Supabase client em `lib/supabase/client.ts`
- Variáveis de ambiente com prefixo `EXPO_PUBLIC_` para acesso no cliente
- Nomes de arquivo: `kebab-case`; componentes: `PascalCase`
- Imports diretos — sem barrel exports (`index.ts`)
- Formulários: `react-hook-form` + `zod`
- Realtime: Supabase Realtime channels para sync de calendário e chat
- Lazy loading de telas pesadas: a rota em `app/(app)/` é um wrapper fino com `React.lazy` + `Suspense` (fallback `components/shared/screen-fallback.tsx`); o conteúdo real fica em `components/<area>/<nome>-screen.tsx`. Aplicado em `chat.tsx` (Duo) e `love-languages.tsx`.
- Transições de tela: configuradas via `animation` no `Stack` de cada `_layout.tsx` (slide nos fluxos, fade no auth; `premium-success` é modal slide-from-bottom).

---

## ⚠️ Restrições de Compatibilidade com Expo Go

O desenvolvimento M2–M6 usa **Expo Go** para preview. Expo Go tem limitações importantes:

### Pacotes que NÃO funcionam no Expo Go (requerem EAS Build)
- `react-native-reanimated` v4+ — usar v3.16.x até M12
- Qualquer módulo nativo não incluído no Expo Go SDK

### Animações
- **Usar `Animated` do React Native** (não Reanimated) em M2–M11
- Reanimated só deve ser reintroduzido na **M12 (Polish)**, após configurar EAS Build
- O plugin `react-native-reanimated/plugin` no `babel.config.js` deve acompanhar a versão instalada

### Versões fixadas (não alterar sem testar no Expo Go)
| Pacote | Versão | Motivo |
|---|---|---|
| `react-native-reanimated` | `~3.16.7` | v4 quebra no Expo Go (requer react-native-worklets) |
| `tailwindcss` | `^3.x` | NativeWind v4 exige Tailwind v3 |
| `@react-native-async-storage/async-storage` | `1.23.1` | v3.x não tem módulo nativo no Expo Go |
| `@react-navigation/drawer` | instalado | Drawer usa Reanimated internamente — só funciona em EAS Build, não no Expo Go |

### Setar Premium para testes (sem Stripe)
O `isPremium` lê da tabela `subscriptions`, não de `couples.plan`. Para testar features premium localmente:
```sql
insert into public.subscriptions (couple_id, plan, status)
values (
  (select id from public.couples
   where user1_id = (select id from public.users where email = 'SEU_EMAIL')),
  'premium', 'active'
)
on conflict (couple_id) do update set plan = 'premium', status = 'active';
```

### Prisma — decisão de arquitetura (M7)
Prisma foi removido do escopo. Ele só roda em Node.js server-side e não funciona em React Native/Expo Go. O padrão correto para apps mobile com Supabase é usar o **Supabase SDK diretamente** (`@supabase/supabase-js`). Schema e migrations são gerenciados via SQL no Supabase Dashboard (`supabase/schema.sql`).

### Plugins no app.json
- Só adicionar plugins de pacotes **já instalados**
- `expo-notifications` → adicionar apenas na M10
- `@stripe/stripe-react-native` → adicionar apenas na M11

### Entrypoint
- `index.ts` deve conter apenas `import 'expo-router/entry'`
- Não usar `registerRootComponent` com Expo Router

---

## Milestones

| # | Branch | Foco | Status |
|---|---|---|---|
| M1 | `setup/foundation` | Scaffold Expo, design system, roteamento | ✅ Concluída |
| M2 | `feat/auth-ui` | Telas de login, cadastro, onboarding (mock) | ✅ Concluída |
| M3 | `feat/dashboard-ui` | Dashboard, counter, shell do app | ✅ Concluída |
| M4 | `feat/calendar-ui` | Calendário completo (mock data) | ✅ Concluída |
| M5 | `feat/chat-ui` | Chat e reações (mock) | ✅ Concluída |
| M6 | `feat/memories-ui` | Timeline de memórias e upload UI | ✅ Concluída |
| M7 | `feat/backend-foundation` | Supabase, schema SQL, auth real | ✅ Concluída |
| M8 | `feat/backend-calendar` | API de eventos + Realtime sync | ✅ Concluída |
| M9 | `feat/backend-social` | Chat, memórias e upload real | ✅ Concluída |
| M10 | `feat/notifications` | Push notifications (Expo) + email (Resend) | ✅ Concluída |
| M11 | `feat/premium-stripe` | Planos, Stripe, gating de features | ✅ Concluída |
| M12 | `feat/polish` | Animações, acessibilidade, performance | ✅ Concluída |
| M13 | `chore/deploy` | Expo EAS Build + submissão às stores | ✅ Concluída |
| M14 | `feat/m14-new-features` | Duo AI, Quiz Linguagens do Amor, Produtos Afiliados, Drawer | ✅ Concluída |
| M15 | `feat/m15-nav-and-pickers` | Menu hambúrguer, seletor data+hora do evento, foto/data nas memórias | ✅ Concluída |

---

## Variáveis de Ambiente

```env
# Cliente (Expo — prefixo EXPO_PUBLIC_)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Supabase Edge Functions (secrets — nunca no cliente)
# supabase secrets set OPENAI_API_KEY=sk-...       ← usado pela Edge Function ai-chat (Duo)
# supabase secrets set STRIPE_SECRET_KEY=sk_live_...
# supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Fluxo de Trabalho por Requisição (feature/correção avulsa)

Estas regras valem para qualquer pedido de feature, correção, ajuste etc. **fora** do fluxo de milestones formais.

1. **Branch por requisição.** Toda vez que o usuário pedir uma feature, correção ou ajuste no projeto, criar uma branch dedicada para aquela requisição seguindo o padrão de git flow antes de escrever código:
   - Feature nova: `git checkout -b feat/nome-descritivo`
   - Correção de bug: `git checkout -b fix/nome-descritivo`
   - Ajuste/refino/chore: `git checkout -b chore/nome-descritivo`
   - Sempre criar a branch a partir de `master` atualizada.

2. **Commit + PR sob comando "pode commitar".** Quando o usuário disser **"pode commitar"** ao finalizar uma feature/correção que pediu:
   - Fazer o commit das alterações na branch da requisição, incluindo as atualizações dos arquivos de memória, `CLAUDE.md` e `docs/PLAN.md` quando relevantes.
   - Mensagem no padrão Conventional Commits (`type(scope): description`) terminando com a linha de co-autoria.
   - `git push -u origin <branch>`
   - Abrir PR para `master` com `gh pr create`.
   - **Não fazer merge automático** — apenas commit, push e PR, e aguardar instrução.

3. **Gatilho "contexto".** Quando o usuário disser **"contexto"** (geralmente no início de uma nova sessão), isso significa: se contextualizar do projeto para dar seguimento de onde paramos. Ler os arquivos de memória do projeto, o `CLAUDE.md` e o `docs/PLAN.md` (principalmente estes dois), entender o estado atual e o que ficou pendente, e então aguardar o próximo pedido.

---

## Milestone Git Flow

**⚠️ Regra importante:** Nunca iniciar uma nova milestone (criar branch, instalar dependências, escrever código) sem pedido explícito do usuário. Ao concluir o merge de uma milestone, parar e aguardar instrução.

**Início de cada milestone:**
1. Criar branch: `git checkout -b feat/nome-da-milestone`

**Final de cada milestone:**
1. Marcar todas as entregas como `[x]` no `docs/PLAN.md`
2. Atualizar status da milestone na tabela de Milestones acima (neste arquivo)
3. Commit final com a mensagem exata definida no bloco `Commit final` do PLAN.md
4. Push: `git push -u origin <branch>`
5. PR: `gh pr create`
6. Merge: `gh pr merge --merge --delete-branch`
7. Deletar branch local: `git branch -d <branch>`
8. Voltar para master: `git checkout master && git pull`
9. **Parar. Não iniciar a próxima milestone.**
