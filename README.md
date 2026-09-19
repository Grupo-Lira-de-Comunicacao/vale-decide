# Fala Vale — Central de Pautas da TV Attual

Sistema editorial para receber, organizar, classificar, apurar e acompanhar pautas enviadas pela audiência da TV Attual.

## Arquitetura

- Frontend: React + Vite
- Banco/API: Supabase — projeto `Fala Vale - TV Attual`
- Automação: n8n — workflow `TV ATTUAL | Fala Vale - Central de Pautas`
- Hospedagem: Vercel
- Repositório histórico: `Grupo-Lira-de-Comunicacao/vale-decide`

O projeto reutiliza a infraestrutura do antigo Vale Decide 2026. A estrutura eleitoral foi retirada do schema ativo e preservada separadamente em `legacy_vale_decide_2026`.

## Fluxo editorial

Audiência → entrada WhatsApp/webhook → normalização → triagem automática → Supabase → Central de Pautas → revisão humana → apuração → produção → publicação.

A automação não publica conteúdo. A decisão editorial final é humana.

## Painel editorial

A rota `/admin` oferece:

- quadro por etapa editorial;
- busca e filtros por cidade/categoria;
- prioridade;
- contato e mensagens de origem;
- anexos;
- sinais da triagem automática;
- responsável;
- histórico de movimentação;
- alteração de status.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Variáveis

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ADMIN_REDIRECT_URL` (opcional)

Somente chaves publicáveis podem estar no frontend.
