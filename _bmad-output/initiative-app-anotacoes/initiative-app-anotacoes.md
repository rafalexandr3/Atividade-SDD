---
tracker_id: ""
type: initiative
title: "App de anotações simplificado: um usuário autentica, cria notas e checklists e vê apenas o próprio conteúdo"
sources:
  - "_bmad-output/brief-app-anotacoes/brief-app-anotacoes.md"
companions: []
status: in-progress
risk: medium
---

# App de anotações simplificado: um usuário autentica, cria notas e checklists e vê apenas o próprio conteúdo

## Description

Iniciativa acadêmica de MVP: entregar um app web de anotações, estilo Notion simplificado, em que uma pessoa se cadastra, entra, cria páginas do tipo nota ou checklist e enxerga apenas as próprias páginas. A fonte de requisitos é o brief de produto final em `_bmad-output/brief-app-anotacoes/brief-app-anotacoes.md`. O valor está na entrega funcional e demonstrável do fluxo completo — front-end React + Vite consumindo um JSON Server local via axios — dentro do escopo de disciplina.

## Outcome

O avaliador do trabalho consegue rodar o projeto localmente, percorrer o fluxo completo (cadastro, login, criação de nota e checklist, isolamento entre contas e logout) e verificar que os dados persistem localmente no arquivo `db.json`, sem passos não documentados.

## Requirements

R1 (Brief/Success criteria, Scope): O sistema permite cadastrar um usuário com credenciais e autenticar com credenciais já cadastradas; credenciais inválidas não concedem acesso à área de páginas.
R2 (Brief/Solution, Scope): Ao autenticar, a sessão registra em `localStorage` o identificador do usuário logado; ao sair (logout), a sessão é removida e a área de páginas fica inacessível até novo login.
R3 (Brief/Solution): Um usuário autenticado pode criar, listar, abrir, editar e excluir suas próprias páginas.
R4 (Brief/Solution): Uma página do tipo `note` possui `title` e `content` (texto livre) e pode ser salva e reaberta com seu conteúdo preservado.
R5 (Brief/Solution, Open questions): Uma página do tipo `checklist` possui `title` e `items`, onde cada item tem `id`, `text` e `done`; itens podem ser marcados/desmarcados, adicionados e removidos após a criação, com persistência do estado.
R6 (Brief/Success criteria): O isolamento por usuário é garantido: páginas são associadas a `userId` e uma conta não vê, edita nem exclui páginas de outra conta.
R7 (Brief/Success criteria, Open questions): O projeto executa localmente com `npm run dev` (Vite) e `json-server`; o repositório contém `db-exemplo.json` versionado como modelo/seed, e o `db.json` real fica na raiz, é usado pelo JSON Server e não é versionado; os passos de execução estão documentados no README.
R8 (Brief/Scope): A interface é utilizável em larguras de 320 px a 1440 px.

## Constraints

C1 (Brief/Scope, decisão): Stack fixa — React + Vite no front-end, axios para HTTP, JSON Server como API mockada local. Sem backend real.
C2 (Brief/Scope, decisão): Autenticação simulada, sem token e sem verificação de segurança no servidor; o isolamento é aplicado no front-end por filtro de `userId`.
C3 (Brief/Scope): Fora da v1: compartilhamento/colaboração, exportação, busca, tags/categorias, anexos/imagens, editor de texto rico, dark mode, autenticação com token.
C4 (Brief/Solution): Modelo de dados de página: `id`, `userId`, `title`, `type` (`note` | `checklist`), `content` para nota, `items: [{id, text, done}]` para checklist.

## Done when

- Um avaliador consegue subir o projeto seguindo o README (`npm run dev` e `json-server`) e percorrer cadastro → login → criar nota → criar checklist → confirmar isolamento entre duas contas → logout.
- Uma nota criada é reaberta com título e conteúdo preservados.
- Uma checklist criada permite marcar/desmarcar, adicionar e remover itens, e o estado persiste após recarregar.
- Uma conta não enxerga páginas de outra conta na interface.
- O `db.json` usado em execução local não está versionado; `db-exemplo.json` está versionado.

## Boundaries

O que é: um MVP front-end acadêmico, de uso local, com persistência em arquivo JSON via JSON Server.

O que não é: produto de mercado, serviço multiusuário real, backend com autenticação/segurança, editor rico ou ferramenta colaborativa.

- Tracer path: scaffold React+Vite+JSON Server → cadastro/login/sessão → listagem e CRUD de páginas por usuário → editor de nota → editor de checklist → verificação de isolamento e README.

## References

- brief — `_bmad-output/brief-app-anotacoes/brief-app-anotacoes.md`, fonte completa (Executive summary, Problem, Solution, Success criteria, Scope, Open questions).

## Notes

- Assumption: Porta do JSON Server e nomes de scripts npm além de `dev`/`server` serão fixados na implementação e documentados no README; porta padrão 3001 é aceitável.
- Assumption: "Persistência localmente" é atendida pelo `db.json` em arquivo local consumido pelo JSON Server; não há banco remoto.
- Decision: 2026-11-22 — `db.json` na raiz e ignorado pelo git; `db-exemplo.json` versionado como modelo/seed. (usuário)
- Decision: 2026-11-22 — Itens de checklist podem ser adicionados e removidos após a criação. (usuário)
- Decision: 2026-11-22 — Modelo de página confirmado: `id, userId, title, type(note|checklist), content` para nota, `items[{id,text,done}]` para checklist. (usuário)
