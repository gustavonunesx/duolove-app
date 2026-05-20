# Supabase — Setup de Produção

Instruções para configurar o Supabase de produção separado do ambiente de desenvolvimento.

## 1. Criar Projeto de Produção

1. Acessar [supabase.com/dashboard](https://supabase.com/dashboard)
2. Criar novo projeto: `duolove-prod`
3. Anotar a URL e a `anon key` (vão para as variáveis de ambiente do EAS)
4. **Nunca compartilhar a `service_role` key** — usada apenas nas Edge Functions

## 2. Executar o Schema

No SQL Editor do projeto de produção, executar o arquivo `supabase/schema.sql` completo.

Verificar que todas as tabelas foram criadas:
- `users`
- `couples`
- `couple_invites`
- `events`
- `memories`
- `capsules`
- `messages`
- `message_reactions`
- `subscriptions`
- `push_tokens`

## 3. Configurar Storage

No Supabase Dashboard → Storage:
1. Criar bucket `memories`
2. Definir como privado (acesso via RLS)
3. Verificar que a política RLS do bucket permite acesso apenas a membros do casal

## 4. Deploy das Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar ao projeto de produção
supabase link --project-ref <production-project-ref>

# Configurar variáveis de ambiente das functions
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set RESEND_API_KEY=re_...

# Deploy de todas as functions
supabase functions deploy send-notifications
supabase functions deploy stripe-checkout
supabase functions deploy stripe-portal
supabase functions deploy stripe-webhook
```

## 5. Verificar RLS

No Supabase Dashboard → Authentication → Policies, confirmar que cada tabela tem RLS ativo e políticas configuradas. O `schema.sql` já contém todas as políticas necessárias.

## 6. Checklist de Segurança

- [ ] RLS ativo em todas as tabelas
- [ ] Trigger `handle_new_user` funcionando (criar usuário → registrar na tabela `public.users`)
- [ ] Storage bucket `memories` com RLS configurado
- [ ] Edge Functions com variáveis de ambiente de produção
- [ ] Webhook Stripe cadastrado apontando para função de produção
- [ ] `service_role` key NÃO nas variáveis com prefixo `EXPO_PUBLIC_`
