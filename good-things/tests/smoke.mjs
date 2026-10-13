import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const catalog=fs.readFileSync(path.join(root,'catalog.js'),'utf8');
const schema=fs.readFileSync(path.join(root,'schema.sql'),'utf8');
const photoReports=fs.readFileSync(path.join(root,'photo-reports.sql'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
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
function fixture(){
 const window={addEventListener(){}},document=makeNode();
 const guest={};
 const localStorage={getItem:k=>guest[k]||null,setItem:(k,v)=>{guest[k]=v}};
 const context={window,document,localStorage,history:{replaceState(){}},
  location:{origin:'https://mikelninh.github.io',pathname:'/good-things/',href:'https://mikelninh.github.io/good-things/'},
  navigator:{},URL,TextEncoder,TextDecoder,atob,btoa,setTimeout:()=>0,clearTimeout:()=>{},
  console,Intl};
 vm.runInNewContext(catalog,context);
 const injected=source.replace("document.addEventListener('click',async(event)=>{",
 "window.__qa={render,renderBoard,renderDiscover,renderOurs,renderMy,renderCommunity,ourPreview,filteredProducts,boardMove,boardEntries,boardSorted,boardTrayProducts,boardInsertionIndex,undoBoard,resetBoard,matchedPhoto,saveRating,st,snapshotUrl,decodeSnapshot};document.addEventListener('click',async(event)=>{");
 assert.ok(injected.includes('window.__qa={'),'Expected app injection point is missing');
 vm.runInNewContext(injected,context);
 return {context,t:window.__qa,localStorage};
}
test('Scripts parse, all public assets linked, and ratings default private in schema',()=>{
 assert.doesNotThrow(()=>new vm.Script(source));
 assert.doesNotThrow(()=>new vm.Script(catalog));
 assert.ok(index.includes('./catalog.js')&&index.includes('./app.js')&&index.includes('./styles.css'));
 assert.match(schema,/is_public boolean not null default false,\s*\n\s*position numeric/);
});
test('104 records in ten categories, with two proven dairy products excluded from 102 rankable choices',()=>{
 const {context,t}=fixture();
 const a=context.window.GT_CATALOG,g=context.window.GT_GROUPS;
 assert.equal(a.length,104);assert.equal(g.length,10);
 assert.equal(new Set(a.map(x=>x.id)).size,104);
 assert.equal(g.reduce((sum,x)=>sum+x.count,0),104);
 assert.deepEqual(Array.from(g,x=>x.count),[16,14,10,6,9,12,8,10,7,12]);
 assert.equal(a.filter(x=>x.vegan_status==='non_vegan').length,2);
 assert.equal(a.filter(x=>x.vegan_status!=='non_vegan').length,102);
 assert.ok(a.every(x=>x.verified===false));
 assert.equal((t.renderDiscover().match(/class="product-card"/g)||[]).length,102);
 assert.ok(!t.renderDiscover().includes('Sweet Paprika</h3>'));
 assert.equal((t.renderBoard().match(/data-drag-id="/g)||[]).length,102);
 assert.equal((t.renderBoard().match(/class="tier-lane"/g)||[]).length,5);
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
 assert.equal(matched.length,45);
 assert.ok(matched.every(x=>x.image_url?.startsWith('https://')&&x.image_source_url?.startsWith('https://')));
 assert.ok(matched.filter(x=>x.image_status==='retailer').every(x=>x.retailer_sku&&new URL(x.image_url).pathname.includes('/'+String(x.retailer_sku).padStart(7,'0')+'/')||x.retailer_sku&&new URL(x.image_url).pathname.includes('/'+x.retailer_sku+'/')));
});
test('Drag-board state supports placing, reorder, unrank and blocks nonvegan products',async()=>{
 const {t,localStorage}=fixture();
 assert.equal(t.boardTrayProducts().length,102);
 assert.equal(await t.boardMove('snacks-02','S',0),false);
 assert.equal(t.boardEntries().length,0);
 assert.equal(await t.boardMove('tofu-01','S',0),true);
 assert.equal(await t.boardMove('tofu-04','S',0),true);
 assert.deepEqual(Array.from(t.boardSorted('S'),x=>x.product_id),['tofu-04','tofu-01']);
 assert.equal(await t.boardMove('tofu-01','D',0),true);
 assert.deepEqual(Array.from(t.boardSorted('D'),x=>x.product_id),['tofu-01']);
 assert.equal(t.boardTrayProducts().length,100);
 assert.equal(await t.boardMove('tofu-01','unranked',0),true);
 assert.equal(t.boardTrayProducts().length,101);
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
 assert.equal(t.boardTrayProducts().length,45);
 t.st.boardPhotoFilter='missing';assert.equal(t.boardTrayProducts().length,57);
 t.st.boardPhotoFilter='all';assert.equal(t.boardTrayProducts().length,102);
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
