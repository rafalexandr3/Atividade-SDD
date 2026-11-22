---
title: 'Isolamento por usuário, responsividade e fechamento do MVP'
type: feature
ticket: '5'
created: '2026-11-22'
status: built
baseline_revision: '49556b469b0ee17a5e514a438c6eee9c3b125dc5'
route: oneshot
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

**Problem:** O MVP já tem cadastro, login, notas e checklists, mas o fechamento da entrega ainda depende de conferência manual: a lista confia apenas no filtro `userId` enviado ao JSON Server, não há teste de listagem com duas contas, o layout nunca foi validado em 320 px, e o README não traz credenciais do seed, comando de teste nem checklist de validação ponta a ponta. Sem isso, R6 (isolamento), R7 (execução documentada) e R8 (320–1440 px) não podem ser comprovados por quem avalia.

**Approach:** Reforçar o isolamento também no cliente em `listByUser`, cobrir a listagem com um teste de duas contas, ajustar os controles da lista e do estado vazio para 320 px e completar o README com credenciais do seed, scripts reais e um checklist de validação ponta a ponta (incluindo duas contas e as duas larguras).

</frozen-after-approval>

## Implementation Notes

Rota oneshot: a mudança é pequena, mecânica e concentrada em quatro arquivos (filtro defensivo + um teste + poucos ajustes de CSS + documentação), sem novas telas, rotas ou APIs.

- `atividade-sdd/src/api/pages.js` — `listByUser` agora filtra a resposta por `String(page.userId) === String(userId)`, mantendo o parâmetro `userId` na requisição como defesa em profundidade.
- `atividade-sdd/src/pages/pages.test.jsx` — novo teste devolve páginas de duas contas e confirma que só a conta logada aparece e que só há um botão “Excluir”.
- `atividade-sdd/src/App.css` — em telas até 480 px, as ações da lista ocupam a largura e dividem o espaço; o botão de voltar do estado “não encontrada” fica full-width.
- `atividade-sdd/README.md` — credenciais do seed, `npm start`, `npm test -- --run`, seção de isolamento, checklist de validação ponta a ponta (duas contas, 320/1440 px) e solução de problemas.
- `baseline_revision` corrigido para `49556b4` (conteúdo do `origin/main`, de onde o zip foi gerado); o `HEAD` local em `9b2c9e8` não contém os arquivos rastreados do projeto.
- Verificação executada: `npx vitest run` = 34/34, `npm run lint` sem erros, `npm run build` ok.
- Limitação: validação visual em navegador real (320/1440 px) e fluxo com duas contas ficam para o checklist manual do README.
- Revisão: 4 achados confirmados e corrigidos (logout antes do cadastro da segunda conta, porta do Vite, troca de porta da API e asserção vazia no teste). O README também ganhou uma nota para o 404 causado por `db.json` com o seed errado.

## Review Triage Log

- quick / medium / patch — `atividade-sdd/README.md` (passo 6) — confirmado: `/cadastro` usa `PublicOnlyRoute` e, com sessão ativa, redireciona para `/`; o checklist não mandava sair antes. Ação: adicionar “Sair” antes do cadastro da segunda conta e esclarecer a nota de credenciais.
- quick / medium / patch — `atividade-sdd/README.md` (porta 3001) — confirmado: `npm start` usa o script `api`, não `server`, e o cliente usa `http://localhost:3001` por padrão. Ação: documentar ajuste em `server` e `api` e a variável `VITE_API_URL`.
- quick / low / patch — `atividade-sdd/src/pages/pages.test.jsx` — confirmado: a lista não renderiza `content`, então a asserção sobre “Segredo” era vazia. Ação: remover a asserção; título e botão “Excluir” seguem cobrindo o filtro.
- quick / low / patch — `atividade-sdd/README.md` (passo 7) — confirmado: a URL fixa em 5173 pode não ser a porta do Vite, e a sessão é por origem. Ação: usar a URL/porta exibida pelo Vite.

## Verification

**Commands:**
- `npm test -- --run` (em `atividade-sdd`) -- esperado: todos os testes passam, incluindo o novo teste de listagem por conta.
- `npm run lint` (em `atividade-sdd`) -- esperado: sem erros.
- `npm run build` (em `atividade-sdd`) -- esperado: build de produção ok.

**Manual checks (if no CLI):**
- `README.md` contém credenciais do seed, `npm test -- --run`, `npm start` e o checklist de validação com duas contas.
- Em 320 px e 1440 px, a lista, o cabeçalho e os editores continuam sem rolagem horizontal e com controles acessíveis.
- `git status` continua sem `db.json` e sem mudanças de estrutura de pastas.
