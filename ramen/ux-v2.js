(() => {
  'use strict';

  const products = Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : [];
  const STORAGE = 'michael-ramen-passport-v1';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const labels = {
    en:{all:['All','🍜'],de:['Germany checked','✓'],verified:['Vegan verified','●'],not:['Not vegan','×'],real:['Real image','▣'],review:['Needs DE review','!'],tasted:['Tasted','◎'],untasted:['Not tasted','○']},
    de:{all:['Alle','🍜'],de:['Deutschland geprüft','✓'],verified:['Vegan bestätigt','●'],not:['Nicht vegan','×'],real:['Echtes Bild','▣'],review:['DE-Prüfung offen','!'],tasted:['Probiert','◎'],untasted:['Nicht probiert','○']}
  };

  function lang() { return document.documentElement.lang === 'de' ? 'de' : 'en'; }
  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE)) || {ranking:{S:[],A:[],B:[],C:[],F:[],pool:products.map(p=>p.id)},tasted:{}}; }
    catch { return {ranking:{S:[],A:[],B:[],C:[],F:[],pool:products.map(p=>p.id)},tasted:{}}; }
  }
  function isGermanyChecked(item) { return ['germany-retailer','official-eu'].includes(item.verificationLevel); }
  function hasImage(item) { return Boolean(item.image); }
  function countFor(key, state) {
    if (key === 'all') return products.length;
    if (key === 'de') return products.filter(isGermanyChecked).length;
    if (key === 'verified') return products.filter(item => item.vegan === 'verified').length;
    if (key === 'not') return products.filter(item => item.vegan === 'not').length;
    if (key === 'real') return products.filter(hasImage).length;
    if (key === 'review') return products.filter(item => item.verificationLevel === 'needs-germany-review').length;
    if (key === 'tasted') return products.filter(item => state.tasted?.[item.id]).length;
    if (key === 'untasted') return products.filter(item => !state.tasted?.[item.id]).length;
    return 0;
  }

  function enhanceFilters() {
    const state = readState();
    $$('[data-filter]').forEach(button => {
      const key = button.dataset.filter;
      const item = labels[lang()][key];
      if (!item) return;
      button.dataset.icon = item[1];
      button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
      button.innerHTML = `<span>${item[0]}</span><b class="filter-count">${countFor(key,state)}</b>`;
    });
  }

  function updateJourney() {
    const state = readState();
    const ranking = state.ranking || {};
    const ranked = ['S','A','B','C','F'].reduce((sum,tier) => sum + (ranking[tier]?.length || 0),0);
    const tasted = products.filter(item => state.tasted?.[item.id]).length;
    if ($('#rankedCount')) $('#rankedCount').textContent = `${ranked}/${products.length}`;
    if ($('#tastedCount')) $('#tastedCount').textContent = `${tasted}/${products.length}`;
    if ($('#rankedBar')) $('#rankedBar').style.width = `${products.length ? ranked/products.length*100 : 0}%`;
    if ($('#tastedBar')) $('#tastedBar').style.width = `${products.length ? tasted/products.length*100 : 0}%`;
    enhanceFilters();
  }

  function rankingText() {
    const state = readState();
    const byId = new Map(products.map(item => [item.id,item]));
    const title = lang() === 'de' ? 'Mein Deutschland-first Ramen-Pass' : 'My Germany-first Ramen Passport';
    const ranked = ['S','A','B','C','F'].reduce((sum,tier) => sum + (state.ranking?.[tier]?.length || 0),0);
    const tasted = products.filter(item => state.tasted?.[item.id]).length;
    const rows = ['S','A','B','C','F'].map(tier => `${tier}: ${(state.ranking?.[tier] || []).map(id => { const item=byId.get(id); return item ? `${item.brand} ${item.name}` : id; }).join(', ') || '—'}`);
    return `${title}\n${ranked}/${products.length} ranked · ${tasted}/${products.length} tasted\n\n${rows.join('\n')}\n\nhttps://mikelninh.github.io/ramen/`;
  }

  function shareCanvas() {
    const state = readState();
    const byId = new Map(products.map(item => [item.id,item]));
    const top = ['S','A','B'].flatMap(tier => state.ranking?.[tier] || []).slice(0,6).map(id=>byId.get(id)).filter(Boolean);
    const ranked = ['S','A','B','C','F'].reduce((sum,tier) => sum + (state.ranking?.[tier]?.length || 0),0);
    const tasted = products.filter(item => state.tasted?.[item.id]).length;
    const canvas = document.createElement('canvas'); canvas.width=1200; canvas.height=630;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#f5efe2';ctx.fillRect(0,0,1200,630);ctx.fillStyle='#173629';ctx.fillRect(0,0,1200,88);ctx.fillStyle='#e54f37';ctx.fillRect(0,88,34,542);
    ctx.fillStyle='#172018';ctx.font='800 64px Arial';ctx.fillText('MY RAMEN PASSPORT',82,168);ctx.fillStyle='#687168';ctx.font='700 25px Arial';ctx.fillText(`${ranked}/${products.length} ranked  ·  ${tasted}/${products.length} tasted`,86,212);
    ctx.fillStyle='#e54f37';ctx.font='800 22px Arial';ctx.fillText('CURRENT TOP BOWLS',86,275);ctx.font='700 34px Arial';
    top.forEach((item,index)=>{ctx.fillStyle=index<2?'#173629':'#172018';ctx.fillText(`${index+1}. ${item.brand} ${item.name}`,103,333+index*47)});
    ctx.fillStyle='#173629';ctx.beginPath();ctx.ellipse(990,258,132,76,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.ellipse(990,245,112,55,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#172018';ctx.lineWidth=7;ctx.stroke();ctx.font='68px Arial';ctx.fillText('🍜',951,278);
    ctx.fillStyle='#687168';ctx.font='22px Arial';ctx.fillText('mikelninh.github.io/ramen/',86,590);return canvas;
  }

  async function sharePassport() {
    const text = rankingText();
    const canvas = shareCanvas();
    const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
    try {
      if (blob && navigator.canShare) {
        const file = new File([blob],'my-ramen-passport.png',{type:'image/png'});
        if (navigator.canShare({files:[file]})) { await navigator.share({title:'My Ramen Passport',text,files:[file]}); return; }
      }
      if (navigator.share) { await navigator.share({title:'My Ramen Passport',text}); return; }
      await navigator.clipboard.writeText(text); toast(lang()==='de'?'Pass kopiert.':'Passport copied.');
    } catch (error) {
      if (error?.name !== 'AbortError') { try { await navigator.clipboard.writeText(text); toast(lang()==='de'?'Pass kopiert.':'Passport copied.'); } catch {} }
    }
  }

  function toast(message) {
    const node=$('#toast'); if(!node)return; node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2200);
  }

  function bind() {
    $('#shareTop')?.addEventListener('click',sharePassport);
    $('#shareRanking')?.addEventListener('click',sharePassport);
    document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('#search')?.focus();}});
    const observer=new MutationObserver(()=>requestAnimationFrame(updateJourney));
    ['#filters','#board','#pool'].forEach(selector=>{const node=$(selector);if(node)observer.observe(node,{childList:true,subtree:true});});
    window.addEventListener('storage',updateJourney);
    updateJourney();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
