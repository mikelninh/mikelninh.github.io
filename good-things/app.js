/* GOOD THINGS 1.3 · Account-backed vegan shelves with an honest offline demo.
   Client code intentionally uses text-escaped HTML; only public publishable API credentials here. */
(function(){
'use strict';
const ALL=Array.isArray(window.GT_CATALOG)?window.GT_CATALOG:[];
const GROUPS=Array.isArray(window.GT_GROUPS)?window.GT_GROUPS:[];
const URL_BASE=location.origin+location.pathname;
const TIERS=['S','A','B','C','D','F'];
const TIER_SCORE={S:6,A:5,B:4,C:3,D:2,F:1};
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
const ORIGINAL_RANKABLE=RANKABLE.filter(p=>p.source_type!=='openfoodfacts');
const STORE_NAMES={DM:'dm',ROSSMANN:'Rossmann',REWE:'REWE',LIDL:'Lidl',KAUFLAND:'Kaufland',EDEKA:'EDEKA',ALNATURA:'Alnatura',ONLINE:'Online'};
const STORE_URLS={DM:'https://www.dm.de/',ROSSMANN:'https://www.rossmann.de/',REWE:'https://www.rewe.de/',LIDL:'https://www.lidl.de/',KAUFLAND:'https://www.kaufland.de/',EDEKA:'https://www.edeka.de/',ALNATURA:'https://www.alnatura.de/'};
const proteinNumber=p=>Number.isFinite(p?.nutrition?.protein)?Number(p.nutrition.protein):null;
const FLAGGED=ALL.filter(p=>!rankableProduct(p));
const tryRead=(key,fallback)=>{try{const d=JSON.parse(localStorage.getItem(key)||'null');return d&&typeof d==='object'?d:fallback}catch(_){return fallback}};
const st={view:'board',boardQuery:'',boardCategory:'all',boardPhotoFilter:'matched',boardHistory:[],boardBusy:false,boardModalProduct:null,boardUndoing:false,category:'all',store:'all',sort:'name',query:'',ratedOnly:false,highProtein:false,catalogStatus:'all',catalogPhotoFilter:true,persona:'you',selected:null,draftTier:'',draftNote:'',draftPublic:true,guest:{mikel:{},huong:{},you:{}},imageCache:{},user:null,profile:null,allRatings:[],profiles:[],follows:[],lists:[],curators:[],requests:[],ourMode:'published',cloud:'connecting',modal:'',openedUser:null,shareData:null,shareList:null,returnView:'discover'};
let sb=null;
function safeGuest(raw){
 const ret={mikel:{},huong:{},you:{}};
 for(const who of Object.keys(ret)){
  const entries=raw&&typeof raw[who]==='object'?Object.entries(raw[who]):[];
  for(const [id,r] of entries){
   if(!rankableProduct(getProduct(id))||!r||!(TIERS.includes(r.tier)||r.status==='not_tried'))continue;
   const skip=r.status==='not_tried';
   ret[who][id]={status:skip?'not_tried':'rated',tier:skip?null:r.tier,note:String(r.note||'').slice(0,200),is_public:!skip&&r.is_public===true,position:skip?0:Number.isFinite(Number(r.position))?Number(r.position):0};
  }
 }return ret;
}
st.guest=safeGuest(tryRead(STORE_KEY,{}));
st.imageCache=tryRead(IMG_KEY,{});
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(st.guest))}catch(_){}}
function persistImages(){try{localStorage.setItem(IMG_KEY,JSON.stringify(st.imageCache))}catch(_){}}
function toast(message){const t=$('#toaster');t.textContent=message;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),4100)}
function accountRating(id){return st.allRatings.find(r=>r.user_id===st.user?.id&&r.product_id===id)}
function selfRatings(){return st.user?st.allRatings.filter(r=>r.user_id===st.user.id):Object.entries(st.guest.you).map(([product_id,r])=>({product_id,tier:r.tier,status:r.status||'rated',note:r.note,is_public:r.is_public,position:r.position||0}))}
function isNotTried(r){return Boolean(r&&r.status==='not_tried')}
function isGraded(r){return Boolean(r&&r.status!=='not_tried'&&TIERS.includes(r.tier))}
function gradedRatings(){return selfRatings().filter(isGraded)}
function notTriedRatings(){return selfRatings().filter(isNotTried)}
function guestRating(id,who){return st.guest[who]?.[id]||null}
function showRating(id){return st.user?accountRating(id):guestRating(id,'you')}
function avatar(profile,large){
 const str=(profile?.display_name||profile?.handle||'?').trim();
 return '<div class="avatar '+(profile?.accent||'lime')+'"'+(large?' style="height:70px;width:70px;font-size:27px"':'')+'>'+esc(str.substring(0,1).toUpperCase())+'</div>';
}
function tierBadge(tier){
 return tier?'<span class="tier tier-display" data-tier="'+esc(tier)+'" style="--tiercolor:'+({S:'#dcec8d',A:'#c6e6b4',B:'#c9e9f8',C:'#ffdfb0',D:'#f4bcbc',F:'#e99898'}[tier]||'#fff')+'">'+esc(tier)+'</span>':'<span class="small muted">Not rated</span>';
}
function openOverlay(id){const x=$('#'+id);x.classList.add('open');x.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeOverlay(id){const x=$('#'+id);x.classList.remove('open');x.setAttribute('aria-hidden','true');if(!$('.overlay.open'))document.body.style.overflow=''}
function closeAll(){closeOverlay('modalOverlay');closeOverlay('drawerOverlay')}
function empty(emoji,heading,body,button){
 return '<div class="empty"><div class="big">'+esc(emoji)+'</div><strong>'+esc(heading)+'</strong><p>'+esc(body)+'</p>'+(button||'')+'</div>';
}
function setView(view,extra){
 if(!['board','discover','ours','my','community','duo','shared','profile','list'].includes(view))view='board';
 st.view=view;
 if(view!=='shared'&&view!=='profile'&&view!=='list'){
  const u=new URL(URL_BASE);u.searchParams.set('view',view);
  if(view==='duo'&&st.duo.mode==='remote'&&st.duo.room?.id)u.searchParams.set('room',st.duo.room.id);
  history.replaceState(null,'',u.toString());
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
 const img=isMatched?validUrl(p.image_url):'';
 const show=Boolean(img&&isMatched);
 const fallback='<span class="art-emoji">'+esc(p.emoji||'✳')+'</span>';
 const link=isMatched?'<a class="photo-credit" target="_blank" rel="noopener noreferrer" href="'+attr(validUrl(p.image_source_url||p.source_url))+'" title="Product photo from '+attr(p.photo_attribution||'source')+'">↗ '+esc(p.photo_attribution||'Source')+'</a>':'';
 return '<div class="product-art tone-'+esc(p.tone||'mint')+'">'+
 (show?'<img loading="lazy" src="'+attr(img)+'" alt="'+attr(p.brand+' '+p.name)+' product packaging" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false">'+
 '<span class="art-emoji" hidden>'+esc(p.emoji||'✳')+'</span>':fallback)+
 '<span class="art-label-small">'+(isMatched?photoSourceLabel(p):show?'PHOTO CANDIDATE':'NO CONFIRMED PHOTO')+'</span>'+link+'</div>';
}
function productCard(p){
 const r=showRating(p.id);
 return '<article class="product-card">'+productArt(p)+'<div class="card-topline"><span class="micro">'+esc(p.category)+'</span><span class="storetag">'+esc(p.store)+'</span></div><div><p class="brandname">'+esc(p.brand)+'</p><h3>'+esc(p.name)+'</h3></div>'+(proteinNumber(p)!==null?'<div class="product-nutri-teaser">💪 '+proteinNumber(p)+' g Protein* <span>je 100 g/ml</span></div>':'')+(isNotTried(r)?'<div class="not-tried-pill">◌ Not tried yet · no grade</div>':'')+'<div class="card-bottom"><div class="tier-row" aria-label="Your rating for '+attr(p.name)+'">'+TIERS.map(t=>'<button class="tier '+(r?.tier===t?'active':'')+'" data-tier="'+t+'" title="Rate '+t+'" aria-label="Rate '+attr(p.name)+' '+t+'" data-action="rate-product" data-id="'+attr(p.id)+'" data-value="'+t+'">'+t+'</button>').join('')+'</div><button class="round-add" title="Details and notes" aria-label="Open '+attr(p.name)+'" data-action="open-product" data-id="'+attr(p.id)+'">↗</button></div></article>';
}
function filteredProducts(){
 let a=RANKABLE.filter(p=>(st.category==='all'||p.category_id===st.category)&&(st.store==='all'||String(p.store||'').toUpperCase()===String(st.store).toUpperCase()));
 const q=st.query.trim().toLowerCase();if(q)a=a.filter(p=>(p.name+' '+p.brand+' '+p.store+' '+p.category).toLowerCase().includes(q));
 if(st.catalogPhotoFilter)a=a.filter(matchedPhoto);
 if(st.ratedOnly)a=a.filter(p=>isGraded(showRating(p.id)));
 if(st.highProtein)a=a.filter(p=>proteinNumber(p)!==null&&proteinNumber(p)>=15);
 if(st.catalogStatus==='rated')a=a.filter(p=>isGraded(showRating(p.id)));
 if(st.catalogStatus==='not_tried')a=a.filter(p=>isNotTried(showRating(p.id)));
 if(st.catalogStatus==='unanswered')a=a.filter(p=>!showRating(p.id));
 if(st.sort==='protein')a.sort((a,b)=>(proteinNumber(b)??-1)-(proteinNumber(a)??-1)||a.name.localeCompare(b.name,'de'));
 else if(st.sort==='brand')a.sort((a,b)=>a.brand.localeCompare(b.brand,'de')||a.name.localeCompare(b.name,'de'));
 else if(st.sort==='rated')a.sort((a,b)=>(TIER_SCORE[showRating(b.id)?.tier]||0)-(TIER_SCORE[showRating(a.id)?.tier]||0)||a.name.localeCompare(b.name,'de'));
 else a.sort((a,b)=>a.name.localeCompare(b.name,'de'));
 return a;
}

// ----- Interactive TierMaker-style rating board --------------------------------
function boardAnswers(){
 return st.user?st.allRatings.filter(r=>r.user_id===st.user.id&&rankableProduct(getProduct(r.product_id))):
 Object.entries(st.guest[st.persona]||{}).filter(([id])=>rankableProduct(getProduct(id))).map(([product_id,r])=>({product_id,tier:r.tier,status:r.status||'rated',note:r.note,is_public:r.is_public,position:r.position||0}));
}
function boardEntries(){return boardAnswers().filter(isGraded)}
function boardNotTried(){return boardAnswers().filter(isNotTried).sort((a,b)=>a.product_id.localeCompare(b.product_id))}
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
 const image=matchedPhoto(p)?validUrl(p.image_url):'';
 return image?'<img loading="lazy" draggable="false" src="'+attr(image)+'" alt="'+attr(p.brand+' '+p.name)+' packaging" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="board-emoji" hidden>'+esc(p.emoji)+'</span>':
 '<span class="board-emoji">'+esc(p.emoji)+'</span>';
}
function boardPiece(p){
 const matched=matchedPhoto(p);
 const img=matched;
 const label=p.brand+' '+p.name;
 return '<button type="button" draggable="false" class="board-piece" data-drag-id="'+attr(p.id)+'" data-photo="'+(img?'yes':'none')+'" data-action="board-pick" data-id="'+attr(p.id)+'" title="'+attr(label)+' — drag to rank; tap to choose S–F; arrow keys to move" aria-label="'+attr(label)+' — draggable, tap to rank, arrow keys to change tiers">'
 +boardPhoto(p)+(matched?'<span class="verified-indicator" title="Photo from a traceable retailer, brand or barcode record; check current packaging and recipe" aria-hidden="true"></span>':'')
 +'<strong>'+esc(p.name)+'</strong><small>'+esc(p.brand)+'</small>'+(proteinNumber(p)!==null?'<span class="board-protein">'+proteinNumber(p)+' g Protein*</span>':'')+'</button>';
}
function boardTrayProducts(){
 const rated=new Set(boardAnswers().map(r=>r.product_id));
 const query=st.boardQuery.toLocaleLowerCase().trim();
 return RANKABLE.filter(p=>!rated.has(p.id)
 &&(st.boardCategory==='all'||p.category_id===st.boardCategory)
 &&(st.boardPhotoFilter==='all'||(st.boardPhotoFilter==='matched'&&matchedPhoto(p))||(st.boardPhotoFilter==='missing'&&!matchedPhoto(p)))
 &&(!query||(p.brand+' '+p.name+' '+p.category+' '+p.store).toLocaleLowerCase().includes(query)))
 .sort((a,b)=>a.brand.localeCompare(b.brand,'de')||a.name.localeCompare(b.name,'de'));
}

// ── GOOD THINGS DUO · One product. Two honest opinions. ────────────────────
const DUO_KEY='goodthings_duo_v18';
const duoDefault=()=>({mode:'local',local:{round:1,productId:null,votes:{},history:[],activeRole:'mikel'},rooms:[],room:null,ownVote:null,reveal:null,history:[],busy:false,error:'',loading:false,qualityMessage:''});
const duoSafe=raw=>{
 const base=duoDefault();
 if(!raw||typeof raw!=='object'||!raw.local)return base;
 const local=raw.local,history=Array.isArray(local.history)?local.history.filter(x=>getProduct(x.productId)&&x.votes).slice(-200):[];
 base.local={round:Number.isInteger(local.round)&&local.round>0&&local.round<10000?local.round:1,productId:getProduct(local.productId)?local.productId:null,votes:{},history,activeRole:['mikel','huong'].includes(local.activeRole)?local.activeRole:'mikel'};
 for(const name of ['mikel','huong'])if(TIERS.includes(local.votes?.[name])||local.votes?.[name]==='not_tried')base.local.votes[name]=local.votes[name];
 return base;
};
st.duo=duoSafe(tryRead(DUO_KEY,null));
const duoPersist=()=>{try{localStorage.setItem(DUO_KEY,JSON.stringify({local:st.duo.local}))}catch(_){}};
const duoValidChoice=x=>TIERS.includes(x)||x==='not_tried';
const duoPhotoCandidates=()=>RANKABLE.filter(p=>matchedPhoto(p)&&p.image_url&&!(p.photo_blocked));
function duoHiResImage(p){
 const url=validUrl(p?.image_url);if(!url)return '';
 // Official Open Food Facts selected images expose an explicit .full variant.
 // Do not upscale a thumbnail or invent a full URL for unrecognised hosts.
 if(p?.source_type==='openfoodfacts'&&/\/front_[a-z]{2}\.\d+\.400\.jpg(?:\?.*)?$/.test(url))
  return url.replace(/\.400\.jpg(?=\?|$)/,'.full.jpg');
 return url;
}
function duoPhotoMarkup(p){
 if(duoPhotoBroken.has(p.id))return '<div class="duo-hero-photo duo-photo-unavailable"><p>Dieses Bild ist nicht scharf genug oder vorübergehend unerreichbar.</p><button class="button button-lime" data-action="duo-skip-photo">Anderes Produkt mit Foto ↗</button></div>';
 const selected=duoPhotoCheck.get(p.id);const url=typeof selected==='string'?selected:duoHiResImage(p),fallback=validUrl(p.image_url);
 return '<div class="duo-hero-photo"><img loading="eager" data-duo-image="true" data-fallback="'+attr(fallback)+'" src="'+attr(url)+'" alt="'+attr(p.brand+' '+p.name)+' — Produktverpackung" referrerpolicy="no-referrer"><div class="duo-photo-bottom"><span>PHOTO · '+esc(p.photo_attribution||'Product source')+'</span><span>'+esc(p.barcode?'EAN '+p.barcode:'Source-linked packshot')+'</span></div></div>';
}
const duoPhotoCheck=new Map();
const duoPhotoBroken=new Set();
async function duoIsPhotoSharp(p){
 if(!p||!matchedPhoto(p))return false;
 if(duoPhotoCheck.has(p.id))return duoPhotoCheck.get(p.id);
 if(typeof Image==='undefined')return true;
 const variants=[duoHiResImage(p),validUrl(p.image_url)].filter((url,i,a)=>url&&a.indexOf(url)===i);
 for(const url of variants){
  const ok=await new Promise(resolve=>{
   const img=new Image();let done=false;
   const finish=v=>{if(done)return;done=true;clearTimeout(timeout);resolve(v)};
   const timeout=setTimeout(()=>finish(false),3800);
   img.onload=()=>finish(img.naturalWidth>=450&&img.naturalHeight>=450);
   img.onerror=()=>finish(false);img.src=url;
  });
  if(ok){duoPhotoCheck.set(p.id,url);return url}
 }
 duoPhotoCheck.set(p.id,false);
 return false;
}
async function duoPick(usedIds){
 const used=new Set(usedIds||[]);
 const list=duoPhotoCandidates().filter(p=>!used.has(p.id));
 // Shuffle while preferring real barcode-linked records. Parallel verification means
 // the user does not wait for 28 sequential CDN timeouts on mobile.
 const picks=list.sort((a,b)=>(a.barcode?0:1)-(b.barcode?0:1)||a.name.localeCompare(b.name,'de'));
 const start=picks.length?Math.floor(Math.random()*picks.length):0;
 const tested=picks.slice(start).concat(picks.slice(0,start)).slice(0,32);
 for(let i=0;i<tested.length;i+=8){
  const batch=tested.slice(i,i+8);
  try{
   return await Promise.any(batch.map(async p=>{
    const result=await duoIsPhotoSharp(p);
    if(!result)throw Error('photo low-resolution');
    return p;
   }));
  }catch(_){} // all eight images lacked a usable high-res source
 }
 return null;
}
const duoChoiceLabel=v=>v==='not_tried'?'◌ Noch nicht probiert':v==='F'?'F · Durchgefallen':v?'Tier '+v:'Noch nicht bewertet';
function duoLocalHistory(){return st.duo.local.history||[]}
function duoLocalReset(){
 st.duo.mode='local';
 st.duo.local={round:1,productId:null,votes:{},history:[],activeRole:'mikel'};
 duoPersist();render();
}
async function duoLocalStart(forceNext){
 if(st.duo.busy)return;
 st.duo.busy=true;
 try{
  const local=st.duo.local;
  const completed=duoValidChoice(local.votes.mikel)&&duoValidChoice(local.votes.huong);
  if(local.productId&&!forceNext)return;
  if(forceNext&&local.productId&&completed){
   local.history.push({productId:local.productId,votes:{...local.votes}});
   local.round++;
  }
  const used=local.history.map(x=>x.productId);
  if(local.productId)used.push(local.productId);
  for(const key of ['mikel','huong'])for(const id of Object.keys(st.guest[key]||{}))
   if(st.guest.mikel[id]&&st.guest.huong[id])used.push(id);
  const p=await duoPick(used);
  if(!p){st.duo.qualityMessage='Keine weitere Packung mit ausreichender Bildauflösung gefunden. Die noch offenen Produkte brauchen bessere Fotos.';return}
  local.productId=p.id;local.votes={};local.activeRole='mikel';
  st.duo.qualityMessage='';duoPersist();
 }finally{st.duo.busy=false;render()}
}
function duoSaveLocalAnswer(person,productId,choice){
 if(!['mikel','huong'].includes(person)||!getProduct(productId)||!duoValidChoice(choice))return false;
 const previous=st.guest[person]?.[productId];
 const skip=choice==='not_tried';
 st.guest[person][productId]={tier:skip?null:choice,status:skip?'not_tried':'rated',note:skip?'':previous?.note||'',is_public:false,position:skip?0:previous?.position||100};
 persist();return true;
}
function duoLocalVote(choice){
 if(!duoValidChoice(choice))return toast('Bitte eine Einstufung wählen.');
 const local=st.duo.local;
 if(!local.productId||duoValidChoice(local.votes[local.activeRole]))return;
 const person=local.activeRole;local.votes[person]=choice;
 duoSaveLocalAnswer(person,local.productId,choice);
 local.activeRole=person==='mikel'?'huong':'mikel';
 duoPersist();render();
 if(duoValidChoice(local.votes.mikel)&&duoValidChoice(local.votes.huong))
  toast('Beide haben entschieden. Reveal! ✳');
 else toast('Gespeichert, aber verborgen. Jetzt ist '+(local.activeRole==='huong'?'Huong':'Mikel')+' dran ♡');
}
function duoResultsSummary(history){
 const compared=(history||[]).filter(x=>TIERS.includes(x.host_choice||x.votes?.mikel)&&TIERS.includes(x.partner_choice||x.votes?.huong));
 const same=compared.filter(x=>(x.host_choice||x.votes?.mikel)===(x.partner_choice||x.votes?.huong)).length;
 return compared.length?same+' / '+compared.length+' gleiche Tier-Wertungen':'Noch keine gemeinsamen Tier-Wertungen';
}
function duoLocalSnapshot(){
 const local=st.duo.local;const votes=local.votes||{};
 return {product:getProduct(local.productId),round:local.round,mikel:duoValidChoice(votes.mikel),huong:duoValidChoice(votes.huong),votes,
  complete:duoValidChoice(votes.mikel)&&duoValidChoice(votes.huong)};
}
async function duoRefresh(){
 if(!sb||!st.user||!st.duo.room||st.duo.loading)return;
 st.duo.loading=true;
 try{
  const id=st.duo.room.id;
  const [roomResult,voteResult,revealResult]=await Promise.all([
   sb.from('gt_duo_rooms').select('id,host_id,partner_id,current_product_id,round_no,updated_at').eq('id',id).maybeSingle(),
   sb.from('gt_duo_votes').select('choice,user_id,round_no').eq('room_id',id).eq('round_no',st.duo.room.round_no),
   sb.from('gt_duo_reveals').select('room_id,round_no,product_id,host_choice,partner_choice').eq('room_id',id).order('round_no',{ascending:false}).limit(50)
  ]);
  if(roomResult.error)throw roomResult.error;
  if(!roomResult.data){st.duo.error='Dieser Raum ist für dein Konto nicht zugänglich.';return}
  const room=roomResult.data,prevRound=st.duo.room.round_no;
  st.duo.room=room;
  if(room.round_no!==prevRound){
   const fresh=await sb.from('gt_duo_votes').select('choice,user_id,round_no').eq('room_id',id).eq('round_no',room.round_no);
   st.duo.ownVote=fresh.data?.find(x=>x.user_id===st.user.id)||null;
  }else if(!voteResult.error)st.duo.ownVote=voteResult.data?.find(x=>x.user_id===st.user.id)||null;
  if(!revealResult.error){
   st.duo.history=revealResult.data||[];
   st.duo.reveal=st.duo.history.find(x=>x.round_no===room.round_no)||null;
  }
  st.duo.error='';
  if(st.view==='duo'&&st.duo.mode==='remote')render();
 }catch(e){st.duo.error='Synchronisierung: '+String(e.message||e).slice(0,130)}
 finally{st.duo.loading=false}
}
async function duoLoadRooms(){
 if(!sb||!st.user)return;
 const r=await sb.from('gt_duo_rooms').select('id,host_id,partner_id,current_product_id,round_no,updated_at').order('updated_at',{ascending:false}).limit(25);
 if(r.error){st.duo.error=r.error.message;return}
 st.duo.rooms=r.data||[];
 if(st.duo.room){const matching=st.duo.rooms.find(x=>x.id===st.duo.room.id);if(matching)st.duo.room=matching}
}
async function duoOpenRoom(id){
 if(!st.user||!sb)return openAuth();
 const r=await sb.from('gt_duo_rooms').select('id,host_id,partner_id,current_product_id,round_no,updated_at').eq('id',id).maybeSingle();
 if(r.error||!r.data)return toast('Dieser Duo-Raum gehört anderen Konten oder existiert nicht.');
 st.duo.room=r.data;st.duo.mode='remote';st.duo.ownVote=null;st.duo.reveal=null;
 const url=new URL(URL_BASE);url.searchParams.set('view','duo');url.searchParams.set('room',id);
 history.replaceState(null,'',url.toString());
 await duoRefresh();setView('duo',false);
}
async function duoCreateRoom(form){
 if(!st.user||!sb)return openAuth();
 const handle=form.elements.namedItem('partner').value.trim().toLowerCase().replace(/^@/,'');
 const partner=st.profiles.find(x=>x.handle===handle);
 if(!partner)return toast('Dieses Profil gibt es noch nicht. Huong muss erst ein eigenes Konto anlegen.');
 if(partner.id===st.user.id)return toast('Du kannst dich nicht selbst herausfordern.');
 const used=st.duo.history.map(x=>x.product_id);
 const product=await duoPick(used);
 if(!product)return toast('Noch kein hochauflösendes Produktfoto gefunden. Bitte erst Fotos prüfen.');
 const res=await sb.from('gt_duo_rooms').insert({host_id:st.user.id,partner_id:partner.id,current_product_id:product.id}).select().single();
 if(res.error)return toast('Raum konnte nicht erstellt werden: '+res.error.message);
 closeAll();await duoLoadRooms();await duoOpenRoom(res.data.id);
 toast('Duo-Raum angelegt. Teile den Link mit @'+partner.handle+' ♡');
}
async function duoRemoteVote(choice){
 if(!duoValidChoice(choice)||!st.duo.room||!st.user||st.duo.ownVote)return;
 const room=st.duo.room,choiceRow={room_id:room.id,round_no:room.round_no,user_id:st.user.id,choice};
 const r=await sb.from('gt_duo_votes').insert(choiceRow);
 if(r.error)return toast('Bewertung nicht gespeichert: '+r.error.message);
 st.duo.ownVote=choiceRow;
 // A security-definer trigger copies each participant's private grade to their shelf
 // and writes a reveal only after *both* submitted.
 await duoRefresh();
 toast('Dein Urteil ist abgegeben und bleibt bis zur zweiten Antwort verborgen.');
}
async function duoNextRemote(){
 if(!st.user||!st.duo.room||!st.duo.reveal)return;
 const room=st.duo.room;
 if(room.host_id!==st.user.id)return toast('Der Host wählt die nächste Runde.');
 const used=new Set(st.duo.history.map(x=>x.product_id));used.add(room.current_product_id);
 const product=await duoPick(used);
 if(!product)return toast('Keine weiteren hochauflösenden Packshots verfügbar. Bitte Bilder verbessern.');
 const r=await sb.from('gt_duo_rooms').update({current_product_id:product.id,round_no:room.round_no+1,updated_at:new Date().toISOString()}).eq('id',room.id).eq('round_no',room.round_no).select().single();
 if(r.error)return toast('Nächste Runde blockiert: '+r.error.message);
 st.duo.room=r.data;st.duo.ownVote=null;st.duo.reveal=null;await duoRefresh();
}

async function duoSkipPhoto(){
 const remote=st.duo.mode==='remote';
 const id=remote?st.duo.room?.current_product_id:st.duo.local.productId;
 if(!id)return;
 duoPhotoCheck.set(id,false);duoPhotoBroken.add(id);
 if(!remote){
  if(Object.keys(st.duo.local.votes).length)return toast('Eine Antwort ist schon abgegeben. Das Foto kannst du oben bei der Quelle prüfen.');
  st.duo.local.productId=null;st.duo.local.votes={};
  await duoLocalStart(false);return;
 }
 if(!st.user||!st.duo.room)return;
 if(st.duo.room.host_id!==st.user.id)return toast('Bitte den Host um einen neuen Artikel.');
 if(st.duo.ownVote)return toast('Deine Stimme ist schon abgegeben; nun muss die zweite Person entscheiden.');
 const room=st.duo.room;
 const next=await duoPick([id,...st.duo.history.map(x=>x.product_id)]);
 if(!next)return toast('Noch keine weiteren hochauflösenden Produktfotos verfügbar.');
 const r=await sb.from('gt_duo_rooms').update({current_product_id:next.id,updated_at:new Date().toISOString()}).eq('id',room.id).eq('round_no',room.round_no).select().single();
 if(r.error)return toast('Die Runde kann nach einer abgegebenen Stimme nicht übersprungen werden.');
 st.duo.room=r.data;st.duo.ownVote=null;await duoRefresh();
}

function duoSharedLink(){
 if(!st.duo.room)return;
 copyLink(URL_BASE+'?view=duo&room='+encodeURIComponent(st.duo.room.id));
}
function duoScoreTile(label,choice){
 return '<div class="duo-vote-revealed"><small>'+esc(label)+'</small><strong class="'+(choice==='F'?'duo-failure':'')+'">'+esc(choice==='not_tried'?'◌':choice)+'</strong><span>'+esc(duoChoiceLabel(choice))+'</span></div>';
}
function duoVoteGrid(){
 return '<div class="duo-vote-chooser">'+TIERS.map(t=>'<button class="duo-grade duo-grade-'+t+'" data-action="duo-vote" data-value="'+t+'" title="'+(t==='F'?'Durchgefallen':'Tier '+t)+'">'+t+'</button>').join('')+'</div>'+
 '<button class="duo-untried-button" data-action="duo-vote" data-value="not_tried">◌ Noch nicht probiert <span>Antwort ohne Note</span></button>';
}
function duoImageAuditBadge(p){
 return '<div class="duo-photo-credit">Packshot: '+esc(p.photo_attribution||'Quellenbild')+' · '+(p.barcode?'EAN '+esc(p.barcode):'Retailer / manufacturer')+
 ' · <a href="'+attr(validUrl(p.image_source_url||p.source_url))+'" target="_blank" rel="noopener noreferrer">Quelle ↗</a></div>';
}
function renderDuo(){
 const remote=st.duo.mode==='remote';
 const room=remote?st.duo.room:null;
 const snap=remote?null:duoLocalSnapshot();
 const p=remote?getProduct(room?.current_product_id):snap.product;
 const answerA=remote?Boolean(st.duo.reveal):snap.mikel,answerB=remote?Boolean(st.duo.reveal):snap.huong;
 const done=remote?Boolean(st.duo.reveal):snap.complete;
 const labelA=remote?st.profiles.find(x=>x.id===room?.host_id)?.display_name||'Person 1':'Mikel';
 const labelB=remote?st.profiles.find(x=>x.id===room?.partner_id)?.display_name||'Person 2':'Huong';
 const round=remote?room?.round_no||1:snap.round;
 const controls='<div class="duo-controls"><div class="duo-switch"><button class="'+(!remote?'active':'')+'" data-action="duo-mode-local">Gemeinsam am Gerät</button><button class="'+(remote?'active':'')+'" data-action="duo-mode-remote">Zwei Konten / Geräte</button></div>'+
 '<div class="gap12"><button class="button button-ghost button-small" data-nav="board">← Tier List</button>'+(remote&&room?'<button class="button button-white button-small" data-action="duo-copy-link">Link teilen ↗</button>':'')+'</div></div>';
 const intro=head('GOOD THINGS / MIKEL × HUONG','One product.<br><em>Two opinions.</em>','Ihr entscheidet unabhängig. Erst wenn beide geantwortet haben, zeigen wir S–F oder „Nicht probiert“ nebeneinander.',remote?'ZWEI KONTEN':'SAME-DEVICE DEMO');
 if(remote&&!st.user)return intro+controls+empty('♡','Zwei echte Konten','Meldet euch jeweils mit einem eigenen Konto an, um geräteübergreifend zu spielen. Am selben Gerät könnt ihr sofort starten.','<button class="button button-lime" data-action="open-auth">Anmelden ↗</button>');
 if(remote&&!room){
  const rooms=(st.duo.rooms||[]).map(r=>{
   const partnerId=r.host_id===st.user?.id?r.partner_id:r.host_id,u=st.profiles.find(x=>x.id===partnerId);
   return '<div class="duo-room"><div><strong>'+esc(u?.display_name||'Duo Partner')+'</strong><small>Runde '+r.round_no+' · '+esc(getProduct(r.current_product_id)?.name||'Produkt')+'</small></div><button class="button button-small button-lime" data-action="duo-open-room" data-id="'+attr(r.id)+'">Öffnen ↗</button></div>';
  }).join('');
  return intro+controls+'<div class="duo-welcome"><h3>Spielt auf zwei Geräten.</h3><p>Jede Person antwortet mit ihrem eigenen Konto. Die Stimmen bleiben verborgen, bis beide fertig sind. Die Bewertung landet auf dem eigenen, privaten Shelf.</p><form id="duoPartnerForm"><label class="small" for="duoPartner">Benutzername deiner Partnerperson</label><div class="gap12" style="margin-top:8px"><input class="control" name="partner" id="duoPartner" placeholder="@huong" required pattern="@?[a-z0-9][a-z0-9_-]{2,23}"><button class="button button-dark" type="submit">Duo starten ↗</button></div></form></div>'+
  '<div class="duo-room-list">'+(rooms||'<p class="small muted">Noch kein gemeinsamer Raum. Meldet euch getrennt an und ladet einander per Profilname ein.</p>')+'</div>';
 }
 if(!p)return intro+controls+'<div class="duo-welcome"><h3>Geschmack ist Teamwork.</h3><p>Keine erfundenen Bilder: wir zeigen nur Produktkandidaten mit quellenverknüpften Packshots und prüfen die tatsächliche Bildauflösung, bevor sie vorgeschlagen werden.</p><button class="button button-lime" data-action="duo-start-local" '+(st.duo.busy?'disabled':'')+'>Unser erstes Produkt ✳</button>'+
 (st.duo.qualityMessage?'<p class="small muted">'+esc(st.duo.qualityMessage)+'</p>':'')+'</div>';
 let statusA=remote?(done?'Fertig':'Urteil noch verborgen'):answerA?'Antwort verborgen':'Noch offen';
 let statusB=remote?(done?'Fertig':'Urteil noch verborgen'):answerB?'Antwort verborgen':'Noch offen';
 const voteName=remote?st.profile?.display_name||'Du':snap.votes.mikel?'Huong':'Mikel';
 const needVote=remote?!st.duo.ownVote:!snap.complete;
 const waiting=remote?Boolean(st.duo.ownVote):Boolean(snap.votes.mikel&&!snap.votes.huong);
 const status='<div class="duo-status-grid"><div class="'+(answerA?'answered':'')+'"><span>① '+esc(labelA)+'</span><strong>'+statusA+'</strong></div><div class="'+(answerB?'answered':'')+'"><span>② '+esc(labelB)+'</span><strong>'+statusB+'</strong></div></div>';
 const reveal=done?'<div class="duo-reveal"><div class="eyebrow">BOTH ANSWERS ARE IN</div><h3>'+(
  (remote?st.duo.reveal.host_choice: snap.votes.mikel)===(remote?st.duo.reveal.partner_choice:snap.votes.huong)?'Ihr seid euch einig! ✳':'Zwei Menschen. Zwei Geschmäcker. ♡')+'</h3><div class="duo-reveal-grid">'+
 duoScoreTile(labelA,remote?st.duo.reveal.host_choice:snap.votes.mikel)+
 '<div class="duo-versus">×</div>'+duoScoreTile(labelB,remote?st.duo.reveal.partner_choice:snap.votes.huong)+
 '</div><button class="button button-lime" data-action="'+(remote?'duo-next-remote':'duo-next-local')+'" '+(remote&&room.host_id!==st.user?.id?'disabled':'')+'>Nächstes Produkt ↗</button>'+
 (remote&&room.host_id!==st.user?.id?'<p class="small muted">Die Host-Person startet die nächste Runde.</p>':'')+'</div>':
 (needVote?'<div class="duo-choice"><p>Jetzt bewertet <strong>'+esc(voteName)+'</strong>. Welche Tier-Stufe verdient das Produkt?</p>'+duoVoteGrid()+'</div>':
 '<div class="duo-waiting">✓ Dein Urteil ist gespeichert. Wir warten auf die zweite Antwort.<button class="button button-white button-small" data-action="duo-refresh">Aktualisieren ↻</button></div>');
 const counter=remote?(st.duo.history||[]):duoLocalHistory();
 const pic=duoPhotoMarkup(p);
 return intro+controls+'<div class="duo-progress"><span>ROUND '+round+'</span><span>'+duoResultsSummary(counter)+'</span></div>'+
 '<div class="duo-stage"><div class="duo-product">'+pic+duoImageAuditBadge(p)+'<h3>'+esc(p.name)+'</h3><p>'+esc(p.brand)+' · '+esc(p.quantity||p.category)+'</p>'+
 (proteinNumber(p)!=null?'<span class="duo-protein">💪 '+proteinNumber(p)+' g Protein je 100 g/ml</span>':'')+
 '</div><div class="duo-decision">'+status+reveal+
 (remote?'<p class="small muted" style="text-align:center;margin:20px 0 0">Synchronisiert zwischen zwei getrennten Accounts. Ein unabhängiges Urteil pro Runde.</p>':
 '<p class="small muted" style="text-align:center;margin:20px 0 0">Private gemeinsame Vorschau auf diesem Gerät. Die tatsächlichen öffentlichen Profile werden nicht verändert.</p>')+
 '</div></div>';
}

function renderBoard(){
 const entries=boardEntries(),skipped=boardNotTried(),answered=new Set(boardAnswers().map(r=>r.product_id));
 const photos=RANKABLE.filter(matchedPhoto).length;
 const who=st.user?(st.profile?.display_name||'You'):(st.persona==='you'?'Your':st.persona==='mikel'?'Mikel':'Huong');
 const personToggle=st.user?'<span class="board-status">🔒 Rating as your verified account</span>':
 '<div class="board-personas" aria-label="Choose local board"><button data-action="board-persona" data-value="you" class="'+(st.persona==='you'?'active':'')+'">You</button><button data-action="board-persona" data-value="mikel" class="'+(st.persona==='mikel'?'active':'')+'">Mikel</button><button data-action="board-persona" data-value="huong" class="'+(st.persona==='huong'?'active':'')+'">Huong</button></div>';
 const rows=TIERS.map(t=>{
  const products=boardSorted(t).map(r=>getProduct(r.product_id)).filter(Boolean);
  const msg={S:'Obsessed',A:'Brilliant',B:'Good',C:'Okay',D:'Disappointing',F:'Durchgefallen'};
  return '<div class="tier-lane" data-drop-tier="'+t+'"><div class="lane-tag"><strong>'+t+'</strong><small>'+msg[t]+'</small></div>'
  +'<div class="tier-dropzone" data-drop-tier="'+t+'" aria-label="'+t+' tier, '+products.length+' products">'+(products.length?products.map(boardPiece).join(''):'<span class="drop-hint">Drop something good here…</span>')+'</div></div>';
 }).join('');
 return head('GOOD THINGS / THE TIER BOARD','Pick it up.<br><em>Place your verdict.</em>',
 'Drag a product into S–F if you’ve tried it. Otherwise choose Not tried yet — an explicit answer without a grade.',entries.length+' RANKED · '+skipped.length+' NOT TRIED')
 +'<div class="board-intro">'+personToggle+'<div class="gap12"><button class="button button-small button-ghost" data-action="undo-board" '+(!st.boardHistory.length?'disabled':'')+' title="Undo last move">↶ Undo</button><button class="button button-small button-white" data-action="export-board-png">↓ Save PNG</button><button class="button button-small button-lime" data-action="share-board">Share ↗</button><button class="button button-small button-ghost" data-action="suggest-product">+ Produkt fehlt?</button><button class="button button-small button-ghost" data-action="reset-board" '+(!entries.length&&!skipped.length?'disabled':'')+'>Reset</button></div></div>'
 +(!st.user?'<div class="inline-notice">✳ <strong>Local preview:</strong> switching Mikel/Huong changes only this device’s demo board. Sign in to sync your own honest scores — nobody can post as someone else.</div>':'<div class="inline-notice">♡ Your board is tied to your account. Changes sync to Supabase; each new rating is private until you explicitly publish it.</div>')
 +'<div class="duo-board-banner"><div><span class="eyebrow">NEW · TOGETHER</span><strong>Ein Produkt. Zwei Urteile.</strong><p>Erst beide raten, dann werden die Tier-Stufen aufgedeckt. Nur echte Produktfotos.</p></div><button class="button button-dark" data-nav="duo">Gemeinsam spielen ↗</button></div>'+
 '<div class="board-layout"><section class="board-pantry" aria-label="Unranked products">'
 +'<div class="board-panel-label"><span>✳ Not answered yet</span><span id="boardTrayCount">'+boardTrayProducts().length+' unanswered</span></div>'
 +'<div class="board-filter-row"><input type="search" id="boardSearch" class="board-filter" aria-label="Search unranked products" placeholder="Find chocolate, tofu…" value="'+attr(st.boardQuery)+'"><select class="board-filter" id="boardCategory" aria-label="Filter board by category">'
 +'<option value="all">All categories</option>'+GROUPS.map(g=>'<option value="'+attr(g.id)+'" '+(st.boardCategory===g.id?'selected':'')+'>'+esc(g.emoji)+' '+esc(g.label)+'</option>').join('')+'</select><select class="board-filter" id="boardPhotoFilter" aria-label="Photo quality"><option value="all">All photos</option><option value="matched" '+(st.boardPhotoFilter==='matched'?'selected':'')+'>✓ Source-matched</option><option value="missing" '+(st.boardPhotoFilter==='missing'?'selected':'')+'>Needs a packshot</option></select></div>'
 +'<div class="board-tray" id="boardTray" data-drop-tier="unranked" aria-label="Unanswered products. Drop here to remove a response.">'+boardTrayProducts().map(boardPiece).join('')+'</div>'
 +'<div class="board-photo-progress" title="Sourced exact retailer photo coverage"><span style="width:'+photos/RANKABLE.length*100+'%"></span></div>'
 +'<div class="board-legend"><span>'+photos+' / '+RANKABLE.length+' source-matched packshots</span><span>Drop here to clear your answer ↶</span></div>'
 +'</section><section class="board-mat" aria-label="Your S through D tier ranking">'
 +'<div class="board-mat-head"><div><strong>'+esc(who)+' taste board</strong><small style="display:block;margin-top:6px">S–F is for products you have tasted.</small></div><small>'+entries.length+' ranked · '+skipped.length+' not tried · '+(RANKABLE.length-answered.size)+' unanswered</small></div>'
 +rows+'</section><section class="not-tried-shelf" aria-label="Products explicitly marked not tried yet"><div class="not-tried-header"><div><strong>◌ Not tried yet</strong><p>Answered, but no grade. These products never enter S–F or your taste match.</p></div><span>'+skipped.length+' saved</span></div><div id="boardNotTried" class="not-tried-dropzone" data-drop-tier="not_tried" aria-label="Not tried yet, drop products here to record no grade">'+(skipped.length?skipped.map(r=>getProduct(r.product_id)).filter(Boolean).map(boardPiece).join(''):'<span class="drop-hint">Drag a product here or tap it and choose Not tried yet.</span>')+'</div></section></div>'
 +'<div class="board-mobile-hint">↕ <strong>Drag & drop</strong> into S–F, Not tried yet or the unanswered tray. On mobile, tap a product to choose its status or hold briefly to drag. Keyboard: ↑ ↓ moves tiers, ← → reorders. <button class="navlink" data-action="open-photo-info" style="display:inline;text-decoration:underline">About our photos ↗</button></div>'
 +'<div class="board-scoreboard"><div><strong>'+entries.length+' graded · '+skipped.length+' not tried.</strong><span>'+Math.min(5,entries.length)+'/5 first-five tasting challenge · '+(RANKABLE.length-answered.size)+' unanswered</span></div><div class="gap12"><button class="button button-lime button-small" data-nav="my">See my shelf ↗</button><button class="button button-ghost button-small" data-nav="discover">See all products</button></div></div>';
}
function refreshBoardTray(){
 const tray=$('#boardTray');if(tray)tray.innerHTML=boardTrayProducts().map(boardPiece).join('');
 if($('#boardTrayCount'))$('#boardTrayCount').textContent=boardTrayProducts().length+' unanswered';
}
async function boardMove(id,tier,index){
 if(!rankableProduct(getProduct(id))||!(TIERS.includes(tier)||tier==='unranked'||tier==='not_tried'))return false;
 const old=st.user?accountRating(id):st.guest[st.persona]?.[id];
 if(tier==='unranked'&&!old)return true;
 const oldIndex=isGraded(old)?boardSorted(old.tier).findIndex(x=>x.product_id===id):-1;
 if((tier==='not_tried'&&isNotTried(old))||(isGraded(old)&&old.tier===tier&&Number(index)===oldIndex))return true;
 const previous=old?{status:isNotTried(old)?'not_tried':'rated',tier:isNotTried(old)?null:old.tier,note:old.note||'',is_public:old.is_public===true,position:Number(old.position)||0}:null;
 if(st.boardBusy)return false;
 st.boardBusy=true;
 try{
  if(st.user){
   if(!sb){toast('Cloud is offline — could not save that move.');return false}
   let result;
   if(tier==='unranked'){
    result=await sb.from('gt_ratings').delete().eq('user_id',st.user.id).eq('product_id',id);
   }else{
    const skip=tier==='not_tried';
    const obj={user_id:st.user.id,product_id:id,status:skip?'not_tried':'rated',tier:skip?null:tier,position:skip?0:boardPositionBetween(tier,id,index),note:skip?(isNotTried(old)?old.note||'':''):old?.note||'',is_public:!skip&&old?.is_public===true,updated_at:new Date().toISOString()};
    result=await sb.from('gt_ratings').upsert(obj,{onConflict:'user_id,product_id'});
    if(!result.error){st.allRatings=st.allRatings.filter(x=>!(x.user_id===st.user.id&&x.product_id===id)).concat(obj)}
   }
   if(result.error){toast('Could not save rating: '+String(result.error.message).slice(0,90));return false}
   if(tier==='unranked')st.allRatings=st.allRatings.filter(x=>!(x.user_id===st.user.id&&x.product_id===id));
  }else{
   if(tier==='unranked')delete st.guest[st.persona][id];
   else {const skip=tier==='not_tried';st.guest[st.persona][id]={status:skip?'not_tried':'rated',tier:skip?null:tier,position:skip?0:boardPositionBetween(tier,id,index),note:skip?(isNotTried(old)?old.note||'':''):old?.note||'',is_public:!skip&&old?.is_public===true}};
   persist();
  }
  if(!st.boardUndoing){st.boardHistory.push({id,previous});if(st.boardHistory.length>25)st.boardHistory.shift()}
  render();
  const p=getProduct(id);
  toast(tier==='unranked'?'Back on the unanswered shelf.':tier==='not_tried'?p.name+' marked as not tried yet — no grade saved.':p.name+' → '+tier+' tier. Nice!');
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
  '<p class="small muted">Tried it? Choose an S–F grade. Otherwise mark it as not tried yet — an answer without a score.</p>'+
  '<div class="quick-rank-choices">'+TIERS.map(t=>'<button type="button" class="quick-rank-button" data-rank-tier="'+t+'" data-action="quick-rank" data-value="'+t+'" aria-label="Place in '+t+' tier"><strong>'+t+'</strong><small>'+({S:'Obsessed',A:'Brilliant',B:'Good',C:'Okay',D:'Disappointing',F:'Durchgefallen'}[t])+'</small></button>').join('')+'</div>'+
  '<button type="button" class="not-tried-choice '+(isNotTried(current)?'selected':'')+'" data-action="quick-not-tried" aria-pressed="'+(isNotTried(current)?'true':'false')+'"><span>◌</span><span><strong>Not tried yet</strong><small>Answered · no grade · stays off S–F</small></span><span>↗</span></button>'+ 
 '<div class="gap12" style="margin-top:18px"><button class="button button-ghost button-small" data-action="quick-detail">Taste notes & details ↗</button>'+
  (current?'<button class="button button-white button-small" data-action="quick-unrank">↶ Clear answer</button>':'')+'</div>');
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
   else result=await sb.from('gt_ratings').upsert({user_id:st.user.id,product_id:id,status:previous.status||'rated',tier:previous.tier,note:previous.note,is_public:previous.is_public,position:previous.position,updated_at:new Date().toISOString()},{onConflict:'user_id,product_id'});
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
 if(!boardAnswers().length)return toast('Your board and answer shelf are already empty.');
 modal('<button class="close" data-action="close-modal" aria-label="Close">×</button><div class="eyebrow">START AGAIN</div><h2>Clear all answers?</h2><p>Your S–F ratings, tasting notes and “not tried yet” answers will be removed. This cannot be undone. Your saved community profile stays intact.</p><div class="gap12"><button class="button button-ghost" data-action="close-modal">Keep my board</button><button class="button button-dark" data-action="confirm-reset-board">Clear everything</button></div>');
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

function openProductSuggestion(){
 if(!st.user)return openAuth();
 modal('<button class="close" aria-label="Schliessen" data-action="close-modal">×</button><div class="eyebrow">WAS FEHLT NOCH?</div><h2>Ein Produkt vorschlagen ✳</h2><p class="small muted">Du kennst ein veganes Produkt, das hier fehlt? Schick uns Marke, Name und Barcode. Wir prüfen den Eintrag und das passende Foto vor der Veröffentlichung — deine Anfrage bleibt privat.</p>'+
 '<form id="productRequestForm"><div class="field"><label>EAN / Barcode (8–14 Ziffern)</label><input name="barcode" class="control" type="text" inputmode="numeric" pattern="[0-9]{8,14}" maxlength="14" placeholder="z. B. 4012359113108" required></div>'+
 '<div class="field"><label>Produktname</label><input name="product_name" class="control" maxlength="120" minlength="2" placeholder="z. B. Räuchertofu" required></div>'+
 '<div class="field"><label>Marke</label><input name="brand" class="control" maxlength="80" minlength="2" placeholder="z. B. Taifun" required></div>'+
 '<div class="field"><label>Wo gesehen? (optional)</label><input name="store_hint" class="control" maxlength="100" placeholder="REWE, Lidl, dm …"></div>'+
 '<div class="field"><label>Hinweis (optional)</label><textarea name="notes" class="control" rows="2" maxlength="350" placeholder="Sorte, Packungsgrösse oder Zutatenhinweis"></textarea></div>'+
 '<button type="submit" class="button button-lime" style="width:100%">Zur Prüfung einreichen ♡</button></form>');
}
async function submitProductSuggestion(form){
 if(!st.user||!sb)return openAuth();
 const pick=name=>form.elements.namedItem(name).value.trim();
 const barcode=pick('barcode'),product_name=pick('product_name'),brand=pick('brand'),store_hint=pick('store_hint'),notes=pick('notes');
 if(!/^\d{8,14}$/.test(barcode)||product_name.length<2||brand.length<2)return toast('Bitte Barcode, Produktname und Marke prüfen.');
 if(getProduct('off-'+barcode)||RANKABLE.some(p=>p.barcode===barcode))return toast('Dieses Produkt ist bereits im Katalog. Suche nach dem Namen oder Barcode.');
 const {data,error}=await sb.from('gt_product_requests').insert({user_id:st.user.id,barcode,product_name,brand,store_hint,notes}).select().single();
 if(error)return toast(error.code==='23505'?'Du hast dieses Produkt bereits vorgeschlagen.':'Vorschlag konnte nicht gespeichert werden: '+error.message.slice(0,95));
 st.requests=[data,...st.requests];closeOverlay('modalOverlay');render();toast('Vielen Dank! Dein Produkt ist jetzt in der Prüfwarteschlange ♡');
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
 const colors={S:'#c8e881',A:'#d8ebac',B:'#d0e8e8',C:'#f3dfae',D:'#f2c3bb',F:'#e4a2a2'};
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
 let zone=el.closest?.('.tier-dropzone,.board-tray,.not-tried-dropzone');
 if(!zone){const lane=el.closest?.('.tier-lane');zone=lane?.querySelector('.tier-dropzone')}
 return zone||null;
}
function boardInsertionIndex(zone,x,y,id){
 if(!zone||zone.dataset.dropTier==='unranked'||zone.dataset.dropTier==='not_tried')return 0;
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
 if(boardDrag.holdTimer)clearTimeout(boardDrag.holdTimer);
 boardDrag.ghost?.remove();
 boardDrag.source?.classList.remove('drag-active');
 cleanDragIndicator();boardDrag=null;
}
function beginBoardDrag(d){
 if(!d||d.started||boardDrag!==d)return;
 d.started=true;if(d.holdTimer)clearTimeout(d.holdTimer);
 const rect=d.source.getBoundingClientRect();
 d.ghost=d.source.cloneNode(true);d.ghost.classList.add('drag-ghost');d.ghost.setAttribute('aria-hidden','true');
 d.ghost.style.width=rect.width+'px';d.ghost.style.height=rect.height+'px';
 d.source.classList.add('drag-active');
 d.offsetX=Math.min(rect.width,Math.max(10,d.startX-rect.left));
 d.offsetY=Math.min(rect.height,Math.max(10,d.startY-rect.top));
 document.body.appendChild(d.ghost);
 suppressBoardClickUntil=Date.now()+600;
}
document.addEventListener('pointerdown',e=>{
 const el=e.target.closest?.('[data-drag-id]');
 if(!el||st.view!=='board'||e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0)||st.boardBusy)return;
 const d={id:el.dataset.dragId,source:el,pointerId:e.pointerId,pointerType:e.pointerType,startX:e.clientX,startY:e.clientY,started:false,ghost:null,targetTier:null,targetIndex:0,dropZone:null,holdTimer:null};
 boardDrag=d;
 // Touch requires a deliberate long press; an immediate swipe stays normal tray/page scrolling.
 if(e.pointerType!=='mouse')d.holdTimer=setTimeout(()=>beginBoardDrag(d),240);
},{passive:true});
document.addEventListener('pointermove',e=>{
 const d=boardDrag;
 if(!d||e.pointerId!==d.pointerId)return;
 const travel=Math.hypot(e.clientX-d.startX,e.clientY-d.startY);
 if(!d.started){
  if(d.pointerType!=='mouse'){
   if(travel>11){cancelBoardDrag();return}
   return;
  }
  if(travel<7)return;
  beginBoardDrag(d);
 }
 if(!d.started)return;
 e.preventDefault();
 d.ghost.style.left=(e.clientX-d.offsetX)+'px';d.ghost.style.top=(e.clientY-d.offsetY)+'px';
 // Gently scroll long boards while dragging; works for desktop and touch.
 if(e.clientY<80)window.scrollBy?.(0,-15);
 else if(e.clientY>window.innerHeight-90)window.scrollBy?.(0,15);
 cleanDragIndicator();
 const zone=boardDropTarget(e.clientX,e.clientY);
 d.dropZone=zone;d.targetTier=zone?.dataset.dropTier||null;
 if(!zone)return;
 zone.setAttribute('data-drag-hover','1');
 d.targetIndex=boardInsertionIndex(zone,e.clientX,e.clientY,d.id);
 if(d.targetTier==='unranked'||d.targetTier==='not_tried')return;
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

function duoImageFallback(img,why){
 const parent=img.closest('.duo-hero-photo');
 if(!parent)return;
 img.hidden=true;duoPhotoBroken.add(st.duo.mode==='remote'?st.duo.room?.current_product_id:st.duo.local.productId);
 const note=document.createElement('div');note.className='duo-photo-problem';
 note.textContent='Foto nicht in ausreichend guter Qualität verfügbar ('+why+'). Bitte Bildquelle prüfen, bevor ihr dieses Produkt bewertet.';
 parent.appendChild(note);
 const retry=document.createElement('button');retry.className='button button-lime button-small';retry.dataset.action='duo-skip-photo';retry.textContent='Anderes Produkt mit gutem Foto ↗';parent.appendChild(retry);
}
document.addEventListener('error',e=>{
 const img=e.target;if(img?.dataset?.duoImage!=='true')return;
 const fallback=img.dataset.fallback;
 if(fallback&&img.src!==fallback){img.dataset.fallback='';img.src=fallback;return}
 duoImageFallback(img,'Quelle nicht erreichbar');
},true);
document.addEventListener('load',e=>{
 const img=e.target;if(img?.dataset?.duoImage!=='true')return;
 if(img.naturalWidth<450||img.naturalHeight<450)duoImageFallback(img,'zu geringe Auflösung');
},true);

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
  const next=e.key==='ArrowUp'?(idx<0?'F':TIERS[Math.max(0,idx-1)]):(idx<0?'S':TIERS[Math.min(TIERS.length-1,idx+1)]);
  boardMove(id,next,boardSorted(next,id).length);
 }else if(old){
  const peers=boardSorted(old.tier).map(x=>x.product_id);
  const target=Math.min(peers.length-1,Math.max(0,peers.indexOf(id)+(e.key==='ArrowLeft'?-1:1)));
  if(target!==peers.indexOf(id))boardMove(id,old.tier,target);
 }
});

function renderDiscover(){
 const a=filteredProducts();
 return head('GOOD THINGS / DISCOVER','Find your next <em>favourite.</em>','S–F tier lists built from ingredient-eligible candidates. Photo matches are sourced, and uncertain claims remain unverified.',a.length+' THINGS')
 +'<div class="inline-notice">✳ <strong>Care over certainty:</strong> '+RANKABLE.length+' Produktkandidaten, davon '+(RANKABLE.length-ORIGINAL_RANKABLE.length)+' mit Barcode, Community-Packshot und Nährwertdaten. Das ist keine garantierte Vegan-Zertifizierung. Rezepturen und Packungen können sich ändern. <button class="navlink" style="display:inline;text-decoration:underline" data-action="view-exclusions">'+FLAGGED.length+' dairy-containing products excluded ↗</button></div>'
 +'<div class="inline-notice" style="background:#ecf4d5"><strong>Produkt fehlt? ✳</strong> Schlage es mit Barcode vor. Wir prüfen Sorte und Foto vor der Aufnahme. <button class="navlink" data-action="suggest-product" style="display:inline;text-decoration:underline">Produkt vorschlagen ↗</button> · <a href="./lookup.html">Barcode-Detektiv ↗</a></div>'
 +'<div class="toolbar"><label class="search"><span aria-hidden="true">⌕</span><input type="search" id="productSearch" placeholder="Search brands, products and stores…" autocomplete="off" aria-label="Search products" value="'+attr(st.query)+'"></label>'
 +'<select id="storeSelect" class="control" aria-label="Select store">'+['all',...new Set(RANKABLE.map(p=>String(p.store||'').toUpperCase()))].map(x=>'<option value="'+x+'" '+(String(st.store).toUpperCase()===x?'selected':'')+'>'+(x==='all'?'Alle Händler':esc(STORE_NAMES[x]||x))+'</option>').join('')+'</select>'
 +'<select id="sortSelect" class="control" aria-label="Sort products"><option value="name" '+(st.sort==='name'?'selected':'')+'>By name</option><option value="brand" '+(st.sort==='brand'?'selected':'')+'>By brand</option><option value="rated" '+(st.sort==='rated'?'selected':'')+'>My favourites first</option><option value="protein" '+(st.sort==='protein'?'selected':'')+'>Protein je 100 g ↓</option></select><select id="catalogStatusFilter" class="control" aria-label="Filter by tried status"><option value="all">All statuses</option><option value="rated" '+(st.catalogStatus==='rated'?'selected':'')+'>✓ Rated</option><option value="not_tried" '+(st.catalogStatus==='not_tried'?'selected':'')+'>◌ Not tried yet</option><option value="unanswered" '+(st.catalogStatus==='unanswered'?'selected':'')+'>Unanswered</option></select></div>'
 +'<div class="gap12" style="margin-bottom:14px"><label class="toggle"><input id="catalogPhotoFilter" type="checkbox" '+(st.catalogPhotoFilter?'checked':'')+'> Nur echte Packshots ('+RANKABLE.filter(matchedPhoto).length+')</label><span class="small muted">Fehlende Fotos: '+RANKABLE.filter(p=>!matchedPhoto(p)).length+' · Filter deaktivieren, um alle zu sehen</span></div><label class="toggle" style="margin-bottom:13px"><input id="highProteinOnly" type="checkbox" '+(st.highProtein?'checked':'')+'> 💪 Mindestens 15 g Protein pro 100 g/ml (nur Artikel mit Nährwertangabe)</label><div class="chips" aria-label="Categories"><button class="chip '+(st.category==='all'?'active':'')+'" data-action="set-category" data-id="all">✳ All '+RANKABLE.length+'</button>'+GROUPS.map(g=>'<button class="chip '+(st.category===g.id?'active':'')+'" data-action="set-category" data-id="'+attr(g.id)+'">'+esc(g.emoji)+' '+esc(g.label)+' <small>'+RANKABLE.filter(p=>p.category_id===g.id).length+'</small></button>').join('')+'</div>'
 +'<div class="spaced" style="margin-bottom:15px"><span class="filter-summary" id="resultCount">'+a.length+' products · '+gradedRatings().length+' graded · '+notTriedRatings().length+' not tried</span><span class="small muted">Unanswered means no selection</span></div>'
 +'<div id="productResults">'+(a.length?'<div class="product-grid">'+a.map(productCard).join('')+'</div>':empty('⌕','No matches','Try another brand, category or search term.'))+'</div>';
}
function ourPreview(){
 const curatorByRole={mikel:st.curators.find(c=>c.role==='mikel')?.user_id,huong:st.curators.find(c=>c.role==='huong')?.user_id};
 const ready=Boolean(curatorByRole.mikel&&curatorByRole.huong);
 const published=ready&&st.ourMode!=='demo';
 const toMap=who=>Object.fromEntries(st.allRatings.filter(r=>r.user_id===curatorByRole[who]&&r.is_public&&isGraded(r)).map(r=>[r.product_id,r]));
 const a=published?toMap('mikel'):st.guest.mikel;
 const b=published?toMap('huong'):st.guest.huong;
 const ids=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(id=>getProduct(id)&&isGraded(a[id]||b[id]));
 return {a,b,ids,published,ready,curatorByRole,both:ids.filter(id=>isGraded(a[id])&&isGraded(b[id])),agree:ids.filter(id=>isGraded(a[id])&&isGraded(b[id])&&a[id].tier===b[id].tier)};
}
function tierMiniCards(who,ratings,published){
 const arr=Object.entries(ratings||{}).filter(([id,r])=>getProduct(id)&&isGraded(r)).sort((x,y)=>TIER_SCORE[y[1].tier]-TIER_SCORE[x[1].tier]);
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
 +'<div class="stat-row"><div><strong>'+Object.values(m.a).filter(isGraded).length+'</strong><span>Mikel’s '+(m.published?'public reviews':'preview picks')+'</span></div><div><strong>'+Object.values(m.b).filter(isGraded).length+'</strong><span>Huong’s '+(m.published?'public reviews':'preview picks')+'</span></div><div><strong>'+m.agree.length+'/'+m.both.length+'</strong><span>Matching ratings</span></div></div>'
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
function notTriedRows(arr){
 return arr.filter(r=>rankableProduct(getProduct(r.product_id))).sort((a,b)=>getProduct(a.product_id).name.localeCompare(getProduct(b.product_id).name,'de')).map(r=>{
  const p=getProduct(r.product_id);
  return '<div class="rating-item not-tried-item"><div class="product-tile">'+esc(p.emoji)+'</div><div><h4>'+esc(p.brand+' · '+p.name)+'</h4><small>◌ Not tried yet · answered · no grade · private</small></div><button class="button button-small button-ghost" data-action="open-product" data-id="'+attr(p.id)+'">Tried it? Rate ↗</button></div>';
 }).join('');
}
function renderMy(){
 const arr=gradedRatings(),untried=notTriedRatings();
 const completed=Math.min(arr.length,5);
 const welcome=st.user?'<div class="inline-notice">✓ Synced to your account. Public ratings appear in the community; private ratings are visible only to you.</div>':'<div class="inline-notice">♧ Guest shelf · Ratings below are stored only on this device. <button class="navlink" data-action="open-auth" style="display:inline;text-decoration:underline">Make an account</button> to keep a separate, synced shelf across devices.</div>';
 return head('GOOD THINGS / YOUR SHELF','Your taste.<br><em>Your rules.</em>','No one else decides what deserves an S — or an F. Start a shelf, give it character and share only what you choose.',arr.length+' GRADES · '+untried.length+' NOT TRIED')
 +welcome
 +'<div class="profile-banner"><div class="person"><div class="avatar '+(st.profile?.accent||'lime')+'" style="width:72px;height:72px;font-size:30px">'+esc(yourInitials().substring(0,1).toUpperCase())+'</div><div><div class="eyebrow">YOUR CORNER OF GOOD THINGS</div><h3>'+esc(yourInitials())+'</h3><p class="small muted" style="margin:3px 0">'+(st.profile?'@'+esc(st.profile.handle):'Create your own taste universe')+'</p></div></div><button class="button button-small button-white" data-action="'+(st.user?'edit-profile':'open-auth')+'">'+(st.user?'Edit profile ↗':'Join ↗')+'</button></div>'
 +'<div class="callout"><div class="spaced"><div><div class="eyebrow">FIRST FIVE CHALLENGE</div><h3>'+((completed===5)?'Five out of five! ✳':'Five little discoveries.')+'</h3><p>'+((completed===5)?'You did it. Your shelf is officially growing.':'Rate '+(5-completed)+' more product'+(5-completed===1?'':'s')+' to finish your first challenge.')+'</p></div><strong style="font:600 40px Fraunces,serif">'+completed+'/5</strong></div><div class="challenge-bar">'+[0,1,2,3,4].map(i=>'<span class="'+(i<completed?'filled':'')+'"></span>').join('')+'</div></div>'
 +'<div class="spaced" style="margin:20px 0 12px"><h3 style="font:600 30px Fraunces,serif;margin:0">What you have tasted ('+arr.length+')</h3><div class="gap12"><button class="button button-small button-ghost" data-action="import-json">Import ↑</button><button class="button button-small button-ghost" data-action="export-json">Export JSON ↓</button><button class="button button-small button-lime" data-action="share-shelf">Share ↗</button></div></div>'
 +(arr.length?'<div class="rating-list">'+ratingRows(arr)+'</div>':empty('✳','No graded products yet','Products you have not tasted can be marked separately without inventing a grade.','<button class="button button-lime" data-nav="board">Open the tier board ↗</button>'))
 +'<div class="surface not-tried-shelf-list" style="margin-top:18px"><div class="spaced"><div><h3>◌ Not tried yet ('+untried.length+')</h3><p>These are answered without a grade. They stay off your S–F tier list and public taste statistics.</p></div><button class="button button-small button-ghost" data-nav="board">Open board ↗</button></div>'+(untried.length?'<div class="rating-list">'+notTriedRows(untried)+'</div>':'<p class="small muted">No products marked yet. Tap an unfamiliar item and choose Not tried yet.</p>')+'</div>'
 +'<div class="surface" style="margin-top:18px"><div class="spaced"><div><h3>Make a collection</h3><p>Give your favourites a name and share a beautiful shortlist. Public collections are visible to anyone with the link.</p></div><button class="button button-dark button-small" data-action="create-list">+ New list</button></div>'
 +(st.user&&st.lists.filter(l=>l.user_id===st.user.id).length?st.lists.filter(l=>l.user_id===st.user.id).map(l=>'<div class="review-row"><div style="flex:1"><h4>'+esc(l.title)+'</h4><p>'+l.product_ids.length+' picks · '+(l.is_public?'Public':'Private')+'</p></div><button class="button button-small button-ghost" data-action="share-list" data-id="'+attr(l.id)+'">Open ↗</button></div>').join(''):'<p class="small muted">No collections yet. Your first one could be “The snack drawer of dreams”.</p>')+'</div>'

 +'<div class="surface" style="margin-top:18px"><div class="spaced"><div><h3>Neue Produkte entdecken</h3><p>Ein Produkt fehlt? Schlage es per EAN und Marke vor. Dein Vorschlag bleibt bis zur Prüfung privat.</p></div><button class="button button-small button-lime" data-action="suggest-product">+ Vorschlagen</button></div>'
 +(st.requests.length?st.requests.slice(0,8).map(r=>'<div class="review-row"><div style="flex:1"><h4>'+esc(r.brand+' · '+r.product_name)+'</h4><p>EAN '+esc(r.barcode)+' · '+esc(r.store_hint||'Händler unbekannt')+'</p></div><span class="fact-tag">'+esc(r.status==='approved'?'Geprüft':r.status==='rejected'?'Nicht aufgenommen':'In Prüfung')+'</span></div>').join(''):'<p class="small muted">Noch keine eigenen Produktvorschläge.</p>')+'</div>'

 +(!st.user&&Object.keys(st.guest.you).length?'<div class="small muted" style="margin-top:18px">Tip: after signing in, you can transfer your guest ratings to your account from Edit profile.</div>':'');
}
function scoreFor(userId){
 const mine=gradedRatings();
 const theirs=st.allRatings.filter(r=>r.user_id===userId&&r.is_public&&isGraded(r));
 const common=mine.filter(r=>theirs.some(t=>t.product_id===r.product_id));
 if(!common.length)return {n:0,score:null};
 return {n:common.length,score:Math.round(100*common.reduce((sum,r)=>sum+(1-Math.abs(TIER_SCORE[r.tier]-TIER_SCORE[theirs.find(t=>t.product_id===r.product_id).tier])/(TIERS.length-1)),0)/common.length)};
}
function publicRated(){return st.allRatings.filter(r=>r.is_public&&isGraded(r)&&rankableProduct(getProduct(r.product_id)))}
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
 +(rank.length?rank.map(x=>{const p=getProduct(x.id);return '<div class="review-row"><span style="font-size:27px">'+esc(p.emoji)+'</span><div style="flex:1"><h4>'+esc(p.name)+'</h4><p>'+esc(p.brand)+' · '+x.n+' rating'+(x.n===1?'':'s')+'</p></div><strong>'+x.score.toFixed(1)+'/6</strong></div>'}).join(''):'<p>No public ratings yet. Be the first to try something.</p>')+'</div><div class="surface"><h3>Fresh from the shelves</h3>'+recentActivity()+'</div></div>';
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
 if(st.view==='duo')content.innerHTML=renderDuo();
 else if(st.view==='board')content.innerHTML=renderBoard();
 else if(st.view==='ours')content.innerHTML=renderOurs();
 else if(st.view==='my')content.innerHTML=renderMy();
 else if(st.view==='community')content.innerHTML=renderCommunity();
 else if(st.view==='shared')content.innerHTML=renderShared();
 else if(st.view==='profile')content.innerHTML=renderProfileView();
 else if(st.view==='list')content.innerHTML=renderListView();
 else content.innerHTML=renderDiscover();
 $$('[data-nav]').forEach(n=>n.classList.toggle('active',n.dataset.nav===st.view));
 const num=gradedRatings().length;
 $('#myCount').textContent=String(selfRatings().length);
 $('#communityCount').textContent=String(st.profiles.length);
 $('#sidebarProgress').style.width=Math.min(num,5)*20+'%';
 $('#sidebarProgressText').textContent=Math.min(num,5)+' / 5 rated';
 if($('#catalogHeroCount'))$('#catalogHeroCount').textContent=String(RANKABLE.length);
 if($('#catalogHeroGroups'))$('#catalogHeroGroups').textContent=String(GROUPS.length);
 if($('#catalogNavCount'))$('#catalogNavCount').textContent=String(RANKABLE.length);
 $('#authStatus').innerHTML=st.user?'<span class="dot"></span> '+esc(st.profile?.handle?'@'+st.profile.handle:'Signed in'):st.cloud==='offline'?'<span class="dot" style="background:#deb075"></span> Demo mode':'<span class="dot"></span> Local tasting shelf';
 $('#authButton').textContent=st.user?'My account ↗':'Join the shelf ↗';
 $('#authButton').dataset.action=st.user?'edit-profile':'open-auth';
}
function refreshProducts(){
 const a=filteredProducts();
 if($('#productResults'))$('#productResults').innerHTML=a.length?'<div class="product-grid">'+a.map(productCard).join('')+'</div>':empty('⌕','No matches','Try another category or remove your filter.');
 if($('#resultCount'))$('#resultCount').textContent=a.length+' products · '+gradedRatings().length+' graded · '+notTriedRatings().length+' not tried';
}

// ---- Traceable per-barcode nutrition, store discovery and dated price evidence ----
const priceMemory=new Map(),nutritionMemory=new Map();
const decimals=v=>Number.isFinite(v)?new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(v):'—';
function nutritionData(p){return p?.nutrition||nutritionMemory.get(p?.barcode)||null}
function nutritionPanel(p){
 const n=nutritionData(p),source=validUrl(p.nutrition_source_url||((p.barcode&&'https://world.openfoodfacts.org/product/'+p.barcode)||''));
 if(!n)return '<div class="product-info-empty">Noch keine eindeutig zugeordneten Nährwerte. Für diesen alten Katalogeintrag brauchen wir den passenden Barcode (EAN/GTIN).</div>';
 const rows=[['Energie',n.kcal,'kcal'],['Protein',n.protein,'g'],['Kohlenhydrate',n.carbs,'g'],['davon Zucker',n.sugar,'g'],['Fett',n.fat,'g'],['davon gesättigt',n.satFat,'g'],['Ballaststoffe',n.fiber,'g'],['Salz',n.salt,'g']];
 return '<div class="nutrition-grid">'+rows.map(([name,v,unit])=>'<div class="nutrition-cell '+(name==='Protein'?'protein-highlight':'')+'"><span>'+name+'</span><strong>'+decimals(v)+' '+(Number.isFinite(v)?unit:'')+'</strong></div>').join('')+'</div>'+
 '<p class="facts-footnote">Angaben laut Community-Datenbank, pro 100 g bzw. 100 ml (wie dort erfasst). Packungswerte haben Vorrang. '+(source?'<a target="_blank" rel="noopener noreferrer" href="'+attr(source)+'">Nährwertquelle ↗</a>':'')+'</p>';
}
function shoppingPanel(p){
 const store=String(p.store||'').toUpperCase(),storeLink=STORE_URLS[store],sellerLabel=STORE_NAMES[store]||p.store;
 const productUrl=validUrl(p.source_url||'');
 const sourced=String(p.stores_reported||'').trim();
 return '<div class="shopping-sources">'+
 '<div class="shop-option"><span>🛒</span><div><strong>'+esc(sellerLabel)+'</strong><small>'+(p.source_type==='openfoodfacts'?'Als möglicher Kaufort gemeldet – Filialbestand nicht bestätigt.':'Im Ursprungskatalog zugeordneter Händler. Verfügbarkeit ortsabhängig.')+'</small></div>'+(storeLink?'<a href="'+attr(storeLink)+'" target="_blank" rel="noopener noreferrer">Shop ↗</a>':'')+'</div>'+
 (sourced?'<div class="small muted" style="margin-top:8px">Weitere Community-Händlerangaben: '+esc(sourced.slice(0,160))+'</div>':'')+
 (productUrl?'<a class="small" style="display:inline-block;margin-top:10px" target="_blank" rel="noopener noreferrer" href="'+attr(productUrl)+'">Produktdaten / ursprüngliche Quelle ansehen ↗</a>':'')+
 '</div>';
}
function pricePanel(p){
 if(!p.barcode)return '<p class="small muted">Kein belegter Preis: Für diesen Katalogeintrag fehlt der eindeutige Produktbarcode. Händlerpreise variieren nach Standort und Datum.</p>';
 const result=priceMemory.get(p.barcode);
 if(result==='loading')return '<p class="small muted">Suche nach belegten, datierten Ladenpreisen …</p>';
 if(!result||!result.price)return '<p class="small muted">Zurzeit kein überprüfbarer EUR-Preis für diese EAN erfasst. Das bedeutet nicht, dass das Produkt kostenlos oder nicht erhältlich ist.</p><a href="https://prices.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" class="small">Open Prices ↗</a>';
 return '<div class="observed-price"><strong>'+decimals(result.price).replace(/(\d)$/,'$1')+' €</strong><div><b>Beobachteter Preis, nicht Live-Angebot</b><small>'+esc(result.store)+' · '+esc(result.date)+' · '+esc(result.city||'Deutschland')+'</small><a target="_blank" rel="noopener noreferrer" href="'+attr(result.source)+'">Preisnachweis ↗</a></div></div>';
}
function productFacts(p){
 return '<hr class="rule"><section class="product-facts"><div class="eyebrow">PRODUKT-CHECK / INHALTSSTOFFE</div><div class="spaced"><h3>Nährwerte</h3><span class="fact-tag">'+esc(p.quantity||'je 100 g/ml')+'</span></div><div id="gtNutritionInfo">'+nutritionPanel(p)+'</div>'+
 '<div class="spaced" style="margin-top:21px"><h3>Wo kaufen?</h3><span class="fact-tag">Händlerhinweise</span></div>'+shoppingPanel(p)+
 '<div class="spaced" style="margin-top:24px"><h3>Preis</h3><span class="fact-tag">Nur belegte Werte</span></div><div id="gtPriceInfo">'+pricePanel(p)+'</div></section>';
}
async function loadNutrition(p){
 if(!p.barcode||p.nutrition||nutritionMemory.has(p.barcode)||!window.fetch)return;
 try{
  const url='https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(p.barcode)+'.json?fields=code,nutriments';
  const res=await fetch(url,{headers:{Accept:'application/json'}});
  if(!res.ok)return;
  const data=await res.json();if(data.status!==1||String(data.code)!==String(p.barcode))return;
  const n=data.product?.nutriments||{},safe=v=>Number.isFinite(v)&&v>=0&&v<10000?Math.round(v*100)/100:null;
  const facts={kcal:safe(n['energy-kcal_100g']),protein:safe(n.proteins_100g),carbs:safe(n.carbohydrates_100g),sugar:safe(n.sugars_100g),fat:safe(n.fat_100g),satFat:safe(n['saturated-fat_100g']),fiber:safe(n.fiber_100g),salt:safe(n.salt_100g)};
  if(facts.kcal===null&&facts.protein===null)return;
  nutritionMemory.set(p.barcode,facts);
  if(st.selected===p.id&&$('#gtNutritionInfo'))$('#gtNutritionInfo').innerHTML=nutritionPanel(p);
 }catch(_){}
}
async function loadPrice(p){
 if(!p.barcode||priceMemory.has(p.barcode)||!window.fetch)return;
 priceMemory.set(p.barcode,'loading');
 try{
  const url='https://prices.openfoodfacts.org/api/v1/prices?product_code='+encodeURIComponent(p.barcode)+'&size=15&order_by=-date';
  const res=await fetch(url,{headers:{Accept:'application/json'}});
  if(!res.ok)throw Error('unavailable');
  const data=await res.json();const current=new Date();
  const prices=(data.items||[]).filter(x=>x?.type==='PRODUCT'&&x.currency==='EUR'&&Number.isFinite(x.price)&&x.price>0&&x.price<500&&x.location?.osm_address_country_code==='DE'&&/^\d{4}-\d\d-\d\d$/.test(String(x.date||''))&&new Date(x.date)<=current).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const x=prices[0];
  priceMemory.set(p.barcode,x?{price:x.price,date:x.date,store:x.location.osm_brand||x.location.osm_name||'Händler',city:x.location.osm_address_city||'',source:'https://prices.openfoodfacts.org/api/v1/prices/'+x.id}:null);
 }catch(_){priceMemory.set(p.barcode,null)}
 if(st.selected===p.id&&$('#gtPriceInfo'))$('#gtPriceInfo').innerHTML=pricePanel(p);
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
 +(isNotTried(r)?'<div class="not-tried-pill">◌ Already answered: Not tried yet · no grade</div>':'')+'<div class="field"><label>What does '+esc(name)+' think?</label><div class="tier-picker" id="tierPicker">'+TIERS.map(t=>'<button class="tier '+(st.draftTier===t?'active':'')+'" data-tier="'+t+'" style="--tiercolor:'+({S:'#dcec8d',A:'#c6e6b4',B:'#c9e9f8',C:'#ffdfb0',D:'#f4bcbc',F:'#e99898'}[t])+'" data-action="select-tier" data-value="'+t+'">'+t+'</button>').join('')+'</div><span class="hint">S = obsessed · A = great · B = good · C = okay · D = disappointing · F = Durchgefallen</span></div>'
 +'<div class="field"><label for="ratingNote">Your 200-character tasting note</label><textarea class="control" id="ratingNote" rows="3" maxlength="200" placeholder="Creamy, smoky, truly magical…">'+esc(st.draftNote)+'</textarea></div>'
 +(st.user?'<label class="toggle" style="margin-bottom:19px"><input type="checkbox" id="ratingPublic" '+(st.draftPublic?'checked':'')+'> Share this rating publicly with the community</label>':'<p class="small muted">Guest ratings stay in this browser; they are not community reviews.</p>')
 +'<button class="not-tried-choice '+(isNotTried(r)?'selected':'')+'" data-action="mark-not-tried" data-id="'+attr(p.id)+'"><span>◌</span><span><strong>Not tried yet</strong><small>Save an answer without a tier grade</small></span><span>↗</span></button><div class="gap12"><button class="button button-lime" data-action="save-rating" data-id="'+attr(p.id)+'">Save my rating ♡</button>'+(r?'<button class="button button-ghost button-small" data-action="delete-rating">Remove rating</button>':'')+'</div>'
 +productFacts(p)
 +'<hr class="rule"><h3>See the real product</h3><p class="small muted">Catalog variants are candidates. Compare store listings and packaging before treating an item as verified.</p><div class="gap12">'
 +'<a class="button button-ghost button-small" href="'+attr(validUrl(p.source_url))+'" target="_blank" rel="noopener noreferrer">Check '+esc(p.store)+' ↗</a>'
 +'<a class="button button-lime button-small" href="./lookup.html?catalog='+encodeURIComponent(p.id)+'">Check exact barcode ↗</a><button class="button button-ghost button-small" data-action="report-photo">Wrong / missing image?</button>'
 +(!matchedPhoto(p)?'<button class="button button-white button-small" data-action="lookup-image">Find possible photo ⌕</button>':'<a class="button button-white button-small" target="_blank" rel="noopener noreferrer" href="'+attr(validUrl(p.image_source_url||p.source_url))+'">Photo source ↗</a>')+'</div><p class="small muted" id="photoHint">Images are only shown when a plausible Open Food Facts match can be found, and remain labelled unverified until checked.</p>';
}
function openProduct(id,tier,persona){
 if(!rankableProduct(getProduct(id)))return toast('This product contains animal ingredients under its current recipe and is excluded from the vegan tier list.');
 st.selected=id;if(persona)st.persona=persona;
 const r=st.user?accountRating(id):guestRating(id,st.persona);
 st.draftTier=tier||r?.tier||'';st.draftNote=r?.note||'';st.draftPublic=r?.is_public===true;
 $('#drawer').innerHTML=drawerHtml();openOverlay('drawerOverlay');
 loadNutrition(getProduct(id));loadPrice(getProduct(id));
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
  const prior=accountRating(product_id);const obj={user_id:st.user.id,product_id,status:'rated',tier:st.draftTier,note,is_public:st.draftPublic,position:prior?.tier===st.draftTier?(Number(prior.position)||0):boardNextPosition(st.draftTier,product_id),updated_at:new Date().toISOString()};
  const {error}=await sb.from('gt_ratings').upsert(obj,{onConflict:'user_id,product_id'});
  if(error)return toast('Could not save: '+error.message);
  st.allRatings=st.allRatings.filter(r=>!(r.user_id===st.user.id&&r.product_id===product_id));st.allRatings.push(obj);
 }else{
  const prior=st.guest[st.persona][product_id];st.guest[st.persona][product_id]={status:'rated',tier:st.draftTier,note,is_public:st.draftPublic,position:prior?.tier===st.draftTier?(Number(prior.position)||0):boardNextPosition(st.draftTier,product_id)};persist();
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

function reportPhotoModal(){
 const p=getProduct(st.selected);if(!p)return;
 if(!st.user)return openAuth();
 modal('<button class="close" data-action="close-modal" aria-label="Close">×</button><div class="eyebrow">PHOTO DETECTIVE / COMMUNITY</div><h2>Help us get it right.</h2><p>'+esc(p.brand)+' · '+esc(p.name)+'</p><p class="small muted">Your report is private. Nothing changes publicly until we independently check the evidence and update the catalogue.</p>'+
  '<form id="photoReportForm"><div class="field"><label>What is wrong?</label><select class="control" name="issue" required><option value="wrong_image">Wrong product photo</option><option value="old_packaging">Outdated packaging</option><option value="missing_photo" '+(!matchedPhoto(p)?'selected':'')+'>No real photograph</option><option value="wrong_variant">Wrong variant or size</option></select></div>'+
  '<div class="field"><label>Correct source URL (optional)</label><input class="control" type="url" name="suggested_url" placeholder="https://official-brand.example/product" maxlength="500"></div>'+
  '<div class="field"><label>What should we verify?</label><textarea class="control" rows="3" name="note" maxlength="400" placeholder="Barcode, pack size, which detail looks wrong…"></textarea></div>'+
  '<button class="button button-lime" type="submit">Submit correction ♡</button></form>');
}
async function submitPhotoReport(form){
 if(!st.user||!sb)return openAuth();
 const issue=form.elements.namedItem('issue').value,url=form.elements.namedItem('suggested_url').value.trim(),note=form.elements.namedItem('note').value.trim();
 if(!['wrong_image','old_packaging','missing_photo','wrong_variant'].includes(issue))return toast('Choose what needs correcting.');
 if(url&&!validUrl(url))return toast('Only HTTPS source links are supported.');
 const row={reporter_id:st.user.id,product_id:st.selected,issue,suggested_url:url,note};
 const {error}=await sb.from('gt_photo_reports').upsert(row,{onConflict:'reporter_id,product_id'});
 if(error)return toast('Could not submit photo report: '+error.message.slice(0,110));
 closeOverlay('modalOverlay');toast('Thank you! The correction is queued for human review ♡');
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
function openAuth(mode){if(st.user)return openProfileEdit();if(!sb)return modal('<button class="close" data-action="close-modal">×</button><h2>Demo shelf is ready</h2><p>Live accounts could not connect. You can still explore our product catalogue and use the local tasting shelf.</p><button class="button button-lime" data-action="close-modal">Continue exploring</button>');modal(authHtml(mode||'signup'))}
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
 const entries=Object.entries(st.guest.you).filter(([id,r])=>rankableProduct(getProduct(id))&&(isGraded(r)||isNotTried(r)));
 if(!entries.length)return toast('No guest ratings to import.');
 const rows=entries.map(([product_id,r])=>({user_id:st.user.id,product_id,status:isNotTried(r)?'not_tried':'rated',tier:isNotTried(r)?null:r.tier,note:r.note||'',position:isNotTried(r)?0:Number(r.position)||0,is_public:!isNotTried(r)&&r.is_public===true}));
 const {error}=await sb.from('gt_ratings').upsert(rows,{onConflict:'user_id,product_id'});
 if(error)return toast('Import failed: '+error.message);
 st.guest.you={};persist();await loadRemote();closeAll();toast(rows.length+' guest ratings moved into your account ♡');
}
function openListModal(){
 if(!st.user)return openAuth();
 if(!st.profile)return openProfileEdit();
 if(!gradedRatings().length)return toast('Rate a product before making a list.');
 modal('<button class="close" data-action="close-modal">×</button><div class="eyebrow">MAKE A LITTLE COLLECTION</div><h2>Give it a name.</h2><p class="small muted">A public link can be shared with friends. Your list will include your first 40 rated products (products only; private tasting notes are never copied).</p>'
 +'<form id="listForm"><div class="field"><label>Collection name</label><input class="control" name="title" placeholder="The snack drawer of dreams" maxlength="70" minlength="2" required></div>'
 +'<div class="field"><label>Short introduction</label><textarea class="control" name="description" maxlength="240" rows="3" placeholder="A few discoveries worth making space for."></textarea></div>'
 +'<label class="toggle"><input type="checkbox" name="is_public" checked> Public to people with the link</label><div style="margin-top:20px"><button class="button button-lime" type="submit">Create collection ↗</button></div></form>');
}
function slug(s){return String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,47)||'good-picks'}
async function saveList(form){
 if(!st.user)return;
 const title=form.elements.namedItem('title').value.trim(),description=form.elements.namedItem('description').value.trim(),product_ids=gradedRatings().slice(0,40).map(r=>r.product_id);
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
 const own=gradedRatings().filter(r=>rankableProduct(getProduct(r.product_id)));
 if(!own.length)return toast('Rate something first to share a shelf.');
 copyLink(snapshotUrl(own));
}

function canonical(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'')}
function importTier(value){
 if(value&&typeof value==='object'&&value.status==='not_tried')return 'not_tried';
 const v=typeof value==='object'&&value?value.tier||value.rating||value.value:value;
 const tier=String(v||'').trim().toUpperCase();return ['NOT_TRIED','NOT TRIED','NOT TRIED YET'].includes(tier)?'not_tried':TIERS.includes(tier)?tier:null;
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
   ['you',x.status==='not_tried'?{status:'not_tried',note:x.note}:x.tier??x.rating??x.my_rating]
  ];
  for(const [who,v] of ratings){
   const tier=importTier(v);if(!tier)continue;
   const note=typeof v==='object'&&v?String(v.note||'').slice(0,200):'';
   st.guest[who][product.id]={status:tier==='not_tried'?'not_tried':'rated',tier:tier==='not_tried'?null:tier,note,is_public:tier!=='not_tried',position:0};touched++;
  }
 }
 if(!touched)return toast('Matched '+rowsFound+' products, but no S–F grades or explicit not-tried answers. Your shelf is unchanged.');
 persist();render();toast('Imported '+touched+' ratings/answers from '+rowsFound+' matching products. Check before sharing.');
}

function exportJson(){
 const content={title:'GOOD THINGS',version:'1.5',exported_at:new Date().toISOString(),ratings:selfRatings().map(r=>({product_id:r.product_id,status:isNotTried(r)?'not_tried':'rated',tier:isNotTried(r)?null:r.tier,note:r.note,is_public:!isNotTried(r)&&r.is_public===true,position:isNotTried(r)?0:Number(r.position)||0}))};
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
 const [pr,ra,fo,li,cu,rq]=await Promise.all([
  sb.from('gt_profiles').select('id,handle,display_name,bio,accent,created_at').limit(400),
  sb.from('gt_ratings').select('user_id,product_id,tier,status,note,is_public,position,updated_at').order('updated_at',{ascending:false}).limit(3000),
  sb.from('gt_follows').select('follower_id,following_id,created_at').limit(3000),
  sb.from('gt_lists').select('id,user_id,title,slug,description,product_ids,is_public,created_at').limit(500),
  sb.from('gt_curators').select('role,user_id,verified_at').limit(2),
  st.user?sb.from('gt_product_requests').select('id,barcode,product_name,brand,store_hint,status,created_at').order('created_at',{ascending:false}).limit(50):Promise.resolve({data:[],error:null})
 ]);
 if(!pr.error){st.profiles=pr.data||[];st.profile=st.profiles.find(p=>p.id===st.user?.id)||null}
 if(!ra.error)st.allRatings=ra.data||[];
 if(!fo.error)st.follows=fo.data||[];
 if(!li.error)st.lists=li.data||[];
 if(!cu.error)st.curators=cu.data||[];
 if(!rq.error)st.requests=rq.data||[];
 const errors=[pr,ra,fo,li,cu,rq].filter(r=>r.error).map(r=>r.error.message);
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
  if(st.user){await duoLoadRooms();const requested=new URL(location.href).searchParams.get('room');if(requested)await duoOpenRoom(requested)}
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
 if(view==='duo'){st.view='duo';if(url.searchParams.get('room')){st.duo.mode='remote';st.duo.requestedRoom=url.searchParams.get('room')}return}
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
 case 'duo-mode-local':st.duo.mode='local';st.duo.room=null;st.duo.error='';setView('duo');break;
 case 'duo-mode-remote':st.duo.mode='remote';st.duo.room=null;st.duo.error='';await duoLoadRooms();setView('duo');break;
 case 'duo-start-local':await duoLocalStart(false);break;
 case 'duo-vote':if(st.duo.mode==='remote')await duoRemoteVote(val);else duoLocalVote(val);break;
 case 'duo-next-local':await duoLocalStart(true);break;
 case 'duo-next-remote':await duoNextRemote();break;
 case 'duo-copy-link':duoSharedLink();break;
 case 'duo-open-room':await duoOpenRoom(id);break;
 case 'duo-refresh':await duoRefresh();break;
 case 'duo-skip-photo':await duoSkipPhoto();break;
 case 'board-persona':if(!st.user&&['you','mikel','huong'].includes(val)){st.persona=val;st.boardHistory=[];render()}break;
 case 'board-pick':quickRank(id);break;
 case 'mark-not-tried':{const pid=id||st.selected;if(pid){const ok=await boardMove(pid,'not_tried',0);if(ok)closeOverlay('drawerOverlay')}break}
 case 'quick-rank':{const pid=st.boardModalProduct;if(pid){const ok=await boardMove(pid,val,boardSorted(val,pid).length);if(ok)closeOverlay('modalOverlay')}break}
 case 'quick-detail':{const pid=st.boardModalProduct;closeOverlay('modalOverlay');if(pid)openProduct(pid);break}
 case 'quick-unrank':{const pid=st.boardModalProduct;if(pid){const ok=await boardMove(pid,'unranked',0);if(ok)closeOverlay('modalOverlay')}break}
 case 'quick-not-tried':{const pid=st.boardModalProduct;if(pid){const ok=await boardMove(pid,'not_tried',0);if(ok)closeOverlay('modalOverlay')}break}
 case 'undo-board':await undoBoard();break;
 case 'reset-board':askResetBoard();break;
 case 'confirm-reset-board':await resetBoard();break;
 case 'export-board-png':await exportBoardPng();break;
 case 'open-photo-info':photoInformation();break;
 case 'suggest-product':openProductSuggestion();break;
 case 'share-board':shareBoard();break;
 case 'view-exclusions':viewExclusions();break;
 case 'board-unrank':await boardMove(id,'unranked',0);break;
 case 'lookup-image':await photoLookup();break;
 case 'report-photo':reportPhotoModal();break;
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
 if(e.target.id==='boardPhotoFilter'){st.boardPhotoFilter=e.target.value;refreshBoardTray()}
 if(e.target.id==='ratedOnly'){st.ratedOnly=e.target.checked;refreshProducts()}
 if(e.target.id==='highProteinOnly'){st.highProtein=e.target.checked;refreshProducts()}
 if(e.target.id==='catalogPhotoFilter'){st.catalogPhotoFilter=e.target.checked;refreshProducts()}
 if(e.target.id==='catalogStatusFilter'){st.catalogStatus=e.target.value;refreshProducts()}
 if(e.target.id==='ratingPublic')st.draftPublic=e.target.checked;
});
document.addEventListener('submit',async e=>{
 if(!['authForm','profileForm','listForm','feedbackForm','photoReportForm','productRequestForm','duoPartnerForm'].includes(e.target.id))return;
 e.preventDefault();
 try{
 if(e.target.id==='authForm')await submitAuth(e.target);
 if(e.target.id==='profileForm')await saveProfile(e.target);
 if(e.target.id==='listForm')await saveList(e.target);
 if(e.target.id==='feedbackForm')await submitFeedback(e.target);
 if(e.target.id==='photoReportForm')await submitPhotoReport(e.target);
 if(e.target.id==='productRequestForm')await submitProductSuggestion(e.target);
 if(e.target.id==='duoPartnerForm')await duoCreateRoom(e.target);
 }catch(err){toast('Error: '+String(err.message||err))}
});
$$('.overlay').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)closeOverlay(el.id)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){cancelBoardDrag();closeAll()}});
window.addEventListener('focus',()=>{if(st.user&&sb){loadRemote();if(st.view==='duo'&&st.duo.mode==='remote')duoRefresh()}});
if(typeof setInterval==='function')setInterval(()=>{if(st.view==='duo'&&st.duo.mode==='remote'&&st.user&&st.duo.room&&!(typeof document!=='undefined'&&document.hidden))duoRefresh()},8000);
window.addEventListener('popstate',()=>{openShareLink().then(render)});
(async()=>{
 if(RANKABLE.length<102||GROUPS.length<10)toast('Katalog unvollständig, bitte melden.');
 await openShareLink();render();await initCloud();await openShareLink();render();
 const requested=new URL(location.href).searchParams.get('product');if(requested&&getProduct(requested))openProduct(requested);
})();
})();