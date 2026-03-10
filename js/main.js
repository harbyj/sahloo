/* Sahloo — main.js v2 */
'use strict';

// ── Dark Mode ──────────────────────────────────────────
const THEME_KEY = 'sahloo_theme';
const THEMES    = ['light','dark','auto'];
const ICONS     = { light:'☀️', dark:'🌙', auto:'💻' };
const TIPS      = { light:'الوضع الفاتح', dark:'الوضع الداكن', auto:'نظام التشغيل' };

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
}
function nextTheme(cur) {
  return THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
  updateThemeBtn(saved);
}
function updateThemeBtn(t) {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.textContent = ICONS[t];
    btn.setAttribute('title', TIPS[t]);
    btn.setAttribute('aria-label', TIPS[t]);
  });
}
function toggleTheme() {
  const cur  = localStorage.getItem(THEME_KEY) || 'light';
  const next = nextTheme(cur);
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  updateThemeBtn(next);
}

// ── Mobile drawer ──────────────────────────────────────
function initDrawer() {
  const btn     = document.querySelector('.hamburger-btn');
  const drawer  = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  if (!btn || !drawer) return;

  function open() {
    drawer.classList.add('open');
    overlay && overlay.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    drawer.classList.remove('open');
    overlay && overlay.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', () => drawer.classList.contains('open') ? close() : open());
  overlay && overlay.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

// ── Tool search ────────────────────────────────────────
function initSearch() {
  const inp = document.getElementById('toolSearch');
  if (!inp) return;
  inp.addEventListener('input', () => {
    const q = inp.value.trim().toLowerCase();
    document.querySelectorAll('.tool-card[data-name]').forEach(card => {
      const hay = (card.dataset.name + ' ' + (card.dataset.kw||'')).toLowerCase();
      card.style.display = (!q || hay.includes(q)) ? '' : 'none';
    });
    // show/hide section headers when empty
    document.querySelectorAll('.tools-section .section-hd').forEach(hd => {
      const grid = hd.nextElementSibling;
      if (!grid) return;
      const visible = [...grid.querySelectorAll('.tool-card')].some(c => c.style.display !== 'none');
      hd.style.display = visible ? '' : 'none';
    });
  });
}

// ── Category filter ────────────────────────────────────
function initCatFilter() {
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      document.querySelectorAll('.tool-card[data-cat]').forEach(card => {
        card.style.display = (!cat || cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}

// ── FAQ accordion ──────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const open = item.classList.contains('open');
      // close others
      item.closest('.faq-list')?.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-q')?.setAttribute('aria-expanded','false');
      });
      if (!open) {
        item.classList.add('open');
        q.setAttribute('aria-expanded','true');
      }
    });
  });
}

// ── Number formatting helpers ──────────────────────────
window.fmtN = (n, dec=2) =>
  new Intl.NumberFormat('ar-SA', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);
window.fmtI = n =>
  new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(n);

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDrawer();
  initSearch();
  initCatFilter();
  initFAQ();

  // theme button click
  document.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', toggleTheme));
});

document.addEventListener("DOMContentLoaded", function () {

  const langButtons = document.querySelectorAll(".lang-switch");
  if (!langButtons.length) return;

  const path = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;

  let newPath;

  if (path.startsWith("/en")) {
    newPath = path.replace(/^\/en/, "") || "/";
  } else {
    newPath = "/en" + (path === "/" ? "" : path);
  }

  const targetUrl = newPath + search + hash;

  langButtons.forEach(btn => {
    btn.href = targetUrl;
  });

});