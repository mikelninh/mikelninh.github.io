import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const catalogs=['catalog.js','catalog-extra-1.js','catalog-extra-2.js','catalog-extra-3.js','catalog-merge.js'].map(file=>fs.readFileSync(path.join(root,file),'utf8'));
const playableModules=['shuffle-extras.js','episodes.js','ownership.js'].map(file=>fs.readFileSync(path.join(root,file),'utf8'));
const schema=fs.readFileSync(path.join(root,'schema.sql'),'utf8');
const photoReports=fs.readFileSync(path.join(root,'photo-reports.sql'),'utf8');
const duoSchema=fs.readFileSync(path.join(root,'duo-v18.sql'),'utf8');
const duoPhotoGuard=fs.readFileSync(path.join(root,'duo-photo-guard-v18.sql'),'utf8');
const duoCommentsSql=fs.readFileSync(path.join(root,'duo-comments-v20.sql'),'utf8');
const productRequests=fs.readFileSync(path.join(root,'product-requests-v17.sql'),'utf8');
const nutritionMigration=fs.readFileSync(path.join(root,'nutrition-v17.sql'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const photoLabScript=fs.readFileSync(path.join(root,'photo-lab.js'),'utf8');
const allCSS=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const makeNode=()=>{
 const els=new Map();
 const node=id=>{
  if(!els.has(id))els.set(id,{id,innerHTML:'',textContent:'',style:{},dataset:{},
   classList:{add(){},remove(){},toggle(){}},setAttribute(){},scrollIntoView(){},querySelector(){return node('child')}});
  return els.get(id);
 };
 return {
  body:{style:{},appendChild(){}},querySelector:node,querySelectorAll(){return []},
  addEventListener(){},createElement(){return node('created')},node
 };
};
function fixture(seed={}){
 const window={addEventListener(){}},document=makeNode();
 const guest={...seed};
 const localStorage={getItem:k=>guest[k]||null,setItem:(k,v)=>{guest[k]=v}};
 const context={window,document,localStorage,history:{replaceState(){}},
  location:{origin:'https://mikelninh.github.io',pathname:'/good-things/',href:'https://mikelninh.github.io/good-things/'},
  navigator:{},URL,TextEncoder,TextDecoder,atob,btoa,setTimeout:()=>0,clearTimeout:()=>{},
  console,Intl};
 for(const catalog of catalogs)vm.runInNewContext(catalog,context);
 for(const moduleSource of playableModules)vm.runInNewContext(moduleSource,context);
 const injected=source.replace("document.addEventListener('click',async(event)=>{",
 "window.__qa={render,renderBoard,renderDiscover,renderOurs,renderMy,renderCommunity,ourPreview,productFacts,proteinNumber,filteredProducts,soloRender,soloStart,soloVote,soloSaveNote,soloHistory,soloCurrent,duoSaveDiscussion,duoDiscussionPanel,duoLocalStart,duoLocalVote,duoLocalSnapshot,duoSetStarter,duoStartPicker,duoHistoryPanel,duoPhotoCandidates,duoHiResImage,duoPick,renderDuo,boardMove,boardAnswers,boardEntries,boardNotTried,boardSorted,boardTrayProducts,boardInsertionIndex,undoBoard,resetBoard,matchedPhoto,saveRating,st,gradedRatings,notTriedRatings,selfRatings,publicRated,scoreFor,quickRank,importTier,importJson,snapshotUrl,decodeSnapshot};document.addEventListener('click',async(event)=>{");
 assert.ok(injected.includes('window.__qa={'),'Expected app injection point is missing');
 vm.runInNewContext(injected,context);
 return {context,t:window.__qa,localStorage};
}
test('Scripts parse, all public assets linked, and ratings default private in schema',()=>{
 assert.doesNotThrow(()=>new vm.Script(source));
 assert.doesNotThrow(()=>new vm.Script(photoLabScript));
 for(const catalog of catalogs)assert.doesNotThrow(()=>new vm.Script(catalog));
 assert.ok(index.includes('./catalog.js')&&index.includes('./app.js')&&index.includes('./styles.css'));
 assert.match(schema,/is_public boolean not null default false,\s*\n\s*position numeric/);
});
test('356 records, 354 eligible in 18 categories, with two dairy products excluded',()=>{
 const {context,t}=fixture();
 const a=context.window.GT_CATALOG,g=context.window.GT_GROUPS;
 assert.equal(a.length,356);assert.equal(g.length,18);
 assert.equal(new Set(a.map(x=>x.id)).size,356);
 assert.equal(g.reduce((sum,x)=>sum+x.count,0),354);
 assert.ok(g.every(x=>x.count>0));
 assert.equal(a.filter(x=>x.vegan_status==='non_vegan').length,2);
 assert.equal(a.filter(x=>x.vegan_status!=='non_vegan').length,354);
 assert.ok(a.every(x=>x.verified===false));
 assert.equal((t.renderDiscover().match(/class="product-card"/g)||[]).length,323);
 assert.ok(!t.renderDiscover().includes('Sweet Paprika</h3>'));
 assert.equal((t.renderBoard().match(/data-drag-id="/g)||[]).length,80);
 assert.equal((t.renderBoard().match(/class="tier-lane"/g)||[]).length,6);
});
test('Guest scores persist and public snippets escape notes',async()=>{
 const {t,localStorage}=fixture();
 t.st.selected='tofu-01';t.st.draftTier='S';t.st.draftNote='<img onerror=alert(1)>';t.st.persona='mikel';
 await t.saveRating();
 assert.equal(t.ourPreview().a['tofu-01'].tier,'S');
 assert.ok(t.renderOurs().includes('&lt;img onerror=alert(1)&gt;'));
 assert.ok(localStorage.getItem('goodthings_v13_guest'));
});
test('Verified public curator display does not include private ratings',()=>{
 const {t}=fixture();
 t.st.curators=[{role:'mikel',user_id:'uid-one'},{role:'huong',user_id:'uid-two'}];
 t.st.allRatings=[
  {user_id:'uid-one',product_id:'tofu-01',tier:'A',note:'Good',is_public:true},
  {user_id:'uid-two',product_id:'tofu-01',tier:'S',note:'Better',is_public:true},
  {user_id:'uid-two',product_id:'milks-01',tier:'B',note:'Private',is_public:false}
 ];
 const p=t.ourPreview();
 assert.equal(p.published,true);assert.equal(p.a['tofu-01'].tier,'A');
 assert.equal(p.b['milks-01'],undefined);assert.equal(p.both.length,1);
 assert.ok(t.renderOurs().includes('Verified curators:'));
});
test('Snapshots contain scores only, no private tasting notes',()=>{
 const {t}=fixture();
 const url=t.snapshotUrl([{product_id:'tofu-01',tier:'S',note:'Secret'}]);
 assert.ok(!url.includes('Secret'));
 const snap=new URL(url).searchParams.get('snapshot');
 const decoded=t.decodeSnapshot(snap);
 assert.equal(decoded[0].tier,'S');assert.equal(decoded[0].note,'');
});

test('Sourced photos are product specific and link to traceable provenance',()=>{
 const {context}=fixture();
 const a=context.window.GT_CATALOG;
 const matched=a.filter(x=>['retailer','brand','barcode'].includes(x.image_status));
 assert.equal(matched.length,323);
 assert.ok(matched.every(x=>x.image_url?.startsWith('https://')&&x.image_source_url?.startsWith('https://')));
 assert.ok(matched.filter(x=>x.image_status==='retailer').every(x=>x.image_source_url&&x.photo_attribution));
 assert.ok(matched.filter(x=>x.image_status==='retailer'&&x.retailer_sku).every(x=>x.image_source_url&&x.retailer_sku));
});
test('Drag-board state supports placing, reorder, unrank and blocks nonvegan products',async()=>{
 const {t,localStorage}=fixture();
 assert.equal(t.boardTrayProducts().length,80);
 assert.equal(await t.boardMove('snacks-02','S',0),false);
 assert.equal(t.boardEntries().length,0);
 assert.equal(await t.boardMove('tofu-01','S',0),true);
 assert.equal(await t.boardMove('tofu-04','S',0),true);
 assert.deepEqual(Array.from(t.boardSorted('S'),x=>x.product_id),['tofu-04','tofu-01']);
 assert.equal(await t.boardMove('tofu-01','D',0),true);
 assert.deepEqual(Array.from(t.boardSorted('D'),x=>x.product_id),['tofu-01']);
 assert.equal(t.boardTrayProducts().length,80);
 assert.equal(await t.boardMove('tofu-01','unranked',0),true);
 assert.equal(t.boardTrayProducts().length,80);
 assert.ok(localStorage.getItem('goodthings_v13_guest'));
});


test('Correct packshots stay source-matched; fuzzy photo candidates never appear on public tiles',()=>{
 const {t,context}=fixture();
 const missing=context.window.GT_CATALOG.find(p=>p.id==='tofu-03');
 assert.equal(t.matchedPhoto(missing),false);
 t.st.imageCache['tofu-03']={url:'https://untrusted.example/fuzzy.png',kind:'off'};
 assert.ok(!t.renderBoard().includes('https://untrusted.example/fuzzy.png'));
 assert.ok(!t.renderDiscover().includes('https://untrusted.example/fuzzy.png'));
 const filtered=t.st.boardPhotoFilter='matched';
 assert.equal(t.boardTrayProducts().length,80);
 t.st.boardPhotoFilter='missing';assert.equal(t.boardTrayProducts().length,31);
 t.st.boardPhotoFilter='all';assert.equal(t.boardTrayProducts().length,80);
});
test('Undo restores old tier, notes and private status; reset clears guest board',async()=>{
 const {t}=fixture();
 t.st.guest.you['tofu-01']={tier:'C',note:'My private note',is_public:false,position:100};
 assert.equal(await t.boardMove('tofu-01','S',0),true);
 assert.equal(t.st.guest.you['tofu-01'].tier,'S');
 await t.undoBoard();
 assert.equal(t.st.guest.you['tofu-01'].tier,'C');
 assert.equal(t.st.guest.you['tofu-01'].note,'My private note');
 assert.equal(t.st.guest.you['tofu-01'].is_public,false);
 await t.resetBoard();
 assert.equal(t.boardEntries().length,0);
 assert.equal(t.st.boardHistory.length,0);
});
test('Drag insertion uses x-coordinate correctly in wrapped flex row',()=>{
 const {t}=fixture();
 const items=[{left:10,top:10,width:60,height:80,bottom:90},{left:80,top:10,width:60,height:80,bottom:90},{left:150,top:10,width:60,height:80,bottom:90}];
 const zone={dataset:{dropTier:'S'},querySelectorAll(){return items.map((b,i)=>({dataset:{dragId:'p'+i},getBoundingClientRect(){return b}}))}};
 assert.equal(t.boardInsertionIndex(zone,115,36,'none'),2);
 assert.equal(t.boardInsertionIndex(zone,12,36,'none'),0);
 assert.equal(t.boardInsertionIndex(zone,220,36,'none'),3);
});
test('Photo correction schema is private, constrained and RLS-protected',()=>{
 assert.match(photoReports,/enable row level security/i);
 assert.match(photoReports,/to authenticated/i);
 assert.match(photoReports,/auth\.uid\(\)/);
 assert.doesNotMatch(photoReports,/grant .* to anon/i);
});


test('Not tried yet is a saved answer with no grade, a private state and a separate shelf',async()=>{
 const {t,localStorage}=fixture();
 assert.equal(t.boardTrayProducts().length,80);
 assert.equal(await t.boardMove('tofu-01','not_tried',0),true);
 const record=t.st.guest.you['tofu-01'];
 assert.equal(record.status,'not_tried');
 assert.equal(record.tier,null);
 assert.equal(record.is_public,false);
 assert.equal(record.position,0);
 assert.equal(t.boardEntries().length,0);
 assert.equal(t.boardNotTried().length,1);
 assert.equal(t.boardTrayProducts().length,80);
 assert.ok(t.renderBoard().includes('class="not-tried-shelf"'));
 assert.ok(t.renderBoard().includes('data-drop-tier="not_tried"'));
 assert.ok(t.renderMy().includes('Not tried yet (1)'));
 assert.equal(t.publicRated().length,0);
 assert.equal(t.gradedRatings().length,0);
 assert.equal(t.notTriedRatings().length,1);
 assert.ok(localStorage.getItem('goodthings_v13_guest'));
 t.st.catalogStatus='not_tried';
 assert.deepEqual(Array.from(t.filteredProducts(),p=>p.id),['tofu-01']);
 t.st.catalogStatus='unanswered';
 assert.equal(t.filteredProducts().length,322);
});
test('Not tried can turn into a real grade and undo restores the untried state',async()=>{
 const {t}=fixture();
 assert.equal(await t.boardMove('tofu-01','not_tried',0),true);
 assert.equal(await t.boardMove('tofu-01','S',0),true);
 assert.equal(t.boardEntries().length,1);
 assert.equal(t.boardNotTried().length,0);
 assert.equal(t.st.guest.you['tofu-01'].status,'rated');
 assert.equal(t.st.guest.you['tofu-01'].tier,'S');
 await t.undoBoard();
 assert.equal(t.boardEntries().length,0);
 assert.equal(t.boardNotTried().length,1);
 assert.equal(t.st.guest.you['tofu-01'].tier,null);
 assert.equal(t.st.guest.you['tofu-01'].is_public,false);
 await t.undoBoard();
 assert.equal(t.boardAnswers().length,0);
 assert.equal(t.boardTrayProducts().length,80);
});
test('A graded product can become not tried without leaking any score or public flag',async()=>{
 const {t}=fixture();
 t.st.guest.you['tofu-01']={tier:'A',status:'rated',is_public:true,note:'Old tasting review',position:100};
 await t.boardMove('tofu-01','not_tried',0);
 const r=t.st.guest.you['tofu-01'];
 assert.equal(r.tier,null);
 assert.equal(r.status,'not_tried');
 assert.equal(r.is_public,false);
 assert.equal(r.note,'');
 assert.ok(!t.renderBoard().includes('data-drop-tier="A" aria-label="A tier, 1 products"'));
 await t.resetBoard();
 assert.equal(t.boardAnswers().length,0);
});
test('Not tried is recognised when importing JSON and kept off public grade snapshots',()=>{
 const {t}=fixture();
 assert.equal(t.importTier({status:'not_tried'}),'not_tried');
 assert.equal(t.importTier('not_tried'),'not_tried');
 assert.equal(t.importTier({tier:'C'}),'C');
 const skip={product_id:'tofu-01',tier:null,status:'not_tried',is_public:false};
 assert.equal(t.gradedRatings().length,0);
 assert.ok(!t.snapshotUrl([skip]).includes('not_tried'));
});
test('Schema enforces one private null-grade state without changing graded tier choices',()=>{
 assert.match(schema,/status text not null default 'rated'/);
 assert.match(schema,/status = 'not_tried' and tier is null and is_public = false and position = 0/);
 assert.match(source,/select\('user_id,product_id,tier,status,note,is_public,position,updated_at'\)/);
});


test('F Durchgefallen is a sixth score, survives reload and remains separate from not tried',async()=>{
 const {t,localStorage}=fixture();
 assert.equal((t.renderBoard().match(/class="tier-lane"/g)||[]).length,6);
 assert.ok(t.renderBoard().includes('data-drop-tier="F"'));
 assert.ok(t.renderBoard().includes('Durchgefallen'));
 assert.equal(await t.boardMove('tofu-01','F',0),true);
 assert.equal(t.boardSorted('F')[0].product_id,'tofu-01');
 assert.equal(t.st.guest.you['tofu-01'].status,'rated');
 assert.equal(t.st.guest.you['tofu-01'].tier,'F');
 assert.equal(t.boardNotTried().length,0);
 assert.ok(t.snapshotUrl([{product_id:'tofu-01',tier:'F'}]).includes('snapshot='));
 assert.ok(localStorage.getItem('goodthings_v13_guest').includes('"F"'));
 await t.undoBoard();
 assert.equal(t.boardSorted('F').length,0);
});
test('F fails but D is merely disappointing, and v1.6 schema supports six tiers',()=>{
 assert.match(schema,/tier text check\(tier in \('S','A','B','C','D','F'\)\)/);
 assert.match(schema,/status = 'rated' and tier in \('S','A','B','C','D','F'\)/);
 assert.match(source,/F:'Durchgefallen'/);
 assert.match(source,/TIERS\.length-1/);
});


test('F grade works in quick picker, share snapshots, public scores and comparisons',async()=>{
 const {t,context}=fixture();
 assert.equal((t.renderBoard().match(/class="tier-lane"/g)||[]).length,6);
 assert.ok(t.renderBoard().includes('data-drop-tier="F"'));
 assert.ok(t.renderBoard().includes('Durchgefallen'));
 assert.equal(t.importTier('f'),'F');
 await t.boardMove('tofu-01','F',0);
 assert.equal(t.boardSorted('F')[0].product_id,'tofu-01');
 assert.equal(t.boardEntries().length,1);
 assert.equal(t.boardNotTried().length,0);
 const url=t.snapshotUrl([{product_id:'tofu-01',tier:'F'}]);
 const snapshot=t.decodeSnapshot(new URL(url).searchParams.get('snapshot'));
 assert.equal(snapshot[0].tier,'F');
 const catalog=context.window.GT_CATALOG;
 const valid=catalog.filter(p=>p.vegan_status!=='non_vegan');
 assert.equal(valid.filter(p=>p.image_url&&['retailer','brand','barcode'].includes(p.image_status)).length,323);
 assert.equal(valid.filter(p=>!p.image_url).length,31);
});


test('Expanded barcode foods have distinct IDs, 252 sourced nutrition records and shopping facts',()=>{
 const {context,t}=fixture();
 const all=context.window.GT_CATALOG,external=all.filter(p=>p.source_type==='openfoodfacts'&&p.id.startsWith('off-'));
 assert.equal(external.length,252);
 assert.ok(external.every(p=>/^\d{8,14}$/.test(p.barcode)&&p.id==='off-'+p.barcode));
 assert.ok(external.every(p=>p.image_url?.startsWith('https://images.openfoodfacts.org/')));
 assert.ok(external.every(p=>p.nutrition_source_url.endsWith(p.barcode)));
 assert.ok(external.every(p=>Number.isFinite(p.nutrition.protein)));
 assert.ok(external.every(p=>p.verified===false));
 assert.ok(t.productFacts(external[0]).includes('Nährwerte'));
 assert.ok(t.productFacts(external[0]).includes('Protein'));
 assert.ok(t.productFacts(external[0]).includes('Wo kaufen?'));
 assert.ok(t.productFacts(external[0]).includes('Preis'));
 assert.equal(new Set(all.map(p=>p.id)).size,356);
});
test('Protein sorting and high-protein filter distinguish unknown values',()=>{
 const {t}=fixture();
 t.st.sort='protein';
 const arr=t.filteredProducts();
 assert.ok(arr[0].nutrition.protein>=arr[1].nutrition.protein);
 t.st.highProtein=true;
 const filtered=t.filteredProducts();
 assert.ok(filtered.length>=30);
 assert.ok(filtered.every(p=>t.proteinNumber(p)>=15));
 assert.ok(filtered.every(p=>p.nutrition_source_url));
});
test('Original ratings IDs were preserved after expansion',()=>{
 const {context}=fixture();
 const all=context.window.GT_CATALOG;
 assert.equal(all.find(p=>p.id==='tofu-01').name,'Tofu Natur');
 assert.ok(all.find(p=>p.id==='chocolate-05'));
});


test('User suggested products go to a private moderated queue rather than public catalogue writes',()=>{
 assert.match(productRequests,/enable row level security/i);
 assert.match(productRequests,/gt_requests_owner_read/);
 assert.match(productRequests,/gt_requests_owner_submit/);
 assert.doesNotMatch(productRequests,/grant\s+insert.*gt_products\s+to\s+authenticated/i);
 assert.match(source,/function openProductSuggestion\(\)/);
 assert.match(source,/function submitProductSuggestion\(form\)/);
 assert.match(source,/gt_product_requests/);
});
test('Barcode nutrient columns and dated price UI are honest about missing data',()=>{
 assert.match(nutritionMigration,/nutrition jsonb/);
 assert.match(nutritionMigration,/stores_reported text/);
 assert.match(source,/prices\.openfoodfacts\.org\/api\/v1\/prices/);
 assert.match(source,/x\.currency==='EUR'/);
 assert.match(source,/x\.location\?\.osm_address_country_code==='DE'/);
 assert.match(source,/Beobachteter Preis, nicht Live-Angebot/);
 assert.match(source,/Kein belegter Preis/);
});


test('Duo preview uses real photos and hides the first person’s grade until both respond',async()=>{
 const {t,localStorage}=fixture();
 t.duoSetStarter('mikel');
 assert.equal(t.duoPhotoCandidates().length,323);
 assert.ok(t.renderDuo().includes('Geschmack ist Teamwork.'));
 await t.duoLocalStart(false);
 const first=t.duoLocalSnapshot();
 assert.ok(first.product?.image_url?.startsWith('https://'));
 assert.ok(first.product?.image_source_url);
 t.duoLocalVote('S');
 assert.equal(t.st.duo.local.votes.mikel,'S');
 assert.equal(t.st.duo.local.votes.huong,undefined);
 assert.ok(!t.renderDuo().includes('duo-vote-revealed'));
 t.duoLocalVote('F');
 assert.ok(t.renderDuo().includes('duo-vote-revealed'));
 assert.equal(t.st.guest.mikel[first.product.id].tier,'S');
 assert.equal(t.st.guest.huong[first.product.id].tier,'F');
 assert.ok(localStorage.getItem('goodthings_duo_v18'));
 await t.duoLocalStart(true);
 assert.equal(t.st.duo.local.round,2);
 assert.notEqual(t.st.duo.local.productId,first.product.id);
 assert.equal(t.st.duo.local.history.length,1);
});
test('The Duo game explicitly supports no-grade answers separately from failures',async()=>{
 const {t}=fixture();
 t.duoSetStarter('mikel');
 await t.duoLocalStart(false);
 const id=t.st.duo.local.productId;
 t.duoLocalVote('not_tried');t.duoLocalVote('D');
 assert.equal(t.st.guest.mikel[id].tier,null);
 assert.equal(t.st.guest.mikel[id].status,'not_tried');
 assert.equal(t.st.guest.huong[id].tier,'D');
 assert.equal(t.st.guest.mikel[id].is_public,false);
});
test('Duo room membership and hidden votes are enforced in database schema',()=>{
 assert.match(duoSchema,/create table if not exists public.gt_duo_rooms/);
 assert.match(duoSchema,/create table if not exists public.gt_duo_votes/);
 assert.match(duoSchema,/create table if not exists public.gt_duo_reveals/);
 assert.match(duoSchema,/gt_duo_votes for select to authenticated\s+using\(user_id=/);
 assert.match(duoSchema,/host_answer is not null and partner_answer is not null/);
 assert.match(duoSchema,/duo_host_advance/);
 assert.match(duoPhotoGuard,/gt_duo_create_photo_checked/);
});
test('All playable products have a traceable source photo, not an arbitrary lookalike',()=>{
 const {t}=fixture();
 for(const p of t.duoPhotoCandidates()){
  assert.ok(p.image_source_url);
  assert.ok(p.image_url?.startsWith('https://'));
 }
});


test('Shared-device Duo starter can be chosen, automatically alternates, and retains results after reload',async()=>{
 const {t,localStorage}=fixture();
 assert.match(t.renderDuo(),/data-action="duo-set-starter"/);
 t.duoSetStarter('huong');
 await t.duoLocalStart(false);
 assert.equal(t.st.duo.local.activeRole,'huong');
 const first=t.duoLocalSnapshot().product.id;
 t.duoLocalVote('F');
 assert.equal(t.st.duo.local.votes.huong,'F');
 assert.ok(!t.renderDuo().includes('duo-vote-revealed'));
 t.duoLocalVote('S');
 assert.equal(t.st.guest.huong[first].tier,'F');
 assert.equal(t.st.guest.mikel[first].tier,'S');
 assert.match(t.renderDuo(),/duo-history-row/);
 assert.match(t.renderDuo(),/Eure bisherigen Ergebnisse/);
 await t.duoLocalStart(true);
 assert.equal(t.st.duo.local.starter,'mikel');
 assert.equal(t.st.duo.local.activeRole,'mikel');
 const second=t.duoLocalSnapshot().product.id;
 t.duoLocalVote('D');t.duoLocalVote('A');
 assert.equal(t.st.guest.mikel[second].tier,'D');
 assert.equal(t.st.guest.huong[second].tier,'A');
 assert.equal((t.renderDuo().match(/class="duo-history-row"/g)||[]).length,2);
 const saved=JSON.parse(localStorage.getItem('goodthings_duo_v18'));
 assert.equal(saved.local.history.length,1);
 assert.equal(saved.local.starter,'mikel');
 const reloaded=fixture({'goodthings_duo_v18':localStorage.getItem('goodthings_duo_v18'),
 'goodthings_v13_guest':localStorage.getItem('goodthings_v13_guest')});
 assert.equal(reloaded.t.st.duo.local.votes.mikel,'D');
 assert.equal(reloaded.t.st.duo.local.history.length,1);
 assert.equal(reloaded.t.st.guest.huong[first].tier,'F');
});
test('The Natumi image has been replaced by the manufacturer artwork, and the layout cannot crop the bottom',()=>{
 const {context}=fixture();
 const product=context.window.GT_CATALOG.find(p=>p.id==='milks-14');
 assert.equal(product.barcode,'4038375024396');
 assert.equal(product.photo_attribution,'Natumi (Hersteller)');
 assert.match(product.image_source_url,/natumi\.com\/produkte\/drinks\/bio-hafer-natur/);
 assert.match(product.image_url,/width=1200/);
 assert.match(allCSS,/\.duo-hero-photo>img\[data-duo-image\]\s*\{/);
 assert.match(allCSS,/object-fit:contain/);
 assert.match(allCSS,/position:absolute/);
});
test('Photo Lab audits linked images in batches and can inspect the full catalogue',()=>{
 assert.match(photoLabScript,/function auditAll\(\)/);
 assert.match(photoLabScript,/slice\(i,i\+8\)/);
 assert.match(photoLabScript,/naturalWidth/);
 assert.match(photoLabScript,/photo-audit\.csv/);
 assert.match(photoLabScript,/status:'low'/);
});

test('Solo Shuffle picks a random real-photo item, saves private grade/note and does not repeat next',async()=>{
 const {t,context,localStorage}=fixture();
 assert.ok(t.soloRender().includes('VEGAN SURPRISE!'));
 await t.soloStart(false);
 const first=t.soloCurrent();
 assert.ok(first&&first.image_url?.startsWith('https://'));
 await t.soloVote('F');
 assert.equal(t.st.guest.you[first.id].tier,'F');
 assert.equal(t.st.guest.you[first.id].is_public,false);
 assert.ok(t.soloRender().includes('DEIN URTEIL'));
 await t.soloSaveNote('Schmeckt überraschend künstlich.');
 assert.equal(t.st.guest.you[first.id].note,'Schmeckt überraschend künstlich.');
 assert.ok(localStorage.getItem('goodthings_solo_v20'));
 await t.soloStart(true);
 assert.equal(t.soloHistory().length,1);
 assert.notEqual(t.soloCurrent().id,first.id);
 assert.match(t.soloRender(),/solo-vote/);
});
test('Solo not tried is an explicit no-grade answer separate from F',async()=>{
 const {t}=fixture();
 await t.soloStart(false);
 const id=t.soloCurrent().id;
 await t.soloVote('not_tried');
 const r=t.st.guest.you[id];
 assert.equal(r.status,'not_tried');
 assert.equal(r.tier,null);
 assert.equal(r.is_public,false);
});
test('Together discussion appears only after reveal, persists with the round, and is escaped',async()=>{
 const {t,context,localStorage}=fixture();
 t.duoSetStarter('huong');
 await t.duoLocalStart(false);
 t.duoLocalVote('D');
 assert.ok(!t.renderDuo().includes('shuffle-talk'));
 t.duoLocalVote('F');
 assert.ok(t.renderDuo().includes('Jetzt wird diskutiert'));
 assert.ok(t.renderDuo().includes('duoDiscussionNote'));
 context.document.querySelector('#duoDiscussionNote').value='<script>alert("no")</script> Textur ist schrecklich.';
 await t.duoSaveDiscussion();
 assert.equal(t.st.duo.local.discussion,'<script>alert("no")</script> Textur ist schrecklich.');
 assert.ok(t.renderDuo().includes('&lt;script&gt;'));
 await t.duoLocalStart(true);
 assert.equal(t.st.duo.local.history[0].discussion,'<script>alert("no")</script> Textur ist schrecklich.');
 assert.ok(localStorage.getItem('goodthings_duo_v18').includes('Textur'));
});
test('Database private duo commentary cannot be read or written before both votes',()=>{
 assert.match(duoCommentsSql,/gt_duo_comments/);
 assert.match(duoCommentsSql,/enable row level security/i);
 assert.match(duoCommentsSql,/gt_duo_reveals rv/);
 assert.match(duoCommentsSql,/comment text not null check/);
 assert.match(duoCommentsSql,/user_id=\(select auth\.uid\(\)\)/);
 assert.match(source,/gt_duo_comments/);
});
test('Solo and Together Shuffle have links on mobile and desktop',()=>{
 assert.match(index,/data-nav="solo"/);
 assert.match(index,/data-nav="duo"/);
 assert.match(index,/Try a 5-minute episode/);
 assert.match(index,/Play Together/);
 assert.match(allCSS,/shuffle-talk/);
 assert.match(allCSS,/shuffle-mode-nav/);
});


test('Behind the Brand uses sourced brand ownership and separates personal political context from donations',()=>{
 const {context}=fixture();
 const own=context.window.GT_OWNERSHIP;
 const berief=own.lookup({brand:'Berief'});
 assert.equal(berief.owner,'Unternehmensgruppe Theo Müller');
 assert.match(berief.context,/Meinungsäußerung/);
 assert.match(berief.context,/bestreitet/);
 assert.equal(own.lookup({brand:'Unbekannte Neue Marke'}),null);
 assert.equal(own.lookup({brand:'alpro'}).owner,'Danone');
 assert.equal(own.lookup({brand:'Taifun'}).kind,'Stiftungsgeführt');
 assert.equal(own.lookup({brand:'Food for Future'}).owner,'REWE Group');
 assert.equal(own.lookup({brand:'Vemondo'}).owner,'Schwarz Gruppe');
 assert.ok(own.panel({brand:'Berief'}).includes('Quellen & Kontext'));
 assert.ok(index.includes('./ownership.js?v=2.9.1'));
});
test('Failed packshots are hidden, source-image retries remain barcode-specific',()=>{
 const guard=fs.readFileSync(path.join(root,'shuffle-extras.js'),'utf8');
 const css=fs.readFileSync(path.join(root,'ownership.css'),'utf8');
 assert.match(guard,/img\.style\.display='none'/);
 assert.match(guard,/if\(p\.barcode\)/);
 assert.match(guard,/rememberFailure\(p\)/);
 assert.match(css,/img\[hidden\]/);
});

test('Quick Rank photo is constrained inside its viewport and owner identity is shown',()=>{
 const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
 assert.match(css,/GOOD THINGS 2\.9\.2 · Quick Rank/);
 assert.match(css,/\.quick-rank-art\s*\{[^}]*overflow:hidden/);
 assert.match(css,/\.quick-rank-art > img\s*\{[^}]*max-height:100%/);
 assert.match(source,/boardPhoto\(p\)\+'<\/div>'\+window\.GT_OWNERSHIP\.inline\(p\)/);
 assert.match(index,/styles\.css\?v=2\.9\.2/);
});
test('Product facts distinguish brand owner from manufacturer',()=>{
 const extras=fs.readFileSync(path.join(root,'shuffle-extras.js'),'utf8');
 assert.match(extras,/brandOwner=info\?\.brand_owner/);
 assert.match(extras,/manufacturer=info\?\.manufacturer/);
 assert.match(extras,/Markeninhaber · Open Food Facts/);
 assert.match(extras,/Hersteller · Open Food Facts/);
 assert.doesNotMatch(extras,/Hersteller \/ Markeninhaber/);
});


test('GOOD THINGS 3.0 keeps the Tier List as the first meaningful screen and all former modes accessible',()=>{
 const {t}=fixture();
 const html=t.renderBoard();
 assert.match(html,/gt-play-hero/);
 assert.match(html,/THE FIRST FIVE/);
 assert.match(html,/id="boardPantry"/);
 assert.match(html,/id="boardMat"/);
 assert.match(html,/data-action="share-board"/);
 assert.match(html,/data-action="undo-board"/);
 assert.match(html,/data-action="export-board-png"/);
 assert.match(html,/data-drop-tier="not_tried"/);
 assert.match(index,/class="gt-nav-more"/);
 assert.match(index,/data-nav="solo"/);
 assert.match(index,/data-nav="duo"/);
 assert.match(index,/stores\.html/);
 const sheet=fs.readFileSync(path.join(root,'release-3.css'),'utf8');
 assert.match(sheet,/board-layout \.board-pantry\{order:0!important/);
 assert.match(sheet,/body:has\(\.gt-play-hero\) \.hero/);
});
test('Quick Rank presents S–F before the optional ownership and nutrition details',()=>{
 const {t,context}=fixture();
 t.quickRank('tofu-01');
 const html=context.document.querySelector('#modal').innerHTML;
 assert.ok(html.includes('gt-quick-rank'));
 assert.ok(html.includes('gt-quick-more'));
 assert.ok(html.indexOf('quick-rank-choices')<html.indexOf('gt-fact-card'));
 assert.ok(html.indexOf('quick-rank-choices')<html.indexOf('gt-brand-identity'));
 assert.ok(html.includes('data-action="quick-not-tried"'));
 assert.equal((html.match(/class="quick-rank-button/g)||[]).length,6);
 assert.match(html,/aria-label="S to F taste rating"/);
});
test('Quick Rank has a previously rated tier selected without changing the persisted answer',()=>{
 const {t,context}=fixture();
 t.st.guest.you['tofu-01']={status:'rated',tier:'F',note:'No thanks',is_public:false,position:100};
 t.quickRank('tofu-01');
 const html=context.document.querySelector('#modal').innerHTML;
 assert.match(html,/class="quick-rank-button selected" data-rank-tier="F"/);
 assert.equal(t.st.guest.you['tofu-01'].tier,'F');
});
