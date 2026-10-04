---
title: "Como distribuir trabalhos entre avaliadores sem conflito e sem sobrecarga"
resumo: As regras por trás do sorteio automático de avaliadores no Colloquium, plataforma de eventos científicos.
date: 2026-10-03
---

Em um congresso com centenas de trabalhos, distribuir cada um para um avaliador é uma tarefa chata e cheia de armadilhas. No Colloquium, a plataforma de eventos científicos que construo, essa distribuição pode ser feita à mão ou sorteada automaticamente. O difícil não é sortear: é sortear **bem**.

<figure><img src="/assets/blog/colloquium-avaliadores/painel-avaliador.jpg" alt="Painel do avaliador com trabalhos de demonstração" loading="lazy">
<figcaption>Painel do avaliador. Tela de demonstração, com trabalhos fictícios.</figcaption></figure>

## Regra 1: sem conflito de interesse

Um avaliador nunca pode receber um trabalho do qual participa. O sistema bloqueia quando ele é o autor, o orientador, um membro da banca ou um co-autor. A regra vale no sorteio e também na atribuição manual, e a tela só mostra os avaliadores elegíveis. A decisão final é sempre do servidor, nunca da tela.

## Regra 2: só quem entende do assunto

Cada trabalho pertence a um eixo temático, e só avaliadores cadastrados naquele eixo são candidatos. Se não houver nenhum elegível, o trabalho **não é sorteado de qualquer jeito**: ele fica na fila com o motivo explícito, para a organização resolver.

## Regra 3: carga equilibrada

O algoritmo escolhe primeiro os trabalhos mais restritos (com menos avaliadores possíveis) e entrega cada um ao avaliador com menos trabalhos naquele momento, somando todos os eixos. Depois, um passo de reequilíbrio move trabalhos entre avaliadores por cadeias de trocas, porque uma troca simples de cada vez às vezes trava numa distribuição ruim.

## Regra 4: nunca desfazer o que já foi feito

O sorteio não mexe em atribuição existente. Quem já avaliou continua responsável pelo trabalho em uma eventual reavaliação. Se o organizador mudar um avaliador à mão, o sistema respeita.

## Dois detalhes que evitam problemas

- **Pré-visualização antes de aplicar:** o sorteio dos pendentes mostra a proposta, o que foi pulado e a carga antes e depois. Só então o organizador confirma.
- **Revalidação na hora de gravar:** cada par é conferido de novo dentro de uma transação, porque o mundo pode ter mudado entre a pré-visualização e o clique.

Esse é o tipo de problema que parece pequeno e dá trabalho: o código para sortear cabe em uma tela, e o resto são as regras que garantem justiça e rastreabilidade.
