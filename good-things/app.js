/* GOOD THINGS 1.3 · Account-backed vegan shelves with an honest offline demo.
   Client code intentionally uses text-escaped HTML; only public publishable API credentials here. */
(function(){
'use strict';
const ALL=Array.isArray(window.GT_CATALOG)?window.GT_CATALOG:[];
const GROUPS=Array.isArray(window.GT_GROUPS)?window.GT_GROUPS:[];
const URL_BASE=location.origin+location.pathname;
const TIERS=['S','A','B','C','D'];
const TIER_SCORE={S:5,A:4,B:3,C:2,D:1};
const STORE_KEY='goodthings_v13_guest';
const IMG_KEY='goodthings_v13_images';
const SUPA_URL='https://htffcvdopavknnylbowl.supabase.co';
const SUPA_KEY='sb_publishable_0cPCOu4yilz5wtsuFuPA1w_Z_uMcLcO';
const $=(sel)=>document.querySelector(sel);
const $$=(sel)=>Array.from(document.querySelectorAll(sel));
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=esc;
const validUrl=(s)=>{try{let u=new URL(s);return u.protocol==='https:'?u.href:''}catch(_){return''}};
const getProduct=(id)=>ALL.find((p)=>p.id===id);
const rankableProduct=p=>Boolean(p&&p.vegan_status!=='non_vegan');
const RANKABLE=ALL.filter(rankableProduct);
const FLAGGED=ALL.filter(p=>!rankableProduct(p));
const tryRead=(key,fallback)=>{try{const d=JSON.parse(localStorage.getItem(key)||'null');return d&&typeof d==='object'?d:fallback}catch(_){return fallback}};
const st={view:'board',boardQuery:'',boardCategory:'all',boardPhotoFilter:'all',boardHistory:[],boardBusy:false,boardModalProduct:null,boardUndoing:false,category:'all',store:'all',sort:'name',query:'',ratedOnly:false,persona:'you',selected:null,draftTier:'',draftNote:'',draftPublic:true,guest:{mikel:{},huong:{},you:{}},imageCache:{},user:null,profile:null,allRatings:[],profiles:[],follows:[],lists:[],curators:[],ourMode:'published',cloud:'connecting',modal:'',openedUser:null,shareData:null,shareList:null,returnView:'discover'};
let sb=null;
function safeGuest(raw){
 const ret={mikel:{},huong:{},you:{}};
 for(const who of Object.keys(ret)){
  const entries=raw&&typeof raw[who]==='object'?Object.entries(raw[who]):[];
  for(const [id,r] of entries){
   if(!getProduct(id)||!r||!TIERS.includes(r.tier))continue;
   ret[who][id]={tier:r.tier,note:String(r.note||'').slice(0,200),is_public:r.is_public===true,position:Number.isFinite(Number(r.position))?Number(r.position):0};
  }
 }return ret;
}
st.guest=safeGuest(tryRead(STORE_KEY,{}));
st.imageCache=tryRead(IMG_KEY,{});
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(st.guest))}catch(_){}}
function persistImages(){try{localStorage.setItem(IMG_KEY,JSON.stringify(st.imageCache))}catch(_){}}
function toast(message){const t=$('#toaster');t.textContent=message;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),4100)}
function accountRating(id){return st.allRatings.find(r=>r.user_id===st.user?.id&&r.product_id===id)}
function selfRatings(){return st.user?st.allRatings.filter(r=>r.user_id===st.user.id):Object.entries(st.guest.you).map(([product_id,r])=>({product_id,tier:r.tier,note:r.note,is_public:r.is_public,position:r.position||0}))}
function guestRating(id,who){return st.guest[who]?.[id]||null}
function showRating(id){return st.user?accountRating(id):guestRating(id,'you')}
function avatar(profile,large){
 const str=(profile?.display_name||profile?.handle||'?').trim();
 return '<div class="avatar '+(profile?.accent||'lime')+'"'+(large?' style="height:70px;width:70px;font-size:27px"':'')+'>'+esc(str.substring(0,1).toUpperCase())+'</div>';
}
function tierBadge(tier){
 return tier?'<span class="tier tier-display" data-tier="'+esc(tier)+'" style="--tiercolor:'+({S:'#dcec8d',A:'#c6e6b4',B:'#c9e9f8',C:'#ffdfb0',D:'#f4bcbc'}[tier]||'#fff')+'">'+esc(tier)+'</span>':'<span class="small muted">Not rated</span>';
}
function openOverlay(id){const x=$('#'+id);x.classList.add('open');x.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeOverlay(id){const x=$('#'+id);x.classList.remove('open');x.setAttribute('aria-hidden','true');if(!$('.overlay.open'))document.body.style.overflow=''}
function closeAll(){closeOverlay('modalOverlay');closeOverlay('drawerOverlay')}
function empty(emoji,heading,body,button){
 return '<div class="empty"><div class="big">'+esc(emoji)+'</div><strong>'+esc(heading)+'</strong><p>'+esc(body)+'</p>'+(button||'')+'</div>';
}
function setView(view,extra){
 if(!['board','discover','ours','my','community','shared','profile','list'].includes(view))view='board';
 st.view=view;
 if(view!=='shared'&&view!=='profile'&&view!=='list'){
  const u=new URL(URL_BASE);u.searchParams.set('view',view);history.replaceState(null,'',u.toString());
 }
 render();
 if(extra!==false)document.querySelector('#workspace')?.scrollIntoView({block:'start',behavior:'smooth'});
}
function head(k,title,subtitle,aside){
 return '<div class="section-head"><div><div class="eyebrow">'+esc(k)+'</div><h2>'+title+'</h2><p>'+esc(subtitle)+'</p></div><div class="section-stamp">'+esc(aside||'A LITTLE MORE GOOD')+'</div></div>';
}
function matchedPhoto(p){
 return Boolean(validUrl(p.image_url)&&['retailer','brand','barcode'].includes(p.image_status));
}
function photoSourceLabel(p){
 return p.image_status==='retailer'?'RETAILER PACKSHOT':p.image_status==='brand'?'BRAND PACKSHOT':p.image_status==='barcode'?'BARCODE PACKSHOT':'PHOTO CANDIDATE';
}
function productArt(p){
 const cached=st.imageCache[p.id];
 const isMatched=matchedPhoto(p);
 const img=isMatched?validUrl(p.image_url):validUrl(cached?.url);
 const show=Boolean(img&&(isMatched||cached?.kind==='off'));
 const fallback='<span class="art-emoji">'+esc(p.emoji||'✳')+'</span>';
 const link=isMatched?'<a class="photo-credit" target="_blank" rel="noopener noreferrer" href="'+attr(validUrl(p.image_source_url||p.source_url))+'" title="Product photo from '+attr(p.photo_attribution||'source')+'">↗ '+esc(p.photo_attribution||'Source')+'</a>':'';
 return '<div class="product-art tone-'+esc(p.tone||'mint')+'">'+
 (show?'<img loading="lazy" src="'+attr(img)+'" alt="'+attr(p.brand+' '+p.name)+' product packaging" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false">'+
 '<span class="art-emoji" hidden>'+esc(p.emoji||'✳')+'</span>':fallback)+
 '<span class="art-label-small">'+(isMatched?photoSourceLabel(p):show?'PHOTO CANDIDATE':'NO CONFIRMED PHOTO')+'</span>'+link+'</div>';
}
function productCard(p){
 const r=showRating(p.id);
 return '<article class="product-card">'+productArt(p)+'<div class="card-topline"><span class="micro">'+esc(p.category)+'</span><span class="storetag">'+esc(p.store)+'</span></div><div><p class="brandname">'+esc(p.brand)+'</p><h3>'+esc(p.name)+'</h3></div><div class="card-bottom"><div class="tier-row" aria-label="Your rating for '+attr(p.name)+'">'+TIERS.map(t=>'<button class="tier '+(r?.tier===t?'active':'')+'" data-tier="'+t+'" title="Rate '+t+'" aria-label="Rate '+attr(p.name)+' '+t+'" data-action="rate-product" data-id="'+attr(p.id)+'" data-value="'+t+'">'+t+'</button>').join('')+'</div><button class="round-add" title="Details and notes" aria-label="Open '+attr(p.name)+'" data-action="open-product" data-id="'+attr(p.id)+'">↗</button></div></article>';
}
function filteredProducts(){
 let a=RANKABLE.filter(p=>(st.category==='all'||p.category_id===st.category)&&(st.store==='all'||p.store===st.store));
 const q=st.query.trim().toLowerCase();if(q)a=a.filter(p=>(p.name+' '+p.brand+' '+p.store+' '+p.category).toLowerCase().includes(q));
 if(st.ratedOnly)a=a.filter(p=>!!showRating(p.id));
 if(st.sort==='brand')a.sort((a,b)=>a.brand.localeCompare(b.brand,'de')||a.name.localeCompare(b.name,'de'));
 else if(st.sort==='rated')a.sort((a,b)=>(TIER_SCORE[showRating(b.id)?.tier]||0)-(TIER_SCORE[showRating(a.id)?.tier]||0)||a.name.localeCompare(b.name,'de'));
 else a.sort((a,b)=>a.name.localeCompare(b.name,'de'));
 return a;
}

// ----- Interactive TierMaker-style rating board --------------------------------
function boardEntries(){
 return st.user?st.allRatings.filter(r=>r.user_id===st.user.id&&rankableProduct(getProduct(r.product_id))):
 Object.entries(st.guest[st.persona]||{}).filter(([id])=>rankableProduct(getProduct(id))).map(([product_id,r])=>({product_id,tier:r.tier,note:r.note,is_public:r.is_public,position:r.position||0}));
}
function boardSorted(tier,excludeId){
 return boardEntries().filter(r=>r.tier===tier&&r.product_id!==excludeId&&getProduct(r.product_id))
 .sort((a,b)=>(Number(a.position)||0)-(Number(b.position)||0)||a.product_id.localeCompare(b.product_id));
}
function boardNextPosition(tier,excludeId){
 const peer=boardSorted(tier,excludeId);
 return peer.length?(Number(peer[peer.length-1].position)||0)+100:100;
}
function boardPositionBetween(tier,excludeId,index){
 const arr=boardSorted(tier,excludeId);
 const i=Math.max(0,Math.min(arr.length,Number(index)||0));
 const lo=i>0?Number(arr[i-1].position)||0:null;
 const hi=i<arr.length?Number(arr[i].position)||0:null;
 if(lo===null&&hi===null)return 100;
 if(lo===null)return hi-100;
 if(hi===null)return lo+100;
 if(hi-lo>0.00001)return (lo+hi)/2;
 return lo+0.000001;
}
function boardPhoto(p){
 const cache=st.imageCache[p.id];
 const verified=matchedPhoto(p);
 const image=verified?validUrl(p.image_url):validUrl(cache?.url);
 const shown=Boolean(verified||cache?.kind==='off');
 return shown&&image?'<img loading="lazy" draggable="false" src="'+attr(image)+'" alt="'+attr(p.brand+' '+p.name)+' packaging" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="board-emoji" hidden>'+esc(p.emoji)+'</span>':
 '<span class="board-emoji">'+esc(p.emoji)+'</span>';
}
function boardPiece(p){
 const matched=matchedPhoto(p),candidate=st.imageCache[p.id]?.kind==='off';
 const img=matched||candidate;
 const label=p.brand+' '+p.name;
 return '<button type="button" draggable="false" class="board-piece" data-drag-id="'+attr(p.id)+'" data-photo="'+(img?'yes':'none')+'" data-action="board-pick" data-id="'+attr(p.id)+'" title="'+attr(label)+' — drag to rank; tap to choose S–D; arrow keys to move" aria-label="'+attr(label)+' — draggable, tap to rank, arrow keys to change tiers">'
 +boardPhoto(p)+(matched?'<span class="verified-indicator" title="Photo matched to this exact retailer SKU or barcode; recipe still needs checking" aria-hidden="true"></span>':'')
 +'<strong>'+esc(p.name)+'</strong><small>'+esc(p.brand)+'</small></button>';
}
function boardTrayProducts(){
 const rated=new Set(boardEntries().map(r=>r.product_id));
 const query=st.boardQuery.toLocaleLowerCase().trim();
 return RANKABLE.filter(p=>!rated.has(p.id)
 &&(st.boardCategory==='all'||p.category_id===st.boardCategory)
 &&(st.boardPhotoFilter==='all'||(st.boardPhotoFilter==='matched'&&matchedPhoto(p))||(st.boardPhotoFilter==='missing'&&!matchedPhoto(p)))
 &&(!query||(p.brand+' '+p.name+' '+p.category+' '+p.store).toLocaleLowerCase().includes(query)))
 .sort((a,b)=>a.brand.localeCompare(b.brand,'de')||a.name.localeCompare(b.name,'de'));
}
function renderBoard(){
 const entries=boardEntries(),rated=new Set(entries.map(r=>r.product_id));
 const photos=RANKABLE.filter(matchedPhoto).length;
 const who=st.user?(st.profile?.display_name||'You'):(st.persona==='you'?'Your':st.persona==='mikel'?'Mikel':'Huong');
 const personToggle=st.user?'<span class="board-status">🔒 Rating as your verified account</span>':
 '<div class="board-personas" aria-label="Choose local board"><button data-action="board-persona" data-value="you" class="'+(st.persona==='you'?'active':'')+'">You</button><button data-action="board-persona" data-value="mikel" class="'+(st.persona==='mikel'?'active':'')+'">Mikel</button><button data-action="board-persona" data-value="huong" class="'+(st.persona==='huong'?'active':'')+'">Huong</button></div>';
 const rows=TIERS.map(t=>{
  const products=boardSorted(t).map(r=>getProduct(r.product_id)).filter(Boolean);
  const msg={S:'Obsessed',A:'Brilliant',B:'Good',C:'Okay',D:'Not again'};
  return '<div class="tier-lane" data-drop-tier="'+t+'"><div class="lane-tag"><strong>'+t+'</strong><small>'+msg[t]+'</small></div>'
  +'<div class="tier-dropzone" data-drop-tier="'+t+'" aria-label="'+t+' tier, '+products.length+' products">'+(products.length?products.map(boardPiece).join(''):'<span class="drop-hint">Drop something good here…</span>')+'</div></div>';
 }).join('');
 return head('GOOD THINGS / THE TIER BOARD','Pick it up.<br><em>Place your verdict.</em>',
 'Grab a real product, drop it into your tier and rearrange whenever your taste changes. On mobile, press and drag; or tap a pack to pick S–D.',entries.length+' RANKED')
 +'<div class="board-intro">'+personToggle+'<div class="gap12"><button class="button button-small button-ghost" data-action="undo-board" '+(!st.boardHistory.length?'disabled':'')+' title="Undo last move">↶ Undo</button><button class="button button-small button-white" data-action="export-board-png">↓ Save PNG</button><button class="button button-small button-lime" data-action="share-board">Share ↗</button><button class="button button-small button-ghost" data-action="reset-board" '+(!entries.length?'disabled':'')+'>Reset</button></div></div>'
 +(!st.user?'<div class="inline-notice">✳ <strong>Local preview:</strong> switching Mikel/Huong changes only this device’s demo board. Sign in to sync your own honest scores — nobody can post as someone else.</div>':'<div class="inline-notice">♡ Your board is tied to your account. Changes sync to Supabase; each new rating is private until you explicitly publish it.</div>')
 +'<div class="board-layout"><section class="board-pantry" aria-label="Unranked products">'
 +'<div class="board-panel-label"><span>✳ The unranked shelf</span><span id="boardTrayCount">'+boardTrayProducts().length+' left</span></div>'
 +'<div class="board-filter-row"><input type="search" id="boardSearch" class="board-filter" aria-label="Search unranked products" placeholder="Find chocolate, tofu…" value="'+attr(st.boardQuery)+'"><select class="board-filter" id="boardCategory" aria-label="Filter board by category">'
 +'<option value="all">All categories</option>'+GROUPS.map(g=>'<option value="'+attr(g.id)+'" '+(st.boardCategory===g.id?'selected':'')+'>'+esc(g.emoji)+' '+esc(g.label)+'</option>').join('')+'</select><select class="board-filter" id="boardPhotoFilter" aria-label="Photo quality"><option value="all">All photos</option><option value="matched" '+(st.boardPhotoFilter==='matched'?'selected':'')+'>✓ Source-matched</option><option value="missing" '+(st.boardPhotoFilter==='missing'?'selected':'')+'>Needs a packshot</option></select></div>'
 +'<div class="board-tray" id="boardTray" data-drop-tier="unranked" aria-label="Unranked product tray">'+boardTrayProducts().map(boardPiece).join('')+'</div>'
 +'<div class="board-photo-progress" title="Sourced exact retailer photo coverage"><span style="width:'+photos/RANKABLE.length*100+'%"></span></div>'
 +'<div class="board-legend"><span>'+photos+' / '+RANKABLE.length+' source-matched packshots</span><span>Drop here to unrank ↶</span></div>'
 +'</section><section class="board-mat" aria-label="Your S through D tier ranking">'
 +'<div class="board-mat-head"><div><strong>'+esc(who)+' taste board</strong><small style="display:block;margin-top:6px">One opinion at a time. Rearrange as you please.</small></div><small>'+entries.length+' ranked · '+(RANKABLE.length-rated.size)+' to discover</small></div>'
 +rows+'</section></div>'
 +'<div class="board-mobile-hint">↕ <strong>Drag & drop</strong> to rank or reorder. On mobile, hold briefly to drag or tap a product to choose S–D. Keyboard: ↑ ↓ moves tiers, ← → reorders. <button class="navlink" data-action="open-photo-info" style="display:inline;text-decoration:underline">About our photos ↗</button></div>'
 +'<div class="board-scoreboard"><div><strong>'+entries.length+' good things judged.</strong><span>'+Math.min(5,entries.length)+'/5 first-five challenge · '+(RANKABLE.length-rated.size)+' still a mystery</span></div><div class="gap12"><button class="button button-lime button-small" data-nav="my">See my shelf ↗</button><button class="button button-ghost button-small" data-nav="discover">See all products</button></div></div>';
}
function refreshBoardTray(){
 const tray=$('#boardTray');if(tray)tray.innerHTML=boardTrayProducts().map(boardPiece).join('');
 if($('#boardTrayCount'))$('#boardTrayCount').textContent=boardTrayProducts().length+' left';
}
async function boardMove(id,tier,index){
 if(!rankableProduct(getProduct(id))||!(TIERS.includes(tier)||tier==='unranked'))return false;
 const old=st.user?accountRating(id):st.guest[st.persona]?.[id];
 if(tier==='unranked'&&!old)return true;
 const oldIndex=old?boardSorted(old.tier).findIndex(x=>x.product_id===id):-1;
 if(old?.tier===tier&&Number(index)===oldIndex)return true;
 const previous=old?{tier:old.tier,note:old.note||'',is_public:old.is_public===true,position:Number(old.position)||0}:null;
 if(st.boardBusy)return false;
 st.boardBusy=true;
 try{
  if(st.user){
   if(!sb){toast('Cloud is offline — could not save that move.');return false}
   let result;
   if(tier==='unranked'){
    result=await sb.from('gt_ratings').delete().eq('user_id',st.user.id).eq('product_id',id);
   }else{
    const obj={user_id:st.user.id,product_id:id,tier,position:boardPositionBetween(tier,id,index),note:old?.note||'',is_public:old?.is_public===true,updated_at:new Date().toISOString()};
    result=await sb.from('gt_ratings').upsert(obj,{onConflict:'user_id,product_id'});
    if(!result.error){st.allRatings=st.allRatings.filter(x=>!(x.user_id===st.user.id&&x.product_id===id)).concat(obj)}
   }
   if(result.error){toast('Could not save rating: '+String(result.error.message).slice(0,90));return false}
   if(tier==='unranked')st.allRatings=st.allRatings.filter(x=>!(x.user_id===st.user.id&&x.product_id===id));
  }else{
   if(tier==='unranked')delete st.guest[st.persona][id];
   else st.guest[st.persona][id]={tier,position:boardPositionBetween(tier,id,index),note:old?.note||'',is_public:old?.is_public===true};
   persist();
  }
  if(!st.boardUndoing){st.boardHistory.push({id,previous});if(st.boardHistory.length>25)st.boardHistory.shift()}
  render();
  const p=getProduct(id);
  toast(tier==='unranked'?'Back on the unranked shelf.':p.name+' → '+tier+' tier. Nice!');
  return true;
 }finally{st.boardBusy=false}
}
function viewExclusions(){
 const rows=FLAGGED.map(p=>'<div class="review-row"><span style="font-size:23px">⚠️</span><div style="flex:1"><h4>'+esc(p.brand+' '+p.name)+'</h4><p>'+esc(p.vegan_issue||'Product uses animal ingredients')+'</p><a href="'+attr(validUrl(p.source_url))+'" target="_blank" rel="noopener noreferrer" class="small">Ingredients & source ↗</a></div></div>').join('');
 modal('<button class="close" data-action="close-modal">×</button><div class="eyebrow">PRODUCT QUALITY / REAL INGREDIENTS</div><h2>Not vegan.<br>Not on the board.</h2><p class="small muted">We excluded these products after checking manufacturer ingredients. Recipes may change; the actual packet always decides.</p>'+rows+'<p class="small muted">Two ingredient-checked alternatives have been added in their place, keeping 102 rankable products.</p><button class="button button-lime" data-action="close-modal">Back to the good stuff ↗</button>');
}

function quickRank(id){
 const p=getProduct(id);if(!rankableProduct(p))return;
 st.boardModalProduct=id;
 const current=st.user?accountRating(id):guestRating(id,st.persona);
 modal('<button class="close" data-action="close-modal" aria-label="Close">×</button>'+
  '<div class="eyebrow">QUICK RANK / '+esc(p.brand)+'</div><h2>'+esc(p.name)+'</h2>'+
  '<div class="quick-rank-art">'+boardPhoto(p)+'</div>'+
  '<p class="small muted">Where does it belong on your tier list?</p>'+
  '<div class="quick-rank-choices">'+TIERS.map(t=>'<button type="button" class="quick-rank-button" data-rank-tier="'+t+'" data-action="quick-rank" data-value="'+t+'" aria-label="Place in '+t+' tier"><strong>'+t+'</strong><small>'+({S:'Obsessed',A:'Brilliant',B:'Good',C:'Okay',D:'Not again'}[t])+'</small></button>').join('')+'</div>'+
  '<div class="gap12" style="margin-top:18px"><button class="button button-ghost button-small" data-action="quick-detail">Taste notes & details ↗</button>'+
  (current?'<button class="button button-white button-small" data-action="quick-unrank">↶ Return to tray</button>':'')+'</div>');
}
async function undoBoard(){
 if(st.boardBusy)return;
 const h=st.boardHistory.pop();if(!h){toast('Nothing to undo.');return}
 const {id,previous}=h;
 st.boardBusy=true;
 try{
  if(st.user){
   if(!sb){st.boardHistory.push(h);toast('Cannot undo while sync is offline.');return}
   let result;
   if(!previous)result=await sb.from('gt_ratings').delete().eq('user_id',st.user.id).eq('product_id',id);
   else result=await sb.from('gt_ratings').upsert({user_id:st.user.id,product_id:id,tier:previous.tier,note:previous.note,is_public:previous.is_public,position:previous.position,updated_at:new Date().toISOString()},{onConflict:'user_id,product_id'});
   if(result.error){st.boardHistory.push(h);toast('Could not undo: '+result.error.message);return}
   st.allRatings=st.allRatings.filter(r=>!(r.user_id===st.user.id&&r.product_id===id));
   if(previous)st.allRatings.push({user_id:st.user.id,product_id:id,...previous});
  }else{
   if(previous)st.guest[st.persona][id]={...previous};
   else delete st.guest[st.persona][id];
   persist();
  }
  render();toast('Last move undone ↶');
 }finally{st.boardBusy=false}
}
function askResetBoard(){
 if(!boardEntries().length)return toast('Your board is already empty.');
 modal('<button class="close" data-action="close-modal" aria-label="Close">×</button><div class="eyebrow">START AGAIN</div><h2>Clear this tier list?</h2><p>Your ratings and notes on this board will be removed. This cannot be undone. Your saved community profile stays intact.</p><div class="gap12"><button class="button button-ghost" data-action="close-modal">Keep my board</button><button class="button button-dark" data-action="confirm-reset-board">Clear everything</button></div>');
}
async function resetBoard(){
 if(st.boardBusy)return;
 st.boardBusy=true;
 try{
  if(st.user){
   if(!sb)return toast('Cannot clear your account board while offline.');
   const {error}=await sb.from('gt_ratings').delete().eq('user_id',st.user.id);
   if(error)return toast('Could not reset: '+error.message);
   st.allRatings=st.allRatings.filter(r=>r.user_id!==st.user.id);
  }else{st.guest[st.persona]={};persist()}
  st.boardHistory=[];closeOverlay('modalOverlay');render();toast('Fresh start. The shelf is yours ✳');
 }finally{st.boardBusy=false}
}
function photoInformation(){
 const count=RANKABLE.filter(matchedPhoto).length;
 modal('<button class="close" data-action="close-modal" aria-label="Close">×</button><div class="eyebrow">PACKSHOT TRUST STANDARD</div><h2>Real packs. Real sources.</h2>'+
 '<p><strong>'+count+' of '+RANKABLE.length+'</strong> products currently have a specific retailer, brand, or barcode-linked packshot. The remaining '+(RANKABLE.length-count)+' use illustrations, not arbitrary search images.</p>'+
 '<p class="small muted">Source-matched means a traceable product record, not a promise that packaging has not changed. Check the barcode and ingredients against the packet before buying. No product gets a misleading green verified badge just for looking close.</p>'+
 '<div class="gap12"><a class="button button-lime" href="./lookup.html">Open Product Detective ↗</a><button class="button button-ghost" data-action="close-modal">Got it</button></div>');
}
async function boardPhotoForCanvas(p){
 if(!matchedPhoto(p)||typeof Image==='undefined')return null;
 const url=validUrl(p.image_url);if(!url)return null;
 return await new Promise(resolve=>{
  const img=new Image();let done=false;
  const finish=v=>{if(done)return;done=true;clearTimeout(timer);resolve(v)};
  const timer=setTimeout(()=>finish(null),2400);
  img.crossOrigin='anonymous';img.onload=()=>finish(img);img.onerror=()=>finish(null);img.src=url;
 });
}
async function exportBoardPng(){
 const rows=TIERS.map(t=>({tier:t,items:boardSorted(t).map(r=>getProduct(r.product_id)).filter(Boolean)}));
 const count=rows.reduce((n,r)=>n+r.items.length,0);
 if(!count)return toast('Rank something before exporting a PNG.');
 if(typeof document.createElement!=='function')return toast('Image export needs a browser.');
 const canvas=document.createElement('canvas');const W=1400,GAP=15,CARD=133,MAXCOL=9,TOP=170;
 const H=TOP+rows.reduce((n,row)=>n+Math.max(142,Math.ceil(row.items.length/MAXCOL)*146+20)+8,0)+90;
 canvas.width=W;canvas.height=H;
 const ctx=canvas.getContext('2d');if(!ctx)return toast('Canvas export is not supported here.');
 ctx.fillStyle='#f7f7f0';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#263d31';ctx.font='bold 52px Georgia';ctx.fillText('GOOD THINGS',52,76);
 ctx.fillStyle='#71836e';ctx.font='22px system-ui';ctx.fillText('A LITTLE MORE GOOD · MY TIER LIST',54,111);
 ctx.textAlign='right';ctx.font='20px system-ui';ctx.fillText(count+' PRODUCTS RANKED',W-46,70);ctx.textAlign='left';
 const all=rows.flatMap(r=>r.items),images=new Map();
 const loaded=await Promise.all(all.map(boardPhotoForCanvas));
 all.forEach((p,i)=>images.set(p.id,loaded[i]));
 const colors={S:'#c8e881',A:'#d8ebac',B:'#d0e8e8',C:'#f3dfae',D:'#f2c3bb'};
 let y=TOP;
 const rounded=(x,yy,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,yy,w,h,r);ctx.fill()};
 for(const row of rows){
  const rowH=Math.max(142,Math.ceil(row.items.length/MAXCOL)*146+20);
  ctx.fillStyle='#fffefa';rounded(50,y,W-100,rowH,16);
  ctx.fillStyle=colors[row.tier];rounded(50,y,115,rowH,16);
  ctx.fillStyle='#20392d';ctx.font='bold 74px system-ui';ctx.textAlign='center';ctx.fillText(row.tier,107,y+Math.min(rowH/2+26,99));ctx.textAlign='left';
  row.items.forEach((p,i)=>{
   const x=182+(i%MAXCOL)*(CARD+GAP),yy=y+12+Math.floor(i/MAXCOL)*146;
   ctx.fillStyle='#f3f6ed';rounded(x,yy,CARD,126,9);
   const img=images.get(p.id);
   if(img){try{const scale=Math.min(115/img.width,79/img.height);const ww=img.width*scale,hh=img.height*scale;ctx.drawImage(img,x+(CARD-ww)/2,yy+5,ww,hh)}catch(e){ctx.font='44px system-ui';ctx.fillText(p.emoji||'✳',x+40,yy+63)}}
   else {ctx.font='43px system-ui';ctx.fillText(p.emoji||'✳',x+40,yy+63)}
   const short=t=>t.length>20?t.slice(0,19)+'…':t;
   ctx.fillStyle='#263d31';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText(short(p.name),x+CARD/2,yy+98);
   ctx.fillStyle='#69786a';ctx.font='11px system-ui';ctx.fillText(short(p.brand),x+CARD/2,yy+115);ctx.textAlign='left';
  });
  y+=rowH+8;
 }
 ctx.fillStyle='#68816b';ctx.font='19px system-ui';ctx.fillText('Taste is personal. Kindness is universal. ✳',55,H-34);
 ctx.textAlign='right';ctx.fillText('mikelninh.github.io/good-things',W-55,H-34);ctx.textAlign='left';
 try{
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw Error('PNG encoding unavailable');
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='good-things-tier-list.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
  toast('Your tier list PNG is ready ♡');
 }catch(e){toast('Could not save PNG: '+String(e.message||e).slice(0,100))}
}

function shareBoard(){
 const own=boardEntries().filter(r=>TIERS.includes(r.tier))
 .sort((a,b)=>TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||Number(a.position||0)-Number(b.position||0));
 if(!own.length)return toast('Rank a product first to share a board.');
 copyLink(snapshotUrl(own));
}
function renderSharedBoard(){
 const list=Array.isArray(st.shareData)?st.shareData:[];
 const rows=TIERS.map(t=>{
  const matches=list.filter(r=>r.tier===t).map(r=>getProduct(r.product_id)).filter(Boolean);
  return '<div class="tier-lane" data-drop-tier="'+t+'"><div class="lane-tag"><strong>'+t+'</strong></div><div class="tier-dropzone" style="min-height:105px">'+(matches.length?matches.map(p=>'<div class="board-piece" style="width:77px;flex:0 0 77px;cursor:default">'+boardPhoto(p)+'<strong>'+esc(p.name)+'</strong><small>'+esc(p.brand)+'</small></div>').join(''):'<span class="drop-hint">Nothing here yet</span>')+'</div></div>';
 }).join('');
 return head('A FRIEND’S GOOD THINGS','One lovely tier list.','This is a frozen snapshot of product scores; no private notes or email addresses are shared.',list.length+' RANKED')
 +'<div class="board-mat" style="max-width:980px"><div class="board-mat-head"><strong>Good Things Tier List</strong><small>Shared by a good human ♡</small></div>'+rows+'</div>'
 +'<p style="margin:22px 0"><button class="button button-lime" data-nav="board">Build your own tier list ↗</button></p>';
}
let boardDrag=null, suppressBoardClickUntil=0;
function boardDropTarget(x,y){
 const el=document.elementFromPoint?.(x,y);if(!el)return null;
 let zone=el.closest?.('.tier-dropzone,.board-tray');
 if(!zone){const lane=el.closest?.('.tier-lane');zone=lane?.querySelector('.tier-dropzone')}
 return zone||null;
}
function boardInsertionIndex(zone,x,y,id){
 if(!zone||zone.dataset.dropTier==='unranked')return 0;
 const others=Array.from(zone.querySelectorAll('.board-piece')).filter(el=>el.dataset.dragId!==id);
 const rows=[];
 others.forEach((el,index)=>{
  const b=el.getBoundingClientRect();let row=rows.find(r=>Math.abs(r.top-b.top)<14);
  if(!row){row={top:b.top,bottom:b.bottom,items:[]};rows.push(row)}
  row.bottom=Math.max(row.bottom,b.bottom);row.items.push({box:b,index});
 });
 for(const row of rows){
  if(y<=row.bottom+3){
   for(const item of row.items)if(x<item.box.left+item.box.width/2)return item.index;
   return row.items.at(-1).index+1;
  }
 }
 return others.length;
}
function cleanDragIndicator(){
 document.querySelectorAll('.board-placeholder').forEach(x=>x.remove());
 document.querySelectorAll('[data-drag-hover]').forEach(x=>x.removeAttribute('data-drag-hover'));
}
function cancelBoardDrag(){
 if(!boardDrag)return;
 boardDrag.ghost?.remove();
 boardDrag.source?.classList.remove('drag-active');
 cleanDragIndicator();boardDrag=null;
}
document.addEventListener('pointerdown',e=>{
 const el=e.target.closest?.('[data-drag-id]');
 if(!el||st.view!=='board'||e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0)||st.boardBusy)return;
 boardDrag={id:el.dataset.dragId,source:el,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,started:false,ghost:null,targetTier:null,targetIndex:0,dropZone:null};
},{passive:true});
document.addEventListener('pointermove',e=>{
 const d=boardDrag;
 if(!d||e.pointerId!==d.pointerId)return;
 if(!d.started&&Math.hypot(e.clientX-d.startX,e.clientY-d.startY)<7)return;
 if(!d.started){
  d.started=true;const rect=d.source.getBoundingClientRect();
  d.ghost=d.source.cloneNode(true);d.ghost.classList.add('drag-ghost');d.ghost.setAttribute('aria-hidden','true');
  d.ghost.style.width=rect.width+'px';d.ghost.style.height=rect.height+'px';
  d.source.classList.add('drag-active');
  d.offsetX=Math.min(rect.width,Math.max(10,d.startX-rect.left));
  d.offsetY=Math.min(rect.height,Math.max(10,d.startY-rect.top));
  document.body.appendChild(d.ghost);
  suppressBoardClickUntil=Date.now()+550;
 }
 e.preventDefault();
 d.ghost.style.left=(e.clientX-d.offsetX)+'px';d.ghost.style.top=(e.clientY-d.offsetY)+'px';
 cleanDragIndicator();
 const zone=boardDropTarget(e.clientX,e.clientY);
 d.dropZone=zone;d.targetTier=zone?.dataset.dropTier||null;
 if(!zone)return;
 zone.setAttribute('data-drag-hover','1');
 d.targetIndex=boardInsertionIndex(zone,e.clientX,e.clientY,d.id);
 if(d.targetTier==='unranked')return;
 const existing=Array.from(zone.querySelectorAll('.board-piece')).filter(x=>x.dataset.dragId!==d.id);
 const marker=document.createElement('div');
 marker.className='board-placeholder';marker.setAttribute('aria-hidden','true');
 const before=existing[d.targetIndex];
 if(before)zone.insertBefore(marker,before);else zone.appendChild(marker);
},{passive:false});
document.addEventListener('pointerup',async e=>{
 const d=boardDrag;if(!d||e.pointerId!==d.pointerId)return;
 const started=d.started,selected=d.targetTier,index=d.targetIndex,id=d.id;
 cancelBoardDrag();
 if(started){suppressBoardClickUntil=Date.now()+650;if(selected)await boardMove(id,selected,index);else toast('Drag onto a tier row to rank a product.')}
});
document.addEventListener('pointercancel',cancelBoardDrag);
document.addEventListener('click',e=>{
 if(Date.now()<suppressBoardClickUntil&&e.target.closest?.('[data-drag-id]')){e.preventDefault();e.stopImmediatePropagation()}
},true);
document.addEventListener('keydown',e=>{
 const piece=e.target.closest?.('[data-drag-id]');if(st.view!=='board'||!piece||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
 e.preventDefault();
 const id=piece.dataset.dragId,old=st.user?accountRating(id):st.guest[st.persona][id];
 const idx=old?TIERS.indexOf(old.tier):-1;
 if(e.key==='ArrowUp'||e.key==='ArrowDown'){
  const next=e.key==='ArrowUp'?(idx<0?'D':TIERS[Math.max(0,idx-1)]):(idx<0?'S':TIERS[Math.min(4,idx+1)]);
  boardMove(id,next,boardSorted(next,id).length);
 }else if(old){
  const peers=boardSorted(old.tier).map(x=>x.product_id);
  const target=Math.min(peers.length-1,Math.max(0,peers.indexOf(id)+(e.key==='ArrowLeft'?-1:1)));
  if(target!==peers.indexOf(id))boardMove(id,old.tier,target);
 }
});

function renderDiscover(){
 const a=filteredProducts();
 return head('GOOD THINGS / DISCOVER','Find your next <em>favourite.</em>','S–D tier lists built from ingredient-eligible candidates. Photo matches are sourced, and uncertain claims remain unverified.',a.length+' THINGS')
 +'<div class="inline-notice">✳ <strong>Care over certainty:</strong> '+RANKABLE.length+' rankable product candidates, not '+RANKABLE.length+' certified vegan products. Packaging and ingredients may change. <button class="navlink" style="display:inline;text-decoration:underline" data-action="view-exclusions">'+FLAGGED.length+' dairy-containing products excluded ↗</button></div>'
 +'<div class="inline-notice" style="background:#ecf4d5"><strong>New: Product Detective ✳</strong> Look up an exact barcode, inspect community nutrition and connect a real product photograph. <a href="./lookup.html">Open the detective ↗</a></div>'
 +'<div class="toolbar"><label class="search"><span aria-hidden="true">⌕</span><input type="search" id="productSearch" placeholder="Search brands, products and stores…" autocomplete="off" aria-label="Search products" value="'+attr(st.query)+'"></label>'
 +'<select id="storeSelect" class="control" aria-label="Select store">'+['all','REWE','Lidl','Online'].map(x=>'<option value="'+x+'" '+(st.store===x?'selected':'')+'>'+(x==='all'?'All stores':x)+'</option>').join('')+'</select>'
 +'<select id="sortSelect" class="control" aria-label="Sort products"><option value="name" '+(st.sort==='name'?'selected':'')+'>By name</option><option value="brand" '+(st.sort==='brand'?'selected':'')+'>By brand</option><option value="rated" '+(st.sort==='rated'?'selected':'')+'>My favourites first</option></select></div>'
 +'<div class="chips" aria-label="Categories"><button class="chip '+(st.category==='all'?'active':'')+'" data-action="set-category" data-id="all">✳ All '+RANKABLE.length+'</button>'+GROUPS.map(g=>'<button class="chip '+(st.category===g.id?'active':'')+'" data-action="set-category" data-id="'+attr(g.id)+'">'+esc(g.emoji)+' '+esc(g.label)+' <small>'+RANKABLE.filter(p=>p.category_id===g.id).length+'</small></button>').join('')+'</div>'
 +'<div class="spaced" style="margin-bottom:15px"><span class="filter-summary" id="resultCount">'+a.length+' products · '+selfRatings().length+' rated by you</span><label class="toggle"><input id="ratedOnly" type="checkbox" '+(st.ratedOnly?'checked':'')+'> Rated only</label></div>'
 +'<div id="productResults">'+(a.length?'<div class="product-grid">'+a.map(productCard).join('')+'</div>':empty('⌕','No matches','Try another brand, category or search term.'))+'</div>';
}
function ourPreview(){
 const curatorByRole={mikel:st.curators.find(c=>c.role==='mikel')?.user_id,huong:st.curators.find(c=>c.role==='huong')?.user_id};
 const ready=Boolean(curatorByRole.mikel&&curatorByRole.huong);
 const published=ready&&st.ourMode!=='demo';
 const toMap=who=>Object.fromEntries(st.allRatings.filter(r=>r.user_id===curatorByRole[who]&&r.is_public).map(r=>[r.product_id,r]));
 const a=published?toMap('mikel'):st.guest.mikel;
 const b=published?toMap('huong'):st.guest.huong;
 const ids=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(getProduct);
 return {a,b,ids,published,ready,curatorByRole,both:ids.filter(id=>a[id]&&b[id]),agree:ids.filter(id=>a[id]&&b[id]&&a[id].tier===b[id].tier)};
}
function tierMiniCards(who,ratings,published){
 const arr=Object.entries(ratings||{}).filter(([id])=>getProduct(id)).sort((x,y)=>TIER_SCORE[y[1].tier]-TIER_SCORE[x[1].tier]);
 return arr.length?arr.slice(0,8).map(([id,r])=>{
  const p=getProduct(id);return '<div class="review-row"><span style="font-size:26px">'+esc(p.emoji)+'</span><div style="flex:1"><h4>'+esc(p.brand+' '+p.name)+'</h4><p>'+esc(r.note||'No taste note yet.')+'</p></div>'+tierBadge(r.tier)+'</div>';
 }).join(''):published?empty('♡','No public opinions yet','Ratings stay off this public shelf until their real author chooses to share them.'):empty('♡','An empty preview shelf','Add a local practice rating to begin.','<button class="button button-lime button-small" data-action="open-random" data-persona="'+who+'">Rate something ↗</button>');
}
function renderOurs(){
 const m=ourPreview();
 let cmp='';
 if(m.both.length){
  cmp=m.both.slice(0,5).map(id=>{const p=getProduct(id);return '<div class="rating-item"><div class="product-tile">'+esc(p.emoji)+'</div><div><h4>'+esc(p.brand+' '+p.name)+'</h4><small>'+esc(p.category)+'</small></div><div class="gap12">'+tierBadge(m.a[id].tier)+'<span class="muted">vs</span>'+tierBadge(m.b[id].tier)+'</div></div>'}).join('');
 }
 const intro=m.published?'Real public opinions from two manually verified independent accounts. Private ratings are never displayed.':'A private co-rating playground for Mikel & Huong. Our public opinions will appear here once both verified creator accounts are linked.';
 const notice=m.published?'<div class="inline-notice">✓ <strong>Verified curators:</strong> these ratings come from the account owners. Public ratings only. <button class="navlink" data-action="toggle-our-mode" style="display:inline;text-decoration:underline">Open the private demo ↗</button></div>':
 '<div class="inline-notice">♧ <strong>Private preview:</strong> these two demo shelves are saved only in this browser, not official or public reviews. Signed-in people rate under their own account, never as Mikel or Huong. &nbsp; <button class="navlink" data-action="import-json" style="display:inline;text-decoration:underline">Import Release 1.0 JSON ↗</button>'+(m.ready?' &nbsp; <button class="navlink" data-action="toggle-our-mode" style="display:inline;text-decoration:underline">See verified public shelves ↗</button>':'')+'</div>';
 const curatorButton=who=>m.published?'<button class="button button-small button-ghost" data-action="view-user" data-id="'+attr(m.curatorByRole[who])+'">View ↗</button>':'<button class="button button-small button-ghost" data-action="open-random" data-persona="'+who+'">+ Rate</button>';
 return head('THE FIRST TWO SHELVES','Two people.<br><em>Many opinions.</em>',intro,'OUR LITTLE CORNER')
 +notice
 +'<div class="profile-banner"><div><div class="eyebrow">OUR SHARED EXPERIMENT</div><h3>Same planet. Different tastes.</h3><p class="small muted" style="max-width:480px">Taste your way through tofu, chocolate, plant milks and life’s more delicious disagreements.</p></div><div class="difference">♡</div></div>'
 +'<div class="stat-row"><div><strong>'+Object.keys(m.a).length+'</strong><span>Mikel’s '+(m.published?'public reviews':'preview picks')+'</span></div><div><strong>'+Object.keys(m.b).length+'</strong><span>Huong’s '+(m.published?'public reviews':'preview picks')+'</span></div><div><strong>'+m.agree.length+'/'+m.both.length+'</strong><span>Matching ratings</span></div></div>'
 +'<div class="cards-row"><div class="surface"><div class="spaced"><div class="person"><div class="avatar sky">M</div><div><strong>Mikel’s shelf</strong><small>'+(m.published?'Verified curator':'Local preview')+'</small></div></div>'+curatorButton('mikel')+'</div><hr class="rule">'+tierMiniCards('mikel',m.a,m.published)+'</div>'
 +'<div class="surface"><div class="spaced"><div class="person"><div class="avatar peach">H</div><div><strong>Huong’s shelf</strong><small>'+(m.published?'Verified curator':'Local preview')+'</small></div></div>'+curatorButton('huong')+'</div><hr class="rule">'+tierMiniCards('huong',m.b,m.published)+'</div></div>'
 +(cmp?'<div style="margin-top:22px">'+head('TASTE MATCH','The same products.',m.published?'A comparison of products both curators publicly reviewed.':'A comparison of products both rated in this private preview.','TOGETHER')+'<div class="rating-list">'+cmp+'</div></div>':'')
 +(!m.published?'<div style="margin-top:20px" class="callout"><h3>Got a wonderfully different opinion?</h3><p>Practise rating a product as Mikel, then as Huong in this browser. Only their identity-verified accounts can publish their opinions.</p><button class="button button-dark button-small" data-nav="discover">Explore things ↗</button></div>':'');
}
function yourInitials(){return st.profile?.display_name||st.user?.email?.split('@')[0]||'You'}
function ratingRows(arr,readOnly){
 return arr.sort((a,b)=>TIER_SCORE[b.tier]-TIER_SCORE[a.tier]).map(r=>{
 const p=getProduct(r.product_id);if(!p)return '';
 return '<div class="rating-item"><div class="product-tile">'+esc(p.emoji)+'</div><div><h4>'+esc(p.brand+' · '+p.name)+'</h4><small>'+esc(r.note||p.category)+' · '+(r.is_public===false?'Private':'Public')+'</small></div><div class="gap12">'+tierBadge(r.tier)+'<button class="button button-small button-ghost" data-action="open-product" data-id="'+attr(p.id)+'"'+'>'+(readOnly?'View':'Edit')+'</button></div></div>';
 }).join('');
}
function renderMy(){
 const arr=selfRatings();
 const completed=Math.min(arr.length,5);
 const welcome=st.user?'<div class="inline-notice">✓ Synced to your account. Public ratings appear in the community; private ratings are visible only to you.</div>':'<div class="inline-notice">♧ Guest shelf · Ratings below are stored only on this device. <button class="navlink" data-action="open-auth" style="display:inline;text-decoration:underline">Make an account</button> to keep a separate, synced shelf across devices.</div>';
 return head('GOOD THINGS / YOUR SHELF','Your taste.<br><em>Your rules.</em>','No one else decides what deserves an S. Start a shelf, give it character and share only what you choose.',arr.length+' REVIEWS')
 +welcome
 +'<div class="profile-banner"><div class="person"><div class="avatar '+(st.profile?.accent||'lime')+'" style="width:72px;height:72px;font-size:30px">'+esc(yourInitials().substring(0,1).toUpperCase())+'</div><div><div class="eyebrow">YOUR CORNER OF GOOD THINGS</div><h3>'+esc(yourInitials())+'</h3><p class="small muted" style="margin:3px 0">'+(st.profile?'@'+esc(st.profile.handle):'Create your own taste universe')+'</p></div></div><button class="button button-small button-white" data-action="'+(st.user?'edit-profile':'open-auth')+'">'+(st.user?'Edit profile ↗':'Join ↗')+'</button></div>'
 +'<div class="callout"><div class="spaced"><div><div class="eyebrow">FIRST FIVE CHALLENGE</div><h3>'+((completed===5)?'Five out of five! ✳':'Five little discoveries.')+'</h3><p>'+((completed===5)?'You did it. Your shelf is officially growing.':'Rate '+(5-completed)+' more product'+(5-completed===1?'':'s')+' to finish your first challenge.')+'</p></div><strong style="font:600 40px Fraunces,serif">'+completed+'/5</strong></div><div class="challenge-bar">'+[0,1,2,3,4].map(i=>'<span class="'+(i<completed?'filled':'')+'"></span>').join('')+'</div></div>'
 +'<div class="spaced" style="margin:20px 0 12px"><h3 style="font:600 30px Fraunces,serif;margin:0">What you have tasted</h3><div class="gap12"><button class="button button-small button-ghost" data-action="import-json">Import ↑</button><button class="button button-small button-ghost" data-action="export-json">Export JSON ↓</button><button class="button button-small button-lime" data-action="share-shelf">Share ↗</button></div></div>'
 +(arr.length?'<div class="rating-list">'+ratingRows(arr)+'</div>':empty('✳','Your shelf is a blank canvas','The next time a tofu knocks your socks off, come back and give it an S.','<button class="button button-lime" data-nav="discover">Find a first favourite ↗</button>'))
 +'<div class="surface" style="margin-top:18px"><div class="spaced"><div><h3>Make a collection</h3><p>Give your favourites a name and share a beautiful shortlist. Public collections are visible to anyone with the link.</p></div><button class="button button-dark button-small" data-action="create-list">+ New list</button></div>'
 +(st.user&&st.lists.filter(l=>l.user_id===st.user.id).length?st.lists.filter(l=>l.user_id===st.user.id).map(l=>'<div class="review-row"><div style="flex:1"><h4>'+esc(l.title)+'</h4><p>'+l.product_ids.length+' picks · '+(l.is_public?'Public':'Private')+'</p></div><button class="button button-small button-ghost" data-action="share-list" data-id="'+attr(l.id)+'">Open ↗</button></div>').join(''):'<p class="small muted">No collections yet. Your first one could be “The snack drawer of dreams”.</p>')+'</div>'
 +(!st.user&&Object.keys(st.guest.you).length?'<div class="small muted" style="margin-top:18px">Tip: after signing in, you can transfer your guest ratings to your account from Edit profile.</div>':'');
}
function scoreFor(userId){
 const mine=selfRatings();
 const theirs=st.allRatings.filter(r=>r.user_id===userId&&r.is_public);
 const common=mine.filter(r=>theirs.some(t=>t.product_id===r.product_id));
 if(!common.length)return {n:0,score:null};
 return {n:common.length,score:Math.round(100*common.reduce((sum,r)=>sum+(1-Math.abs(TIER_SCORE[r.tier]-TIER_SCORE[theirs.find(t=>t.product_id===r.product_id).tier])/4),0)/common.length)};
}
function publicRated(){return st.allRatings.filter(r=>r.is_public&&rankableProduct(getProduct(r.product_id)))}
function leaderboard(){
 const g={};
 for(const r of publicRated()){if(!g[r.product_id])g[r.product_id]={sum:0,n:0};g[r.product_id].sum+=TIER_SCORE[r.tier];g[r.product_id].n++}
 return Object.keys(g).map(id=>({id,n:g[id].n,score:g[id].sum/g[id].n})).sort((a,b)=>b.n>=2&&a.n<2?1:a.n>=2&&b.n<2?-1:b.score-a.score||b.n-a.n).slice(0,6);
}
function showUserCard(u){
 const score=st.user&&u.id!==st.user.id?scoreFor(u.id):null;
 const count=publicRated().filter(r=>r.user_id===u.id).length;
 const following=st.follows.some(f=>f.follower_id===st.user?.id&&f.following_id===u.id);
 return '<div class="user-card"><div class="spaced"><div class="person">'+avatar(u)+'<div><strong>'+esc(u.display_name)+'</strong><small>@'+esc(u.handle)+'</small></div></div><button class="button button-small button-ghost" data-action="view-user" data-id="'+attr(u.id)+'">↗</button></div><p>'+esc(u.bio||'Here for the good stuff.')+'</p><div class="spaced"><span class="small muted">'+count+' public reviews'+(score?.n?' · '+score.score+'% match ('+score.n+')':'')+'</span>'+(st.user&&st.user.id!==u.id?'<button class="button button-small '+(following?'button-ghost':'button-lime')+'" data-action="toggle-follow" data-id="'+attr(u.id)+'">'+(following?'Following ✓':'+ Follow')+'</button>':'')+'</div></div>';
}
function recentActivity(){
 const a=publicRated().sort((x,y)=>String(y.updated_at||'').localeCompare(String(x.updated_at||''))).slice(0,6);
 if(!a.length)return empty('✺','The first review is waiting','Join the shelf, rate something you genuinely tried, and start a small conversation.');
 return a.map(r=>{
 const p=getProduct(r.product_id),u=st.profiles.find(u=>u.id===r.user_id);if(!p||!u)return '';
 return '<div class="review-row">'+avatar(u)+'<div style="flex:1"><h4>'+esc(u.display_name)+' gave '+esc(p.brand+' '+p.name)+' a '+esc(r.tier)+'</h4><p>'+esc(r.note||'No tasting notes. Just a vote.')+'</p><button class="navlink" data-action="view-user" data-id="'+attr(u.id)+'">@'+esc(u.handle)+' ↗</button></div>'+tierBadge(r.tier)+'</div>';
 }).join('');
}
function renderCommunity(){
 const voters=new Set(publicRated().map(r=>r.user_id)).size;
 const rank=leaderboard();
 return head('GOOD THINGS / TOGETHER','The good company.','Find someone with your kind of taste. Follow a shelf, compare your picks and discover what deserves the hype.',st.profiles.length+' PEOPLE')
 +'<div class="callout"><div class="eyebrow">COMMUNITY · STARTING WITH HONEST OPINIONS</div><h3>Good taste is better shared.</h3><p>Ratings are independent, public only when their author chooses, and never sponsored. Popular scores are provisional until more people participate.</p><button class="button button-dark button-small" data-action="open-auth">Join the good company ↗</button></div>'
 +'<div class="stat-row"><div><strong>'+st.profiles.length+'</strong><span>Members</span></div><div><strong>'+publicRated().length+'</strong><span>Public reviews</span></div><div><strong>'+voters+'</strong><span>People rating</span></div></div>'
 +'<div class="spaced" style="margin:26px 0 14px"><h3 style="font:600 31px Fraunces,serif;margin:0">People to discover</h3><span class="small muted">Follow for future reviews</span></div>'
 +(st.profiles.length?'<div class="user-grid">'+st.profiles.filter(p=>p.id!==st.user?.id).slice(0,20).map(showUserCard).join('')+'</div>':empty('♡','You could be the first','The community is fresh. Make a profile and invite someone whose taste you trust.','<button class="button button-lime" data-action="open-auth">Create a shelf ↗</button>'))
 +'<div class="cards-row" style="margin-top:24px"><div class="surface"><h3>Most-loved things</h3><p>Live scores from public reviews, not a fabricated leaderboard.</p>'
 +(rank.length?rank.map(x=>{const p=getProduct(x.id);return '<div class="review-row"><span style="font-size:27px">'+esc(p.emoji)+'</span><div style="flex:1"><h4>'+esc(p.name)+'</h4><p>'+esc(p.brand)+' · '+x.n+' rating'+(x.n===1?'':'s')+'</p></div><strong>'+x.score.toFixed(1)+'/5</strong></div>'}).join(''):'<p>No public ratings yet. Be the first to try something.</p>')+'</div><div class="surface"><h3>Fresh from the shelves</h3>'+recentActivity()+'</div></div>';
}
function decodeSnapshot(raw){
 try{
  if(!raw||raw.length>9000)return null;
  const str=decodeURIComponent(Array.from(atob(raw.replace(/-/g,'+').replace(/_/g,'/')),c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join(''));
  const val=JSON.parse(str);
  if(val.v!==1||!Array.isArray(val.ratings))return null;
  return val.ratings.filter(x=>rankableProduct(getProduct(x[0]))&&TIERS.includes(x[1])).slice(0,RANKABLE.length).map(x=>({product_id:x[0],tier:x[1],note:'',is_public:true}));
 }catch(_){return null}
}
function snapshotUrl(ratings){
 const pack={v:1,ratings:ratings.filter(x=>getProduct(x.product_id)&&TIERS.includes(x.tier)).map(x=>[x.product_id,x.tier])};
 const bytes=new TextEncoder().encode(JSON.stringify(pack));
 let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 return URL_BASE+'?snapshot='+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function renderShared(){return renderSharedBoard()}
function renderProfileView(){
 const u=st.openedUser;if(!u)return empty('⌕','Profile not found','They may have renamed their handle or the profile is not available.');
 const arr=publicRated().filter(r=>r.user_id===u.id);
 const followers=st.follows.filter(f=>f.following_id===u.id).length;
 const match=st.user&&st.user.id!==u.id?scoreFor(u.id):null;
 return head('GOOD THINGS / PEOPLE','Someone good.','Every shelf is personal. Compare only publicly shared reviews.','@'+u.handle)
 +'<div class="profile-banner"><div class="person">'+avatar(u,true)+'<div><h3>'+esc(u.display_name)+'</h3><p>@'+esc(u.handle)+' · '+followers+' followers</p><p>'+esc(u.bio||'A shelf with a little heart.')+'</p></div></div>'+(st.user&&st.user.id!==u.id?'<button class="button button-lime button-small" data-action="toggle-follow" data-id="'+attr(u.id)+'">'+(st.follows.some(f=>f.follower_id===st.user.id&&f.following_id===u.id)?'Following ✓':'+ Follow')+'</button>':'')+'</div>'
 +(match?'<div class="callout"><h3>'+((match.n)?match.score+'% taste match':'Discover your taste match')+'</h3><p>'+((match.n)?'Based on '+match.n+' products you both rated. This is a playful similarity, not a scientific personality test.':'Rate some of the same products to compare your taste.')+'</p></div>':'')
 +(arr.length?'<div class="rating-list">'+ratingRows(arr,true)+'</div>':empty('♡','No public reviews yet','This person may be new or keeping their reviews private.'))+'<p><button class="button button-ghost" data-nav="community">← Community</button></p>';
}
function renderListView(){
 const l=st.shareList;if(!l)return empty('⌕','Collection not found','The list is private, removed or the link is incorrect.');
 const arr=l.product_ids.map(id=>getProduct(id)).filter(Boolean);
 const u=st.profiles.find(u=>u.id===l.user_id);
 return head('A GOOD THINGS COLLECTION',esc(l.title),l.description||'A hand-picked little list of good things.',arr.length+' PICKS')
 +'<p class="small muted">Curated by '+esc(u?.display_name||'a good human')+' · '+(l.is_public?'Public':'Your private preview')+'</p>'
 +'<div class="product-grid">'+arr.map(productCard).join('')+'</div><p><button class="button button-lime" data-nav="my">Make your own list ↗</button></p>';
}
function render(){
 const content=$('#contentView');
 if(st.view==='board')content.innerHTML=renderBoard();
 else if(st.view==='ours')content.innerHTML=renderOurs();
 else if(st.view==='my')content.innerHTML=renderMy();
 else if(st.view==='community')content.innerHTML=renderCommunity();
 else if(st.view==='shared')content.innerHTML=renderShared();
 else if(st.view==='profile')content.innerHTML=renderProfileView();
 else if(st.view==='list')content.innerHTML=renderListView();
 else content.innerHTML=renderDiscover();
 $$('[data-nav]').forEach(n=>n.classList.toggle('active',n.dataset.nav===st.view));
 const num=selfRatings().length;
 $('#myCount').textContent=String(num);
 $('#communityCount').textContent=String(st.profiles.length);
 $('#sidebarProgress').style.width=Math.min(num,5)*20+'%';
 $('#sidebarProgressText').textContent=Math.min(num,5)+' / 5 rated';
 $('#authStatus').innerHTML=st.user?'<span class="dot"></span> '+esc(st.profile?.handle?'@'+st.profile.handle:'Signed in'):st.cloud==='offline'?'<span class="dot" style="background:#deb075"></span> Demo mode':'<span class="dot"></span> Local tasting shelf';
 $('#authButton').textContent=st.user?'My account ↗':'Join the shelf ↗';
 $('#authButton').dataset.action=st.user?'edit-profile':'open-auth';
}
function refreshProducts(){
 const a=filteredProducts();
 if($('#productResults'))$('#productResults').innerHTML=a.length?'<div class="product-grid">'+a.map(productCard).join('')+'</div>':empty('⌕','No matches','Try another category or remove your filter.');
 if($('#resultCount'))$('#resultCount').textContent=a.length+' products · '+selfRatings().length+' rated by you';
}
function drawerHtml(){
 const p=getProduct(st.selected);if(!p)return '';
 const r=st.user?accountRating(p.id):guestRating(p.id,st.persona);
 const name=st.user?'Your account':st.persona.charAt(0).toUpperCase()+st.persona.slice(1)+' (on this device)';
 return '<button class="close" aria-label="Close product" data-action="close-drawer">×</button>'
 +'<div class="eyebrow">THE TASTING TABLE / '+esc(p.category)+'</div><h2>'+esc(p.name)+'</h2><p class="muted">'+esc(p.brand)+' · '+esc(p.store)+'</p>'
 +'<div class="drawer-art tone-'+esc(p.tone)+'">'+(matchedPhoto(p)?'<img src="'+attr(validUrl(p.image_url))+'" alt="Product packaging from '+attr(p.photo_attribution||'the manufacturer')+'" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="board-emoji" hidden>'+esc(p.emoji)+'</span>':st.imageCache[p.id]?.url?'<img src="'+attr(validUrl(st.imageCache[p.id].url))+'" alt="Unverified community photograph" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="board-emoji" hidden>'+esc(p.emoji)+'</span>':esc(p.emoji))+'</div>'
 +'<div class="inline-notice">'+(matchedPhoto(p)?'✓ Packshot linked to a specific '+(p.image_status==='brand'?'manufacturer':p.image_status==='barcode'?'barcode-matched community':'retailer')+' product record. Packaging and ingredients can change; please check the actual packet.': 'ⓘ No confirmed front-pack photo yet. Variant and vegan status need checking before purchase.')+'</div>'
 +(!st.user?'<div class="field"><label>Who is rating? <span class="hint">(local demo only)</span></label><div class="segment">'+['you','mikel','huong'].map(w=>'<button data-action="set-persona" data-value="'+w+'" class="'+(st.persona===w?'active':'')+'">'+w.charAt(0).toUpperCase()+w.slice(1)+'</button>').join('')+'</div></div>':'<div class="small muted">Rating as '+esc(name)+'</div>')
 +'<div class="field"><label>What does '+esc(name)+' think?</label><div class="tier-picker" id="tierPicker">'+TIERS.map(t=>'<button class="tier '+(st.draftTier===t?'active':'')+'" data-tier="'+t+'" style="--tiercolor:'+({S:'#dcec8d',A:'#c6e6b4',B:'#c9e9f8',C:'#ffdfb0',D:'#f4bcbc'}[t])+'" data-action="select-tier" data-value="'+t+'">'+t+'</button>').join('')+'</div><span class="hint">S = love it · A = great · B = good · C = okay · D = not for me</span></div>'
 +'<div class="field"><label for="ratingNote">Your 200-character tasting note</label><textarea class="control" id="ratingNote" rows="3" maxlength="200" placeholder="Creamy, smoky, truly magical…">'+esc(st.draftNote)+'</textarea></div>'
 +(st.user?'<label class="toggle" style="margin-bottom:19px"><input type="checkbox" id="ratingPublic" '+(st.draftPublic?'checked':'')+'> Share this rating publicly with the community</label>':'<p class="small muted">Guest ratings stay in this browser; they are not community reviews.</p>')
 +'<div class="gap12"><button class="button button-lime" data-action="save-rating" data-id="'+attr(p.id)+'">Save my rating ♡</button>'+(r?'<button class="button button-ghost button-small" data-action="delete-rating">Remove rating</button>':'')+'</div>'
 +'<hr class="rule"><h3>See the real product</h3><p class="small muted">Catalog variants are candidates. Compare store listings and packaging before treating an item as verified.</p><div class="gap12">'
 +'<a class="button button-ghost button-small" href="'+attr(validUrl(p.source_url))+'" target="_blank" rel="noopener noreferrer">Check '+esc(p.store)+' ↗</a>'
 +'<a class="button button-lime button-small" href="./lookup.html?catalog='+encodeURIComponent(p.id)+'">Check exact barcode ↗</a>'
 +(!matchedPhoto(p)?'<button class="button button-white button-small" data-action="lookup-image">Find possible photo ⌕</button>':'<a class="button button-white button-small" target="_blank" rel="noopener noreferrer" href="'+attr(validUrl(p.image_source_url||p.source_url))+'">Photo source ↗</a>')+'</div><p class="small muted" id="photoHint">Images are only shown when a plausible Open Food Facts match can be found, and remain labelled unverified until checked.</p>';
}
function openProduct(id,tier,persona){
 if(!rankableProduct(getProduct(id)))return toast('This product contains animal ingredients under its current recipe and is excluded from the vegan tier list.');
 st.selected=id;if(persona)st.persona=persona;
 const r=st.user?accountRating(id):guestRating(id,st.persona);
 st.draftTier=tier||r?.tier||'';st.draftNote=r?.note||'';st.draftPublic=r?.is_public===true;
 $('#drawer').innerHTML=drawerHtml();openOverlay('drawerOverlay');
}
function changePersona(who){
 if(!['you','mikel','huong'].includes(who))return;
 st.persona=who;const r=guestRating(st.selected,who);
 st.draftTier=r?.tier||'';st.draftNote=r?.note||'';st.draftPublic=r?.is_public===true;
 $('#drawer').innerHTML=drawerHtml();
}
async function saveRating(){
 if(!st.selected||!st.draftTier)return toast('Choose a tier, then save your taste.');
 const note=st.draftNote.slice(0,200);
 const product_id=st.selected;
 if(st.user){
  if(!sb)return toast('Cloud unavailable. Your rating has not been saved.');
  const prior=accountRating(product_id);const obj={user_id:st.user.id,product_id,tier:st.draftTier,note,is_public:st.draftPublic,position:prior?.tier===st.draftTier?(Number(prior.position)||0):boardNextPosition(st.draftTier,product_id),updated_at:new Date().toISOString()};
  const {error}=await sb.from('gt_ratings').upsert(obj,{onConflict:'user_id,product_id'});
  if(error)return toast('Could not save: '+error.message);
  st.allRatings=st.allRatings.filter(r=>!(r.user_id===st.user.id&&r.product_id===product_id));st.allRatings.push(obj);
 }else{
  const prior=st.guest[st.persona][product_id];st.guest[st.persona][product_id]={tier:st.draftTier,note,is_public:st.draftPublic,position:prior?.tier===st.draftTier?(Number(prior.position)||0):boardNextPosition(st.draftTier,product_id)};persist();
 }
 closeOverlay('drawerOverlay');render();toast('Saved. One more good thing on the shelf ♡');
}
async function deleteRating(){
 if(!st.selected)return;
 if(st.user){
  const {error}=await sb.from('gt_ratings').delete().eq('user_id',st.user.id).eq('product_id',st.selected);
  if(error)return toast('Could not remove rating: '+error.message);
  st.allRatings=st.allRatings.filter(r=>!(r.user_id===st.user.id&&r.product_id===st.selected));
 }else{delete st.guest[st.persona][st.selected];persist()}
 closeOverlay('drawerOverlay');render();toast('Rating removed.');
}
async function photoLookup(){
 const p=getProduct(st.selected);
 const hint=$('#photoHint');if(!p||!hint)return;
 hint.textContent='Looking for a precise community match…';
 try{
  const q=encodeURIComponent(p.brand+' '+p.name);
  const u='https://world.openfoodfacts.org/cgi/search.pl?search_terms='+q+'&search_simple=1&action=process&json=1&page_size=12&fields=code,product_name,brands,image_front_url';
  const resp=await fetch(u,{headers:{Accept:'application/json'}});
  if(!resp.ok)throw Error('Service temporarily unavailable');
  const d=await resp.json();const words=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g,' ').split(' ').filter(x=>x.length>2);
  const queryWords=words(p.name);
  const matches=(d.products||[]).filter(x=>{
    const u=validUrl(x.image_front_url||'');
    const bn=String(x.brands||'').toLowerCase();
    const names=words(x.product_name);
    return u.startsWith('https://')&&bn.includes(p.brand.toLowerCase())&&queryWords.length&&queryWords.filter(w=>names.includes(w)).length>=Math.ceil(queryWords.length*.65);
  });
  if(!matches.length){hint.textContent='No sufficiently close community photo found. The illustration remains until a barcode-confirmed packshot is available.';return}
  const photo=validUrl(matches[0].image_front_url);
  st.imageCache[p.id]={url:photo,kind:'off',barcode:String(matches[0].code||'')};
  persistImages();$('#drawer').innerHTML=drawerHtml();
  $('#photoHint').textContent='Photo candidate from Open Food Facts, barcode '+(matches[0].code||'unknown')+'. Compare the label before trusting this match.';
  toast('Community photo candidate found — not independently verified.');
 }catch(e){hint.textContent='Photo search unavailable right now. You can still rate without a photo.'}
}
function modal(content){
 $('#modal').innerHTML=content;openOverlay('modalOverlay');
}
function authHtml(mode){
 return '<button class="close" aria-label="Close" data-action="close-modal">×</button><div class="eyebrow">WELCOME TO THE NEIGHBOURHOOD</div><h2>'+((mode==='signup')?'Your own little shelf.':'Good to see you.')+'</h2><p class="small muted">Each person has one account and independent ratings. Your public reviews can be discovered; private ones stay yours.</p>'
 +'<div class="segment"><button data-action="auth-mode" data-value="login" class="'+(mode==='login'?'active':'')+'">Sign in</button><button data-action="auth-mode" data-value="signup" class="'+(mode==='signup'?'active':'')+'">Create account</button></div>'
 +'<form id="authForm"><input type="hidden" name="mode" value="'+mode+'"><div class="field"><label for="authEmail">Email</label><input class="control" id="authEmail" name="email" type="email" autocomplete="email" required placeholder="hello@example.com"></div>'
 +'<div class="field"><label for="authPassword">Password</label><input class="control" id="authPassword" name="password" type="password" autocomplete="'+(mode==='signup'?'new-password':'current-password')+'" minlength="8" required placeholder="At least 8 characters"></div>'
 +'<button class="button button-lime" type="submit" style="width:100%">'+(mode==='signup'?'Make my shelf ✳':'Sign in ↗')+'</button></form>'
 +'<p class="small muted">Email confirmation may be required. Do not share your password. Your information is handled by the account service, not stored in this browser’s demo ratings.</p>'
 +'<hr class="rule"><button class="button button-ghost button-small" data-action="close-modal">Just browse for now</button>';
}
function openAuth(mode){if(st.user)return openProfileEdit();if(!sb)return modal('<button class="close" data-action="close-modal">×</button><h2>Demo shelf is ready</h2><p>Live accounts could not connect. You can still explore 102 products and use the local tasting shelf.</p><button class="button button-lime" data-action="close-modal">Continue exploring</button>');modal(authHtml(mode||'signup'))}
async function submitAuth(form){
 if(!sb)return toast('Account service unavailable. Try the local demo.');
 const email=form.elements.namedItem('email').value.trim(),password=form.elements.namedItem('password').value,mode=form.elements.namedItem('mode').value;
 const button=form.querySelector('button[type=submit]');button.disabled=true;button.textContent='Connecting…';
 try{
  let r;
  if(mode==='signup')r=await sb.auth.signUp({email,password,options:{emailRedirectTo:URL_BASE}});
  else r=await sb.auth.signInWithPassword({email,password});
  if(r.error)throw r.error;
  if(r.data?.session?.user){
   st.user=r.data.session.user;closeOverlay('modalOverlay');await loadRemote();if(!st.profile)openProfileEdit();
   toast('Welcome to the shelf ♡');
  }else{
   modal('<button class="close" data-action="close-modal">×</button><div class="eyebrow">JUST ONE MORE STEP</div><h2>Check your email ✉</h2><p>We sent a confirmation link if email verification is enabled. The project may need its allowed redirect URL updated before confirmation links land on this page.</p><button class="button button-lime" data-action="close-modal">Got it</button>');
  }
 }catch(e){toast('Sign in: '+String(e.message||e).slice(0,110));button.disabled=false;button.textContent=mode==='signup'?'Make my shelf ✳':'Sign in ↗'}
}
function openProfileEdit(){
 if(!st.user)return openAuth();
 const p=st.profile,defaultHandle=st.user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24)||'goodhuman';
 modal('<button class="close" data-action="close-modal">×</button><div class="eyebrow">YOUR SIGNATURE</div><h2>Make it yours.</h2><p class="small muted">A public name and handle help friends discover your shelf. Your email stays private. The reserved handles mikel and huong are protected for our creators.</p>'
 +'<form id="profileForm"><div class="field"><label>Public display name</label><input class="control" name="name" maxlength="42" required value="'+attr(p?.display_name||'')+'" placeholder="How shall we call you?"></div>'
 +'<div class="field"><label>Username · 3–24 letters, numbers, _ or -</label><input class="control" name="handle" maxlength="24" minlength="3" pattern="[a-z0-9][a-z0-9_-]{2,23}" required value="'+attr(p?.handle||defaultHandle)+'"></div>'
 +'<div class="field"><label>A little about you (optional)</label><textarea class="control" name="bio" maxlength="240" rows="3">'+esc(p?.bio||'')+'</textarea></div>'
 +'<div class="field"><label>Your accent</label><select class="control" name="accent">'+['lime','peach','sky','lilac'].map(c=>'<option '+(p?.accent===c?'selected':'')+' value="'+c+'">'+c+'</option>').join('')+'</select></div>'
 +'<button type="submit" class="button button-lime">Save profile ♡</button></form>'
 +(Object.keys(st.guest.you).length?'<hr class="rule"><p class="small muted">You have '+Object.keys(st.guest.you).length+' guest ratings on this device. Transfer them to your account after saving your profile.</p><button class="button button-ghost button-small" data-action="import-guest">Import my guest ratings ↗</button>':'')
 +'<hr class="rule"><button class="button button-ghost button-small" data-action="logout">Sign out</button>');
}
async function saveProfile(form){
 if(!st.user)return;
 const handle=form.elements.namedItem('handle').value.trim().toLowerCase(),display_name=form.elements.namedItem('name').value.trim(),bio=form.elements.namedItem('bio').value.trim(),accent=form.elements.namedItem('accent').value;
 if(!/^[a-z0-9][a-z0-9_-]{2,23}$/.test(handle)||!display_name)return toast('Check your display name and username.');
 const {data,error}=await sb.from('gt_profiles').upsert({id:st.user.id,handle,display_name,bio,accent},{onConflict:'id'}).select().single();
 if(error)return toast('Profile: '+error.message.slice(0,120));
 st.profile=data;st.profiles=st.profiles.filter(p=>p.id!==data.id).concat(data);
 closeOverlay('modalOverlay');render();toast('Your shelf now has a name. Lovely!');
}
async function importGuest(){
 if(!st.user)return openAuth();
 const entries=Object.entries(st.guest.you).filter(([id,r])=>getProduct(id)&&TIERS.includes(r.tier));
 if(!entries.length)return toast('No guest ratings to import.');
 const rows=entries.map(([product_id,r])=>({user_id:st.user.id,product_id,tier:r.tier,note:r.note||'',is_public:r.is_public!==false}));
 const {error}=await sb.from('gt_ratings').upsert(rows,{onConflict:'user_id,product_id'});
 if(error)return toast('Import failed: '+error.message);
 st.guest.you={};persist();await loadRemote();closeAll();toast(rows.length+' guest ratings moved into your account ♡');
}
function openListModal(){
 if(!st.user)return openAuth();
 if(!st.profile)return openProfileEdit();
 if(!selfRatings().length)return toast('Rate a product before making a list.');
 modal('<button class="close" data-action="close-modal">×</button><div class="eyebrow">MAKE A LITTLE COLLECTION</div><h2>Give it a name.</h2><p class="small muted">A public link can be shared with friends. Your list will include your first 40 rated products (products only; private tasting notes are never copied).</p>'
 +'<form id="listForm"><div class="field"><label>Collection name</label><input class="control" name="title" placeholder="The snack drawer of dreams" maxlength="70" minlength="2" required></div>'
 +'<div class="field"><label>Short introduction</label><textarea class="control" name="description" maxlength="240" rows="3" placeholder="A few discoveries worth making space for."></textarea></div>'
 +'<label class="toggle"><input type="checkbox" name="is_public" checked> Public to people with the link</label><div style="margin-top:20px"><button class="button button-lime" type="submit">Create collection ↗</button></div></form>');
}
function slug(s){return String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,47)||'good-picks'}
async function saveList(form){
 if(!st.user)return;
 const title=form.elements.namedItem('title').value.trim(),description=form.elements.namedItem('description').value.trim(),product_ids=selfRatings().slice(0,40).map(r=>r.product_id);
 const obj={user_id:st.user.id,title,description,slug:slug(title)+'-'+Math.random().toString(36).slice(2,6),product_ids,is_public:form.elements.namedItem('is_public').checked};
 const {data,error}=await sb.from('gt_lists').insert(obj).select().single();
 if(error)return toast('Collection: '+error.message);
 st.lists.unshift(data);closeAll();render();toast('Collection created ♡');await copyLink(URL_BASE+'?list='+data.id);
}
function copyLink(str){
 if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(str).then(()=>toast('Link copied — share the good ♡')).catch(()=>showLink(str));
 showLink(str);return Promise.resolve();
}
function showLink(link){
 modal('<button class="close" data-action="close-modal">×</button><div class="eyebrow">A LITTLE GOOD GOES A LONG WAY</div><h2>Your share link.</h2><p class="small muted">Copy the link below. It contains public shelf data or a frozen snapshot of your ratings, never emails or private notes.</p><div class="field"><input class="control" value="'+attr(link)+'" readonly id="manualShare"></div><button class="button button-lime" data-action="select-link">Select link</button>');
}
function shareShelf(){
 if(st.user&&st.profile)return copyLink(URL_BASE+'?u='+encodeURIComponent(st.profile.handle));
 const own=selfRatings().filter(r=>rankableProduct(getProduct(r.product_id)));
 if(!own.length)return toast('Rate something first to share a shelf.');
 copyLink(snapshotUrl(own));
}

function canonical(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'')}
function importTier(value){
 const v=typeof value==='object'&&value?value.tier||value.rating||value.value:value;
 const tier=String(v||'').trim().toUpperCase();return TIERS.includes(tier)?tier:null;
}
async function importJson(file){
 if(!file||file.size>2000000)return toast('Use a JSON file smaller than 2 MB.');
 let data;try{data=JSON.parse(await file.text())}catch(_){return toast('This is not valid JSON. Nothing was imported.')}
 const rows=Array.isArray(data)?data:Array.isArray(data?.products)?data.products:Array.isArray(data?.ratings)?data.ratings:[];
 if(!rows.length)return toast('No product or rating rows found in this JSON file.');
 let touched=0,rowsFound=0;
 for(const x of rows){
  if(!x||typeof x!=='object')continue;
  const product=ALL.find(p=>p.id===(x.product_id||x.id))||ALL.find(p=>canonical(p.name)===canonical(x.name||x.product_name)&&canonical(p.brand)===canonical(x.brand));
  if(!product)continue;rowsFound++;
  const ratings=[
   ['mikel',x.ratings?.mikel??x.mikel??x.mikel_rating??x.ratingMikel],
   ['huong',x.ratings?.huong??x.huong??x.huong_rating??x.ratingHuong],
   ['you',x.tier??x.rating??x.my_rating]
  ];
  for(const [who,v] of ratings){
   const tier=importTier(v);if(!tier)continue;
   const note=typeof v==='object'&&v?String(v.note||'').slice(0,200):'';
   st.guest[who][product.id]={tier,note,is_public:true};touched++;
  }
 }
 if(!touched)return toast('Matched '+rowsFound+' products, but no S–D ratings. Your current shelf is unchanged.');
 persist();render();toast('Imported '+touched+' ratings from '+rowsFound+' matching products. Check the results before sharing.');
}

function exportJson(){
 const content={title:'GOOD THINGS',version:'1.3',exported_at:new Date().toISOString(),ratings:selfRatings().map(r=>({product_id:r.product_id,tier:r.tier,note:r.note,is_public:r.is_public,position:r.position||0}))};
 const blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='good-things-my-shelf.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
 toast('JSON export ready. Your data stays yours.');
}
function feedbackModal(){
 modal('<button class="close" data-action="close-modal">×</button><div class="eyebrow">HELP US MAKE IT BETTER</div><h2>How did it feel?</h2><p class="small muted">'+(st.user?'One private feedback entry per day. Your feedback is not posted publicly.':'To submit feedback to us, sign in first. You can still explore freely without an account.')+'</p><form id="feedbackForm">'
 +'<div class="field"><label>Your experience (1–5)</label><select class="control" name="score">'+[5,4,3,2,1].map(n=>'<option value="'+n+'">'+n+' / 5 '+(n===5?'— Lovely!':n===1?'— Needs love':'')+'</option>').join('')+'</select></div>'
 +'<div class="field"><label>What should be better?</label><textarea class="control" name="message" maxlength="1000" minlength="5" required rows="4" placeholder="What worked, what felt clunky, and what would make you return?"></textarea></div><button class="button button-lime" type="submit" '+(st.user?'':'disabled')+'>Send feedback ♡</button></form>'
 +(!st.user?'<p><button class="button button-dark button-small" data-action="open-auth">Sign in to give feedback ↗</button></p>':''));
}
async function submitFeedback(form){
 if(!st.user)return openAuth();
 const score=Number(form.elements.namedItem('score').value),message=form.elements.namedItem('message').value.trim();
 if(message.length<5||!Number.isInteger(score)||score<1||score>5)return toast('Write a little more about your experience.');
 const {error}=await sb.from('gt_feedback').insert({user_id:st.user.id,score,message});
 if(error)return toast(error.code==='23505'?'Thanks! You have already shared feedback today.':'Feedback: '+error.message);
 closeAll();toast('Thank you! Your feedback was recorded privately ♡');
}
async function toggleFollow(id){
 if(!st.user)return openAuth();
 if(st.user.id===id)return toast('You already know your own taste.');
 const existing=st.follows.some(f=>f.follower_id===st.user.id&&f.following_id===id);
 let r=existing?await sb.from('gt_follows').delete().eq('follower_id',st.user.id).eq('following_id',id):await sb.from('gt_follows').insert({follower_id:st.user.id,following_id:id});
 if(r.error)return toast('Could not update follow: '+r.error.message);
 st.follows=st.follows.filter(f=>!(f.follower_id===st.user.id&&f.following_id===id));
 if(!existing)st.follows.push({follower_id:st.user.id,following_id:id});
 render();toast(existing?'Unfollowed.':"Following — good company!");
}
async function loadRemote(){
 if(!sb)return;
 const [pr,ra,fo,li,cu]=await Promise.all([
  sb.from('gt_profiles').select('id,handle,display_name,bio,accent,created_at').limit(400),
  sb.from('gt_ratings').select('user_id,product_id,tier,note,is_public,position,updated_at').order('updated_at',{ascending:false}).limit(3000),
  sb.from('gt_follows').select('follower_id,following_id,created_at').limit(3000),
  sb.from('gt_lists').select('id,user_id,title,slug,description,product_ids,is_public,created_at').limit(500),
  sb.from('gt_curators').select('role,user_id,verified_at').limit(2)
 ]);
 if(!pr.error){st.profiles=pr.data||[];st.profile=st.profiles.find(p=>p.id===st.user?.id)||null}
 if(!ra.error)st.allRatings=ra.data||[];
 if(!fo.error)st.follows=fo.data||[];
 if(!li.error)st.lists=li.data||[];
 if(!cu.error)st.curators=cu.data||[];
 const errors=[pr,ra,fo,li,cu].filter(r=>r.error).map(r=>r.error.message);
 st.cloud=errors.length?'offline':'online';
 if(errors.length)toast('Community is temporarily unavailable: '+errors[0].slice(0,65));
 render();
}
async function initCloud(){
 if(!window.supabase?.createClient){st.cloud='offline';render();return}
 try{
  sb=window.supabase.createClient(SUPA_URL,SUPA_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},realtime:{params:{eventsPerSecond:2}}});
  const {data,error}=await sb.auth.getUser();if(!error&&data?.user)st.user=data.user;
  sb.auth.onAuthStateChange((event,session)=>{
   const id=session?.user?.id||null;
   if(id!==st.user?.id){st.user=session?.user||null;if(!st.user)st.profile=null;setTimeout(()=>loadRemote(),0)}
  });
  await loadRemote();
  if(st.user&&!st.profile)openProfileEdit();
 }catch(e){st.cloud='offline';render();toast('Cloud login unavailable, guest shelf still works.')}
}
async function openPublicUser(id){
 const u=st.profiles.find(p=>p.id===id);if(!u)return toast('Profile not found');
 st.openedUser=u;setView('profile');
}
async function openShareLink(){
 const url=new URL(location.href);
 if(url.searchParams.has('snapshot')){
  st.shareData=decodeSnapshot(url.searchParams.get('snapshot'));st.view='shared';return;
 }
 if(url.searchParams.has('u')){
  const handle=url.searchParams.get('u');
  if(!st.profiles.length&&sb)await loadRemote();
  st.openedUser=st.profiles.find(p=>p.handle===handle)||null;st.view='profile';return;
 }
 if(url.searchParams.has('list')){
  const id=url.searchParams.get('list');
  st.shareList=st.lists.find(l=>l.id===id)||null;
  if(!st.shareList&&sb){
   const {data}=await sb.from('gt_lists').select('id,user_id,title,description,product_ids,is_public').eq('id',id).maybeSingle();
   st.shareList=data||null;
  }st.view='list';return;
 }
 const view=url.searchParams.get('view');
 st.view=['board','discover','ours','my','community'].includes(view)?view:'board';
}
document.addEventListener('click',async(event)=>{
 const nav=event.target.closest('[data-nav]');
 if(nav){event.preventDefault();closeAll();setView(nav.dataset.nav);return}
 const btn=event.target.closest('[data-action]');
 if(!btn)return;
 event.preventDefault();
 const a=btn.dataset.action,id=btn.dataset.id,val=btn.dataset.value;
 try{
 switch(a){
 case 'open-product':openProduct(id);break;
 case 'rate-product':openProduct(id,val);break;
 case 'select-tier':
   st.draftTier=val;
   $$('#tierPicker .tier').forEach(t=>t.classList.toggle('active',t.dataset.value===val));break;
 case 'set-persona':changePersona(val);break;
 case 'close-drawer':closeOverlay('drawerOverlay');break;
 case 'close-modal':closeOverlay('modalOverlay');break;
 case 'save-rating':await saveRating();break;
 case 'delete-rating':await deleteRating();break;
 case 'set-category':st.category=id;render();break;
 case 'board-persona':if(!st.user&&['you','mikel','huong'].includes(val)){st.persona=val;render()}break;
 case 'share-board':shareBoard();break;
 case 'view-exclusions':viewExclusions();break;
 case 'board-unrank':await boardMove(id,'unranked',0);break;
 case 'lookup-image':await photoLookup();break;
 case 'open-random':{
  const p=RANKABLE[Math.floor(Math.random()*RANKABLE.length)];
  openProduct(p.id,'',btn.dataset.persona||'you');break;
 }
 case 'open-auth':openAuth();break;
 case 'auth-mode':modal(authHtml(val));break;
 case 'edit-profile':openProfileEdit();break;
 case 'logout':if(sb){await sb.auth.signOut();st.user=null;st.profile=null;st.allRatings=[];closeAll();await loadRemote();render();toast('Signed out. See you again ♡')}break;
 case 'import-guest':await importGuest();break;
 case 'create-list':openListModal();break;
 case 'share-list':{
  const l=st.lists.find(x=>x.id===id);
  if(l)await copyLink(URL_BASE+'?list='+l.id);break;
 }
 case 'share-shelf':shareShelf();break;
 case 'export-json':exportJson();break;
 case 'import-json':{let file=$('#importJsonFile');if(!file){file=document.createElement('input');file.type='file';file.id='importJsonFile';file.accept='application/json,.json';file.style.display='none';document.body.appendChild(file)}file.value='';file.click();break}
 case 'open-feedback':feedbackModal();break;
 case 'toggle-follow':await toggleFollow(id);break;
 case 'view-user':await openPublicUser(id);break;
 case 'toggle-our-mode':st.ourMode=st.ourMode==='demo'?'published':'demo';render();break;
 case 'select-link':$('#manualShare')?.select();break;
 }
 }catch(err){toast('That did not work: '+String(err.message||err).slice(0,120))}
});
document.addEventListener('input',e=>{
 if(e.target.id==='productSearch'){st.query=e.target.value;refreshProducts()}
 if(e.target.id==='boardSearch'){st.boardQuery=e.target.value;refreshBoardTray()}
 if(e.target.id==='ratingNote')st.draftNote=e.target.value.slice(0,200);
});
document.addEventListener('change',e=>{
 if(e.target.id==='importJsonFile'){importJson(e.target.files?.[0]);return}
 if(e.target.id==='storeSelect'){st.store=e.target.value;refreshProducts()}
 if(e.target.id==='sortSelect'){st.sort=e.target.value;refreshProducts()}
 if(e.target.id==='boardCategory'){st.boardCategory=e.target.value;refreshBoardTray()}
 if(e.target.id==='ratedOnly'){st.ratedOnly=e.target.checked;refreshProducts()}
 if(e.target.id==='ratingPublic')st.draftPublic=e.target.checked;
});
document.addEventListener('submit',async e=>{
 if(!['authForm','profileForm','listForm','feedbackForm'].includes(e.target.id))return;
 e.preventDefault();
 try{
 if(e.target.id==='authForm')await submitAuth(e.target);
 if(e.target.id==='profileForm')await saveProfile(e.target);
 if(e.target.id==='listForm')await saveList(e.target);
 if(e.target.id==='feedbackForm')await submitFeedback(e.target);
 }catch(err){toast('Error: '+String(err.message||err))}
});
$$('.overlay').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)closeOverlay(el.id)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){cancelBoardDrag();closeAll()}});
window.addEventListener('focus',()=>{if(st.user&&sb)loadRemote()});
window.addEventListener('popstate',()=>{openShareLink().then(render)});
(async()=>{
 if(RANKABLE.length!==102||GROUPS.length!==10)toast('Catalog is incomplete; please report this.');
 await openShareLink();render();await initCloud();await openShareLink();render();
 const requested=new URL(location.href).searchParams.get('product');if(requested&&getProduct(requested))openProduct(requested);
})();
})();