const {test}=require('node:test');
const assert=require('node:assert/strict');
const priority=require('./priority.js');

const TODAY='2026-10-13';
const notice=(id,{stage='competition',title='Softwareentwicklung und Automatisierung',buyer='Public buyer',deadline='2026-11-04',published='2026-10-12'}={})=>({
  id,stage,title,buyer,published,
  url:'https://ted.europa.eu/en/notice/-/detail/'+id,
  deadline,deadlines:deadline?[{date:deadline,kind:'tender',lot:'LOT-0001'}]:[],
  cpv:['72000000']
});
const fitFor=n=>({score:n.title.includes('Softwareentwicklung')?71:48,excluded:false,reasons:['Software development title','IT services CPV']});
const riskFor=n=>n.title.includes('Miniwettbewerb')?[{level:'high',text:'Framework call-off'}]:
  n.title.includes('Rahmenvereinbarung')?[{level:'medium',text:'Framework participation'}]:[];

test('top three are actual, dated, qualified *for triage*, unique source notices',()=>{
  const input=[
    notice('100001-2026'),
    notice('100002-2026',{buyer:'Other buyer',deadline:'2026-11-08'}),
    notice('100003-2026',{buyer:'Third buyer',deadline:'2026-11-09'}),
    notice('100004-2026',{stage:'result',title:'Softwareentwicklung — award'}),
    notice('100005-2026',{deadline:''}),
    notice('100006-2026',{deadline:'2026-10-12'}),
    notice('100007-2026',{title:'Softwareentwicklung Miniwettbewerb',buyer:'C'}),
    notice('100008-2026',{deadline:'2029-10-08'})
  ];
  const result=priority.selectShortlist(input,{currentDate:TODAY,fitFor,riskFor});
  assert.equal(result.length,3);
  assert.deepEqual(new Set(result.map(x=>x.notice.id)),new Set(['100001-2026','100002-2026','100003-2026']));
  result.forEach(x=>{assert.ok(x.deadline.date>=TODAY);assert.equal(x.notice.stage,'competition');assert.ok(x.why.some(v=>v.startsWith('Matched:')))});
});
test('never invent notices when there is one valid match or none',()=>{
  const records=[notice('100001-2026'),notice('100002-2026',{stage:'result'})];
  const params={currentDate:TODAY,fitFor,riskFor};
  assert.equal(priority.selectShortlist(records,params).length,1);
  assert.equal(priority.selectShortlist([],params).length,0);
  assert.equal(priority.selectShortlist(records,{...params,fitFor:()=>({score:3,excluded:false})}).length,0);
});
test('no-bid and high access warnings do not receive top placement',()=>{
  const records=[
    notice('100001-2026',{title:'Softwareentwicklung Miniwettbewerb'}),
    notice('100002-2026',{buyer:'Other buyer'})
  ];
  const selected=priority.selectShortlist(records,{
    currentDate:TODAY,fitFor,riskFor,decisions:{'100002-2026':{status:'no-bid'}}});
  assert.equal(selected.length,0);
});
test('supplier caution decreases priority but is not claimed as legal disqualification',()=>{
  const records=[
    notice('100001-2026',{title:'Softwareentwicklung Rahmenvereinbarung',buyer:'Public one'}),
    notice('100002-2026',{title:'Softwareentwicklung Standardauftrag',buyer:'Public two'})
  ];
  const result=priority.selectShortlist(records,{currentDate:TODAY,fitFor,riskFor});
  assert.equal(result[0].notice.id,'100002-2026');
  assert.ok(result.some(x=>x.notice.id==='100001-2026'));
});
test('buyer diversity unless fewer than three different buyers exist',()=>{
  const records=[
    notice('100001-2026',{buyer:'Agency Alpha'}),
    notice('100002-2026',{buyer:'Agency Alpha',deadline:'2026-11-05'}),
    notice('100003-2026',{buyer:'Agency Beta',deadline:'2026-11-07'}),
    notice('100004-2026',{buyer:'Agency Gamma',deadline:'2026-11-08'})
  ];
  const result=priority.selectShortlist(records,{currentDate:TODAY,fitFor,riskFor});
  assert.equal(new Set(result.map(x=>x.notice.buyer)).size,3);
});
test('deadline semantics, including separate participation dates, are explicit',()=>{
  const example=notice('100001-2026');
  example.deadlines=[
    {date:'2026-11-04',kind:'tender',lot:'LOT-0002'},
    {date:'2026-10-21',kind:'participation',lot:'LOT-0001'}
  ];
  const deadline=priority.nearestFutureDeadline(example,TODAY);
  assert.equal(deadline.date,'2026-10-21');
  assert.equal(deadline.kind,'participation');
  assert.equal(priority.daysBetween(TODAY,deadline.date),8);
  assert.equal(priority.safeDate('2026-02-30'),'');
});
test('next action is truthful about urgency, uncertainty and missing candidates',()=>{
  const c=priority.selectShortlist([notice('100001-2026',{deadline:'2026-10-23'})],{currentDate:TODAY,fitFor,riskFor})[0];
  assert.match(priority.nextAction(c).heading,/exact submission deadline/);
  assert.match(priority.nextAction(c,true).heading,/still current/);
  assert.match(priority.nextAction(null).heading,/company profile/);
});
