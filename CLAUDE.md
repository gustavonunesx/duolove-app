# DuoLove App — Briefing para Claude

## O que é o DuoLove

App móvel de calendário compartilhado para casais. Combina agendamento, comunicação e conexão emocional numa plataforma única. Publicado na App Store e Google Play.

Site de marketing (separado): repositório `duolove-web` (Next.js).

PRD completo: [docs/PRD.md](docs/PRD.md)
Plano de milestones: [docs/PLAN.md](docs/PLAN.md)

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
│   │   ├── _layout.tsx         # Tab navigator
│   │   ├── dashboard.tsx
│   │   ├── calendar.tsx
│   │   ├── chat.tsx
│   │   ├── memories.tsx
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
- Animações com React Native Reanimated
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

---

## Milestones

| # | Branch | Foco | Status |
|---|---|---|---|
| M1 | `setup/foundation` | Scaffold Expo, design system, roteamento | ✅ Concluída |
| M2 | `feat/auth-ui` | Telas de login, cadastro, onboarding (mock) | ✅ Concluída |
| M3 | `feat/dashboard-ui` | Dashboard, counter, shell do app | ⬜ Próxima |
| M4 | `feat/calendar-ui` | Calendário completo (mock data) | ⬜ |
| M5 | `feat/chat-ui` | Chat e reações (mock) | ⬜ |
| M6 | `feat/memories-ui` | Timeline de memórias e upload UI | ⬜ |
| M7 | `feat/backend-foundation` | Supabase, Prisma schema, auth real | ⬜ |
| M8 | `feat/backend-calendar` | API de eventos + Realtime sync | ⬜ |
| M9 | `feat/backend-social` | Chat, memórias e upload real | ⬜ |
| M10 | `feat/notifications` | Push notifications (Expo) + email (Resend) | ⬜ |
| M11 | `feat/premium-stripe` | Planos, Stripe, gating de features | ⬜ |
| M12 | `feat/polish` | Animações, acessibilidade, performance | ⬜ |
| M13 | `chore/deploy` | Expo EAS Build + submissão às stores | ⬜ |

---

## Variáveis de Ambiente

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Milestone Git Flow

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
