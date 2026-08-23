# Vale Decide Admin — Design

**Data:** 2026-08-23

## Objetivo

Adicionar ao Vale Decide 2026 um painel administrativo próprio em `/admin`, protegido por autenticação do Supabase, permitindo ao administrador editar manualmente o conteúdo eleitoral sem precisar usar o painel técnico do Supabase.

## Primeiro administrador

- E-mail autorizado: `splira@gmail.com`
- Autenticação: Supabase Auth por magic link enviado ao e-mail.
- Não haverá senha fixa embutida no código.

## Escopo funcional

O painel administrativo permitirá:

- listar candidatos;
- criar, editar, publicar e despublicar candidatos;
- editar número, partido, cargo, cidade, ocupação, cargo atual, biografia, links, redes sociais, foto, situação eleitoral e status de verificação;
- cadastrar, editar e remover histórico eleitoral;
- cadastrar, editar e remover fontes;
- cadastrar, editar e remover impacto municipal;
- atualizar acompanhamento editorial, incluindo contato, convite e entrevista;
- encerrar sessão.

## Arquitetura

O site público continuará com leitura anônima pelas policies já existentes. O painel `/admin` usará `@supabase/supabase-js` para autenticação e operações autenticadas.

Uma tabela `public.admin_users` armazenará os e-mails autorizados. A autorização será aplicada no banco por RLS, validando o e-mail autenticado com `auth.jwt()->>'email'` contra `admin_users`.

As tabelas editoriais gerenciadas serão:

- `candidates`
- `electoral_history`
- `candidate_sources`
- `municipal_impact`
- `editorial_tracking`
- `candidate_municipalities`

As policies públicas de SELECT existentes serão preservadas. Policies adicionais de SELECT/INSERT/UPDATE/DELETE serão criadas apenas para administradores autenticados.

## Componentes frontend

- `src/lib/supabaseClient.js`: cliente Supabase compartilhado.
- `src/admin/AdminApp.jsx`: controle de autenticação e roteamento do painel.
- `src/admin/LoginAdmin.jsx`: solicitação de magic link.
- `src/admin/DashboardAdmin.jsx`: navegação entre módulos e resumo.
- `src/admin/CandidatesAdmin.jsx`: CRUD de candidatos.
- `src/admin/CandidateEditor.jsx`: formulário detalhado de candidato.
- `src/admin/HistoryAdmin.jsx`: CRUD de histórico eleitoral.
- `src/admin/SourcesAdmin.jsx`: CRUD de fontes.
- `src/admin/ImpactAdmin.jsx`: CRUD de impacto municipal.
- `src/admin/EditorialAdmin.jsx`: acompanhamento editorial.
- `src/admin/adminApi.js`: acesso ao banco para o painel.
- `src/admin/admin.css`: estilos isolados do painel.

O `src/main.jsx` detectará `window.location.pathname.startsWith('/admin')` para renderizar o AdminApp; as demais rotas continuarão carregando o site público existente.

## Fluxo de autenticação

1. Usuário abre `/admin`.
2. Informa `splira@gmail.com`.
3. Supabase envia magic link.
4. Ao retornar ao site, a sessão é recuperada.
5. O app consulta `admin_users` e valida que o e-mail está autorizado.
6. Se autorizado, abre o dashboard; caso contrário, encerra a sessão e bloqueia o acesso.

## Segurança

- Nenhuma service role key será enviada ao navegador.
- O frontend usará somente a publishable key já destinada a aplicações públicas.
- A segurança de escrita será garantida no Postgres por RLS, e não apenas por ocultação de interface.
- O e-mail administrador será cadastrado em `admin_users`.
- Usuários autenticados que não estejam em `admin_users` não poderão escrever nem ler dados internos de acompanhamento editorial.
- `editorial_tracking` continuará invisível para o público.

## Compatibilidade com o site público

O comportamento público existente não será alterado. O site seguirá mostrando apenas candidatos `published=true` e `verification_status='verificado'` e os dados públicos liberados pelas policies existentes.

## Erros e feedback

Todas as ações de escrita terão estado de carregamento, mensagem de sucesso e erro. Exclusões pedirão confirmação no painel. Falhas do Supabase não serão ocultadas.

## Validação

Antes de produção serão validados:

- build Vite;
- acesso público sem regressão;
- `/admin` sem sessão;
- envio do magic link;
- bloqueio de e-mail não autorizado;
- login do administrador;
- CRUD de candidato em registro de teste/controlado;
- publicação/despublicação refletida no site público;
- CRUD das tabelas auxiliares;
- logout;
- advisors de segurança do Supabase;
- preview Vercel;
- promoção para produção apenas após validação.

## Fora do escopo

- múltiplos níveis de função (editor, revisor, administrador);
- auditoria editorial avançada por usuário;
- upload de imagens para Supabase Storage;
- importação automática do TSE;
- automação de coleta de emendas e entregas;
- login por Google/social.

Esses itens poderão ser adicionados em versões posteriores sem alterar a arquitetura básica do painel.