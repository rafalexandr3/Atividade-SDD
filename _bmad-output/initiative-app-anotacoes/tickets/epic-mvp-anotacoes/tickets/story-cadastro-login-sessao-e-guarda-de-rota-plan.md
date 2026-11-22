---
title: 'Cadastro, login, sessão e guarda de rota'
type: feature
ticket: '2'
created: '2026-11-22'
status: built
baseline_revision: '4c39e7a007284239ec384d6c2973618c25a0cc2d'
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** O app em `atividade-sdd/` ainda é o template Vite: não há cadastro, login, sessão nem área autenticada. R1/R2 exigem autenticar credenciais cadastradas, recusar credenciais inválidas, persistir a sessão em `localStorage` e bloquear a área de páginas após logout.

**Approach:** Adicionar rotas de cliente com `react-router-dom`, camada axios sobre o JSON Server, contexto de autenticação que persiste só `{id, name, email}`, telas de login/cadastro e rota protegida com placeholder de páginas e logout.

## Boundaries & Constraints

**Always:** Sessão em `localStorage` com chave única e sem senha; login via `/users`; cadastro com e-mail único via `POST /users`; autenticado em rota pública vai para `/`; anônimo em `/` vai para `/login`; pt-BR; formulários com `label`, `autocomplete` e erro em `aria-live`; reutilizar axios e tokens de `index.css`.

**Never:** Implementar listagem/CRUD de páginas (1.3–1.5), backend real, token/JWT ou hash; guardar senha na sessão; alterar `db-exemplo.json`, scripts do `package.json` ou README (story 1.1); quebrar `dev`, `server` ou `build`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Login válido | par existente em `/users` | sessão salva, redirect `/` | — |
| Login inválido | par inexistente | fica em `/login`, sem sessão | "E-mail ou senha inválidos" |
| Cadastro novo | nome, e-mail inédito, senha ≥ 6 | cria usuário, sessão automática, redirect `/` | — |
| E-mail duplicado | e-mail já em `/users` | sem criação nem sessão | "E-mail já cadastrado" |
| Validação local | vazio, e-mail inválido, senha curta | nenhuma requisição | erro por campo, foco no primeiro |
| API indisponível | JSON Server parado | sem sessão | "Não foi possível conectar ao servidor" |
| Recarregar autenticado | sessão em `localStorage` | continua em `/` com o nome | JSON corrompido é descartado → `/login` |
| Logout | clique em "Sair" | sessão removida, redirect `/login` | `/` deixa de renderizar páginas |

</frozen-after-approval>

## Code Map

- `atividade-sdd/package.json` — react 19, axios e json-server presentes; falta `react-router-dom` (v7).
- `atividade-sdd/src/main.jsx` — só monta `App`; passa a envolver com `BrowserRouter` e `AuthProvider`.
- `atividade-sdd/src/App.jsx` — template Vite; substituir por rotas `/login`, `/cadastro`, `/` protegida e fallback.
- `atividade-sdd/src/index.css` — tokens `--text`, `--bg`, `--border`, `--accent` e `#root` centralizado; remover regras do template que conflitem.
- `atividade-sdd/src/App.css` — estilos do template (hero, contador); substituir por auth/área de páginas.
- `atividade-sdd/db-exemplo.json` — `users {id,name,email,password}` e `pages`; não alterar.
- `atividade-sdd/vite.config.js` — sem proxy; API em URL absoluta `http://localhost:3001` (ou `VITE_API_URL`).
- `atividade-sdd/README.md` — já cobre `dev`/`server`; não alterar.

## Tasks & Acceptance

**Execution:**
- [ ] `atividade-sdd/package.json` — adicionar `react-router-dom` e devDeps `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, com script `test` — viabiliza rotas e testes.
- [ ] `atividade-sdd/src/api/client.js` — axios com `baseURL` de `VITE_API_URL` ou `http://localhost:3001` — centraliza HTTP.
- [ ] `atividade-sdd/src/auth/session.js` — `getSession`/`saveSession`/`clearSession` na chave `app-anotacoes.session`, descartando JSON inválido — persistência.
- [ ] `atividade-sdd/src/auth/AuthContext.jsx` — `user` inicial da sessão; `login`, `register`, `logout`; e-mail normalizado; erros pt-BR — regra de auth.
- [ ] `atividade-sdd/src/auth/ProtectedRoute.jsx` — `Navigate` para `/login` com `from` — guarda de rota.
- [ ] `atividade-sdd/src/pages/LoginPage.jsx` e `RegisterPage.jsx` — formulários controlados, validação local, envio, links e redirect — entrada.
- [ ] `atividade-sdd/src/pages/PagesPage.jsx` — placeholder com nome do usuário e "Sair" — prova a área protegida.
- [ ] `atividade-sdd/src/App.jsx`, `main.jsx` — rotas e provedores — composição.
- [ ] `atividade-sdd/src/App.css`, `src/index.css` — cartão de auth e cabeçalho utilizáveis de 320 a 1440 px — apresentação.
- [ ] `atividade-sdd/src/auth/auth.test.jsx` + `vitest.config.js` — um teste por linha da matriz, com axios mockado — auditoria da matriz.

**Acceptance Criteria:**
- Given um visitante em `/`, when a página carrega, then é redirecionado a `/login` sem ver a área de páginas.
- Given credenciais válidas, when o login é enviado, then a sessão aparece em `localStorage` sem a senha e `/` renderiza o nome do usuário.
- Given um usuário autenticado, when recarrega, then continua em `/`.
- Given um cadastro com e-mail existente, when envia, then nenhum usuário é criado e "E-mail já cadastrado" aparece.
- Given um autenticado, when clica "Sair", then a chave some do `localStorage` e `/` volta a redirecionar para `/login`.

## Implementation Notes

## Plan Change Log

## Review Triage Log

- quick / medium / patch — `atividade-sdd/index.html:2,7` — confirmado: UI pt-BR com `<html lang="en">` e título Vite; corrigido para `lang="pt-BR"` e "App de Anotações".
- quick / medium / patch — `atividade-sdd/src/pages/LoginPage.jsx:5-20` — confirmado: senha curta passava na validação local e gerava requisição; adicionada regra de 6 caracteres e teste de cobertura.

## Design Notes

Sessão `{id, name, email}` em `app-anotacoes.session`; a senha só trafega no login/cadastro. Duplicidade é checada com `GET /users?email=<email>` antes do `POST`. O guard usa `Navigate` com `state.from`. Sem validação no JSON Server, a segurança é só de fluxo (C2).

## Verification

**Commands:**
- `npm install` (em `atividade-sdd`) -- esperado: instala e atualiza o lockfile.
- `npm run lint` (em `atividade-sdd`) -- esperado: sem erros.
- `npm test -- --run` (em `atividade-sdd`) -- esperado: todos os testes da matriz passam.
- `npm run build` (em `atividade-sdd`) -- esperado: build conclui.
- `curl "http://localhost:3001/users?email=usuario@exemplo.com"` com o servidor no ar -- esperado: usuário seed.

**Manual checks (if no CLI):**
- Cadastro → logout → login → recarregar → logout, conferindo `localStorage` em cada passo.
- Credencial errada exibe erro sem sessão; `/` sem sessão redireciona para `/login`.
