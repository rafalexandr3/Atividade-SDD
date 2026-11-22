---
title: 'Scaffold do projeto e base de dados local'
type: chore
ticket: '1'
created: '2026-11-22'
status: built
baseline_revision: '47a86c4d78d1314afc09ca4ef26dbb8e714f14cf'
route: oneshot
route_source: auto
risk: low
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A história 1.1 precisa deixar o projeto `atividade-sdd` pronto para execução local com React+Vite, axios e JSON Server, além de definir a base de dados local (`db-exemplo.json` versionado, `db.json` real não versionado) e documentar os passos no README.

**Approach:** Ajustar scripts/dependências no `atividade-sdd/package.json`, criar `db-exemplo.json` com modelo seed, garantir que `db.json` seja ignorado pelo git, atualizar README com passos claros de execução e fazer um smoke check dos comandos esperados pela verificação.

## Boundaries & Constraints

**Always:** Manter stack React+Vite+axios+JSON Server; `db.json` na raiz de `atividade-sdd` (usado pelo json-server) e ignorado pelo git; `db-exemplo.json` versionado; scripts `npm run dev` e `npm run server` funcionando conforme verificação da história.

**Never:** Implementar auth, CRUD de páginas, rotas protegidas ou features das histórias 1.2–1.6; commitar `db.json`; adicionar backend real.

</frozen-after-approval>

## Implementation Notes

- Planejamento oneshot: escopo pequeno (config, arquivos de dados, README, smoke check), ~poucos arquivos, baixo risco.
- Árvore já contém mudanças prévias em `atividade-sdd/package.json` e `package-lock.json`; baseline preservado como HEAD 47a86c4. Usuário confirmou continuar com a árvore suja.
- Criado `atividade-sdd/db-exemplo.json` (seed users/pages) e `atividade-sdd/db.json` local a partir do exemplo; `db.json` ignorado por `atividade-sdd/.gitignore`.
- Scripts ajustados para `dev` e `server` (json-server watch db.json porta 3001); mantidos `api/start` para conveniência.
- README atualizado com setup, cópia do db-exemplo, execução em dois terminais e modelo de dados.
- Smoke checks: `npm run -s server -- --help` OK, `npm run -s dev -- --help` OK, `git status` não mostra `db.json`.

## Plan Change Log

## Review Triage Log

- `atividade-sdd/db-exemplo.json` untracked — **high/real**. Evidência: `git status` mostrava `?? atividade-sdd/db-exemplo.json`. Ação: será incluído no commit da história para cumprir “db-exemplo.json versionado”.

## Verification

**Commands:**
- `npm run -s dev -- --help` (em `atividade-sdd`) -- esperado: comando Vite disponível.
- `npm run -s server -- --help` (em `atividade-sdd`) -- esperado: comando json-server disponível.
- `git status --short` -- esperado: `db.json` não aparece como arquivo não rastreado/modificado.

**Manual checks (if no CLI):**
- README descreve criar/copiar `db.json` a partir de `db-exemplo.json` e executar `npm run dev` e `npm run server`.
