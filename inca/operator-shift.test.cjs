const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function load(file){
 const context={module:{exports:{}},Event:class Event{constructor(type){this.type=type}},
  Blob:class Blob{constructor(parts,opts){this.parts=parts;this.type=opts.type}},
  URL:{createObjectURL(){return 'blob:unit-test'},revokeObjectURL(){}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context,{filename:file});
 return context.module.exports;
}
const core=load('interactive-case.js');
const shift=load('operator-shift.js');
test('synthetic historical failure and reconstructed source documents remain distinct',()=>{
 assert.equal(shift.sample.sourceCase,'H-A-011');
 assert.equal(shift.sample.id,'ST-104');
 assert.equal(shift.sample.fictional,true);
 assert.equal(shift.sample.policy,'REI-COV-01');
 assert.match(shift.sample.a,/11.07.2026/);
 assert.match(shift.sample.b,/12.07.2026/);
});
test('end-to-end evidence step identifies a conflict and cites both labelled dates',()=>{
 const v=shift.analyze(core,shift.sample.a,shift.sample.b);
 assert.equal(v.route,'HUMAN_REVIEW');
 assert.equal(v.reviewRequired,true);
 assert.equal(v.externalActions,0);
 assert.match(v.snippets[0],/11.07.2026/);
 assert.match(v.snippets[1],/12.07.2026/);
 assert.match(v.boundary,/not a PDF parser|Not a PDF parser/i);
});
test('missing information and matching values lead to different safe next checks',()=>{
 const missing=shift.analyze(core,shift.sample.a,'Buchungsinformation: noch nicht vorhanden');
 assert.equal(missing.route,'NEED_INFO');
 const same=shift.analyze(core,shift.sample.a,shift.sample.b.replace('12.07.2026','11.07.2026'));
 assert.equal(same.route,'CONTINUE_CHECKS');
 assert.match(same.action,/No payout/);
 const hand=shift.prepareHandoff(core,{a:shift.sample.a,b:shift.sample.b.replace('12.07.2026','11.07.2026'),verified:true,owner:'Routine check operator',notes:'Dates match. Remaining coverage checks must still be completed.',route:'CONTINUE_CHECKS'});
 assert.match(hand.preview.handBack,/Coverage, eligibility/);
 assert.equal(same.externalActions,0);
});
test('review packet requires evidence confirmation, owner and substantive question',()=>{
 const base={a:shift.sample.a,b:shift.sample.b,route:'HUMAN_REVIEW',verified:true,
   owner:'Claims expert · Travel queue',notes:'Verify both original cancellation dates and document the correct one.'};
 assert.throws(()=>shift.prepareHandoff(core,{...base,verified:false}),/source_verification_required/);
 assert.throws(()=>shift.prepareHandoff(core,{...base,owner:''}),/review_owner_required/);
 assert.throws(()=>shift.prepareHandoff(core,{...base,notes:'unclear'}),/substantive_reviewer_note_required/);
 const h=shift.prepareHandoff(core,base);
 assert.equal(h.route,'HUMAN_REVIEW');
 assert.equal(h.externalActions,0);
 assert.match(h.preview.handBack,/Original cancellation date verified/);
 assert.equal(h.preview.owner,base.owner);
 assert.match(h.text,/NOT SENT/);
 assert.match(h.text,/Owner acceptance: NOT CONFIRMED/);
 assert.match(h.text,/11.07.2026/);
 assert.match(h.text,/12.07.2026/);
 assert.match(h.text,/No external messages, payments or case-management writes occurred/);
});
test('cannot falsely clear a conflicting case by changing reviewer route',()=>{
 assert.throws(()=>shift.prepareHandoff(core,{
   a:shift.sample.a,b:shift.sample.b,verified:true,owner:'Claims reviewer',
   notes:'Try to bypass documented source contradiction',route:'CONTINUE_CHECKS'
 }),/unsafe_route_override/);
});
test('candidate regression fixture remains unapproved and not counted as fresh evaluation',()=>{
 assert.throws(()=>shift.regression(core,{a:shift.sample.a,b:shift.sample.b,
   expected:'HUMAN_REVIEW',why:'oops'}),/explain_expected_route/);
 const c=shift.regression(core,{a:shift.sample.a,b:shift.sample.b,
   expected:'NEED_INFO',why:'Original dated booking source is not trustworthy.'});
 assert.equal(c.disagreement,true);
 assert.equal(c.production_case,false);
 assert.equal(c.external_actions,0);
 assert.match(c.note,/not automatically added to CI/);
 assert.equal(c.documents.length,2);
});
test('page publishes complete operator sequence, controls and explicit caveats',()=>{
 const html=fs.readFileSync(path.join(__dirname,'operator-shift.html'),'utf8');
 for(const id of ['shift-app','sh-a','sh-b','sh-scan','sh-review','sh-export','sh-regression',
   'sh-owner','sh-notes','sh-confirm','sh-preview','sh-preview-action','sh-draft',
   'sh-fixture-expected','sh-fixture-why','sh-reset','sh-review-error','sh-qa-status','sh-preview-handback']){
   assert.ok(html.includes('id="'+id+'"'), 'Missing operator control: '+id);
 }
 assert.match(html,/Intake/);assert.match(html,/Verify/);assert.match(html,/Review/);
 assert.match(html,/Handoff/);assert.match(html,/Improve/);
 assert.match(html,/Not a re-measurement of the old holdout/);
 assert.match(html,/No insurer documents, no real claims expert sign-off/);
 assert.match(html,/src="\/inca\/interactive-case\.js"/);
 assert.match(html,/src="\/inca\/operator-shift\.js"/);
});
test('browser workflow: a changed source invalidates the approved local handoff',()=>{
 const n={};
 function element(){
   return {textContent:'',value:'',hidden:false,disabled:false,checked:false,
     listeners:{},attrs:{},setAttribute(k,v){this.attrs[k]=String(v)},
     addEventListener(k,f){this.listeners[k]=f},
     dispatchEvent(e){this.fire(e.type)},
     fire(k){const fn=this.listeners[k];if(typeof fn!=='function')throw Error('no handler '+k);fn();}
   };
 }
 const ids=['shift-app','sh-a','sh-b','sh-scan','sh-review','sh-export','sh-regression','sh-status',
   'sh-route','sh-reason','sh-quote-a','sh-quote-b','sh-old','sh-new','sh-preview',
   'sh-review-step','sh-export-step','sh-qa-step','sh-confirm','sh-next','sh-draft',
   'sh-route-next','sh-fixture-expected','sh-fixture-why','sh-owner','sh-notes',
   'sh-stage-2','sh-stage-3','sh-stage-4','sh-stage-5','sh-review-error',
   'sh-preview-owner','sh-preview-route','sh-preview-action','sh-preview-draft','sh-preview-handback',
   'sh-qa-status','sh-reset','sh-auto-preview','sh-auto-owner','sh-auto-question','sh-auto-action',
   'sh-auto-a','sh-auto-b','sh-suggested-owner','sh-suggested-note','sh-use-owner',
   'sh-feedback-result','sh-feedback-next','sh-feedback-title'];
 for(const id of ids)n[id]=element();
 const questionChips=[element(),element(),element()];
 const downloads=[];
 const doc={getElementById:id=>n[id]||null,
   querySelectorAll:sel=>sel==='[data-sh-question]'?questionChips:[],
   body:{appendChild(){}},
   createElement:tag=>({
     href:'',download:'',remove(){},
     click(){downloads.push({name:this.download,href:this.href})}
   })};
 shift.mount(doc,core);
 n['sh-a'].value=shift.sample.a;n['sh-b'].value=shift.sample.b;
 n['sh-scan'].fire('click');
 assert.equal(n['sh-auto-preview'].hidden,false);
 assert.equal(n['sh-auto-owner'].textContent,'Claims expert · Travel queue');
 assert.match(n['sh-auto-question'].textContent,/cancellation date/);
 assert.equal(n['sh-owner'].value,'Claims expert · Travel queue');
 assert.match(n['sh-notes'].value,/original documents/);
 assert.equal(n['sh-route'].textContent,'HUMAN_REVIEW');
 assert.equal(n['sh-review'].disabled,false);
 questionChips[1].fire('click');
 assert.match(n['sh-notes'].value,/booking-system update/);
 n['sh-owner'].value='Claims expert · Queue 1';
 n['sh-notes'].value='Verify which of the two cancellation dates is supported by the originals.';
 n['sh-confirm'].checked=true;
 n['sh-review'].fire('click');
 assert.equal(n['sh-export'].disabled,false);
 assert.equal(n['sh-export-step'].hidden,false);
 assert.equal(n['sh-preview-owner'].textContent,'Claims expert · Queue 1');
 n['sh-notes'].value='Confirm the cancellation timestamp with the booking provider and client originals.';
 n['sh-notes'].fire('input');
 assert.equal(n['sh-export'].disabled,true);
 assert.equal(n['sh-export-step'].hidden,true);
 n['sh-review'].fire('click');
 assert.equal(n['sh-export'].disabled,false);
 n['sh-export'].fire('click');
 assert.match(downloads[0].name,/human-review-handoff\.md/);
 assert.match(n['sh-status'].textContent,/No external case or customer action/);
 n['sh-fixture-expected'].value='NEED_INFO';
 n['sh-fixture-why'].value='The original timestamp must be independently checked against the booking provider.';
 n['sh-regression'].fire('click');
 assert.equal(n['sh-feedback-result'].hidden,false);
 assert.match(n['sh-feedback-title'].textContent,/Simulated disagreement/);
 assert.match(n['sh-feedback-next'].textContent,/NOT modify the rule/);
 assert.match(downloads[1].name,/correction-CANDIDATE\.json/);
 n['sh-b'].value=n['sh-b'].value.replace('12.07.2026','11.07.2026');
 n['sh-b'].fire('input');
 assert.equal(n['sh-review'].disabled,true);
 assert.equal(n['sh-export'].disabled,true);
 assert.equal(n['sh-export-step'].hidden,true);
 assert.equal(n['sh-auto-preview'].hidden,true);
 n['sh-scan'].fire('click');
 assert.equal(n['sh-route'].textContent,'CONTINUE_CHECKS');
 assert.equal(n['sh-owner'].value,'Claims operations · Coverage checks');
 assert.match(n['sh-notes'].value,/coverage and policy checks/);
 n['sh-reset'].fire('click');
 assert.equal(n['sh-a'].value,shift.sample.a);
 assert.equal(n['sh-b'].value,shift.sample.b);
 assert.equal(n['sh-export'].disabled,true);
});

test('route-aware handoff suggestions are editable, evidence-specific and bounded',()=>{
 const views=[
  shift.analyze(core,shift.sample.a,shift.sample.b),
  shift.analyze(core,shift.sample.a,'Booking record missing'),
  shift.analyze(core,shift.sample.a,shift.sample.b.replace('12.07.2026','11.07.2026'))
 ];
 const suggestions=views.map(v=>shift.suggestHandoff(v));
 assert.deepEqual(Array.from(suggestions,x=>x.route),['HUMAN_REVIEW','NEED_INFO','CONTINUE_CHECKS']);
 assert.equal(suggestions[0].owner,'Claims expert · Travel queue');
 assert.equal(suggestions[1].owner,'Claims intake · Evidence request');
 assert.equal(suggestions[2].owner,'Claims operations · Coverage checks');
 for(const suggestion of suggestions){
  assert.equal(suggestion.questions.length,3);
  assert.equal(suggestion.questions[0],suggestion.note);
  assert.match(suggestion.status,/NOT SENT/);
  assert.equal(suggestion.evidence.length,2);
 }
 assert.match(suggestions[0].evidence[0],/11.07.2026/);
 assert.match(suggestions[0].evidence[1],/12.07.2026/);
 assert.throws(()=>shift.suggestHandoff({route:'AUTO_READY'}),/invalid_route/);
});
test('suggestions, simulated after-handoff response and future release gates are visible',()=>{
 const html=fs.readFileSync(path.join(__dirname,'operator-shift.html'),'utf8');
 for(const id of ['sh-auto-preview','sh-auto-owner','sh-auto-question','sh-auto-action','sh-auto-a','sh-auto-b',
  'sh-suggested-owner','sh-suggested-note','sh-use-owner','sh-feedback-result','sh-feedback-next','sh-feedback-title']){
   assert.ok(html.includes('id="'+id+'"'),'Missing '+id);
 }
 for(const n of [0,1,2])assert.match(html,new RegExp('data-sh-question="'+n+'"'));
 assert.match(html,/Reviewer response/);
 assert.match(html,/Independent review \+ CI/);
 assert.match(html,/Shadow-mode metrics/);
 assert.match(html,/No actual INCA expert reviews anything on this page/);
});
test('simulated reviewer candidate distinguishes agreement from proposed correction without self-training',()=>{
 const agree=shift.regression(core,{a:shift.sample.a,b:shift.sample.b,
   expected:'HUMAN_REVIEW',why:'The cancellation dates in the two synthetic texts conflict.'});
 const change=shift.regression(core,{a:shift.sample.a,b:shift.sample.b,
   expected:'NEED_INFO',why:'Original sources do not establish a trustworthy cancellation date.'});
 assert.equal(agree.candidate_kind,'AGREEMENT_CONTROL');
 assert.equal(change.candidate_kind,'CORRECTION_PROPOSAL');
 assert.equal(agree.feedback_origin,'USER-SIMULATED · NOT AN INCA CLAIMS EXPERT');
 assert.equal(agree.improvement_steps.length,5);
 assert.match(change.improvement_steps[1],/NOT DONE/);
 assert.match(change.improvement_steps[2],/NOT DONE/);
 assert.equal(change.external_actions,0);
});
