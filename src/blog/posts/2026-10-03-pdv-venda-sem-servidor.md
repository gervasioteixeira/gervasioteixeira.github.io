---
title: "Uma venda no PDV sem servidor: a fila local em ação"
resumo: Uma venda completa no meu PDV de demonstração, sem nuvem, e como o caixa guarda tudo para enviar depois.
date: 2026-10-03
---

No [artigo anterior](/blog/erp-pdv-primeiras-semanas/) contei a ideia: o caixa grava a venda primeiro no próprio computador e só depois envia para a nuvem. Aqui está uma venda de verdade no modo de demonstração, **sem nenhum servidor conectado**. O caixa, o operador e os produtos são fictícios.

<video src="/assets/blog/pdv-vendendo-sem-servidor/pdv-venda.mp4" controls muted playsinline preload="metadata" poster="/assets/blog/pdv-vendendo-sem-servidor/06-refri.jpg"></video>

## O que acontece

1. **Abertura do caixa:** o operador se identifica com código e PIN (verificados no próprio caixa, sem rede) e informa o fundo de troco.
2. **Leitura dos produtos:** o campo aceita o código de barras, `2*código` para quantidade e `0,350*código` para produtos pesáveis, como a banana.
3. **Pagamento:** dinheiro, PIX ou cartão, em uma ou mais formas. Aqui, R$ 100,00 em dinheiro para uma compra de R$ 57,06, com troco de R$ 42,94.

<figure><img src="/assets/blog/pdv-vendendo-sem-servidor/06-refri.jpg" alt="Tela de venda do PDV com quatro itens e total de R$ 57,06" loading="lazy">
<figcaption>Quatro itens lidos: arroz, feijão (2 unidades), banana (0,350 kg) e refrigerante. Total R$ 57,06.</figcaption></figure>

<figure><img src="/assets/blog/pdv-vendendo-sem-servidor/07-pagamento.jpg" alt="Tela de pagamento do PDV com opções de PIX, cartão e dinheiro" loading="lazy">
<figcaption>Pagamento em dinheiro, PIX ou cartão.</figcaption></figure>

## Onde está a parte "offline"

Olhe a barra superior: ela mostra **"1 a enviar à nuvem"** logo após abrir o caixa e **"2 a enviar à nuvem"** depois da venda. Cada evento (abertura, venda) entra numa fila local, com hash encadeado, e espera a sincronização. Sem servidor, a fila só cresce, e o caixa continua vendendo normalmente.

<figure><img src="/assets/blog/pdv-vendendo-sem-servidor/09-venda-concluida.jpg" alt="PDV após concluir a venda, mostrando troco e o contador de eventos a enviar" loading="lazy">
<figcaption>Venda concluída. O contador no topo mostra os eventos aguardando envio.</figcaption></figure>

Um detalhe para não confundir: o selo "Online" ao lado de "PDV" indica o **modo fiscal** (normal ou contingência), não a conexão de rede. Como a emissão de NFC-e ainda não está implementada, ele fica sempre "Online" nesta demonstração.

## O que vem depois

Quando a conexão volta, o caixa envia a fila em lotes assinados, e a nuvem confere a sequência e o hash de cada evento. Na próxima etapa quero mostrar essa conferência, incluindo o que acontece se a resposta do servidor se perde no meio do caminho.
