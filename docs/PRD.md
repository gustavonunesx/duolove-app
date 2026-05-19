# DuoLove — Product Requirements Document

## 1. Contexto & Problema

Hoje, muitos casais têm dificuldade em organizar a rotina juntos de forma simples, leve e emocionalmente conectada. Os compromissos ficam espalhados entre conversas no WhatsApp, anotações, calendários separados e lembretes esquecidos.

Isso gera problemas como:

- desencontros de horários;
- esquecimentos de datas importantes;
- dificuldade para planejar momentos juntos;
- falta de alinhamento na rotina;
- sensação de distância causada pela correria do dia a dia.

Os aplicativos de calendário atuais são muito corporativos e frios, focados apenas em produtividade, sem considerar o lado emocional e afetivo de um relacionamento.

## 2. Solução

App móvel nativo (iOS e Android) de calendário compartilhado para casais, que une organização, comunicação e conexão emocional numa única plataforma.

O app permitirá que o casal:

- compartilhe compromissos em tempo real;
- organize rotinas juntos;
- acompanhe datas importantes;
- planeje encontros e viagens;
- receba notificações push personalizadas;
- registre memórias especiais do relacionamento.

O objetivo é transformar a organização do casal em algo leve, bonito e emocionalmente significativo.

## 3. Requisitos Funcionais

### Core

| Feature | Descrição |
|---|---|
| Autenticação | Cadastro, login social (Google/Apple), convite de parceiro(a) |
| Calendário compartilhado | Eventos em tempo real, visualização diária/semanal/mensal |
| Dashboard | Contador de dias, próximos eventos, datas comemorativas |
| Chat | Mensagens rápidas, reações com emoji, comentários em eventos |
| Memórias | Timeline de fotos e momentos especiais |
| Cápsula do tempo | Mensagem com data de revelação futura |
| Notificações push | Lembretes de eventos, datas especiais, alertas afetivos |
| Onboarding | Configuração do perfil do casal, escolha de tema visual |
| Premium | Assinatura com features exclusivas via Stripe |

### Detalhamento

#### Autenticação
- Cadastro com email + senha
- Login social: Google e Apple
- Recuperação de senha por email
- Fluxo de convite: usuário A convida usuário B para formar o casal
- Sessão persistida com refresh token (AsyncStorage)

#### Calendário Compartilhado
- Eventos sincronizados em tempo real via Supabase Realtime
- Tipos: pessoal, casal, data especial, viagem
- Visibilidade: privado ou compartilhado
- Cor personalizável (6 opções)
- Visualização mensal, semanal e diária
- Indicador de quem criou o evento (avatar)
- Drag-and-drop para reagendar

#### Notificações Push
- Lembrete de evento (24h e 1h antes)
- Alerta de data especial (1 semana antes)
- Aniversário do relacionamento
- Cápsula do tempo revelada
- Convite de casal recebido
- Todas via Expo Notifications (FCM + APNs)

#### Chat / Mensagens
- Chat geral do casal
- Comentários dentro de eventos
- Reações com emojis (long press)
- Indicador "digitando..." em tempo real
- Indicador de leitura
- Scroll para mensagem mais recente

#### Dashboard
- Contador animado de dias juntos
- Próximos 3 eventos
- Datas comemorativas do mês
- Status do parceiro(a) (online/offline)
- Última memória adicionada

#### Memórias
- Timeline cronológica com fotos
- Tags: viagem, date, aniversário, milestone, dia a dia
- Lightbox para visualização ampliada
- Galeria em grid (modo alternativo)
- Upload de foto via câmera ou galeria do celular

#### Cápsula do Tempo
- Escrever mensagem com data de revelação
- Card lacrado com countdown
- Notificação push na data de revelação

#### Premium (Stripe)
- Plano free vs. premium (mensal e anual)
- Features premium: temas exclusivos, retrospectiva mensal, storage extra de fotos, IA para sugestões de encontros
- Gating de features com componente `<PremiumGate>`
- Portal de gerenciamento de assinatura

### Funcionalidades Extras (backlog)
- Widget nativo para tela inicial do celular
- Modo "estou chegando" (localização compartilhada momentânea)
- Lista compartilhada (mercado, viagens, tarefas)
- Sugestões automáticas de horários livres para encontros

## 4. Personas

### Casal
Usuários principais. Compartilham eventos, memórias, chat e datas especiais.

### Usuário Individual
Cada pessoa tem agenda pessoal, preferências de notificação e eventos privados.

### Administrador
Gerencia assinaturas, monitora métricas, suporte.

## 5. Stack Técnico

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK 54 + Expo Router |
| Linguagem | TypeScript (strict) |
| Estilização | NativeWind v4 (Tailwind) |
| Animações | React Native Reanimated |
| Estado | React Query (server) + Zustand (client) |
| Formulários | react-hook-form + Zod |
| Banco de Dados | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth (Google/Apple OAuth) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime channels |
| Notificações Push | Expo Notifications (FCM + APNs) |
| Email | Resend |
| Pagamentos | Stripe (react-native-stripe-sdk) |
| Build | Expo EAS Build |
| Deploy | App Store + Google Play |

## 6. Design

### Paleta de Cores

| Papel | Hex |
|---|---|
| Primário (rosa) | `#E91E8C` |
| Secundário (lilás) | `#9B59B6` |
| Superfície | `#0D0D0D` |
| Card | `#1A1A2E` |
| Texto principal | `#F5F0EB` |
| Texto secundário | `#8B8B9E` |
| Acento vinho | `#8B0051` |

### Estilo Visual
- Dark-first (modo escuro é a experiência principal)
- Glassmorphism suave em cards
- Gradientes diagonais rosa → lilás
- Bordas totalmente arredondadas (`rounded-2xl`, `rounded-full`)
- Animações fluidas com Reanimated
- Tom íntimo e afetivo — nunca corporativo

### Referências Visuais
- Spotify — dark mode moderno
- Instagram — fluidez e interação emocional
- BeReal — simplicidade e autenticidade
- Notion — organização minimalista

## 7. Modelo de Dados (Domain)

```
Couple
  ├── User (partner A)
  ├── User (partner B)
  ├── startDate
  ├── theme (rose | lilac | wine)
  ├── plan (free | premium)
  ├── CalendarEvents[]
  ├── Messages[]
  ├── Memories[]
  └── Capsules[]

CalendarEvent
  ├── title, description
  ├── startAt, endAt
  ├── type (personal | couple | anniversary | travel)
  ├── color, visibility (private | shared)
  └── createdBy (User)

Memory
  ├── title, description, photoUrl
  ├── date
  └── tags (travel | date | anniversary | milestone | everyday)

Capsule
  ├── message
  ├── revealAt
  └── revealedAt

Message
  ├── content, createdAt
  ├── sender (User)
  ├── eventId? (opcional — comentário em evento)
  └── reactions (MessageReaction[])
```

## 8. Processo de Build

- Estratégia: interface primeiro, backend depois
- Cada milestone é uma branch isolada com entregas verificáveis
- M1–M6: UI completa com dados mock
- M7–M11: Backend real substituindo os mocks
- M12–M13: Polish e publicação nas stores
