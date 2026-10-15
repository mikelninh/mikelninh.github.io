/* GOOD THINGS Awards · Personal picks only; community ballot deliberately not active. */
(function(){
'use strict';
const STORE='goodthings_awards_v1';
const defs=[
['golden','🏆','The Golden Fork','Ultimate favourite','One you would recommend to almost anyone.'],
['budget','💸','The Budget Banger','Best value','A personal value pick. Prices may vary.'],
['taste','🤤','Love at First Bite','Taste champion','The one that makes you stop talking.'],
['staple','🏡','The Fridge Resident','Essential staple','The thing you always buy again.'],
['guilty','😈','Guilty? Never.','Pure pleasure','No shame. Just snacks.'],
['power','🌱','The Plant Powerhouse','Nourishing pick','Nutritionally promising, not a medical claim.'],
['twist','✨','The Plot Twist','Surprise of the year','So much better than you expected.'],
['convert','🪄','The Vegan Converter','Crowd pleaser','Offer this to the curious and the sceptical.'],
['hero','🦸','The Everyday Hero','Kitchen lifesaver','Not flashy. Always there when needed.'],
['betrayal','💔','The Great Betrayal','Biggest disappointment','You had such high hopes.'],
['premium','👑','Worth Every Cent','Premium favourite','More expensive, still irresistible.'],
['gem','💎','Hidden Gem','Underrated discovery','Why is nobody talking about this?']
];
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tiers=['S','A','B','C','D','F'];
const safeScope=s=>String(s||'you').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100);
const read=()=>{try{const x=JSON.parse(localStorage.getItem(STORE)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(_){return {}}};
function picks(scope){return read()[safeScope(scope)]||{}}
function save(scope,award,product,eligible){
 if(!defs.some(a=>a[0]===award)||product&&!eligible.includes(product))return false;
 const all=read(),key=safeScope(scope),v={...(all[key]||{})};
 if(product)v[award]=product;else delete v[award];
 all[key]=v;
 try{localStorage.setItem(STORE,JSON.stringify(all));return true}catch(_){return false}
}
function photo(p){
 if(!p||!p.image_url||!['retailer','brand','barcode'].includes(p.image_status))return '<span class="award-emoji">'+esc(p?.emoji||'✳')+'</span>';
 return '<img src="'+esc(p.image_url)+'" loading="lazy" referrerpolicy="no-referrer" alt="'+esc(p.brand+' '+p.name)+'" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="award-emoji" hidden>'+esc(p.emoji||'✳')+'</span>';
}
function render({scope,name,products,ratings,publicReviews,publicProfiles,shared=null}){
 const byId=new Map(products.map(p=>[p.id,p])),eligible=new Set(ratings.filter(r=>r.status!=='not_tried'&&tiers.includes(r.tier)).map(r=>r.product_id));
 const current=shared||picks(scope),readOnly=shared!==null;
 const assigned=defs.filter(a=>current[a[0]]&&(readOnly||eligible.has(current[a[0]]))&&byId.has(current[a[0]])).length;
 return '<header class="gt-awards-hero"><div class="gt-awards-eyebrow">✳ GOOD THINGS AWARDS · FIRST EDITION 2026</div>'+
 '<h1>Great taste.<br><em>Strong opinions.</em></h1><p>The snacks we love. The staples we need. And a few products we have very strong feelings about.</p>'+
 '<div class="gt-awards-hero-bottom"><span>'+assigned+' / '+defs.length+' awards selected</span><span>No paid awards. Ever. ♡</span></div></header>'+
 '<div class="gt-awards-toolbar"><div><strong>'+esc(readOnly?'A shared awards shelf':name+' awards')+'</strong><p>'+esc(readOnly?'These are personal picks, not official community winners.':'Choose from products you actually rated. Picks are stored locally on this device.')+'</p></div>'+
 '<div class="gap12">'+(readOnly?'<button class="button button-lime button-small" data-action="awards-own">Make my own awards ↗</button>':
 '<button class="button button-lime button-small" data-action="awards-share" '+(!assigned?'disabled':'')+'>Share my winners ↗</button>')+
 '<button class="button button-ghost button-small" data-nav="board">Tier Board ↗</button></div></div>'+
 '<div class="gt-awards-intro"><span class="gt-awards-eyebrow">CURATORS EDITION</span><h2>And the award goes to...</h2></div>'+
 '<div class="gt-awards-grid">'+defs.map((a,i)=>{
 const p=byId.get(current[a[0]]),active=!!p&&(readOnly||eligible.has(p.id));
 return '<article class="gt-award-card"><div class="gt-award-top"><span class="gt-award-medal">'+a[1]+'</span><span class="gt-award-index">AWARD '+String(i+1).padStart(2,'0')+'</span></div>'+
 '<div><span class="gt-award-category">'+esc(a[3])+'</span><h3>'+esc(a[2])+'</h3><p>'+esc(a[4])+'</p></div>'+
 '<div class="gt-award-winner">'+(active?'<div class="gt-award-art">'+photo(p)+'</div><div><strong>'+esc(p.name)+'</strong><small>'+esc(p.brand)+'</small></div>':
 '<div class="gt-award-art gt-award-empty">✳</div><div><strong>To be discovered.</strong><small>A future favourite awaits.</small></div>')+'</div>'+
 (readOnly?'':'<button class="gt-award-pick" data-action="awards-pick" data-id="'+a[0]+'">'+(active?'Change winner':eligible.size?'Choose a winner':'Rate something first')+' ↗</button>')+
 '</article>'}).join('')+'</div>'+
 '<section class="gt-peoples-choice"><span class="gt-awards-eyebrow">♡ COMING NEXT · COMMUNITY EDITION</span><h2>People’s Choice.</h2><p>Not our taste. Yours. We propose 2027 for the first community awards, with open nominations, authenticated ballots and published real results.</p>'+
 '<div class="gt-peoples-steps"><div><strong>01 · Nominate</strong><span>Nominate something you have tried</span></div><div><strong>02 · Vote</strong><span>One verified account ballot per category</span></div><div><strong>03 · Celebrate</strong><span>Publish the actual votes and winners</span></div></div>'+
 '<div class="gt-peoples-note"><span>'+Number(publicReviews||0)+' public reviews · '+Number(publicProfiles||0)+' profiles today. These are not votes.</span><b>Official voting has not opened</b></div>'+
 '<small>No sponsored winners · Transparent eligibility · Bot and duplicate protection before launch</small></section>'+
 '<div class="gt-awards-outro">✳ Taste is personal. Good things are better shared. ♡</div>';
}
function picker(award,products,ratings,scope){
 const def=defs.find(a=>a[0]===award);if(!def)return '';
 const grade=new Map(ratings.filter(r=>r.status!=='not_tried'&&tiers.includes(r.tier)).map(r=>[r.product_id,r.tier]));
 const available=products.filter(p=>grade.has(p.id)).sort((a,b)=>tiers.indexOf(grade.get(a.id))-tiers.indexOf(grade.get(b.id))||a.name.localeCompare(b.name,'de'));
 const current=picks(scope)[award];
 return '<button class="close" data-action="close-modal" aria-label="Close">×</button><div class="gt-awards-eyebrow">YOUR HONEST PICK</div>'+
 '<h2>'+def[1]+' '+esc(def[2])+'</h2><p>'+esc(def[4])+'</p><p class="small muted">Only products you have actually graded are eligible.</p>'+
 '<div class="gt-award-options">'+(available.length?available.map(p=>'<button class="gt-award-option'+(current===p.id?' active':'')+'" data-action="awards-select" data-id="'+award+'" data-value="'+esc(p.id)+'">'+
 '<span class="gt-award-option-art">'+photo(p)+'</span><span><strong>'+esc(p.name)+'</strong><small>'+esc(p.brand)+' · '+esc(grade.get(p.id))+' tier</small></span><span>'+(current===p.id?'✓':'↗')+'</span></button>').join(''):'<p>No rated products yet. Try the tier board first.</p>')+'</div>'+
 (current?'<button class="button button-ghost button-small" data-action="awards-clear" data-id="'+award+'">Clear winner</button>':'');
}
function shareLink(scope,products,ratings,base){
 const eligible=new Set(ratings.filter(r=>r.status!=='not_tried'&&tiers.includes(r.tier)).map(r=>r.product_id));
 const current=picks(scope),productIds=new Set(products.map(p=>p.id));
 const pairs=defs.filter(a=>productIds.has(current[a[0]])&&eligible.has(current[a[0]])).map(a=>[a[0],current[a[0]]]);
 if(!pairs.length)return '';
 const bytes=new TextEncoder().encode(JSON.stringify({v:1,y:2026,a:pairs}));let binary='';for(const x of bytes)binary+=String.fromCharCode(x);
 return base+'?awards='+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decode(raw,products){
 if(!raw||raw.length>4500)return null;
 try{
  const str=decodeURIComponent(Array.from(atob(raw.replace(/-/g,'+').replace(/_/g,'/')),c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join(''));
  const v=JSON.parse(str),available=new Set(products.filter(p=>p.vegan_status!=='non_vegan').map(p=>p.id));
  if(v.v!==1||v.y!==2026||!Array.isArray(v.a)||v.a.length>defs.length)return null;
  const result={};
  for(const entry of v.a){
   if(!Array.isArray(entry)||entry.length!==2||!defs.some(d=>d[0]===entry[0])||!available.has(entry[1])||result[entry[0]])return null;
   result[entry[0]]=entry[1];
  }
  return result;
 }catch(_){return null}
}
window.GT_AWARDS={render,picker,picks,save,shareLink,decode};
})();