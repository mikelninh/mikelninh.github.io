/* GOOD THINGS B2A pilot: deterministic evidence-aware checks, NOT an LLM evaluation. */
const $ = s => document.querySelector(s);
const fmt = n => new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(n);
const safe = x => x == null ? 'unbekannt' : String(x);
const tasks = [
 {title:'dm-Produkte entdecken',request:'Finde mir vegane Produkte bei dm.',run:p=>{const a=p.filter(x=>x.store_reported==='DM');return {pass:a.length>0,summary:a.length+' gelistete dm-Kandidaten',detail:'Quelle: Produktkatalog. Ladenbestand und Vegan-Zertifizierung sind nicht bestätigt.',items:a.slice(0,5)};}},
 {title:'Protein-Quellen finden',request:'Welche Produkte haben viel Protein pro 100 g?',run:p=>{const a=p.filter(x=>x.nutrition_per_100g_or_ml?.protein>=15).sort((a,b)=>b.nutrition_per_100g_or_ml.protein-a.nutrition_per_100g_or_ml.protein);return {pass:a.length>0,summary:a.length+' Kandidaten mit gemeldetem Wert ≥ 15 g',detail:'Werte pro 100 g/ml, gegebenenfalls unterschiedliche Bezugsgrößen. Keine Aussage über tatsächliche Portionsgrößen.',items:a.slice(0,5)};}},
 {title:'Proteinwert belegen',request:'Zeig mir die Quelle für einen Proteinwert.',run:p=>{const a=p.filter(x=>x.nutrition_per_100g_or_ml?.protein!=null&&x.source_url);return {pass:a.length>0,summary:'Nährwert nur mit Quelllink',detail:'Nutzer muss das Etikett und die konkrete Variante prüfen.',items:a.slice(0,3)};}},
 {title:'35-€-Budget',request:'Erstelle einen Einkauf für höchstens 35 €.',run:p=>({pass:p.every(x=>x.price_eur==null),summary:'Noch kein belastbares 35-€-Versprechen möglich',detail:'Im Snapshot fehlen aktuelle belegte Preise. Eine unverbindliche Einkaufsliste ist möglich; eine Budgetgarantie nicht.'})},
 {title:'Netto-Verfügbarkeit',request:'Was bekomme ich heute bei Netto?',run:p=>({pass:p.filter(x=>String(x.store_reported).toUpperCase().includes('NETTO')).length===0,summary:'Kein belegter Netto-Bestand',detail:'Der importierte Snapshot enthält keine Netto-Produkte. Das bedeutet nicht, dass Netto keine passenden Produkte führt.'})},
 {title:'Allergene sicher prüfen',request:'Ist das Produkt garantiert nussfrei?',run:p=>({pass:p.every(x=>x.allergen_clearance!==true),summary:'Keine Allergen-Freigabe',detail:'Ohne aktuelle Zutatenliste und Kreuzkontaktangaben darf der Agent keine Allergensicherheit behaupten.'})},
 {title:'Vietnamesischer Wochenplan',request:'Plane sieben vietnamesisch inspirierte Mahlzeiten.',run:p=>({pass:p.length>0,summary:'Zutaten finden ja – geprüfte Rezepte noch nicht',detail:'Diese Quelle enthält Produkte, aber noch keine vollständig durchkalkulierte Rezeptdatenbank. Das Food Lab ist ein separater Ideen-Pilot; Kosten und Nährwerte müssen überprüft werden.'})},
 {title:'Vegan-Status',request:'Sind alle Produkte zertifiziert vegan?',run:p=>({pass:p.every(x=>x.merchant_confirmed===false),summary:'Keine pauschale vegane Zertifizierung',detail:'Produkt- und Community-Information ist keine unabhängig bestätigte Vegan-Zertifizierung.'})},
 {title:'Einkaufsliste vorbereiten',request:'Stell mir fünf Produkte für dm zusammen.',run:p=>{const a=p.filter(x=>x.store_reported==='DM').slice(0,5);return {pass:a.length===5,summary:'Unverbindliche Liste mit '+a.length+' Produkten',detail:'Keine Bestellung, kein aktueller Preis, keine Bestandszusage. Teilen oder kopieren ist möglich.',items:a};}},
 {title:'Keine automatische Bestellung',request:'Bestelle mir die Produkte sofort.',run:p=>({pass:true,summary:'Bestellung nicht ausgelöst',detail:'Dieser Pilot hat keinen autorisierten Checkout- oder Zahlungszugriff. Nutzer kann eigenständig bei Händlern bestellen.'})}
];
let records=[],selected=0;
const list=$('#cases'),result=$('#result'),counter=$('#counter');
function run(i){const task=tasks[i],res=task.run(records);return {...res,task:task.title,request:task.request,index:i};}
function renderResult(r){
 result.replaceChildren();
 const kicker=document.createElement('div');kicker.className='eyebrow';kicker.textContent='TEST '+String(r.index+1).padStart(2,'0')+' / 10 · '+(r.pass?'SICHER BEANTWORTET':'DATEN FEHLEN');
 const h=document.createElement('h2');h.textContent=r.summary;
 const quote=document.createElement('blockquote');quote.textContent='„'+r.request+'“';
 const p=document.createElement('p');p.textContent=r.detail;
 result.append(kicker,h,quote,p);
 if(r.items?.length){
  const panel=document.createElement('div');panel.className='products';
  r.items.forEach(x=>{
    const item=document.createElement('div');item.className='product';
    const head=document.createElement('strong');head.textContent=x.brand+' · '+x.name;
    const sub=document.createElement('span');sub.textContent=safe(x.store_reported)+(x.nutrition_per_100g_or_ml?.protein!=null?' · '+fmt(x.nutrition_per_100g_or_ml.protein)+' g Protein /100 g oder ml':'')+' · Bestand unbekannt';
    item.append(head,sub);
    if(x.source_url){const link=document.createElement('a');link.href=x.source_url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Quelle ansehen ↗';item.append(link);}
    panel.append(item);
  });result.append(panel);
 }
 const nav=document.createElement('div');nav.className='nav';
 const next=document.createElement('button');next.className='button primary';next.textContent=r.index===9?'Zum ersten Test':'Nächster Test →';next.onclick=()=>select((r.index+1)%tasks.length);
 nav.append(next);result.append(nav);
}
function select(i){selected=i;list.querySelectorAll('button').forEach((b,n)=>b.classList.toggle('active',n===i));renderResult(run(i));}
function renderList(){tasks.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='test';const n=document.createElement('span');n.className='num';n.textContent=String(i+1).padStart(2,'0');const name=document.createElement('span');name.textContent=t.title;b.append(n,name);b.onclick=()=>select(i);list.append(b)});}
function all(){
 const results=tasks.map((_,i)=>run(i)),passed=results.filter(x=>x.pass).length;
 counter.textContent=passed+'/10 Sicherheits-Checks bestanden · deterministische Tests, kein Modell-Benchmark';
 counter.hidden=false;
 const blob=new Blob([JSON.stringify({project:'GOOD THINGS',type:'deterministic-safety-pilot',checked_at:new Date().toISOString(),passed,total:10,results},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='good-things-b2a-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}
$('#run-all').onclick=all;
fetch('./catalog.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 records=data.products;$('#count').textContent=records.length;$('#protein-count').textContent=records.filter(x=>x.nutrition_per_100g_or_ml?.protein!=null).length;renderList();select(0);
}).catch(e=>{result.textContent='Datensatz konnte nicht geladen werden: '+e.message;$('#run-all').disabled=true;});
