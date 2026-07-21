(() => {
  'use strict';

  const products = Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : [];
  if (!products.length) return;

  const STORAGE = 'michael-ramen-passport-v1';
  const NOTES = 'michael-ramen-tasting-notes-v1';
  const SCOPE = 'michael-ramen-quick-scope-v1';
  const VIEW = 'michael-ramen-view-v1';
  const TIERS = ['S','A','B','C','F','pool'];
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const byId = new Map(products.map(item => [item.id,item]));

  const ui = {
    scope: localStorage.getItem(SCOPE) || 'de',
    view: localStorage.getItem(VIEW) || 'quick',
    shuffle: false,
    currentId: null,
    skipped: new Set(),
    undo: [],
    lastRankedId: null,
    noteId: null,
    noteDraft: null
  };

  const copy = {
    en:{
      eyebrow:'QUICK RANK MODE', title:'One bowl at a time.', intro:'Rate quickly now. Inspect the full evidence and rearrange everything on the board later.', quick:'Quick rank', board:'Review board',
      scopes:{de:'Germany / EU checked',verified:'Vegan verified',all:'All 50',untasted:'Not tasted'}, shuffle:'Shuffle queue', ranked:'ranked in this set',
      source:'Open evidence', buy:'Buy / find in Germany', prompt:'STAMP YOUR VERDICT', skip:'Haven’t tried · skip', undo:'Undo last', note:'Add tasting note', editNote:'Edit tasting note',
      keys:'Keyboard: S · A · B · C · F to rank, X to skip, U to undo, N for notes.', complete:'Passport page complete!', completeBody:'You ranked every remaining ramen in this set. Share the result, create a challenge link or review the full board.',
      share:'Share result', download:'Download card', challenge:'Copy challenge link', review:'Review board', copied:'Challenge link copied.', imported:'Shared ranking imported.', importTitle:'A friend shared a Ramen Passport.', importBody:'Preview it or import it into this browser. Importing replaces your current tier placements but keeps your tasting notes.', import:'Import ranking', dismiss:'Dismiss',
      last:'Just ranked', addNote:'Add a 10-second note', noteTitle:'Tasting note', taste:'Taste', texture:'Texture', value:'Value', rebuy:'Would buy again', notePlaceholder:'What stood out? Broth, noodles, spice, toppings…', save:'Save note', cancel:'Cancel', saved:'Tasting note saved.',
      verified:'Vegan verified', not:'Not vegan', check:'Check this pack', vegetarian:'Vegetarian · not vegan-verified', de:'Germany / EU checked', global:'Germany review pending'
    },
    de:{
      eyebrow:'SCHNELL-RANKING', title:'Eine Bowl nach der anderen.', intro:'Jetzt schnell bewerten. Belege später öffnen und alles im Board neu sortieren.', quick:'Schnell ranken', board:'Board prüfen',
      scopes:{de:'Deutschland / EU geprüft',verified:'Vegan bestätigt',all:'Alle 50',untasted:'Nicht probiert'}, shuffle:'Reihenfolge mischen', ranked:'in diesem Set eingeordnet',
      source:'Nachweis öffnen', buy:'In Deutschland kaufen / suchen', prompt:'DEIN URTEIL', skip:'Nicht probiert · überspringen', undo:'Letztes rückgängig', note:'Probiernotiz hinzufügen', editNote:'Probiernotiz bearbeiten',
      keys:'Tastatur: S · A · B · C · F zum Einordnen, X überspringt, U macht rückgängig, N öffnet Notizen.', complete:'Diese Pass-Seite ist komplett!', completeBody:'Du hast alle verbleibenden Ramen in diesem Set eingeordnet. Teile das Ergebnis, erstelle einen Challenge-Link oder prüfe das ganze Board.',
      share:'Ergebnis teilen', download:'Karte herunterladen', challenge:'Challenge-Link kopieren', review:'Board prüfen', copied:'Challenge-Link kopiert.', imported:'Geteiltes Ranking importiert.', importTitle:'Ein Freund hat einen Ramen-Pass geteilt.', importBody:'Du kannst ihn importieren. Dabei werden deine Tier-Platzierungen ersetzt; Probiernotizen bleiben erhalten.', import:'Ranking importieren', dismiss:'Schließen',
      last:'Gerade eingeordnet', addNote:'10-Sekunden-Notiz hinzufügen', noteTitle:'Probiernotiz', taste:'Geschmack', texture:'Textur', value:'Preis-Leistung', rebuy:'Würde ich nachkaufen', notePlaceholder:'Was fiel auf? Brühe, Nudeln, Schärfe, Toppings …', save:'Notiz speichern', cancel:'Abbrechen', saved:'Probiernotiz gespeichert.',
      verified:'Vegan bestätigt', not:'Nicht vegan', check:'Packung prüfen', vegetarian:'Vegetarisch · nicht vegan bestätigt', de:'Deutschland / EU geprüft', global:'Deutschland-Prüfung offen'
    }
  };

  function lang(){ return document.documentElement.lang === 'de' ? 'de' : 'en'; }
  function t(key){ return copy[lang()][key]; }
  function current(value){ return typeof value === 'object' && value ? (value[lang()] || value.en || '') : (value || ''); }
  function escapeHTML(value){ return String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
  function readJSON(key,fallback){ try{return JSON.parse(localStorage.getItem(key)) || fallback;}catch{return fallback;} }
  function writeJSON(key,value){ localStorage.setItem(key,JSON.stringify(value)); }
  function notes(){ return readJSON(NOTES,{}); }

  function state(){
    const raw = readJSON(STORAGE,{});
    const ranking = Object.fromEntries(TIERS.map(tier=>[tier,Array.isArray(raw.ranking?.[tier]) ? raw.ranking[tier].filter(id=>byId.has(id)) : []]));
    const seen = new Set(TIERS.flatMap(tier=>ranking[tier]));
    products.forEach(item=>{ if(!seen.has(item.id)) ranking.pool.push(item.id); });
    return {ranking,tasted:raw.tasted || {}};
  }

  function placement(id,appState=state()){ return TIERS.find(tier=>appState.ranking[tier].includes(id)) || 'pool'; }
  function isDe(item){ return ['germany-retailer','official-eu'].includes(item.verificationLevel); }
  function inScope(item,appState){
    if(ui.scope === 'de') return isDe(item);
    if(ui.scope === 'verified') return item.vegan === 'verified';
    if(ui.scope === 'untasted') return !appState.tasted[item.id];
    return true;
  }

  function scopeItems(appState=state()){ return products.filter(item=>inScope(item,appState)).sort((a,b)=>(a.rank||999)-(b.rank||999)); }
  function remaining(appState=state()){
    const list = scopeItems(appState).filter(item=>placement(item.id,appState)==='pool' && !ui.skipped.has(item.id));
    if(ui.shuffle) list.sort(()=>Math.random()-.5);
    return list;
  }

  function triggerPlacement(id,tier){
    const before = state();
    const fromTier = placement(id,before);
    const fromTasted = Boolean(before.tasted[id]);
    const select = document.querySelector(`[data-place="${id}"]`);
    ui.undo.push({id,fromTier,fromTasted});
    ui.undo = ui.undo.slice(-20);
    if(select){
      select.value=tier;
      select.dispatchEvent(new Event('change',{bubbles:true}));
      setTimeout(()=>{
        const fresh=state();
        if(!fresh.tasted[id]) document.querySelector(`[data-tasted="${id}"]`)?.click();
        ui.lastRankedId=id;ui.currentId=null;render();
      },0);
      return;
    }
    const next=before;
    TIERS.forEach(key=>next.ranking[key]=next.ranking[key].filter(value=>value!==id));
    next.ranking[tier].push(id);next.tasted[id]=true;writeJSON(STORAGE,next);location.reload();
  }

  function undo(){
    const action=ui.undo.pop();if(!action)return;
    const select=document.querySelector(`[data-place="${action.id}"]`);
    if(select){select.value=action.fromTier;select.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(()=>{
      const fresh=state();
      if(Boolean(fresh.tasted[action.id])!==action.fromTasted) document.querySelector(`[data-tasted="${action.id}"]`)?.click();
      ui.currentId=action.id;ui.lastRankedId=null;render();
    },0);}
  }

  function nextItem(appState){
    const list=remaining(appState);
    if(ui.currentId && list.some(item=>item.id===ui.currentId)) return byId.get(ui.currentId);
    ui.currentId=list[0]?.id || null;
    return list[0] || null;
  }

  function badge(item){
    const vegan=t(item.vegan in copy[lang()] ? item.vegan : 'check');
    const market=isDe(item)?t('de'):t('global');
    return `<div class="quick-badges"><span class="${escapeHTML(item.vegan||'check')}">${escapeHTML(vegan)}</span><span class="market">${escapeHTML(market)}</span></div>`;
  }

  function render(){
    const root=$('#quickRank');if(!root)return;
    const appState=state();const scoped=scopeItems(appState);const left=remaining(appState);const ranked=scoped.filter(item=>placement(item.id,appState)!=='pool').length;
    const pct=scoped.length?ranked/scoped.length*100:0;const item=nextItem(appState);const savedNotes=notes();
    document.body.dataset.ramenView=ui.view;
    root.innerHTML=`
      <div class="shared-ranking-banner" id="sharedBanner"></div>
      <div class="quick-head"><div><span class="section-no">${t('eyebrow')}</span><h3>${t('title')}</h3></div><div><p>${t('intro')}</p><div class="view-switch"><button data-view="quick" class="${ui.view==='quick'?'active':''}">${t('quick')}</button><button data-view="board" class="${ui.view==='board'?'active':''}">${t('board')}</button></div></div></div>
      <div class="quick-scope-row"><div class="quick-scopes">${['de','verified','all','untasted'].map(key=>`<button class="quick-scope ${ui.scope===key?'active':''}" data-scope="${key}">${t('scopes')[key]} · ${scopeCount(key,appState)}</button>`).join('')}</div><button class="quick-shuffle" id="quickShuffle">${t('shuffle')} ${ui.shuffle?'✓':'↻'}</button></div>
      <div class="quick-progress"><span>${ranked}/${scoped.length} ${t('ranked')}</span><div class="quick-progress-track"><i style="width:${pct}%"></i></div><span>${left.length} left</span></div>
      ${ui.lastRankedId?postRank(byId.get(ui.lastRankedId),savedNotes):''}
      ${item?quickCard(item,savedNotes[item.id]):completeCard()}`;
    bindQuick();renderSharedBanner();enhanceCards();
  }

  function scopeCount(key,appState){
    if(key==='de')return products.filter(isDe).length;
    if(key==='verified')return products.filter(item=>item.vegan==='verified').length;
    if(key==='untasted')return products.filter(item=>!appState.tasted[item.id]).length;
    return products.length;
  }

  function postRank(item,savedNotes){
    if(!item)return'';const has=savedNotes[item.id];
    return `<div class="shared-ranking-banner show"><p><b>${t('last')}:</b> ${escapeHTML(item.brand)} ${escapeHTML(item.name)}</p><div><button data-note="${item.id}">${has?t('editNote'):t('addNote')}</button><button id="quickUndoTop">${t('undo')}</button></div></div>`;
  }

  function quickCard(item,note){
    const source=item.source?`<a href="${escapeHTML(item.source)}" target="_blank" rel="noopener">${t('source')} ↗</a>`:'';
    const buy=item.buy || `https://www.kaufland.de/s/?search_value=${encodeURIComponent(`${item.brand} ${item.name}`)}`;
    return `<div class="quick-stage">
      <div class="quick-pack"><span class="quick-passport-no">PASSPORT ${String(item.rank||0).padStart(2,'0')} / ${products.length}</span><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.brand)} ${escapeHTML(item.name)}"></div>
      <article class="quick-card"><span class="quick-brand">${escapeHTML(item.brand)} · ${escapeHTML(item.country)}</span><h4>${escapeHTML(item.name)}</h4>
        <div class="quick-meta"><span>${escapeHTML(item.style)}</span><span>🌶 ${escapeHTML(item.spice??0)}/5</span>${item.gtin?`<span>GTIN ${escapeHTML(item.gtin)}</span>`:''}</div>${badge(item)}
        <p class="quick-evidence">${escapeHTML(current(item.evidence))}</p><div class="quick-links">${source}<a class="buy" href="${escapeHTML(buy)}" target="_blank" rel="noopener">${t('buy')} ↗</a></div>
        <span class="quick-rank-label">${t('prompt')}</span><div class="quick-tier-buttons">${tierButtons()}</div>
        <div class="quick-secondary"><button id="quickSkip">${t('skip')} <kbd>X</kbd></button><button id="quickUndo" ${ui.undo.length?'':'disabled'}>${t('undo')} <kbd>U</kbd></button><button data-note="${item.id}">${note?t('editNote'):t('note')} <kbd>N</kbd></button></div><p class="quick-hints">${t('keys')}</p>
      </article></div>`;
  }

  function tierButtons(){const colors={S:'#d8ff58',A:'#f3c97d',B:'#d9d2bf',C:'#c6d1c8',F:'#ddaa98'};return ['S','A','B','C','F'].map(tier=>`<button class="quick-tier" data-quick-tier="${tier}" style="--tier:${colors[tier]}">${tier}<kbd>${tier}</kbd></button>`).join('');}

  function completeCard(){return `<div class="quick-complete"><div class="complete-icon">🏁🍜</div><h4>${t('complete')}</h4><p>${t('completeBody')}</p><div class="complete-actions"><button class="primary" id="quickShare">${t('share')}</button><button id="quickDownload">${t('download')}</button><button id="quickChallenge">${t('challenge')}</button><button id="quickReview">${t('review')}</button></div></div>`;}

  function bindQuick(){
    $$('[data-view]','#quickRank').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    $$('[data-scope]','#quickRank').forEach(button=>button.addEventListener('click',()=>{ui.scope=button.dataset.scope;localStorage.setItem(SCOPE,ui.scope);ui.currentId=null;ui.skipped.clear();render();}));
    $$('[data-quick-tier]','#quickRank').forEach(button=>button.addEventListener('click',()=>{if(ui.currentId)triggerPlacement(ui.currentId,button.dataset.quickTier);}));
    $$('[data-note]','#quickRank').forEach(button=>button.addEventListener('click',()=>openNote(button.dataset.note)));
    $('#quickShuffle')?.addEventListener('click',()=>{ui.shuffle=!ui.shuffle;ui.currentId=null;render();});
    $('#quickSkip')?.addEventListener('click',()=>{if(ui.currentId)ui.skipped.add(ui.currentId);ui.currentId=null;render();});
    $('#quickUndo')?.addEventListener('click',undo);$('#quickUndoTop')?.addEventListener('click',undo);
    $('#quickShare')?.addEventListener('click',()=>$('#shareRanking')?.click());
    $('#quickDownload')?.addEventListener('click',downloadCard);$('#quickChallenge')?.addEventListener('click',copyChallenge);$('#quickReview')?.addEventListener('click',()=>setView('board'));
  }

  function setView(view){ui.view=view;localStorage.setItem(VIEW,view);document.body.dataset.ramenView=view;render();if(view==='board')$('#rank')?.scrollIntoView({behavior:'smooth'});}

  function enhanceCards(){
    $$('.product').forEach(card=>{const rank=$('.rank',card);if(rank&&!rank.dataset.passport)rank.dataset.passport=(rank.textContent||'').replace(/\D/g,'').padStart(2,'0');$('img',card)?.setAttribute('loading','lazy');});
  }

  function openNote(id){
    const item=byId.get(id);if(!item)return;ui.noteId=id;const existing=notes()[id]||{taste:0,texture:0,value:0,rebuy:false,note:''};ui.noteDraft={...existing};
    $('#noteTitle').textContent=`${item.brand} ${item.name}`;$('#noteCopy').textContent=t('noteTitle');$('#noteText').placeholder=t('notePlaceholder');$('#noteText').value=existing.note||'';
    ['taste','texture','value'].forEach(key=>{$(`[data-rating-label="${key}"]`).textContent=t(key);$$(`[data-rating="${key}"]`).forEach(button=>button.classList.toggle('active',Number(button.dataset.value)===Number(existing[key])));});
    $('#rebuyLabel').textContent=t('rebuy');$('#rebuyToggle').classList.toggle('active',Boolean(existing.rebuy));$('#noteSave').textContent=t('save');$('#noteCancel').textContent=t('cancel');$('#noteModal').classList.add('open');
  }

  function saveNote(){if(!ui.noteId)return;ui.noteDraft.note=$('#noteText').value.trim();const all=notes();all[ui.noteId]={...ui.noteDraft,updatedAt:new Date().toISOString()};writeJSON(NOTES,all);closeNote();toast(t('saved'));render();}
  function closeNote(){$('#noteModal')?.classList.remove('open');ui.noteId=null;ui.noteDraft=null;}

  function challengePayload(){const s=state();return {v:1,ranking:Object.fromEntries(['S','A','B','C','F'].map(tier=>[tier,s.ranking[tier]]))};}
  function encode(value){const bytes=new TextEncoder().encode(JSON.stringify(value));let binary='';bytes.forEach(byte=>binary+=String.fromCharCode(byte));return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  function decode(value){try{const base=value.replace(/-/g,'+').replace(/_/g,'/');const binary=atob(base);const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));}catch{return null;}}
  async function copyChallenge(){const url=new URL(location.href);url.searchParams.set('challenge',encode(challengePayload()));url.hash='rank';try{await navigator.clipboard.writeText(url.toString());toast(t('copied'));}catch{}}

  function renderSharedBanner(){
    const node=$('#sharedBanner');if(!node)return;const raw=new URLSearchParams(location.search).get('challenge');const shared=raw?decode(raw):null;if(!shared?.ranking)return;
    const count=['S','A','B','C','F'].reduce((sum,tier)=>sum+(shared.ranking[tier]?.length||0),0);node.classList.add('show');node.innerHTML=`<p><b>${t('importTitle')}</b><br>${t('importBody')} · ${count} ranked</p><div><button id="importShared">${t('import')}</button><button id="dismissShared">${t('dismiss')}</button></div>`;
    $('#importShared')?.addEventListener('click',()=>importShared(shared));$('#dismissShared')?.addEventListener('click',()=>{const url=new URL(location.href);url.searchParams.delete('challenge');history.replaceState({},'',url);node.remove();});
  }

  function importShared(shared){
    const valid=new Set(products.map(item=>item.id));const seen=new Set();const ranking={S:[],A:[],B:[],C:[],F:[],pool:[]};
    ['S','A','B','C','F'].forEach(tier=>(shared.ranking[tier]||[]).forEach(id=>{if(valid.has(id)&&!seen.has(id)){ranking[tier].push(id);seen.add(id);}}));products.forEach(item=>{if(!seen.has(item.id))ranking.pool.push(item.id);});const previous=state();writeJSON(STORAGE,{ranking,tasted:previous.tasted});toast(t('imported'));const url=new URL(location.href);url.searchParams.delete('challenge');history.replaceState({},'',url);location.reload();
  }

  function downloadCard(){
    const s=state(),canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');ctx.fillStyle='#f5efe2';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#173629';ctx.fillRect(0,0,1080,150);ctx.fillStyle='#d9ff55';ctx.font='800 34px Arial';ctx.fillText('RAMEN PASSPORT',65,68);ctx.fillStyle='white';ctx.font='800 58px Arial';ctx.fillText('MY TIER LIST',65,126);ctx.fillStyle='#172018';ctx.font='700 24px Arial';const ranked=['S','A','B','C','F'].reduce((sum,tier)=>sum+s.ranking[tier].length,0);ctx.fillText(`${ranked}/${products.length} ranked · ${Object.values(s.tasted).filter(Boolean).length}/${products.length} tasted`,65,205);
    const colors={S:'#d8ff58',A:'#f3c97d',B:'#d9d2bf',C:'#c6d1c8',F:'#ddaa98'};let y=250;['S','A','B','C','F'].forEach(tier=>{ctx.fillStyle=colors[tier];ctx.fillRect(55,y,95,175);ctx.strokeStyle='#172018';ctx.lineWidth=4;ctx.strokeRect(55,y,95,175);ctx.fillStyle='#172018';ctx.font='800 54px Arial';ctx.fillText(tier,85,y+100);ctx.font='700 23px Arial';const names=s.ranking[tier].slice(0,6).map(id=>{const item=byId.get(id);return item?`${item.brand} ${item.name}`:id;});wrapLines(ctx,names.length?names.join('  ·  '):'—',185,y+45,820,31,4);y+=195;});ctx.fillStyle='#687168';ctx.font='22px Arial';ctx.fillText('ramen-passport · Germany-first · every claim sourced',65,1305);canvas.toBlob(blob=>{if(!blob)return;const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='my-ramen-passport.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},'image/png');
  }
  function wrapLines(ctx,text,x,y,maxWidth,lineHeight,maxLines){const words=text.split(' ');let line='',lines=0;for(let i=0;i<words.length;i++){const test=line+words[i]+' ';if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line.trim(),x,y+lines*lineHeight);line=words[i]+' ';lines++;if(lines>=maxLines-1)break;}else line=test;}ctx.fillText(line.trim(),x,y+lines*lineHeight);}
  function toast(message){const node=$('#toast');if(!node)return;node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2200);}

  function inject(){
    const rank=$('#rank .wrap');const shell=$('.passport-shell',rank);if(!rank||!shell)return;
    const quick=document.createElement('section');quick.id='quickRank';quick.className='quick-rank';rank.insertBefore(quick,shell);
    const back=document.createElement('button');back.type='button';back.className='tool back-to-quick';back.textContent=t('quick');back.addEventListener('click',()=>setView('quick'));$('.board-intro')?.append(back);
    const modal=document.createElement('div');modal.id='noteModal';modal.className='note-modal';modal.innerHTML=`<div class="note-card"><button class="note-close" id="noteClose">×</button><span class="section-no" id="noteCopy"></span><h3 id="noteTitle"></h3><p>${t('addNote')}</p><div class="rating-grid">${['taste','texture','value'].map(key=>`<div class="rating-field"><label data-rating-label="${key}"></label><div class="rating-buttons">${[1,2,3,4,5].map(value=>`<button type="button" data-rating="${key}" data-value="${value}">${value}</button>`).join('')}</div></div>`).join('')}</div><div class="rebuy-row"><span id="rebuyLabel"></span><button id="rebuyToggle" type="button">✓</button></div><textarea class="note-text" id="noteText"></textarea><div class="note-actions"><button id="noteCancel"></button><button class="save" id="noteSave"></button></div></div>`;document.body.append(modal);
    $('#noteClose').addEventListener('click',closeNote);$('#noteCancel').addEventListener('click',closeNote);$('#noteSave').addEventListener('click',saveNote);$('#noteModal').addEventListener('click',event=>{if(event.target===$('#noteModal'))closeNote();});
    $$('[data-rating]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.rating;ui.noteDraft[key]=Number(button.dataset.value);$$(`[data-rating="${key}"]`).forEach(other=>other.classList.toggle('active',other===button));}));$('#rebuyToggle').addEventListener('click',()=>{ui.noteDraft.rebuy=!ui.noteDraft.rebuy;$('#rebuyToggle').classList.toggle('active',ui.noteDraft.rebuy);});
    const audit=$('#audit'),rankSection=$('#rank');if(audit&&rankSection)rankSection.after(audit);
    render();
  }

  function keyboard(event){if(event.metaKey||event.ctrlKey||event.altKey)return;const tag=document.activeElement?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;const key=event.key.toUpperCase();if(['S','A','B','C','F'].includes(key)&&ui.view==='quick'&&ui.currentId){event.preventDefault();triggerPlacement(ui.currentId,key);}else if(key==='X'&&ui.view==='quick'){event.preventDefault();$('#quickSkip')?.click();}else if(key==='U'){event.preventDefault();undo();}else if(key==='N'&&ui.currentId){event.preventDefault();openNote(ui.currentId);}}

  function bindObservers(){
    const observer=new MutationObserver(()=>{enhanceCards();if(ui.view==='quick')requestAnimationFrame(render);});['#board','#pool'].forEach(selector=>{const node=$(selector);if(node)observer.observe(node,{childList:true,subtree:true});});
    const languageObserver=new MutationObserver(()=>render());languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});document.addEventListener('keydown',keyboard);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{inject();bindObservers();});else{inject();bindObservers();}
})();