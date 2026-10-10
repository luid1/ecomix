# EcoMix — Eco News / Vercel

Versão corrigida do portal Eco News.

## Correções desta versão
- API Node.js em CommonJS, compatível com função `/api/news.js` da Vercel.
- Endpoint de imagem `/api/image.js` para exibir a imagem principal quando a publicação permite acesso técnico à imagem.
- Página de matéria abre usando a URL original da notícia, evitando perda de identificação por ID.
- UTF-8 preservado no RSS e no HTML.
- Fallback local para imagens e para a matéria principal.
- Layout da matéria responsivo, sem rolagem horizontal.
- Cabeçalho Eco News permanece visível dentro da matéria.

## Deploy
Envie o conteúdo desta pasta para o projeto da Vercel e faça um novo Deploy.
Não altere os registros MX do e-mail da Umbler.
