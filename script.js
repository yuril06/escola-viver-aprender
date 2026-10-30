// Menu do celular
(() => {
  const burger = document.querySelector('[data-burger]');
  const menu = document.getElementById('menu');
  if (!burger || !menu) return;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
  };

  burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); burger.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') && !e.target.closest('[data-header]')) setOpen(false);
  });
})();

// Sombra no cabeçalho ao rolar
(() => {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => header.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);
})();

// Planejador do dia: quanto do dia (6h30–19h) a criança passa na escola
(() => {
  const planner = document.querySelector('[data-planner]');
  if (!planner) return;

  const OPEN = 6.5;
  const CLOSE = 18.8; // 18h48
  const SEMI_HOURS = 8;
  const out = (name) => planner.querySelector(`[data-out="${name}"]`);
  const tabs = [...planner.querySelectorAll('.tab')];
  const rangeBox = planner.querySelector('[data-range]');
  const range = rangeBox && rangeBox.querySelector('input');
  let current = null;

  const fmt = (h) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return mm ? `${hh}h${String(mm).padStart(2, '0')}` : `${hh}h`;
  };

  const select = (tab, focus = false) => {
    current = tab;
    const semi = tab.hasAttribute('data-semi') && range;
    if (rangeBox) rangeBox.hidden = !semi;
    const start = semi ? Number(range.value) : Number(tab.dataset.start);
    const end = semi ? start + SEMI_HOURS : Number(tab.dataset.end);
    const name = tab.dataset.name;
    if (semi) out('start').textContent = `${fmt(start)} (saída às ${fmt(end)})`;

    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-checked', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) tab.focus();

    out('hours').textContent = `${fmt(start)} às ${fmt(end)}`;
    out('total').textContent = `${fmt(end - start)} na escola`;
    out('text').textContent = tab.dataset.text;
    out('name').textContent = name;

    const span = CLOSE - OPEN;
    out('bar').style.transform = `translateX(${((start - OPEN) / span) * 100}%) scaleX(${(end - start) / span})`;

    const msg = `Olá! Quero saber sobre o ${name} na Viver Aprender (das ${fmt(start)} às ${fmt(end)}).`;
    out('link').href = `https://wa.me/5511963426916?text=${encodeURIComponent(msg)}`;
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true);
    });
  });

  if (range) range.addEventListener('input', () => { if (current) select(current); });

  select(tabs.find((t) => t.getAttribute('aria-checked') === 'true') || tabs[0]);
})();

// Entrada suave das partes de cada seção, uma vez
(() => {
  const groups = [
    ['.values', '.head > *, .value'],
    ['.spaces', '.head > *, .moment, .shot'],
    ['.school', '.school__photo, .school__copy > *'],
    ['.periods', '.head > *, .tab, .planner__card'],
    ['.classes', '.head > *, .class'],
    ['.faq', '.faq__head > *, .qa'],
    ['.enrol', '.enrol__card'],
    ['.contact', '.head > *, .info, .map'],
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
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
})();

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());
