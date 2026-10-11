const b=document.querySelector('.menu');
const mobileMenu=document.querySelector('#mobileMenu');
const backdrop=mobileMenu?.querySelector('.mobile-menu-backdrop');
const menuLinks=[...(mobileMenu?.querySelectorAll('[data-menu-link]')||[])];
const pageTransition=document.querySelector('#pageTransition');

function closeMobileMenu(){
  if(!b||!mobileMenu)return;
  b.classList.remove('is-open');
  b.setAttribute('aria-expanded','false');
  b.setAttribute('aria-label','Abrir menu');
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden','true');
  document.body.classList.remove('menu-open');
}

function openMobileMenu(){
  if(!b||!mobileMenu)return;
  b.classList.add('is-open');
  b.setAttribute('aria-expanded','true');
  b.setAttribute('aria-label','Fechar menu');
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden','false');
  document.body.classList.add('menu-open');
}

b?.addEventListener('click',()=>{
  mobileMenu?.classList.contains('is-open') ? closeMobileMenu() : openMobileMenu();
});
backdrop?.addEventListener('click',closeMobileMenu);

document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && mobileMenu?.classList.contains('is-open')) closeMobileMenu();
});

// O clique simula uma navegação para uma nova página: fecha o menu,
// exibe a tela de transição e então leva suavemente à seção escolhida.
menuLinks.forEach(link=>{
  link.addEventListener('click',e=>{
    const target=link.getAttribute('href');
    if(!target || !target.startsWith('#')) return;
    const section=document.querySelector(target);
    if(!section)return;
    e.preventDefault();
    closeMobileMenu();
    pageTransition?.classList.add('is-active');
    window.setTimeout(()=>{
      section.scrollIntoView({behavior:'smooth',block:'start'});
      window.setTimeout(()=>pageTransition?.classList.remove('is-active'),520);
    },420);
  });
});


// Frases do card: troca a cada 2 segundos, com entrada/saída suave.
const phrases=[...document.querySelectorAll('.quote-rotator .phrase')];
if(phrases.length>1){
  let current=0;
  setInterval(()=>{
    phrases[current].classList.remove('active');
    current=(current+1)%phrases.length;
    phrases[current].classList.add('active');
  },2000);
}

// A abertura da home só termina depois que as imagens críticas foram carregadas.
// Mantemos a animação de entrada por pelo menos ~5s; se alguma foto demorar mais,
// a tela permanece até ela terminar ou até o fallback correspondente ser carregado.
(function(){
  const loader=document.getElementById('ec-loading');
  if(!loader) return;
  const started=performance.now();
  const waitImage=img=>new Promise(resolve=>{
    if(img.complete && img.naturalWidth>0) return resolve(true);
    const done=ok=>{img.removeEventListener('load',onload);img.removeEventListener('error',onerror);resolve(ok);};
    const onload=()=>done(true);
    const onerror=()=>done(false);
    img.addEventListener('load',onload,{once:true});
    img.addEventListener('error',onerror,{once:true});
  });
  const preloadUrl=url=>new Promise(resolve=>{
    const img=new Image();
    img.onload=img.onerror=()=>resolve();
    img.src=url;
  });
  const waitStaticImages=()=>Promise.all([
    ...[...document.images].map(waitImage),
    ...[
      'assets/hero-rapaz-reciclagem.jpg',
      'assets/condominios-nova.jpg'
    ].map(preloadUrl)
  ]);
  const waitDynamicNews=()=>new Promise(resolve=>{
    const slider=document.getElementById('newsSlider');
    if(!slider) return resolve();
    let finished=false;
    const finish=()=>{if(!finished){finished=true;resolve();}};
    const check=()=>{
      const imgs=[...slider.querySelectorAll('img')];
      if(!imgs.length) return;
      Promise.all(imgs.map(waitImage)).then(results=>{
        // Libera a home somente quando as fotos realmente carregaram.
        if(results.every(Boolean)) finish();
      });
    };
    slider.addEventListener('eco-news-ready',check,{once:true});
    check();
    // Segurança para não deixar a página presa indefinidamente caso uma fonte externa caia.
    setTimeout(finish,25000);
  });
  const minTime=new Promise(resolve=>setTimeout(resolve,Math.max(0,5000-(performance.now()-started))));
  Promise.all([waitStaticImages(),waitDynamicNews(),minTime]).then(()=>loader.classList.add('is-done'));
})();

// Entradas suaves das faixas e listas quando entram na tela.
document.addEventListener('DOMContentLoaded', () => {
  const targets = [
    document.querySelector('.number-grid'),
    document.querySelector('.service-list'),
    document.querySelector('.material-row')
  ].filter(Boolean);

  const reveal = el => el.classList.add('is-visible');
  if (!('IntersectionObserver' in window)) { targets.forEach(reveal); return; }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { reveal(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

  targets.forEach(el => observer.observe(el));
});

// Navegação para a página Eco News com transição premium.
document.querySelectorAll('a[href$=".html"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const href=link.getAttribute('href');
    if(!href || href.startsWith('http') || href.startsWith('#')) return;
    e.preventDefault();
    closeMobileMenu();
    pageTransition?.classList.add('is-active');
    window.setTimeout(()=>{ window.location.href=href; },480);
  });
});



// Eco News na home: destaques dinâmicos vindos do agregador PHP.
(function(){
  const slider=document.getElementById('newsSlider'); if(!slider) return;
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const imageSrc=(u,ref)=>{const x=String(u||''); return /^https?:\/\//i.test(x)?('/api/image?url='+encodeURIComponent(x)+(ref?'&ref='+encodeURIComponent(ref):'')):x||'assets/eco-news-sem-imagem.svg'};

  const dots=slider.querySelector('.news-slide-dots'), controls=slider.querySelector('.news-slide-controls');
  let slides=[], current=0, timer;
  function activate(i){if(!slides.length)return;current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('is-active',n===current));[...dots.children].forEach((d,n)=>d.classList.toggle('active',n===current));}
  function restart(){clearInterval(timer);timer=setInterval(()=>activate(current+1),6000)}
  fetch('/api/news?limit=5',{cache:'no-store'}).then(r=>r.json()).then(data=>{
    const items=(data.items||[]).slice(0,5); if(!items.length){slider.querySelector('.news-home-loading')?.remove();return;}
    slider.querySelector('.news-home-loading')?.remove();
    items.forEach((a,i)=>{const el=document.createElement('div');el.className='news-slide'+(i===0?' is-active':'');el.innerHTML=`<a href="https://ecomixgestaoambiental.com.br/ecomix-news.html" class="news-slide-image" aria-label="Abrir notícia"><img src="${esc(imageSrc(a.image,a.url))}" alt="" loading="eager" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/eco-news-sem-imagem.svg'"></a><a href="https://ecomixgestaoambiental.com.br/ecomix-news.html" class="news-slide-content"><span class="news-slide-kicker">${esc(a.category||'SUSTENTABILIDADE')} · ${esc(new Date(a.date).toLocaleDateString('pt-BR'))}</span><h3>${esc(a.title)}</h3><div class="news-slide-source">${esc(a.source)} <b>→</b></div></a>`;slider.insertBefore(el,controls);slides.push(el);const d=document.createElement('button');d.type='button';d.setAttribute('aria-label','Mostrar notícia '+(i+1));d.addEventListener('click',()=>{activate(i);restart()});dots.appendChild(d);});activate(0);restart();slider.dispatchEvent(new Event('eco-news-ready'));
  }).catch((err)=>{
    slider.dispatchEvent(new Event('eco-news-ready')); const load=slider.querySelector('.news-home-loading'); if(load){ load.innerHTML='<strong>Eco News</strong><br><span>As notícias estão sendo atualizadas. Tente novamente em instantes.</span>'; } console.warn('Eco News:',err); });
  slider.querySelector('.news-slide-next')?.addEventListener('click',()=>{activate(current+1);restart()});slider.querySelector('.news-slide-prev')?.addEventListener('click',()=>{activate(current-1);restart()});slider.addEventListener('mouseenter',()=>clearInterval(timer));slider.addEventListener('mouseleave',restart);
})();
