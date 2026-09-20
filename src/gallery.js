// Lightbox & Filter logic for Photography & Design galleries
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Footer year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Reveal animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-inview');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
$$('.reveal').forEach(el => observer.observe(el));

// Lightbox setup
const dialog = $('#lightbox');
const lightboxImg = $('#lightbox-img');
const counterEl = $('.lightbox-counter');
const prevBtn = $('.lightbox-prev');
const nextBtn = $('.lightbox-next');
const closeBtn = $('.lightbox-close');

let items = [];
let currentIndex = 0;

function updateItems() {
  items = $$('[data-lightbox-src]:not(.is-hidden)');
}

function showImage(index) {
  if (items.length === 0) return;
  if (index < 0) index = items.length - 1;
  if (index >= items.length) index = 0;
  currentIndex = index;

  const target = items[currentIndex];
  const src = target.dataset.lightboxSrc;
  const alt = target.dataset.lightboxAlt || 'Lucas Gil Films';

  lightboxImg.src = src;
  lightboxImg.alt = alt;
  if (counterEl) {
    counterEl.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  }
}

function openLightbox(index) {
  updateItems();
  showImage(index);
  if (dialog && !dialog.open) {
    dialog.showModal();
  }
}

function closeLightbox() {
  if (dialog && dialog.open) {
    dialog.close();
    lightboxImg.src = '';
  }
}

if (dialog) {
  // Delegate clicks on gallery items
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-lightbox-src]');
    if (trigger) {
      updateItems();
      const index = items.indexOf(trigger);
      if (index !== -1) openLightbox(index);
    }
  });

  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  dialog.addEventListener('click', e => {
    if (e.target === dialog) closeLightbox();
  });

  window.addEventListener('keydown', e => {
    if (!dialog.open) return;
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    if (e.key === 'Escape') closeLightbox();
  });
}

// Client filtering for Design page
const filterBtns = $$('.filter-btn');
if (filterBtns.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.filter;
      const cards = $$('.design-card');

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.client === filter) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });

      updateItems();
    });
  });
}
