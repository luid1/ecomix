# EcoMix — Site institucional (nova identidade visual)

Versão atualizada do site EcoMix: mantém verde floresta `#073F32`, verde folha `#78C83D` e tipografia Lato, com títulos mais naturais, menos efeitos decorativos, melhor contraste no Eco News e recursos visuais ilustrativos identificados com clareza.

## Atualizações desta versão
- Troca da marca Eco News pela logo oficial enviada.
- Seção de frota/logística com veículo compacto tipo HR, identificada como ilustração.
- Simulação das caixas reais de referência em um ambiente ilustrativo de condomínio, sem cortar os compartimentos.
- Manchetes do Eco News com fundo claro e contraste reforçado.
- Tipografia Lato mais moderada e conteúdo visível mesmo sem animações.
- Link para baixar a apresentação comercial atualizada.

## Conteúdo incluído
- `index.html`: nova página inicial com serviços, condomínios, empresas, frota compacta tipo HR, modelo de parceria, documentação, processo, Eco News, perguntas frequentes, contato e link para a apresentação comercial atualizada.
- `styles.css`: CSS completo de base e a nova camada visual; os estilos das páginas Eco News foram preservados e alinhados à marca.
- `script.js`: menu mobile, revelação suave de conteúdo, formulário via WhatsApp e carrossel do Eco News.
- `ecomix-news.html` e `ecomix-news-artigo.html`: páginas do Eco News, com tipografia mais natural, melhor contraste e o logo oficial enviado.
- `vercel.json`: rotas amigáveis para `/eco-news` e `/eco-news/:slug`.
- `assets/`: logos, foto de referência dos pontos de coleta, simulação das caixas em um ambiente de condomínio, imagem ilustrativa de veículo compacto tipo HR, favicons, placeholder do Eco News e apresentação comercial em PDF.
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
- `ponto-de-coleta-ecomix.jpg` é a foto de referência enviada dos pontos de coleta.
- `simulacao-caixas-condominio.jpg` usa a foto das caixas fornecida como primeiro plano, composta sobre um ambiente ilustrativo de condomínio; o site deixa claro que o local e o posicionamento são uma simulação.
- `frota-hr-ecomix-ilustrativa.jpg` é uma ilustração de veículo compacto tipo HR com visual EcoMix; não é uma fotografia oficial da frota. Troque por uma foto real da empresa quando estiver disponível.

## Observações comerciais
O site comunica os diferenciais confirmados para a EcoMix: cobrança pela logística/operacionalização da coleta, destinação de 50% do valor obtido com materiais coletados a cooperativas e ONGs, opção de produtos de limpeza quando solicitada e prevista na proposta e emissão de MTR/CDF quando aplicável. Frequência, acesso e condições de atendimento são alinhados conforme cada local.
