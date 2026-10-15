# EcoMix — Site institucional (nova identidade visual)

Esta versão redesenha a página inicial de acordo com a identidade visual EcoMix definida no manual: verde floresta `#073F32`, verde folha `#78C83D`, fundos claros, tipografia Lato, títulos de alto contraste, ícones lineares e composições editoriais.

## Conteúdo incluído
- `index.html`: nova página inicial com serviços, condomínios, empresas, modelo de parceria, documentação, processo, Eco News, perguntas frequentes e contato.
- `styles.css`: CSS completo de base e a nova camada visual; os estilos das páginas Eco News foram preservados e alinhados à marca.
- `script.js`: menu mobile, revelação suave de conteúdo, formulário via WhatsApp e carrossel do Eco News.
- `ecomix-news.html` e `ecomix-news-artigo.html`: páginas existentes do Eco News, com ajustes de identidade/contato.
- `vercel.json`: rotas amigáveis para `/eco-news` e `/eco-news/:slug`.
- `assets/`: logo, foto enviada dos pontos de coleta, simulação ilustrativa do ponto no condomínio, favicon, placeholder do Eco News e apresentação comercial em PDF.
- `EcoMix_Brand_Tokens.json` e `EcoMix_Design_Tokens.css`: referência para manter as cores e estilos em novas peças.

## Contatos usados
- WhatsApp/telefone: (11) 95195-2545
- E-mail: comercial@ecomixgestaoambiental.com.br
- Instagram: @ecomixgestaoambiental
- Site: https://ecomixgestaoambiental.com.br

## Publicação na Vercel
1. Faça uma cópia/backup do projeto atual.
2. Envie o conteúdo desta pasta para o repositório do site, mantendo o diretório `assets/`.
3. Mantenha as funções/rotas atuais de `/api/news` e `/api/image` se já estiverem configuradas no projeto. Os arquivos dessas APIs não vieram no material anexado para esta atualização; o front-end mantém as chamadas e mostra um fallback amigável se o feed não responder.
4. Confira o domínio e teste: página inicial, `/eco-news`, abertura de uma notícia, formulário/WhatsApp, links de e-mail e Instagram.

## Publicação na Umbler
Envie os arquivos públicos para a raiz do site (ou diretório público configurado pela hospedagem), preservando a estrutura de pastas. A regra de rotas amigáveis em `vercel.json` só funciona na Vercel; para usar `/eco-news` sem `.html` na Umbler, configure regras equivalentes no servidor. Os endpoints `/api/news` e `/api/image` também precisam continuar acessíveis nessa hospedagem.

## Transparência das imagens
- `ponto-de-coleta-ecomix.jpg` é a foto enviada dos pontos de coleta reais.
- `simulacao-caixas-condominio.jpg` é uma simulação de ambiente gerada com IA e está identificada no site como ilustração de referência, não como registro de uma instalação real.

## Observações comerciais
O site comunica os diferenciais confirmados para a EcoMix: cobrança pela logística/operacionalização da coleta, destinação de 50% do valor obtido com materiais coletados a cooperativas e ONGs, opção de produtos de limpeza quando solicitada e prevista na proposta e emissão de MTR/CDF quando aplicável. Frequência, acesso e condições de atendimento são alinhados conforme cada local.
