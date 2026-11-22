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

## Credenciais de exemplo

O seed já traz uma conta pronta:

- **E-mail:** `usuario@exemplo.com`
- **Senha:** `123456`

Também é possível criar outras contas em `/cadastro` — saia da conta atual antes, pois a tela de cadastro só aparece para quem não está autenticado. Cada conta vê apenas as próprias páginas.

## Execução

Opção rápida, com API e front-end juntos:

```bash
npm start
```

Ou em dois terminais separados (dentro de `atividade-sdd`):

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
- `npm run api` — alias de `npm run server`.
- `npm start` — sobe API e front-end juntos.
- `npm test` — executa os testes com Vitest (modo watch).
- `npm test -- --run` — executa os testes uma vez e encerra.
- `npm run build` — gera build de produção.
- `npm run preview` — pré-visualiza o build.
- `npm run lint` — executa o Oxlint.

## Estrutura de dados (`db-exemplo.json`)

- `users`: `{ id, name, email, password }`
- `pages`: páginas do usuário
  - Nota: `{ id, userId, title, type: "note", content }`
  - Checklist: `{ id, userId, title, type: "checklist", items: [{ id, text, done }] }`

## Isolamento por usuário

- A lista chama `GET /pages?userId=<id da sessão>` e ainda filtra a resposta no cliente pelo `userId`, como defesa extra.
- Abrir uma página de outra conta (ou de id inexistente) mostra “Página não encontrada”, sem exibir conteúdo.
- Editar e excluir também conferem a posse da página antes de enviar a requisição.

## Validação de ponta a ponta

Execute na ordem, com `db.json` recém-copiado do seed:

1. `npm start` e abra a URL do Vite.
2. Entre com `usuario@exemplo.com` / `123456`.
3. Confirme que a lista mostra a nota e a checklist de exemplo.
4. Crie uma nota, salve, recarregue a página e confirme que o conteúdo persistiu.
5. Crie uma checklist, adicione itens, marque/desmarque, remova um item, salve e recarregue.
6. Clique em “Sair” e cadastre uma segunda conta em `/cadastro` (ex.: `outra@exemplo.com` / `123456`).
7. Ainda na segunda conta, confirme que a lista está vazia; abra a URL do Vite seguida de `/paginas/1` (por exemplo, `http://localhost:5173/paginas/1`, usando a porta que o Vite exibiu) e valide “Página não encontrada”.
8. Saia, entre novamente na primeira conta e confirme que as páginas continuam intactas.
9. Clique em “Sair” e confirme que a área de páginas fica inacessível até novo login.
10. Redimensione a janela para 320 px e para 1440 px e confirme que não há rolagem horizontal e que os controles continuam acessíveis.
11. Rode `npm test -- --run`, `npm run lint` e `npm run build`.
12. Confirme com `git status` que `db.json` não aparece como alteração versionada.

## Responsividade

A interface foi pensada para 320 px a 1440 px: o cabeçalho quebra linha, as ações da lista ocupam a largura disponível em telas estreitas, os itens de checklist empilham o campo de adição e os títulos longos quebram com `overflow-wrap: anywhere`.

## Solução de problemas

- **“Não foi possível conectar ao servidor”** — confirme que o JSON Server está rodando em `http://localhost:3001`.
- **Erro ao iniciar a API** — verifique se `db.json` existe; se não, copie de `db-exemplo.json`.
- **404 em `/users` ou `/pages`** — o `db.json` existe, mas não tem o seed do app. Rode `Copy-Item db-exemplo.json db.json` (ou `cp`) e reinicie a API.
- **Porta 3001 ocupada** — encerre o processo que a usa. Se precisar trocar a porta, ajuste `server` **e** `api` no `package.json` e defina `VITE_API_URL` (por exemplo, `VITE_API_URL=http://localhost:3002`) em um arquivo `.env.local`, porque o cliente usa `http://localhost:3001` por padrão.
