(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const TIERS = ['S', 'A', 'B', 'C', 'F', 'pool'];
  const IMAGE_CACHE_KEY = 'michael-product-image-cache-v2';
  const state = {
    lang: localStorage.getItem('michael-site-language') || 'en',
    active: new URLSearchParams(location.search).get('list') || 'ramen',
    filter: 'all',
    query: '',
    ranking: {},
    tried: {},
    imageCache: readJSON(IMAGE_CACHE_KEY, {})
  };

  const copy = {
    en: {
      open: 'Unranked products', drop: 'Drop products here', source: 'Evidence', loading: 'Finding real packshot…',
      verified: 'Vegan verified', not: 'Not vegan', check: 'Check this pack', vegetarian: 'Vegetarian · not verified vegan',
      ranked: 'ranked', tasted: 'tasted', verifiedCount: 'verified vegan', listLoaded: 'loaded', reset: 'reset', copied: 'Ranking copied. Your pantry has been notified.',
      noResults: 'No matching products.', openLabel: 'still unranked', randomTitle: 'Your next ramen', randomText: 'The noodle universe has spoken.', close: 'Close', markTasted: 'Mark as tasted',
      shareTitle: 'My Global Ramen 50', shareText: 'I am ranking the Global Ramen 50. Come judge my choices.', cardSaved: 'Share card created.', imageFallback: 'Illustrated fallback'
    },
    de: {
      open: 'Noch nicht eingeordnet', drop: 'Produkte hier ablegen', source: 'Nachweis', loading: 'Echtes Produktbild wird gesucht…',
      verified: 'Vegan bestätigt', not: 'Nicht vegan', check: 'Packung prüfen', vegetarian: 'Vegetarisch · nicht vegan bestätigt',
      ranked: 'eingeordnet', tasted: 'probiert', verifiedCount: 'vegan bestätigt', listLoaded: 'geladen', reset: 'zurückgesetzt', copied: 'Ranking kopiert. Der Vorratsschrank wurde informiert.',
      noResults: 'Keine passenden Produkte.', openLabel: 'noch offen', randomTitle: 'Dein nächstes Ramen', randomText: 'Das Nudeluniversum hat entschieden.', close: 'Schließen', markTasted: 'Als probiert markieren',
      shareTitle: 'Meine Global Ramen 50', shareText: 'Ich ranke die Global Ramen 50. Komm und bewerte meine Entscheidungen.', cardSaved: 'Share Card erstellt.', imageFallback: 'Illustrierter Ersatz'
    }
  };

  function t(key) { return copy[state.lang][key] || key; }
  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
  function writeJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  const P = (brand, name, type, query, country = 'Germany', vegan = 'check', spice = 0) => ({
    id: `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    brand, name, type, imageQuery: query, country, vegan, spice,
    reason: {en:'Ready for a real taste test.', de:'Bereit für einen echten Geschmackstest.'},
    evidence: {en:'Check the exact product label.', de:'Konkretes Produktetikett prüfen.'}
  });

  const milk = [
    P('Alpro','Soy Original','Soy','Alpro Soy Original 1L carton','Belgium','check'),P('Alpro','Soy No Sugars','Soy','Alpro Soy No Sugars 1L carton','Belgium','check'),P('dmBio','Soy Drink Natural','Soy','dmBio Soja Drink Natur carton','Germany','check'),P('Oatly','Barista Edition','Oat barista','Oatly Barista Edition 1L','Sweden','check'),P('vly','High Protein','Pea','vly High Protein drink carton','Germany','check'),P('vly','Barista','Pea barista','vly Barista drink carton','Germany','check'),P('Natumi','Oat Barista','Oat barista','Natumi Hafer Barista carton','Germany','check'),P('Natumi','Almond Barista','Almond barista','Natumi Mandel Barista carton','Germany','check'),P('dmBio','Oat Barista','Oat barista','dmBio Haferdrink Barista carton','Germany','check'),P('dmBio','Oat + Soy Barista','Oat + soy','dmBio Haferdrink Barista mit Soja','Germany','check'),P('Alpro','Not M*lk Whole','Oat','Alpro This Is Not Milk Whole carton','Belgium','check'),P('Alpro','Coconut Original','Coconut rice','Alpro Coconut Original carton','Belgium','check'),P('dmBio','Almond Drink','Almond','dmBio Mandel Drink carton','Germany','check'),P('dmBio','Cashew Natural','Cashew','dmBio Cashew Drink carton','Germany','check'),P('dmBio','Gluten-free Oat','Oat','dmBio Haferdrink glutenfrei carton','Germany','check')
  ];
  const meat = [
    P('Vemondo','Vegan Nuggets','Nuggets','Vemondo vegane Nuggets package'),P('Vemondo','Vegan Gyros','Gyros','Vemondo veganes Gyros package'),P('Vemondo','Vegan Chunks','Chunks','Vemondo vegane Chunks package'),P('Vemondo','Rostbratwürstchen','Sausage','Vemondo vegane Rostbratwürstchen package'),P('Vemondo','Steak Alternative','Steak','Vemondo vegane Steak Alternative package'),P('Vemondo','Burger Patties','Burger','Vemondo vegane Burger Patties package'),P('Vemondo','Mince Alternative','Mince','Vemondo veganes Hack package'),P('Vemondo','Mini Schnitzel','Schnitzel','Vemondo vegane Mini Schnitzel package'),P('Rügenwalder','Mühlen Schnitzel','Schnitzel','Rügenwalder veganes Mühlen Schnitzel'),P('Rügenwalder','Mühlen Nuggets','Nuggets','Rügenwalder vegane Mühlen Nuggets'),P('Rügenwalder','Mühlen Hack','Mince','Rügenwalder veganes Mühlen Hack'),P('LikeMeat','Like Chicken','Chunks','LikeMeat Like Chicken package'),P('LikeMeat','Like Gyros','Gyros','LikeMeat Like Gyros package'),P('Beyond Meat','Beyond Burger','Burger','Beyond Burger package'),P('Beyond Meat','Beyond Meatballs','Meatballs','Beyond Meatballs package')
  ];
  const yogurt = [
    P('Vemondo','Soy Yogurt Natural','Natural','Vemondo Sojajoghurt Natur'),P('Vemondo','No Ghurt Natural','Natural','Vemondo No Ghurt Natur'),P('Alpro','Natural','Natural','Alpro Natur Soja Joghurt'),P('Alpro','Natural No Sugars','Natural','Alpro Natur ohne Zucker Joghurt'),P('Alpro','Skyr Style Natural','Skyr style','Alpro Skyr Style Natur'),P('Alpro','High Protein Natural','High protein','Alpro High Protein Natur Joghurt'),P('Alpro','Blueberry','Fruit','Alpro Heidelbeere Joghurt'),P('Alpro','Cherry','Fruit','Alpro Kirsche Joghurt'),P('Oatly','Oatgurt Natural','Oat','Oatly Oatgurt Natural'),P('Sojade','Soy Natural','Natural','Sojade Soja Natur Joghurt'),P('Provamel','Soy Natural','Natural','Provamel Soja Natur Joghurt'),P('Harvest Moon','Coconut Natural','Coconut','Harvest Moon Coconut Yogurt Natural'),P('The Coconut Collaborative','Natural','Coconut','Coconut Collaborative Natural Yogurt'),P('dmBio','Soy Yogurt Natural','Natural','dmBio Sojagurt Natur'),P('REWE Bio + vegan','Soy Natural','Natural','REWE Bio vegan Soja Natur Joghurt')
  ];
  const tofu = [
    P('Vemondo','Organic Tofu Natural','Natural','Vemondo Bio Tofu Natur'),P('Vemondo','Smoked Tofu','Smoked','Vemondo Räuchertofu'),P('Vemondo','Marinated Tofu','Marinated','Vemondo Tofu mariniert'),P('Taifun','Tofu Natural','Natural','Taifun Tofu Natur'),P('Taifun','Smoked Tofu Classic','Smoked','Taifun Räuchertofu Klassik'),P('Taifun','Black Forest Tofu','Speciality','Taifun Black Forest Tofu'),P('Taifun','Tofu Basilico','Marinated','Taifun Tofu Basilico'),P('Taifun','Tofu Rosso','Marinated','Taifun Tofu Rosso'),P('Taifun','FETO Natural','Fermented','Taifun FETO Natur'),P('Tukan','Tofu Natural','Natural','Tukan Tofu Natur'),P('Tukan','Smoked Tofu','Smoked','Tukan Räuchertofu'),P('dmBio','Tofu Natural','Natural','dmBio Tofu Natur'),P('dmBio','Smoked Tofu','Smoked','dmBio Räuchertofu'),P('Alnatura','Tofu Natural','Natural','Alnatura Tofu Natur'),P('Tempehmanufaktur','Tempeh Classic','Tempeh','Tempehmanufaktur Tempeh Klassik')
  ];
  const cheese = [
    P('Vemondo','Slices Mild','Slices','Vemondo vegane Scheiben mild'),P('Vemondo','Slices Savoury','Slices','Vemondo vegane Scheiben würzig'),P('Vemondo','Grated','Grated','Vemondo veganer Reibegenuss'),P('Vemondo','Spread Natural','Cream cheese','Vemondo Streichgenuss Natur'),P('Vemondo','Spread Herbs','Cream cheese','Vemondo Streichgenuss Kräuter'),P('Vemondo','Feta Alternative','Feta style','Vemondo Feta Alternative'),P('Simply V','Mild Slices','Slices','Simply V Genießerscheiben mild'),P('Simply V','Savoury Slices','Slices','Simply V Genießerscheiben würzig'),P('Simply V','Grated','Grated','Simply V Reibegenuss'),P('Violife','Original Slices','Slices','Violife Original Slices'),P('Violife','Epic Mature','Slices','Violife Epic Mature'),P('Violife','Greek White','Feta style','Violife Greek White'),P('Violife','Mozzarella Flavour','Grated','Violife Mozzarella Flavour Grated'),P('bedda','Come on Bert','Soft cheese','bedda Come on Bert'),P('Dr. Mannah','Happy Cheeze Natural','Fermented','Dr Mannah Happy Cheeze Natur')
  ];

  const categories = {
    ramen:{label:{en:'Ramen · Global 50',de:'Ramen · Global 50'},title:{en:'The Global Ramen 50 Challenge',de:'Die Global Ramen 50 Challenge'},description:{en:'A popularity-weighted field of global icons, cult favourites and current expert picks — built for your personal ranking, not presented as an audited worldwide sales chart.',de:'Ein nach Popularität gewichtetes Feld aus globalen Ikonen, Kultfavoriten und aktuellen Expertentipps — für dein persönliches Ranking, nicht als geprüfte weltweite Verkaufsrangliste.'},products:window.RAMEN_DATA,method:true},
    milk:{label:{en:'Plant milk',de:'Pflanzenmilch'},title:{en:'Plant Milk Championship',de:'Pflanzenmilch-Meisterschaft'},description:{en:'15 candidates ranked by taste, everyday usefulness, protein and value.',de:'15 Kandidaten nach Geschmack, Alltagstauglichkeit, Protein und Preis-Leistung.'},products:milk,default:{S:['alpro-soy-original','alpro-soy-no-sugars'],A:['dmbio-soy-drink-natural'],B:['oatly-barista-edition','alpro-not-m-lk-whole','alpro-coconut-original','vly-high-protein'],C:[],F:[],pool:milk.map(x=>x.id).filter(id=>!['alpro-soy-original','alpro-soy-no-sugars','dmbio-soy-drink-natural','oatly-barista-edition','alpro-not-m-lk-whole','alpro-coconut-original','vly-high-protein'].includes(id))}},
    meat:{label:{en:'Meat alternatives',de:'Fleischalternativen'},title:{en:'Meat Alternatives',de:'Fleischalternativen'},description:{en:'Vemondo gets a large starting squad, joined by Rügenwalder, LikeMeat, Beyond and more.',de:'Vemondo bekommt ein großes Startfeld, ergänzt durch Rügenwalder, LikeMeat, Beyond und mehr.'},products:meat},
    yogurt:{label:{en:'Vegan yogurt',de:'Veganer Joghurt'},title:{en:'The Spoon Division',de:'Die Löffel-Abteilung'},description:{en:'Natural, Skyr-style, high protein, fruit and coconut.',de:'Natur, Skyr-Style, High Protein, Frucht und Kokos.'},products:yogurt},
    tofu:{label:{en:'Tofu & tempeh',de:'Tofu & Tempeh'},title:{en:'Soy Blocks of Destiny',de:'Sojablöcke des Schicksals'},description:{en:'Natural, smoked, marinated, fermented and tempeh.',de:'Natur, geräuchert, mariniert, fermentiert und Tempeh.'},products:tofu},
    cheese:{label:{en:'Vegan cheese',de:'Veganer Käse'},title:{en:'Melt Responsibly',de:'Schmelzen mit Verantwortung'},description:{en:'Slices, grated, spreads, feta-style and fermented specialities.',de:'Scheiben, Geraspeltes, Aufstriche, Feta-Style und fermentierte Spezialitäten.'},products:cheese}
  };

  if (!categories[state.active]) state.active = 'ramen';

  function storageKey(kind, category = state.active) { return `michael-tier-v4-${kind}-${category}`; }
  function baseRanking(key) {
    const c = categories[key];
    return c.default ? JSON.parse(JSON.stringify(c.default)) : {S:[],A:[],B:[],C:[],F:[],pool:c.products.map(x=>x.id)};
  }
  function loadRanking(key) {
    const raw = readJSON(storageKey('ranking', key), null);
    if (!raw) return baseRanking(key);
    const valid = new Set(categories[key].products.map(x=>x.id));
    const seen = new Set();
    const out = Object.fromEntries(TIERS.map(tier=>[tier,[]]));
    TIERS.forEach(tier => (Array.isArray(raw[tier]) ? raw[tier] : []).forEach(id => {
      if (valid.has(id) && !seen.has(id)) { out[tier].push(id); seen.add(id); }
    }));
    categories[key].products.forEach(item => { if (!seen.has(item.id)) out.pool.push(item.id); });
    return out;
  }
  function saveState() {
    writeJSON(storageKey('ranking'), state.ranking);
    writeJSON(storageKey('tried'), state.tried);
  }
  function product(id) { return categories[state.active].products.find(item => item.id === id); }
  function placement(id) { return TIERS.find(tier => state.ranking[tier].includes(id)) || 'pool'; }
  function currentText(value) { return typeof value === 'object' ? value[state.lang] || value.en : value; }
  function veganLabel(status) { return t(status || 'check'); }
  function spiceLabel(level) { return level ? `🌶 ${level}/5` : '○ 0/5'; }

  function fallbackVisual(item) {
    const hue = Math.abs([...item.id].reduce((a,c)=>a+c.charCodeAt(0),0)) % 360;
    const bowl = state.active === 'ramen' ? '<path d="M58 80h84c-4 26-19 40-42 40S62 106 58 80Z" fill="#fff8e8" stroke="#172018" stroke-width="4"/><path d="M69 91c13-9 23 8 35-1s22 8 33-1" fill="none" stroke="#da8d2f" stroke-width="5" stroke-linecap="round"/><path d="M83 60c-8-12 6-17-1-29M105 60c-8-12 7-18 0-30M126 60c-7-11 6-16 1-27" fill="none" stroke="#fff8e8" stroke-width="4" stroke-linecap="round"/>' : '<circle cx="100" cy="80" r="34" fill="#fff8e8" stroke="#172018" stroke-width="4"/><path d="M76 82c14-18 35-18 48 0-14 18-35 18-48 0Z" fill="#78a96f"/>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect width="200" height="150" rx="18" fill="hsl(${hue} 55% 72%)"/><circle cx="174" cy="22" r="48" fill="rgba(255,255,255,.18)"/><rect x="18" y="14" width="164" height="122" rx="14" fill="rgba(255,255,255,.08)" stroke="#172018" stroke-width="3"/>${bowl}<text x="24" y="29" font-family="Arial" font-size="10" font-weight="700">${escapeHTML(item.brand).slice(0,24)}</text><text x="24" y="129" font-family="Arial" font-size="11" font-weight="800">${escapeHTML(item.name).slice(0,26)}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function card(item) {
    const current = placement(item.id);
    const options = [
      ['pool', state.lang==='en'?'Place it…':'Einordnen …'],['S',state.lang==='en'?'S · instant rebuy':'S · sofort nachkaufen'],['A',state.lang==='en'?'A · excellent':'A · sehr stark'],['B',state.lang==='en'?'B · good, but':'B · gut, aber'],['C',state.lang==='en'?'C · emergency only':'C · nur im Notfall'],['F',state.lang==='en'?'F · never again':'F · nicht noch einmal']
    ];
    const image = state.imageCache[item.id] || item.image || fallbackVisual(item);
    const needsLookup = !state.imageCache[item.id] && !item.image;
    const rank = item.rank ? `<span class="rank">#${item.rank}</span>` : '';
    const source = item.source ? `<a class="icon-btn" href="${escapeHTML(item.source)}" target="_blank" rel="noopener" title="${t('source')}">↗</a>` : '';
    return `<article class="product" draggable="true" data-id="${escapeHTML(item.id)}">
      <div class="pack ${needsLookup?'loading':''}">${rank}<img src="${escapeHTML(image)}" alt="${escapeHTML(item.brand)} ${escapeHTML(item.name)} packshot" data-product-image="${escapeHTML(item.id)}"></div>
      <div><span class="brandline">${escapeHTML(item.brand)} · ${escapeHTML(item.country || '')}</span><h4>${escapeHTML(item.name)}</h4>
      <div class="facts"><span class="fact">${escapeHTML(item.style || item.type || '')}</span><span class="fact">${spiceLabel(item.spice || 0)}</span></div>
      <span class="vegan-badge ${escapeHTML(item.vegan || 'check')}">${veganLabel(item.vegan)}</span>
      <p class="evidence">${escapeHTML(currentText(item.evidence || item.reason || {en:'Check the exact pack.',de:'Konkrete Packung prüfen.'}))}</p>
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
    $('#categoryTabs').innerHTML = Object.entries(categories).map(([key,value]) => `<button class="category-tab ${key===state.active?'active':''}" data-category="${key}">${escapeHTML(currentText(value.label))} · ${value.products.length}</button>`).join('');
    $$('[data-category]').forEach(button => button.addEventListener('click', () => switchCategory(button.dataset.category)));
  }

  function render() {
    const category = categories[state.active];
    $('#challengeKicker').textContent = `${String(Object.keys(categories).indexOf(state.active)+1).padStart(2,'0')} / ${category.products.length} ${state.lang==='en'?'candidates':'Kandidaten'}`;
    $('#challengeTitle').textContent = currentText(category.title);
    $('#challengeDescription').textContent = currentText(category.description);
    $('#methodology').hidden = !category.method;
    ['S','A','B','C','F'].forEach(tier => {
      const ids = state.ranking[tier].filter(id => matches(product(id)));
      $(`.zone[data-tier="${tier}"]`).innerHTML = ids.map(id => card(product(id))).join('');
    });
    const poolIds = state.ranking.pool.filter(id => matches(product(id)));
    $('#pool').innerHTML = poolIds.length ? poolIds.map(id => card(product(id))).join('') : `<p class="empty">${t('noResults')}</p>`;
    $('#poolTitle').textContent = t('open');
    $('#poolCount').textContent = `${state.ranking.pool.length} / ${category.products.length} ${t('openLabel')}`;
    updateStats();
    bindCards();
    hydrateImages();
  }

  function updateStats() {
    const products = categories[state.active].products;
    const ranked = products.length - state.ranking.pool.length;
    const tasted = products.filter(item => state.tried[item.id]).length;
    const verified = products.filter(item => item.vegan === 'verified').length;
    $('#rankedStat').textContent = `${ranked}/${products.length}`;
    $('#tastedStat').textContent = `${tasted}/${products.length}`;
    $('#veganStat').textContent = verified;
    $('#rankedLabel').textContent = t('ranked');
    $('#tastedLabel').textContent = t('tasted');
    $('#veganLabel').textContent = t('verifiedCount');
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
      state.tried[button.dataset.tried] = !state.tried[button.dataset.tried];
      saveState(); render();
    }));
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
    state.ranking = loadRanking(key);
    state.tried = readJSON(storageKey('tried', key), {});
    renderTabs(); renderFilters(); render();
    setStatus(`${currentText(categories[key].label)} ${t('listLoaded')}.`);
  }

  function renderFilters() {
    const labels = state.lang === 'en'
      ? {all:'All',verified:'Vegan verified',not:'Not vegan',check:'Check pack',tasted:'Tasted',untasted:'Not tasted',spicy:'Very spicy'}
      : {all:'Alle',verified:'Vegan bestätigt',not:'Nicht vegan',check:'Packung prüfen',tasted:'Probiert',untasted:'Nicht probiert',spicy:'Sehr scharf'};
    $('#filters').innerHTML = Object.entries(labels).map(([key,label])=>`<button class="filter ${state.filter===key?'active':''}" data-filter="${key}">${label}</button>`).join('');
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.filter; renderFilters(); render(); }));
  }

  async function searchOpenFoodFacts(item) {
    if (!item.imageQuery) return null;
    const fields = 'product_name,brands,image_front_url,image_front_small_url,image_url';
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(item.imageQuery)}&search_simple=1&action=process&json=1&page_size=8&fields=${fields}`;
    const response = await fetch(url, {headers:{Accept:'application/json'}});
    if (!response.ok) throw new Error(`OFF ${response.status}`);
    const payload = await response.json();
    const wanted = `${item.brand} ${item.name}`.toLowerCase().split(/[^a-z0-9]+/).filter(token=>token.length>2);
    const candidates = (payload.products || []).filter(entry => entry.image_front_url || entry.image_front_small_url || entry.image_url);
    candidates.sort((a,b) => score(b)-score(a));
    function score(entry) {
      const text = `${entry.brands || ''} ${entry.product_name || ''}`.toLowerCase();
      return wanted.reduce((total,token)=>total+(text.includes(token)?2:0),0) + (text.includes(item.brand.toLowerCase())?4:0);
    }
    const best = candidates[0];
    return best ? (best.image_front_url || best.image_front_small_url || best.image_url) : null;
  }

  async function hydrateImages() {
    const images = $$('[data-product-image]');
    const queue = images.filter(img => {
      const item = product(img.dataset.productImage);
      return item && !state.imageCache[item.id] && !item.image;
    });
    let cursor = 0;
    async function worker() {
      while (cursor < queue.length) {
        const img = queue[cursor++];
        const item = product(img.dataset.productImage);
        if (!item) continue;
        try {
          const url = await searchOpenFoodFacts(item);
          if (url) {
            state.imageCache[item.id] = url; writeJSON(IMAGE_CACHE_KEY, state.imageCache);
            $$(`[data-product-image="${CSS.escape(item.id)}"]`).forEach(node => { node.src = url; node.closest('.pack')?.classList.remove('loading'); });
          } else img.closest('.pack')?.classList.remove('loading');
        } catch { img.closest('.pack')?.classList.remove('loading'); }
      }
    }
    await Promise.all([worker(), worker(), worker()]);
  }

  async function hydrateExampleImages() {
    const nodes = $$('[data-example-query]');
    for (const img of nodes) {
      const item = {id:`example-${img.dataset.exampleId}`,brand:img.dataset.exampleBrand||'',name:img.dataset.exampleName||'',imageQuery:img.dataset.exampleQuery};
      const cached = state.imageCache[item.id];
      if (cached) { img.src = cached; continue; }
      try {
        const url = await searchOpenFoodFacts(item);
        if (url) { img.src = url; state.imageCache[item.id] = url; writeJSON(IMAGE_CACHE_KEY,state.imageCache); }
      } catch {}
    }
  }

  function setStatus(text) { $('#status').textContent = text; }
  function showToast(text) { const toast=$('#toast'); toast.textContent=text; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),2400); }

  function rankingText() {
    const category = categories[state.active];
    const lines = ['S','A','B','C','F'].map(tier => `${tier}: ${state.ranking[tier].map(id=>`${product(id).brand} ${product(id).name}`).join(', ') || '—'}`);
    return `${currentText(category.title)}\n\n${lines.join('\n')}\n\n${location.origin}${location.pathname}?list=${state.active}`;
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
    const preferred = products.filter(item => !state.tried[item.id]);
    const pool = preferred.length ? preferred : products;
    const item = pool[Math.floor(Math.random()*pool.length)];
    $('#pickTitle').textContent = t('randomTitle');
    $('#pickText').textContent = t('randomText');
    $('#pickName').textContent = `${item.brand} ${item.name}`;
    $('#pickMeta').textContent = `${item.country} · ${item.style || item.type} · ${spiceLabel(item.spice || 0)} · ${veganLabel(item.vegan)}`;
    $('#pickImage').src = state.imageCache[item.id] || item.image || fallbackVisual(item);
    $('#pickTasted').dataset.pickTasted = item.id;
    $('#randomModal').classList.add('open');
    if (!state.imageCache[item.id] && !item.image) searchOpenFoodFacts(item).then(url=>{if(url){state.imageCache[item.id]=url;writeJSON(IMAGE_CACHE_KEY,state.imageCache);$('#pickImage').src=url;}}).catch(()=>{});
  }

  function createShareCard() {
    const canvas = document.createElement('canvas'); canvas.width=1200; canvas.height=630;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle='#172018';ctx.fillRect(0,0,1200,630);
    ctx.fillStyle='#d8ff58';ctx.fillRect(0,0,42,630);
    ctx.fillStyle='#fffdf7';ctx.font='700 64px Arial';ctx.fillText(state.active==='ramen'?'MY GLOBAL RAMEN 50':'MY VEGAN TIER LIST',85,105);
    const products=categories[state.active].products,tasted=products.filter(p=>state.tried[p.id]).length,ranked=products.length-state.ranking.pool.length;
    ctx.fillStyle='#bfc8c0';ctx.font='28px Arial';ctx.fillText(`${ranked}/${products.length} ranked  ·  ${tasted}/${products.length} tasted`,88,154);
    const top=[...state.ranking.S,...state.ranking.A,...state.ranking.B].slice(0,7).map(product);
    ctx.fillStyle='#d8ff58';ctx.font='700 24px Arial';ctx.fillText('MY CURRENT TOP PICKS',88,225);
    ctx.font='700 34px Arial';
    top.forEach((item,index)=>{ctx.fillStyle=index<2?'#d8ff58':'#fffdf7';ctx.fillText(`${index+1}. ${item?`${item.brand} ${item.name}`:'—'}`,105,285+index*47);});
    ctx.fillStyle='#9ba59d';ctx.font='24px Arial';ctx.fillText('mikelninh.github.io/vegan/',88,586);
    canvas.toBlob(async blob=>{
      if(!blob)return;const file=new File([blob],'my-ramen-tier-list.png',{type:'image/png'});
      try{if(navigator.canShare?.({files:[file]}))await navigator.share({title:t('shareTitle'),text:t('shareText'),files:[file]});else{const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);showToast(t('cardSaved'));}}catch(error){if(error.name!=='AbortError')showToast('Card export failed.');}
    },'image/png');
  }

  function applyLanguage(lang) {
    state.lang = lang; localStorage.setItem('michael-site-language',lang); document.documentElement.lang=lang;
    $$('[data-en]').forEach(node=>{const value=node.dataset[lang];if(value!==undefined)node.textContent=value;});
    $$('[data-placeholder-en]').forEach(node=>node.placeholder=node.dataset[`placeholder${lang==='en'?'En':'De'}`]);
    $$('.lang').forEach(button=>button.classList.toggle('active',button.dataset.lang===lang));
    renderTabs();renderFilters();render();
  }

  $$('.zone,#pool').forEach(zone => {
    zone.addEventListener('dragover',event=>{event.preventDefault();zone.classList.add('over');});
    zone.addEventListener('dragleave',()=>zone.classList.remove('over'));
    zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('over');move(event.dataTransfer.getData('text/plain'),zone.dataset.tier);});
  });
  $$('.lang').forEach(button=>button.addEventListener('click',()=>applyLanguage(button.dataset.lang)));
  $('#productSearch').addEventListener('input',event=>{state.query=event.target.value;render();});
  $('#copyRanking').addEventListener('click',copyRanking);$('#shareRanking').addEventListener('click',shareRanking);$('#shareCard').addEventListener('click',createShareCard);$('#randomPick').addEventListener('click',randomPick);
  $('#resetRanking').addEventListener('click',()=>{state.ranking=baseRanking(state.active);saveState();render();setStatus(`${currentText(categories[state.active].label)} ${t('reset')}.`);});
  $('#closeModal').addEventListener('click',()=>$('#randomModal').classList.remove('open'));
  $('#randomModal').addEventListener('click',event=>{if(event.target.id==='randomModal')event.currentTarget.classList.remove('open');});
  $('#pickTasted').addEventListener('click',event=>{const id=event.currentTarget.dataset.pickTasted;if(id){state.tried[id]=true;saveState();$('#randomModal').classList.remove('open');render();}});

  state.ranking=loadRanking(state.active);state.tried=readJSON(storageKey('tried',state.active),{});
  applyLanguage(state.lang);hydrateExampleImages();
})();