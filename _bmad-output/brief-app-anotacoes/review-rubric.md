# Review — brief-app-anotacoes

**Verdict:** This is an honest, well-scoped academic brief that does the one thing briefs usually fail at — it refuses to invent a market, a moat or a metric — and it fits the 1–2 page limit, so it is fit to hand to the professor as is. The remaining fixes are small: two checkable-sounding clauses are not actually checkable, one persona target is stated but never measured, and the Solution section drifts into implementation detail.

## The three fixes that matter most

1. **Make the responsive clause and the session model verifiable** (Scope, Success criteria): "responsivo o suficiente" and "sessão no front-end" are the only two items an evaluator could argue about. Name a concrete check and where the session state lives.
2. **Resolve the "menos de um minuto" target** (Who it serves ↔ Success criteria): a persona-level success definition that never appears in the criteria reads as an invented metric. Either add it as a timed check or drop the number.
3. **Answer "why now" and name the reader in the Executive summary** (Executive summary): the template's `Done when` asks for what it is, who it is for and why it matters now; the summary covers the first two and leaves the third implicit.

## Dimension ratings

| Dimension | Rating | Note |
|---|---|---|
| Decision-ready | adequate | One thesis (small, honest academic MVP) holds throughout; no contradictory scope. Omitting `The ask` and `Vision` is a sound trade-off, but the reason lives only in the memlog. |
| Earned | strong | No persona theater, no boilerplate NFRs, no generic vision. The persona is *declared* fictitious rather than dressed up. |
| Testable | adequate | Success criteria are behavioral and demonstrable; two scope/session phrases are vague (see findings). |
| Honest scope | strong | Non-goals are explicit and specific (no token, no real backend, no sharing). The academic framing is stated four times, unprompted. |
| Usable downstream | adequate | Terms are consistent enough for a PRD to follow; no requirement ids, which is correct at brief altitude but means the PRD must mint them. |
| Template `Done when` | adequate | Executive summary stands alone on *what* and *who*; *why now* is the gap. All other sections meet their `Done when` lines or honestly declare why the bar does not apply. |

## Findings

### Critical

None. The document invents no market size, no moat, no quote and no adoption metric; the one number it contains ("menos de um minuto") is a design target, not a market claim.

### High

**H1 — The Executive summary never says why *now*.** Location: Executive summary, ¶1–3. The summary explains what the app is, that the audience is fictional, and how success is judged, but a reader who reads nothing else cannot say why this should exist this semester rather than next year. Fix: add one sentence to ¶2 naming the delivery context ("entrega de uma atividade acadêmica com prazo de disciplina") — or, if the user prefers not to put a date in, state plainly that there is no market timing and the only deadline is the course calendar. Do not invent a date.

### Medium

**M1 — "Responsivo o suficiente" is not checkable.** Location: Scope, "Dentro da v1". `Suficiente` is exactly the vague adjective the rubric flags: two evaluators could disagree after using the same build. Fix: replace with a check — "utilizável a 375 px de largura, sem rolagem horizontal e com criação de item acessível por toque" — or move responsiveness out of v1 if the user will not commit to that bar.

**M2 — "Sessão no front-end" is an undefined mechanism inside a success criterion.** Location: Scope ("sessão no front-end") and Success criteria (last bullet, "o logout encerra a sessão"). The reader can test logout behavior, but not *how* the session is held, and the Solution never says whether it is `localStorage`, React state, or a flag in the mock — which matters because "sessão" and "login simulado sobre registros de usuário" sit uneasily together. Fix: one clause in Solution ("a sessão é um registro de usuário ativo guardado em `localStorage`, sem token") so the criterion and the scope line describe the same thing.

**M3 — The persona's "menos de um minuto" success target appears nowhere in Success criteria.** Location: Who it serves, ¶1 (last sentence). As written it is a specific number attached to an admitted fictional persona, which is the one place a reviewer could read an invented metric. Fix: either add a timed criterion ("uma pessoa que nunca viu o app cria uma nota e um checklist em menos de um minuto, sem instruções") or delete the number and keep "encontrá-las intactas e visíveis apenas na própria conta", which is already checkable.

**M4 — Solution's third paragraph is implementation-first, and the Executive summary repeats it.** Location: Solution ¶3; Executive summary ¶1. The template asks Solution to answer "what changes for the person", not which packages are installed; the stack sentence (React, Vite, axios, JSON Server) is legitimate at academic stakes but belongs at the end of the section or in Scope as a delivery constraint, not as the closing note of the solution story. Fix: keep ¶1–2 as the experience, compress ¶3 to one sentence naming the stack as the constraint the course imposes, and drop the duplicate stack sentence from the Executive summary.

**M5 — "What makes it different" is honest but structurally empty, and it repeats a disclaimer already made twice.** Location: What makes it different, ¶1; compare Problem ¶1 and Executive summary ¶2. Saying "no advantage, and the brief does not claim one" is the right call, but the section then has nothing to give its reader, and the same admission appears three times. Fix: keep one sentence of the disclaimer and use the rest to state the difference for the *actual* reader — a scope small enough to be explained and graded end to end — so the section answers "why this over the alternative" in the only register that is true here. No need to add length; swap sentences rather than append.

### Low

**L1 — The "sem passos não documentados" criterion assumes documentation the brief does not name.** Location: Success criteria, first bullet. The brief cannot itself promise a README that nobody has written. Fix: add "README com os dois comandos" to "Dentro da v1", then the criterion points at a real artifact.

**L2 — Gender inconsistency for *checklist*.** Location: Who it serves ¶1 ("uma checklist") vs. the rest of the document (no article elsewhere; "um checklist" would be the standard form). Fix: use "um checklist" or avoid the article: "criar uma nota e um checklist".

**L3 — "app web de página única" collides with the product's own "páginas".** Location: Solution ¶1. A reader meets "página única" (SPA) in the same document that calls notes "páginas", which invites a false reading that the app has one note. Fix: "uma aplicação de página única (SPA), com duas telas centrais…" or simply "um app web com duas telas centrais".

**L4 — English loanword in the Portuguese body.** Location: Problem ¶2 ("seria overclaim"). Fix: "seria exagero" or "seria alegar mais do que o projeto entrega". Other loans (app, brief, checklist, logout, mock, dark mode) are either template terms or standard in the domain and should stay.

**L5 — Omitting `The ask` and `Vision` is correct but only justified in the memlog.** Location: document structure; `.memlog.md` line 15. The brief's reader sees two absent optional sections and no reason. Fix: not a new section — one clause in the Executive summary or Scope ("não há pedido de recursos nem visão de longo prazo: o escopo termina no MVP entregue") is enough. Optional at these stakes; the memlog decision is sound.

**L6 — No stable ids on success criteria or scope items.** Location: Success criteria; Scope. Correct for a brief, but the PRD will cite these and must re-mint them. Fix: defer to the PRD (do not add ids here); noted so the next level does not lose the mapping.

## What holds up

- The academic nature is stated honestly and repeatedly (Executive summary, Problem, What makes it different, Who it serves), and the "problem" is correctly located in the author's delivery obligation rather than faked as user demand.
- Non-goals are sharper than most launch briefs: token auth, real backend, sharing, search, tags, attachments, rich text, dark mode, all named.
- The evaluator is treated as a real secondary user with a real job ("clonar ou abrir o projeto, subir front-end e mock, verificar o fluxo"), which is what makes the success criteria credible.
- Length (~700 words, 71 lines) sits comfortably inside the 1–2 page guidance; no section is padding.
