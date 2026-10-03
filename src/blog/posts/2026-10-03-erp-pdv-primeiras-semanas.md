---
title: Começando um ERP + PDV que não para quando a internet cai
resumo: O que já funciona nas primeiras semanas do meu projeto de ERP e frente de caixa offline-first para supermercados, e o que ainda falta.
date: 2026-10-03
---

Em supermercado, o caixa não pode esperar a internet voltar. Esse é o ponto de partida do projeto que estou construindo: um **ERP com frente de caixa (PDV) offline-first**. O projeto é novo, e este texto é um retrato honesto de onde ele está hoje.

## A ideia central

O PDV é um aplicativo de desktop (Electron + Vue) com banco local em SQLite. Toda venda é gravada primeiro no próprio caixa e só depois enviada para a nuvem. Se a conexão cair, a fila de envio espera, e a venda continua normalmente.

Para isso funcionar sem perder nem duplicar venda, três decisões pesam mais que as demais:

- **Fila de eventos imutável**, com hash encadeado: cada venda aponta para a anterior, então qualquer buraco ou adulteração aparece.
- **Envio idempotente**: se a resposta se perde depois que o servidor já gravou, reenviar não duplica nada.
- **Catálogo sincronizado em páginas** da nuvem para o caixa, com verificação de integridade, para o caixa vender com o preço certo mesmo desconectado.

Um teste de sincronização com 300 vendas e cerca de 45% de falhas de rede (inclusive respostas perdidas) terminou sem perda e sem duplicidade.

## O que já existe

Na retaguarda web (Laravel + Vue): cadastro de produtos e preços por loja, lojas, usuários com perfis e alçadas, estoque com transferência entre lojas, abertura e fechamento de caixa, promoções com vigência, relatórios e um painel de saúde dos caixas.

No PDV: leitura de código de barras, venda por quantidade e peso, pagamento em dinheiro, PIX e cartão, desconto com autorização de supervisor, devolução e identificação do operador por PIN.

<figure><img src="/assets/blog/erp-pdv-primeiras-semanas/retaguarda-produtos.jpg" alt="Tela de produtos e preços da retaguarda, com produtos de demonstração" loading="lazy">
<figcaption>Retaguarda: cadastro de produtos e preços. Dados de demonstração.</figcaption></figure>

## O que ainda falta

A parte fiscal. A emissão de NFC-e e a contingência dependem de certificado digital, credenciamento e das regras do estado, e ainda estão em levantamento. Também faltam os testes com hardware real (impressora, balança, pinpad). Até lá, o projeto continua em desenvolvimento e não está pronto para uso em loja.

Nos próximos textos, quero mostrar o PDV vendendo sem internet e como a nuvem confere o que o caixa enviou.
