export const parseCsv=function parseCsv(input){
  if(typeof input!=="string"||!input.trim())throw Error("CSV ist leer.");
  if(input.length>1048576)throw Error("CSV ist zu gross (maximal 1 MB).");
  const s=input.replace(/^\uFEFF/,"");
  let q=false,commas=0,semis=0;
  for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(q&&s[i+1]==='"')i++;else q=!q;}else if(!q){if(c==='\n')break;if(c===',')commas++;if(c===';')semis++;}}
  const sep=semis>commas?';':',', rows=[];let row=[],cell="",quoted=false;
  for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&c===sep){row.push(cell);cell="";}else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&s[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell="";}else cell+=c;}
  if(quoted)throw Error("Nicht geschlossene Anführungszeichen im CSV.");
  row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
  if(rows.length<2)throw Error("CSV braucht eine Kopfzeile und mindestens einen Fall.");
  if(rows.length>501)throw Error("Maximal 500 Fälle pro Batch.");
  const heads=rows.shift().map(x=>x.trim().toLowerCase());
  const idCol=heads.findIndex(x=>["id","ticket_id","case_id"].includes(x)), textCol=heads.findIndex(x=>["message","text","nachricht"].includes(x)), productCol=heads.indexOf("product");
  if(idCol<0||textCol<0)throw Error("Spalten id und message fehlen.");
  const seen=new Set();
  return rows.map((r,i)=>{const id=(r[idCol]||"").trim(),message=(r[textCol]||"").trim(),product=(r[productCol]||"").trim();if(!id||id.length>80||message.length<5||message.length>5000||product.length>150)throw Error("Ungültiger Fall in Zeile "+(i+2)+".");if(seen.has(id))throw Error("Doppelte ID: "+id);seen.add(id);return{id,message,product};});
};
export const classify=function classify(message){
  const rules=[
    ["quality",/löcher|loch|naht|gerissen|defekt|kaputt|beschädigt|qualität|materialfehler|hole|broken|defect|damaged|torn/i],
    ["fit",/zu klein|zu groß|zu gross|passt nicht|passform|größe|grösse|size|too small|too big|doesn.t fit/i],
    ["shipping",/paket|tracking|versand|lieferung|zugestellt|sendung|shipment|delivery|parcel|shipping/i],
    ["return",/retoure|rücksend|rückgabe|rückerstatt|umtausch|widerruf|return|refund|exchange/i],
    ["order_issue",/falsche (ware|farbe|artikel)|fehlt|fehlend|falsch geliefert|wrong item|missing item|wrong order/i]
  ];
  const evidence=[];for(const [category,pattern] of rules){const m=pattern.exec(String(message));if(m)evidence.push({category,quote:m[0]});}
  return{categories:evidence.map(x=>x.category).length?evidence.map(x=>x.category):["other"],evidence,method:"keyword_rules",requiresHumanReview:true,externalActionsAllowed:false};
};
export const summarize=function summarize(items,reviews){
  let accepted=0,corrected=0,escalated=0;const counts={quality:0,fit:0,shipping:0,return:0,order_issue:0,other:0};
  for(const item of items){const r=reviews[item.id];if(!r)continue;if(r.decision==="accepted")accepted++;else if(r.decision==="corrected")corrected++;else if(r.decision==="escalated")escalated++;if(r.decision!=="escalated")for(const c of r.labels||[])if(Object.hasOwn(counts,c))counts[c]++;}
  return{total:items.length,reviewed:accepted+corrected+escalated,pending:items.length-accepted-corrected-escalated,accepted,corrected,escalated,approvedToSend:0,counts};
};
