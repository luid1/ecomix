async function handler(req,res){
  const url=typeof req.query?.url==='string'?req.query.url:'';
  const ref=typeof req.query?.ref==='string'?req.query.ref:'';
  if(!url || !/^https?:\/\//i.test(url)) return res.status(400).send('URL inválida');
  try{
    const target=new URL(url);
    const headers={
      'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154 Safari/537.36 EcoNews/1.0',
      'accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'accept-language':'pt-BR,pt;q=0.9,en;q=0.8'
    };
    if(ref && /^https?:\/\//i.test(ref)) headers.referer=ref;
    else if(/(^|\.)uol\.com\.br$/i.test(target.hostname)) headers.referer='https://www1.folha.uol.com.br/';
    const r=await fetch(url,{redirect:'follow',headers});
    if(!r.ok) return res.status(r.status).send('Imagem indisponível');
    const type=(r.headers.get('content-type')||'').split(';')[0].trim() || 'image/jpeg';
    if(!/^image\//i.test(type)) return res.status(415).send('Conteúdo não é imagem');
    const buf=Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type',type);
    res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    res.setHeader('X-Content-Type-Options','nosniff');
    return res.status(200).send(buf);
  }catch(e){return res.status(502).send('Imagem indisponível');}
}
module.exports=handler;
