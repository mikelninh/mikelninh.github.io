import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const ROOT=path.resolve(import.meta.dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'protein-target.js'),'utf8');
function make(saved){
 const calls={},store={...saved};
 const window={};
 const document={addEventListener(name,fn){calls[name]=fn}};
 const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
 vm.runInNewContext(src,{window,document,localStorage,Intl,console});
 return {t:window.GT_PROTEIN_TARGET,calls,store};
}
test('Default example is 50g, explicitly not a universal nutritional requirement',()=>{
 const {t}=make();
 assert.equal(t.target(),50);
 assert.match(t.panel(),/kein allgemeingültiger persönlicher Bedarf/);
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
 assert.match(t.metric(.95,24),/Tagesziel eingeben/);
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
