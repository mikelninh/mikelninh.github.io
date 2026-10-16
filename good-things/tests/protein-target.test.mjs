import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const ROOT=path.resolve(import.meta.dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'protein-target.js'),'utf8');
function make(saved,options={}){
 const calls={},store={...saved};
 const window={GT_CATALOG:options.catalog||[],GT_RETAIL_PRICE_SNAPSHOTS:options.prices||[]};
 const document={addEventListener(name,fn){calls[name]=fn}};
 const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
 vm.runInNewContext(src,{window,document,localStorage,Intl,console,URL,location:{href:options.href||'https://mikelninh.github.io/good-things/protein.html'}});
 return {t:window.GT_PROTEIN_TARGET,calls,store};
}
test('Default example is 50g, explicitly not a universal nutritional requirement',()=>{
 const {t}=make();
 assert.equal(t.target(),50);
 assert.match(t.panel(),/keine allgemeingültige Empfehlung/);
 assert.match(t.panel(),/data-gt-target-field="weight"/);
 assert.match(t.panel(),/data-gt-target-field="factor"/);
 assert.match(t.panel(),/Rechnerisch \/ Tag/);
 assert.match(t.panel(),/Für 30 Tage/);
 assert.match(t.panel(),/DGE-Referenzwerte/);
});
test('Personal weight 70 kg × 0.8 yields 56g; 65+ yields 70g',()=>{
 const {t}=make();
 t.set('mode','weight');
 assert.equal(t.target(),null);
 t.set('weight','70');
 assert.ok(Math.abs(t.target()-56)<1e-10);
 t.set('factor','1');
 assert.equal(t.target(),70);
 t.set('factor','1.6');
 assert.equal(t.target(),112);
});
test('Fractional equivalent is separated from cash paid for full packs',()=>{
 const {t}=make();
 t.set('mode','weight');t.set('weight','70');
 const x=t.cost(.95,24);
 assert.ok(Math.abs(x.equivalentCost-(56/24*.95))<1e-8);
 assert.equal(x.fullPacks,3);
 assert.ok(Math.abs(x.fullPackCost-2.85)<1e-8);
 assert.equal(x.wholeProtein,72);
 assert.match(t.metric(.95,24),/Ganze Packungen: 3/);
});
test('Missing values never turn into zero-cost protein or a valid day',()=>{
 const {t}=make();
 assert.equal(t.cost(0,24),null);
 assert.equal(t.cost(.95,0),null);
 assert.equal(t.cost(undefined,24),null);
 assert.equal(t.cost(.95,NaN),null);
 t.set('mode','weight');
 assert.equal(t.cost(.95,24),null);
 assert.match(t.metric(.95,24),/Persönliches Ziel eingeben/);
});
test('Invalid weight and custom values do not become recommendations',()=>{
 const {t}=make();
 t.set('mode','weight');
 t.set('weight','500');assert.equal(t.target(),null);
 t.set('weight','0');assert.equal(t.target(),null);
 t.set('weight','75');assert.equal(t.target(),60);
 t.set('mode','custom');t.set('custom','100');assert.equal(t.target(),100);
 t.set('custom','');assert.equal(t.target(),null);
 t.set('custom','600');assert.equal(t.target(),null);
});
test('Weight and personal target stay in memory unless user opts into local storage',()=>{
 const {t,store}=make();
 t.set('mode','weight');t.set('weight','80');
 assert.equal(Object.keys(store).length,0);
 t.set('remember',true);
 const key='goodthings_protein_target_v31';
 assert.ok(store[key]);
 assert.equal(JSON.parse(store[key]).weight,80);
 t.set('remember',false);
 assert.equal(Object.keys(store).length,0);
});
test('Reload restores remembered only; reset clears it',()=>{
 const key='goodthings_protein_target_v31';
 const record={[key]:JSON.stringify({remember:true,mode:'custom',custom:123,weight:null,factor:.8})};
 const {t,store}=make(record);
 assert.equal(t.target(),123);
 t.set('reset');
 assert.equal(t.target(),50);
 assert.equal(Object.keys(store).length,0);
});
test('Changing the goal keeps €/g ranking mathematically unchanged',()=>{
 const {t}=make();
 const prices=[[1,20],[1.8,30],[2.2,40]];
 const order=goal=>{t.set('custom',String(goal));t.set('mode','custom');return prices.map((x,i)=>({i,c:t.cost(x[0],x[1]).equivalentCost})).sort((a,b)=>a.c-b.c).map(x=>x.i).join(',')};
 assert.equal(order(50),order(110));
});


const tofuExample=()=>{
 const catalog=[{id:'dm-bio-tofu-natur-4067796251999',barcode:'4067796251999',store:'DM',brand:'dmBio',name:'Tofu Natur',quantity:'200 g',nutrition:{protein:12},vegan_status:'source_checked'}];
 const prices=[{barcode:'4067796251999',store:'dm online',source_type:'official_online',price:.95,date:'2026-10-16',source:'https://www.dm.de/p/d/1457962/dmbio-tofu-natur'}];
 return {catalog,prices};
};
test('Personal direct link prefills 63kg × 1.2g/kg without saving weight to storage',()=>{
 const {t,store}=make({}, {...tofuExample(),href:'https://mikelninh.github.io/good-things/protein.html?weight=63&factor=1.2'});
 assert.equal(t.state.mode,'weight');
 assert.equal(t.state.weight,63);
 assert.equal(t.state.factor,1.2);
 assert.ok(Math.abs(t.target()-75.6)<1e-9);
 assert.match(t.panel(),/75,6/);
 assert.match(t.panel(),/2\.268/);
 assert.match(t.panel(),/value="63"/);
 assert.match(t.panel(),/value="1.2" selected/);
 assert.deepEqual(Object.keys(store),[]);
});
test('Recalculates daily and monthly theoretical cost plus whole-pack budget',()=>{
 const {t}=make({}, {...tofuExample(),href:'https://mikelninh.github.io/good-things/protein.html?weight=63&factor=1.2'});
 const c=t.cost(.95,24);
 assert.ok(Math.abs(c.equivalentCost-2.9925)<1e-9);
 assert.ok(Math.abs(c.monthlyEquivalentCost-89.775)<1e-8);
 assert.equal(c.fullPacks,4);
 assert.ok(Math.abs(c.fullPackCost-3.8)<1e-9);
 assert.equal(c.monthlyFullPacks,95);
 assert.ok(Math.abs(c.monthlyFullPackCost-90.25)<1e-9);
 assert.equal(c.monthProtein,2268);
 const card=t.panel();
 for(const number of ['2,99', '89,78', '3,80', '90,25'])assert.ok(card.includes(number), 'missing '+number);
 assert.match(card,/Onlinepreis/);
 assert.match(card,/kein bestätigter Filialpreis/i);
 assert.match(t.metric(.95,24),/2,99/);
 assert.match(t.metric(.95,24),/89,78/);
});
test('Visible weight input auto-switches from 50g example and factor changes update immediately',()=>{
 const {t}=make();
 assert.equal(t.state.mode,'example');
 assert.equal(t.target(),50);
 t.set('weight','63');
 assert.equal(t.state.mode,'weight');
 assert.equal(t.target(),50.4);
 t.set('factor','1.2');
 assert.ok(Math.abs(t.target()-75.6)<1e-9);
 t.set('mode','example');
 assert.equal(t.target(),50);
 assert.equal(t.state.weight,63);
});
test('Reference example requires exact GTIN, product quantity, protein and price source',()=>{
 const {catalog,prices}=tofuExample();
 for(const modified of [
  {catalog:catalog.map(p=>({...p,barcode:'wrong'})),prices},
  {catalog:catalog.map(p=>({...p,nutrition:{}})),prices},
  {catalog,prices:prices.map(p=>({...p,source:'http://insecure.example'}))},
  {catalog,prices:prices.map(p=>({...p,price:null}))}
 ]){
  const {t}=make({},modified);
  assert.equal(t.reference(),null);
  assert.match(t.panel(),/Preisbeispiel noch nicht verfügbar/);
 }
});
test('Thirty-day purchasing rounds once for pooled monthly portions, not 4 packs × 30 days',()=>{
 const {t}=make();
 t.set('mode','weight');t.set('weight','63');t.set('factor','1.2');
 const c=t.cost(.95,24);
 assert.equal(c.monthlyFullPacks,95);
 assert.notEqual(c.monthlyFullPacks,c.fullPacks*30);
 assert.equal(t.monthDays,30);
});
