/* Interbeing Spatial Study 03. No external libraries, trackers or inferred personal data.
   Model: curated ATLAS. View: perspective-projected x/y/z geometry.
   The temporal layer is an authored possible chronology, NOT a calibrated simulation. */
'use strict';
(() => {
 const A=window.ATLAS;
 if(!A){document.getElementById('details').textContent='The atlas could not load. Please reload or return to the 2D atlas.';return;}
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const edgeById=Object.fromEntries(A.edges.map(e=>[e.id,e]));
 const storage={get:k=>{try{return localStorage.getItem(k)||'';}catch{return'';}},set:(k,v)=>{try{v?localStorage.setItem(k,v):localStorage.removeItem(k);}catch{}}};
 const validWorld=['self','food','wild','health','all'];
 const state={world:'self',lens:'ecological',mode:'3d',selected:'you',edge:null,time:0,focus:null,actors:true,tensions:true,list:false,theme:'light',motion:false,orbit:false,playing:false,name:storage.get('interbeing-space-name').slice(0,32),reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
 const camera={yaw:.28,pitch:.28,distance:770,panX:0,panY:0};
 const target={...camera};
 const typeName={person:'Human life',animal:'Nonhuman lives',ecosystem:'Life-support system',need:'Shared need',system:'Collective system',solution:'Possible pathway',actor:'Organisation','future being':'Ethical horizon',problem:'Cause of harm'};
 const palettes={light:{bg:'#f1eee8',ink:'#303931',muted:'#687668',shadow:'#677d62',you:['#fae1b8','#c98860','#a45c3c','#573d2b'],person:['#fcf3de','#c4c8b1','#7f927d','#384e44'],animal:['#fcf0d7','#d2b9a1','#ae8866','#655b48'],ecosystem:['#f1f8dd','#c0d0b2','#7f9a83','#425e50'],solution:['#e9f3e4','#b4cdc0','#638a7c','#345e52'],actor:['#eeefe5','#c4c9ce','#7c8d99','#425164'],future:['#faf0ed','#d7c3d2','#a18aa2','#655778'],depends:'#7d9084',helps:'#688c75',tension:'#b86d53',unknown:'#a187a4',line:'#839480'},dark:{bg:'#141f24',ink:'#eee7d9',muted:'#a5bdb5',shadow:'#557866',you:['#fff3ce','#e4b383','#b56f4b','#76503d'],person:['#f0f5dc','#b4ccb3','#648273','#304d48'],animal:['#f8e7c8','#cbb091','#947154','#534941'],ecosystem:['#e5f6ce','#9ac1a8','#50786a','#2a4844'],solution:['#ddf9e8','#99c7b7','#487f70','#234c43'],actor:['#e6f5f3','#a1bbcb','#557685','#293f50'],future:['#fbefef','#cdadca','#7b617f','#493a59'],depends:'#8fa89e',helps:'#9bcab1',tension:'#e3ac85',unknown:'#b29abf',line:'#839d93'}};
 const timeStories={
 food:[
 {title:'Begin with the lives already connected.',text:'Nourishment, livelihoods, land and animal interests share the same table. This is a generic starting point, not your measured supply chain.',focus:'meal',ids:['meal','growers','water','animals']},
 {title:'Imagine a different meal.',text:'Explore a plant-rich option. What would it replace, and would it be affordable, nourishing and welcome?',focus:'choices',ids:['choices','meal','water','you']},
 {title:'Bring the people through the change.',text:'Changing provision could change livelihoods. A fair transition is a proposal to test with the workers affected, not a guaranteed outcome.',focus:'transition',ids:['transition','growers','choices','gfi']},
 {title:'Leave room for lives yet to come.',text:'Consider future beings and wild-animal welfare. Long-term effects remain uncertain; this view predicts no populations or lives saved.',focus:'future',ids:['future','you','wildlife','water']}
 ],
 wild:[
 {title:'Different lives share one place.',text:'Wolves, prey, sheep and keepers have distinct interests. Shared habitat does not make those interests identical.',focus:'habitat',ids:['habitat','wolf','prey','sheep','keeper']},
 {title:'Consider a protective measure.',text:'Imagine assessing a locally suitable measure. Ask what it protects, what it costs and what it might displace.',focus:'protection',ids:['protection','sheep','keeper']},
 {title:'Design with the people who live here.',text:'Shared decisions and local evidence could guide a response. Agreement and effectiveness are questions to evaluate.',focus:'dialogue',ids:['dialogue','protection','iucn','keeper']},
 {title:'Some tensions do not disappear.',text:'Predator–prey conflict remains. Research can ask about individual wellbeing without promising a harm-free future.',focus:'prey',ids:['wolf','prey','wai','habitat']}
 ],
 health:[
 {title:'Begin with people needing protection.',text:'Notice the connections between mosquito vectors, malaria and human lives. This view is not a clinical protocol.',focus:'families',ids:['families','mosquito','malaria']},
 {title:'Protect with established approaches.',text:'Prevention and care remain essential. The map does not choose a treatment or a local vector-control intervention.',focus:'nets',ids:['families','nets','treatment','amf']},
 {title:'Investigate alongside protection.',text:'Imagine research into welfare and side effects while effective prevention continues. Research is not an equivalent replacement.',focus:'research',ids:['research','mosquito','nets','who']},
 {title:'Keep future choices accountable.',text:'Would a proposed approach protect people and reduce avoidable harm? That requires evidence, not an attractive projected future.',focus:'who',ids:['who','families','research','mosquito']}
 ]};
 let layout={},visibleNodes=[],visibleEdges=[],lastTimeIndex=-1,frame=0,lastFrame=0,transient=0,toastTimer=0,lastPointer=null,dragging=false,modalReturn=null;
 const canvas=$('#space'),ctx=canvas.getContext('2d',{alpha:true});
 const stage=$('#stage');let W=800,H=530,DPR=1,projected=[],edgeHits=[],lastLabelSignature='',renderCount=0;
 const labelMap=new Map();
 function label(id,anonymous=false){return id==='you'&&!anonymous?(state.name||'You'):A.nodes[id]?.label||id;}
 function scenario(){return timeStories[state.world==='wild'?'wild':state.world==='health'?'health':'food'];}
 function temporalIndex(){return clamp(Math.round(state.time),0,3);}
 function collect(){
  let ids,eids;
  if(state.world==='all'){ids=Object.keys(A.nodes);eids=A.edges.map(e=>e.id);}
  else{const scene=state.world==='self'?A.lenses[state.lens]:A.scenes[state.world];ids=[...scene.ids];eids=[...scene.edges];}
  if(state.mode==='4d'){
   ids=[...new Set([...ids,...scenario().flatMap(s=>s.ids)])];
   const set=new Set(ids);eids=A.edges.filter(e=>set.has(e.from)&&set.has(e.to)).map(e=>e.id);
  }
  visibleNodes=ids.filter(id=>state.actors||A.nodes[id].type!=='actor');
  const set=new Set(visibleNodes);
  visibleEdges=eids.map(id=>edgeById[id]).filter(e=>e&&set.has(e.from)&&set.has(e.to)&&(state.tensions||e.type!=='tension'));
  if(!set.has(state.selected)){state.selected=visibleNodes.includes('you')?'you':A.scenes[state.world]?.center||visibleNodes[0];state.edge=null;}
  if(state.edge&&!visibleEdges.some(e=>e.id===state.edge))state.edge=null;
  if(state.focus&&!set.has(state.focus))state.focus=null;
 }
 const selfPositions={you:[0,0,42],meal:[-177,94,88],water:[131,125,-24],animals:[197,-2,62],wildlife:[133,-140,-58],choices:[-108,-141,74],growers:[-204,-40,-88],future:[-4,174,-125],care:[-140,-105,-30],work:[-149,145,-148],dialogue:[80,-92,106],transition:[-48,-177,-138],gfi:[-240,42,93]};
 function buildLayout(){
  if(state.world==='self')layout=Object.fromEntries(visibleNodes.map((id,i)=>[id,[...(selfPositions[id]||ring(i,visibleNodes.length,205))]]));
  else if(state.world==='all'){
   layout={};const clusters=[{ids:['you','care','work','future'],c:[-173,70,64]},{ids:A.scenes.food.ids,c:[83,119,-55]},{ids:A.scenes.wild.ids,c:[130,-121,117]},{ids:A.scenes.health.ids,c:[-167,-134,-114]}];
   clusters.forEach(({ids,c})=>ids.forEach((id,i)=>{if(layout[id])return;const p=ring(i,ids.length,ids.length<5?75:100);layout[id]=p.map((x,j)=>x+c[j]);}));
  }else{
   const center=A.scenes[state.world].center;const others=visibleNodes.filter(id=>id!==center);layout={[center]:[0,0,36]};
   others.forEach((id,i)=>{layout[id]=ring(i,others.length,210);});
   if(state.mode==='4d'&&state.world==='food'){layout.future=[30,190,-160];layout.you=[-48,-190,10];}
  }
  lastLabelSignature='';
 }
 function ring(i,n,r){const a=i/n*Math.PI*2+2.47;return [Math.cos(a)*r,Math.sin(a)*r*.76,Math.sin(a*2+.5)*96];}
 function getPosition(id){const p=layout[id]||[0,0,0];let z=p[2];if(state.mode==='4d'){let chapter=scenario().findIndex(s=>s.ids.includes(id));if(chapter<0)chapter=0;z+=(chapter-state.time)*42;}const o=state.focus?layout[state.focus]||[0,0,0]:[0,0,0];return[p[0]-o[0]*.72,p[1]-o[1]*.72,z-o[2]*.65];}
 function project(p,w=W,h=H,cam=camera){
  const cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw),cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch);
  const x=p[0]*cy+p[2]*sy,z=-p[0]*sy+p[2]*cy,y=p[1]*cp-z*sp,zz=p[1]*sp+z*cp;
  const focal=Math.min(w*1.25,h*1.44),scale=focal/Math.max(120,cam.distance-zz);
  return{x:w*.49+x*scale+cam.panX*w,y:h*.46-y*scale+cam.panY*h,z:zz,scale};
 }
 function color(id){const P=palettes[state.theme],type=A.nodes[id]?.type;return id==='you'?P.you:type==='future being'?P.future:type==='need'?P.person:type==='system'?P.actor:type==='problem'?P.animal:P[type]||P.person;}
 function neighbors(id){return new Set([id,...visibleEdges.filter(e=>e.from===id||e.to===id).flatMap(e=>[e.from,e.to])]);}
 function strength(id){if(state.mode==='4d'){const lo=Math.floor(state.time),hi=Math.ceil(state.time),mix=state.time-lo;const a=scenario()[lo].ids.includes(id)?1:.25,b=scenario()[hi].ids.includes(id)?1:.25;return a*(1-mix)+b*mix;}if(state.focus)return neighbors(state.focus).has(id)?1:.18;return 1;}
 function setWorld(world){if(!validWorld.includes(world))return;state.world=world;state.edge=null;state.focus=null;state.time=0;lastTimeIndex=-1;state.selected=world==='all'?'you':A.scenes[world].center;resetCamera(false);refresh();}
 function setMode(mode){state.mode=mode==='4d'?'4d':'3d';state.playing=false;state.edge=null;lastTimeIndex=-1;state.focus=null;if(state.mode==='4d')state.selected=scenario()[temporalIndex()].focus;refresh();}
 function selectNode(id,{scroll=false}={}){if(!visibleNodes.includes(id))return;state.selected=id;state.edge=null;details();syncLabels();updateCaption();invalidate();if(scroll&&W<700&&matchMedia('(max-width:800px)').matches)$('#inspect').scrollIntoView({behavior:state.reduced?'instant':'smooth',block:'start'});}
 function selectEdge(id){if(!visibleEdges.some(e=>e.id===id))return;state.edge=id;state.selected=edgeById[id].from;details();syncLabels();updateCaption();invalidate();}
 function refresh(){collect();buildLayout();renderList();syncUI();details();invalidate();}
 function syncUI(){
  document.body.dataset.mode=state.mode;document.documentElement.dataset.theme=state.theme;
  $$('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
  $$('[data-world]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.world===state.world)));
  $('#lens').value=state.lens;$('#lens-wrap').hidden=state.world!=='self';$('#temporal').hidden=state.mode!=='4d';$('#scenario-state').hidden=state.mode!=='4d';
  $('#space-title').textContent=(state.world==='all'?'A WIDER ATLAS / FOUR EXAMPLE WORLDS':A.scenes[state.world].label+(state.world==='self'?' / '+A.lenses[state.lens].label:'')).toUpperCase();
  $('#node-count').textContent=`${visibleNodes.length} nodes · ${visibleEdges.length} connections`;
  $('#actors').checked=state.actors;$('#tensions').checked=state.tensions;
  $('#list-panel').hidden=!state.list;$('#list-toggle').setAttribute('aria-pressed',String(state.list));$('#list-toggle').textContent=state.list?'Back to space':'List view';
  $('#labels').hidden=state.list;$('#space').setAttribute('aria-hidden',String(state.list));$('#space').tabIndex=state.list?-1:0;
  $('#theme').setAttribute('aria-label',state.theme==='light'?'Switch to night atmosphere':'Switch to daylight atmosphere');
  $('#motion').textContent=state.motion?'Motion on':'Motion off';$('#motion').setAttribute('aria-pressed',String(state.motion));$('#orbit').setAttribute('aria-pressed',String(state.orbit));$('#orbit').setAttribute('aria-label',state.orbit?'Stop slow orbit':'Start slow orbit');
  $('#view-state').textContent=state.focus?`Looking from ${label(state.focus)}.`:state.mode==='4d'?'Three dimensions. A possible passage through time.':'A place to look from.';
  updateTimeUI();updateCaption();
 }
 function updateCaption(){const e=state.edge?edgeById[state.edge]:null;$('#selection-caption').textContent=e?`${label(e.from)} → ${e.label} → ${label(e.to)}`:A.nodes[state.selected]?.insight||'Follow a connection.';}
 function renderSources(refs){return[...new Set(refs)].filter(x=>A.sources[x]).map(ref=>{const s=A.sources[ref];return`<a class="source" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗<small>${esc(s.by)}</small><small>${esc(s.note)}</small></a>`;}).join('');}
 function details(){
  const n=A.nodes[state.selected];if(!n)return;
  if(state.edge){
   const e=edgeById[state.edge];$('#details').innerHTML=`<button class="detail-nav" data-node="${esc(e.from)}">← Back to ${esc(label(e.from))}</button><div class="detail-type"><span class="type-dot"></span> A RELATIONSHIP / ${esc(e.type)}</div><h2>${esc(label(e.from))}<br><span style="color:var(--accent)">↘</span> ${esc(label(e.to))}</h2><span class="claim-badge">${esc(e.kind)}</span><p class="insight">${esc(e.label)}.</p><p class="explanation">${esc(e.claim)}</p><p class="boundary">Scope: ${esc(e.scope)}.<br>No effect size has been estimated.</p><button class="focus-button" data-node="${esc(e.to)}">Meet ${esc(label(e.to))} <span>↗</span></button><h3>Evidence & provenance</h3>${e.sources.length?renderSources(e.sources):'<p class="boundary">No direct source is attached. This is an explicitly labelled illustrative relation, ethical lens or proposal—not a measured causal result.</p>'}`;
  }else{
   const rels=visibleEdges.filter(e=>e.from===n.id||e.to===n.id);const others=A.edges.filter(e=>(e.from===n.id||e.to===n.id)&&!visibleEdges.includes(e));
   $('#details').innerHTML=`<div class="detail-type"><span class="type-dot"></span>${esc(typeName[n.type]||n.type)}${n.id==='you'?' / NOT THE CENTRE OF EVERYTHING':''}</div><h2>${esc(label(n.id))}${n.id==='you'?'<span style="color:var(--accent)">.</span>':''}</h2><p class="insight">${esc(n.insight)}</p><p class="explanation">${esc(n.text)}</p><button class="focus-button" id="look-here">${state.focus===n.id?'Return to the wider view':'Look from here'} <span>↗</span></button>${n.boundary?`<p class="boundary">${esc(n.boundary)}</p>`:''}<h3>${rels.length?`${rels.length} connections in this view`:'No connections in this filtered view'}</h3>${rels.map(e=>{const other=e.from===n.id?e.to:e.from;return`<button class="relation" data-edge="${esc(e.id)}"><span><i class="edge-swatch ${esc(e.type)}"></i>${esc(label(other))}<small>${e.from===n.id?'→':'←'} ${esc(e.label)}</small></span><span>↗</span></button>`;}).join('')}${others.length?`<p class="boundary">${others.length} further relationship${others.length===1?' is':'s are'} outside this view or hidden by your filters. Explore “All connections” with both filters enabled to inspect the wider map.</p>`:''}${n.sources.length?`<h3>Evidence & provenance</h3>${renderSources(n.sources)}`:'<p class="boundary">A reflective prompt. No personal relationships, contacts or choices have been inferred.</p>'}`;
  }
  $('#details').querySelectorAll('[data-edge]').forEach(b=>b.addEventListener('click',()=>selectEdge(b.dataset.edge)));
  $('#details').querySelectorAll('[data-node]').forEach(b=>b.addEventListener('click',()=>selectNode(b.dataset.node)));
  $('#look-here')?.addEventListener('click',()=>{state.focus=state.focus===n.id?null:n.id;syncUI();details();invalidate();});
 }
 function renderList(){const q=$('#search').value.toLowerCase().trim();const ids=visibleNodes.filter(id=>`${label(id)} ${A.nodes[id].type} ${A.nodes[id].text}`.toLowerCase().includes(q));$('#list-nodes').innerHTML=ids.length?ids.map(id=>`<button data-list-node="${esc(id)}" aria-pressed="${id===state.selected}"><span class="type-dot"></span><span>${esc(label(id))}<small>${esc(typeName[A.nodes[id].type]||A.nodes[id].type)}</small></span></button>`).join(''):'<p class="list-note">No matching node in this view. Try “All connections”.</p>';$('#list-nodes').querySelectorAll('button').forEach(b=>b.onclick=()=>{selectNode(b.dataset.listNode,{scroll:true});renderList();});}
 function syncLabels(){const signature=visibleNodes.join(',');if(signature!==lastLabelSignature){$('#labels').replaceChildren();labelMap.clear();visibleNodes.forEach(id=>{const b=document.createElement('button');b.className='node-label';b.dataset.id=id;b.addEventListener('click',()=>selectNode(id));$('#labels').append(b);labelMap.set(id,b);});lastLabelSignature=signature;}
  labelMap.forEach((b,id)=>{b.innerHTML=esc(label(id))+(id===state.selected||id==='you'?`<span class="node-kind">${id==='you'?'A PLACE TO LOOK FROM':esc(typeName[A.nodes[id].type]||A.nodes[id].type)}</span>`:'');b.classList.toggle('is-selected',id===state.selected);b.classList.toggle('is-person',id==='you');b.setAttribute('aria-pressed',String(id===state.selected));b.setAttribute('aria-label',`${label(id)}, ${typeName[A.nodes[id].type]||A.nodes[id].type}. Explore connections.`);});
 }
 function updateTimeUI(){
  const idx=temporalIndex(),s=scenario()[idx];$('#time').value=state.time;$('#time').setAttribute('aria-valuetext',`${idx+1} of 4: ${s.title} Illustrative, not a forecast.`);$('#time-number').textContent=String(idx+1).padStart(2,'0');$('#time-title').textContent=s.title;$('#time-copy').textContent=s.text;$$('[data-time]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.time)===idx)));$('#play-time').setAttribute('aria-pressed',String(state.playing));$('#play-time').textContent=state.playing?'Ⅱ':'▶';$('#play-time').setAttribute('aria-label',state.playing?'Pause illustrative time sequence':'Play illustrative time sequence');
 }
 function setTime(t,{select=true}={}){state.time=clamp(Number(t)||0,0,3);const idx=temporalIndex();if(idx!==lastTimeIndex&&select&&state.mode==='4d'){state.selected=scenario()[idx].focus;state.edge=null;lastTimeIndex=idx;details();syncLabels();updateCaption();}updateTimeUI();invalidate();}
 function resetCamera(ui=true){Object.assign(target,{yaw:.28,pitch:.28,distance:state.world==='all'?1040:770,panX:0,panY:0});if(state.reduced)Object.assign(camera,target);state.focus=null;if(ui){syncUI();details();invalidate();}}
 function resize(){const box=stage.getBoundingClientRect();W=Math.max(1,box.width);H=Math.max(1,box.height);DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);invalidate();}
 function invalidate(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
 function tick(now){frame=0;const dt=Math.min((now-(lastFrame||now))/1000,.05);lastFrame=now;let active=false;
  if(state.orbit&&!document.hidden){target.yaw+=dt*.11;active=true;}
  if(state.playing&&state.mode==='4d'){setTime(Math.min(3,state.time+dt*.115));if(state.time>=3){state.playing=false;updateTimeUI();}active=true;}
  for(const k of Object.keys(camera)){const delta=target[k]-camera[k];if(Math.abs(delta)>.0001){camera[k]+=delta*(state.reduced?1:.17);active=true;}}
  transient=now*.001;drawScene(ctx,W,H,DPR,false);renderCount++;
  if(state.motion)active=true;
  if(active)invalidate();
 }
 function curve(e){const a=getPosition(e.from),b=getPosition(e.to);const seed=e.id.split('').reduce((s,c)=>s+c.charCodeAt(0),0);const bend=(seed%2?1:-1)*(.16+(seed%3)*.04);return[a,[(a[0]+b[0])/2+(b[1]-a[1])*bend,(a[1]+b[1])/2-(b[0]-a[0])*bend,(a[2]+b[2])/2+58],b];}
 function bezier(ps,t){const q=1-t;return ps[0].map((v,j)=>q*q*v+2*q*t*ps[1][j]+t*t*ps[2][j]);}
 function drawScene(c,w,h,dpr=1,anonymous=false){
  if(!c)return;const P=palettes[state.theme];c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  const pnodes=visibleNodes.map(id=>{const p=project(getPosition(id),w,h);const radius=(id==='you'?23:state.world==='all'?9.2:14)*p.scale;return{id,...p,r:clamp(radius,id==='you'?10:5,42),alpha:strength(id)};});
  const bg=c.createRadialGradient(w*.50,h*.64,8,w*.50,h*.64,w*.46);bg.addColorStop(0,state.theme==='light'?'#62774f0c':'#7fbea50a');bg.addColorStop(1,'#88888800');c.fillStyle=bg;c.beginPath();c.ellipse(w*.50,h*.64,w*.46,h*.17,0,0,Math.PI*2);c.fill();
  // Orienting rings are decoration, not relationships or measured boundaries.
  c.save();c.globalAlpha=state.theme==='dark'?.18:.24;c.strokeStyle=P.line;c.lineWidth=.55;
  [0,1].forEach(k=>{c.beginPath();for(let i=0;i<=120;i++){const a=i/120*Math.PI*2,rad=state.world==='all'?355:270;const p=project([Math.cos(a)*rad,Math.sin(a)*rad*.40,Math.sin(a)*rad*.70+k*30-20],w,h);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.setLineDash(k?[1,8]:[]);c.stroke();});c.restore();
  if(state.mode==='4d'){
   c.save();c.strokeStyle=P.unknown;c.lineWidth=.55;c.setLineDash([2,9]);for(let k=0;k<4;k++){c.globalAlpha=.06+Math.max(0,1-Math.abs(k-state.time))*.11;c.beginPath();for(let i=0;i<=90;i++){const a=i/90*Math.PI*2,p=project([Math.cos(a)*225,Math.sin(a)*150,(k-state.time)*62],w,h);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.stroke();}c.restore();
  }
  const prims=pnodes.map(n=>({type:'node',z:n.z,n}));const hits=[];
  visibleEdges.forEach(e=>{const ps=curve(e),raw=[];for(let i=0;i<=40;i++)raw.push(project(bezier(ps,i/40),w,h));const from=pnodes.find(n=>n.id===e.from),to=pnodes.find(n=>n.id===e.to);const pts=raw.filter(p=>Math.hypot(p.x-from.x,p.y-from.y)>from.r+2&&Math.hypot(p.x-to.x,p.y-to.y)>to.r+2);if(pts.length>3)prims.push({type:'edge',e,ps,pts,z:pts.reduce((s,p)=>s+p.z,0)/pts.length});});
  prims.sort((a,b)=>a.type===b.type?a.z-b.z:a.type==='edge'?-1:1);
  prims.forEach(o=>{
   if(o.type==='edge'){
    const {e,pts}=o;const selected=state.edge===e.id||!state.edge&&(e.from===state.selected||e.to===state.selected);const salience=Math.min(strength(e.from),strength(e.to));
    c.save();c.globalAlpha=(selected?.77:.38)*salience;c.strokeStyle=P[e.type]||P.depends;c.lineWidth=selected?1.2:.8;c.setLineDash(e.type==='unknown'?[3,5]:[]);c.lineCap='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.setLineDash([]);
    const ai=Math.max(0,Math.floor((pts.length-1)*.64)),a=pts[ai],b=pts[ai+1],theta=Math.atan2(b.y-a.y,b.x-a.x),size=selected?4:3.1;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-size*Math.cos(theta-.45),b.y-size*Math.sin(theta-.45));c.moveTo(b.x,b.y);c.lineTo(b.x-size*Math.cos(theta+.45),b.y-size*Math.sin(theta+.45));c.stroke();
    if(state.motion&&selected){const t=(transient*.14+e.id.length*.12)%1,p=project(bezier(o.ps,t),w,h);c.globalAlpha=.9*salience;c.fillStyle=P[e.type]||P.depends;c.beginPath();c.arc(p.x,p.y,1.65,0,Math.PI*2);c.fill();}
    c.restore();hits.push({id:e.id,pts});
   }else{
    const n=o.n,[shine,mid,base,shadow]=color(n.id),r=n.r;c.save();c.globalAlpha=clamp(n.alpha*(.83+(n.z+250)/2400),.09,1);
    const halo=c.createRadialGradient(n.x,n.y,r*.35,n.x,n.y,r*2.3);halo.addColorStop(0,mid+(state.theme==='dark'?'2c':'16'));halo.addColorStop(1,mid+'00');c.fillStyle=halo;c.beginPath();c.arc(n.x,n.y,r*2.3,0,Math.PI*2);c.fill();
    if(n.id===state.selected||n.id==='you'){
     c.strokeStyle=mid;c.lineWidth=.65;c.globalAlpha*=.62;c.beginPath();c.ellipse(n.x,n.y,r*1.55,r*.54,-.37+camera.yaw*.1,0,Math.PI*2);c.stroke();c.globalAlpha=clamp(n.alpha,.15,1);
    }
    const sphere=c.createRadialGradient(n.x-r*.39,n.y-r*.5,r*.015,n.x+r*.03,n.y+r*.09,r*1.08);sphere.addColorStop(0,shine);sphere.addColorStop(.28,mid);sphere.addColorStop(.72,base);sphere.addColorStop(1,shadow);c.fillStyle=sphere;c.beginPath();c.arc(n.x,n.y,r,0,Math.PI*2);c.fill();
    c.strokeStyle=shine;c.globalAlpha*=.5;c.lineWidth=.5;c.beginPath();c.arc(n.x,n.y,r-.3,3.5,5.9);c.stroke();
    if(A.nodes[n.id].type==='actor'){c.globalAlpha=n.alpha*.75;c.strokeStyle=P.ink;c.lineWidth=.5;c.strokeRect(n.x-r*1.35,n.y-r*1.35,r*2.7,r*2.7);}
    c.restore();
   }
  });
  if(anonymous){pnodes.sort((a,b)=>a.z-b.z).forEach(n=>{if(n.alpha<.4)return;c.save();c.fillStyle=P.ink;c.globalAlpha=n.alpha;c.textAlign='center';c.font=`${n.id==='you'?'italic ':''}${n.id==='you'?18:11}px ${n.id==='you'?'Georgia':'Arial'}`;c.fillText(label(n.id,true),n.x,n.y+n.r+20);c.restore();});}
  else{projected=pnodes;edgeHits=hits;positionLabels();}
 }
 function positionLabels(){syncLabelsIfNeeded();const taken=[];const priority=n=>(n.id===state.selected?10000:0)+(n.id==='you'?5000:0)+n.z;const ordered=[...projected].sort((a,b)=>priority(b)-priority(a));
  ordered.forEach(n=>{const el=labelMap.get(n.id);if(!el)return;const isKey=n.id===state.selected||n.id==='you';const width=Math.min(W-10,Math.max(64,label(n.id).length*(W<420?6:6.6)+23)),height=isKey?44:32;const x=clamp(n.x,width/2+4,W-width/2-4);let chosen=null;
   const candidates=[{x:x-width/2,y:n.y+n.r+8},{x:x-width/2,y:n.y-n.r-height-6},{x:x-width/2,y:n.y+n.r+32},{x:clamp(n.x+n.r+10,4,W-width-4),y:n.y-height/2},{x:x-width/2,y:n.y-n.r-height-30},{x:clamp(n.x-n.r-width-12,4,W-width-4),y:n.y-height/2},{x:x-width/2,y:n.y+n.r+56},{x:clamp(x-width/2+24,4,W-width-4),y:n.y+n.r+18},{x:clamp(x-width/2-24,4,W-width-4),y:n.y+n.r+18}];
   for(const pos of candidates){const r={...pos,w:width,h:height};if(r.y<36||r.y+height>H-65)continue;const collision=taken.some(t=>r.x<t.x+t.w&&r.x+width>t.x&&r.y<t.y+t.h&&r.y+height>t.y);const coversNode=projected.some(p=>p.id!==n.id&&p.x+p.r>r.x&&p.x-p.r<r.x+r.w&&p.y+p.r>r.y&&p.y-p.r<r.y+r.h);if(!collision&&!coversNode){chosen=r;break;}}
   const shown=!!chosen&&n.x>-10&&n.x<W+10&&n.y>24&&n.y<H-70;if(shown)taken.push(chosen);el.style.left=`${((chosen?.x??x-width/2)+width/2).toFixed(1)}px`;el.style.top=`${(chosen?.y??0).toFixed(1)}px`;el.style.opacity=String(n.alpha<.5?.42:.92);el.style.visibility=shown?'visible':'hidden';el.tabIndex=shown?0:-1;
  });
 }
 function syncLabelsIfNeeded(){if(lastLabelSignature!==visibleNodes.join(','))syncLabels();}
 function nearest(x,y){const nodes=projected.filter(n=>Math.hypot(n.x-x,n.y-y)<Math.max(n.r+8,16)).sort((a,b)=>b.z-a.z);if(nodes.length)return{node:nodes[0].id};let best=null,dist=8;edgeHits.forEach(e=>{for(let i=1;i<e.pts.length;i++){const a=e.pts[i-1],b=e.pts[i],dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1),0,1),d=Math.hypot(x-a.x-t*dx,y-a.y-t*dy);if(d<dist){dist=d;best={edge:e.id};}}});return best;}
 // Pointer orbit, shift/right-drag pan, two-pointer pinch, keyboard equivalents.
 const pointers=new Map();let pinch=0,down=null,pan=false;
 canvas.addEventListener('pointerdown',e=>{canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});down={x:e.clientX,y:e.clientY};lastPointer={x:e.clientX,y:e.clientY};dragging=false;pan=e.shiftKey||e.button===2;if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);dragging=true;}});
 canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinch>0&&d>0)target.distance=clamp(target.distance*pinch/d,360,1800);pinch=d;dragging=true;}else{const dx=e.clientX-prev.x,dy=e.clientY-prev.y;if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)dragging=true;if(pan){target.panX=clamp(target.panX+dx/W,-.4,.4);target.panY=clamp(target.panY+dy/H,-.4,.4);}else{target.yaw+=dx*.006;target.pitch=clamp(target.pitch+dy*.005,-1.12,1.12);}}invalidate();});
 function finishPointer(e){if(e.type==='pointerup'&&!dragging&&pointers.size===1){const b=canvas.getBoundingClientRect(),hit=nearest(e.clientX-b.left,e.clientY-b.top);if(hit?.node)selectNode(hit.node);else if(hit?.edge)selectEdge(hit.edge);}pointers.delete(e.pointerId);if(pointers.size===0){pinch=0;dragging=false;down=null;}else{dragging=true;}}
 canvas.addEventListener('pointerup',finishPointer);canvas.addEventListener('pointercancel',finishPointer);canvas.addEventListener('contextmenu',e=>e.preventDefault());
 canvas.addEventListener('wheel',e=>{e.preventDefault();target.distance=clamp(target.distance*Math.exp(clamp(e.deltaY,-120,120)*.0015),360,1800);invalidate();},{passive:false});
 canvas.addEventListener('keydown',e=>{let handled=true;switch(e.key){case'ArrowLeft':target.yaw-=.13;break;case'ArrowRight':target.yaw+=.13;break;case'ArrowUp':target.pitch=clamp(target.pitch-.10,-1.12,1.12);break;case'ArrowDown':target.pitch=clamp(target.pitch+.10,-1.12,1.12);break;case'+':case'=':target.distance=clamp(target.distance*.86,360,1800);break;case'-':target.distance=clamp(target.distance*1.16,360,1800);break;case'Home':resetCamera();break;default:handled=false;}if(handled){e.preventDefault();invalidate();}});
 function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4200);}
 function modal(html){modalReturn=document.activeElement;$('#dialog-body').innerHTML=html;$('#dialog').showModal();}
 function closeModal(){$('#dialog').close();}
 $('#close-dialog').onclick=closeModal;$('#dialog').addEventListener('close',()=>modalReturn?.focus?.({preventScroll:true}));$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog')){const b=$('#dialog').getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeModal();}});
 function showAbout(){modal(`<h2>A lens. Not the whole truth.</h2><p><strong>3D space:</strong> every node has an x, y and z position. Orbiting changes the actual perspective projection—not just a background animation.</p><p><strong>4D time:</strong> an authored, hypothetical sequence brings different relationships into focus. It has no dates, probabilities or predicted impacts. This is not a fourth spatial axis or a validated simulation.</p><h3>Lives, systems, uncertainty.</h3><p>All potentially sentient beings belong within the moral scope, including wild animals and possible future beings. This small atlas is not exhaustive. Soil, water and ecosystems are included as life-support systems, without assuming they are conscious.</p><p>Each selected relationship distinguishes evidence, an ethical lens, a proposed response or an illustrative connection. Organisations describe work on a branch; their presence is not an endorsement or independent proof of impact.</p><h3>Your life stays yours.</h3><p>No contacts, location or habits are imported. An optional display name stays in this browser. Names never enter share links or exported cards. There are no analytics, accounts or central feedback collection in this preview.</p><p class="small">The original curated atlas 1.0 supplies ${Object.keys(A.nodes).length} nodes and ${A.edges.length} relationships. Its evidence notes are inherited, not newly validated by this visual redesign. Position, visual scale, colour and animation do not encode measured impact, moral worth or physical distance.</p><div class="dialog-actions"><button class="pill" id="export-json">Export atlas + scenario notes ↗</button><a class="pill" href="../design-02/">Return to the 2D atlas ↗</a></div>`);$('#export-json').onclick=()=>download(new Blob([JSON.stringify({atlas:A,temporalScenarios:timeStories,notice:'Authored qualitative sequences, not predictions. No personal data included.'},null,2)],{type:'application/json'}),'interbeing-spatial-atlas.json');}
 function showHelp(){modal(`<h2>Move a little.<br>Notice something new.</h2><div class="dialog-key"><span>Orbit the space</span><span>Drag · Arrow keys</span></div><div class="dialog-key"><span>Move closer / further</span><span>Wheel · Pinch · + / −</span></div><div class="dialog-key"><span>Move the frame</span><span>Shift + drag · Right-drag</span></div><div class="dialog-key"><span>Return to the starting view</span><span>⌖ · Home key</span></div><p>Select a sphere, a label or a relationship. “Look from here” recentres the space around another participant and brings its neighbours into focus.</p><p>Use <strong>List view</strong> for the same nodes and relationship details without spatial navigation. Hidden or overlapping labels do not remove nodes from that list.</p><p class="small">Slow orbit and moving link markers are optional. Link animation communicates direction only—not a measured flow or effect size. No motion or time playback starts automatically.</p>`);}
 function showPersonal(){modal(`<h2>A place to look from.</h2><p>You do not need a profile to belong here. Add a display name, or simply stay “You”. The connections remain examples, not a personal assessment.</p><form id="name-form"><label for="display-name">Display name · optional</label><input id="display-name" name="name" type="text" maxlength="32" autocomplete="off" value="${esc(state.name)}"><p class="small">Stored only in this browser. Never included in shared links or cards.</p><div class="dialog-actions"><button class="pill primary" type="submit">Keep my place ↗</button><button class="pill" id="forget-name" type="button">Use “You” instead</button></div></form>`);$('#name-form').onsubmit=e=>{e.preventDefault();state.name=$('#display-name').value.trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,32);storage.set('interbeing-space-name',state.name);details();renderList();syncLabels();updateCaption();invalidate();closeModal();toast('Your place is saved on this device. Shared views stay anonymous.');};$('#forget-name').onclick=()=>{state.name='';storage.set('interbeing-space-name','');details();renderList();syncLabels();updateCaption();invalidate();closeModal();};}
 function shareURL(){const p=new URLSearchParams({v:'1',w:state.world,l:state.lens,m:state.mode,n:state.selected,t:state.time.toFixed(2),y:camera.yaw.toFixed(3),p:camera.pitch.toFixed(3),d:camera.distance.toFixed(0),a:String(+state.actors),c:String(+state.tensions),theme:state.theme});if(state.edge)p.set('e',state.edge);if(state.focus)p.set('f',state.focus);p.set('px',camera.panX.toFixed(3));p.set('py',camera.panY.toFixed(3));const base=!/^https?:$/.test(location.protocol)?'https://mikelninh.github.io/interbeing/space/':location.origin+location.pathname;return base+'#'+p.toString();}
 function readHash(){const p=new URLSearchParams(location.hash.slice(1));if(p.get('v')!=='1')return;state.world=validWorld.includes(p.get('w'))?p.get('w'):'self';state.lens=A.lenses[p.get('l')]?p.get('l'):'ecological';state.mode=p.get('m')==='4d'?'4d':'3d';state.time=clamp(Number(p.get('t'))||0,0,3);state.selected=A.nodes[p.get('n')]?p.get('n'):'you';state.edge=edgeById[p.get('e')]?p.get('e'):null;state.focus=A.nodes[p.get('f')]?p.get('f'):null;state.actors=p.get('a')!=='0';state.tensions=p.get('c')!=='0';state.theme=p.get('theme')==='dark'?'dark':'light';const finite=(key,fallback,min,max)=>{const v=Number(p.get(key));return p.has(key)&&Number.isFinite(v)?clamp(v,min,max):fallback;};camera.yaw=finite('y',.28,-100,100);camera.pitch=finite('p',.28,-1.12,1.12);camera.distance=finite('d',770,360,1800);camera.panX=finite('px',0,-.4,.4);camera.panY=finite('py',0,-.4,.4);Object.assign(target,camera);}
 async function copyLink(){try{await navigator.clipboard.writeText(shareURL());toast('Perspective copied. Your name is not included.');return true;}catch{const box=$('#share-url');if(box){box.focus();box.select();toast('Select and copy the link shown here.');}return false;}}
 function showShare(){const labelScene=state.world==='all'?'A wider atlas':A.scenes[state.world].label;modal(`<h2>A different point of view.<br>Pass it on.</h2><div class="share-info">${esc(state.edge?edgeById[state.edge].label:A.nodes[state.selected].insight)}<small>${esc(labelScene)} · ${state.mode==='4d'?'4D / illustrative time sequence':'3D / spatial atlas'}<br>No personal name or private data in the link or image.</small></div><label for="share-url">This reopens your scene, selection, camera and time step.</label><textarea id="share-url" readonly>${esc(shareURL())}</textarea><div class="dialog-actions"><button class="pill primary" id="copy-link">Copy perspective ↗</button><button class="pill" id="save-card">Save image</button>${typeof navigator.share==='function'?'<button class="pill" id="native-share">Share…</button>':''}</div><p class="small">A thought to send with it: “Choose a life other than your own. What changes when you look from there?”</p>`);$('#copy-link').onclick=copyLink;$('#save-card').onclick=saveCard;$('#native-share')?.addEventListener('click',async()=>{try{await navigator.share({title:'Interbeing — A shared perspective',text:'Choose a life other than your own. What changes when you look from there?',url:shareURL()});}catch(e){if(e.name!=='AbortError')toast('Sharing is unavailable here. Copy the link instead.');}});}
 function download(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function wrap(c,text,x,y,width,lineHeight){let line='';text.split(' ').forEach(word=>{const test=line+word+' ';if(c.measureText(test).width>width&&line){c.fillText(line.trim(),x,y);line=word+' ';y+=lineHeight;}else line=test;});if(line)c.fillText(line.trim(),x,y);return y;}
 function saveCard(){const out=document.createElement('canvas');out.width=1200;out.height=720;const c=out.getContext('2d'),P=palettes[state.theme];c.fillStyle=P.bg;c.fillRect(0,0,1200,720);const map=document.createElement('canvas');map.width=800;map.height=570;drawScene(map.getContext('2d'),800,570,1,true);c.drawImage(map,375,88);c.fillStyle=P.ink;c.font='34px Georgia';c.fillText('interbeing.',46,64);c.font='10px Arial';c.fillStyle=P.muted;c.fillText('FROM INTERCONNECTED SUFFERING TO SHARED SOLUTIONS.',46,91);c.font='52px Georgia';c.fillStyle=P.ink;c.fillText('A life within',46,200);c.font='italic 52px Georgia';c.fillText('other lives.',46,258);c.font='italic 22px Georgia';wrap(c,state.edge?edgeById[state.edge].claim:A.nodes[state.selected].insight,48,321,315,30);c.font='11px Arial';c.fillStyle=P.muted;const world=state.world==='all'?'A wider atlas':A.scenes[state.world].label;wrap(c,`${world} / ${state.mode==='4d'?'4D: illustrative sequence, not a forecast':'3D: a spatial lens'}`,48,513,302,20);wrap(c,'No inferred personal relationships. No measured impacts. Names are excluded from this card.',48,579,305,19);c.strokeStyle=state.theme==='light'?'#bec6b6':'#556960';c.lineWidth=.7;c.beginPath();c.moveTo(46,662);c.lineTo(1154,662);c.stroke();c.font='10px Arial';c.fillText('Position, size and colour do not measure impact, moral worth or physical distance.',46,692);c.textAlign='right';c.fillText('mikelninh.github.io/interbeing/space',1154,692);out.toBlob(blob=>{if(blob)download(blob,'interbeing-shared-perspective.png');else toast('The image could not be created. The perspective link still works.');},'image/png');}
 // Accessible DOM controls remain outside the renderer.
 $$('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$$('[data-world]').forEach(b=>b.onclick=()=>setWorld(b.dataset.world));
 $('#lens').onchange=e=>{state.lens=e.target.value;state.focus=null;state.edge=null;state.selected='you';refresh();};
 $('#actors').onchange=e=>{state.actors=e.target.checked;refresh();};$('#tensions').onchange=e=>{state.tensions=e.target.checked;refresh();};
 $('#list-toggle').onclick=()=>{state.list=!state.list;syncUI();renderList();if(state.list)$('#search').focus({preventScroll:true});else canvas.focus({preventScroll:true});};$('#search').oninput=renderList;
 $('#theme').onclick=()=>{state.theme=state.theme==='light'?'dark':'light';syncUI();invalidate();};
 $('#zoom-in').onclick=()=>{target.distance=clamp(target.distance*.84,360,1800);invalidate();};$('#zoom-out').onclick=()=>{target.distance=clamp(target.distance*1.18,360,1800);invalidate();};$('#reset').onclick=()=>resetCamera();
 $('#orbit').onclick=()=>{state.orbit=!state.orbit;if(state.orbit)state.motion=true;syncUI();invalidate();};$('#motion').onclick=()=>{state.motion=!state.motion;if(!state.motion){state.orbit=false;state.playing=false;}syncUI();invalidate();};
 $('#time').oninput=e=>{state.playing=false;setTime(e.target.value);};$$('[data-time]').forEach(b=>b.onclick=()=>{state.playing=false;setTime(b.dataset.time);});
 $('#play-time').onclick=()=>{state.playing=!state.playing;if(state.playing){if(state.time>=3)setTime(0);state.motion=true;}syncUI();invalidate();};
 $('#share').onclick=showShare;$('#personalise').onclick=showPersonal;$('#about').onclick=showAbout;$('#approach').onclick=showAbout;$('#help').onclick=showHelp;
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;lastFrame=0;if(state.playing){state.playing=false;updateTimeUI();}}else invalidate();});
 window.addEventListener('hashchange',()=>{readHash();refresh();});
 readHash();refresh();new ResizeObserver(resize).observe(stage);resize();
 window.InterbeingSpace={version:'0.3.0',getState:()=>({...state,name:state.name?'[device-only]':'',camera:{...camera}}),getModel:()=>({nodes:visibleNodes.slice(),edges:visibleEdges.map(e=>e.id),positions:JSON.parse(JSON.stringify(layout)),temporalScenarios:timeStories}),getDiagnostics:()=>({renderer:'Canvas 2D / genuine x-y-z perspective projection',width:W,height:H,dpr:DPR,frames:renderCount,visibleLabels:[...labelMap.values()].filter(e=>e.style.visibility==='visible').length,projection:projected.map(p=>({id:p.id,x:p.x,y:p.y,z:p.z,scale:p.scale}))}),shareURL,selectNode,setWorld,setMode,setTime,resetCamera};
})();
