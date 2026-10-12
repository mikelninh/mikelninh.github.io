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
 "window.__qa={render,renderDiscover,renderOurs,renderMy,renderCommunity,ourPreview,filteredProducts,saveRating,st,snapshotUrl,decodeSnapshot};document.addEventListener('click',async(event)=>{");
 assert.ok(injected.includes('window.__qa={'),'Expected app injection point is missing');
 vm.runInNewContext(injected,context);
 return {context,t:window.__qa,localStorage};
}
test('Scripts parse, all public assets linked, and ratings default private in schema',()=>{
 assert.doesNotThrow(()=>new vm.Script(source));
 assert.doesNotThrow(()=>new vm.Script(catalog));
 assert.ok(index.includes('./catalog.js')&&index.includes('./app.js')&&index.includes('./styles.css'));
 assert.match(schema,/is_public boolean not null default false,\s*\n\s*updated_at/);
});
test('102 distinct candidate products in ten categories',()=>{
 const {context,t}=fixture();
 const a=context.window.GT_CATALOG,g=context.window.GT_GROUPS;
 assert.equal(a.length,102);assert.equal(g.length,10);
 assert.equal(new Set(a.map(x=>x.id)).size,102);
 assert.equal(g.reduce((sum,x)=>sum+x.count,0),102);
 assert.deepEqual(Array.from(g,x=>x.count),[16,14,10,6,9,12,8,8,7,12]);
 assert.ok(a.every(x=>x.verified===false));
 assert.equal((t.renderDiscover().match(/class="product-card"/g)||[]).length,102);
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
