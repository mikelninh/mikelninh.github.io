/* Browser-less smoke tests for BidPilot's real client, using only built-in Node. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/app.js','utf8');

function makeEnv(payload){
  const ids=new Map();
  class Element{
    constructor(tag='div'){this.tagName=tag;this.children=[];this.handlers={};this.value='';this._text='';this.attrs={};this.className='';this.classList={add:()=>{},remove:()=>{},toggle:()=>{}};}
    set id(v){this._id=v;ids.set(v,this)}
    get id(){return this._id}
    set textContent(v){this._text=String(v);this.children=[]}
    get textContent(){return this._text}
    append(...children){this.children.push(...children)}
    replaceChildren(...children){this.children=[...children]}
    setAttribute(key,value){this.attrs[key]=value}
    addEventListener(key,cb){this.handlers[key]=cb}
    focus(){}
    click(){if(this.handlers.click)this.handlers.click()}
  }
  const domIds=['profileForm','search','sort','typeFilter','deadlineFilter','riskFilter','allFilter','savedFilter','export','company','keywords','exclude','scoreMin','profileMessage','feedWarning','resultsCount','summary','results','totalCount','competitionCount','soonCount','savedCount','lastRefresh','bigCount'];
  for(const id of domIds){const el=new Element();el.id=id}
  ids.get('sort').value='relevance';
  ids.get('typeFilter').value='opportunities';
  ids.get('deadlineFilter').value='all';
  ids.get('riskFilter').value='all';
  ids.get('scoreMin').value='40';
  const data=new Map();
  const ctx={
    document:{getElementById:id=>ids.get(id)||null,createElement:tag=>new Element(tag)},
    localStorage:{getItem:key=>data.get(key)||null,setItem:(key,val)=>data.set(key,val)},
    fetch:async()=>({ok:true,json:async()=>payload}),
    Intl,Date,Math,Blob,URL,console,setTimeout,
  };
  vm.runInNewContext(source,ctx,{filename:'bidpilot/app.js'});
  const walk=el=>[el,...el.children.flatMap(child=>walk(child))];
  const rendered=()=>walk(ids.get('results'));
  const button=text=>rendered().find(el=>el.tagName==='button'&&el.textContent===text);
  const tenders=()=>ids.get('results').children.filter(x=>x.tagName==='article');
  return{ids,data,rendered,button,tenders,ready:async()=>{await new Promise(resolve=>setImmediate(resolve))}};
}
const isoOffset=days=>{const date=new Date();date.setDate(date.getDate()+days);return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')};
function fixture(){
  const basic={buyer:'Stadt Berlin',buyer_country:'DEU',published:isoOffset(-1),cpv:['72000000'],value:'',currency:''};
  return{schema:2,fetched_at:new Date().toISOString(),errors:[],notices:[
    {...basic,id:'123456-2026',title:'Softwareentwicklung Miniwettbewerb aus Rahmenvertrag',notice_type:'cn-standard',stage:'competition',deadline:isoOffset(7),deadlines:[{date:isoOffset(7),kind:'tender',lot:'LOT-0001'}],url:'https://ted.europa.eu/en/notice/-/detail/123456-2026'},
    {...basic,id:'123457-2026',title:'Softwareentwicklung Zuschlag',notice_type:'can-standard',stage:'result',deadline:'',deadlines:[],url:'https://ted.europa.eu/en/notice/-/detail/123457-2026'},
    {...basic,id:'123458-2026',title:'Softwareentwicklung ohne notice type',notice_type:'',stage:'unknown',deadline:'',deadlines:[],url:'https://ted.europa.eu/en/notice/-/detail/123458-2026'},
  ]};
}
test('default results exclude award and unverified types',async()=>{
  const ui=makeEnv(fixture());await ui.ready();
  assert.equal(ui.tenders().length,1);
  assert.equal(ui.ids.get('competitionCount').textContent,'1');
  assert.equal(ui.ids.get('totalCount').textContent,'3');
  assert.equal(ui.ids.get('soonCount').textContent,'1');
  assert.ok(ui.rendered().some(el=>String(el.textContent).includes('Framework call-off')));
});
test('all-types filter shows result and unknown, deadline filter narrows',async()=>{
  const ui=makeEnv(fixture());await ui.ready();
  ui.ids.get('typeFilter').value='all';ui.ids.get('typeFilter').handlers.change();
  assert.equal(ui.tenders().length,3);
  ui.ids.get('deadlineFilter').value='soon';ui.ids.get('deadlineFilter').handlers.change();
  assert.equal(ui.tenders().length,1);
  ui.ids.get('deadlineFilter').value='missing';ui.ids.get('deadlineFilter').handlers.change();
  assert.equal(ui.tenders().length,2);
});
test('decision brief is inspectable and saves a local private choice',async()=>{
  const ui=makeEnv(fixture());await ui.ready();
  assert.ok(ui.button('Decision brief ↓'));
  ui.button('Decision brief ↓').click();
  assert.ok(ui.ids.get('brief-123456-2026'));
  assert.ok(ui.button('Mark for review'));
  ui.button('Mark for review').click();
  const saved=JSON.parse(ui.data.get('bidpilot_decisions_v1'));
  assert.equal(saved['123456-2026'].status,'review');
  assert.ok(ui.rendered().some(el=>el.textContent==='My decision: Review'));
});
test('legacy feeds retain notices but warn about unknown types',async()=>{
  const payload=fixture();payload.schema=1;payload.notices.forEach(n=>{delete n.stage;delete n.notice_type});
  const ui=makeEnv(payload);await ui.ready();
  assert.equal(ui.ids.get('typeFilter').value,'all');
  assert.equal(ui.tenders().length,3);
  assert.match(ui.ids.get('feedWarning').textContent,/not yet verified/);
});
