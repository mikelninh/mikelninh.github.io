const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=require('./priority.js');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
function dateOffset(days){
  const d=new Date();d.setDate(d.getDate()+days);
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
}
function n(id, buyer, days, stage='competition',title='Softwareentwicklung für kommunale Dienste'){
  const deadline=dateOffset(days);
  return{id,buyer,buyer_country:'DEU',published:dateOffset(-1),stage,notice_type:stage==='competition'?'cn-standard':'can-standard',
    title,cpv:['72000000'],value:'',currency:'EUR',
    deadline,deadlines:[{date:deadline,kind:'tender',lot:'LOT-0001'}],
    url:'https://ted.europa.eu/en/notice/-/detail/'+id};
}
function sample(){
  return{schema:2,fetched_at:new Date().toISOString(),errors:[],notices:[
    n('100001-2026','Agency Alpha',23,'competition','Softwareentwicklung / artificial intelligence'),
    n('100002-2026','Agency Beta',28,'competition','AI software development services'),
    n('100003-2026','Agency Gamma',16,'competition','Softwareentwicklung Automatisierung'),
    n('100004-2026','Agency Delta',14,'competition','Softwareentwicklung Prozesse'),
    n('100005-2026','Agency Epsilon',20,'result','Softwareentwicklung awarded'),
    n('100006-2026','Agency Zeta',-2),
  ]};
}
function setup(payload=sample()){
  const ids=new Map(),storage=new Map();
  class Element{
    constructor(tagName='div'){this.tagName=tagName;this.children=[];this.handlers={};this.attrs={};this.className='';this.value='';this._text='';
      this.classList={add:()=>{},remove:()=>{},toggle:()=>{}};}
    set id(v){this._id=v;ids.set(v,this)}
    get id(){return this._id}
    set textContent(v){this._text=String(v);this.children=[]}
    get textContent(){return this._text}
    replaceChildren(...c){this.children=[...c]}
    append(...c){this.children.push(...c)}
    setAttribute(name,value){this.attrs[name]=value}
    addEventListener(event,cb){this.handlers[event]=cb}
    focus(){}
    scrollIntoView(){}
    click(){this.handlers.click?.()}
  }
  const all='profileForm search sort typeFilter deadlineFilter riskFilter allFilter savedFilter export company keywords exclude scoreMin profileMessage feedWarning resultsCount summary results totalCount competitionCount soonCount savedCount lastRefresh focusList profileHeadline profileDescription sourceStatus focusSubtitle topCount nextAction showAll editProfile editProfileTop explorer workspace'.split(' ');
  for(const id of all){const el=new Element();el.id=id}
  ids.get('sort').value='relevance';ids.get('typeFilter').value='opportunities';
  ids.get('deadlineFilter').value='all';ids.get('riskFilter').value='all';ids.get('scoreMin').value='40';
  const context={
    document:{getElementById:id=>ids.get(id)||null,createElement:tag=>new Element(tag)},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,val)=>storage.set(key,val)},
    BidPilotPriority:engine,
    fetch:async()=>({ok:true,json:async()=>payload}),
    Date,Intl,Math,Blob,URL,console,setTimeout
  };
  vm.runInNewContext(source,context,{filename:'app.js'});
  const traverse=el=>[el,...el.children.flatMap(traverse)];
  const items=()=>ids.get('focusList').children.filter(el=>el.tagName==='article');
  const allNodes=()=>traverse(ids.get('focusList'));
  return{ids,storage,items,allNodes,ready:async()=>new Promise(resolve=>setImmediate(resolve))};
}
test('homepage lists exactly three real TED-source-linked notices and one next action',async()=>{
  const app=setup();await app.ready();
  assert.equal(app.items().length,3);
  assert.equal(app.ids.get('topCount').textContent,'03 / 03');
  assert.match(app.ids.get('profileHeadline').textContent,/Example studio profile/);
  assert.ok(app.allNodes().some(node=>node.tagName==='a'&&node.href?.startsWith('https://ted.europa.eu/en/notice/-/detail/')));
  assert.ok(app.ids.get('nextAction').children.some(node=>node.tagName==='h3'));
  const cards=app.items().map(card=>JSON.stringify(card,(_,value)=>typeof value==='function'?undefined:value));
  assert.ok(cards.every(c=>c.includes('PUBLISHED COMPETITION')));
  assert.ok(cards.every(c=>!c.includes('awarded')));
});
test('homepage adapts to fewer valid opportunities and never pads with examples',async()=>{
  const data=sample();data.notices=data.notices.slice(0,1);
  const app=setup(data);await app.ready();assert.equal(app.items().length,1);
  assert.equal(app.ids.get('topCount').textContent,'01 / 03');
});
test('profile editing opens advanced workspace, and review opens real notice brief',async()=>{
  const app=setup();await app.ready();
  app.ids.get('editProfile').click();assert.equal(app.ids.get('explorer').open,true);
  const open=app.allNodes().find(el=>el.tagName==='button'&&el.textContent==='Inspect opportunity ↗');
  assert.ok(open);open.click();
  assert.equal(app.ids.get('explorer').open,true);
  assert.ok([...app.ids.keys()].some(key=>String(key).startsWith('brief-')));
});
test('wrong source schema does not masquerade old notices as verified recommendations',async()=>{
  const data=sample();data.schema=1;
  const app=setup(data);await app.ready();
  assert.equal(app.items().length,0);
  assert.equal(app.ids.get('topCount').textContent,'00 / 03');
});
