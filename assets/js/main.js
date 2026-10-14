/* ==========================================================================
   Ludi Brinquedos e Infláveis – interações do site
   ========================================================================== */
(function () {
  'use strict';

  const WHATSAPP = '5515991283121';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Toast ---------- */
  function toast(message, icon = 'check_circle') {
    const container = $('#toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `<span class="material-symbols-outlined fill-icon" style="color:#00e676">${icon}</span><span></span>`;
    el.lastElementChild.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 2800);
  }

  /* ---------- Header, progresso de scroll e voltar ao topo ---------- */
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const backToTop = $('#backToTop');

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');

  function setMenu(open) {
    burger.classList.toggle('is-open', open);
    mobileMenu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
  }
  burger?.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
  $$('#mobileMenu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileMenu?.classList.contains('is-open')) setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 768 && mobileMenu?.classList.contains('is-open')) setMenu(false); });

  /* ---------- Scrollspy (link ativo do menu) ---------- */
  const navLinks = $$('.nav-link');
  const sections = navLinks.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Revelar elementos no scroll (com escalonamento) ---------- */
  $$('[data-stagger]').forEach((group) => {
    const step = parseFloat(group.dataset.stagger) || 0.1;
    const cols = parseInt(group.dataset.staggerCols, 10) || Infinity;
    $$('[data-reveal]', group).forEach((el, i) => el.style.setProperty('--reveal-delay', `${(i % cols) * step}s`));
  });

  const revealEls = $$('[data-reveal], .steps-line');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealer.observe(el));
  }

  /* ---------- Contadores animados ---------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals).replace('.', ',') + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const counters = $$('[data-count]');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    counters.forEach((el) => { el.textContent = (el.dataset.prefix || '') + el.dataset.count.replace('.', ',') + (el.dataset.suffix || ''); });
  } else {
    const counterObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => counterObs.observe(el));
  }

  /* ---------- Efeito 3D (tilt) nos cards – apenas mouse ---------- */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && !prefersReducedMotion) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // Parallax suave nas imagens do hero
    const hero = $('#hero');
    const parallax = $$('[data-parallax]');
    hero?.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      parallax.forEach((el) => {
        const depth = parseFloat(el.dataset.parallax);
        el.style.translate = `${x * depth}px ${y * depth}px`;
      });
    });
  }

  /* ---------- Ripple nos botões ---------- */
  $$('.ripple-host').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - r.left - size / 2}px`;
      span.style.top = `${e.clientY - r.top - size / 2}px`;
      btn.appendChild(span);
      span.addEventListener('animationend', () => span.remove(), { once: true });
    });
  });

  /* ---------- Filtro do catálogo ---------- */
  const filterBtns = $$('.filter-btn');
  const toyCards = $$('.toy-item');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      toyCards.forEach((card) => {
        const match = filter === 'todos' || card.dataset.category.split(' ').includes(filter);
        card.classList.remove('is-filtered-in');
        card.classList.toggle('is-hidden', !match);
        if (match) {
          card.classList.add('is-visible');
          void card.offsetWidth; // reinicia a animação
          card.classList.add('is-filtered-in');
        }
      });
    });
  });

  /* ---------- Selecionar brinquedo a partir do card ---------- */
  function highlightForm() {
    const card = $('#formCard');
    if (!card) return;
    card.classList.remove('form-highlight');
    void card.offsetWidth;
    card.classList.add('form-highlight');
  }

  $$('[data-select-toy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.selectToy;
      const checkbox = $$('input[name="brinquedos"]').find((cb) => cb.value === value);
      if (checkbox) checkbox.checked = true;
      $('#orcamento')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      setTimeout(highlightForm, 500);
      toast(`${value} adicionado ao orçamento!`, 'celebration');
    });
  });

  $$('[data-goto-form]').forEach((a) => a.addEventListener('click', () => setTimeout(highlightForm, 600)));

  /* ---------- Formulário ---------- */
  const form = $('#formOrcamento');
  const dateInput = $('#eventoData');
  if (dateInput) {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  }

  $$('input[name="brinquedos"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const count = $$('input[name="brinquedos"]:checked').length;
      const counter = $('#selectedCount');
      if (counter) counter.textContent = count ? `${count} selecionado${count > 1 ? 's' : ''}` : '';
    });
  });

  form?.addEventListener('input', (e) => e.target.classList?.remove('field-error'));

  function launchConfetti() {
    if (prefersReducedMotion) return;
    const colors = ['#00b0ff', '#feb300', '#ff817b', '#00e676', '#7c4dff'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('span');
      p.className = 'confetti-piece';
      p.style.left = `${Math.random() * 100}vw`;
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
      p.style.setProperty('--rot', `${Math.random() * 1080}deg`);
      p.style.setProperty('--dur', `${2 + Math.random() * 1.5}s`);
      p.style.animationDelay = `${Math.random() * 0.4}s`;
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove(), { once: true });
    }
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const required = $$('[required]', form);
    const invalid = required.filter((f) => !f.value.trim());
    required.forEach((f) => f.classList.toggle('field-error', !f.value.trim()));
    if (invalid.length) {
      invalid[0].focus();
      toast('Preencha os campos obrigatórios 😉', 'error');
      return;
    }

    const nome = $('#clienteNome').value.trim();
    const data = $('#eventoData').value;
    const periodo = $('#eventoPeriodo').value;
    const local = $('#eventoLocal').value.trim();
    const idade = $('#eventoIdade').value.trim();
    const obs = $('#eventoObs').value.trim();
    const selecionados = $$('input[name="brinquedos"]:checked').map((cb) => cb.value);

    const brinquedosTexto = selecionados.length ? selecionados.join(', ') : 'Nenhum pré-selecionado (gostaria de sugestão)';
    const [ano, mes, dia] = data.split('-');
    const dataFormatada = data ? `${dia}/${mes}/${ano}` : 'A definir';

    let mensagem = `🎈 *NOVO ORÇAMENTO - LUDI BRINQUEDOS E INFLÁVEIS*\n\n`;
    mensagem += `👤 *Nome:* ${nome}\n`;
    mensagem += `🎈 *Brinquedos de Interesse:* ${brinquedosTexto}\n`;
    mensagem += `📅 *Data do Evento:* ${dataFormatada}\n`;
    mensagem += `⏰ *Período/Horário:* ${periodo}\n`;
    mensagem += `📍 *Bairro / Região:* ${local}\n`;
    if (idade) mensagem += `🎂 *Tipo de Evento:* ${idade}\n`;
    if (obs) mensagem += `📝 *Observações:* ${obs}\n`;
    mensagem += `\n_Enviado pelo formulário do site da Ludi._`;

    launchConfetti();
    toast('Abrindo o WhatsApp com seu orçamento! 🎉', 'celebration');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
  });

  /* ---------- Ano no rodapé ---------- */
  const year = $('#currentYear');
  if (year) year.textContent = new Date().getFullYear();
})();
