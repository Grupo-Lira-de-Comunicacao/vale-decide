# Fala Vale — Central de Pautas da TV Attual

Sistema editorial para receber, organizar, classificar, apurar e acompanhar pautas enviadas pela audiência da TV Attual.

## Arquitetura

- Frontend: React + Vite
- Banco/API: Supabase — projeto `Fala Vale - TV Attual`
- Automação: n8n — workflow `TV ATTUAL | Fala Vale - Central de Pautas`
- WhatsApp: WAHA — sessão exclusiva do Fala Vale
- Atendimento guiado: serviço `fala-vale-conversation`
- Hospedagem: Vercel
- Repositório histórico: `Grupo-Lira-de-Comunicacao/vale-decide`

O projeto reutiliza a infraestrutura do antigo Vale Decide 2026. A estrutura eleitoral foi retirada do schema ativo e preservada separadamente em `legacy_vale_decide_2026`.

## WhatsApp oficial

`+55 12 99222-2681`

O atendimento acompanha a mesma conversa, aproveita informações já fornecidas e pergunta apenas o que ainda falta para completar a pauta. Entre os dados coletados estão relato, cidade/local, quando ocorreu, duração, pessoas afetadas, contato prévio com responsáveis, protocolo/material, nome e autorização para retorno.

Fotos, vídeos, áudios e PDFs recebidos são vinculados à pauta. Os arquivos ficam em bucket privado; áudios elegíveis passam por transcrição automática, com fallback seguro quando a transcrição não é confiável.

## Fluxo editorial

Audiência → WhatsApp/webhook → normalização → atendimento guiado → armazenamento privado de mídia → triagem automática → Supabase → Central de Pautas → revisão humana → apuração → produção → publicação.

A automação não publica conteúdo. A decisão editorial final é humana.

## Painel editorial

A rota `/admin` oferece:

- quadro por etapa editorial;
- busca e filtros por cidade/categoria;
- prioridade;
- contato e mensagens de origem;
- anexos privados com URL assinada;
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
