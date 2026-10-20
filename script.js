// Planejador do dia: mostra quanto do dia (6h30–19h) a criança passa na escola
(() => {
  const planner = document.querySelector('[data-planner]');
  if (!planner) return;

  const OPEN = 6.5;
  const CLOSE = 19;
  const out = (name) => planner.querySelector(`[data-out="${name}"]`);
  const options = [...planner.querySelectorAll('.opt')];

  const fmt = (h) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return mm ? `${hh}h${String(mm).padStart(2, '0')}` : `${hh}h`; // taste-skill-ignore: horário (6h30)
  };

  const select = (btn, focus = false) => {
    const start = Number(btn.dataset.start);
    const end = Number(btn.dataset.end);
    const name = btn.dataset.name;

    options.forEach((o) => {
      const on = o === btn;
      o.setAttribute('aria-checked', String(on));
      o.tabIndex = on ? 0 : -1;
    });
    if (focus) btn.focus();

    out('hours').textContent = `${fmt(start)} às ${fmt(end)}`;
    out('total').textContent = `${fmt(end - start)} na escola`;
    out('text').textContent = btn.dataset.text;
    out('name').textContent = name;

    const bar = out('bar');
    const span = CLOSE - OPEN;
    bar.style.transform = `translateX(${((start - OPEN) / span) * 100}%) scaleX(${(end - start) / span})`;

    const msg = `Olá! Quero saber sobre o ${name} na Viver Aprender (das ${fmt(start)} às ${fmt(end)}).`;
    out('link').href = `https://wa.me/5511963426916?text=${encodeURIComponent(msg)}`;
  };

  options.forEach((btn, i) => {
    btn.addEventListener('click', () => select(btn));
    btn.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(options[(i + keys[e.key] + options.length) % options.length], true);
    });
  });

  select(options.find((o) => o.getAttribute('aria-checked') === 'true') || options[0]);
})();

// Entrada das partes de cada seção, uma vez
(() => {
  const groups = [
    ['.about', '.about__title, .about__text'],
    ['.periods', '.periods__head h2, .periods__head p, .opt, .planner__day'],
    ['.extra', '.extra__section, .extra__img, .extra__text, .extra__name'],
    ['.enrol', '.tile'],
    ['.contact', '.row, .map'],
    ['.footer', '.footer__notes, .footer__sign, .footer__phone, .footer__meta'],
  ];
  const targets = [];
  groups.forEach(([parent, kids]) => {
    document.querySelectorAll(parent).forEach((p) => {
      p.querySelectorAll(kids).forEach((el, i) => {
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--i', String(Math.min(i, 6)));
        targets.push(el);
      });
    });
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
})();

// Foto da fachada desliza devagar com a rolagem
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const media = document.querySelector('.hero__media');
  if (!media) return;
  const img = media.querySelector('img');
  let ticking = false;
  const update = () => {
    const r = media.getBoundingClientRect();
    const p = Math.max(-1, Math.min(1, r.top / window.innerHeight));
    img.style.translate = `0 ${(-p * 24).toFixed(1)}px`;
    img.style.scale = '1.06';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  setTimeout(update, 1800);
})();
