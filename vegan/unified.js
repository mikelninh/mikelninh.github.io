(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const products = Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : [];
  const TIERS = ['S', 'A', 'B', 'C', 'F', 'pool'];
  const STORAGE = 'plant-table-ramen-v2';
  const LEGACY_STORAGE = 'michael-ramen-passport-v1';
  const LANG_STORAGE = 'michael-site-language';

  const copy = {
    en: {
      filters: { all: 'All', verified: 'Vegan verified', check: 'Check pack', not: 'Not vegan', tasted: 'Tasted', untasted: 'Not tasted' },
      vegan: { verified: 'Vegan verified', check: 'Check exact pack', not: 'Not vegan', vegetarian: 'Vegetarian · not verified' },
      tiers: { S: 'instant rebuy', A: 'excellent', B: 'good, but', C: 'emergency only', F: 'never again', pool: 'Place it…' },
      visible: 'visible', unranked: 'unranked', source: 'Evidence', buy: 'Buy / find', tasted: 'Tasted', markTasted: 'Mark tasted', noResults: 'No ramen match this view.',
      copied: 'Passport copied.', shared: 'Share sheet opened.', reset: 'Passport reset.', bowlCopied: 'Bowl copied.', copyFailed: 'Copy failed.',
      search: 'Brand, product or country…', base: 'Base'
    },
    de: {
      filters: { all: 'Alle', verified: 'Vegan bestätigt', check: 'Packung prüfen', not: 'Nicht vegan', tasted: 'Probiert', untasted: 'Nicht probiert' },
      vegan: { verified: 'Vegan bestätigt', check: 'Konkrete Packung prüfen', not: 'Nicht vegan', vegetarian: 'Vegetarisch · nicht bestätigt' },
      tiers: { S: 'sofort nachkaufen', A: 'sehr stark', B: 'gut, aber', C: 'nur im Notfall', F: 'nie wieder', pool: 'Einordnen …' },
      visible: 'sichtbar', unranked: 'noch offen', source: 'Nachweis', buy: 'Kaufen / finden', tasted: 'Probiert', markTasted: 'Als probiert markieren', noResults: 'Keine Ramen passen zu dieser Ansicht.',
      copied: 'Pass kopiert.', shared: 'Teilen geöffnet.', reset: 'Pass zurückgesetzt.', bowlCopied: 'Bowl kopiert.', copyFailed: 'Kopieren fehlgeschlagen.',
      search: 'Marke, Produkt oder Land …', base: 'Basis'
    }
  };

  const state = {
    lang: localStorage.getItem(LANG_STORAGE) === 'de' ? 'de' : 'en',
    filter: 'all',
    query: '',
    ranking: null,
    tasted: {},
    selectedId: null,
    stapleFilter: 'all',
    bowlGoal: 'balanced',
    lastBowl: ''
  };

  const bowlParts = {
    balanced: {
      veg: { en: ['broccoli + mushrooms', 'pak choi + carrots', 'spinach + sweetcorn', 'cabbage + peas'], de: ['Brokkoli + Pilze', 'Pak Choi + Karotten', 'Spinat + Mais', 'Kohl + Erbsen'] },
      protein: { en: ['crispy tofu', 'smoked tofu', 'edamame', 'pan-fried tempeh'], de: ['knuspriger Tofu', 'Räuchertofu', 'Edamame', 'gebratener Tempeh'] },
      finish: { en: ['spring onion + sesame', 'lime + coriander', 'nori + chilli crisp', 'ginger + peanuts'], de: ['Frühlingszwiebel + Sesam', 'Limette + Koriander', 'Nori + Chili Crisp', 'Ingwer + Erdnüsse'] }
    },
    protein: {
      veg: { en: ['broccoli + edamame', 'pak choi + mushrooms', 'spinach + peas'], de: ['Brokkoli + Edamame', 'Pak Choi + Pilze', 'Spinat + Erbsen'] },
      protein: { en: ['200 g crispy tofu', 'tempeh + edamame', 'smoked tofu + soy beans'], de: ['200 g knuspriger Tofu', 'Tempeh + Edamame', 'Räuchertofu + Sojabohnen'] },
      finish: { en: ['sesame + nori', 'peanuts + lime', 'spring onion + chilli'], de: ['Sesam + Nori', 'Erdnüsse + Limette', 'Frühlingszwiebel + Chili'] }
    },
    creamy: {
      veg: { en: ['mushrooms + spinach', 'broccoli + sweetcorn', 'pak choi + carrots'], de: ['Pilze + Spinat', 'Brokkoli + Mais', 'Pak Choi + Karotten'] },
      protein: { en: ['silken tofu', 'crispy tofu', 'edamame'], de: ['Seidentofu', 'knuspriger Tofu', 'Edamame'] },
      finish: { en: ['tahini + lime', 'peanut butter + chilli crisp', 'soy milk + miso'], de: ['Tahin + Limette', 'Erdnussmus + Chili Crisp', 'Sojamilch + Miso'] }
    },
    fresh: {
      veg: { en: ['pak choi + bean sprouts', 'cabbage + carrots', 'spinach + mushrooms'], de: ['Pak Choi + Sojasprossen', 'Kohl + Karotten', 'Spinat + Pilze'] },
      protein: { en: ['lime-marinated tofu', 'crispy tempeh', 'edamame'], de: ['Limetten-Tofu', 'knuspriger Tempeh', 'Edamame'] },
      finish: { en: ['lime + coriander + chilli', 'rice vinegar + spring onion', 'kimchi-style vegetables + sesame'], de: ['Limette + Koriander + Chili', 'Reisessig + Frühlingszwiebel', 'Kimchi-Gemüse + Sesam'] }
    }
  };

  const t = key => copy[state.lang][key];
  const current = value => typeof value === 'object' && value ? (value[state.lang] || value.en || '') : (value || '');
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const randomFrom = list => list[Math.floor(Math.random() * list.length)];
  const byId = new Map(products.map(item => [item.id, item]));

  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
  function saveJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

  function initialState() {
    const stored = readJSON(STORAGE, null) || readJSON(LEGACY_STORAGE, null) || {};
    const ranking = Object.fromEntries(TIERS.map(tier => [tier, []]));
    const valid = new Set(products.map(item => item.id));
    const seen = new Set();
    TIERS.forEach(tier => (stored.ranking?.[tier] || []).forEach(id => {
      if (valid.has(id) && !seen.has(id)) { ranking[tier].push(id); seen.add(id); }
    }));
    products.forEach(item => { if (!seen.has(item.id)) ranking.pool.push(item.id); });
    state.ranking = ranking;
    state.tasted = stored.tasted || {};
  }

  function save() { saveJSON(STORAGE, { ranking: state.ranking, tasted: state.tasted }); }
  function placement(id) { return TIERS.find(tier => state.ranking[tier].includes(id)) || 'pool'; }
  function veganStatus(item) { return ['verified', 'not', 'vegetarian'].includes(item.vegan) ? item.vegan : 'check'; }
  function imageFor(item) { return item.image || fallbackImage(item); }

  function fallbackImage(item) {
    const hue = Math.abs([...String(item.id)].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 190"><rect width="260" height="190" rx="24" fill="hsl(${hue} 52% 76%)"/><rect x="18" y="16" width="224" height="158" rx="20" fill="rgba(255,255,255,.18)" stroke="#172018" stroke-width="4"/><path d="M68 101h124c-7 37-28 57-62 57s-55-20-62-57Z" fill="#fff9e8" stroke="#172018" stroke-width="5"/><path d="M82 118c20-14 34 11 51-2s34 11 50-2" fill="none" stroke="#d98c31" stroke-width="7" stroke-linecap="round"/><text x="25" y="42" font-family="Arial" font-size="14" font-weight="700" fill="#172018">${escapeHTML(item.brand).slice(0, 26)}</text><text x="25" y="177" font-family="Arial" font-size="14" font-weight="800" fill="#172018">${escapeHTML(item.name).slice(0, 31)}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function matches(item) {
    const q = state.query.trim().toLowerCase();
    const haystack = `${item.brand} ${item.name} ${item.country || ''} ${item.style || ''} ${item.market || ''}`.toLowerCase();
    if (q && !haystack.includes(q)) return false;
    const status = veganStatus(item);
    if (state.filter === 'verified') return status === 'verified';
    if (state.filter === 'check') return status === 'check' || status === 'vegetarian';
    if (state.filter === 'not') return status === 'not';
    if (state.filter === 'tasted') return Boolean(state.tasted[item.id]);
    if (state.filter === 'untasted') return !state.tasted[item.id];
    return true;
  }

  function filterCount(key) {
    if (key === 'all') return products.length;
    if (key === 'verified') return products.filter(item => veganStatus(item) === 'verified').length;
    if (key === 'check') return products.filter(item => ['check', 'vegetarian'].includes(veganStatus(item))).length;
    if (key === 'not') return products.filter(item => veganStatus(item) === 'not').length;
    if (key === 'tasted') return products.filter(item => state.tasted[item.id]).length;
    if (key === 'untasted') return products.filter(item => !state.tasted[item.id]).length;
    return 0;
  }

  function renderFilters() {
    const keys = ['all', 'verified', 'check', 'not', 'tasted', 'untasted'];
    $('#filters').innerHTML = keys.map(key => `<button class="ramen-filter ${state.filter === key ? 'active' : ''}" data-filter="${key}" type="button"><span>${escapeHTML(t('filters')[key])}</span><b>${filterCount(key)}</b></button>`).join('');
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      renderFilters(); renderProducts();
    }));
  }

  function tierOptions(selected) {
    return TIERS.map(tier => `<option value="${tier}" ${tier === selected ? 'selected' : ''}>${tier === 'pool' ? escapeHTML(t('tiers').pool) : `${tier} · ${escapeHTML(t('tiers')[tier])}`}</option>`).join('');
  }

  function productCard(item) {
    const status = veganStatus(item);
    const source = item.source ? `<a href="${escapeHTML(item.source)}" target="_blank" rel="noopener">${escapeHTML(t('source'))} ↗</a>` : '';
    const buyUrl = item.buy || `https://www.google.com/search?q=${encodeURIComponent(`${item.brand} ${item.name} kaufen Deutschland`)}`;
    return `<article class="product-card" draggable="true" data-id="${escapeHTML(item.id)}">
      <div class="product-image"><span class="product-rank">#${escapeHTML(item.rank || '—')}</span><img src="${escapeHTML(imageFor(item))}" alt="${escapeHTML(item.brand)} ${escapeHTML(item.name)}" loading="lazy" data-image-id="${escapeHTML(item.id)}"></div>
      <div class="product-body"><span class="product-brand">${escapeHTML(item.brand)} · ${escapeHTML(item.country || '')}</span><h4>${escapeHTML(item.name)}</h4>
        <div class="product-meta"><span>${escapeHTML(item.style || 'Ramen')}</span><span>🌶 ${escapeHTML(item.spice ?? 0)}/5</span>${item.gtin ? `<span>GTIN ${escapeHTML(item.gtin)}</span>` : ''}</div>
        <div class="badges"><span class="badge ${status}">${escapeHTML(t('vegan')[status])}</span></div>
        <p class="product-evidence">${escapeHTML(current(item.evidence) || current(item.reason) || '')}</p>
        <div class="product-links">${source}<a href="${escapeHTML(buyUrl)}" target="_blank" rel="noopener">${escapeHTML(t('buy'))} ↗</a></div>
        <div class="product-actions"><select class="place-select" data-place="${escapeHTML(item.id)}" aria-label="Rank ${escapeHTML(item.name)}">${tierOptions(placement(item.id))}</select><button class="tasted-button ${state.tasted[item.id] ? 'on' : ''}" data-tasted="${escapeHTML(item.id)}" type="button" title="${escapeHTML(state.tasted[item.id] ? t('tasted') : t('markTasted'))}">✓</button></div>
      </div></article>`;
  }

  function renderBoard() {
    const colors = { S: '#d9ff55', A: '#f3c97d', B: '#d9d2bf', C: '#c6d1c8', F: '#ddaa98' };
    $('#board').innerHTML = ['S', 'A', 'B', 'C', 'F'].map(tier => `<div class="tier-row"><div class="tier-label" style="--tier:${colors[tier]}"><div><strong>${tier}</strong><small>${escapeHTML(t('tiers')[tier])}</small></div></div><div class="tier-zone" data-tier="${tier}"></div></div>`).join('');
    $$('.tier-zone').forEach(zone => {
      zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('over'));
      zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('over'); move(event.dataTransfer.getData('text/plain'), zone.dataset.tier); });
    });
  }

  function renderProducts() {
    let visible = 0;
    ['S', 'A', 'B', 'C', 'F'].forEach(tier => {
      const items = state.ranking[tier].map(id => byId.get(id)).filter(Boolean).filter(matches);
      visible += items.length;
      const zone = $(`.tier-zone[data-tier="${tier}"]`);
      zone.innerHTML = items.map(productCard).join('');
    });
    const poolItems = state.ranking.pool.map(id => byId.get(id)).filter(Boolean).filter(matches);
    visible += poolItems.length;
    $('#pool').innerHTML = poolItems.length ? poolItems.map(productCard).join('') : `<div class="empty-state">${escapeHTML(t('noResults'))}</div>`;
    $('#poolCount').textContent = `${state.ranking.pool.length}/${products.length}`;
    $('#resultCount').textContent = `${visible}/${products.length}`;
    bindProductCards(); updateStats();
  }

  function bindProductCards() {
    $$('.product-card').forEach(card => {
      card.addEventListener('dragstart', event => { card.classList.add('dragging'); event.dataTransfer.setData('text/plain', card.dataset.id); });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
    });
    $$('[data-place]').forEach(select => select.addEventListener('change', () => move(select.dataset.place, select.value)));
    $$('[data-tasted]').forEach(button => button.addEventListener('click', () => toggleTasted(button.dataset.tasted)));
    $$('[data-image-id]').forEach(image => image.addEventListener('error', () => {
      const item = byId.get(image.dataset.imageId); if (item) image.src = fallbackImage(item);
    }, { once: true }));
  }

  function move(id, tier) {
    if (!byId.has(id) || !TIERS.includes(tier)) return;
    TIERS.forEach(key => { state.ranking[key] = state.ranking[key].filter(value => value !== id); });
    state.ranking[tier].push(id); save(); renderProducts();
    const item = byId.get(id); $('#status').textContent = `${item.brand} ${item.name} → ${tier === 'pool' ? t('unranked') : tier}`;
    if ($('#modal').classList.contains('open')) closeModal();
  }

  function toggleTasted(id) {
    state.tasted[id] = !state.tasted[id]; save(); renderFilters(); renderProducts();
  }

  function updateStats() {
    const ranked = ['S', 'A', 'B', 'C', 'F'].reduce((sum, tier) => sum + state.ranking[tier].length, 0);
    const tasted = products.filter(item => state.tasted[item.id]).length;
    const verified = products.filter(item => veganStatus(item) === 'verified').length;
    const check = products.filter(item => ['check', 'vegetarian'].includes(veganStatus(item))).length;
    const not = products.filter(item => veganStatus(item) === 'not').length;
    $('#totalStat').textContent = products.length; $('#verifiedStat').textContent = verified; $('#checkStat').textContent = check; $('#notStat').textContent = not;
    $('#rankedStat').textContent = ranked; $('#tastedStat').textContent = tasted; $('#rankedCount').textContent = `${ranked}/${products.length}`; $('#tastedCount').textContent = `${tasted}/${products.length}`;
    $('#rankedBar').style.width = `${products.length ? ranked / products.length * 100 : 0}%`; $('#tastedBar').style.width = `${products.length ? tasted / products.length * 100 : 0}%`;
  }

  function randomPick() {
    const matching = products.filter(matches);
    const untasted = matching.filter(item => !state.tasted[item.id]);
    const choices = untasted.length ? untasted : (matching.length ? matching : products);
    if (!choices.length) return;
    const item = randomFrom(choices); state.selectedId = item.id;
    $('#pickImage').src = imageFor(item); $('#pickImage').alt = `${item.brand} ${item.name}`; $('#pickBrand').textContent = `${item.brand} · ${item.country || ''}`; $('#pickName').textContent = item.name;
    $('#pickMeta').textContent = `${item.style || 'Ramen'} · 🌶 ${item.spice ?? 0}/5 · ${t('vegan')[veganStatus(item)]}`;
    $('#pickEvidence').textContent = current(item.evidence) || current(item.reason) || '';
    const buyUrl = item.buy || `https://www.google.com/search?q=${encodeURIComponent(`${item.brand} ${item.name} kaufen Deutschland`)}`;
    $('#pickLinks').innerHTML = `${item.source ? `<a href="${escapeHTML(item.source)}" target="_blank" rel="noopener">${escapeHTML(t('source'))} ↗</a>` : ''}<a href="${escapeHTML(buyUrl)}" target="_blank" rel="noopener">${escapeHTML(t('buy'))} ↗</a>`;
    const colors = { S: '#d9ff55', A: '#f3c97d', B: '#d9d2bf', C: '#c6d1c8', F: '#ddaa98' };
    $('#rankButtons').innerHTML = ['S', 'A', 'B', 'C', 'F'].map(tier => `<button class="rank-button" style="--tier:${colors[tier]}" data-modal-rank="${tier}" type="button">${tier}</button>`).join('');
    $$('[data-modal-rank]').forEach(button => button.addEventListener('click', () => move(item.id, button.dataset.modalRank)));
    $('#pickTasted').textContent = state.tasted[item.id] ? `✓ ${t('tasted')}` : t('markTasted');
    $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden', 'false');
  }

  function closeModal() { $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden', 'true'); }
  function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200); }

  function rankingText() {
    const title = state.lang === 'de' ? 'Mein Plant Table Ramen-Pass' : 'My Plant Table Ramen Passport';
    const rows = ['S', 'A', 'B', 'C', 'F'].map(tier => `${tier}: ${state.ranking[tier].map(id => { const item = byId.get(id); return item ? `${item.brand} ${item.name}` : id; }).join(', ') || '—'}`);
    return `${title}\n\n${rows.join('\n')}\n\nhttps://mikelninh.github.io/vegan/#ramen`;
  }

  async function copyRanking() { try { await navigator.clipboard.writeText(rankingText()); showToast(t('copied')); } catch { showToast(t('copyFailed')); } }
  async function shareRanking() {
    const text = rankingText();
    try { if (navigator.share) { await navigator.share({ title: 'Plant Table Ramen Passport', text }); showToast(t('shared')); } else { await navigator.clipboard.writeText(text); showToast(t('copied')); } }
    catch (error) { if (error?.name !== 'AbortError') showToast(t('copyFailed')); }
  }

  function resetRanking() {
    const message = state.lang === 'de' ? 'Deinen gesamten Ramen-Pass zurücksetzen?' : 'Reset your entire Ramen Passport?';
    if (!window.confirm(message)) return;
    state.ranking = { S: [], A: [], B: [], C: [], F: [], pool: products.map(item => item.id) }; state.tasted = {}; save(); renderFilters(); renderProducts(); showToast(t('reset'));
  }

  function renderStaples() {
    $$('.staple-card').forEach(card => card.classList.toggle('hidden', state.stapleFilter !== 'all' && card.dataset.staple !== state.stapleFilter));
    $$('.staple-filter').forEach(button => button.classList.toggle('active', button.dataset.stapleFilter === state.stapleFilter));
  }

  function generateBowl() {
    const parts = bowlParts[state.bowlGoal];
    const veganRamen = products.filter(item => veganStatus(item) === 'verified');
    const ramen = veganRamen.length ? randomFrom(veganRamen) : null;
    const veg = randomFrom(parts.veg[state.lang]); const protein = randomFrom(parts.protein[state.lang]); const finish = randomFrom(parts.finish[state.lang]);
    const base = ramen ? `${ramen.brand} ${ramen.name}` : (state.lang === 'de' ? 'vegan bestätigte Ramen' : 'vegan-verified ramen');
    state.lastBowl = `${t('base')}: ${base} · ${veg} · ${protein} · ${finish}`;
    $('#bowlResult').textContent = state.lastBowl; $('#bowlLabel').textContent = `${veg} + ${protein}`.toUpperCase();
  }

  async function copyBowl() { if (!state.lastBowl) generateBowl(); try { await navigator.clipboard.writeText(`${state.lastBowl}\n\nhttps://mikelninh.github.io/vegan/#bowl`); showToast(t('bowlCopied')); } catch { showToast(t('copyFailed')); } }

  function applyLanguage(lang) {
    state.lang = lang; localStorage.setItem(LANG_STORAGE, lang); document.documentElement.lang = lang;
    $$('[data-en]').forEach(node => { if (node.dataset[lang] !== undefined) node.textContent = node.dataset[lang]; });
    $$('.lang').forEach(button => button.classList.toggle('active', button.dataset.lang === lang));
    $('#search').placeholder = t('search'); renderBoard(); renderFilters(); renderProducts(); if (state.lastBowl) generateBowl();
  }

  function bind() {
    initialState(); renderBoard(); renderFilters(); renderProducts(); renderStaples(); applyLanguage(state.lang);
    $$('.lang').forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.lang)));
    $$('.staple-filter').forEach(button => button.addEventListener('click', () => { state.stapleFilter = button.dataset.stapleFilter; renderStaples(); }));
    $('#search').addEventListener('input', event => { state.query = event.target.value; renderProducts(); });
    $('#randomTop').addEventListener('click', randomPick); $('#randomTool').addEventListener('click', randomPick); $('#anotherPick').addEventListener('click', randomPick);
    $('#modalClose').addEventListener('click', closeModal); $('#modal').addEventListener('click', event => { if (event.target === $('#modal')) closeModal(); });
    $('#pickTasted').addEventListener('click', () => { if (state.selectedId) { toggleTasted(state.selectedId); $('#pickTasted').textContent = state.tasted[state.selectedId] ? `✓ ${t('tasted')}` : t('markTasted'); } });
    $('#copyRanking').addEventListener('click', copyRanking); $('#shareRanking').addEventListener('click', shareRanking); $('#resetRanking').addEventListener('click', resetRanking);
    $$('.goal').forEach(button => button.addEventListener('click', () => { state.bowlGoal = button.dataset.goal; $$('.goal').forEach(other => other.classList.toggle('active', other === button)); generateBowl(); }));
    $('#buildBowl').addEventListener('click', generateBowl); $('#copyBowl').addEventListener('click', copyBowl);
    document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#search').focus(); } if (event.key === 'Escape') closeModal(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
