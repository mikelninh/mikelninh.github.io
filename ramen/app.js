(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const TIERS = ['S', 'A', 'B', 'C', 'F', 'pool'];
  const STORAGE = 'michael-ramen-passport-v1';
  const IMAGE_CACHE = 'michael-ramen-image-cache-v5';
  const products = Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : [];

  const state = {
    lang: localStorage.getItem('michael-site-language') || 'en',
    filter: 'all',
    query: '',
    ranking: null,
    tasted: {},
    selectedId: null,
    imageCache: readJSON(IMAGE_CACHE, {}),
    failedImages: new Set(),
    bowlGoal: 'balanced',
    lastBowl: null
  };

  const text = {
    en: {
      all:'All 50', de:'Germany checked', verified:'Vegan verified', not:'Not vegan', real:'Real image', review:'Needs DE review', tasted:'Tasted', untasted:'Not tasted',
      source:'Evidence source', buy:'Buy in Germany', find:'Find in Germany', details:'Show all data', hide:'Hide data', market:'Market', gtin:'GTIN', style:'Style', spice:'Spice', checked:'Checked', verification:'Verification', imageSource:'Image source', why:'Why it made the 50',
      unranked:'unranked', results:'visible', fallback:'illustration', packshot:'packshot', database:'database image', noResults:'No products match these filters.',
      copied:'Ranking copied.', reset:'Ranking reset.', tastedToast:'Marked as tasted.', untastedToast:'Removed from tasted list.', bowlCopied:'Bowl copied.', copyFailed:'Copy failed.',
      verificationLabels:{'germany-retailer':'Germany retailer','official-eu':'Official EU','official-global':'Official global','needs-germany-review':'Germany review pending'},
      veganLabels:{verified:'Vegan verified',not:'Not vegan',check:'Check this pack',vegetarian:'Vegetarian · not vegan-verified'}
    },
    de: {
      all:'Alle 50', de:'Deutschland geprüft', verified:'Vegan bestätigt', not:'Nicht vegan', real:'Echtes Bild', review:'DE-Prüfung offen', tasted:'Probiert', untasted:'Nicht probiert',
      source:'Nachweis', buy:'In Deutschland kaufen', find:'In Deutschland suchen', details:'Alle Daten zeigen', hide:'Daten schließen', market:'Markt', gtin:'GTIN', style:'Stil', spice:'Schärfe', checked:'Geprüft', verification:'Prüfstufe', imageSource:'Bildquelle', why:'Warum in den 50',
      unranked:'noch offen', results:'sichtbar', fallback:'Illustration', packshot:'Packshot', database:'Datenbankbild', noResults:'Keine Produkte passen zu diesen Filtern.',
      copied:'Ranking kopiert.', reset:'Ranking zurückgesetzt.', tastedToast:'Als probiert markiert.', untastedToast:'Aus „probiert“ entfernt.', bowlCopied:'Bowl kopiert.', copyFailed:'Kopieren fehlgeschlagen.',
      verificationLabels:{'germany-retailer':'Deutscher Händler','official-eu':'Offiziell EU','official-global':'Offiziell global','needs-germany-review':'Deutschland-Prüfung offen'},
      veganLabels:{verified:'Vegan bestätigt',not:'Nicht vegan',check:'Packung prüfen',vegetarian:'Vegetarisch · nicht vegan bestätigt'}
    }
  };

  const bowlParts = {
    balanced: {
      veg:{en:['broccoli + mushrooms','pak choi + carrots','spinach + sweetcorn','cabbage + frozen peas'],de:['Brokkoli + Pilze','Pak Choi + Karotten','Spinat + Mais','Kohl + TK-Erbsen']},
      protein:{en:['crispy tofu','smoked tofu','edamame','pan-fried tempeh'],de:['knuspriger Tofu','Räuchertofu','Edamame','gebratener Tempeh']},
      extra:{en:['spring onion + sesame','lime + coriander','nori + chilli crisp','pickled ginger + peanuts'],de:['Frühlingszwiebel + Sesam','Limette + Koriander','Nori + Chili Crisp','eingelegter Ingwer + Erdnüsse']}
    },
    protein: {
      veg:{en:['broccoli + edamame','pak choi + mushrooms','spinach + peas'],de:['Brokkoli + Edamame','Pak Choi + Pilze','Spinat + Erbsen']},
      protein:{en:['200 g crispy tofu','tempeh + edamame','smoked tofu + soy beans','tofu strips + roasted edamame'],de:['200 g knuspriger Tofu','Tempeh + Edamame','Räuchertofu + Sojabohnen','Tofustreifen + geröstete Edamame']},
      extra:{en:['sesame + nori','peanuts + lime','spring onion + chilli'],de:['Sesam + Nori','Erdnüsse + Limette','Frühlingszwiebel + Chili']}
    },
    creamy: {
      veg:{en:['mushrooms + spinach','broccoli + sweetcorn','pak choi + carrots'],de:['Pilze + Spinat','Brokkoli + Mais','Pak Choi + Karotten']},
      protein:{en:['silken tofu','crispy tofu','edamame'],de:['Seidentofu','knuspriger Tofu','Edamame']},
      extra:{en:['tahini + lime','peanut butter + chilli crisp','unsweetened soy milk + miso'],de:['Tahin + Limette','Erdnussmus + Chili Crisp','ungesüßte Sojamilch + Miso']}
    },
    fresh: {
      veg:{en:['pak choi + bean sprouts','cabbage + carrots','spinach + mushrooms'],de:['Pak Choi + Sojasprossen','Kohl + Karotten','Spinat + Pilze']},
      protein:{en:['lime-marinated tofu','crispy tempeh','edamame'],de:['Limetten-Tofu','knuspriger Tempeh','Edamame']},
      extra:{en:['lime + coriander + chilli','rice vinegar + spring onion','kimchi-style vegetables + sesame'],de:['Limette + Koriander + Chili','Reisessig + Frühlingszwiebel','Kimchi-Gemüse + Sesam']}
    }
  };

  function tr(key) { return text[state.lang][key] ?? key; }
  function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function current(value) { return typeof value === 'object' && value ? (value[state.lang] || value.en || '') : (value || ''); }
  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
  function saveJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function product(id) { return products.find(item => item.id === id); }
  function placement(id) { return TIERS.find(tier => state.ranking[tier].includes(id)) || 'pool'; }
  function hasRealImage(item) { return Boolean(item.image || state.imageCache[item.id]?.url) && !state.failedImages.has(item.id); }
  function randomFrom(values) { return values[Math.floor(Math.random() * values.length)]; }
  function germanSearch(item) { return `https://www.kaufland.de/s/?search_value=${encodeURIComponent(`${item.brand} ${item.name}`)}`; }

  function initialRanking() {
    const stored = readJSON(STORAGE, null);
    const valid = new Set(products.map(item => item.id));
    const ranking = Object.fromEntries(TIERS.map(tier => [tier, []]));
    const seen = new Set();
    if (stored?.ranking) {
      TIERS.forEach(tier => (stored.ranking[tier] || []).forEach(id => {
        if (valid.has(id) && !seen.has(id)) { ranking[tier].push(id); seen.add(id); }
      }));
    }
    products.forEach(item => { if (!seen.has(item.id)) ranking.pool.push(item.id); });
    state.tasted = stored?.tasted || {};
    return ranking;
  }

  function save() { saveJSON(STORAGE, {ranking:state.ranking,tasted:state.tasted}); }

  function fallbackVisual(item) {
    const hue = Math.abs([...item.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><rect width="240" height="180" rx="22" fill="hsl(${hue} 55% 73%)"/><rect x="18" y="16" width="204" height="148" rx="18" fill="rgba(255,255,255,.12)" stroke="#172018" stroke-width="4"/><path d="M63 96h114c-6 34-25 52-57 52S69 130 63 96Z" fill="#fff9e8" stroke="#172018" stroke-width="5"/><path d="M76 110c18-12 31 10 47-2s31 10 46-2" fill="none" stroke="#d98c31" stroke-width="6" stroke-linecap="round"/><path d="M96 72c-11-17 8-22-1-40M124 72c-10-16 9-23 0-41M151 72c-9-15 8-21 1-37" fill="none" stroke="#fff9e8" stroke-width="5" stroke-linecap="round"/><text x="27" y="39" font-family="Arial" font-size="13" font-weight="700" fill="#172018">${escapeHTML(item.brand).slice(0,25)}</text><text x="27" y="158" font-family="Arial" font-size="14" font-weight="800" fill="#172018">${escapeHTML(item.name).slice(0,29)}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function imageInfo(item) {
    if (state.imageCache[item.id]?.url) return {url:state.imageCache[item.id].url, kind:'database', source:state.imageCache[item.id].source};
    if (item.image && !state.failedImages.has(item.id)) return {url:item.image, kind:'packshot', source:item.imageSource || item.source};
    return {url:fallbackVisual(item), kind:'fallback', source:null};
  }

  function options(currentTier) {
    const labels = state.lang === 'en'
      ? {pool:'Place it…',S:'S · instant rebuy',A:'A · excellent',B:'B · good, but',C:'C · emergency only',F:'F · never again'}
      : {pool:'Einordnen …',S:'S · sofort nachkaufen',A:'A · sehr stark',B:'B · gut, aber',C:'C · nur im Notfall',F:'F · nie wieder'};
    return TIERS.map(tier => `<option value="${tier}" ${tier===currentTier?'selected':''}>${labels[tier]}</option>`).join('');
  }

  function card(item) {
    const img = imageInfo(item);
    const verification = text[state.lang].verificationLabels[item.verificationLevel] || item.verificationLevel;
    const vegan = text[state.lang].veganLabels[item.vegan] || item.vegan;
    const deChecked = ['germany-retailer','official-eu'].includes(item.verificationLevel);
    const sourceLink = item.source ? `<a href="${escapeHTML(item.source)}" target="_blank" rel="noopener">${tr('source')} ↗</a>` : '';
    const buyUrl = item.buy || germanSearch(item);
    const buyLink = `<a class="buy ${item.buy?'':'search-buy'}" href="${escapeHTML(buyUrl)}" target="_blank" rel="noopener">${item.buy?tr('buy'):tr('find')} ↗</a>`;
    return `<article class="product" draggable="true" data-id="${escapeHTML(item.id)}">
      <div class="pack"><span class="rank">#${escapeHTML(item.rank || '—')}</span><img src="${escapeHTML(img.url)}" alt="${escapeHTML(item.brand)} ${escapeHTML(item.name)}" data-image-id="${escapeHTML(item.id)}"><span class="image-label ${img.kind==='fallback'?'fallback':''}">${tr(img.kind)}</span></div>
      <div><span class="brandline">${escapeHTML(item.brand)} · ${escapeHTML(item.country || '')}</span><h4>${escapeHTML(item.name)}</h4>
        <div class="facts"><span class="fact">${escapeHTML(item.style || '')}</span><span class="fact">🌶 ${escapeHTML(item.spice ?? 0)}/5</span>${item.gtin?`<span class="fact">GTIN ${escapeHTML(item.gtin)}</span>`:''}</div>
        <div class="badges"><span class="badge ${escapeHTML(item.vegan || 'check')}">${escapeHTML(vegan)}</span><span class="badge ${deChecked?'de':''}">${escapeHTML(verification)}</span></div>
        <p class="evidence">${escapeHTML(current(item.evidence))}</p>
        <details class="details"><summary data-open="${escapeHTML(tr('details'))}" data-close="${escapeHTML(tr('hide'))}">${escapeHTML(tr('details'))}</summary><dl>
          <dt>${tr('market')}</dt><dd>${escapeHTML(item.market || '—')}</dd><dt>${tr('gtin')}</dt><dd>${escapeHTML(item.gtin || '—')}</dd><dt>${tr('style')}</dt><dd>${escapeHTML(item.style || '—')}</dd><dt>${tr('spice')}</dt><dd>${escapeHTML(item.spice ?? 0)}/5</dd><dt>${tr('verification')}</dt><dd>${escapeHTML(verification || '—')}</dd><dt>${tr('checked')}</dt><dd>${escapeHTML(item.verifiedAt || '—')}</dd><dt>${tr('why')}</dt><dd>${escapeHTML(current(item.reason) || '—')}</dd><dt>${tr('imageSource')}</dt><dd>${img.source?`<a href="${escapeHTML(img.source)}" target="_blank" rel="noopener">${escapeHTML(img.source)}</a>`:'—'}</dd>
        </dl></details>
        <div class="links-row">${sourceLink}${buyLink}</div>
        <div class="card-actions"><select class="place" data-place="${escapeHTML(item.id)}">${options(placement(item.id))}</select><button class="tasted ${state.tasted[item.id]?'on':''}" data-tasted="${escapeHTML(item.id)}" title="Tasted">✓</button></div>
      </div></article>`;
  }

  function matches(item) {
    const q = state.query.trim().toLowerCase();
    const haystack = `${item.brand} ${item.name} ${item.country} ${item.market} ${item.style} ${item.gtin || ''}`.toLowerCase();
    if (q && !haystack.includes(q)) return false;
    if (state.filter === 'de') return ['germany-retailer','official-eu'].includes(item.verificationLevel);
    if (state.filter === 'verified') return item.vegan === 'verified';
    if (state.filter === 'not') return item.vegan === 'not';
    if (state.filter === 'real') return hasRealImage(item);
    if (state.filter === 'review') return item.verificationLevel === 'needs-germany-review';
    if (state.filter === 'tasted') return Boolean(state.tasted[item.id]);
    if (state.filter === 'untasted') return !state.tasted[item.id];
    return true;
  }

  function renderFilters() {
    const keys = ['all','de','verified','not','real','review','tasted','untasted'];
    $('#filters').innerHTML = keys.map(key => `<button class="filter ${state.filter===key?'active':''}" data-filter="${key}">${escapeHTML(tr(key))}</button>`).join('');
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => { state.filter=button.dataset.filter; renderFilters(); render(); }));
  }

  function renderBoard() {
    const tiers = [
      ['S','#d8ff58',state.lang==='en'?'instant rebuy':'sofort nachkaufen'],
      ['A','#f3c97d',state.lang==='en'?'excellent':'sehr stark'],
      ['B','#d9d2bf',state.lang==='en'?'good, but':'gut, aber'],
      ['C','#c6d1c8',state.lang==='en'?'emergency only':'nur im Notfall'],
      ['F','#ddaa98',state.lang==='en'?'never again':'nie wieder']
    ];
    $('#board').innerHTML = tiers.map(([tier,color,label]) => `<div class="tier-row"><div class="tier-label" style="--tier:${color}"><div><strong>${tier}</strong><small>${label}</small></div></div><div class="zone" data-tier="${tier}"></div></div>`).join('');
    $$('.zone').forEach(zone => {
      zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('over'));
      zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('over'); move(event.dataTransfer.getData('text/plain'), zone.dataset.tier); });
    });
  }

  function render() {
    let visible = 0;
    ['S','A','B','C','F'].forEach(tier => {
      const ids = state.ranking[tier].filter(id => product(id) && matches(product(id)));
      visible += ids.length;
      $(`.zone[data-tier="${tier}"]`).innerHTML = ids.map(id => card(product(id))).join('');
    });
    const poolIds = state.ranking.pool.filter(id => product(id) && matches(product(id)));
    visible += poolIds.length;
    $('#pool').innerHTML = poolIds.length ? poolIds.map(id => card(product(id))).join('') : `<p class="empty">${escapeHTML(tr('noResults'))}</p>`;
    $('#poolCount').textContent = `${state.ranking.pool.length}/${products.length} ${tr('unranked')}`;
    $('#resultCount').textContent = `${visible}/${products.length} ${tr('results')}`;
    bindCards(); updateAudit(); hydrateImages();
  }

  function bindCards() {
    $$('.product').forEach(node => {
      node.addEventListener('dragstart', event => { node.classList.add('dragging'); event.dataTransfer.setData('text/plain', node.dataset.id); });
      node.addEventListener('dragend', () => node.classList.remove('dragging'));
    });
    $$('[data-place]').forEach(select => select.addEventListener('change', () => move(select.dataset.place, select.value)));
    $$('[data-tasted]').forEach(button => button.addEventListener('click', () => toggleTasted(button.dataset.tasted)));
    $$('[data-image-id]').forEach(image => image.addEventListener('error', () => imageFailed(image), {once:true}));
    $$('.details').forEach(details => details.addEventListener('toggle', () => {
      const summary = $('summary', details); summary.textContent = details.open ? summary.dataset.close : summary.dataset.open;
    }));
  }

  function move(id, tier) {
    if (!TIERS.includes(tier) || !product(id)) return;
    TIERS.forEach(key => state.ranking[key] = state.ranking[key].filter(value => value !== id));
    state.ranking[tier].push(id); save(); render();
    $('#status').textContent = `${product(id).brand} ${product(id).name} → ${tier === 'pool' ? tr('unranked') : tier}`;
    if ($('#modal').classList.contains('open')) closeModal();
  }

  function toggleTasted(id) {
    state.tasted[id] = !state.tasted[id]; save(); render();
    showToast(state.tasted[id] ? tr('tastedToast') : tr('untastedToast'));
  }

  function updateAudit() {
    $('#totalStat').textContent = products.length;
    $('#deStat').textContent = products.filter(item => ['germany-retailer','official-eu'].includes(item.verificationLevel)).length;
    $('#imageStat').textContent = products.filter(hasRealImage).length;
    if ($('#shopStat')) $('#shopStat').textContent = products.filter(item => Boolean(item.buy)).length;
    $('#veganStat').textContent = products.filter(item => item.vegan === 'verified').length;
    $('#reviewStat').textContent = products.filter(item => item.verificationLevel === 'needs-germany-review').length;
  }

  async function exactOpenFoodFacts(item) {
    if (!item.gtin) return null;
    const fields = 'code,product_name,brands,image_front_url,image_front_small_url,image_url';
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(item.gtin)}.json?fields=${fields}`, {headers:{Accept:'application/json'}});
    if (!response.ok) return null;
    const data = await response.json();
    const entry = data.product;
    if (!entry) return null;
    const url = entry.image_front_url || entry.image_front_small_url || entry.image_url;
    return url ? {url,source:`https://world.openfoodfacts.org/product/${entry.code || item.gtin}`} : null;
  }

  async function searchOpenFoodFacts(item) {
    const exact = await exactOpenFoodFacts(item).catch(() => null);
    if (exact) return exact;
    if (!item.imageQuery) return null;
    const fields = 'code,product_name,brands,image_front_url,image_front_small_url,image_url';
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(item.imageQuery)}&search_simple=1&action=process&json=1&page_size=8&fields=${fields}`;
    const response = await fetch(url, {headers:{Accept:'application/json'}});
    if (!response.ok) return null;
    const data = await response.json();
    const tokens = `${item.brand} ${item.name}`.toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 2);
    const candidates = (data.products || []).filter(entry => entry.image_front_url || entry.image_front_small_url || entry.image_url);
    const score = entry => {
      const hay = `${entry.brands || ''} ${entry.product_name || ''}`.toLowerCase();
      return tokens.reduce((sum, token) => sum + (hay.includes(token) ? 2 : 0), 0) + (hay.includes(item.brand.toLowerCase()) ? 5 : 0);
    };
    candidates.sort((a,b) => score(b)-score(a));
    const best = candidates[0];
    if (!best || score(best) < 5) return null;
    return {url:best.image_front_url || best.image_front_small_url || best.image_url,source:best.code?`https://world.openfoodfacts.org/product/${best.code}`:'https://world.openfoodfacts.org/'};
  }

  async function hydrateImages() {
    const queue = products.filter(item => !hasRealImage(item) && (item.imageQuery || item.gtin) && !state.imageCache[item.id]?.attempted);
    let cursor = 0;
    async function worker() {
      while (cursor < queue.length) {
        const item = queue[cursor++];
        state.imageCache[item.id] = {attempted:true}; saveJSON(IMAGE_CACHE,state.imageCache);
        try {
          const found = await searchOpenFoodFacts(item);
          if (found) { state.imageCache[item.id] = {...found,attempted:true}; saveJSON(IMAGE_CACHE,state.imageCache); }
        } catch {}
      }
    }
    if (queue.length) { await Promise.all([worker(),worker(),worker()]); render(); }
  }

  function imageFailed(image) {
    const id = image.dataset.imageId;
    state.failedImages.add(id);
    image.src = fallbackVisual(product(id));
    const label = image.parentElement.querySelector('.image-label');
    if (label) { label.textContent = tr('fallback'); label.classList.add('fallback'); }
    updateAudit();
  }

  function randomPick() {
    const filtered = products.filter(matches);
    const untasted = filtered.filter(item => !state.tasted[item.id]);
    const choices = untasted.length ? untasted : filtered.length ? filtered : products;
    if (!choices.length) return;
    const item = randomFrom(choices);
    state.selectedId = item.id;
    const img = imageInfo(item);
    $('#pickImage').src = img.url;
    $('#pickImage').alt = `${item.brand} ${item.name}`;
    $('#pickName').textContent = `${item.brand} ${item.name}`;
    $('#pickMeta').textContent = `${item.country} · ${item.style} · 🌶 ${item.spice || 0}/5 · ${text[state.lang].veganLabels[item.vegan]}`;
    $('#pickEvidence').textContent = current(item.evidence);
    const buyUrl = item.buy || germanSearch(item);
    $('#pickLinks').innerHTML = `${item.source?`<a href="${escapeHTML(item.source)}" target="_blank" rel="noopener">${tr('source')} ↗</a>`:''}<a href="${escapeHTML(buyUrl)}" target="_blank" rel="noopener">${item.buy?tr('buy'):tr('find')} ↗</a>`;
    const colors={S:'#d8ff58',A:'#f3c97d',B:'#d9d2bf',C:'#c6d1c8',F:'#ddaa98'};
    $('#rankButtons').innerHTML = ['S','A','B','C','F'].map(tier => `<button class="rank-button" style="--tier:${colors[tier]}" data-rank-pick="${tier}">${tier}</button>`).join('');
    $$('[data-rank-pick]').forEach(button => button.addEventListener('click', () => move(item.id,button.dataset.rankPick)));
    $('#pickTasted').classList.toggle('acid',Boolean(state.tasted[item.id]));
    $('#modal').classList.add('open');
  }

  function generateBowl() {
    const parts = bowlParts[state.bowlGoal];
    const ramenChoices = products.filter(item => item.vegan === 'verified' && item.verificationLevel !== 'needs-germany-review');
    const ramen = ramenChoices.length ? randomFrom(ramenChoices) : null;
    const veg = randomFrom(parts.veg[state.lang]);
    const proteinPart = randomFrom(parts.protein[state.lang]);
    const extra = randomFrom(parts.extra[state.lang]);
    const intro = state.lang === 'en' ? 'Base' : 'Basis';
    const bowl = `${intro}: ${ramen ? `${ramen.brand} ${ramen.name}` : (state.lang==='en'?'a vegan-verified ramen':'ein vegan bestätigtes Ramen')} · ${veg} · ${proteinPart} · ${extra}`;
    state.lastBowl = bowl;
    $('#bowlResult').textContent = bowl;
    $('#bowlLabel').textContent = `${veg} + ${proteinPart}`.toUpperCase();
  }

  async function copyBowl() {
    if (!state.lastBowl) generateBowl();
    try { await navigator.clipboard.writeText(`${state.lastBowl}\n\nhttps://mikelninh.github.io/ramen/#upgrade`); showToast(tr('bowlCopied')); }
    catch { showToast(tr('copyFailed')); }
  }

  function closeModal() { $('#modal').classList.remove('open'); }
  function showToast(message) { const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200); }

  async function copyRanking() {
    const output = ['S','A','B','C','F'].map(tier => `${tier}: ${state.ranking[tier].map(id => `${product(id).brand} ${product(id).name}`).join(', ') || '—'}`).join('\n');
    try { await navigator.clipboard.writeText(`My Germany-first Ramen 50\n\n${output}\n\nhttps://mikelninh.github.io/ramen/`); showToast(tr('copied')); } catch { showToast(tr('copyFailed')); }
  }

  function resetRanking() {
    state.ranking = {S:[],A:[],B:[],C:[],F:[],pool:products.map(item => item.id)};
    save(); render(); showToast(tr('reset'));
  }

  function applyLanguage(lang) {
    state.lang=lang;localStorage.setItem('michael-site-language',lang);document.documentElement.lang=lang;
    $$('[data-en]').forEach(node => { if (node.dataset[lang] !== undefined) node.textContent=node.dataset[lang]; });
    $$('.lang').forEach(button => button.classList.toggle('active',button.dataset.lang===lang));
    $('#search').placeholder = lang==='en'?'Search brand, product, country or GTIN…':'Marke, Produkt, Land oder GTIN suchen …';
    renderBoard(); renderFilters(); render();
    if (state.lastBowl) generateBowl();
  }

  state.ranking = initialRanking();
  renderBoard(); renderFilters(); render(); applyLanguage(state.lang);

  $$('.lang').forEach(button => button.addEventListener('click',()=>applyLanguage(button.dataset.lang)));
  $('#search').addEventListener('input',event=>{state.query=event.target.value;render();});
  $('#randomTop').addEventListener('click',randomPick); $('#randomHero').addEventListener('click',randomPick); $('#randomTool').addEventListener('click',randomPick); $('#anotherPick').addEventListener('click',randomPick);
  $('#modalClose').addEventListener('click',closeModal); $('#modal').addEventListener('click',event=>{if(event.target===$('#modal'))closeModal();});
  $('#pickTasted').addEventListener('click',()=>{if(state.selectedId)toggleTasted(state.selectedId);});
  $('#copyRanking').addEventListener('click',copyRanking); $('#resetRanking').addEventListener('click',resetRanking);
  $$('.goal').forEach(button => button.addEventListener('click',()=>{state.bowlGoal=button.dataset.goal;$$('.goal').forEach(other=>other.classList.toggle('active',other===button));generateBowl();}));
  $('#buildBowl')?.addEventListener('click',generateBowl); $('#copyBowl')?.addEventListener('click',copyBowl);
})();
