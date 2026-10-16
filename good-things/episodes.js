/* GOOD THINGS 2.7 · Curated tasting episodes.
 * Five product decisions per small session. Existing S–F shelves persist as before.
 * Episode session histories are local; two-account multiplayer episode sync is not enabled.
 */
(function(){
'use strict';
const KEY='goodthings_episodes_v27',LIMIT=5;
const L=[
 ['burger','🍔','Burger Battle','Wer verdient die Burger-Krone?','burger / patties','mains'],
 ['chicken','🍗','Not Chicken Club','Knusprig, saftig oder leider Pappe?','nuggets / chunks','mains'],
 ['tofu','🥋','Tofu Royal Rumble','Natur, geräuchert, gewürzt. Wer gewinnt?','tofu / tempeh','tofu'],
 ['milks','🥛','Milk Wars','Der beste Begleiter für Kaffee und Müsli.','pflanzendrinks','milks'],
 ['cheese','🧀','Cheese, Please','Schmilzt das? Schmeckt das?','käsealternativen','cheese'],
 ['chocolate','🍫','Chocolate Therapy','Kleine Schokoladen, große Gefühle.','schokolade','chocolate'],
 ['crunch','🍿','Crunch Time','Der ernsteste Snack-Test der Welt.','chips / snacks','snacks'],
 ['spreads','🥖','The Dip Debate','Hummus, Aufstriche und Brotliebe.','aufstriche / dips','spreads'],
 ['breakfast','🥣','Breakfast Club','Frühstück verdient bessere Reviews.','müsli / joghurt','breakfast'],
 ['deli','🥪','Sandwich Showdown','Wer gehört aufs perfekte Brot?','aufschnitt','deli'],
 ['lidl-penny','⚔️','Lidl vs. PENNY','Zwei Eigenmarken. Ein Geschmackstest.','vemondo × food for future','mains'],
 ['sweet','🍪','Sweet Tooth','Süße kleine Alltagshelden.','desserts / süßes','sweet']
].map(([id,emoji,title,tagline,subtitle,category],i)=>({id,emoji,title,tagline,subtitle,category,number:i+1}));
const accented=s=>String(s||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'');
function accepts(id,p){
 if(!p||p.vegan_status==='non_vegan')return false;
 const n=accented(p.name);
 switch(id){
 case 'burger':return /burger|patty/.test(n);
 case 'chicken':return /chicken|nugget|chunks|schnitzel|crispy|hahnchen|hahnchens/.test(n);
 case 'tofu':return p.category_id==='tofu';
 case 'milks':return p.category_id==='milks';
 case 'cheese':return p.category_id==='cheese';
 case 'chocolate':return p.category_id==='chocolate';
 case 'crunch':return p.category_id==='snacks';
 case 'spreads':return p.category_id==='spreads';
 case 'breakfast':return ['yogurts','breakfast'].includes(p.category_id);
 case 'deli':return p.category_id==='deli';
 case 'lidl-penny':return p.category_id==='mains'&&(['vemondo','food-for-future'].includes(p.brand_collection)||p.brand?.toLowerCase()==='vemondo');
 case 'sweet':return ['sweet','chocolate'].includes(p.category_id);
 default:return false;
 }
}
const getDef=id=>L.find(x=>x.id===id)||null;
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(_){return {}}}
let stored=read(),session={solo:stored.solo||null,duo:stored.duo||null},filterView={solo:false,duo:false};
function valid(s){return s&&getDef(s.id)&&Array.isArray(s.answers)?{id:s.id,answers:s.answers.filter(x=>x&&typeof x.productId==='string').slice(0,LIMIT),started:s.started||''}:null}
session.solo=valid(session.solo);session.duo=valid(session.duo);
function persist(){try{localStorage.setItem(KEY,JSON.stringify(session))}catch(_){}}
const get=mode=>session[mode]||null;
const selected=mode=>getDef(get(mode)?.id);
function start(mode,id){
 if(!['solo','duo'].includes(mode)||id&& !getDef(id))return false;
 session[mode]=id?{id,answers:[],started:new Date().toISOString()}:null;
 filterView[mode]=false;persist();return true;
}
function finished(mode){return (get(mode)?.answers?.length||0)>=LIMIT}
function contains(mode,productId){return !!get(mode)?.answers?.some(x=>x.productId===productId)}
function record(mode,productId,answer){
 const s=get(mode);
 if(!s||finished(mode)||contains(mode,productId))return false;
 s.answers.push({productId,result:answer});persist();return true;
}
const count=(mode)=>get(mode)?.answers?.length||0;
function items(products,id){return products.filter(p=>accepts(id,p)&&p.image_url&&['barcode','brand','retailer'].includes(p.image_status))}
function h(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function picker(mode,products){
 const theme=selected(mode),showMore=filterView[mode];
 const main=L.slice(0,6),others=L.slice(6);
 function card(d){
  const size=items(products,d.id).length;
  return '<button class="gt-episode-card'+(theme?.id===d.id?' active':'')+'" data-action="episode-select" data-value="'+d.id+'" data-mode="'+mode+'" '+(size<LIMIT?'disabled':'')+'>'+
  '<span class="gt-episode-emoji">'+d.emoji+'</span><span class="gt-episode-content"><small>EP. '+String(d.number).padStart(2,'0')+' · '+size+' Foto-Kandidaten</small><strong>'+h(d.title)+'</strong><span>'+h(d.tagline)+'</span></span>'+
  '<span class="gt-episode-start">'+(theme?.id===d.id?'✓':'↗')+'</span></button>';
 }
 const active=theme&&get(mode);
 const hint='<div class="gt-episode-head"><div><span class="eyebrow">GOOD THINGS / SMALL BIG OPINIONS</span><h3>Choose your next episode.</h3><p>5 Produkte · ca. 3–5 Minuten bei bekannten Produkten · unendlich viele Meinungen. Neue Notizen bleiben auf deinem Shelf.</p></div>'+
 '<button class="gt-episode-toggle" data-action="episode-toggle" data-mode="'+mode+'">'+(showMore?'Themen verbergen −':'Alle Themen zeigen +')+'</button></div>';
 return '<section class="gt-episode-library" aria-label="Tasting Episodes">'+hint+
 '<div class="gt-episode-grid">'+main.map(card).join('')+(showMore?others.map(card).join(''):'')+'</div>'+
 '<div class="gt-episode-foot"><span>'+((theme&&active)?theme.emoji+' '+h(theme.title)+' · '+count(mode)+' / '+LIMIT+' beantwortet':'Wähle ein Thema oder nutze den Freestyle-Modus')+'</span>'+
 '<button data-action="episode-select" data-value="all" data-mode="'+mode+'" class="gt-episode-free'+(!theme?' active':'')+'">✳ Freestyle · Alles zufällig</button></div></section>';
}
function progress(mode){
 const d=selected(mode),s=get(mode);
 if(!d||!s)return '';
 const n=count(mode),complete=n>=LIMIT;
 return '<div class="gt-episode-progress"><div class="gt-episode-progress-title"><span>'+d.emoji+' Folge '+String(d.number).padStart(2,'0')+' · '+h(d.title)+'</span><strong>'+n+' / '+LIMIT+'</strong></div>'+
 '<div class="gt-episode-dots" aria-label="'+n+' von '+LIMIT+' Produkten beantwortet">'+Array.from({length:LIMIT},(_,i)=>'<span class="'+(i<n?'done':'')+'"></span>').join('')+'</div>'+
 (complete?'<div class="gt-episode-complete"><strong>✳ Episode complete!</strong> '+LIMIT+' Urteile. Zeit für eure Highlights.'+
 '<button class="button button-lime button-small" data-action="episode-share" data-mode="'+mode+'">Ergebnis teilen ↗</button>'+
 '<button class="button button-ghost button-small" data-action="episode-restart" data-mode="'+mode+'">Nochmal spielen ↻</button></div>':'')+
 '</div>';
}
function recap(mode,products){
 const session=get(mode),d=selected(mode);
 if(!session||!d||!finished(mode))return '';
 const byId=new Map(products.map(p=>[p.id,p])),tiers={S:6,A:5,B:4,C:3,D:2,F:1};
 const ranked=session.answers.map(a=>({product:byId.get(a.productId),grade:a.result})).filter(x=>x.product);
 const graded=mode==='solo'?ranked.filter(x=>typeof x.grade==='string'&&tiers[x.grade]):ranked.filter(x=>x.grade&&tiers[x.grade.mikel]&&tiers[x.grade.huong]);
 const best=graded.slice().sort((a,b)=>mode==='solo'?tiers[b.grade]-tiers[a.grade]:tiers[b.grade.mikel]+tiers[b.grade.huong]-tiers[a.grade.mikel]-tiers[a.grade.huong])[0];
 let title=best?best.product.brand+' · '+best.product.name:'Noch kein Geschmacks-Champion';
 const notTried=ranked.filter(x=>mode==='solo'?x.grade==='not_tried':x.grade?.mikel==='not_tried'||x.grade?.huong==='not_tried').length;
 let text=mode==='solo'?'Die beste bewertete Entdeckung dieser Folge':'Euer Favorit nach beiden Tier-Noten';
 if(mode==='duo'){
  const agreed=graded.filter(x=>x.grade.mikel===x.grade.huong).length;
  text+=' · '+agreed+'/'+graded.length+' übereinstimmende Bewertungen';
 }
 return '<section class="gt-episode-recap"><div class="eyebrow">THE MINI FINALE · '+h(d.title)+'</div>'+
 '<div class="gt-episode-recap-row"><div><h3>🏆 '+h(title)+'</h3><p>'+h(text)+'</p><small>'+graded.length+' geschmacklich bewertete Produkte'+(notTried?' · '+notTried+' noch nicht probiert':'')+'. Kleine Stichprobe, persönliche Meinung – kein offizieller Produktpreis.</small></div>'+
 '<button class="button button-lime button-small" data-action="episode-share" data-mode="'+mode+'">Folge teilen ↗</button></div></section>';
}
function summary(mode,products){
 const s=get(mode),d=selected(mode);if(!s||!d)return '';
 const byId=new Map(products.map(p=>[p.id,p]));
 const line=s.answers.map((x,i)=>{
  const p=byId.get(x.productId),res=x.result;
  const text=typeof res==='string'?res==='not_tried'?'Noch nicht probiert':res:
   [res.mikel||'?',res.huong||'?'].join(' / ');
  return (i+1)+'. '+(p?p.brand+' · '+p.name:'Produkt')+' — '+text;
 });
 return 'GOOD THINGS · '+d.emoji+' '+d.title+' — '+s.answers.length+'/'+LIMIT+'\n'+line.join('\n')+'\n\nMach deine eigene kleine Tier-Runde: '+location.origin+location.pathname+'?view='+mode+'&episode='+d.id;
}
function toggle(mode){filterView[mode]=!filterView[mode]}
window.GT_EPISODES={LIMIT,L,accepts,get,selected,start,finished,contains,record,count,items,picker,progress,recap,summary,toggle,getDef};
})();