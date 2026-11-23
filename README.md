## Projeto e integrantes
Tema, problema que ele resolve e nomes dos integrantes.
"Notion" (MUITO) simplificado. Possuir anotações e checklists de forma simplificada.

- 01252072 Igor Alexsandro Félix Cardoso
- 01252109 Paulo Gonçalves de Jesus
- 01252060 Rafael Alexandre Da Silva
- 01252117 Ronijamilly de Souza Lima
- 01252058 Victor Rafael Lourenço Oliveira
- 01252087 Vinicius de Santana Gama

## Framework utilizado
BMAD, escolhemos ele pois ele possui diferentes agentes para cada etapa do desenvolvimento e como possuiamos apenas uma ideia vaga para o que iriamos desenvolver, achamos interessente utilizar agentes que nos ajudassem a decidir por qual caminho seguir e como.

## Como rodar
- Clone o repositório
- Rode os seguintes comandos no terminal na raiz do projeto
  - cd atividade-sdd
  - npm install
  - Windows (PowerShell) - Copy-Item db-exemplo.json db.json
  - Linux/macOS - cp db-exemplo.json db.json
  - npm start
- Para teste mockamos o usuário: usuario@exemplo.com / 123456

## Onde estão os artefatos
#### Tudo está em _bmad-output/.

- Spec: brief-app-anotacoes/brief-app-anotacoes.md e initiative-app-anotacoes/initiative-app-anotacoes.md
- Plano: initiative-app-anotacoes/tickets/epic-mvp-anotacoes/epic-mvp-anotacoes.md
- Tarefas: na pasta epic-mvp-anotacoes/tickets/, listadas no tickets.toml, com um *-plan.md para cada uma

#### Quem fez cada tarefa:

- 1.1 Scaffold do projeto: Victor Rafael
- 1.2 Cadastro e login: Ronijamilly de Souza
- 1.3 CRUD de notas: Paulo Gonçalves
- 1.4 Checklists: Rafael Alexandre
- 1.5 Isolamento por usuário e fechamento do MVP: Igor Alexsandro
- 1.6 Refatoração: Vinicius de Santana

#### A spec, o plano e o tickets.toml foram commitados por Victor Rafael.

## Reflexão
#### Que decisão o agente teria tomado sozinho e a spec evitou?
Acreditamos que a forma de autenticação. Sem ter deixado a decisão registrada, o agente tenderia a criar login com token (JWT) ou a instalar uma biblioteca de autenticação para o JSON Server que ele até chegou a comentar. O brief deixou explícito que a autenticação é simulada, sem token, com a sessão guardando o id do usuário no localStorage.

#### Que inconsistência a validação encontrou? Estava na spec ou no código?
- No código (história 1.3): a revisão do BMAD encontrou que o PATCH da edição de nota usava o :id da URL sem conferir se a página pertencia ao usuário logado. Ao navegar entre páginas, isso podia exibir dados antigos e salvar na página errada. A spec exigia checar a posse em abrir, editar e excluir, e o código não cumpria isso no salvamento. Foi corrigido.
- Na documentação/validação (história 1.5): o roteiro de teste com duas contas mandava cadastrar a segunda conta sem sair da primeira, mas a rota /cadastro redireciona quem já está logado. A porta da API documentada também não batia com os scripts, e um teste tinha uma asserção vazia, verificando um texto que a lista nem renderiza.

#### Como o framework ajudou (ou atrapalhou) a coordenação do grupo?

Ajudou porque o brief e as tasks do que o BMAD chamou de 'épico' (que seria uma grande entrega do projeto a ser feita), viraram a fonte de verdade, assim a gente não precisava ficar reafirmando para o agente. Cada integrante pegou uma história (1.1 a 1.6) e fez seu commit, e os registros em .memlog.md mostram cada decisão e mudança. Ninguém precisou combinar nada fora dos arquivos. O lado ruim é que o BMAD é pesado e acaba gerando muitos documentos, revisões e perguntas para um MVP pequeno. Além disso, as histórias dependiam umas das outras (auth → nota → checklist), o que forçou os commits a acontecerem em sequência, quase sem trabalho em paralelo.

#### O que fariam diferente com outro framework?
Nós queriamos testar o BMAD mas para um projeto com o escopo como o nosso, testaríamos o OpenSpec que é mais leve. Com ele, cada mudança vira uma proposta com specs, design e tarefas, o nosso MVP seria resolvido com menos documentos e menos "cerimônia" que no BMAD.