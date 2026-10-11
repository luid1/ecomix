function isBadImageUrl(u=''){
  return /(?:news\.google\.com|gstatic\.com|googleusercontent\.com|google\.com\/s2\/)/i.test(String(u));
}

function extractMetaImage(html, pageUrl){
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i,
    /<link[^>]+rel=["'][^"']*image_src[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i
  ];
  for (const re of patterns) {
    const m = String(html || '').match(re);
    if (m && m[1]) {
      try { const u=new URL(m[1], pageUrl).href; if(!isBadImageUrl(u)) return u; } catch (_) {}
    }
  }
  return '';
}

async function fetchImage(url, referer){
  const target = new URL(url);
  const headers = {
    'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154 Safari/537.36 EcoNews/2.0',
    'accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'accept-language':'pt-BR,pt;q=0.9,en;q=0.8'
  };
  if (referer && /^https?:\/\//i.test(referer)) headers.referer = referer;
  else if (/(^|\.)uol\.com\.br$/i.test(target.hostname)) headers.referer='https://www1.folha.uol.com.br/';
  return fetch(url,{redirect:'follow',headers});
}

async function getPageImage(pageUrl){
  const r = await fetch(pageUrl, {
    redirect:'follow',
    headers:{
      'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154 Safari/537.36 EcoNews/2.0',
      'accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      'accept-language':'pt-BR,pt;q=0.9,en;q=0.8'
    }
  });
  if(!r.ok) throw new Error('Página HTTP '+r.status);
  const html=await r.text();
  return extractMetaImage(html,pageUrl);
}

async function handler(req,res){
  const url=typeof req.query?.url==='string'?req.query.url:'';
  const ref=typeof req.query?.ref==='string'?req.query.ref:'';
  if(!url || !/^https?:\/\//i.test(url)) return res.status(400).send('URL inválida');

  async function sendImage(imageUrl, referer){
    if(!imageUrl || isBadImageUrl(imageUrl)) return false;
    const r=await fetchImage(imageUrl,referer);
    if(!r.ok) return false;
    const type=(r.headers.get('content-type')||'').split(';')[0].trim();
    if(!/^image\//i.test(type)) return false;
    const buf=Buffer.from(await r.arrayBuffer());
    if(!buf.length) return false;
    res.setHeader('Content-Type',type);
    res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.status(200).send(buf);
    return true;
  }

  try{
    // 1) Tenta a própria URL caso ela já seja uma imagem.
    if(await sendImage(url,ref)) return;

    // 2) Se a URL for uma matéria, descobre a imagem oficial da página.
    const pageUrl = /^https?:\/\//i.test(ref) ? ref : url;
    if(/^https?:\/\//i.test(pageUrl)){
      const discovered=await getPageImage(pageUrl);
      if(discovered && await sendImage(discovered,pageUrl)) return;
    }
    return res.status(404).send('Imagem não disponível');
  }catch(e){
    return res.status(404).send('Imagem não disponível');
  }
}
module.exports=handler;
