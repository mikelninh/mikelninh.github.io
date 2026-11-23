/* THE WAY v0.1 | living atlas interface.
   Editorial theatre anchors are separate from dated news items.
   No geolocation, tracking identifiers, cookies, user accounts or political persuasion ranking. */
(function(){
"use strict";
const records=Array.isArray(window.WAY_CONFLICTS)?window.WAY_CONFLICTS:[];
const meta=window.WAY_META||{};
const sources=window.WAY_SOURCES||{};
const $=id=>document.getElementById(id);
const state={q:"",kind:"all",region:"all",selected:null,news:null};
const order=["Africa","Americas","Asia","Europe","Middle East"];
const label={fighting:"Armed conflict",violence:"Organised violence",risk:"Tension / instability"};
let map=null,markerLayer=null,markerById=new Map();
function safe(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function concise(t,max=180){return t.length>max?t.slice(0,max-1)+"…":t}
function visible(){
 return records.filter(r=>(state.kind==="all"||r.kind===state.kind)&&(state.region==="all"||r.region===state.region)&&(!state.q||[r.title,r.region,r.location,r.actors,r.drivers].join(" ").toLowerCase().includes(state.q)))
 .sort((a,b)=>order.indexOf(a.region)-order.indexOf(b.region)||a.title.localeCompare(b.title))
}
function categoryCount(k){return records.filter(x=>x.kind===k).length}
function niceRegion(r){return r==="Middle East"?"Middle East":r==="Asia"?"Asia & Pacific":r==="Europe"?"Europe & Eurasia":r}
function renderStats(){
 $("counter-total").textContent=records.length;
 $("kind-all").textContent=records.length;
 $("atlas-last-reviewed").textContent="EDITORIAL REVIEW · "+new Date(meta.reviewed+"T12:00:00Z").toLocaleDateString("en-GB",{timeZone:"UTC",day:"numeric",month:"short",year:"numeric"}).toUpperCase();
}
function renderList(){
 const rs=visible();$("filtered-count").textContent=rs.length;
 $("list-result").textContent=rs.length===records.length?"Showing all tracked situations":rs.length+" of "+records.length+" tracked situations";
 const list=$("conflict-list");
 if(!rs.length){list.innerHTML='<div class="loading-note" style="padding:22px">No matching theatres. Try another region or keyword.</div>';return}
 list.innerHTML=rs.map(r=>{
  return '<button class="conflict-row'+(state.selected===r.id?' selected':'')+'" data-id="'+safe(r.id)+'" aria-pressed="'+(state.selected===r.id)+'">'+
  '<span class="row-status '+safe(r.kind)+'"></span><span><span class="row-title">'+safe(r.title)+'</span><span class="row-sub">'+safe(niceRegion(r.region))+' · '+safe(label[r.kind])+'</span></span><span class="row-arrow">↗</span></button>';
 }).join("");
}
function sourceLinks(r){
 return r.sources.map(k=>sources[k]).filter(Boolean).map(s=>'<a href="'+safe(s.url)+'" rel="noopener noreferrer" target="_blank" title="'+safe(s.note)+'">'+safe(s.name)+' ↗</a>').join("");
}
function infoPart(n,t,copy,highlight=false){
 return '<section class="dossier-section'+(highlight?' highlight':'')+'"><span class="label">'+safe(n+' / '+t)+'</span><p>'+safe(copy)+'</p></section>';
}
function linkedProcess(c){
 const processes=Array.isArray(window.WAY_PROCESSES)?window.WAY_PROCESSES:[];
 const r=processes.find(p=>Array.isArray(p.anchorIds)&&p.anchorIds.includes(c.id));
 return r?'<div class="dossier-process-link"><span>NEW / FOLLOW THE PROMISE</span><p>Read the documented agreement, its milestones and evidence of implementation.</p><a href="./progress.html?process='+encodeURIComponent(r.id)+'">OPEN THE PEACE LEDGER ↗</a></div>':'';
}
function renderDetails(){
 const c=records.find(r=>r.id===state.selected),el=$("dossier-content"),empty=$("dossier-empty");
 $("atlas-ui").classList.toggle("dossier-open",!!c);
 empty.hidden=!!c;el.hidden=!c;
 if(!c)return;
 el.innerHTML='<div class="dossier-top"><div class="dossier-topbar"><span class="dossier-kicker">A HUMAN STORY / '+safe(c.region.toUpperCase())+'</span><button type="button" class="dossier-close" id="close-dossier" aria-label="Close dossier">×</button></div>'+
 '<h3>'+safe(c.title)+'</h3><div class="dossier-location">⌖ '+safe(c.location)+' · Approx. location</div>'+
 '<div class="dossier-pills"><span class="dossier-pill"><i class="'+safe(c.kind)+'"></i>'+safe(label[c.kind])+'</span><span class="dossier-pill">REVIEWED '+safe(c.reviewed)+'</span></div></div>'+
 infoPart("01","WHY IT EXISTS",c.drivers)+
 infoPart("02","WHO IS INVOLVED",c.actors)+
 infoPart("03","THE HUMAN COST",c.human)+
 infoPart("04","WHAT STANDS IN THE WAY",c.barrier)+
 infoPart("05","POSSIBLE PATHS TOWARDS PEACE",c.path,true)+
 infoPart("06","HOW TO KNOW IF THINGS IMPROVE",c.measure,true)+
 linkedProcess(c)+
 '<section class="dossier-section"><span class="label">07 / OPEN THE EVIDENCE</span><div class="source-stack">'+sourceLinks(c)+'</div><p class="disclosure">These links lead to broader monitoring and research programmes, not necessarily articles substantiating every sentence. Summaries and pathway ideas are independently authored hypotheses for critical review.</p></section>'+
 '<div class="dossier-actions"><button type="button" id="share-record">COPY LINK ↗</button><button type="button" id="clear-record">CLOSE</button></div>';
 $("close-dossier").onclick=clearSelection;
 $("clear-record").onclick=clearSelection;
 $("share-record").onclick=shareCurrent;
}
function setUrl(id){
 const u=new URL(location.href);if(id)u.searchParams.set("conflict",id);else u.searchParams.delete("conflict");
 history.replaceState(null,"",u.pathname+u.search+u.hash);
}
function select(id,opts={}){
 const r=records.find(x=>x.id===id);if(!r)return;
 state.selected=id;renderList();renderDetails();setUrl(id);
 if(map && !opts.noFly){map.flyTo([r.lat,r.lng],Math.max(map.getZoom(),5),{duration:.8})}
 if(map){renderMarkers()}
 if(window.innerWidth<=800 && !opts.noScroll){$("dossier").scrollTop=0}
}
function clearSelection(){
 state.selected=null;renderList();renderDetails();setUrl(null);renderMarkers();
}
function shareCurrent(){
 const url=new URL(location.href).toString();
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(()=>notify("Link copied")).catch(()=>fallbackCopy(url));
 else fallbackCopy(url);
}
function fallbackCopy(s){
 const t=document.createElement("textarea");t.value=s;t.setAttribute("readonly","");t.style.position="fixed";t.style.top="-1000px";document.body.append(t);t.select();
 try{document.execCommand("copy");notify("Link copied")}catch(_){notify("Copy the URL in your address bar")}t.remove();
}
let toaster=null;
function notify(msg){if(toaster)toaster.remove();toaster=document.createElement("div");toaster.className="toast-msg";toaster.textContent=msg;document.body.append(toaster);setTimeout(()=>toaster&&toaster.remove(),3100)}
function mapFallback(){const f=$("map-fallback");if(f)f.hidden=false}
function mapStyle(c,isSelected){
 return '<span class="way-pin '+safe(c.kind)+(isSelected?' selected':'')+'" aria-hidden="true"><span></span></span>';
}
function redrawCluster(groups){
 if(!map)return;
 markerLayer.clearLayers();markerById.clear();
 for(const members of groups){
  if(members.length===1){
   const c=members[0];
   const icon=L.divIcon({className:"way-marker-wrap",html:mapStyle(c,c.id===state.selected),iconSize:[27,27],iconAnchor:[13,13]});
   const marker=L.marker([c.lat,c.lng],{icon,title:c.title,keyboard:true,alt:c.title});
   marker.on("click",()=>select(c.id));
   marker.addTo(markerLayer);markerById.set(c.id,marker);
  }else{
   const lat=members.reduce((x,c)=>x+c.lat,0)/members.length;
   let xs=0,ys=0;for(const c of members){xs+=Math.cos(c.lng*Math.PI/180);ys+=Math.sin(c.lng*Math.PI/180)}
   const lng=Math.atan2(ys,xs)*180/Math.PI;
   const icon=L.divIcon({className:"way-marker-wrap",html:'<span class="way-cluster">'+members.length+'</span>',iconSize:[39,39],iconAnchor:[19,19]});
   const marker=L.marker([lat,lng],{icon,title:members.length+" tracked theatres",keyboard:true});
   marker.on("click",()=>{
     const bounds=L.latLngBounds(members.map(c=>[c.lat,c.lng]));
     const next=Math.min(7,map.getZoom()+2);
     if(bounds.isValid() && Math.abs(bounds.getEast()-bounds.getWest())<120){map.fitBounds(bounds.pad(.45),{maxZoom:next,animate:true})}
     else map.setView([lat,lng],next,{animate:true});
   });marker.addTo(markerLayer);
  }
 }
}
function renderMarkers(){
 if(!map||!markerLayer)return;
 const items=visible();const zoom=map.getZoom();
 if(zoom>=6){redrawCluster(items.map(x=>[x]));return}
 const cell=zoom<2?46:zoom<3?56:zoom<4?62:70;
 const bucket=new Map();
 for(const c of items){
  const p=map.project([c.lat,c.lng],zoom);
  const key=Math.round(p.x/cell)+":"+Math.round(p.y/cell);
  const existing=bucket.get(key)||[];existing.push(c);bucket.set(key,existing);
 }
 // A selected theatre is always individually visible at adequate zoom; no false precision.
 if(state.selected && zoom>=4){
  for(const [key,arr] of bucket){
   if(arr.length>1 && arr.some(r=>r.id===state.selected)){
    const solo=arr.find(r=>r.id===state.selected);bucket.set(key,arr.filter(r=>r.id!==state.selected));bucket.set("selected:"+state.selected,[solo]);
    break;
   }
  }
 }
 redrawCluster([...bucket.values()].filter(x=>x.length));
}
function initializeMap(){
 if(!window.L || !L.map){mapFallback();return}
 try{
  map=L.map("map",{zoomControl:true,scrollWheelZoom:true,minZoom:1.5,maxZoom:12,worldCopyJump:false,preferCanvas:true});
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
   attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
   maxZoom:19,detectRetina:false
  }).addTo(map);
  const z=window.innerWidth<650?1.5:window.innerWidth<1120?1.8:2;
  map.setView([18,14],z,{animate:false});
  markerLayer=L.layerGroup().addTo(map);
  map.on("zoomend moveend",renderMarkers);
  renderMarkers();
  setTimeout(()=>map.invalidateSize(),120);
 }catch(e){mapFallback()}
}
function setFilter(kind){
 if(!["all","fighting","violence","risk"].includes(kind))return;
 state.kind=kind;
 document.querySelectorAll("[data-kind]").forEach(b=>{const v=b.dataset.kind===kind;b.classList.toggle("active",v);b.setAttribute("aria-pressed",String(v))});
 refresh();
}
function refresh(){
 renderList();renderMarkers();
}
function updateFilter(){
 state.q=$("search").value.trim().toLowerCase();
 refresh();
}
function downloadRegistry(){
 const out={metadata:{...meta,exportedAt:new Date().toISOString(),precision:"broad theatre anchors",newsIncluded:false,sourceDisclaimer:"Current reports are not automatically used to update conflict status"},sources,records};
 const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="the-way-conflict-atlas-"+meta.reviewed+".json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function dateUTC(s){try{return new Date(s).toLocaleString("en-GB",{timeZone:"UTC",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})+" UTC"}catch(_){return "Date unavailable"}}
function renderNews(data){
 const list=$("news-list"),status=$("news-status");
 if(!data || !Array.isArray(data.items)||!data.items.length){status.textContent="Live feed unavailable · the reviewed atlas remains accessible";list.innerHTML='<div class="loading-note">Latest updates could not be loaded. Try the <a href="https://news.un.org/en/" target="_blank" rel="noopener" style="text-decoration:underline">UN News site ↗</a> or <a href="https://reliefweb.int/updates" target="_blank" rel="noopener" style="text-decoration:underline">ReliefWeb ↗</a>. No reports have been invented.</div>';return}
 status.textContent="Source checked "+dateUTC(data.checkedAt)+" · Dated reporting, not verified events";
 list.innerHTML=data.items.slice(0,12).map(item=>
  '<a class="news-item" href="'+safe(item.url)+'" target="_blank" rel="noopener noreferrer"><time datetime="'+safe(item.date)+'">'+safe(dateUTC(item.date))+'</time><span>'+safe(concise(item.title,160))+'<small>'+safe(item.source)+'</small></span><b>↗</b></a>'
 ).join("");
}
async function fetchNews(){
 $("news-status").textContent="Checking public news sources…";
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9500);
  const r=await fetch("https://htffcvdopavknnylbowl.supabase.co/functions/v1/the-way-news",{cache:"no-store",signal:controller.signal});
  clearTimeout(timer);
  if(!r.ok)throw new Error("Feed status "+r.status);
  const d=await r.json();state.news=d;renderNews(d);
 }catch(_){renderNews(null)}
}
function init(){
 if(!records.length){$("conflict-list").innerHTML='<p style="padding:20px">The source registry is unavailable. Please reload.</p>';mapFallback();return}
 const seen=new Set();for(const c of records){
   if(!c||seen.has(c.id)||!Number.isFinite(c.lat)||!Number.isFinite(c.lng)||Math.abs(c.lat)>90||Math.abs(c.lng)>180)throw Error("Invalid conflict registry");
   seen.add(c.id);
 }
 renderStats();renderList();renderDetails();
 initializeMap();
 $("conflict-list").addEventListener("click",e=>{const b=e.target.closest("button[data-id]");if(b)select(b.dataset.id)});
 $("type-filters").addEventListener("click",e=>{const b=e.target.closest("button[data-kind]");if(b)setFilter(b.dataset.kind)});
 $("search").addEventListener("input",updateFilter);
 $("region").addEventListener("change",()=>{state.region=$("region").value;refresh()});
 $("reset-filters").addEventListener("click",()=>{
   state.q="";state.region="all";$("search").value="";$("region").value="all";setFilter("all");
 });
 $("zoom-world").addEventListener("click",()=>map&&map.setView([18,14],window.innerWidth<650?1.5:2,{animate:true}));
 $("map-info").addEventListener("click",()=>{$("map-note").hidden=false;notify("Pins mark broad conflict regions, never verified incidents")});
 $("map-note-close").addEventListener("click",()=>{$("map-note").hidden=true});
 $("download-json").addEventListener("click",downloadRegistry);
 $("refresh-news").addEventListener("click",fetchNews);
 document.addEventListener("keydown",e=>{
  if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)){e.preventDefault();$("search").focus();}
  if(e.key==="Escape"&&state.selected)clearSelection();
 });
 const direct=new URLSearchParams(location.search).get("conflict");
 if(direct && records.some(x=>x.id===direct)){setTimeout(()=>select(direct,{noFly:false,noScroll:true}),250);}
 fetchNews();
 setInterval(fetchNews,20*60*1000);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();