(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const WA_NUMBER = '5511951952545';

  // Menu mobile acessível.
  const menuButton = $('.ecx-menu');
  const mobileMenu = $('#ecxMobileMenu');
  const backdrop = $('.ecx-mobile-backdrop');

  function closeMenu() {
    if (!menuButton || !mobileMenu) return;
    menuButton.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ecx-menu-open');
  }

  function openMenu() {
    if (!menuButton || !mobileMenu) return;
    menuButton.classList.add('is-open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Fechar menu');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ecx-menu-open');
  }

  menuButton?.addEventListener('click', () => {
    mobileMenu?.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  backdrop?.addEventListener('click', closeMenu);
  $$('.ecx-mobile-panel a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  // Sombra discreta no cabeçalho ao rolar a página.
  const header = $('.ecx-header');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Revelação leve dos blocos; o conteúdo permanece visível sem JavaScript.
  const revealItems = $$('.ecx-reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('ecx-js');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -3% 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Formulário: prepara uma mensagem para o WhatsApp sem enviar dados a um servidor.
  const contactForm = $('#ecxContactForm');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const formData = new FormData(contactForm);
    const name = String(formData.get('nome') || '').trim();
    const type = String(formData.get('tipo') || '').trim();
    const city = String(formData.get('cidade') || '').trim();
    const message = String(formData.get('mensagem') || '').trim();
    const lines = [
      'Olá, EcoMix! Gostaria de conversar sobre uma solução de reciclagem.',
      '',
      `Nome: ${name}`,
      `Tipo de local: ${type}`,
      `Cidade: ${city}`
    ];
    if (message) lines.push(`Informações adicionais: ${message}`);
    lines.push('', 'Gostaria de entender os próximos passos para uma avaliação da operação.');
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // Eco News: utiliza o endpoint atual do site. Se a API não responder, deixa um fallback claro.
  const slider = $('#newsSlider');
  if (slider) {
    const dots = $('.news-slide-dots', slider);
    const controls = $('.news-slide-controls', slider);
    let slides = [];
    let activeIndex = 0;
    let rotationTimer = null;
    let requestTimer = null;

    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
    const slugify = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
    const formatDate = value => {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
    };
    const imageUrl = (value, reference) => {
      const url = String(value || '');
      if (/^https?:\/\//i.test(url)) return `/api/image?url=${encodeURIComponent(url)}${reference ? `&ref=${encodeURIComponent(reference)}` : ''}`;
      return url || 'assets/eco-news-sem-imagem.svg';
    };

    function activate(index) {
      if (!slides.length) return;
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, position) => slide.classList.toggle('is-active', position === activeIndex));
      $$('.news-slide-dots button', slider).forEach((dot, position) => {
        dot.classList.toggle('active', position === activeIndex);
        dot.setAttribute('aria-current', position === activeIndex ? 'true' : 'false');
      });
    }
    function stopRotation() {
      if (rotationTimer) window.clearInterval(rotationTimer);
      rotationTimer = null;
    }
    function startRotation() {
      stopRotation();
      if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        rotationTimer = window.setInterval(() => activate(activeIndex + 1), 7000);
      }
    }
    function showFallback() {
      if ($('.ecx-news-fallback', slider)) return;
      $('.news-home-loading', slider)?.remove();
      controls?.setAttribute('hidden', '');
      slider.insertAdjacentHTML('afterbegin', `
        <div class="ecx-news-fallback">
          <div class="ecx-news-fallback-mark">E</div>
          <div><span>ECO NEWS · CONTEÚDO AMBIENTAL</span><h3>O que está mudando na reciclagem?</h3><p>Acompanhe notícias e conteúdos sobre resíduos, coleta seletiva, logística reversa e economia circular no portal Eco News.</p><a href="/eco-news">Acessar o Eco News <b>↗</b></a></div>
        </div>`);
    }
    function renderItems(items) {
      $('.ecx-news-fallback', slider)?.remove();
      $('.news-home-loading', slider)?.remove();
      if (!Array.isArray(items) || items.length === 0) {
        showFallback();
        return;
      }
      const cleanItems = items.filter(item => item && item.title).slice(0, 5);
      if (!cleanItems.length) {
        showFallback();
        return;
      }
      cleanItems.forEach((item, index) => {
        const storyHref = `/eco-news/${slugify(item.title || 'eco-news')}`;
        const slide = document.createElement('article');
        slide.className = `news-slide${index === 0 ? ' is-active' : ''}`;
        slide.innerHTML = `
          <a class="news-slide-image" href="${storyHref}" aria-label="Abrir notícia: ${escapeHtml(item.title)}">
            <img src="${escapeHtml(imageUrl(item.image, item.url))}" alt="" loading="${index === 0 ? 'eager' : 'lazy'}" referrerpolicy="no-referrer">
          </a>
          <a class="news-slide-content" href="${storyHref}">
            <span class="news-slide-kicker">${escapeHtml(item.category || 'ECO NEWS')}${item.date ? ` · ${escapeHtml(formatDate(item.date))}` : ''}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="ecx-news-description">${escapeHtml(item.description || 'Leia os principais destaques e consulte a publicação original.')}</p>
            <div class="news-slide-source">${escapeHtml(item.source || 'Fonte original')} <b>↗</b></div>
          </a>`;
        const img = $('img', slide);
        img?.addEventListener('error', () => { img.src = 'assets/eco-news-sem-imagem.svg'; }, { once: true });
        slider.insertBefore(slide, controls || null);
        slides.push(slide);
        if (dots) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', `Mostrar notícia ${index + 1}`);
          dot.addEventListener('click', () => { activate(index); startRotation(); });
          dots.appendChild(dot);
        }
      });
      if (controls) controls.hidden = cleanItems.length < 2;
      activate(0);
      startRotation();
      slider.dispatchEvent(new Event('eco-news-ready'));
    }

    $('.news-slide-next', slider)?.addEventListener('click', () => { activate(activeIndex + 1); startRotation(); });
    $('.news-slide-prev', slider)?.addEventListener('click', () => { activate(activeIndex - 1); startRotation(); });
    slider.addEventListener('mouseenter', stopRotation);
    slider.addEventListener('mouseleave', startRotation);
    slider.addEventListener('focusin', stopRotation);
    slider.addEventListener('focusout', startRotation);

    // Evita deixar um indicador de carregamento eterno se o endpoint estiver indisponível.
    requestTimer = window.setTimeout(() => {
      if (!slides.length && $('.news-home-loading', slider)) showFallback();
    }, 9000);
    fetch('/api/news?limit=5', { cache: 'no-store', headers: { 'Accept': 'application/json' } })
      .then(response => {
        if (!response.ok) throw new Error('Eco News indisponível');
        return response.json();
      })
      .then(data => {
        window.clearTimeout(requestTimer);
        renderItems(data.items || []);
      })
      .catch(() => {
        window.clearTimeout(requestTimer);
        if (!slides.length && $('.news-home-loading', slider)) showFallback();
        slider.dispatchEvent(new Event('eco-news-ready'));
      });
  }

  // Ano automático no rodapé.
  $$('[data-current-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
})();
