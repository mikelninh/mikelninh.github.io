/* BIDPILOT 1.2 — calm daily brief with evidence-first ranking; no eligibility or win predictions. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY='bidpilot_profile_v1', SAVED='bidpilot_saved_v1', VOTES='bidpilot_feedback_v1', DECISIONS='bidpilot_decisions_v1';
  const defaults={company:'Berlin AI Studio',keywords:'artificial intelligence, software, automation, data analysis',exclude:'hardware, lizenz, licensing, wartungsverlängerung, server',scoreMin:'40'};
  const SYNONYMS={
    'artificial intelligence':['artificial intelligence','machine learning','generative ki','künstliche intelligenz','ki','llm'],
    'software':['software','software development','softwareentwicklung','it services','programmierung'],
    'automation':['automation','automatisierung','automatisiert'],
    'data analysis':['data analysis','datenanalyse','datenverarbeitung','data science','datenauswertung']
  };
  const STAGES={competition:'Competition',planning:'Planning notice',result:'Result / award',other:'Other notice',unknown:'Type unverified'};
  let profile=load(KEY,defaults),saved=load(SAVED,{}),votes=load(VOTES,{}),decisions=load(DECISIONS,{});
  let notices=[],feed=null,view='all',expanded=null;

  function load(key,fallback){try{const data=JSON.parse(localStorage.getItem(key)||'null');return data&&typeof data==='object'&&!Array.isArray(data)?data:fallback}catch(_){return fallback}}
  function store(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}}
  function e(tag,cls,content){const el=document.createElement(tag);if(cls)el.className=cls;if(content!==undefined)el.textContent=String(content);return el}
  function p(content,cls){return e('p',cls,content)}
  function clean(v){return String(v==null?'':v).toLocaleLowerCase('de-DE').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim()}
  function terms(raw){return String(raw||'').split(',').map(clean).filter(v=>v.length>=3).slice(0,16)}
  function hasWord(text,word){return word==='ki'?/(^|[^a-z])ki([^a-z]|$)/.test(text):text.includes(word)}
  function date(v){const part=String(v||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(part))return'';const d=new Date(part+'T12:00:00Z');return Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==part?'':part}
  function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
  function timestamp(v){return date(v)?Date.parse(date(v)+'T00:00:00Z'):0}
  function readable(v){return date(v)?new Intl.DateTimeFormat('en-GB',{dateStyle:'medium'}).format(new Date(date(v)+'T12:00:00Z')):'Not published'}
  function daysUntil(iso){return date(iso)?Math.round((timestamp(iso)-timestamp(today()))/86400000):null}
  function link(label,url,cls){const a=e('a',cls,label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
  function validNotice(n){return n&&/^[0-9]{1,8}-[0-9]{4}$/.test(String(n.id||''))&&typeof n.title==='string'&&n.title.length>=3&&n.url==='https://ted.europa.eu/en/notice/-/detail/'+n.id}
  function stage(n){return Object.hasOwn(STAGES,n.stage)?n.stage:'unknown'}
  function noticeDeadlines(n){if(Array.isArray(n.deadlines)&&n.deadlines.length)return n.deadlines.filter(x=>x&&date(x.date)).map(x=>({date:date(x.date),kind:String(x.kind||'unspecified'),lot:String(x.lot||'')})).sort((a,b)=>a.date.localeCompare(b.date));return date(n.deadline)?[{date:date(n.deadline),kind:'unspecified',lot:''}]:[]}
  function deadlinesState(n){const entries=noticeDeadlines(n);if(!entries.length)return'unknown';const remaining=entries.filter(x=>x.date>=today());return remaining.length?(remaining.some(x=>daysUntil(x.date)<=14)?'soon':'future'):'past'}
  function nextDeadline(n){return noticeDeadlines(n).find(x=>x.date>=today())||noticeDeadlines(n)[0]||null}
  function explain(n){
    const title=clean(n.title), buyer=clean(n.buyer), cpv=Array.isArray(n.cpv)?n.cpv.map(String):[];
    const excluded=terms(profile.exclude).find(w=>hasWord(title,w)||hasWord(buyer,w));
    if(excluded)return{score:0,reasons:['Excluded term: '+excluded],excluded:true};
    let score=0;const reasons=[];
    for(const word of terms(profile.keywords)){
      const aliases=SYNONYMS[word]||[word];
      const inTitle=aliases.find(w=>hasWord(title,clean(w))),inBuyer=aliases.find(w=>hasWord(buyer,clean(w)));
      if(inTitle){score+=28;reasons.push('Title: '+inTitle)}
      else if(inBuyer){score+=9;reasons.push('Buyer: '+inBuyer)}
    }
    if(cpv.some(c=>c.startsWith('72'))){score+=18;reasons.push('IT-services CPV')}
    else if(cpv.some(c=>c.startsWith('48'))){score+=10;reasons.push('Software CPV')}
    if(n.buyer_country==='DEU'){score+=5;reasons.push('German buyer')}
    return{score:Math.min(score,100),reasons,excluded:false};
  }
  function riskSignals(n){
    const s=clean(n.title),result=[];
    if(/miniwettbewerb|einzelabruf|abruf aus|aus rahmenvertrag/.test(s))result.push({level:'high',text:'Framework call-off: participation may be limited to existing suppliers. Check access.'});
    else if(/rahmenvertrag|rahmenvereinbarung|dynamische[srn]? beschaffungssystem/.test(s))result.push({level:'medium',text:'Framework / purchasing system: verify how suppliers can join.'});
    if(/lizenz|licen[sc]|subscription|handelspartner|reseller|vertriebspartnerschaft/.test(s))result.push({level:'medium',text:'Licensing / reseller terms: verify required partner or supplier status.'});
    if(/strategische partnerschaft|vertriebspartnerschaft/.test(s))result.push({level:'medium',text:'Partnership scope: check minimum supplier capacity, references and participation conditions.'});
    if(stage(n)!=='competition')result.push({level:'high',text:'Not verified as a competition notice. Do not assume bidding is open.'});
    if(deadlinesState(n)==='unknown')result.push({level:'medium',text:'No deadline in this feed. Check the current notice and all lots.'});
    if(deadlinesState(n)==='past')result.push({level:'high',text:'All dates extracted into this feed have passed. Verify latest notice changes.'});
    return result;
  }
  function advice(n,fit){
    const flags=riskSignals(n);
    if(stage(n)!=='competition')return{kind:'muted',label:'Verify notice type',why:'Not currently verified as a competition.'};
    if(deadlinesState(n)==='past')return{kind:'caution',label:'Check deadline',why:'Extracted deadlines have passed; confirm whether this notice remains actionable.'};
    if(flags.some(x=>x.level==='high'))return{kind:'caution',label:'Access check first',why:'Possible procurement access restriction. Review the original notice.'};
    if(fit.score>=60)return{kind:'positive',label:'Review first',why:'Strong text match. Eligibility, capacity and commercial fit remain unverified.'};
    if(fit.score>=40)return{kind:'neutral',label:'Worth screening',why:'Some text relevance; read requirements before investing time.'};
    return{kind:'muted',label:'Lower text match',why:'May not be relevant to your stated keywords.'};
  }
  function getRows(){
    const q=clean($('search').value),min=Number(profile.scoreMin)||0,kind=$('typeFilter').value,deadline=$('deadlineFilter').value;
    const risk=$('riskFilter').value;
    const rows=notices.map(n=>({n,fit:explain(n)})).filter(({n,fit})=>
      !fit.excluded&&fit.score>=min&&(view==='all'||saved[n.id])&&
      (kind==='all'||(kind==='opportunities'?stage(n)==='competition':stage(n)===kind))&&
      (deadline==='all'||(deadline==='dated'&&noticeDeadlines(n).length>0)||(deadline==='soon'&&deadlinesState(n)==='soon')||(deadline==='missing'&&deadlinesState(n)==='unknown')||(deadline==='past'&&deadlinesState(n)==='past'))&&
      (risk==='all'||(risk==='flagged'&&riskSignals(n).length>0)||(risk==='clear'&&riskSignals(n).length===0))&&
      (!q||clean([n.title,n.buyer,(n.cpv||[]).join(' '),n.id].join(' ')).includes(q))
    );
    const sort=$('sort').value;
    rows.sort((a,b)=>sort==='newest'?timestamp(b.n.published)-timestamp(a.n.published):
      sort==='deadline'?(timestamp(nextDeadline(a.n)?.date)||Infinity)-(timestamp(nextDeadline(b.n)?.date)||Infinity):
      b.fit.score-a.fit.score||timestamp(b.n.published)-timestamp(a.n.published));
    return rows;
  }
  function setNotice(message,isWarning){$('feedWarning').textContent=message;$('feedWarning').classList.toggle('hidden',!message);$('feedWarning').classList.toggle('warning',!!isWarning)}
  function updateStats(){
    $('totalCount').textContent=notices.length.toLocaleString('en-GB');
    $('competitionCount').textContent=notices.filter(n=>stage(n)==='competition').length.toLocaleString('en-GB');
    $('soonCount').textContent=notices.filter(n=>stage(n)==='competition'&&deadlinesState(n)==='soon').length.toLocaleString('en-GB');
    $('savedCount').textContent=Object.keys(saved).filter(id=>notices.some(n=>n.id===id)).length.toLocaleString('en-GB');
  }
  function render(){
    const rows=getRows();
    $('resultsCount').textContent=rows.length+' matches';
    $('summary').textContent='Ranked against '+notices.length+' TED notices · Text relevance, not qualification · '+(profile.company||'Your studio');
    updateStats();
    updateDashboard();
    const root=$('results');root.replaceChildren();
    if(!rows.length){
      const block=e('div','empty');block.append(e('div','emoji','✳'),e('h3','',notices.length?'No results for these filters.':'No source notices loaded yet.'),p(notices.length?'Try another notice type, a lower relevance threshold or fewer exclusions.':'The source import has not produced verified records. No demo tenders will be shown.'));
      block.append(link('Explore TED ↗','https://ted.europa.eu/','btn ghost'));root.append(block);return;
    }
    for(const {n,fit} of rows.slice(0,150))root.append(renderCard(n,fit));
    if(rows.length>150)root.append(p('Showing 150 of '+rows.length+' matches; narrow your filters to see others.','help'));
  }
  function renderCard(n,fit){
    const card=e('article','tender'),top=e('div','tender-top'),meta=e('div','eyebrow','TED / '+n.id+' · '+(n.buyer_country||'EU'));
    if(card.dataset)card.dataset.noticeId=n.id;else card.setAttribute('data-notice-id',n.id);
    top.append(meta,e('span','stage stage-'+stage(n),STAGES[stage(n)]),e('span','match'+(fit.score<35?' low':''),fit.score+' / 100 text match'));
    card.append(top);
    const h=e('h3');h.append(link(n.title,n.url));card.append(h,p((n.buyer||'Buyer unspecified')+' · Published '+readable(n.published),'meta'));
    const choice=advice(n,fit),summary=e('div','decision-summary');
    summary.append(e('span','decision-pill '+choice.kind,choice.label),p(choice.why,'decision-why'));
    card.append(summary);
    const tags=e('div','tags'),dl=nextDeadline(n);
    tags.append(e('span','tag'+(deadlinesState(n)==='past'?' tag-warning':''),dl?'Published deadline: '+readable(dl.date)+(dl.lot?' · '+dl.lot:''):'Deadline unknown'));
    if(Array.isArray(n.cpv)&&n.cpv.length)tags.append(e('span','tag','CPV '+n.cpv.slice(0,3).join(' · ')));
    if(n.value&&n.currency)tags.append(e('span','tag','Reported value: '+n.value+' '+n.currency));
    if(decisions[n.id]?.status)tags.append(e('span','tag tag-accent','My decision: '+(decisions[n.id].status==='review'?'Review':'No bid')));
    card.append(tags);
    card.append(p(fit.reasons.length?'Text signals: '+fit.reasons.slice(0,4).join(' · '):'No matching title, buyer or CPV signals.','reason'));
    const flags=riskSignals(n);if(flags.length){
      const wrap=e('div','risk-signals');for(const flag of flags.slice(0,3))wrap.append(p('! '+flag.text,'risk-line '+flag.level));card.append(wrap);
    }
    const footer=e('div','tender-footer'),actions=e('div','tender-actions');
    const btn=e('button','btn dark small',expanded===n.id?'Close brief ↑':'Decision brief ↓');
    btn.type='button';btn.setAttribute('aria-expanded',String(expanded===n.id));
    btn.addEventListener('click',()=>{expanded=expanded===n.id?null:n.id;render();if(expanded)$('brief-'+n.id)?.focus()});
    actions.append(btn,link('Official TED ↗',n.url,'btn ghost small'));
    const save=e('button','btn small '+(saved[n.id]?'':'ghost'),saved[n.id]?'♥ Saved':'♡ Save');
    save.type='button';save.setAttribute('aria-pressed',String(!!saved[n.id]));
    save.addEventListener('click',()=>{if(saved[n.id])delete saved[n.id];else saved[n.id]=true;store(SAVED,saved);render()});
    actions.append(save);footer.append(actions);
    const feedback=e('div','feedback'),yes=e('button',votes[n.id]==='useful'?'on':'','Useful ✓'),no=e('button',votes[n.id]==='notfit'?'on':'','Not for us ×');
    for(const [button,value] of [[yes,'useful'],[no,'notfit']]){
      button.type='button';button.setAttribute('aria-pressed',String(votes[n.id]===value));
      button.addEventListener('click',()=>{if(votes[n.id]===value)delete votes[n.id];else votes[n.id]=value;store(VOTES,votes);render()});
    }
    feedback.append(yes,no);footer.append(feedback);card.append(footer);
    if(expanded===n.id)card.append(renderBrief(n,fit,choice,flags));
    return card;
  }
  function renderBrief(n,fit,choice,flags){
    const brief=e('section','brief');brief.id='brief-'+n.id;brief.tabIndex=-1;
    brief.append(e('div','eyebrow','BID / NO-BID · EVIDENCE BRIEF'),e('h4','',choice.label+' — not a participation decision'));
    const cols=e('div','brief-grid'),known=e('div'),questions=e('div');
    known.append(e('h5','','What the published feed tells us'));
    const facts=e('ul');
    const deadlines=noticeDeadlines(n);
    const factsText=[
      'Notice type: '+(n.notice_type||'not provided')+' ('+STAGES[stage(n)]+')',
      'Buyer: '+(n.buyer||'not specified')+' · Published: '+readable(n.published),
      'Text relevance: '+fit.score+'/100; this is not an eligibility or win estimate',
      'CPV: '+((n.cpv||[]).join(', ')||'not supplied'),
      'Reported TED value: '+(n.value&&n.currency?n.value+' '+n.currency:'not provided; this is not a verified project budget')
    ];
    for(const line of factsText)facts.append(e('li','',line));
    known.append(facts);
    const details=e('div','deadlines-list');
    details.append(e('h5','','Deadline entries from TED'));
    if(deadlines.length){const list=e('ul');for(const item of deadlines.slice(0,12))list.append(e('li','',readable(item.date)+' · '+item.kind+(item.lot?' · '+item.lot:'')));details.append(list)}
    else details.append(p('No deadline available in this feed. Do not assume the process is open.','help'));
    known.append(details);
    questions.append(e('h5','','Questions to resolve before bidding'));
    const checklist=[
      'Is this a live and accessible competition, including the latest corrections?',
      'Can our organisation meet formal participation, turnover and insurance requirements?',
      'Do we have the requested references, team capacity and certifications?',
      'Are the scope, contract terms and effort commercially worthwhile?',
      'What are the exact submission channel, attachments and time of day?'
    ];
    if(flags.some(x=>/Framework|framework/.test(x.text)))checklist.unshift('Do we need to be admitted to an existing framework before taking part?');
    if(flags.some(x=>/reseller|Licensing/.test(x.text)))checklist.unshift('Are authorised reseller or vendor credentials required?');
    const list=e('ul');for(const line of checklist)list.append(e('li','',line));questions.append(list);
    questions.append(p('Open the official notice, amendments and procurement documents to verify these questions. BidPilot has not analysed attachments or checked legal eligibility.','help'));
    cols.append(known,questions);brief.append(cols);
    const row=e('div','brief-actions');row.append(link('Verify evidence on TED ↗',n.url,'btn dark small'));
    for(const [value,label] of [['review','Mark for review'],['no-bid','No bid'],['','Clear status']]){
      const button=e('button','btn ghost small'+((decisions[n.id]?.status||'')===value?' active-state':''),label);button.type='button';
      button.addEventListener('click',()=>{const old=decisions[n.id]||{};if(!value&&!old.note)delete decisions[n.id];else decisions[n.id]={...old,status:value};store(DECISIONS,decisions);render();$('brief-'+n.id)?.focus()});
      row.append(button);
    }
    brief.append(row);
    const lbl=e('label','label','My private review notes');lbl.htmlFor='note-'+n.id;
    const note=e('textarea','input');note.id='note-'+n.id;note.rows=2;note.maxLength=1500;note.placeholder='Questions, reference checks or next actions — stored only in this browser';note.value=decisions[n.id]?.note||'';
    note.addEventListener('input',()=>{decisions[n.id]={...(decisions[n.id]||{}),note:note.value};store(DECISIONS,decisions)});
    brief.append(lbl,note,p('Private local notes; no team sync, document analysis or automatic bid submission.','help'));
    return brief;
  }
  function csv(rows){
    const fields=['id','title','buyer','published','stage','notice_type','published_deadline','cpv','text_match','review_status','reason','source'];
    const quote=v=>'"'+String(v==null?'':v).replace(/"/g,'""').replace(/^[=+\-@\t\r]/,"'$&")+'"';
    const output=[fields.join(',')].concat(rows.map(({n,fit})=>
      [n.id,n.title,n.buyer,n.published,stage(n),n.notice_type,nextDeadline(n)?.date||'',(n.cpv||[]).join('|'),fit.score,decisions[n.id]?.status||'',fit.reasons.join(' | '),n.url].map(quote).join(',')
    )).join('\r\n');
    const blob=new Blob(['\uFEFF'+output],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='bidpilot-decision-desk-'+today()+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function readProfile(){return{company:$('company').value.trim().slice(0,80),keywords:$('keywords').value.trim().slice(0,300),exclude:$('exclude').value.trim().slice(0,200),scoreMin:$('scoreMin').value}}
  function setProfile(){for(const k of ['company','keywords','exclude','scoreMin'])$(k).value=profile[k]!==undefined?profile[k]:defaults[k]}
  $('profileForm').addEventListener('submit',event=>{event.preventDefault();profile=readProfile();const ok=store(KEY,profile);$('profileMessage').textContent=ok?'Preferences saved privately in this browser.':'Updated, but browser storage was unavailable.';render()});
  $('search').addEventListener('input',render);
  for(const id of ['sort','typeFilter','deadlineFilter','riskFilter'])$(id).addEventListener('change',render);
  $('allFilter').addEventListener('click',()=>{view='all';$('allFilter').classList.add('active');$('savedFilter').classList.remove('active');render()});
  $('savedFilter').addEventListener('click',()=>{view='saved';$('savedFilter').classList.add('active');$('allFilter').classList.remove('active');render()});
  $('export').addEventListener('click',()=>csv(getRows()));
  setProfile();
  async function init(){
    try{
      const response=await fetch('./notices.json?v='+Math.floor(Date.now()/3600000),{cache:'no-store'});
      if(!response.ok)throw Error('HTTP '+response.status);
      const payload=await response.json();
      if(!payload||!Array.isArray(payload.notices))throw Error('Invalid feed');
      feed=payload;notices=payload.notices.filter(validNotice);
      const checked=payload.fetched_at?new Date(payload.fetched_at):null;
      $('lastRefresh').textContent='Checked: '+(checked&&!Number.isNaN(checked.getTime())?checked.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}):'Awaiting first import');
      if($('bigCount'))$('bigCount').textContent=notices.length.toLocaleString('en-GB');
      const age=checked?Date.now()-checked.getTime():Infinity;
      if(payload.schema!==2){$('typeFilter').value='all';setNotice('Legacy feed: notice types not yet verified. Do not assume these notices are open for bidding.',true)}
      else if(!checked)setNotice('No completed feed import; do not assume the displayed data is current.',true);
      else if(age>86400000*3)setNotice('Source feed is over three days old. Verify deadlines and amendments directly on TED.',true);
      else if(payload.errors?.length)setNotice('Partial TED import: some queries failed. The shortlist is incomplete.',true);
      else setNotice('',false);
      render();
    }catch(err){
      notices=[];feed=null;if($('bigCount'))$('bigCount').textContent='—';$('lastRefresh').textContent='Feed unavailable';
      setNotice('Official TED feed could not be loaded. No fabricated notices will be shown. '+String(err.message||err),true);render();
    }
  }
  /* Homepage shortlist. Deterministic, source-linked and independent of browse filters. */
  function updateDashboard(){
    const root=$('focusList');
    if(!root)return; // Existing tests may use only the v1.1 full-feed DOM.
    const engine=typeof globalThis!=='undefined'?globalThis.BidPilotPriority:null;
    const profileName=profile.company||'Your studio';
    const customised=!!localStorage.getItem(KEY);
    $('profileHeadline').textContent=customised?profileName:'Example studio profile · '+profileName;
    $('profileDescription').textContent=(terms(profile.keywords).slice(0,3).join(' · ')||'Add your services')+
      (customised?' · Saved only on this device':' · Customise it for recommendations relevant to you');
    const fetched=feed?.fetched_at?new Date(feed.fetched_at):null;
    const validFetched=fetched&&!Number.isNaN(fetched.getTime());
    const age=validFetched?Date.now()-fetched.getTime():Infinity;
    const stale=age>3*86400000;
    $('sourceStatus').textContent=validFetched?
      ('TED data · '+fetched.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+(stale?' · needs refresh':'')):
      'Source freshness unverified';
    $('focusSubtitle').textContent=customised?
      'A focused selection from real published competition notices. Not an eligibility assessment.':
      'Using an example software studio profile. Change it to see opportunities relevant to your business.';
    root.replaceChildren();
    root.setAttribute('aria-busy','false');
    let picks=[];
    if(engine&&feed?.schema===2){
      const threshold=Math.max(40,Number(profile.scoreMin)||0);
      picks=engine.selectShortlist(notices,{
        currentDate:today(),
        fitFor:n=>{const fit=explain(n);return fit.score<threshold?{...fit,excluded:true}:fit},
        riskFor:riskSignals,decisions
      });
    }
    $('topCount').textContent=String(picks.length).padStart(2,'0')+' / 03';
    if(!picks.length){
      const empty=e('div','spotlight-empty');
      empty.append(e('span','empty-star','✳'),e('h3','','No verified recommendations yet.'));
      empty.append(p(feed?.schema!==2?
        'The source feed has not confirmed notice types. The full feed remains available for manual checks.':
        notices.length?'No competition notices meet the published-date and relevance rules for this profile. Try adjusting your keywords or view the full feed.':
        'We could not load verified tender notices. Explore the official TED website while the feed is unavailable.','empty-note'));
      root.append(empty);
    } else {
      for(let index=0;index<picks.length;index++)root.append(renderSpotlight(picks[index],index));
    }
    const action=engine?engine.nextAction(picks[0],stale):{heading:'Verify the source feed first',detail:'Ranking is unavailable until the source-backed engine has loaded.',cta:'Explore all',kind:'profile'};
    const dest=$('nextAction');
    const actionHeading=e('h3','',action.heading);actionHeading.id='actionHeading';
    dest.replaceChildren(e('p','action-kicker','One considered next step'),actionHeading,p(action.detail,'action-description'));
    const buttonArea=e('div','action-controls');
    if(action.kind==='source'&&picks.length){
      buttonArea.append(link(action.cta+' ↗',picks[0].notice.url,'btn btn-light'));
    }else{
      const button=e('button','btn btn-light',action.cta+' ↗');
      button.type='button';
      button.addEventListener('click',()=>action.kind==='brief'&&picks.length?openBrief(picks[0].notice.id):openExplorer(true));
      buttonArea.append(button);
    }
    dest.append(buttonArea);
    const foot=e('p','action-context',picks.length?'For: '+picks[0].notice.title:'No synthetic opportunities are generated.');
    dest.append(foot);
  }
  function renderSpotlight(item,index){
    const n=item.notice,card=e('article','focus-card'),top=e('div','focus-card-top');
    if(card.dataset)card.dataset.noticeId=n.id;else card.setAttribute('data-notice-id',n.id);
    top.append(e('span','focus-number',String(index+1).padStart(2,'0')));
    const meta=e('div','focus-top-meta');
    meta.append(e('span','focus-category','PUBLISHED COMPETITION'),e('span','focus-date',item.days+' days until published date'));
    top.append(meta);card.append(top);
    const h=e('h3','focus-title');h.append(link(n.title,n.url));card.append(h);
    card.append(p((n.buyer||'Buyer not specified')+' · TED '+n.id,'focus-buyer'));
    const details=e('div','focus-details'),fit=e('span','focus-fit',item.fit.score+'/100 text match');
    details.append(fit,e('span','focus-separator','·'),e('span','focus-deadline','Date '+readable(item.deadline.date)));
    if(item.risks.some(r=>r.level==='medium'))details.append(e('span','focus-flag','Check conditions'));
    card.append(details);
    const evidence=e('p','focus-evidence',
      item.fit.reasons.length?'Why it surfaced: '+item.fit.reasons.slice(0,2).join(' · '):
      'Only a basic CPV or buyer signal was matched.');
    card.append(evidence);
    const row=e('div','focus-actions');
    const open=e('button','focus-review','Inspect opportunity ↗');
    open.type='button';open.addEventListener('click',()=>openBrief(n.id));
    row.append(open,link('TED source ↗',n.url,'focus-source'));card.append(row);
    return card;
  }
  function openExplorer(focusProfile=false){
    const area=$('explorer');if(!area)return;
    area.open=true;
    const target=focusProfile?$('company'):$('workspace');
    if(target&&typeof target.scrollIntoView==='function')target.scrollIntoView({behavior:'smooth',block:'start'});
    if(focusProfile&&$('company')&&typeof $('company').focus==='function')$('company').focus({preventScroll:true});
  }
  function openBrief(id){
    expanded=id;view='all';
    $('typeFilter').value='opportunities';$('deadlineFilter').value='all';$('riskFilter').value='all';
    $('search').value='';$('allFilter').classList.add('active');$('savedFilter').classList.remove('active');
    // The shortlist respects the profile threshold, so the notice will appear in the full feed.
    openExplorer(false);render();
    const section=$('brief-'+id);
    if(section&&typeof section.scrollIntoView==='function')section.scrollIntoView({behavior:'smooth',block:'start'});
    if(section&&typeof section.focus==='function')section.focus({preventScroll:true});
  }
  if($('showAll'))$('showAll').addEventListener('click',()=>openExplorer(false));
  if($('editProfile'))$('editProfile').addEventListener('click',()=>openExplorer(true));
  if($('editProfileTop'))$('editProfileTop').addEventListener('click',()=>openExplorer(true));

  init();
})();
