async function handler(req,res){
  const url=typeof req.query?.url==='string'?req.query.url:'';
  if(!url || !/^https?:\/\//i.test(url)) return res.status(400).send('URL inválida');
  try{
    const r=await fetch(url,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; EcoNews/1.0)','accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}});
    if(!r.ok) return res.status(r.status).send('Imagem indisponível');
    const type=r.headers.get('content-type')||'image/jpeg';
    if(!/^image\//i.test(type)) return res.status(415).send('Conteúdo não é imagem');
    const buf=Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type',type);
    res.setHeader('Cache-Control','public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buf);
  }catch(e){return res.status(502).send('Imagem indisponível');}
}
module.exports=handler;
