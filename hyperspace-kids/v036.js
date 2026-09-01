(() => {
  'use strict';

  const cards = [
    {
      title: 'Void Fox', titleCaps: 'VOID FOX', rarity: 'epic', rarityLabel: 'EPIC', serial: '023 / 100', id: 'HK-0043',
      image: './assets/v036/void-fox-art-v1.webp', alt: 'Void Fox emerging through a violet dimensional fracture',
      origin: 'THE VOID', cardClass: 'EPIC · COMPANION', accent: '#a873ff',
      thesis: 'The frame-break benchmark. One iconic companion, rendered as a complete collectible before any digital material is applied.',
      test: 'FRAME-BREAK / SILHOUETTE', material: 'MATTE BLACK · VIOLET SPOT FOIL', state: 'COLLECTOR STUDY 01'
    },
    {
      title: 'The First Reply', titleCaps: 'THE FIRST REPLY', rarity: 'legendary', rarityLabel: 'LEGENDARY', serial: '007 / 025', id: 'HK-0044',
      image: './assets/v036/first-reply-art-v1.webp', alt: 'A delicate ivory-gold signal blooming in an infinite dark space',
      origin: 'THE NEXUS', cardClass: 'LEGENDARY · MEMORY', accent: '#e5c47c',
      thesis: 'The beauty benchmark. No character, no spectacle—just an image strong enough to deserve a wall, a frame and a memory.',
      test: 'BEAUTY / EMOTIONAL HOLD', material: 'SOFT-TOUCH BLACK · CHAMPAGNE FOIL', state: 'COLLECTOR STUDY 02'
    },
    {
      title: 'Rift Seed', titleCaps: 'RIFT SEED', rarity: 'mythic', rarityLabel: 'MYTHIC', serial: '001 / 010', id: 'HK-0045',
      image: './assets/v036/rift-seed-art-v1.webp', alt: 'An obsidian Rift Seed containing a compressed spiral universe',
      origin: 'THE NEXUS', cardClass: 'MYTHIC · WORLD OBJECT', accent: '#b9dfff',
      thesis: 'The Mythic benchmark. A single grail object, serialised into the lore. The card stays pristine while reality changes around it.',
      test: 'GRAIL / SERIAL DESIRE', material: 'OBSIDIAN STOCK · OPAL SELECTIVE HOLO', state: 'COLLECTOR STUDY 03'
    }
  ];

  const $ = (selector) => document.querySelector(selector);
  const card = $('#collector-card');
  const stillToggle = $('#still-toggle');
  const materialToggle = $('#material-toggle');
  let active = 0;
  let inspecting = false;

  function text(selector, value) { const el = $(selector); if (el) el.textContent = value; }

  function render(index) {
    active = index;
    const data = cards[index];
    document.documentElement.style.setProperty('--accent', data.accent);
    card.style.setProperty('--card-accent', data.accent);
    card.dataset.rarity = data.rarity;
    card.setAttribute('aria-label', `${data.title}, ${data.rarityLabel}, serial ${data.serial.replace('/', 'of')}`);
    $('#card-art').src = data.image;
    $('#card-art').alt = data.alt;
    text('#object-number', String(index + 1).padStart(2, '0'));
    text('#selected-title', data.title);
    text('#selected-thesis', data.thesis);
    text('#selected-test', data.test);
    text('#selected-material', data.material);
    text('#selected-state', data.state);
    text('#rarity-line span', `${data.rarityLabel} · ${data.serial}`);
    text('#card-id', data.id);
    text('#card-title', data.titleCaps);
    text('#card-class', data.cardClass);
    text('#card-origin', data.origin);
    text('#card-serial', data.serial);
    document.querySelectorAll('.selector').forEach((button, i) => {
      button.classList.toggle('active', i === index);
      button.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
  }

  function setInspect(on) {
    inspecting = on;
    card.classList.toggle('still', !on);
    card.classList.toggle('inspecting', on);
    stillToggle.classList.toggle('active', !on);
    materialToggle.classList.toggle('active', on);
    stillToggle.setAttribute('aria-pressed', String(!on));
    materialToggle.setAttribute('aria-pressed', String(on));
    text('#inspection-note', on
      ? 'Move across the surface. Light responds; the card does not move.'
      : 'A collectible first. Effects are currently disabled.');
    if (!on) {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    }
  }

  card.addEventListener('pointermove', (event) => {
    if (!inspecting) return;
    const rect = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
  });

  stillToggle.addEventListener('click', () => setInspect(false));
  materialToggle.addEventListener('click', () => setInspect(true));
  document.querySelectorAll('.selector').forEach(button => {
    button.addEventListener('click', () => render(Number(button.dataset.card)));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') render((active + 1) % cards.length);
    if (event.key === 'ArrowLeft') render((active - 1 + cards.length) % cards.length);
  });

  render(0);
  setInspect(false);
})();
