---
title: 'Páginas do tipo checklist com itens editáveis'
type: feature
ticket: '4'
created: '2026-11-22'
status: built
baseline_revision: 'dc007d3b500195d7b27c240560fda7cc947d5e98'
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

**Problem:** Só há notas. Checklists existem no seed e são texto morto na lista: não há como criar, abrir, editar itens, excluir nem persistir mudanças. R3/R5/C4 exigem `items[{id,text,done}]` marcáveis, adicionáveis e removíveis após a criação.

**Approach:** Adicionar operações de checklist em `api/pages`, um editor dedicado (`/checklists/nova`, `/checklists/:id`) e ligar a lista: "Nova checklist", título clicável e exclusão.

## Boundaries & Constraints

**Always:** Reutilizar `client.js`, `useAuth()`, `ProtectedRoute`, tokens de `index.css` e os padrões de `PageEditorPage` (estados, foco, `aria-live`, reset ao trocar `:id`); listar com `GET /pages?userId=<user.id>`; conferir posse (`userId` como string) e tipo `checklist` ao abrir e salvar; modelo `{id,userId,title,type:"checklist",items:[{id,text,done}]}`; título obrigatório; item só entra com texto não vazio; `POST`/`PATCH /pages`; layout 320–1440 px.

**Never:** Editor rico, busca, tags, anexos, reordenar ou editar texto de item, converter nota↔checklist, alterar auth, editor de notas ou `db-exemplo.json`, versionar `db.json`, backend real, quebrar `dev`/`server`/`build`/`test`/`lint`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Lista com checklist | `GET /pages?userId=1` inclui checklist | link, selo "Checklist" e "Excluir" | — |
| Criar válida | título "Viagem", itens "Passaporte", "Hotel" | `POST` com `type` e `items`; abre `/checklists/{id}` | — |
| Título vazio | `"   "` | sem requisição; foco no título | "Informe um título" em `aria-live` |
| Item vazio | `"  "` | item não entra; foco no campo | "Informe o texto do item" |
| Adicionar item | "Leite" | entra como `done:false` | — |
| Marcar/desmarcar | clique no checkbox | `done` alterna e limpa "Checklist salva" | — |
| Remover item | "Remover" | some e não reaparece após salvar | — |
| Editar e recarregar | alterar e salvar | `PATCH` `{title,items}`; reload mantém | — |
| Id inexistente | `GET /pages/999` → 404 | "Página não encontrada" + voltar | — |
| Outro usuário ou nota | `userId` diferente ou `type:"note"` | não encontrada, sem conteúdo | sem vazar itens |
| API indisponível | erro de rede | lista: erro + "Tentar novamente"; editor: formulário preservado | "Não foi possível conectar ao servidor" |

</frozen-after-approval>

## Code Map

- `atividade-sdd/src/api/pages.js` — adicionar `createChecklist`/`updateChecklist` reutilizando `toPagesError`; `getById`/`remove` já servem.
- `atividade-sdd/src/pages/ChecklistEditorPage.jsx` (novo) — título, adicionar/marcar/remover itens, salvar; seguir o padrão de `PageEditorPage.jsx` (não alterar; ele rejeita não-notas).
- `atividade-sdd/src/pages/PagesPage.jsx` — toolbar e ações só de nota (108-111, 149-212); incluir checklist.
- `atividade-sdd/src/App.jsx` — adicionar `/checklists/nova` e `/checklists/:id` sob `ProtectedRoute`, estática antes da dinâmica.
- `atividade-sdd/src/App.css` — item de checklist (checkbox, texto, remover) e responsivo 320–1440 px.
- `atividade-sdd/src/pages/pages.test.jsx` — teste de exclusão (238-275) afirma checklist sem link e um só "Excluir"; atualizar.
- `atividade-sdd/src/pages/checklists.test.jsx` (novo) — matriz acima, axios mockado, `MemoryRouter` + `AuthProvider`, sessão `id = 1`.

## Tasks & Acceptance

**Execution:**
- [ ] `atividade-sdd/src/api/pages.js` — adicionar `createChecklist` e `updateChecklist` — persistência.
- [ ] `atividade-sdd/src/pages/ChecklistEditorPage.jsx` — criar/editar com posse, título obrigatório, itens `{id,text,done}` (id = maior id + 1), adicionar/marcar/remover, "Checklist salva", reset ao trocar `:id` — funcionalidade central.
- [ ] `atividade-sdd/src/pages/PagesPage.jsx` — "Nova checklist", link e exclusão para checklist — acesso e gestão.
- [ ] `atividade-sdd/src/App.jsx` — rotas protegidas de checklist — navegação.
- [ ] `atividade-sdd/src/App.css` — estilos do editor de itens — apresentação.
- [ ] `atividade-sdd/src/pages/checklists.test.jsx` — um teste por linha da matriz — auditoria.
- [ ] `atividade-sdd/src/pages/pages.test.jsx` — atualizar o teste de exclusão — coerência.

**Acceptance Criteria:**
- Given um usuário autenticado, when cria uma checklist com título e itens e salva, then ela é criada no JSON Server e reabre com os itens.
- Given uma checklist salva, when marca/desmarca, adiciona e remove itens e salva, then o estado persiste após recarregar e itens removidos não reaparecem.
- Given checklist de outra conta, nota ou id inexistente, when abre em `/checklists/:id`, then vê "Página não encontrada" sem conteúdo vazado.
- Given a lista e o editor em 320 px e 1440 px, when usa as telas, then os controles continuam acessíveis.

## Implementation Notes

- `api/pages.js` ganhou `createChecklist`/`updateChecklist`; `ChecklistEditorPage` cobre criar/editar com posse, itens `{id,text,done}` e salvamento explícito; lista, rotas e CSS integrados.
- Testes: `checklists.test.jsx` cobre as 11 linhas da matriz; `pages.test.jsx` atualizado para checklist clicável/excluível. `npm test -- --run` = 33/33, `lint` e `build` ok.
- Checagem manual em navegador e round-trip com JSON Server real não executados neste ambiente.

## Plan Change Log

## Review Triage Log

- quick / medium / patch — `atividade-sdd/src/pages/ChecklistEditorPage.jsx:153-199` — confirmado: título, checkboxes, "Remover" e "Adicionar" seguem ativos durante o `POST`/`PATCH`; mudanças feitas no intervalo não entram no payload e "Checklist salva" aparece mesmo assim. Ação: desabilitar esses controles enquanto `saving`.
- quick / low / patch — `atividade-sdd/src/pages/ChecklistEditorPage.jsx:153-166` — confirmado: `itemError` não é limpo no submit e pode coexistir com "Checklist salva". Ação: limpar `itemError` no início do submit.
- quick / low / patch — `atividade-sdd/src/pages/ChecklistEditorPage.jsx:319-325` — confirmado: todos os botões de remover têm nome acessível "Remover", sem o item. Ação: `aria-label` com o texto do item e ajuste das queries de teste.
- quick / low / patch — `atividade-sdd/src/pages/ChecklistEditorPage.jsx:340-343` — confirmado: digitar em "Novo item" não limpa "Checklist salva", contrariando o Design Notes. Ação: `setSavedId(null)` no `onChange`.
- quick / false — `atividade-sdd/src/pages/ChecklistEditorPage.jsx:169-193` — o duplo submit não é alcançável: o botão de submit fica `disabled={saving}`, o que bloqueia clique repetido e submissão implícita por Enter; React aplica `saving` antes do próximo evento discreto.
- quick / false — `atividade-sdd/src/pages/ChecklistEditorPage.jsx:6-23` — o app só grava ids numéricos e únicos (`nextItemId` = maior + 1); ids string ainda alternam corretamente (mesmo valor na closure e no item), e id duplicado exigiria `db.json` editado à mão, fora do fluxo do app.
- quick / low / patch — `atividade-sdd/src/pages/PagesPage.jsx:178-218` — confirmado: ao remover o gate `isNote`, páginas de tipo desconhecido ganharam "Excluir" sem poder abrir. Ação: limitar as ações a `note`/`checklist`.

## Design Notes

Editor separado preserva `PageEditorPage` (nota) e evita corridas de `PATCH` com salvamento explícito; mudanças locais limpam "Checklist salva". Exclusão fica na lista, em dois passos, para ambos os tipos.

## Verification

**Commands:**
- `npm test -- --run` (em `atividade-sdd`) -- esperado: tudo passa.
- `npm run lint` (em `atividade-sdd`) -- esperado: sem erros.
- `npm run build` (em `atividade-sdd`) -- esperado: build ok.

**Manual checks (if no CLI):**
- `npm run server` + `npm run dev`: criar checklist → adicionar/marcar/remover → salvar → recarregar; abrir a seed; excluir pela lista; 320 px e 1440 px. `git status` sem `db.json`.
