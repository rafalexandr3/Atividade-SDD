# Review — leitor novo (brief-app-anotacoes)

**Veredito:** o brief é honesto, bem escopado e passa no teste do sumário executivo — em três parágrafos eu sei o que é, para quem é e por que existe. Mas ele descreve o *produto* e não o *artefato executável*: como avaliador, eu não conseguiria rodar nem verificar o critério central (isolamento por usuário) sem perguntar coisas. Falta uma camada curta de contrato técnico.

## Teste do sumário executivo

- **O que é:** sim, com precisão incomum ("app web de anotações no estilo Notion, deliberadamente simplificado", com os limites enumerados).
- **Para quem:** sim — usuário fictício + avaliador acadêmico declarados sem rodeio.
- **Por que agora:** parcial. Diz "projeto acadêmico", mas não há prazo, disciplina, entrega ou motivo de timing. Para um MVP acadêmico isso é aceitável, mas "por que agora" fica como "porque é o trabalho".

Não é preciso reescrever o sumário; o que falta está depois dele.

## Gaps, por prioridade

### Crítico

1. **Não há especificação de execução e dados.** O critério "sobe com `npm run dev` e `json-server` apontando para o arquivo de dados, sem passos não documentados" é justamente o que o documento não documenta: qual arquivo (`db.json`?), qual porta, quais scripts no `package.json`, qual versão do json-server (`--watch`/v0 vs v1 mudam a CLI), se há seed de usuários. **Correção:** seção curta "Como rodar e dados" com nome do arquivo, porta da API, porta do Vite, scripts e um exemplo mínimo de `db.json` (ou link para ele no repo).

2. **Mecanismo de sessão e de isolamento indefinido.** O brief afirma duas vezes que "o vínculo da página com o usuário garante o isolamento", mas não diz *como*: o que é gravado no login (id do usuário? localStorage? sessionStorage?), se o `userId` vai nas páginas, se a listagem filtra no cliente ou via query no json-server, e o que o logout apaga. Sem isso não dá para saber se o critério de sucesso 5 é verificável ou só aspiracional. **Correção:** um parágrafo "contrato de autenticação e isolamento" com o que é persistido, como o filtro é feito e o que o logout limpa.

3. **Modelo de dados da página não existe no documento.** Nenhum campo é nomeado: `id`, `userId`, `title`, `type`, e o corpo — `content` (texto) para nota, `items` (array de `{text, done}`) para checklist? Além disso, o escopo diz "editar" mas só menciona "marcar e desmarcar itens": pode adicionar/remover itens de checklist depois de criada? Isso muda o tamanho do MVP. **Correção:** lista de campos por tipo + frase explícita sobre adicionar/remover itens de checklist na v1.

### Alto

4. **Dependências e roteamento ausentes.** "App de página única, com duas telas" implica rotas, mas React Router não aparece na stack nem no escopo; nenhuma versão de Node/React é citada. O avaliador não sabe se há mais uma dependência a instalar. **Correção:** uma linha de stack com versões principais e a decisão de roteamento (react-router ou estado local).

5. **Comportamentos de erro e validação não definidos.** E-mail duplicado no cadastro, senha errada, campos vazios, título em branco, confirmação ao excluir, sessão ao recarregar a página. Nada disso é dito, e são exatamente os pontos em que um avaliador testa. **Correção:** 4–6 bullets do comportamento esperado, ou uma linha dizendo quais ficam fora da v1.

### Médio

6. **Não há passos de verificação do isolamento.** O critério pede "duas contas distintas não enxergam as páginas uma da outra", mas não há roteiro reproduzível (ex.: criar conta A, nota, logout, criar conta B, conferir lista vazia). **Correção:** adicionar um roteiro de aceitação numerado de ~6 passos; serve de checklist para o avaliador.

7. **Persistência e limites implícitos não declarados.** Se a sessão fica no navegador e o json-server é compartilhado, dois navegadores/abas se comportam de forma previsível? Dados em arquivo local sobrevivem a restart? Vale uma frase de "limitações conhecidas", que reforça a honestidade que o resto do brief já tem.

### Baixo

8. **"Responsivo o suficiente" é vago.** Um breakpoint ou uma frase ("funcional em 375px e 1280px, sem polimento visual") fecha a lacuna.
9. **"Menos de um minuto"** aparece em *Who it serves* como meta do usuário, mas não nos critérios de sucesso. Ou sobe para critério, ou sai.
10. **"Por que agora"** poderia ganhar meia frase de contexto (disciplina/prazo), se existir.

## O que está bom e não deve ser mexido

- A recusa explícita a inventar demanda de mercado e a alegar vantagem competitiva. Isso é raro e é o ponto mais forte do documento.
- Escopo "fora da v1" enumerado de forma concreta, incluindo autenticação real — evita que o avaliador cobre o que não foi prometido.
- Critérios de sucesso no formato de fluxo percorrível, não de métricas falsas.

## Resumo

Documento pronto para comunicar a ideia; não pronto para alguém executar ou avaliar sem conversar com o autor. Resolver os itens 1–3 o torna autossuficiente.
