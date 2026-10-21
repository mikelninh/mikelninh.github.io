const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const api=require('./ai-proof.js');

test('100-case queue is unmistakably fictional, prioritizes exceptions and never pays',()=>{
 const queue=api.simulateQueue();
 assert.equal(queue.length,100);
 assert.ok(queue.every(x=>x.fictional===true));
 assert.equal(queue.filter(x=>x.priority===1).length,9);
 assert.equal(queue.filter(x=>x.route==='HUMAN_REVIEW').length,26);
 assert.equal(queue.filter(x=>x.route==='NEED_INFO').length,26);
 assert.equal(queue.filter(x=>x.route==='CONTINUE_CHECKS').length,48);
 assert.ok(queue.every(x=>!('paid' in x)));
});
test('recorded model metrics derive only from actual report rows, not simulation',()=>{
 assert.equal(api.summarize(null),null);
 assert.equal(api.summarize({status:'synthetic_mock',rows:[]}),null);
 const r=api.summarize({status:'RECORDED_REAL_OPENAI_API_RUN',rows:[
  {expected:'HUMAN_REVIEW',route:'HUMAN_REVIEW',matches_authored_expected:true,evidence_valid:true},
  {expected:'NEED_INFO',route:'CONTINUE_CHECKS',matches_authored_expected:false,evidence_valid:false}
 ]});
 assert.equal(r.n,2);assert.equal(r.matched,1);assert.equal(r.unsafe,1);assert.equal(r.invalid,1);
});
test('page makes model-vs-rule boundaries and quality measurement visible',()=>{
 const html=fs.readFileSync(path.join(__dirname,'operator-shift.html'),'utf8');
 for(const id of ['ai-evidence','ai-loading','ai-snapshot','ai-doc-a','ai-doc-b','ai-case-select',
    'ai-extract-a','ai-extract-b','ai-quote-a','ai-quote-b','ai-result','ai-source-valid',
    'ai-score','ai-unsafe','ai-source','shadow-mode','ai-queue-count','ai-queue-critical',
    'ai-queue-review','ai-queue-info','ai-queue-continue','engineering-tour'])
    assert.ok(html.includes('id="'+id+'"'),'Missing '+id);
 assert.match(html,/recording of prior paid API calls/);
 assert.match(html,/not a new API request/);
 assert.match(html,/an invented|invented|generated workload/);
 assert.match(html,/Actual pilot gate/);
 assert.match(html,/api_call → evaluate_extraction → build_report/);
 assert.match(html,/src="\/inca\/ai-proof\.js"/);
});
