const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'catch-the-mistake.js'),'utf8');
const context={module:{exports:{}}};
vm.runInNewContext(source,context,{filename:'catch-the-mistake.js'});
const api=context.module.exports;
test('known H-A-011 synthetic failure and proposed gate are not conflated',()=>{
  assert.equal(api.original.source,'H-A-011 · developer-authored synthetic holdout A');
  assert.equal(api.original.recordedV2,'AUTO_READY');
  assert.equal(api.original.proposedV3,'HUMAN_REVIEW');
  assert.match(api.original.note,/illustrative reconstruction/);
});
test('choosing continue reveals the recorded routing miss',()=>{
  const x=api.decide('continue');
  assert.equal(x.caught,false);
  assert.equal(x.oldRoute,'AUTO_READY');
  assert.equal(x.updatedRoute,'HUMAN_REVIEW');
  assert.match(x.heading,/mistake/);
  assert.equal(x.effects,0);
});
test('choosing human review identifies the contradiction',()=>{
  const x=api.decide('review');
  assert.equal(x.caught,true);
  assert.match(x.explanation,/human review/i);
  assert.equal(x.effects,0);
});
test('invalid choices do not receive a fabricated result',()=>{
  assert.throws(()=>api.decide('pay'),/invalid_choice/);
  assert.throws(()=>api.decide(null),/invalid_choice/);
});
test('visible HTML contains two sources, exact reconstructed dates, reveal and three-step story',()=>{
  const html=fs.readFileSync(path.join(__dirname,'60s.html'),'utf8');
  for(const x of ['id="mistake-challenge"','data-mc-choice="continue"','data-mc-choice="review"',
    'id="mc-reveal"','id="mc-reset"','id="mc-status"',
    '11.07.2026','12.07.2026','RECORDED GUARDED V2','PROPOSED V3 REPLAY',
    'id="case-workshop"','src="/inca/catch-the-mistake.js"']){
      assert.ok(html.includes(x), 'Missing challenge feature '+x);
  }
  assert.match(html,/All documents are fictional/);
  assert.match(html,/travel example ST-104 reconstructs/);
  assert.match(html,/01 · PROBLEM/);
  assert.match(html,/02 · BUILT/);
  assert.match(html,/03 · TRY/);
});
test('existing case-editing route still works separately',()=>{
 const editor=fs.readFileSync(path.join(__dirname,'interactive-case.js'),'utf8');
 assert.match(editor,/function evaluate\(docA,docB\)/);
 assert.match(editor,/HUMAN_REVIEW/);
});

test('three fictional cases have different valid next steps and no payout',()=>{
  assert.equal(api.cases.length,3);
  assert.equal(new Set(api.cases.map(c=>c.id)).size,3);
  assert.deepEqual(Array.from(api.cases,c=>c.correct),['review','need_info','continue']);
  assert.deepEqual(Array.from(api.cases,c=>c.route),['HUMAN_REVIEW','NEED_INFO','CONTINUE_CHECKS']);
  assert.equal(api.cases[0].before.value,'AUTO_READY');
  assert.equal(api.cases[0].after.value,'HUMAN_REVIEW');
  for(const c of api.cases){
    assert.ok(c.docA.value);
    assert.ok(c.docB.value);
    assert.equal(api.decide(c.correct,c.id).correct,true);
    assert.equal(api.decide(c.correct,c.id).effects,0);
    assert.ok(c.provenance.includes('fictional')||c.provenance.includes('illustrative'));
  }
});
test('all three choices are meaningful: no automatic approval or fictional history',()=>{
  const a=api.decide('review','ST-104');
  const b=api.decide('need_info','ST-207');
  const c=api.decide('continue','ST-318');
  assert.equal(a.original.source,api.original.source);
  assert.equal(b.original,null);
  assert.equal(c.original,null);
  assert.match(b.explanation,/missing|no second|information/i);
  assert.match(c.explanation,/not approval/i);
  assert.equal(api.decide('review','ST-207').correct,false);
  assert.equal(api.decide('need_info','ST-318').correct,false);
  assert.throws(()=>api.decide('continue','ST-999'),/invalid_case/);
  assert.throws(()=>api.decide('pay','ST-318'),/invalid_choice/);
});
test('challenge UI includes three named cases, three route choices and score counter',()=>{
  const html=fs.readFileSync(path.join(__dirname,'60s.html'),'utf8');
  for(const id of ['ST-104','ST-207','ST-318']){
    assert.ok(html.includes('data-mc-case="'+id+'"'));
  }
  for(const choice of ['continue','need_info','review']){
    assert.ok(html.includes('data-mc-choice="'+choice+'"'));
  }
  for(const id of ['mc-case-progress','mc-correct-count','mc-progress-bar','mc-claim-type',
    'mc-doc-a-check','mc-doc-b-check','mc-finish','mc-finish-score','mc-finish-copy','mc-next','mc-old-route','mc-new-route','mc-doc-b-date']){
    assert.ok(html.includes('id="'+id+'"'));
  }
});
test('browser-style interactions switch cases, record decisions and replay all without effects',()=>{
  const nodes={};
  function makeNode(attrs={}){
    const n={
      attrs:{...attrs},listeners:{},textContent:'',hidden:false,disabled:false,value:0,
      classList:{toggle(){},add(){},remove(){}},
      getAttribute(k){return this.attrs[k]??null},
      setAttribute(k,v){this.attrs[k]=String(v)},
      addEventListener(k,fn){this.listeners[k]=fn},
      focus(){this.focused=true},
      click(){assert.equal(typeof this.listeners.click,'function');this.listeners.click()}
    };
    return n;
  }
  const tags=['mistake-challenge','mc-reveal','mc-status','mc-result-heading','mc-result-description',
    'mc-reset','mc-next','mc-heading','mc-case-id','mc-case-name','mc-case-caption','mc-claim-type',
    'mc-case-progress','mc-correct-count','mc-progress-bar','mc-finish','mc-finish-score','mc-finish-copy',
    'mc-doc-a-check','mc-doc-b-check','mc-doc-a-type','mc-doc-a-title','mc-doc-a-date','mc-doc-a-body',
    'mc-doc-b-type','mc-doc-b-title','mc-doc-b-date','mc-doc-b-body',
    'mc-old-label','mc-old-route','mc-old-explanation','mc-new-label','mc-new-route',
    'mc-new-explanation','mc-difference','mc-takeaway-text','mc-provenance'];
  for(const id of tags)nodes[id]=makeNode();
  const actions=api.choices.map(choice=>makeNode({'data-mc-choice':choice}));
  const tabs=api.cases.map(c=>makeNode({'data-mc-case':c.id}));
  nodes['mistake-challenge'].querySelectorAll=(q)=>{
    if(q==='[data-mc-choice]')return actions;
    if(q==='[data-mc-case]')return tabs;
    return [];
  };
  const doc={getElementById:(id)=>nodes[id]||null};
  api.mount(doc);
  assert.equal(nodes['mc-case-id'].textContent,'ST-104');
  assert.equal(nodes['mc-case-progress'].textContent,'0 / 3 decisions');
  tabs[1].click();
  assert.equal(nodes['mc-case-id'].textContent,'ST-207');
  assert.equal(nodes['mc-doc-b-date'].textContent,'NOT RECEIVED');
  assert.equal(nodes['mc-doc-a-check'].textContent,'PHOTO EVIDENCE');
  assert.equal(nodes['mc-claim-type'].textContent,'HOME CLAIM');
  actions.find(x=>x.attrs['data-mc-choice']==='need_info').click();
  assert.equal(nodes['mc-new-route'].textContent,'NEED_INFO');
  assert.equal(nodes['mc-case-progress'].textContent,'1 / 3 decisions');
  nodes['mc-next'].click();
  assert.equal(nodes['mc-case-id'].textContent,'ST-104');
  actions.find(x=>x.attrs['data-mc-choice']==='review').click();
  assert.equal(nodes['mc-old-route'].textContent,'AUTO_READY');
  assert.equal(nodes['mc-new-route'].textContent,'HUMAN_REVIEW');
  nodes['mc-next'].click();
  assert.equal(nodes['mc-case-id'].textContent,'ST-318');
  actions.find(x=>x.attrs['data-mc-choice']==='continue').click();
  assert.equal(nodes['mc-new-route'].textContent,'CONTINUE_CHECKS');
  assert.equal(nodes['mc-doc-a-check'].textContent,'FRAME NUMBER');
  assert.equal(nodes['mc-doc-b-date'].textContent,'BIKE-4832');
  assert.equal(nodes['mc-claim-type'].textContent,'THEFT CLAIM');
  assert.equal(nodes['mc-case-progress'].textContent,'3 / 3 decisions');
  assert.equal(nodes['mc-correct-count'].textContent,'3 correct');
  assert.equal(nodes['mc-finish'].hidden,false);
  assert.equal(nodes['mc-finish-score'].textContent,'3 / 3');
  nodes['mc-next'].click();
  assert.equal(nodes['mc-case-progress'].textContent,'0 / 3 decisions');
  assert.equal(nodes['mc-case-id'].textContent,'ST-104');
  assert.equal(nodes['mc-finish'].hidden,true);
});

test('sample cases cover three distinct evidence types, not only travel dates',()=>{
 assert.deepEqual(Array.from(api.cases,c=>c.claimType),['TRAVEL CLAIM','HOME CLAIM','THEFT CLAIM']);
 assert.deepEqual(Array.from(api.cases,c=>c.checkLabel),['CANCELLATION DATE','PHOTO EVIDENCE','FRAME NUMBER']);
 const home=api.cases.find(c=>c.id==='ST-207');
 assert.match(home.docA.body,/Fotos/);
 assert.match(home.docB.body,/fehlen/);
 assert.equal(home.docB.value,'NOT RECEIVED');
 const bike=api.cases.find(c=>c.id==='ST-318');
 assert.equal(bike.docA.value,bike.docB.value);
 assert.equal(bike.docA.type,'POLICE REPORT');
 assert.equal(bike.docB.type,'PURCHASE RECEIPT');
 assert.match(api.decide('continue',bike.id).explanation,/not approval/);
});
test('final screen is explicitly synthetic and does not claim production throughput',()=>{
 const html=fs.readFileSync(path.join(__dirname,'60s.html'),'utf8');
 assert.match(html,/YOUR OPERATIONS SHIFT · COMPLETED/);
 assert.match(html,/Correct decisions/);
 assert.match(html,/External actions/);
 assert.match(html,/Continue checks ≠ payment approval/);
 assert.match(html,/These are synthetic training cases/);
});
