# DuoLove — Guia de Deploy (M13)

Checklist completo para publicar o DuoLove na App Store e Google Play via Expo EAS.

---

## Pré-requisitos

- [ ] Conta no [Expo](https://expo.dev) criada
- [ ] Conta no [Apple Developer Program](https://developer.apple.com) ($99/ano)
- [ ] Conta no [Google Play Console](https://play.google.com/console) ($25 único)
- [ ] EAS CLI instalado: `npm install -g eas-cli`
- [ ] Login no EAS: `eas login`

---

## 1. Inicializar o projeto no EAS

```bash
# Na raiz do projeto
eas init

# Isso vai:
# - Criar o projeto no expo.dev
# - Preencher o projectId no app.json automaticamente
# - Gerar o slug único do app
```

Após o `eas init`, substituir `REPLACE_WITH_EAS_PROJECT_ID` no `app.json` pelo ID gerado.

---

## 2. Supabase de Produção

Criar um **projeto Supabase separado** para produção (não usar o mesmo do dev).

```bash
# Executar o schema completo no SQL Editor do Supabase de produção
# Arquivo: supabase/schema.sql

# Verificar que todas as tabelas existem:
# users, couples, couple_invites, events, memories, capsules,
# messages, message_reactions, subscriptions, push_tokens
```

### RLS — verificar que está ativo
No Supabase Dashboard → Authentication → Policies: todas as tabelas devem ter RLS habilitado.

### Service Role Key — NÃO expor
A `service_role` key do Supabase **nunca deve ir para o cliente**. Ela só é usada nas Edge Functions (já configuradas via variáveis de ambiente do Supabase).

---

## 3. OAuth Google / Apple

### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Criar OAuth 2.0 Client ID para iOS com bundle ID: `com.duolove.app`
3. Criar OAuth 2.0 Client ID para Android com package: `com.duolove.app`
4. Adicionar no Supabase Dashboard → Authentication → Providers → Google

### Apple OAuth
1. [Apple Developer](https://developer.apple.com) → Certificates, IDs & Profiles → Services IDs
2. Criar Service ID: `com.duolove.app.signin`
3. Configurar domínio de callback do Supabase
4. Adicionar no Supabase Dashboard → Authentication → Providers → Apple

---

## 4. Stripe — Produção

1. No [Stripe Dashboard](https://dashboard.stripe.com), mudar para modo **Live**
2. Criar os produtos:
   - DuoLove Premium Mensal (R$ X/mês)
   - DuoLove Premium Anual (R$ X/ano)
3. Copiar os Price IDs para as Edge Functions (`stripe-checkout`)
4. Configurar o webhook apontando para a URL da Edge Function de produção:
   - `https://<project>.supabase.co/functions/v1/stripe-webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copiar o Webhook Secret para as variáveis de ambiente da Edge Function

---

## 5. Variáveis de Ambiente no EAS

No [expo.dev](https://expo.dev) → Project → Environment Variables, adicionar:

| Variável | Valor |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL do projeto Supabase de produção |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key do Supabase de produção |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |

---

## 6. Build de Produção

```bash
# Android (AAB para Google Play)
eas build --platform android --profile production

# iOS (IPA para App Store)
eas build --platform ios --profile production

# Ambos simultaneamente
eas build --platform all --profile production
```

O EAS vai solicitar credenciais automaticamente (keystore Android, certificado iOS).
Usar `--auto-submit` para já submeter após o build:

```bash
eas build --platform all --profile production --auto-submit
```

---

## 7. Submissão Manual (alternativa)

```bash
# Android — após build concluído
eas submit --platform android --profile production

# iOS — após build concluído
eas submit --platform ios --profile production
```

### Configurações do submit (`eas.json`)
- **Android**: preencher `serviceAccountKeyPath` com a service account do Google Play
- **iOS**: preencher `appleId`, `ascAppId` (App Store Connect App ID) e `appleTeamId`

---

## 8. Smoke Test em Produção

Após publicação (mesmo em TestFlight / Internal Testing):

- [ ] Cadastro de novo usuário
- [ ] Login com email/senha
- [ ] Login com Google
- [ ] Fluxo de invite de casal (gerar link + aceitar no outro device)
- [ ] Criar evento no calendário → aparece para o parceiro em tempo real
- [ ] Enviar mensagem no chat → entregue e lida
- [ ] Upload de memória com foto
- [ ] Checkout premium via Stripe → status atualiza no app
- [ ] Push notification recebida após criar evento
- [ ] OTA update: publicar mudança pequena com `eas update` → app atualiza sem reinstalar

---

## 9. OTA Updates (pós-lançamento)

Para updates sem passar pelas stores:

```bash
# Publicar update OTA para o canal production
eas update --channel production --message "Fix: descrição do fix"
```

Limitação: OTA só funciona para JS/assets. Mudanças de código nativo exigem novo build.

---

## 10. Segurança — Checklist Final

- [ ] RLS ativo em todas as tabelas do Supabase de produção
- [ ] `service_role` key não exposta no cliente (só nas Edge Functions)
- [ ] Stripe em modo Live (não test)
- [ ] Webhook Stripe com secret configurado e validado
- [ ] `.env` não commitado (está no `.gitignore`)
- [ ] `google-service-account.json` não commitado (está no `.gitignore`)
- [ ] `app.json` não contém secrets (só projectId público)

---

## Comandos de Referência

```bash
# Status dos builds
eas build:list

# Logs de um build específico
eas build:view <build-id>

# Publicar OTA update
eas update --channel production --message "mensagem"

# Ver channels configurados
eas channel:list

# Ver branches de update
eas branch:list
```
