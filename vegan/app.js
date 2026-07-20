(async () => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const TIERS = ['S', 'A', 'B', 'C', 'F', 'pool'];
  const IMAGE_CACHE_KEY = 'michael-product-image-cache-v3';

  const state = {
    lang: localStorage.getItem('michael-site-language') || 'en',
    active: new URLSearchParams(location.search).get('list') || 'ramen',
    filter: 'all',
    query: '',
    ranking: {},
    tried: {},
    imageCache: readJSON(IMAGE_CACHE_KEY, {}),
    failedImages: new Set()
  };

  const copy = {
    en: {
      open: 'Unranked products', source: 'Evidence', verified: 'Vegan verified', not: 'Not vegan',
      check: 'Check this pack', vegetarian: 'Vegetarian · not verified vegan', ranked: 'ranked', tasted: 'tasted',
      verifiedCount: 'verified vegan', listLoaded: 'loaded', reset: 'reset', copied: 'Ranking copied. Your pantry has been notified.',
      noResults: 'No matching products.', openLabel: 'still unranked', randomTitle: 'Your next ramen',
      randomText: 'The noodle universe has spoken.', markTasted: 'Mark as tasted', shareTitle: 'My Global Ramen 50',
      shareText: 'I am ranking the Global Ramen 50. Come judge my choices.', cardSaved: 'Share card created.'
    },
    de: {
      open: 'Noch nicht eingeordnet', source: 'Nachweis', verified: 'Vegan bestätigt', not: 'Nicht vegan',
      check: 'Packung prüfen', vegetarian: 'Vegetarisch · nicht vegan bestätigt', ranked: 'eingeordnet', tasted: 'probiert',
      verifiedCount: 'vegan bestätigt', listLoaded: 'geladen', reset: 'zurückgesetzt', copied: 'Ranking kopiert. Der Vorratsschrank wurde informiert.',
      noResults: 'Keine passenden Produkte.', openLabel: 'noch offen', randomTitle: 'Dein nächstes Ramen',
      randomText: 'Das Nudeluniversum hat entschieden.', markTasted: 'Als probiert markieren', shareTitle: 'Meine Global Ramen 50',
      shareText: 'Ich ranke die Global Ramen 50. Komm und bewerte meine Entscheidungen.', cardSaved: 'Share Card erstellt.'
    }
  };

  function t(key) { return copy[state.lang][key] || key; }
  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
  function writeJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
  function currentText(value) { return typeof value === 'object' ? value[state.lang] || value.en : value; }

  let extraData = {milk:[], meat:[], yogurt:[], tofu:[], cheese:[]};
  try {
    const response = await fetch('product-data.json', {cache:'no-cache'});
    if (response.ok) extraData = await response.json();
  } catch (error) {
    console.warn('Could not load additional product lists.', error);
  }

  const categories = {
    ramen: {
      label:{en:'Ramen · Global 50',de:'Ramen · Global 50'},
      title:{en:'The Global Ramen 50 Challenge',de:'Die Global Ramen 50 Challenge'},
      description:{
        en:'A popularity-weighted field of global icons, cult favourites and current expert picks — built for your personal ranking, not presented as an audited worldwide sales chart.',
        de:'Ein nach Popularität gewichtetes Feld aus globalen Ikonen, Kultfavoriten und aktuellen Expertentipps — für dein persönliches Ranking, nicht als geprüfte weltweite Verkaufsrangliste.'
      },
      products:Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : [],
      method:true
    },
    milk: {
      label:{en:'Plant milk',de:'Pflanzenmilch'}, title:{en:'Plant Milk Championship',de:'Pflanzenmilch-Meisterschaft'},
      description:{en:'15 candidates ranked by taste, everyday usefulness, protein and value.',de:'15 Kandidaten nach Geschmack, Alltagstauglichkeit, Protein und Preis-Leistung.'},
      products:extraData.milk || [],
      default:{S:['alpro-soy-original','alpro-soy-no-sugars'],A:['dmbio-soy-natural'],B:['oatly-barista','alpro-not-milk-whole','alpro-coconut-original','vly-high-protein'],C:[],F:[],pool:[]}
    },
    meat: {
      label:{en:'Meat alternatives',de:'Fleischalternativen'}, title:{en:'Meat Alternatives',de:'Fleischalternativen'},
      description:{en:'Vemondo gets a large starting squad, joined by Rügenwalder, LikeMeat, Beyond and more.',de:'Vemondo bekommt ein großes Startfeld, ergänzt durch Rügenwalder, LikeMeat, Beyond und mehr.'},
      products:extraData.meat || []
    },
    yogurt: {
      label:{en:'Vegan yogurt',de:'Veganer Joghurt'}, title:{en:'The Spoon Division',de:'Die Löffel-Abteilung'},
      description:{en:'Natural, Skyr-style, high protein, fruit and coconut.',de:'Natur, Skyr-Style, High Protein, Frucht und Kokos.'},
      products:extraData.yogurt || []
    },
    tofu: {
      label:{en:'Tofu & tempeh',de:'Tofu & Tempeh'}, title:{en:'Soy Blocks of Destiny',de:'Sojablöcke des Schicksals'},
      description:{en:'Natural, smoked, marinated, fermented and tempeh.',de:'Natur, geräuchert, mariniert, fermentiert und Tempeh.'},
      products:extraData.tofu || []
    },
    cheese: {
      label:{en:'Vegan cheese',de:'Veganer Käse'}, title:{en:'Melt Responsibly',de:'Schmelzen mit Verantwortung'},
      description:{en:'Slices, grated, spreads, feta-style and fermented specialities.',de:'Scheiben, Geraspeltes, Aufstriche, Feta-Style und fermentierte Spezialitäten.'},
      products:extraData.cheese || []
    }
  };

  for (const category of Object.values(categories)) {
    category.products = category.products.map(item => ({
      country:'Germany', vegan:'check', spice:0,
      reason:{en:'Ready for a real taste test.',de:'Bereit für einen echten Geschmackstest.'},
      evidence:{en:'Check the exact product label.',de:'Konkretes Produktetikett prüfen.'},
      ...item
    }));
  }

  const milk = categories.milk;
  const preset = new Set([...milk.default.S,...milk.default.A,...milk.default.B,...milk.default.C,...milk.default.F]);
  milk.default.pool = milk.products.map(item => item.id).filter(id => !preset.has(id));
  if (!categories[state.active]) state.active = 'ramen';

  function storageKey(kind, category = state.active) { return `michael-tier-v5-${kind}-${category}`; }
  function baseRanking(key) {
    const category = categories[key];
    return category.default
      ? JSON.parse(JSON.stringify(category.default))
      : {S:[],A:[],B:[],C:[],F:[],pool:category.products.map(item => item.id)};
  }
  function loadRanking(key) {
    const raw = readJSON(storageKey('ranking', key), null);
    if (!raw) return baseRanking(key);
    const valid = new Set(categories[key].products.map(item => item.id));
    const seen = new Set();
    const output = Object.fromEntries(TIERS.map(tier => [tier, []]));
    TIERS.forEach(tier => (Array.isArray(raw[tier]) ? raw[tier] : []).forEach(id => {
      if (valid.has(id) && !seen.has(id)) { output[tier].push(id); seen.add(id); }
    }));
    categories[key].products.forEach(item => { if (!seen.has(item.id)) output.pool.push(item.id); });
    return output;
  }
  function saveState() {
    writeJSON(storageKey('ranking'), state.ranking);
    writeJSON(storageKey('tried'), state.tried);
  }
  function product(id) { return categories[state.active].products.find(item => item.id === id); }
  function placement(id) { return TIERS.find(tier => state.ranking[tier].includes(id)) || 'pool'; }
  function veganLabel(status) { return t(status || 'check'); }
  function spiceLabel(level) { return level ? `🌶 ${level}/5` : '○ 0/5'; }

  function fallbackVisual(item) {
    const hue = Math.abs([...item.id].reduce((sum,char)=>sum+char.charCodeAt(0),0)) % 360;
    const bowl = state.active === 'ramen'
      ? '<path d="M58 80h84c-4 26-19 40-42 40S62 106 58 80Z" fill="#fff8e8" stroke="#172018" stroke-width="4"/><path d="M69 91c13-9 23 8 35-1s22 8 33-1" fill="none" stroke="#da8d2f" stroke-width="5" stroke-linecap="round"/><path d="M83 60c-8-12 6-17-1-29M105 60c-8-12 7-18 0-30M126 60c-7-11 6-16 1-27" fill="none" stroke="#fff8e8" stroke-width="4" stroke-linecap="round"/>'
      : '<circle cx="100" cy="80" r="34" fill="#fff8e8" stroke="#172018" stroke-width="4"/><path d="M76 82c14-18 35-18 48 0-14 18-35 18-48 0Z" fill="#78a96f"/>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect width="200" height="150" rx="18" fill="hsl(${hue} 55% 72%)"/><circle cx="174" cy="22" r="48" fill="rgba(255,255,255,.18)"/><rect x="18" y="14" width="164" height="122" rx="14" fill="rgba(255,255,255,.08)" stroke="#172018" stroke-width="3"/>${bowl}<text x="24" y="29" font-family="Arial" font-size="10" font-weight="700">${escapeHTML(item.brand).slice(0,24)}</text><text x="24" y="129" font-family="Arial" font-size="11" font-weight="800">${escapeHTML(item.name).slice(0,26)}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function imageFor(item) {
    if (state.imageCache[item.id]) return state.imageCache[item.id];
    if (item.image && !state.failedImages.has(`${item.id}:official`)) return item.image;
    return fallbackVisual(item);
  }

  function card(item) {
    const current = placement(item.id);
    const options = [
      ['pool', state.lang==='en'?'Place it…':'Einordnen …'],
      ['S', state.lang==='en'?'S · instant rebuy':'S · sofort nachkaufen'],
      ['A', state.lang==='en'?'A · excellent':'A · sehr stark'],
      ['B', state.lang==='en'?'B · good, but':'B · gut, aber'],
      ['C', state.lang==='en'?'C · emergency only':'C · nur im Notfall'],
      ['F', state.lang==='en'?'F · never again':'F · nicht noch einmal']
    ];
    const needsLookup = !state.imageCache[item.id] && (!item.image || state.failedImages.has(`${item.id}:official`));
    const rank = item.rank ? `<span class="rank">#${item.rank}</span>` : '';
    const source = item.source ? `<a class="icon-btn" href="${escapeHTML(item.source)}" target="_blank" rel="noopener" title="${t('source')}">↗</a>` : '';
    return `<article class="product" draggable="true" data-id="${escapeHTML(item.id)}">
      <div class="pack ${needsLookup?'loading':''}">${rank}<img src="${escapeHTML(imageFor(item))}" alt="${escapeHTML(item.brand)} ${escapeHTML(item.name)} packshot" data-product-image="${escapeHTML(item.id)}"></div>
      <div><span class="brandline">${escapeHTML(item.brand)} · ${escapeHTML(item.country || '')}</span><h4>${escapeHTML(item.name)}</h4>
      <div class="facts"><span class="fact">${escapeHTML(item.style || item.type || '')}</span><span class="fact">${spiceLabel(item.spice || 0)}</span></div>
      <span class="vegan-badge ${escapeHTML(item.vegan || 'check')}">${veganLabel(item.vegan)}</span>
      <p class="evidence">${escapeHTML(currentText(item.evidence))}</p>
      <div class="product-foot"><select class="place" data-select="${escapeHTML(item.id)}">${options.map(([value,label])=>`<option value="${value}" ${value===current?'selected':''}>${label}</option>`).join('')}</select><button class="icon-btn ${state.tried[item.id]?'on':''}" data-tried="${escapeHTML(item.id)}" type="button" title="${t('markTasted')}">✓</button>${source}</div></div>
    </article>`;
  }

  function matches(item) {
    const query = state.query.trim().toLowerCase();
    const haystack = `${item.brand} ${item.name} ${item.country} ${item.style || item.type}`.toLowerCase();
    if (query && !haystack.includes(query)) return false;
    switch (state.filter) {
      case 'verified': return item.vegan === 'verified';
      case 'not': return item.vegan === 'not';
      case 'check': return item.vegan === 'check' || item.vegan === 'vegetarian';
      case 'tasted': return Boolean(state.tried[item.id]);
      case 'untasted': return !state.tried[item.id];
      case 'spicy': return (item.spice || 0) >= 4;
      default: return true;
    }
  }

  function renderTabs() {
    $('#categoryTabs').innerHTML = Object.entries(categories).map(([key,value]) =>
      `<button class="category-tab ${key===state.active?'active':''}" data-category="${key}">${escapeHTML(currentText(value.label))} · ${value.products.length}</button>`
    ).join('');
    $$('[data-category]').forEach(button => button.addEventListener('click', () => switchCategory(button.dataset.category)));
  }

  function renderFilters() {
    const labels = state.lang === 'en'
      ? {all:'All',verified:'Vegan verified',not:'Not vegan',check:'Check pack',tasted:'Tasted',untasted:'Not tasted',spicy:'Very spicy'}
      : {all:'Alle',verified:'Vegan bestätigt',not:'Nicht vegan',check:'Packung prüfen',tasted:'Probiert',untasted:'Nicht probiert',spicy:'Sehr scharf'};
    $('#filters').innerHTML = Object.entries(labels).map(([key,label]) =>
      `<button class="filter ${state.filter===key?'active':''}" data-filter="${key}">${label}</button>`
    ).join('');
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
      state.filter = button.dataset.filter; renderFilters(); render();
    }));
  }

  function render() {
    const category = categories[state.active];
    $('#challengeKicker').textContent = `${String(Object.keys(categories).indexOf(state.active)+1).padStart(2,'0')} / ${category.products.length} ${state.lang==='en'?'candidates':'Kandidaten'}`;
    $('#challengeTitle').textContent = currentText(category.title);
    $('#challengeDescription').textContent = currentText(category.description);
    $('#methodology').hidden = !category.method;
    ['S','A','B','C','F'].forEach(tier => {
      const ids = state.ranking[tier].filter(id => product(id) && matches(product(id)));
      $(`.zone[data-tier="${tier}"]`).innerHTML = ids.map(id => card(product(id))).join('');
    });
    const poolIds = state.ranking.pool.filter(id => product(id) && matches(product(id)));
    $('#pool').innerHTML = poolIds.length ? poolIds.map(id => card(product(id))).join('') : `<p class="empty">${t('noResults')}</p>`;
    $('#poolTitle').textContent = t('open');
    $('#poolCount').textContent = `${state.ranking.pool.length} / ${category.products.length} ${t('openLabel')}`;
    updateStats(); bindCards(); hydrateImages();
  }

  function updateStats() {
    const products = categories[state.active].products;
    const ranked = products.length - state.ranking.pool.length;
    const tasted = products.filter(item => state.tried[item.id]).length;
    const verified = products.filter(item => item.vegan === 'verified').length;
    $('#rankedStat').textContent = `${ranked}/${products.length}`;
    $('#tastedStat').textContent = `${tasted}/${products.length}`;
    $('#veganStat').textContent = verified;
    $('#rankedLabel').textContent = t('ranked'); $('#tastedLabel').textContent = t('tasted'); $('#veganLabel').textContent = t('verifiedCount');
    $('#passportCount').textContent = `${tasted}/${products.length}`;
    $('#passportRing').style.setProperty('--progress', `${products.length ? tasted/products.length*360 : 0}deg`);
  }

  function bindCards() {
    $$('.product').forEach(element => {
      element.addEventListener('dragstart', event => { element.classList.add('dragging'); event.dataTransfer.setData('text/plain', element.dataset.id); });
      element.addEventListener('dragend', () => element.classList.remove('dragging'));
    });
    $$('[data-select]').forEach(select => select.addEventListener('change', () => move(select.dataset.select, select.value)));
    $$('[data-tried]').forEach(button => button.addEventListener('click', () => {
      state.tried[button.dataset.tried] = !state.tried[button.dataset.tried]; saveState(); render();
    }));
    $$('[data-product-image]').forEach(image => image.addEventListener('error', () => recoverImage(image), {once:true}));
  }

  async function recoverImage(image) {
    const item = product(image.dataset.productImage);
    if (!item) return;
    state.failedImages.add(`${item.id}:official`);
    image.src = fallbackVisual(item);
    image.closest('.pack')?.classList.add('loading');
    try {
      const url = await searchOpenFoodFacts(item);
      if (url) {
        state.imageCache[item.id] = url; writeJSON(IMAGE_CACHE_KEY, state.imageCache);
        $$(`[data-product-image="${CSS.escape(item.id)}"]`).forEach(node => {
          node.src = url; node.closest('.pack')?.classList.remove('loading');
        });
      } else image.closest('.pack')?.classList.remove('loading');
    } catch { image.closest('.pack')?.classList.remove('loading'); }
  }

  function move(id, target) {
    if (!TIERS.includes(target)) return;
    TIERS.forEach(tier => state.ranking[tier] = state.ranking[tier].filter(itemId => itemId !== id));
    state.ranking[target].push(id); saveState(); render();
    setStatus(`${product(id).name} → ${target === 'pool' ? t('openLabel') : target}`);
  }

  function switchCategory(key) {
    state.active = key; state.query = ''; state.filter = 'all';
    history.replaceState(null, '', `${location.pathname}?list=${encodeURIComponent(key)}#challenge`);
    $('#productSearch').value = '';
    state.ranking = loadRanking(key); state.tried = readJSON(storageKey('tried', key), {});
    renderTabs(); renderFilters(); render(); setStatus(`${currentText(categories[key].label)} ${t('listLoaded')}.`);
  }

  async function searchOpenFoodFacts(item) {
    if (!item.imageQuery) return null;
    const fields = 'product_name,brands,image_front_url,image_front_small_url,image_url';
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(item.imageQuery)}&search_simple=1&action=process&json=1&page_size=10&fields=${fields}`;
    const response = await fetch(url, {headers:{Accept:'application/json'}});
    if (!response.ok) throw new Error(`Open Food Facts ${response.status}`);
    const payload = await response.json();
    const wanted = `${item.brand} ${item.name}`.toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 2);
    const candidates = (payload.products || []).filter(entry => entry.image_front_url || entry.image_front_small_url || entry.image_url);
    const score = entry => {
      const text = `${entry.brands || ''} ${entry.product_name || ''}`.toLowerCase();
      return wanted.reduce((total,token)=>total+(text.includes(token)?2:0),0) + (text.includes(item.brand.toLowerCase())?5:0);
    };
    candidates.sort((a,b) => score(b)-score(a));
    const best = candidates[0];
    return best ? (best.image_front_url || best.image_front_small_url || best.image_url) : null;
  }

  async function hydrateImages() {
    const queue = $$('[data-product-image]').filter(image => {
      const item = product(image.dataset.productImage);
      return item && !state.imageCache[item.id] && (!item.image || state.failedImages.has(`${item.id}:official`));
    });
    let cursor = 0;
    async function worker() {
      while (cursor < queue.length) {
        const image = queue[cursor++];
        const item = product(image.dataset.productImage);
        if (!item) continue;
        try {
          const url = await searchOpenFoodFacts(item);
          if (url) {
            state.imageCache[item.id] = url; writeJSON(IMAGE_CACHE_KEY, state.imageCache);
            $$(`[data-product-image="${CSS.escape(item.id)}"]`).forEach(node => {
              node.src = url; node.closest('.pack')?.classList.remove('loading');
            });
          } else image.closest('.pack')?.classList.remove('loading');
        } catch { image.closest('.pack')?.classList.remove('loading'); }
      }
    }
    await Promise.all([worker(), worker(), worker()]);
  }

  async function hydrateExampleImages() {
    for (const image of $$('[data-example-query]')) {
      const item = {id:`example-${image.dataset.exampleId}`,brand:image.dataset.exampleBrand||'',name:image.dataset.exampleName||'',imageQuery:image.dataset.exampleQuery};
      const cached = state.imageCache[item.id];
      if (cached) { image.src = cached; continue; }
      try {
        const url = await searchOpenFoodFacts(item);
        if (url) { image.src = url; state.imageCache[item.id] = url; writeJSON(IMAGE_CACHE_KEY,state.imageCache); }
      } catch {}
    }
  }

  function setStatus(text) { $('#status').textContent = text; }
  function showToast(text) {
    const toast = $('#toast'); toast.textContent = text; toast.classList.add('show');
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  function rankingText() {
    const lines = ['S','A','B','C','F'].map(tier => `${tier}: ${state.ranking[tier].map(id => `${product(id).brand} ${product(id).name}`).join(', ') || '—'}`);
    return `${currentText(categories[state.active].title)}\n\n${lines.join('\n')}\n\n${location.origin}${location.pathname}?list=${state.active}`;
  }
  async function copyRanking() {
    try { await navigator.clipboard.writeText(rankingText()); showToast(t('copied')); }
    catch { showToast('Copy failed.'); }
  }
  async function shareRanking() {
    const shareData = {title:t('shareTitle'),text:`${t('shareText')}\n\n${rankingText()}`,url:`${location.origin}${location.pathname}?list=${state.active}`};
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); showToast(t('copied')); }
    } catch (error) { if (error.name !== 'AbortError') showToast('Share failed.'); }
  }
  function randomPick() {
    const products = categories[state.active].products;
    const untasted = products.filter(item => !state.tried[item.id]);
    const pool = untasted.length ? untasted : products;
    if (!pool.length) return;
    const item = pool[Math.floor(Math.random()*pool.length)];
    $('#pickTitle').textContent = t('randomTitle'); $('#pickText').textContent = t('randomText');
    $('#pickName').textContent = `${item.brand} ${item.name}`;
    $('#pickMeta').textContent = `${item.country} · ${item.style || item.type} · ${spiceLabel(item.spice || 0)} · ${veganLabel(item.vegan)}`;
    $('#pickImage').src = imageFor(item); $('#pickTasted').dataset.pickTasted = item.id; $('#randomModal').classList.add('open');
    if (!state.imageCache[item.id] && (!item.image || state.failedImages.has(`${item.id}:official`))) {
      searchOpenFoodFacts(item).then(url => { if (url) { state.imageCache[item.id]=url; writeJSON(IMAGE_CACHE_KEY,state.imageCache); $('#pickImage').src=url; } }).catch(()=>{});
    }
  }
  function createShareCard() {
    const canvas = document.createElement('canvas'); canvas.width=1200; canvas.height=630;
    const context = canvas.getContext('2d'); context.fillStyle='#172018';context.fillRect(0,0,1200,630);context.fillStyle='#d8ff58';context.fillRect(0,0,42,630);
    context.fillStyle='#fffdf7';context.font='700 64px Arial';context.fillText(state.active==='ramen'?'MY GLOBAL RAMEN 50':'MY VEGAN TIER LIST',85,105);
    const products=categories[state.active].products,tasted=products.filter(item=>state.tried[item.id]).length,ranked=products.length-state.ranking.pool.length;
    context.fillStyle='#bfc8c0';context.font='28px Arial';context.fillText(`${ranked}/${products.length} ranked  ·  ${tasted}/${products.length} tasted`,88,154);
    const top=[...state.ranking.S,...state.ranking.A,...state.ranking.B].slice(0,7).map(product);
    context.fillStyle='#d8ff58';context.font='700 24px Arial';context.fillText('MY CURRENT TOP PICKS',88,225);context.font='700 34px Arial';
    top.forEach((item,index)=>{context.fillStyle=index<2?'#d8ff58':'#fffdf7';context.fillText(`${index+1}. ${item?`${item.brand} ${item.name}`:'—'}`,105,285+index*47);});
    context.fillStyle='#9ba59d';context.font='24px Arial';context.fillText('mikelninh.github.io/vegan/',88,586);
    canvas.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob],'my-ramen-tier-list.png',{type:'image/png'});
      try {
        if (navigator.canShare?.({files:[file]})) await navigator.share({title:t('shareTitle'),text:t('shareText'),files:[file]});
        else { const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);showToast(t('cardSaved')); }
      } catch (error) { if (error.name !== 'AbortError') showToast('Card export failed.'); }
    },'image/png');
  }

  function applyLanguage(lang) {
    state.lang = lang; localStorage.setItem('michael-site-language',lang); document.documentElement.lang=lang;
    $$('[data-en]').forEach(node => { const value=node.dataset[lang]; if (value!==undefined) node.textContent=value; });
    $$('[data-placeholder-en]').forEach(node => { node.placeholder = lang==='en' ? node.dataset.placeholderEn : node.dataset.placeholderDe; });
    $$('.lang').forEach(button => button.classList.toggle('active',button.dataset.lang===lang));
    renderTabs(); renderFilters(); render();
  }

  $$('.zone,#pool').forEach(zone => {
    zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('over'); move(event.dataTransfer.getData('text/plain'), zone.dataset.tier); });
  });
  $$('.lang').forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.lang)));
  $('#productSearch').addEventListener('input', event => { state.query=event.target.value; render(); });
  $('#copyRanking').addEventListener('click',copyRanking); $('#shareRanking').addEventListener('click',shareRanking); $('#shareCard').addEventListener('click',createShareCard);
  $$('[id="randomPick"]').forEach(button => button.addEventListener('click',randomPick));
  $('#resetRanking').addEventListener('click', () => { state.ranking=baseRanking(state.active); saveState(); render(); setStatus(`${currentText(categories[state.active].label)} ${t('reset')}.`); });
  $('#closeModal').addEventListener('click', () => $('#randomModal').classList.remove('open'));
  $('#randomModal').addEventListener('click', event => { if (event.target.id==='randomModal') event.currentTarget.classList.remove('open'); });
  $('#pickTasted').addEventListener('click', event => { const id=event.currentTarget.dataset.pickTasted;if(id){state.tried[id]=true;saveState();$('#randomModal').classList.remove('open');render();} });
  $$('.stack-filter').forEach(button => button.addEventListener('click', () => {
    $$('.stack-filter').forEach(other => other.classList.remove('active')); button.classList.add('active');
    const filter=button.dataset.stack; $$('.staple').forEach(card=>card.hidden=filter!=='all'&&!card.dataset.category.split(' ').includes(filter));
  }));

  state.ranking=loadRanking(state.active); state.tried=readJSON(storageKey('tried',state.active),{});
  applyLanguage(state.lang); hydrateExampleImages();
})();