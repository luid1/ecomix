# EcoMix Gestão Ambiental — Vercel

Versão preparada para hospedagem na Vercel, com o Eco News funcionando por uma Vercel Function em `api/news.js`.

## O que foi corrigido nesta versão

- Codificação UTF-8 corrigida para títulos, descrições e caracteres acentuados.
- O HTML escapado vindo dos feeds agora é convertido para texto antes de aparecer na página.
- O agregador tenta descobrir a imagem principal de cada matéria por `og:image`, Twitter Card, JSON-LD e imagem principal do artigo.
- A página individual da notícia mantém a identidade **Eco News**.
- Layout da matéria refeito para celular, sem rolagem horizontal.
- Título, foto, resumo e fonte se ajustam corretamente em telas pequenas.
- Se uma imagem externa falhar no navegador, existe uma imagem local de segurança para não deixar o espaço vazio.
- A fonte original continua indicada e o botão para a publicação original permanece no final.
- O Eco News continua integrado à página inicial da EcoMix.

## Publicação

1. Importe o projeto na Vercel.
2. Não é necessário configurar build command para este site.
3. Faça o Deploy.
4. Em **Settings → Domains**, adicione `ecomixgestaoambiental.com.br`.
5. No Registro.br, mantenha o DNS apontado conforme a configuração da Vercel.
6. **Não remova os registros MX/TXT da Umbler**, pois eles são usados pelo e-mail.

## Observação sobre imagens

O sistema tenta usar a imagem principal disponibilizada pela publicação original. A disponibilidade técnica da imagem não significa, por si só, autorização para reutilização comercial. Para produção, use imagens cuja licença/permissão de uso esteja adequada ou mantenha apenas o link para a publicação original.
