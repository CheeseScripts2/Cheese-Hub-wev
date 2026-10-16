// ---------- Contenido editable (content.js) ----------
const CONTENT = window.SITE_CONTENT || { texts: {}, categories: [], cards: [] };
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const VISUALS = {
  ui: { cls: 'visual-ui', iconCls: 'icon-ui', html: '<div class="mini-window"><div class="mini-bar"><b></b><b></b><b></b><span>CHEESE HUB</span></div><div class="mini-body"><div class="mini-side"></div><div class="mini-lines"><i></i><i></i><i></i><strong>READY_</strong></div></div></div>' },
  hop: { cls: 'visual-hop', iconCls: 'icon-util', html: '<div class="node n1">01</div><div class="node n2">02</div><div class="node n3">03</div><svg viewBox="0 0 300 120" aria-hidden="true"><path d="M40 70 Q85 8 145 58 T260 35" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 6"/><path d="M251 27 L263 34 L253 44" fill="none" stroke="currentColor" stroke-width="2"/></svg><span class="scanline"></span>' },
  move: { cls: 'visual-move', iconCls: 'icon-move', html: '<div class="speed-lines"><i></i><i></i><i></i><i></i><i></i></div><div class="runner">➤</div><div class="speed-meter"><span>SPD</span><strong>01.55</strong><small>CONCEPT MODE</small></div>' }
};

// Textos sueltos
Object.entries(CONTENT.texts || {}).forEach(([key, value]) => {
  document.querySelectorAll('[data-text="' + key + '"]').forEach(el => { el.textContent = value; });
});
// Títulos con dos partes (la segunda va resaltada)
document.querySelectorAll('[data-title2]').forEach(el => {
  const [a, b] = el.dataset.title2.split(',');
  const t = CONTENT.texts || {};
  const span = el.querySelector('span');
  if (t[a] !== undefined && el.firstChild && el.firstChild.nodeType === 3) {
    el.firstChild.textContent = t[a] + (el.querySelector('br') ? '' : ' ');
  }
  if (t[b] !== undefined && span) span.textContent = t[b];
});

// Filtros y tarjetas
const filterTabs = document.getElementById('filterTabs');
filterTabs.innerHTML = '<button class="filter active" data-filter="all">Todos</button>' +
  (CONTENT.categories || []).map(c => '<button class="filter" data-filter="' + esc(c.id) + '">' + esc(c.label) + '</button>').join('');

const cardsGrid = document.getElementById('cardsGrid');
const emptyStateEl = document.getElementById('emptyState');
(CONTENT.cards || []).forEach(c => {
  const v = VISUALS[c.visual] || VISUALS.ui;
  const article = document.createElement('article');
  article.className = 'script-card';
  article.dataset.category = c.category || '';
  article.dataset.name = [c.title, c.description, c.tag, c.meta].join(' ').toLowerCase();
  article.innerHTML =
    '<div class="card-top"><span class="card-icon ' + v.iconCls + '">' + esc(c.icon || '✦') + '</span><span class="status"><i></i> ' + esc(c.status) + '</span></div>' +
    '<div class="card-visual ' + v.cls + '">' + v.html + '</div>' +
    '<div class="card-meta">' + esc(c.meta) + ' <span>' + esc(c.code) + '</span></div>' +
    '<h3>' + esc(c.title) + '</h3><p>' + esc(c.description) + '</p>' +
    '<div class="card-footer"><span class="tag">' + esc(c.tag) + '</span><button class="details-btn" data-title="' + esc(c.title) + '" data-description="' + esc(c.details) + '">VER DETALLES ↗</button></div>';
  cardsGrid.insertBefore(article, emptyStateEl);
});
const counterEl = document.querySelector('.counter');
if (counterEl) counterEl.dataset.target = String((CONTENT.cards || []).length).padStart(2, '0');

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menuToggle.textContent = open ? '×' : '☰';
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = '☰';
}));

const cards = [...document.querySelectorAll('.script-card')];
const filters = [...document.querySelectorAll('.filter')];
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
let currentFilter = 'all';

function filterCards() {
  const query = searchInput.value.trim().toLocaleLowerCase('es');
  let visible = 0;
  cards.forEach(card => {
    const matchesCategory = currentFilter === 'all' || card.dataset.category === currentFilter;
    const matchesQuery = (card.dataset.name + ' ' + card.innerText).toLocaleLowerCase('es').includes(query);
    const show = matchesCategory && matchesQuery;
    card.hidden = !show;
    if (show) visible++;
  });
  emptyState.hidden = visible > 0;
}
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => item.classList.toggle('active', item === button));
  currentFilter = button.dataset.filter;
  filterCards();
}));
searchInput.addEventListener('input', filterCards);

const backdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalClose = document.getElementById('modalClose');
const modalDone = document.getElementById('modalDone');
const copyScriptBtn = document.getElementById('copyScriptBtn');
const copyStatus = document.getElementById('copyStatus');
const STEAL_EGG_CODE = 'loadstring(game:HttpGet("https://luauforge-antiraw.netlify.app/raw/khub-obfuscatedlua-10-oSbVuGi8PUcoMTaWWRViafG"))()';
let previousFocus = null;
function openModal(title, description) {
  previousFocus = document.activeElement;
  modalTitle.textContent = title;
  modalDescription.textContent = description;
  const isStealEgg = title.trim().toLowerCase() === 'cheese hub steal an egg';
  copyScriptBtn.hidden = !isStealEgg;
  copyStatus.textContent = '';
  backdrop.hidden = false;
  document.body.classList.add('modal-open');
  modalClose.focus();
}
function closeModal() {
  backdrop.hidden = true;
  document.body.classList.remove('modal-open');
  if (previousFocus) previousFocus.focus();
}
document.querySelectorAll('.details-btn').forEach(button => button.addEventListener('click', () => {
  openModal(button.dataset.title, button.dataset.description);
}));
copyScriptBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(STEAL_EGG_CODE);
    copyStatus.textContent = '¡Código copiado al portapapeles!';
  } catch (error) {
    const field = document.createElement('textarea');
    field.value = STEAL_EGG_CODE;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    copyStatus.textContent = copied ? '¡Código copiado al portapapeles!' : 'No se pudo copiar automáticamente. Revisa los permisos del navegador.';
  }
});
modalClose.addEventListener('click', closeModal);
modalDone.addEventListener('click', closeModal);
backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !backdrop.hidden) closeModal(); });

document.getElementById('year').textContent = new Date().getFullYear();

// Small count-up animation for the hero stat.
const counter = document.querySelector('.counter');
const observer = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  let n = 0;
  const timer = setInterval(() => {
    n++;
    counter.textContent = String(n).padStart(2, '0');
    if (n >= Number(counter.dataset.target)) clearInterval(timer);
  }, 180);
  observer.disconnect();
}, { threshold: 0.5 });
observer.observe(counter);

// Add a subtle reveal effect while keeping content visible if observers are unavailable.
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  document.querySelectorAll('.section-head, .about-visual, .about-copy, .cta-section').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}
