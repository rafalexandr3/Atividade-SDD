# Atividade SDD - App de Anotações

MVP acadêmico de app de anotações (estilo Notion simplificado), com React + Vite, axios e JSON Server.

## Requisitos

- Node.js (versão LTS recomendada)
- npm

## Configuração inicial

1. Entre na pasta do projeto:

```bash
cd atividade-sdd
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo de banco local a partir do exemplo:

```bash
# Windows (PowerShell)
Copy-Item db-exemplo.json db.json

# Linux/macOS
cp db-exemplo.json db.json
```

> O arquivo `db.json` é o banco local usado pelo JSON Server e **não deve ser versionado**. O arquivo `db-exemplo.json` é o modelo/seed versionado.

## Execução

Em dois terminais separados (dentro de `atividade-sdd`):

1. Suba a API mock (JSON Server):

```bash
npm run server
```

API disponível em `http://localhost:3001` (recursos: `/users`, `/pages`).

2. Suba o front-end (Vite):

```bash
npm run dev
```

Acesse a URL exibida pelo Vite (normalmente `http://localhost:5173`).

## Scripts

- `npm run dev` — inicia o front-end com Vite.
- `npm run server` — inicia o JSON Server observando `db.json` na porta `3001`.
- `npm run build` — gera build de produção.
- `npm run preview` — pré-visualiza o build.
- `npm run lint` — executa o Oxlint.

## Estrutura de dados (`db-exemplo.json`)

- `users`: `{ id, name, email, password }`
- `pages`: páginas do usuário
  - Nota: `{ id, userId, title, type: "note", content }`
  - Checklist: `{ id, userId, title, type: "checklist", items: [{ id, text, done }] }`
