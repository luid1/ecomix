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

window.addEventListener('load',()=>{const l=document.getElementById('ec-loading');if(l)setTimeout(()=>l.classList.add('is-done'),5000);});


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
  const dots=slider.querySelector('.news-slide-dots'), controls=slider.querySelector('.news-slide-controls');
  let slides=[], current=0, timer;
  function activate(i){if(!slides.length)return;current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('is-active',n===current));[...dots.children].forEach((d,n)=>d.classList.toggle('active',n===current));}
  function restart(){clearInterval(timer);timer=setInterval(()=>activate(current+1),6000)}
  fetch('/api/news?limit=5',{cache:'no-store'}).then(r=>r.json()).then(data=>{
    const items=(data.items||[]).slice(0,5); if(!items.length){slider.querySelector('.news-home-loading')?.remove();return;}
    slider.querySelector('.news-home-loading')?.remove();
    items.forEach((a,i)=>{const el=document.createElement('div');el.className='news-slide'+(i===0?' is-active':'');el.innerHTML=`<a href="ecomix-news-artigo.html?id=${encodeURIComponent(a.id)}" class="news-slide-image" style="background-image:url('${esc(a.image||'assets/gestao.jpg')}')" aria-label="Abrir notícia"></a><a href="ecomix-news-artigo.html?id=${encodeURIComponent(a.id)}" class="news-slide-content"><span class="news-slide-kicker">${esc(a.category||'SUSTENTABILIDADE')} · ${esc(new Date(a.date).toLocaleDateString('pt-BR'))}</span><h3>${esc(a.title)}</h3><div class="news-slide-source">${esc(a.source)} <b>→</b></div></a>`;slider.insertBefore(el,controls);slides.push(el);const d=document.createElement('button');d.type='button';d.setAttribute('aria-label','Mostrar notícia '+(i+1));d.addEventListener('click',()=>{activate(i);restart()});dots.appendChild(d);});activate(0);restart();
  }).catch((err)=>{ const load=slider.querySelector('.news-home-loading'); if(load){ load.innerHTML='<strong>Eco News</strong><br><span>As notícias estão sendo atualizadas. Tente novamente em instantes.</span>'; } console.warn('Eco News:',err); });
  slider.querySelector('.news-slide-next')?.addEventListener('click',()=>{activate(current+1);restart()});slider.querySelector('.news-slide-prev')?.addEventListener('click',()=>{activate(current-1);restart()});slider.addEventListener('mouseenter',()=>clearInterval(timer));slider.addEventListener('mouseleave',restart);
})();
