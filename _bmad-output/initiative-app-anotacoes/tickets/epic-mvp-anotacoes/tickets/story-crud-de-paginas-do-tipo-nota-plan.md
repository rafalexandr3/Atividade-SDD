---
title: 'CRUD de páginas do tipo nota'
type: feature
ticket: '3'
created: '2026-11-22'
status: built
baseline_revision: 'f91fd8a8a7610e810d950ded327c4704637a38e0'
route: full
route_source: pinned
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `PagesPage` é um placeholder; R3/R4 exigem criar, listar, abrir, editar e excluir notas (`title` + `content`) persistidas no JSON Server e preservadas ao recarregar.

**Approach:** Camada `api/pages` sobre o axios, lista filtrada por `userId` e rotas protegidas `/paginas/nova` e `/paginas/:id` com editor que valida a posse antes de abrir, salvar ou excluir.

## Boundaries & Constraints

**Always:** Reutilizar `client.js`, `useAuth()`, `ProtectedRoute`, tokens de `index.css` e o padrão de `auth.test.jsx`; listar com `GET /pages?userId=<user.id>`; conferir posse (`page.userId` vs `user.id`, como string) em abrir/editar/excluir, tratando divergência como "Página não encontrada"; modelo `{id, userId, title, type: "note", content}`; título obrigatório; pt-BR, `label` e erros em `aria-live`; 320–1440 px; checklist só aparece na lista, sem edição aqui.

**Never:** Editor rico, busca, tags, criar/editar checklist (1.4), mudar o auth da 1.2, alterar `db-exemplo.json`, versionar `db.json`, backend real, ou quebrar `dev`/`server`/`build`/`test`/`lint`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Lista vazia | `GET /pages?userId=1` → `[]` | estado vazio + "Nova nota" | — |
| Criar nota válida | título "Compras", conteúdo "Leite" | `POST` `{userId, title, type:"note", content}`; abre a nota | — |
| Título vazio | título `"   "` | nenhuma requisição; foco no título | "Informe um título" em `aria-live` |
| Editar e recarregar | alterar e salvar | `PATCH`; ao remontar, `GET` traz o novo conteúdo | — |
| Excluir | "Excluir" → "Confirmar" | `DELETE`; linha some | — |
| Abrir id inexistente | `GET /pages/999` → 404 | "Página não encontrada" + voltar | — |
| Abrir página de outro usuário | `userId` diferente | não encontrada, sem ações | sem vazar conteúdo |
| API indisponível | erro de rede | lista: erro + "Tentar novamente"; editor: formulário preservado | "Não foi possível conectar ao servidor" |

</frozen-after-approval>

## Code Map

- `atividade-sdd/src/pages/PagesPage.jsx` — placeholder; vira lista com loading, erro, vazio, selo e exclusão em dois passos.
- `atividade-sdd/src/pages/PageEditorPage.jsx` (novo) — criação (`/paginas/nova`) e edição (`/paginas/:id`), com posse.
- `atividade-sdd/src/api/pages.js` (novo) — `listByUser`, `getById`, `createNote`, `updateNote`, `remove`; erros pt-BR.
- `atividade-sdd/src/App.jsx`, `src/App.css` — duas rotas sob `ProtectedRoute` (manter `/`, `/login`, `/cadastro`, fallback) e classes responsivas da lista/editor.
- `atividade-sdd/src/auth/`, `src/pages/LoginPage.jsx` — reutilizar sem alterar; padrão de `label`, foco, `aria-invalid` e `form-error`.
- `atividade-sdd/src/pages/pages.test.jsx` (novo) — espelha `auth.test.jsx`: axios mockado, `MemoryRouter` + `AuthProvider`, sessão `id = 1`.
- `atividade-sdd/db-exemplo.json` — read-only; `vitest.config.js` já cobre `src/**/*.test.{js,jsx}`.

## Tasks & Acceptance

**Execution:**
- [ ] `atividade-sdd/src/api/pages.js` — CRUD sobre `client`, `params: { userId }`, erros de rede/404 — HTTP e posse.
- [ ] `atividade-sdd/src/pages/PagesPage.jsx` — carregar ao montar, loading/erro/vazio, links, "Nova nota", selo e exclusão confirmada — lista.
- [ ] `atividade-sdd/src/pages/PageEditorPage.jsx` — carregar, validar posse, `title`/`content`, POST/PATCH, "Nota salva" e não encontrada — criar/editar.
- [ ] `atividade-sdd/src/App.jsx` — rotas protegidas `/paginas/nova` e `/paginas/:id` — acesso.
- [ ] `atividade-sdd/src/App.css` — lista/editor responsivos — 320–1440 px.
- [ ] `atividade-sdd/src/pages/pages.test.jsx` — um teste por linha da matriz — auditoria.

**Acceptance Criteria:**
- Given um usuário autenticado, when cria, edita ou exclui uma nota, then a mudança persiste no JSON Server e sobrevive ao reload.
- Given uma página de outro usuário ou id inexistente, when tenta abrir/editar/excluir, then nada é exposto nem alterado.
- Given a lista e o editor em 320 px e 1440 px, when usa as telas, then os controles continuam acessíveis.

## Implementation Notes

- `src/api/pages.js` centraliza CRUD e traduz rede/404; a lista usa `GET /pages?userId=<id>`.
- `PageEditorPage` revalida posse e tipo no `PATCH` e reseta o formulário quando `:id` muda (back/forward entre notas).
- `auth.test.jsx` passou a mockar a lista de páginas no teste de sessão persistida; o fluxo de auth não mudou.
- Revisão quick: 1 achado refutado e 5 patches aplicados (posse no save, status “Nota salva”, fonte do textarea, foco na exclusão e affordance do link).

## Plan Change Log

## Review Triage Log

- quick / false — `atividade-sdd/src/auth/auth.test.jsx:200-209` — a suíte de auth precisou deixar de exigir “nenhum GET”, pois a lista agora busca `/pages`; a asserção nova ainda pega o único formato de chamada de login (`client.get('/users', { params })` em `AuthContext.jsx`), e o fluxo de auth não mudou.
- quick / medium / patch — `atividade-sdd/src/pages/PageEditorPage.jsx:96-99` — confirmado: o `PATCH` usa o `:id` da URL sem reconferir posse e o efeito não reativa `loading` ao trocar de id; voltar/avançar entre `/paginas/:id` pode exibir dados antigos e salvar na página errada. Corrigir guarda no save e reset ao trocar id.
- quick / low / patch — `atividade-sdd/src/App.css:287-299` — confirmado: `textarea` não herda a fonte (só `button, input` em `index.css`), então o conteúdo aparece em monospace; adicionar `font: inherit`.
- quick / medium / patch — `atividade-sdd/src/pages/PageEditorPage.jsx:20,72,94,98,176,200` — confirmado: “Nota salva” permanece após editar o texto, sugerindo que alterações não salvas estão persistidas; limpar o status em qualquer mudança.
- quick / low / patch — `atividade-sdd/src/pages/PagesPage.jsx:147-181` — confirmado: ao trocar “Excluir” por “Confirmar/Cancelar” o foco cai no `body`; focar “Confirmar” ao abrir e devolver o foco ao cancelar.
- quick / low / patch — `atividade-sdd/src/App.css:287-299` — confirmado: título de nota clicável e título de checklist usam a mesma cor e só diferem no hover; adicionar affordance visível em repouso.

## Design Notes

`PageEditorPage` cobre os dois modos: `/paginas/nova` (estático vence o dinâmico) e `/paginas/:id`; após o `POST`, navega para `/paginas/{id}` e relê do servidor. Exclusão em dois passos, sem `window.confirm`; falha de save mantém o formulário.

## Verification

**Commands:**
- `npm test -- --run` (em `atividade-sdd`) -- esperado: auth e páginas passam.
- `npm run lint` / `npm run build` (em `atividade-sdd`) -- esperado: sem erros; build conclui.

**Manual checks (if no CLI):**
- `npm run server` + `npm run dev`: criar → reabrir → editar → recarregar → excluir em 320 px e 1440 px.
- `git status` não mostra `db.json`; `GET /pages?userId=1` devolve o array do usuário.
