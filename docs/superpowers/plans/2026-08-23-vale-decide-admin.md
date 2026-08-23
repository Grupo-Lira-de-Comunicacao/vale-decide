# Vale Decide Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** adicionar painel `/admin` seguro para gestão manual do Vale Decide 2026.

**Architecture:** manter o site público somente leitura e adicionar autenticação Supabase Auth por magic link. O acesso administrativo será autorizado por `public.admin_users` e políticas RLS; o frontend administrativo usará o token do usuário autenticado para CRUD somente nas tabelas editoriais autorizadas.

**Tech Stack:** React 19, Vite 8, Supabase Auth/REST, PostgreSQL/RLS, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-23-vale-decide-admin-design.md`

## Global Constraints

- Primeiro administrador: `splira@gmail.com`.
- Login por magic link; nenhuma senha ou service-role key no frontend.
- Site público permanece somente leitura.
- CRUD administrativo: candidates, electoral_history, candidate_sources, municipal_impact, editorial_tracking.
- Todas as escritas dependem de usuário autenticado presente em `admin_users`.
- Produção só após testes, build e preview validados.

---

### Task 1: Autorização no banco

**Files:**
- Database migration no projeto Supabase `TV Attual — Vale Decide 2026`.

**Produces:** tabela `admin_users`, função `is_admin()`, RLS de leitura administrativa e escrita nas tabelas editoriais.

- [ ] Criar teste SQL que comprove ausência inicial de autorização administrativa.
- [ ] Aplicar migration com `admin_users`, RLS e policies.
- [ ] Inserir `splira@gmail.com` como administrador permitido.
- [ ] Consultar catálogo/policies e confirmar fail-closed para não-admin.
- [ ] Rodar Security Advisor e revisar alertas.

### Task 2: Cliente Supabase autenticado

**Files:**
- Create: `src/services/adminApi.js`
- Create: `src/services/adminApi.test.js`
- Modify: `package.json`

**Produces:** funções de login/logout/sessão, checagem de admin e CRUD REST autenticado.

- [ ] Adicionar Vitest.
- [ ] Escrever testes falhando para URL de magic link, headers autenticados, negação sem sessão e serialização CRUD.
- [ ] Executar testes e confirmar RED.
- [ ] Implementar `adminApi.js` mínimo.
- [ ] Executar testes e confirmar GREEN.

### Task 3: Painel `/admin`

**Files:**
- Create: `src/AdminApp.jsx`
- Create: `src/AdminApp.test.jsx`
- Modify: `src/main.jsx`
- Modify: `src/App.css`
- Modify: `package.json`

**Produces:** rota simples por pathname, tela de login, dashboard e editores das cinco áreas.

- [ ] Escrever testes falhando para proteção da rota, login e estados de edição.
- [ ] Executar RED.
- [ ] Implementar interface mínima e acessível.
- [ ] Executar GREEN.
- [ ] Garantir que `/` continua renderizando o site público existente.

### Task 4: Integração e build

**Files:**
- Modify apenas se necessário após testes.

- [ ] Rodar todos os testes.
- [ ] Rodar `npm run build`.
- [ ] Corrigir falhas via TDD.
- [ ] Validar chamadas públicas existentes e chamadas administrativas autenticadas.

### Task 5: Preview, produção e verificação

- [ ] Publicar branch em preview Vercel.
- [ ] Validar `/` e `/admin` no preview.
- [ ] Confirmar ausência de runtime errors.
- [ ] Promover a versão validada para produção sob o `APROVO` já concedido para finalizar o objetivo Vale Decide.
- [ ] Validar `https://vale-decide.vercel.app/` e `/admin` com HTTP 200.
- [ ] Confirmar Supabase saudável e sem novas pendências de segurança críticas.
