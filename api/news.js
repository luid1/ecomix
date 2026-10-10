const crypto = require('crypto');

const FALLBACK = [
  {
    title: 'Fumaça de incêndios florestais da Indonésia atinge ao menos 4 países',
    url: 'https://www1.folha.uol.com.br/ambiente/2026/10/fumaca-de-incendios-florestais-da-indonesia-atinge-ao-menos-4-paises.shtml',
    description: 'Fumaça de incêndios florestais se espalha pela região e afeta países do Sudeste Asiático, segundo a publicação original.',
    date: '2026-10-10T12:00:00-03:00',
    source: 'Folha / Ambiente', image: '', category: 'MEIO AMBIENTE'
  },
  {
    title:'Menos de 5% das empresas cumprem lei de reciclagem de eletrônicos no Brasil, diz associação',
    url:'https://c-level.folha.uol.com.br/economia-sustentavel/2026/10/menos-de-5-das-empresas-cumprem-lei-de-reciclagem-de-eletronicos-no-brasil-diz-associacao.shtml',
    description:'Entidade do setor cobra fiscalização e afirma que poucas empresas cumprem as metas de logística reversa de eletrônicos.',
    date:'2026-10-09T12:00:00-03:00', source:'C-Level / Folha', image:'', category:'RECICLAGEM'
  },
  {
    title:'5º leilão do Eco Invest atrai quase R$ 50 bi para investimentos verdes',
    url:'https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2026-10/5o-leilao-do-eco-invest-atrai-quase-r-50-bi-para-investimentos-verdes',
    description:'Rodada recebeu demanda de R$ 181,3 bilhões de seis bancos, com recursos para inovação e transformação ecológica.',
    date:'2026-10-07T17:48:00-03:00', source:'Agência Brasil', image:'', category:'SUSTENTABILIDADE'
  },
  {
    title:'Cerrado brasileiro perdeu 13,9 milhões de hectares de margens de rios',
    url:'https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2026-10/cerrado-brasileiro-perdeu-139-milhoes-de-hectares-de-margens-de-rios',
    description:'Dados do MapBiomas apontam forte perda de vegetação nativa nas margens de rios do Cerrado entre 1985 e 2025.',
    date:'2026-10-08T07:07:00-03:00', source:'Agência Brasil', image:'', category:'MEIO AMBIENTE'
  },
  {
    title:'Excesso de oferta e incerteza regulatória freiam expansão de renováveis no Brasil',
    url:'https://c-level.folha.uol.com.br/economia-sustentavel/2026/10/excesso-de-oferta-e-incerteza-regulatoria-freiam-expansao-de-renovaveis-no-brasil-e-novas-instalacoes-caem-27.shtml',
    description:'Relatório aponta redução na expansão de fontes renováveis e desafios para investimentos em energia limpa no país.',
    date:'2026-10-08T23:00:00-03:00', source:'C-Level / Folha', image:'', category:'ENERGIA LIMPA'
  },
  {
    title:'Fim do desmatamento ilegal deve ser prioridade para o próximo governo',
    url:'https://c-level.folha.uol.com.br/economia-sustentavel/2026/10/fim-do-desmatamento-ilegal-deve-ser-prioridade-para-o-proximo-governo-diz-ex-ministra-do-meio-ambiente.shtml',
    description:'Entrevista aborda ações contra o desmatamento ilegal e medidas para acelerar a agenda climática.',
    date:'2026-10-08T12:00:00-03:00', source:'C-Level / Folha', image:'', category:'SUSTENTABILIDADE'
  }
];

const SOURCES = [
  {name:'Folha / Ambiente', url:'https://feeds.folha.uol.com.br/ambiente/rss091.xml', category:'MEIO AMBIENTE', keywords:['resídu','reciclag','lixo','ambient','sustent','clima','poluição','água','queimada','incêndio']},
  {name:'Folha / Cotidiano', url:'https://feeds.folha.uol.com.br/cotidiano/rss091.xml', category:'CIDADES', keywords:['condomínio','coleta','lixo','reciclag','resídu']},
  {name:'Folha / Tecnologia', url:'https://feeds.folha.uol.com.br/tec/rss091.xml', category:'TECNOLOGIA', keywords:['tecnologia','inteligência artificial','inovação','robô','reciclag','energia']}
];

const LOCAL_FALLBACKS = {
  'MEIO AMBIENTE':'assets/gestao.jpg',
  'RECICLAGEM':'assets/gestao.jpg',
  'SUSTENTABILIDADE':'assets/hero-ecomix.jpg',
  'ENERGIA LIMPA':'assets/hero-ecomix.jpg',
  'CIDADES':'assets/condominios-nova.jpg',
  'TECNOLOGIA':'assets/gestao.jpg'
};

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
    const media=match(b,/<media:(?:content|thumbnail)\b[^>]*url=["']([^"']+)["']/i)||match(b,/<(?:enclosure|image)\b[^>]*url=["']([^"']+)["']/i);
    if(title&&link&&has(title+' '+desc,source.keywords)){
      out.push({title,url:link,description:desc.slice(0,420),date:(Date.parse(date)?new Date(date).toISOString():new Date().toISOString()),source:source.name,image:abs(media,source.url),imageCredit:source.name,category:source.category});
    }
    if(out.length>=8)break;
  }
  return out;
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

function enrich(items){
  return items.map(a=>{
    const h=(a.title+' '+a.description).toLowerCase(),tags=['todos'];
    const map={residuos:['resíduo','resíduos','lixo','aterro','coleta','descarte'],reciclagem:['reciclag','catador','triagem','material recicl','logística reversa','embalagem'],condominios:['condomínio','condomínios','síndico','administradora'],sustentabilidade:['sustent','clima','ambient','carbono','esg','água','emissões'],tecnologia:['tecnologia','robô','inteligência artificial','inovação'],'economia-circular':['economia circular','circularidade','reutiliza','reaproveita']};
    for(const [tag,words] of Object.entries(map))if(words.some(w=>h.includes(w)))tags.push(tag);
    const id=crypto.createHash('sha1').update(a.url).digest('hex').slice(0,18);
    return {...a,id,image:a.image||LOCAL_FALLBACKS[a.category]||'assets/gestao.jpg',tags:[...new Set(tags)]};
  });
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
      let item=FALLBACK.find(x=>x.url===requestedUrl);
      if(!item && requestedId)item=enrich(FALLBACK).find(x=>x.id===requestedId);
      if(!item && requestedUrl)item={title:'Notícia',url:requestedUrl,description:'Confira a publicação original e as informações disponíveis na fonte.',date:new Date().toISOString(),source:'Publicação original',image:'',category:'ECO NEWS'};
      if(!item)return res.status(404).json({error:'Notícia não encontrada'});
      item=enrich([item])[0];
      try{const html=await get(item.url,5200);const image=extractMetaImage(html,item.url);if(image)item.image=image;}catch{}
      return res.status(200).json(item);
    }

    const results=await Promise.all(SOURCES.map(async source=>{try{return parseRSS(await get(source.url,2600),source);}catch{return [];}}));
    const all=[...FALLBACK,...results.flat()];
    const unique=[...new Map(all.map(x=>[x.url,x])).values()];
    const sorted=enrich(unique).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
    const limit=Math.min(30,Math.max(1,Number(query.limit||12)));
    return res.status(200).json({updated_at:new Date().toISOString(),live_sources:results.some(x=>x.length),items:sorted.slice(0,limit)});
  }catch(error){
    return res.status(200).json({updated_at:new Date().toISOString(),live_sources:false,items:enrich(FALLBACK)});
  }
}

module.exports = handler;
