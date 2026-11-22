---
tracker_id: ""
id: 1
type: epic
title: "MVP do app de anotações"
parent: initiative-app-anotacoes
covers: ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"]
sources:
  - "_bmad-output/brief-app-anotacoes/brief-app-anotacoes.md"
companions: []
after: []
status: in-progress
risk: medium
---

# MVP do app de anotações

## Description

Epic único da iniciativa: entrega o MVP acadêmico completo do app de anotações. Ao final, um avaliador sobe o front-end (React + Vite) e o mock (JSON Server com `db.json`), cadastra e autentica um usuário, cria e gerencia notas e checklists com isolamento por conta, e encerra a sessão. O escopo vem do brief final e das decisões confirmadas pelo usuário.

## Outcome

Um avaliador consegue executar o app localmente e validar o fluxo completo descrito no brief, sem passos não documentados e sem acessar dados de outra conta.

## Requirements

R1 (parent R1): O sistema permite cadastrar um usuário com credenciais e autenticar com credenciais já cadastradas; credenciais inválidas não concedem acesso à área de páginas.
R2 (parent R2): Ao autenticar, a sessão registra em `localStorage` o identificador do usuário logado; ao sair (logout), a sessão é removida e a área de páginas fica inacessível até novo login.
R3 (parent R3): Um usuário autenticado pode criar, listar, abrir, editar e excluir suas próprias páginas.
R4 (parent R4): Uma página do tipo `note` possui `title` e `content` (texto livre) e pode ser salva e reaberta com seu conteúdo preservado.
R5 (parent R5): Uma página do tipo `checklist` possui `title` e `items`, onde cada item tem `id`, `text` e `done`; itens podem ser marcados/desmarcados, adicionados e removidos após a criação, com persistência do estado.
R6 (parent R6): O isolamento por usuário é garantido: páginas são associadas a `userId` e uma conta não vê, edita nem exclui páginas de outra conta.
R7 (parent R7): O projeto executa localmente com `npm run dev` (Vite) e `json-server`; o repositório contém `db-exemplo.json` versionado como modelo/seed, e o `db.json` real fica na raiz, é usado pelo JSON Server e não é versionado; os passos de execução estão documentados no README.
R8 (parent R8): A interface é utilizável em larguras de 320 px a 1440 px.

## Constraints

C1 (parent C1): React + Vite, axios, JSON Server; sem backend real.
C2 (parent C2): Autenticação simulada sem token; isolamento por filtro de `userId` no front-end.
C3 (parent C3): Fora da v1 — compartilhar, exportar, busca, tags, anexos, editor de texto rico, dark mode, autenticação com token.
C4 (parent C4): Modelo de página: `id`, `userId`, `title`, `type` (`note` | `checklist`), `content` para nota, `items: [{id, text, done}]` para checklist.

## Done when

- `npm run dev` e `json-server` sobem o app seguindo o README, sem passo não documentado.
- Cadastro → login → criar nota → criar checklist → isolamento entre duas contas → logout funciona ponta a ponta.
- Nota e checklist persistem após recarregar; checklist permite marcar/desmarcar, adicionar e remover itens.
- `db.json` não está versionado; `db-exemplo.json` está versionado e serve de modelo.
- Layout utilizável em 320 px e 1440 px.

## Boundaries

Inclui apenas o MVP descrito no brief: auth simulada, páginas nota/checklist, isolamento por usuário, persistência local via JSON Server, README.

Não inclui: backend real, token/segurança de servidor, colaboração, exportação, busca, tags, anexos, rich text, dark mode.

- Touch point: `atividade-sdd/` — código existente do projeto front-end; owner: epic-mvp-anotacoes.

## References

- parent — `_bmad-output/initiative-app-anotacoes/initiative-app-anotacoes.md`, seção Requirements
- brief — `_bmad-output/brief-app-anotacoes/brief-app-anotacoes.md`

## Notes

- Decision: 2026-11-22 — Um único épico: escopo pequeno, um deploy local, sem fronteira de entrega separada. (Sofia, confirmado pelo usuário ao pedir fatiamento)
- Decision: 2026-11-22 — Story 1 é o tracer bullet (scaffold + base executável). (Sofia)
- Decision: 2026-11-22 — Story 6 "Varredura de refatoração" adicionada; escopo só limpeza de débitos aprovados, sem mudança de comportamento. (usuário)
