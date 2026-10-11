const crypto = require('crypto');
const FALLBACK = [
  {
    title: 'Menos de 5% das empresas cumprem lei de reciclagem de eletrônicos no Brasil, diz associação',
    url: 'https://c-level.folha.uol.com.br/economia-sustentavel/2026/10/menos-de-5-das-empresas-cumprem-lei-de-reciclagem-de-eletronicos-no-brasil-diz-associacao.shtml',
    description: 'Levantamento aponta baixa adesão empresarial à logística reversa de eletroeletrônicos e destaca o potencial de reaproveitamento de metais e outros materiais.',
    date: '2026-10-09T12:00:00-03:00',
    source: 'C-Level / Folha',
    image: 'https://f.i.uol.com.br/fotografia/2021/07/17/162653456360f2f2a38bdda_1626534563_3x2_md.jpg',
    imageCredit: 'Eduardo Knapp/Folhapress',
    category: 'RECICLAGEM'
  },
  {
    title: 'Ceará avança na logística reversa de resíduos têxteis pós-consumo',
    url: 'https://www.ce.gov.br/sema/2026/10/07/estado-do-ceara-avanca-na-logistica-reversa-de-residuos-texteis-pos-consumo/',
    description: 'Projeto amplia pontos de entrega voluntária e prevê coleta, triagem, reaproveitamento e reciclagem de resíduos têxteis pós-consumo.',
    date: '2026-10-07T09:28:00-03:00',
    source: 'Governo do Ceará / SEMA',
    image: '',
    category: 'LOGÍSTICA REVERSA'
  },
  {
    title: '57% das empresas industriais adotam técnicas de economia circular, revela pesquisa da CNI',
    url: 'https://www.rcnonline.com.br/economia/2026/10/2698205-57-das-empresas-industriais-adotam-tecnicas-de-economia-circular-revela-pesquisa-da-cni.html',
    description: 'Pesquisa da CNI mostra que a reciclagem é a prática de economia circular mais adotada entre as empresas industriais pesquisadas.',
    date: '2026-10-02T09:59:00-03:00',
    source: 'CNI / RCN Online',
    image: '',
    category: 'ECONOMIA CIRCULAR'
  },
  {
    title: 'Portaria cria Sistema Nacional de Logística Reversa integrado ao Sinir',
    url: 'https://www.gov.br/mma/pt-br/noticias-defeso-eleitoral/portaria-cria-sistema-nacional-de-logistica-reversa-integrado-ao-sinir',
    description: 'Novo sistema será usado para cadastro, reporte, monitoramento e rastreabilidade dos sistemas de logística reversa no Brasil.',
    date: '2026-09-22T15:44:00-03:00',
    source: 'Ministério do Meio Ambiente e Mudança do Clima',
    image: '',
    category: 'LOGÍSTICA REVERSA'
  },
  {
    title: 'Lei de Incentivo à Reciclagem fortalece cooperativa em São Paulo',
    url: 'https://envolverde.com.br/noticia/lei-de-incentivo-a-reciclagem-tem-um-de-seus-primeiros-projetos-em-execucao-pela-cooperativa-crescer-em-sao-paulo',
    description: 'Projeto amplia infraestrutura de coleta seletiva, triagem e processamento de recicláveis e prevê novos equipamentos para a operação da cooperativa.',
    date: '2026-06-18T12:00:00-03:00',
    source: 'Envolverde',
    image: '',
    category: 'RECICLAGEM'
  },
  {
    title: 'Praia Grande amplia rede de Ecopontos para materiais recicláveis',
    url: 'https://p-www2.praiagrande.sp.gov.br/noticia/eleicoes-ecopontos-nao-funcionarao-no-dia-4-de-outubro',
    description: 'A rede municipal reúne pontos para descarte de vidro, plástico, papel, metal, madeira, óleo de cozinha e outros materiais.',
    date: '2026-09-24T12:00:00-03:00',
    source: 'Prefeitura de Praia Grande',
    image: '',
    category: 'COLETA SELETIVA'
  }
];


const VERIFIED_IMAGES = {
  // Imagens verificadas diretamente nas páginas das respectivas matérias.
  'Menos de 5% das empresas cumprem lei de reciclagem de eletrônicos no Brasil, diz associação': 'https://f.i.uol.com.br/fotografia/2021/07/17/162653456360f2f2a38bdda_1626534563_3x2_md.jpg'
};

function normText(v='') {
  return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function canonicalUrl(u='') {
  try {
    const x=new URL(u);
    x.hash='';
    x.search='';
    x.hostname=x.hostname.toLowerCase().replace(/^www\./,'');
    x.pathname=x.pathname.replace(/\/+$/,'');
    return x.href;
  } catch { return String(u).trim(); }
}
function dedupe(items) {
  const seenUrl=new Set(), seenTitle=new Set(), out=[];
  for (const item of items) {
    const cu=canonicalUrl(item.url);
    const ct=normText(item.title);
    if (!cu || seenUrl.has(cu) || (ct && seenTitle.has(ct))) continue;
    seenUrl.add(cu); if(ct) seenTitle.add(ct);
    out.push({...item,url:cu});
  }
  return out;
}

const SOURCES = [
  {name:'Folha / Ambiente', url:'https://feeds.folha.uol.com.br/ambiente/rss091.xml', category:'MEIO AMBIENTE', keywords:['resídu','reciclag','lixo','coleta seletiva','logística reversa','economia circular','catador','embalagem','reaproveit']},
  {name:'Folha / Cotidiano', url:'https://feeds.folha.uol.com.br/cotidiano/rss091.xml', category:'CIDADES', keywords:['condomínio','coleta seletiva','lixo','reciclag','resídu','logística reversa']},
  {name:'Folha / Tecnologia', url:'https://feeds.folha.uol.com.br/tec/rss091.xml', category:'TECNOLOGIA', keywords:['reciclag','resídu','eletrônico','lixo eletrônico','logística reversa','economia circular']},
  {name:'Agência Brasil / Meio Ambiente', url:'https://news.google.com/rss/search?q=site%3Aagenciabrasil.ebc.com.br%2Fmeio-ambiente&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', category:'MEIO AMBIENTE', keywords:['resídu','reciclag','coleta seletiva','logística reversa','economia circular','catador','embalagem','reaproveit']},
  {name:'MMA / Meio Ambiente', url:'https://news.google.com/rss/search?q=site%3Agov.br%2Fmma+res%C3%ADduos+OR+reciclagem+OR+log%C3%ADstica+reversa&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', category:'POLÍTICAS AMBIENTAIS', keywords:['resídu','reciclag','logística reversa','economia circular','meio ambiente','resíduos sólidos','catador','embalagem']},
  {name:'SINIR / Resíduos', url:'https://news.google.com/rss/search?q=site%3Asinir.gov.br+res%C3%ADduos+OR+log%C3%ADstica+reversa+OR+MTR+OR+CDF&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', category:'RESÍDUOS', keywords:['resídu','logística reversa','mtr','cdf','pgrs','catador','embalagem','reciclag']},
  {name:'Secovi-SP / Condomínios', url:'https://news.google.com/rss/search?q=site%3Asecovi.com.br+condom%C3%ADnios+res%C3%ADduos+OR+reciclagem+OR+sustentabilidade&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', category:'CONDOMÍNIOS', keywords:['condomínio','condomínios','síndico','administradora','resídu','reciclag','sustentabilidade','coleta']},
  {name:'Teletime / Tecnologia', url:'https://news.google.com/rss/search?q=site%3Ateletime.com.br+reciclagem+OR+res%C3%ADduos+OR+sustentabilidade+OR+esg&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', category:'TECNOLOGIA', keywords:['tecnologia','eletrônico','reciclag','resídu','sustentabilidade','esg','energia']},
  {name:'Envolverde / Sustentabilidade', url:'https://news.google.com/rss/search?q=site%3Aenvolverde.com.br+reciclagem+OR+res%C3%ADduos+OR+sustentabilidade+OR+economia+circular&hl=pt-BR&gl=BR&ceid=BR%3Apt-419', category:'SUSTENTABILIDADE', keywords:['reciclag','resídu','sustent','economia circular','clima','ambient','catador','energia']}
];

const LOCAL_FALLBACKS = {}; // Nunca usa foto genérica para representar uma notícia específica.

const entities = {
  amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',hellip:'…',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',
  aacute:'á',agrave:'à',acirc:'â',atilde:'ã',ä:'ä',eacute:'é',ecirc:'ê',iacute:'í',oacute:'ó',ocirc:'ô',otilde:'õ',uacute:'ú',ccedil:'ç',
  Aacute:'Á',Agrave:'À',Acirc:'Â',Atilde:'Ã',Eacute:'É',Ecirc:'Ê',Iacute:'Í',Oacute:'Ó',Ocirc:'Ô',Otilde:'Õ',Uacute:'Ú',Ccedil:'Ç'
};

function decodeEntities(value='') {
  return String(value).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi,(full,key)=>{
    if(/^#x/i.test(key)){const n=parseInt(key.slice(2),16);return Number.isFinite(n)?String.fromCodePoint(n):full;}
    if(/^#\d+$/i.test(key)){const n=parseInt(key.slice(1),10);return Number.isFinite(n)?String.fromCodePoint(n):full;}
    return Object.prototype.hasOwnProperty.call(entities,key)?entities[key]:full;
  });
}

function clean(value='') {
  let v=String(value).replace(/<!\[CDATA\[|\]\]>/g,'');
  v=decodeEntities(v);
  v=v.replace(/<[^>]+>/g,' ');
  v=decodeEntities(v);
  return v.replace(/\s+/g,' ').trim();
}

function abs(u,b){try{return new URL(u,b).href;}catch{return u||'';}}
function match(s,re){return (s.match(re)?.[1]||'').trim();}
function has(s,ks){const x=s.toLowerCase();return ks.some(k=>x.includes(k.toLowerCase()));}

function parseRSS(xml, source){
  const blocks=xml.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi)||[];
  const out=[];
  for(const b of blocks){
    const title=clean(match(b,/<title[^>]*>([\s\S]*?)<\/title>/i));
    let link=match(b,/<link[^>]*href=["']([^"']+)["'][^>]*>/i)||match(b,/<link[^>]*>([\s\S]*?)<\/link>/i);
    link=abs(clean(link),source.url);
    const desc=clean(match(b,/<(?:description|summary|content:encoded)[^>]*>([\s\S]*?)<\/(?:description|summary|content:encoded)>/i));
    const date=clean(match(b,/<(?:pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i));
    const media=source.url.includes('news.google.com') ? '' : (match(b,/<media:(?:content|thumbnail)\b[^>]*url=["']([^"']+)["']/i)||match(b,/<(?:enclosure|image)\b[^>]*url=["']([^"']+)["']/i)||match(b,/<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["']/i));
    const feedPublisher=clean(match(b,/<source[^>]*>([\s\S]*?)<\/source>/i));
    if(title&&link&&has(title+' '+desc,source.keywords)){
      out.push({title,url:link,description:desc.slice(0,700),date:(Date.parse(date)?new Date(date).toISOString():new Date().toISOString()),source:feedPublisher||source.name,image:abs(media,source.url),imageCredit:feedPublisher||source.name,category:source.category});
    }
    if(out.length>=12)break;
  }
  return out;
}

async function getPage(url,timeout=4200){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const r=await fetch(url,{signal:controller.signal,redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; EcoNews/1.0)','accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','accept-language':'pt-BR,pt;q=0.9,en;q=0.7'}});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const bytes=await r.arrayBuffer();
    const ct=r.headers.get('content-type')||'';
    const probe=new TextDecoder('utf-8').decode(bytes.slice(0,1400));
    let charset=(ct.match(/charset=([^;\s]+)/i)?.[1]||probe.match(/encoding=["']([^"']+)["']/i)?.[1]||'utf-8').toLowerCase().replace(/["']/g,'');
    if(charset==='iso-8859-1')charset='windows-1252';
    let text;
    try{text=new TextDecoder(charset).decode(bytes);}catch{text=new TextDecoder('utf-8').decode(bytes);}
    return {text,url:r.url||url};
  }finally{clearTimeout(timer);}
}

async function get(url,timeout=2800){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const r=await fetch(url,{signal:controller.signal,redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; EcoNews/1.0)','accept':'application/rss+xml, application/xml, text/xml, text/html;q=0.9,*/*;q=0.8','accept-language':'pt-BR,pt;q=0.9,en;q=0.7'}});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const bytes=await r.arrayBuffer();
    const ct=r.headers.get('content-type')||'';
    const probe=new TextDecoder('utf-8').decode(bytes.slice(0,1400));
    let charset=(ct.match(/charset=([^;\s]+)/i)?.[1]||probe.match(/encoding=["']([^"']+)["']/i)?.[1]||'utf-8').toLowerCase().replace(/["']/g,'');
    if(charset==='iso-8859-1')charset='windows-1252';
    try{return new TextDecoder(charset).decode(bytes);}catch{return new TextDecoder('utf-8').decode(bytes);}
  }finally{clearTimeout(timer);}
}

function extractMetaImage(html,pageUrl){
  const patterns=[
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i,
    /<link[^>]+rel=["'][^"']*image_src[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i
  ];
  for(const re of patterns){const m=html.match(re);if(m?.[1])return abs(decodeEntities(m[1]),pageUrl);}
  const json=[...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for(const block of json){try{const data=JSON.parse(block[1].trim());const arr=Array.isArray(data)?data:[data];for(const o of arr){const im=o?.image;const c=Array.isArray(im)?im[0]:(typeof im==='string'?im:im?.url);if(c)return abs(c,pageUrl);}}catch{}}
  return '';
}

function buildEditorial(a,tags){
  const desc=clean(a.description||'');
  const topic = tags.includes('reciclagem') ? 'reciclagem e logística reversa' : tags.includes('residuos') ? 'gestão de resíduos' : tags.includes('condominios') ? 'gestão ambiental em condomínios' : tags.includes('tecnologia') ? 'tecnologia, inovação e transformação operacional' : tags.includes('economia-circular') ? 'economia circular' : 'sustentabilidade e meio ambiente';
  const intro = desc || `A reportagem aborda um tema relacionado a ${topic} e reúne informações que ajudam a entender seus efeitos para empresas, condomínios, consumidores e para a gestão ambiental.`;
  const why = `O tema merece atenção porque mudanças em ${topic} podem afetar custos, processos, investimentos, conformidade e a forma como organizações lidam com recursos e resíduos. O ponto central é transformar a informação divulgada em entendimento prático: o que mudou, quem é afetado, quais decisões podem ser necessárias e quais indicadores devem ser acompanhados.`;
  const context = `A notícia está inserida em uma transformação mais ampla da gestão ambiental. Empresas, condomínios, governos e consumidores convivem com novas exigências de rastreabilidade, eficiência, destinação correta, reaproveitamento de materiais e transparência. Ao mesmo tempo, regulamentações, tecnologias e mudanças de mercado alteram a maneira como essas operações são planejadas e executadas.`;
  const business = `Para empresas e condomínios, o assunto pode representar tanto uma necessidade de adaptação quanto uma oportunidade. Separação correta, armazenamento, coleta, triagem, comprovação de destinação e acompanhamento de resultados deixam de ser detalhes isolados e passam a fazer parte de uma gestão mais organizada. A capacidade de documentar processos e trabalhar com parceiros adequados também ganha importância.`;
  const chain = `Outro ponto importante é a cadeia como um todo. Resíduos não desaparecem quando saem de uma empresa ou de um condomínio: eles seguem para transporte, triagem, recuperação, reciclagem, tratamento ou disposição final. Por isso, decisões tomadas na origem influenciam diretamente a qualidade do material, os custos da operação e a possibilidade de reaproveitamento.`;
  const practical = `Na prática, o acompanhamento deve considerar novas decisões das autoridades, dados divulgados pelas instituições envolvidas, mudanças regulatórias, investimentos e respostas do mercado. O Eco News organiza esses elementos para facilitar a leitura e pode atualizar a cobertura quando surgirem informações relevantes.`;
  const implications = `O cenário também reforça a importância de indicadores e procedimentos claros. Peso coletado, frequência de retirada, tipos de materiais, índices de recuperação, documentação e destinação são exemplos de informações que ajudam a transformar uma iniciativa ambiental em uma operação mensurável. Quanto melhor organizada estiver a cadeia, maior tende a ser a capacidade de identificar perdas e oportunidades.`;
  const conclusion = `Em resumo, a notícia deve ser entendida dentro de um movimento maior de profissionalização da gestão ambiental. Mais do que acompanhar uma manchete, empresas e condomínios precisam compreender os efeitos do tema sobre suas rotinas e estar preparados para novas exigências, oportunidades e mudanças de mercado.`;
  return {
    editorialIntro:intro,
    editorialLead: desc || `A cobertura apresenta os principais elementos relacionados a ${topic} e ajuda a situar o leitor sobre o que está acontecendo, por que o assunto ganhou atenção e quais pontos merecem acompanhamento.`,
    editorialSections:[
      {title:'O que está em discussão',text:desc || `A publicação trata de ${topic}. O Eco News organiza o assunto em uma leitura editorial própria, reunindo contexto e implicações para facilitar a compreensão do tema.`},
      {title:'Por que esse assunto importa',text:why},
      {title:'Contexto e cenário',text:context},
      {title:'O impacto para empresas e condomínios',text:business},
      {title:'A cadeia por trás da notícia',text:chain},
      {title:'O que muda na prática',text:implications},
      {title:'O que acompanhar a partir de agora',text:practical},
      {title:'Em resumo',text:conclusion}
    ]
  };
}

const BLOCKED_NEWS_TERMS=['queimada','incêndio','fumaça','desmatamento','bombeiros controlam incêndio'];
const CORE_NEWS_TERMS=['reciclag','resíduo','resíduos','coleta seletiva','logística reversa','economia circular','catador','catadores','triagem','reaproveit','reutiliza','material recicl','lixo eletrônico','embalagem'];
function isCoreNews(a){
  const h=normText((a?.title||'')+' '+(a?.description||''));
  const hasCore=CORE_NEWS_TERMS.some(k=>h.includes(normText(k)));
  const blocked=BLOCKED_NEWS_TERMS.some(k=>h.includes(normText(k)));
  return hasCore && !blocked;
}
function relevanceScore(a){
  const h=normText((a?.title||'')+' '+(a?.description||''));
  let n=0;
  if(h.includes('reciclag'))n+=10;
  if(h.includes('logistica reversa'))n+=9;
  if(h.includes('residu'))n+=8;
  if(h.includes('coleta seletiva'))n+=8;
  if(h.includes('economia circular')||h.includes('circularidade'))n+=7;
  if(h.includes('catador'))n+=6;
  if(h.includes('triagem'))n+=5;
  if(h.includes('reaproveit')||h.includes('reutiliza'))n+=4;
  if(h.includes('eletronico'))n+=3;
  return n;
}

function enrich(items){
  return items.map(a=>{
    const h=(a.title+' '+a.description).toLowerCase(),tags=['todos'];
    const map={residuos:['resíduo','resíduos','lixo','aterro','coleta','descarte'],reciclagem:['reciclag','catador','triagem','material recicl','logística reversa','embalagem'],condominios:['condomínio','condomínios','síndico','administradora'],sustentabilidade:['sustent','clima','ambient','carbono','esg','água','emissões'],tecnologia:['tecnologia','robô','inteligência artificial','inovação'],'economia-circular':['economia circular','circularidade','reutiliza','reaproveita']};
    for(const [tag,words] of Object.entries(map))if(words.some(w=>h.includes(w)))tags.push(tag);
    const id=crypto.createHash('sha1').update(a.url).digest('hex').slice(0,18);
    const verifiedKey=Object.keys(VERIFIED_IMAGES).find(k=>normText(k)===normText(a.title))||'';
    const verified=VERIFIED_IMAGES[verifiedKey]||'';
    const imageCredit=a.imageCredit||'';
    const editorial=buildEditorial(a,tags);
    return {...a,id,image:verified||a.image||'',imageCredit,tags:[...new Set(tags)],...editorial};
  });
}


async function hydrateArticleImages(items, maxItems=12){
  // Para as notícias que não têm foto verificada, busca a imagem diretamente
  // na página original. Isso evita depender apenas da imagem do RSS, que pode
  // ser thumbnail ou URL que bloqueia hotlink.
  const targets=items.filter(x=>x && x.url && /^https?:\/\//i.test(x.url) && !VERIFIED_IMAGES[Object.keys(VERIFIED_IMAGES).find(k=>normText(k)===normText(x.title))||'']).slice(0,maxItems);
  await Promise.allSettled(targets.map(async item=>{
    try{
      const page=await getPage(item.url,4200);
      if(page.url && /^https?:\/\//i.test(page.url)) item.url=canonicalUrl(page.url);
      const image=extractMetaImage(page.text,page.url||item.url);
      if(image && !/news\.google\.com/i.test(image))item.image=image;
    }catch{}
  }));
  return items;
}

async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','s-maxage=180, stale-while-revalidate=300');
  try{
    const query=req.query||{};
    const requestedUrl=typeof query.url==='string'?query.url:'';
    const requestedId=typeof query.id==='string'?query.id:'';

    // A página de matéria é atendida de forma leve: primeiro usa o conjunto conhecido,
    // depois tenta as fontes RSS. Isso evita estourar o tempo da função da Vercel.
    if(requestedUrl || requestedId){
      let item=FALLBACK.find(x=>canonicalUrl(x.url)===canonicalUrl(requestedUrl));
      if(!item && requestedId)item=enrich(FALLBACK).find(x=>x.id===requestedId);
      if(!item && requestedUrl)item={title:'',url:requestedUrl,description:'',date:new Date().toISOString(),source:'',image:'',category:'ECO NEWS'};
      if(!item)return res.status(404).json({error:'Notícia não encontrada'});

      // Quando a matéria não está no conjunto local, buscamos apenas metadados
      // públicos da página original. O Eco News não replica o texto integral
      // de terceiros: transforma os dados disponíveis em uma leitura editorial
      // própria e mantém a fonte original para consulta.
      if(item.url && (!item.title || !item.description || !item.source || !item.image)){
        try{
          const html=await get(item.url,5200);
          const metaTitle=match(html,/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i)||match(html,/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i)||match(html,/<title[^>]*>([\s\S]*?)<\/title>/i);
          const metaDesc=match(html,/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["'][^>]*>/i)||match(html,/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["'][^>]*>/i);
          const metaAuthor=match(html,/<meta[^>]+(?:name|property)=["'](?:author|article:author)["'][^>]+content=["']([^"']+)["'][^>]*>/i);
          const metaDate=match(html,/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["'][^>]*>/i)||match(html,/<time[^>]+datetime=["']([^"']+)["']/i);
          const ogSource=match(html,/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["'][^>]*>/i);
          if(metaTitle)item.title=clean(metaTitle);
          if(metaDesc)item.description=clean(metaDesc).slice(0,1100);
          if(ogSource)item.source=clean(ogSource);
          if(metaAuthor)item.author=clean(metaAuthor);
          if(metaDate && !Number.isNaN(Date.parse(metaDate)))item.date=new Date(metaDate).toISOString();
          const image=extractMetaImage(html,item.url); if(image && !/(news\.google\.com|gstatic\.com|googleusercontent\.com)/i.test(image))item.image=image;
          if(!item.source){try{item.source=new URL(item.url).hostname.replace(/^www\./,'');}catch{item.source='Fonte original';}}
        }catch{}
      }
      if(!item.title)item.title='Matéria em destaque';
      if(!item.description)item.description='O Eco News reuniu os dados públicos disponíveis sobre este assunto e apresenta abaixo uma leitura editorial própria, com contexto e os principais pontos para o leitor.';
      if(!item.source){try{item.source=new URL(item.url).hostname.replace(/^www\./,'');}catch{item.source='Fonte original';}}
      item=enrich([item])[0];
      return res.status(200).json(item);
    }

    const results=await Promise.all(SOURCES.map(async source=>{try{return parseRSS(await get(source.url,2600),source);}catch{return [];}}));
    const all=[...FALLBACK,...results.flat()].filter(isCoreNews);
    const unique=dedupe(all);
    // O Eco News é editorialmente focado em reciclagem, resíduos e logística reversa.
    // Nunca deixamos uma matéria de queimadas/desmatamento dominar o portal apenas por ser recente.
    await hydrateArticleImages(unique.slice(0,20),20);
    const sorted=enrich(unique).sort((a,b)=>relevanceScore(b)-relevanceScore(a) || (Date.parse(b.date)-Date.parse(a.date)));
    const limit=Math.min(30,Math.max(1,Number(query.limit||12)));
    return res.status(200).json({updated_at:new Date().toISOString(),live_sources:results.some(x=>x.length),items:sorted.slice(0,limit)});
  }catch(error){
    return res.status(200).json({updated_at:new Date().toISOString(),live_sources:false,items:enrich(FALLBACK.filter(isCoreNews)).sort((a,b)=>relevanceScore(b)-relevanceScore(a) || Date.parse(b.date)-Date.parse(a.date))});
  }
}

module.exports = handler;
