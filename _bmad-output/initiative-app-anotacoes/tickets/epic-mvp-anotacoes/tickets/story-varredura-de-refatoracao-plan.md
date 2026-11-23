---
title: 'Varredura de refatoração'
type: refactor
ticket: '6'
created: '2026-11-22'
status: built
baseline_revision: '29cfa1dc7dedf4780090ade3efdb83d2513a2d92'
route: oneshot
route_source: auto
risk: low
review: quick
review_source: pinned
lenses_ran: []
review_loop_iteration: 0
context: []
---

# Story 6 — Varredura de refatoração

> Plano de trabalho da story 6 do épico `epic-mvp-anotacoes`.
> Fonte: `_bmad-output/initiative-app-anotacoes/tickets/epic-mvp-anotacoes/tickets/tickets.toml`
> (`id = 6`, `after = [1,2,3,4,5]`, `risk = "low"`, `hitl = false`).

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** As stories 1–5 entregaram R1–R8, mas deixaram duplicações e resíduos que aumentam o custo de explicar, revisar e manter o MVP: regras de validação de auth repetidas em duas telas, dois mapeadores de erro HTTP quase idênticos, ~120 linhas de boilerplate repetidas entre os dois editores, checagem de posse reescrita em três arquivos, assets do scaffold do Vite nunca usados e setup de teste triplicado. Nada disso quebra o app hoje; tudo isso encarece a entrega acadêmica e esconde regressões.

**Approach:** Limpeza mecânica em sete frentes (D1–D6 abaixo), sem nova tela, rota, dependência, payload HTTP ou string visível ao usuário. A suíte de 34 testes existente é a rede de segurança: cada extração precisa manter os mesmos comportamentos, mensagens e chamadas de API.

## Boundaries & Constraints

**Always:**

- Manter React + Vite + axios + JSON Server; sem novas dependências.
- Preservar exatamente: rotas, textos pt-BR, mensagens de erro, chaves de `localStorage`, formato de payload (`userId`, `type`, `content`, `items`), status HTTP e fluxo de foco/`aria`.
- Manter `db-exemplo.json` e `db.json` intocados; `db.json` continua fora do git.
- Manter os 34 testes passando com as mesmas asserções (só imports/helpers podem mudar).
- Rodar `npm test -- --run`, `npm run lint` e `npm run build` ao final.
- Refatorar em passos pequenos e verificar a suíte entre eles.

**Never:**

- Implementar funcionalidade nova, mudar regra de negócio, layout, textos, rotas ou contrato da API.
- Mexer em `AuthContext` além de importar `normalizeEmail`; não trocar o modelo de sessão.
- Alterar `vite.config.js`/`vitest.config.js` (fusão de configs fica fora desta história).
- Apagar `db-exemplo.json`, `favicon.svg`, `public/` ou qualquer asset ainda referenciado.
- Atualizar status de épico/iniciativa (fechamento documental é da PO, não desta história).

## O que esta história NÃO entrega

**Nenhuma funcionalidade nova.** R1–R8 já estão implementados e continuam idênticos. O valor entregue é interno: menos duplicação, um único lugar para cada regra, menos risco de divergência futura e um código mais fácil de explicar na avaliação. Se algum passo exigir mudar comportamento para "ficar mais bonito", ele está fora do escopo.

</frozen-after-approval>

## Inventário de débitos aprovados

| ID | Débito | Evidência | Arquivos | Ação | Risco |
|----|--------|-----------|----------|------|-------|
| D1 | Validação de auth duplicada | `EMAIL_PATTERN`, `MIN_PASSWORD_LENGTH` e `validate()` repetidos; `normalizeEmail` isolado no contexto | `src/pages/LoginPage.jsx:5-24`, `src/pages/RegisterPage.jsx:5-28`, `src/auth/AuthContext.jsx:8-10` | Criar `src/auth/validation.js` com `EMAIL_PATTERN`, `MIN_PASSWORD_LENGTH`, `normalizeEmail`, `validateLogin`, `validateRegister`; importar nas telas e no contexto | Baixo |
| D2 | Mapeamento de erro HTTP duplicado | `PagesError`/`toPagesError` e `AuthError`/`toAuthError` com as mesmas mensagens de rede/404/genérico | `src/api/pages.js:3-22`, `src/auth/AuthContext.jsx:6-18` | Criar `src/api/errors.js` com `ApiError` e `toApiError(error, { notFoundMessage })`; `pages.js` e `AuthContext` passam a usar a base, mantendo mensagens e `status` | Baixo |
| D3 | Boilerplate dos editores | Loading, "não encontrada", erro de carga, `handleRetry`, guarda de posse/tipo e reset por `:id` duplicados; reset por `trackedId` usa `setState` durante o render | `src/pages/PageEditorPage.jsx:15-88,138-187`, `src/pages/ChecklistEditorPage.jsx:36-112,202-251` | Extrair `usePageLoader({ id, type, userId })` (carga + posse + `notFound`/`loadError`/`retry` + reset ao trocar `id`), `AppHeader`, `LoadingState`/`NotFoundState`/`LoadErrorState`; formulários e save ficam em cada editor | Médio |
| D4 | Checagem de posse repetida | Comparação `String(page.userId) === String(user.id)` reescrita em lista e nos dois editores | `src/pages/PagesPage.jsx:70`, `src/pages/PageEditorPage.jsx:52-53,118-121`, `src/pages/ChecklistEditorPage.jsx:76-77,182-185` | Criar `src/pages/page-ownership.js` com `isPageOwnedBy(page, userId)` e `isPageOfType(page, type)`; reutilizar em D3 | Baixo |
| D5 | Código morto / artefatos do scaffold | Assets sem referência e CSS sem uso | `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg`, `src/App.css:473` (`.not-found h2`), `src/index.css:11,20,44` (`--social-bg`, `--mono`) | Apagar assets não referenciados; remover seletor e variáveis mortas; **não** tocar em `--code-bg`, `--shadow`, `--heading`, `favicon.svg` | Baixo |
| D6 | Setup de teste triplicado | `renderApp`, `sessionUser`, fixtures e `mockReset` repetidos em 3 arquivos | `src/auth/auth.test.jsx`, `src/pages/pages.test.jsx`, `src/pages/checklists.test.jsx` | Criar `src/test/render-app.jsx` com `renderApp`, `sessionUser`, `seedNote`, `seedChecklist`, `resetClientMocks`; `vi.mock` continua em cada arquivo (hoisting) | Baixo |

### Débitos deliberadamente rejeitados

- **Fundir `vite.config.js` + `vitest.config.js`** — mexe em tooling sem ganho para a entrega; risco desproporcional.
- **Simplificar o `useMemo([user])` do `AuthContext`** — não há bug nem custo mensurável; mudança gratuita.
- **Remover o bloco `prefers-color-scheme` do `index.css`** — o brief diz "dark mode fora da v1", mas o bloco é herdado do template e removê-lo alteraria a aparência em SO escuro (mudança de comportamento). Fica como está; se a avaliação exigir, vira decisão separada.
- **Trocar `npm run api` por alias** — é alias documentado no README; manter.

## Code Map

- `atividade-sdd/src/auth/validation.js` (novo) — D1.
- `atividade-sdd/src/api/errors.js` (novo) — D2.
- `atividade-sdd/src/pages/usePageLoader.js` (novo) — D3.
- `atividade-sdd/src/components/AppHeader.jsx`, `src/components/PageStates.jsx` (novos) — D3.
- `atividade-sdd/src/pages/page-ownership.js` (novo) — D4.
- `atividade-sdd/src/test/render-app.jsx` (novo) — D6.
- `atividade-sdd/src/api/pages.js`, `src/auth/AuthContext.jsx` — D1/D2 (imports).
- `atividade-sdd/src/pages/LoginPage.jsx`, `RegisterPage.jsx` — D1.
- `atividade-sdd/src/pages/PagesPage.jsx` — D3/D4 (header + posse).
- `atividade-sdd/src/pages/PageEditorPage.jsx`, `ChecklistEditorPage.jsx` — D3/D4.
- `atividade-sdd/src/App.css`, `src/index.css` — D5.
- `atividade-sdd/src/**/*.test.jsx` — D6 (imports).
- Read-only: `db-exemplo.json`, `App.jsx`, `main.jsx`, `package.json`, configs.

## Tasks & Acceptance

**Execution (nesta ordem, rodando `npm test -- --run` entre os passos):**

- [x] **D5** — remover assets e CSS mortos; confirmar que nada quebrou.
- [x] **D1** — criar `auth/validation.js`, importar em Login/Register/AuthContext; mensagens idênticas.
- [x] **D2** — criar `api/errors.js`; migrar `pages.js` e `AuthContext`; manter `status = 404` e textos.
- [x] **D4** — criar `page-ownership.js`; trocar as quatro comparações manuais.
- [x] **D3** — criar `usePageLoader`, `AppHeader`, `PageStates`; refatorar os dois editores e a lista; remover `trackedId`.
- [x] **D6** — criar `src/test/render-app.jsx`; migrar os três arquivos de teste sem alterar asserções.
- [x] Rodar `npm test -- --run`, `npm run lint`, `npm run build`.
- [ ] Smoke manual: login seed → criar nota → criar checklist → segunda conta → logout.

**Acceptance Criteria:**

- Given o código refatorado, when comparo comportamento com a baseline `29cfa1d`, then rotas, textos, payloads, mensagens de erro e fluxo de foco são idênticos.
- Given a suíte de testes, when rodo `npm test -- --run`, then os 34 testes passam sem alteração de asserções.
- Given `npm run lint` e `npm run build`, then terminam sem erro.
- Given `git diff --stat`, then não há mudança em `package.json`, `db-exemplo.json`, `App.jsx`, configs nem em arquivos de API pública.
- Given a lista de débitos D1–D6, then todos foram aplicados ou registrados como rejeitados com justificativa.

## Implementation Notes

- D5: removidos `hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`, o seletor `.not-found h2` e as variáveis `--social-bg`/`--mono`.
- D1: `src/auth/validation.js` centraliza `EMAIL_PATTERN`, `MIN_PASSWORD_LENGTH`, `normalizeEmail`, `validateLogin` e `validateRegister`; mensagens e foco preservados.
- D2: `src/api/errors.js` expõe `ApiError`/`toApiError`; `pages.js` mantém “Página não encontrada” + status 404 e `AuthContext` mantém os textos de login/cadastro.
- D4: `src/pages/page-ownership.js` concentra `isPageOwnedBy`/`isPageOfType`; usado na lista, nos dois editores e nos guards de save.
- D3: `usePageLoader` absorve carga, posse/tipo, 404, retry, reset por `:id` e `markNotFound`/`startLoading`; `AppHeader` e `PageStates` removem o boilerplate dos editores. `trackedId` deixou de existir nos componentes.
- D6: `src/test/render-app.jsx` compartilha `renderApp`, `sessionUser`, `seedNote`, `seedChecklist` e `resetClientMocks`; nenhuma asserção foi alterada.
- Verificação executada: `npm test -- --run` = 34/34, `npm run lint` limpo, `npm run build` ok; `git diff --stat` = 16 arquivos, +128/−472 (líquido −344 linhas).
- Smoke de integração: API real em `:3001` devolveu o usuário seed e as páginas do usuário 1; Vite em `:5173` respondeu 200 com o título correto; todos os módulos alterados foram transformados sem erro.
- Limitação: smoke visual em navegador real (duas contas, 320/1440 px) segue pendente de execução humana.

## Verification

**Commands (em `atividade-sdd`):**

- `npm test -- --run` — esperado: 34/34.
- `npm run lint` — esperado: sem erros.
- `npm run build` — esperado: build conclui.
- `git status --short` — esperado: `db.json` ausente; só arquivos-fonte/teste previstos.

**Manual (sem CLI):**

- `npm start`: login `usuario@exemplo.com` / `123456`; criar nota e checklist; recarregar e confirmar persistência.
- Sair, criar segunda conta, confirmar lista vazia e "Página não encontrada" em `/paginas/1`.
- Redimensionar para 320 px e 1440 px: sem rolagem horizontal.
- Confirmar que nenhuma mensagem de erro exibida mudou.

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Extração do `usePageLoader` alterar o reset ao trocar `:id` (voltar/avançar) | Cobrir com os testes existentes de navegação entre notas; comparar manualmente o fluxo |
| Unificação de erros mudar texto ou `status` | Manter as mensagens literais atuais e testar login inválido, API fora e página 404 |
| Remoção de asset ainda usado por CSS | Grep por nome do arquivo antes de apagar; build precisa passar |
| Refatoração "criativa" virar mudança de escopo | Congelar D1–D6; qualquer ideia nova vai para nota, não para o diff |

## Definition of Done

- D1–D6 aplicados; rejeitados documentados.
- 34/34 testes, lint e build verdes.
- Smoke manual completo (duas contas + duas larguras).
- Nenhuma mudança de comportamento observável; nenhuma dependência nova.
- Plano arquivado no ticket da story 6 ao iniciar a implementação.
