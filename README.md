# Site pessoal — portfólio e blog

Site estático (Eleventy) publicado no GitHub Pages. Repositório **público**: nunca coloque aqui segredos,
dados de clientes ou qualquer referência a local de trabalho. Regras completas em
`instagram-portfolio/README.md` (projeto irmão).

## Comandos

```bash
npm install
npm run dev     # servidor local com recarga (http://localhost:8080)
npm run build   # gera _site/
```

## Onde editar

| O quê | Arquivo |
|---|---|
| Projetos do portfólio | `src/_data/projetos.json` |
| Textos globais, aviso do rodapé | `src/_data/site.json` |
| Novo artigo | `src/blog/posts/AAAA-MM-slug.md` (cabeçalho: title, resumo, date; `draft: true` esconde) |
| Visual | `src/assets/style.css` |

## Publicação

O push na `main` dispara `.github/workflows/pages.yml`, que faz o build e publica. O Pages deve estar com
"Source: GitHub Actions".

## Domínio próprio (a configurar depois da compra)

1. Criar `src/CNAME` com o domínio (uma linha, ex.: `gervasioteixeira.com.br`).
2. Cloudflare: DNS apontando para o GitHub Pages (registros A 185.199.108-111.153 e CNAME www →
   gervasioteixeira.github.io), com proxy desligado até o certificado ser emitido.
3. GitHub → Settings → Pages → Custom domain + Enforce HTTPS.
4. Registro.br: trocar os servidores DNS para os da Cloudflare.
5. Atualizar `url` em `src/_data/site.json`.

## Regras de conteúdo

Sem tribunal, cargo ou local de trabalho. Sem "cliente", "contrate", preço, orçamento ou anúncios.
Telas e exemplos sempre com dados fictícios. Contato apenas por e-mail pessoal ou Instagram.

## Imagens e vídeos nos artigos

Coloque os arquivos em `src/assets/blog/<slug-do-artigo>/` (imagens em WebP/PNG, vídeos curtos em MP4 H.264,
até ~10 MB, `muted loop playsinline` para demonstrações). No Markdown:

```html
<figure><img src="/assets/blog/pdv-offline/tela-venda.webp" alt="Tela de venda do PDV" loading="lazy">
<figcaption>Tela de venda (dados de demonstração).</figcaption></figure>
<video src="/assets/blog/pdv-offline/offline.mp4" controls muted playsinline></video>
```

**Regra inegociável:** toda captura e vídeo usa dados fictícios (nomes, CPFs, valores, processos, lojas). Antes de
publicar, revise a imagem inteira, inclusive barra de abas, URLs, notificações e miniaturas.
