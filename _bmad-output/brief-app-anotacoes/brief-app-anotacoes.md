---
title: "App de Anotações Simples — Brief de Produto"
template: brief
version: 1.1.0
status: final
created: "2026-11-22"
updated: "2026-11-22"
---

# App de Anotações Simples — Brief de Produto

## Table of Contents

- [Executive summary](#executive-summary) — o que é, para quem, por que agora
- [Problem](#problem) — anotação rápida e privada; contexto acadêmico, sem demanda comprovada
- [Solution](#solution) — app web React + Vite + axios, login, notas e checklists por usuário
- [What makes it different](#what-makes-it-different) — escopo mínimo e foco; sem vantagem competitiva alegada
- [Who it serves](#who-it-serves) — usuário fictício que anota rápido; avaliador acadêmico
- [Success criteria](#success-criteria) — fluxo cadastro → login → criar → isolamento → logout
- [Scope](#scope) — o que entra e o que fica fora da v1
- [Open questions](#open-questions) — detalhes deixados para o PRD e os tickets

## Executive summary

Este brief descreve um aplicativo web de anotações no estilo Notion, deliberadamente simplificado: cadastro e login, páginas do tipo **nota** ou **checklist**, e cada usuário enxergando apenas as suas próprias páginas. Não há backend real, colaboração, compartilhamento, busca, tags, anexos, editor rico nem autenticação com token.

O público é fictício e o produto não nasce de uma demanda de mercado: é um **projeto acadêmico** cujo objetivo é entregar um MVP pequeno e funcional, demonstrando o fluxo completo de uma aplicação front-end com persistência simulada. O problema que ele trata é concreto e limitado: ter um lugar único e simples para registrar anotações e checklists rapidamente, sem o peso de ferramentas completas como o Notion.

Por que agora: o trabalho é uma entrega de disciplina, e o prazo e o escopo definidos por ela são o horizonte de decisão — não faz sentido planejar além do que o semestre e a avaliação comportam. Por isso o sucesso não se mede em adoção ou receita, e sim em completude: o avaliador consegue rodar o projeto e percorrer o fluxo completo (ver *Success criteria*), sem etapas quebradas.

## Problem

O problema principal é **acadêmico**: demonstrar, em um MVP enxuto, o domínio de uma stack front-end, de um fluxo de autenticação simulado e da persistência de dados por usuário. Quem sente esse "problema" é o próprio autor do trabalho, diante da necessidade de entregar algo funcional dentro de um escopo curto. Tratar isso como demanda de produto seria forçar a barra: o brief reconhece que o valor está na entrega e no aprendizado, não na conquista de usuários.

Não há evidência de uma dor de mercado a resolver aqui — e este brief não inventa uma. O cenário que dá ao MVP algo concreto para construir é pequeno: quem precisa registrar uma ideia ou uma lista de tarefas em segundos hoje recorre a ferramentas que exigem mais do que isso (Notion, com espaços, bancos de dados e blocos configuráveis) ou a meios sem estrutura (papel, bloco de notas do sistema), que não separam anotações por pessoa nem distinguem nota de checklist.

## Solution

Um app web de página única, com duas telas centrais: autenticação e área de páginas. Após cadastro e login, a pessoa vê a lista das suas páginas e pode criar, abrir, editar e excluir cada uma. Toda página tem um título e um tipo escolhido na criação — **nota**, com texto livre, ou **checklist**, com itens que podem ser marcados e desmarcados. O vínculo da página com o usuário é o que garante que cada conta enxergue apenas o seu conteúdo.

O resultado para quem usa é direto: um cadastro rápido, uma sessão simples e um lugar só para anotações e listas, sem menus, sem configuração e sem curva de aprendizado. A experiência é a de "abrir, escrever, marcar, fechar".

Tecnicamente, a aplicação roda com React + Vite no front-end, axios para as chamadas HTTP e JSON Server como API mockada e persistente em arquivo local. O login é simulado a partir dos registros de usuário — não há emissão nem validação de token, decisão que mantém o escopo compatível com um trabalho acadêmico e com a ausência de backend real. A sessão fica no front-end, em `localStorage`, guardando o identificador do usuário logado; é esse identificador que alimenta o filtro das páginas exibidas.

## What makes it different

Não há vantagem competitiva real, e o brief não a reivindica: frente a Notion, Google Keep ou papel, o app não oferece recurso que os concorrentes não tenham. A diferença é de **escopo e propósito**: enquanto as alternativas são produtos gerais, este é um exercício deliberadamente pequeno, com dois tipos de página e nenhuma configuração, cujo objetivo é ser compreensível de ponta a ponta e demonstrar um fluxo completo de autenticação e dados por usuário.

Para um usuário real, a razão de escolher seria apenas a simplicidade — abrir e anotar sem decidir estrutura. Para o contexto acadêmico, a razão é a clareza do escopo, que permite entregar, explicar e avaliar o MVP sem partes inacabadas.

## Who it serves

**Usuário primário (fictício):** uma pessoa que precisa registrar anotações e checklists rapidamente e que valoriza privacidade básica — cada um vê só o que é seu. Ela não quer aprender uma ferramenta; quer escrever e marcar itens. Sucesso, para ela, é conseguir criar uma nota e uma checklist, voltar depois e encontrá-las intactas e visíveis apenas na própria conta.

**Usuário secundário:** o avaliador do trabalho acadêmico, que precisa clonar ou abrir o projeto, subir front-end e mock, e verificar o fluxo completo sem instruções extensas.

## Success criteria

- O projeto sobe localmente com `npm run dev` (Vite) e `json-server` apontando para o arquivo de dados, com esses passos documentados no README.
- Uma pessoa consegue se cadastrar e entrar com as credenciais criadas.
- É possível criar, abrir, editar e excluir uma página do tipo **nota**.
- É possível criar, abrir, editar e excluir uma página do tipo **checklist**, marcando e desmarcando itens de forma persistente.
- Duas contas distintas não enxergam as páginas uma da outra — o isolamento por usuário é verificável na interface.
- O logout encerra a sessão e impede o acesso à área de páginas até novo login.

## Scope

**Dentro da v1:** cadastro e login simulados; sessão em `localStorage`; listagem de páginas do usuário; criação, edição e exclusão de páginas; dois tipos de página (nota e checklist); persistência via JSON Server com axios; layout utilizável em telas de 320 px a 1440 px.

**Fora da v1:** compartilhamento e colaboração; exportação; busca; tags ou categorização; anexos e imagens; editor de texto rico (negrito, títulos, blocos); dark mode; autenticação com token ou qualquer verificação real de segurança no servidor.

## Open questions

Detalhes deixados para o PRD e os tickets, por serem de implementação e não de produto:

- Nome do arquivo de dados, portas, scripts npm e usuários de exemplo (`db.json`).
- Modelo de dados das páginas: campos comuns (`id`, `userId`, `title`, `type`) e o formato do conteúdo de nota e de checklist.
- Se itens de checklist podem ser adicionados e removidos depois da criação da página.
