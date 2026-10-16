/* GOOD THINGS 2.6: Brand tasting missions and voluntary improvement feedback. */
(function(){
'use strict';
const KEY='goodthings_sensory_v26',TIERS=['S','A','B','C','D','F'];
const names={vemondo:'Vemondo · Lidl',penny:'Food for Future · PENNY'};
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const state={brand:'vemondo',category:'all',status:'all',query:'',visible:30};
let ctx=null;
const scopeKey=x=>String(x||'guest').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,120);
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(_){return {}}}
const brandOf=p=>p?.brand_collection==='food-for-future'||norm(p?.brand)==='foodforfuture'?'penny':p?.brand_collection==='vemondo'||norm(p?.brand)==='vemondo'?'vemondo':'';
const all=()=>ctx?.products.filter(p=>brandOf(p)===state.brand&&p.vegan_status!=='non_vegan')||[];
const ratings=()=>new Map((ctx?.ratings||[]).map(r=>[r.product_id,r]));
const feedback=(id,scope)=>read()[scopeKey(scope)]?.[id]||null;
const isRated=r=>!!r&&r.status!=='not_tried'&&TIERS.includes(r.tier);
function setBrand(v){if(!names[v])return false;state.brand=v;state.category='all';state.status='all';state.query='';state.visible=30;return true}
function setStatus(v){if(!['all','rated','unrated','not_tried','feedback'].includes(v))return false;state.status=v;state.visible=30;return true}
function setCategory(v){state.category=String(v||'all');state.visible=30;return true}
function setQuery(v){state.query=String(v||'').slice(0,100);state.visible=30;refresh()}
function filtered(){
 const r=ratings(),query=norm(state.query);
 return all().filter(p=>(state.category==='all'||p.category_id===state.category)&&(!query||norm([p.name,p.brand,p.barcode,p.search_terms,p.quantity].join(' ')).includes(query)))
 .filter(p=>{let x=r.get(p.id);return state.status==='all'||state.status==='rated'&&isRated(x)||state.status==='unrated'&&!x||state.status==='not_tried'&&x?.status==='not_tried'||state.status==='feedback'&&!!feedback(p.id,ctx.scope)})
 .sort((a,b)=>Number(/burger|chicken|nugget|tofu|chunks|no milk/i.test(b.name))-Number(/burger|chicken|nugget|tofu|chunks|no milk/i.test(a.name))||a.name.localeCompare(b.name,'de'));
}
function picture(p){
 if(!p.image_url||!['barcode','brand','retailer'].includes(p.image_status))return '<div class="gt-bp-photo-unavailable">'+esc(p.emoji||'✳')+'<small>IMAGE IN REVIEW</small></div>';
 return '<img loading="lazy" referrerpolicy="no-referrer" src="'+esc(p.image_url)+'" alt="'+esc(p.brand+' '+p.name)+' packshot" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="gt-bp-photo-unavailable" hidden>'+esc(p.emoji||'✳')+'<small>PHOTO UNAVAILABLE</small></div>';
}
function gallery(){
 const a=filtered(),r=ratings();
 return '<div class="gt-bp-results"><span>'+a.length+' products · '+Math.min(state.visible,a.length)+' shown</span></div><div class="gt-bp-grid">'+
 a.slice(0,state.visible).map(p=>{
 const x=r.get(p.id),graded=isRated(x),f=feedback(p.id,ctx.scope);
 return '<article class="gt-bp-card"><div class="gt-bp-photo">'+picture(p)+'<span>'+esc(p.source_type==='penny_official_listing'?'PENNY · OFFICIAL':p.source_type==='lidl_official_press'?'LIDL · ANNOUNCED':'EAN · COMMUNITY DATA')+'</span></div>'+
 '<div class="gt-bp-card-main"><small>'+esc(p.category||'Plant-based')+' · '+esc(p.store)+'</small><h3>'+esc(p.name)+'</h3><p>'+esc(p.quantity||'Size to be checked')+'</p>'+
 '<div class="gt-bp-rating">'+(graded?'Your grade: '+esc(x.tier):x?.status==='not_tried'?'◌ Not tried yet':'◌ Not rated')+(f?' · ✳ Feedback saved':'')+'</div></div>'+
 '<div class="gt-bp-card-cta"><button data-action="open-product" data-id="'+esc(p.id)+'" class="gt-bp-primary">See facts & rate ↗</button>'+
 '<button data-action="brand-feedback" data-id="'+esc(p.id)+'" class="gt-bp-secondary">✍ Product feedback</button></div></article>';
 }).join('')+'</div>'+
 (state.visible<a.length?'<button class="gt-bp-showmore" data-action="brand-more">Show more products ↓</button>':'')+
 (!a.length?'<p class="gt-bp-empty">No matches. Try another category or search.</p>':'');
}
function refresh(){const target=document.querySelector('#gtBrandProducts');if(target&&ctx)target.innerHTML=gallery()}
function more(){state.visible+=30;refresh()}
function render(context){
 ctx=context;const products=all(),r=ratings(),rated=products.filter(p=>isRated(r.get(p.id))).length,untried=products.filter(p=>r.get(p.id)?.status==='not_tried').length,photos=products.filter(p=>!!p.image_url).length;
 const cats=[...new Set(products.map(p=>p.category_id))].sort();
 const official=state.brand==='penny'?'https://www.penny.de/sortiment/food-for-future':'https://www.lidl.de/c/vemondo/a10024870';
 const caveat=state.brand==='penny'?'70 products on PENNY official assortment pages; not live branch stock. Photos are directly linked to each retailer product page.':'German-market Open Food Facts subset plus existing catalogue and Lidl-announced products. Not the complete live Vemondo range; image and vegan tags are community-contributed.';
 return '<div class="gt-bp-hero"><span class="gt-bp-eyebrow">GOOD THINGS · PLANT-BASED TASTE LAB</span><h2>Every product.<br><em>Every opinion matters.</em></h2><p>A place to taste honestly, compare with friends, and tell the people making these products how they could improve.</p>'+
 '<div class="gt-bp-brands"><button data-action="brand-select" data-value="vemondo" class="'+(state.brand==='vemondo'?'active':'')+'">✳ Vemondo / Lidl</button><button data-action="brand-select" data-value="penny" class="'+(state.brand==='penny'?'active':'')+'">♡ Food for Future / PENNY</button></div></div>'+
 '<div class="gt-bp-stats"><div><strong>'+products.length+'</strong><small>Catalogued</small></div><div><strong>'+rated+'</strong><small>Your ratings</small></div><div><strong>'+untried+'</strong><small>Not tried</small></div><div><strong>'+photos+'</strong><small>With image source</small></div></div>'+
 '<div class="gt-bp-source">ⓘ '+esc(caveat)+' <a target="_blank" rel="noopener noreferrer" href="'+official+'">Official brand page ↗</a></div>'+
 '<section class="gt-bp-invite"><div><span class="gt-bp-eyebrow">♡ BETTER TOGETHER</span><h3>Bring Huong. Bring the gang.</h3><p>Independent shelves, honest opinions, and plenty of opportunities to disagree about tofu.</p></div><div><button class="button button-lime" data-action="brand-invite">Invite to this collection ↗</button><button class="button button-white" data-nav="duo">Play Together ♡</button></div></section>'+
 '<div class="gt-bp-filters"><label>Search<input id="gtBrandSearch" class="control" type="search" value="'+esc(state.query)+'" placeholder="Burger, Chicken, Nuggets, Tofu…" autocomplete="off"></label>'+
 '<label>Category<select id="gtBrandCategory" class="control"><option value="all">All categories</option>'+cats.map(id=>'<option value="'+esc(id)+'" '+(state.category===id?'selected':'')+'>'+esc(products.find(p=>p.category_id===id)?.category||id)+'</option>').join('')+'</select></label></div>'+
 '<div class="gt-bp-status">'+[['all','All'],['unrated','Not rated'],['rated','Rated'],['not_tried','Not tried'],['feedback','My feedback']].map(([id,label])=>'<button data-action="brand-status" data-value="'+id+'" class="'+(state.status===id?'active':'')+'">'+label+'</button>').join('')+'</div>'+
 '<div id="gtBrandProducts">'+gallery()+'</div>'+
 '<section class="gt-bp-report"><span class="gt-bp-eyebrow">THE CONSTRUCTIVE FEEDBACK LOOP</span><h2>Love it? Help improve it.</h2><p>Tell manufacturers what works and what could change — taste, juiciness, texture, value, packaging. Helpful specifics beat anonymous star ratings.</p>'+
 '<div class="gt-bp-report-actions"><button class="button button-dark" data-action="brand-copy-report">Copy feedback report ↗</button><button class="button button-white" data-action="brand-export-report">Download Markdown ↓</button></div>'+
 '<small>Your sensory notes stay in this browser and are excluded from reports unless you explicitly opt in. No feedback is automatically sent to Lidl or PENNY; this is not a manufacturer partnership.</small></section>';
}
function feedbackForm(p,scope,grade){
 const x=feedback(p.id,scope)||{};
 const select=(id,selection)=>'<select class="control" name="'+id+'"><option value="">Not sure</option>'+[1,2,3,4,5].map(i=>'<option value="'+i+'" '+(selection===i?'selected':'')+'>'+i+' / 5</option>').join('')+'</select>';
 return '<button class="close" data-action="close-modal" aria-label="Close">×</button><div class="eyebrow">✳ PRODUCT IMPROVEMENT LAB</div><h2>'+esc(p.name)+'</h2><p>'+esc(p.brand)+' · Grade '+esc(grade)+' · '+esc(p.quantity||'')+'</p>'+
 '<form id="gtBrandFeedbackForm"><input type="hidden" name="product_id" value="'+esc(p.id)+'">'+
 '<div class="gt-bp-scores"><label>Taste'+select('taste',x.taste)+'</label><label>Texture'+select('texture',x.texture)+'</label><label>Value'+select('value',x.value)+'</label></div>'+
 '<label class="gt-bp-field">Buy again?<select name="buyAgain" class="control">'+[['','Not sure'],['yes','Yes'],['maybe','Maybe'],['no','No']].map(([id,label])=>'<option value="'+id+'" '+(x.buyAgain===id?'selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
 '<label class="gt-bp-field">What should stay?<textarea class="control" name="liked" maxlength="450" rows="3" placeholder="e.g. great umami and savoury flavour">'+esc(x.liked||'')+'</textarea></label>'+
 '<label class="gt-bp-field">What would make it better?<textarea class="control" name="improve" maxlength="450" rows="4" placeholder="e.g. less dry, better when heated, less packaging, more protein">'+esc(x.improve||'')+'</textarea></label>'+
 '<label class="gt-bp-consent"><input type="checkbox" name="consent" '+(x.consent?'checked':'')+'> I want this review included if I manually export a feedback report for the manufacturer.</label>'+
 '<button type="submit" class="button button-lime">Save constructive feedback ♡</button></form><p class="small muted">Saved only on this device. Accounts sync tier grades but not these separate sensory notes.</p>';
}
const score=x=>Number.isInteger(+x)&&+x>=1&&+x<=5?+x:null;
function save(scope,id,data,allowed){
 if(!allowed.includes(id))return false;
 const obj={taste:score(data.taste),texture:score(data.texture),value:score(data.value),buyAgain:['yes','no','maybe'].includes(data.buyAgain)?data.buyAgain:'',liked:String(data.liked||'').trim().slice(0,450),improve:String(data.improve||'').trim().slice(0,450),consent:!!data.consent,date:new Date().toISOString().slice(0,10)};
 const db=read(),k=scopeKey(scope);db[k]=db[k]||{};db[k][id]=obj;
 try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch(_){return false}
}
function report(){
 if(!ctx)return '';
 const r=ratings(),rows=all().filter(p=>isRated(r.get(p.id))&&feedback(p.id,ctx.scope)?.consent);
 if(!rows.length)return '';
 const text=['# GOOD THINGS · Constructive Product Feedback','','Brand: '+names[state.brand],'Date: '+new Date().toISOString().slice(0,10),'Voluntarily shared personal reviews: '+rows.length,'','Not representative of all buyers. No personal contact details. Claims about availability or prices are unverified.',''];
 for(const p of rows){const x=feedback(p.id,ctx.scope);text.push('## '+p.name,'','Source: '+p.source_url,'Taste tier: '+r.get(p.id).tier,'Taste: '+(x.taste??'n/a')+'/5 | Texture: '+(x.texture??'n/a')+'/5 | Value: '+(x.value??'n/a')+'/5','Would buy again: '+(x.buyAgain||'not answered'),'What works: '+(x.liked||'no note'),'Improve: '+(x.improve||'no note'),'')}
 text.push('---','GOOD THINGS · Taste is personal. Real improvement is collaborative.');
 return text.join('\n');
}
window.GT_BRANDS={state,brandOf,setBrand,setStatus,setCategory,setQuery,more,render,refresh,feedbackForm,save,report};
})();