const SOURCES = [
  {name:'Folha / Ambiente', url:'https://feeds.folha.uol.com.br/ambiente/rss091.xml', category:'MEIO AMBIENTE', keywords:['resídu','reciclag','lixo','ambient','sustent','clima','poluição','água']},
  {name:'Folha / Cotidiano', url:'https://feeds.folha.uol.com.br/cotidiano/rss091.xml', category:'CIDADES', keywords:['condomínio','coleta','lixo','reciclag','resídu']},
  {name:'Folha / Tecnologia', url:'https://feeds.folha.uol.com.br/tec/rss091.xml', category:'TECNOLOGIA', keywords:['tecnologia','inteligência artificial','inovação','robô','reciclag','energia']},
];
const FALLBACK = [
 {title:'Menos de 5% das empresas cumprem lei de reciclagem de eletrônicos no Brasil, diz associação',url:'https://c-level.folha.uol.com.br/economia-sustentavel/2026/10/menos-de-5-das-empresas-cumprem-lei-de-reciclagem-de-eletronicos-no-brasil-diz-associacao.shtml',description:'Entidade do setor cobra fiscalização e afirma que poucas empresas cumprem as metas de logística reversa de eletrônicos.',date:'2026-10-09T12:00:00-03:00',source:'C-Level / Folha',image:'',category:'RECICLAGEM'},
 {title:'5º leilão do Eco Invest atrai quase R$ 50 bi para investimentos verdes',url:'https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2026-10/5o-leilao-do-eco-invest-atrai-quase-r-50-bi-para-investimentos-verdes',description:'Rodada recebeu demanda de R$ 181,3 bilhões de seis bancos, com recursos para inovação e transformação ecológica.',date:'2026-10-07T17:48:00-03:00',source:'Agência Brasil',image:'',category:'SUSTENTABILIDADE'},
 {title:'Cerrado brasileiro perdeu 13,9 milhões de hectares de margens de rios',url:'https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2026-10/cerrado-brasileiro-perdeu-139-milhoes-de-hectares-de-margens-de-rios',description:'Dados do MapBiomas apontam forte perda de vegetação nativa nas margens de rios do Cerrado entre 1985 e 2025.',date:'2026-10-08T07:07:00-03:00',source:'Agência Brasil',image:'',category:'MEIO AMBIENTE'},
 {title:'Excesso de oferta e incerteza regulatória freiam expansão de renováveis no Brasil',url:'https://c-level.folha.uol.com.br/economia-sustentavel/2026/10/excesso-de-oferta-e-incerteza-regulatoria-freiam-expansao-de-renovaveis-no-brasil-e-novas-instalacoes-caem-27.shtml',description:'Relatório aponta redução na expansão de fontes renováveis e desafios para investimentos em energia limpa no país.',date:'2026-10-08T23:00:00-03:00',source:'C-Level / Folha',image:'',category:'ENERGIA LIMPA'},
 {title:'Fim do desmatamento ilegal deve ser prioridade para o próximo governo',url:'https://c-level.folha.uol.com.br/economia-sustentavel/2026/10/fim-do-desmatamento-ilegal-deve-ser-prioridade-para-o-proximo-governo-diz-ex-ministra-do-meio-ambiente.shtml',description:'Entrevista aborda ações contra o desmatamento ilegal e medidas para acelerar a agenda climática.',date:'2026-10-08T12:00:00-03:00',source:'C-Level / Folha',image:'',category:'SUSTENTABILIDADE'},
 {title:'Capital fluminense integra programa global de gestão de resíduos',url:'https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2026-09/capital-fluminense-integra-programa-global-de-gestao-de-residuos',description:'Rio de Janeiro está entre cidades-piloto de iniciativa global para reduzir resíduos enviados a aterros e emissões de metano.',date:'2026-09-27T13:01:00-03:00',source:'Agência Brasil',image:'',category:'RESÍDUOS'}
];
const clean = s => String(s||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&#39;/g,"'").replace(/&quot;/gi,'"').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();
const abs = (u,b) => {try{return new URL(u,b).href}catch{return u||''}};
const match = (s,re) => (s.match(re)?.[1]||'').trim();
const has = (s,ks) => ks.some(k=>s.toLowerCase().includes(k.toLowerCase()));
function parseRSS(xml, source){
 const blocks = xml.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi)||[]; const out=[];
 for(const b of blocks){
  const title=clean(match(b,/<title[^>]*>([\s\S]*?)<\/title>/i));
  let link=match(b,/<link[^>]*href=["']([^"']+)["'][^>]*>/i)||match(b,/<link[^>]*>([\s\S]*?)<\/link>/i); link=abs(clean(link),source.url);
  const desc=clean(match(b,/<(?:description|summary|content:encoded)[^>]*>([\s\S]*?)<\/(?:description|summary|content:encoded)>/i));
  const date=match(b,/<(?:pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i);
  const media=match(b,/<media:(?:content|thumbnail)\b[^>]*url=["']([^"']+)["']/i)||match(b,/<enclosure\b[^>]*url=["']([^"']+)["']/i);
  if(title&&link&&has(title+' '+desc,source.keywords)) out.push({title,url:link,description:desc.slice(0,420),date:(Date.parse(clean(date))?new Date(clean(date)).toISOString():new Date().toISOString()),source:source.name,image:abs(media,source.url),imageCredit:source.name,category:source.category});
  if(out.length>=10) break;
 }
 return out;
}
async function get(url){
 const r=await fetch(url,{headers:{'user-agent':'EcoNews/1.0 (+https://ecomixgestaoambiental.com.br)','accept':'application/rss+xml, application/xml, text/xml, text/html;q=0.9,*/*;q=0.8'},redirect:'follow'});
 if(!r.ok) throw new Error(`HTTP ${r.status}`); return await r.text();
}
function enrich(items){
 const map={residuos:['resíduo','resíduos','lixo','aterro','coleta','descarte'],reciclagem:['reciclag','catador','triagem','material recicl','logística reversa','embalagem'],condominios:['condomínio','condomínios','síndico','administradora'],sustentabilidade:['sustent','clima','ambient','carbono','esg','água','emissões'],tecnologia:['tecnologia','robô','inteligência artificial','inovação'], 'economia-circular':['economia circular','circularidade','reutiliza','reaproveita']};
 return items.map(a=>{const h=(a.title+' '+a.description).toLowerCase(),tags=['todos']; for(const [t,words] of Object.entries(map)) if(words.some(w=>h.includes(w))) tags.push(t); return {...a,tags:[...new Set(tags)],id:require('crypto').createHash('sha1').update(a.url).digest('hex').slice(0,18)};});
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
 try{
  let items=[]; for(const s of SOURCES){try{items.push(...parseRSS(await get(s.url),s));}catch(e){}}
  items.push(...FALLBACK); const unique=[...new Map(items.map(x=>[x.url,x])).values()]; const all=enrich(unique).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
  const id=req.query?.id||''; if(id){const item=all.find(x=>x.id===id); if(!item)return res.status(404).json({error:'Notícia não encontrada',items:[]}); return res.status(200).json(item);}
  const limit=Math.min(30,Math.max(1,Number(req.query?.limit||12))); return res.status(200).json({updated_at:new Date().toISOString(),live_sources:items.length>FALLBACK.length,items:all.slice(0,limit)});
 }catch(e){return res.status(200).json({updated_at:new Date().toISOString(),live_sources:false,items:enrich(FALLBACK)});}
}
