const ALLOWED_ARTICLE_HOSTS = new Set([
  'www1.folha.uol.com.br','c-level.folha.uol.com.br','agenciabrasil.ebc.com.br','envolverde.com.br','secovi.com.br','megawhat.uol.com.br'
]);
function abs(u,b){try{return new URL(u,b).href;}catch{return '';}}
function decode(v=''){return String(v).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'");}
function extract(html,pageUrl){
  const p=[
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i,
    /<link[^>]+rel=["'][^"']*image_src[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i
  ];
  for(const re of p){const m=html.match(re); if(m?.[1]) return abs(decode(m[1]),pageUrl);}
  const json=[...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for(const b of json){try{const d=JSON.parse(b[1].trim());const arr=Array.isArray(d)?d:[d];for(const o of arr){const im=o?.image;const u=Array.isArray(im)?im[0]:(typeof im==='string'?im:im?.url);if(u)return abs(u,pageUrl);}}catch{}}
  const img=html.match(/<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["'][^>]*>/i);
  return img?.[1] ? abs(decode(img[1]),pageUrl) : '';
}
async function handler(req,res){
  const raw=typeof req.query?.url==='string'?req.query.url:'';
  try{
    const article=new URL(raw);
    if(!['http:','https:'].includes(article.protocol) || !ALLOWED_ARTICLE_HOSTS.has(article.hostname)) return res.status(403).send('Fonte não autorizada');
    const r=await fetch(article.href,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; EcoNews/1.0)','accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8','accept-language':'pt-BR,pt;q=0.9'}});
    if(!r.ok) return res.status(r.status).send('Matéria indisponível');
    const html=await r.text(); const image=extract(html,article.href); if(!image) return res.status(404).send('Imagem não encontrada');
    const u=new URL(image); if(!['http:','https:'].includes(u.protocol)) return res.status(400).send('Imagem inválida');
    const ir=await fetch(u.href,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; EcoNews/1.0)','accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8','referer':article.href}});
    if(!ir.ok) return res.status(ir.status).send('Imagem indisponível');
    const type=ir.headers.get('content-type')||'image/jpeg'; if(!/^image\//i.test(type)) return res.status(415).send('Conteúdo não é imagem');
    res.setHeader('Content-Type',type); res.setHeader('Cache-Control','public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(Buffer.from(await ir.arrayBuffer()));
  }catch(e){return res.status(400).send('URL inválida');}
}
module.exports=handler;
