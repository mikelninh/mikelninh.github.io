/* APPLICATION LAB v9 — pure domain logic for two honest application proofs.
 * Sources: BidScreening, ReturnTriage, SupportML loaded before this file.
 * No I/O, no browser state, no network calls in this module. */
(function(root){
"use strict";
const ISSUE={material:"Materialproblem",delivery:"Lieferung",size:"Größe",return:"Rückgabe",mixed:"Mehrere Themen",unknown:"Unklar"};
const PRODUCT={SOCKS:"Socken",HOODIE:"Kapuzenpullover",TEE:"T-Shirt"};
const SAMPLE=[
 ["SOCKS","Naht nach dem Waschen gerissen"],["SOCKS","Socken haben ein Loch"],["SOCKS","Ferse löst sich auf"],
 ["SOCKS","Loch nach zwei Wäschen"],["SOCKS","Material eingerissen"],["SOCKS","Naht löst sich"],["SOCKS","Stoff beschädigt"],
 ["SOCKS","Sockenlieferung noch nicht angekommen"],["SOCKS","Sockenlieferung noch nicht angekommen"],["SOCKS","Sockenlieferung noch nicht angekommen"],
 ["SOCKS","Socken passen nicht richtig"],["SOCKS","Socken passen nicht richtig"],
 ["HOODIE","Pulloverlieferung unklar"],["HOODIE","Pulloverlieferung unklar"],["HOODIE","Pulloverlieferung unklar"],["HOODIE","Pulloverlieferung unklar"],
 ["HOODIE","Pullover hat ein Materialproblem"],["HOODIE","Pullover hat ein Materialproblem"],
 ["","Bestellung nicht zuordenbar"],["","Bestellung nicht zuordenbar"]
];
function exampleTickets(){return SAMPLE.map(([sku,message],i)=>({id:"DEMO-"+String(i+1).padStart(3,"0"),order:"ORDER-"+String(i+1).padStart(3,"0"),sku,message}))}
function csvRows(text){
 const rows=[];let row=[],cell="",inside=false;
 text=String(text||"").replace(/^\uFEFF/,"");
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(ch==='"'){if(inside&&text[i+1]==='"'){cell+='"';i++}else if(inside)inside=false;else if(cell==="")inside=true;else throw Error("Fehlerhafte CSV-Anführungszeichen");}
  else if(ch===","&&!inside){row.push(cell);cell="";}
  else if((ch==="\n"||ch==="\r")&&!inside){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell="";}
  else cell+=ch;
 }
 if(inside)throw Error("Nicht geschlossene CSV-Anführungszeichen");
 row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
 if(!rows.length||rows.length>301)throw Error("CSV muss zwischen 1 und 300 Datensätzen enthalten");
 const len=rows[0].length;if(rows.some(r=>r.length!==len))throw Error("Spaltenanzahl nicht einheitlich");
 return rows;
}
function parseCsv(raw){
 const rows=csvRows(raw),header=rows.shift().map(s=>s.trim().toLowerCase());
 if(header.length!==new Set(header).size)throw Error("Spaltennamen doppelt");
 for(const col of ["ticket_id","sku","message"])if(!header.includes(col))throw Error("Spalte fehlt: "+col);
 const set=new Set(),tickets=[];
 for(const row of rows){
  const o=Object.fromEntries(header.map((h,i)=>[h,row[i].trim()]));
  if(!o.ticket_id||!o.message)throw Error("Ticket-ID und Nachricht erforderlich");
  if(!["SOCKS","HOODIE","TEE",""].includes(o.sku))throw Error("Produktcode unbekannt: "+o.sku);
  const id=o.ticket_id.slice(0,45);
  if(set.has(id))throw Error("Doppelte Ticket-ID: "+id);set.add(id);
  tickets.push({id,sku:o.sku,order:(o.order_id||"").slice(0,48),message:o.message.slice(0,600)});
 }
 if(!tickets.length)throw Error("Keine Nachrichten gefunden");
 return tickets;
}
function triage(tickets,overrides={},products={}){
 const T=root.ReturnTriage,M=root.SupportML;
 if(!T||!M)throw Error("Klassifikatoren fehlen");
 const rows=tickets.map(x=>{
  const rule=T.classify(x.message),ml=M.classify(x.message);
  const agree=rule.category===ml.category;
  const override=Object.prototype.hasOwnProperty.call(overrides,x.id)?overrides[x.id]:null;
  const human=override!==null&&Object.values(ISSUE).includes(ISSUE[override])&&override!=="mixed";
  const proposal=agree?rule.category:"unknown";
  const category=human?override:proposal;
  const sku=Object.prototype.hasOwnProperty.call(products,x.id)?products[x.id]:x.sku;
  return{...x,sku,rule,ml,agree,proposal,category,override:human?override:null,needsReview:!agree||["mixed","unknown"].includes(category)||ml.needsReview===true,signal:category==="material",reviewed:human};
 });
 const groups=Object.keys(PRODUCT).map(sku=>{
  const items=rows.filter(x=>x.sku===sku),materials=items.filter(x=>x.signal),unreviewed=materials.filter(x=>!x.reviewed);
  return{sku,name:PRODUCT[sku],items,materials,unreviewed,flag:materials.length>=4};
 }).filter(x=>x.items.length).sort((a,b)=>Number(b.flag)-Number(a.flag)||b.materials.length-a.materials.length);
 const ambiguous=rows.filter(x=>x.needsReview),unlinked=rows.filter(x=>!x.sku);
 return{total:rows.length,rows,groups,ambiguous,unlinked,top:groups.find(g=>g.flag)||null,countMaterial:rows.filter(x=>x.signal).length,disagreements:rows.filter(x=>!x.agree).length,reviewed:rows.filter(x=>x.reviewed).length};
}
function tenderDecision(profile,notices,date){
 const v=root.BidScreening.screen(profile,notices,date);
 const recommended=v.shown.find(x=>!x.barriers.length)||v.shown[0]||null;
 const obstacle=v.shown.find(x=>x.barriers.length&&x.id!==recommended?.id)||null;
 return{...v,recommended,obstacle};
}
root.ApplicationV9Core={exampleTickets,triage,parseCsv,tenderDecision,ISSUE,PRODUCT};
})(window);