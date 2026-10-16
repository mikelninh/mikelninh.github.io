export const analyze = function analyze(documents){
 const rules=[
 ["ask","Funding ask",/\b(raising|funding ask|seeking|finanzierungsbedarf)\b/i,"money","What milestones will the funding unlock?"],
 ["arr","Recurring revenue",/\b(ARR|annual recurring revenue)\b/i,"money","How is recurring revenue calculated?"],
 ["customers","Paying customers",/\b(paying customers|zahlende kunden)\b/i,"count","How many active paying customers and what is their retention?"],
 ["problem","Problem",/\b(problem|pain point|kundenproblem)\b/i,"text","Who experiences the problem and how often?"],
 ["technology","Technology",/\b(technology|technical approach|technologie)\b/i,"text","What is distinctive and hard to replicate?"],
 ["market","Market",/\b(market size|TAM|marktgröße)\b/i,"text","What primary data supports the market assumptions?"],
 ["ip","IP",/\b(patent|IP strategy|intellectual property)\b/i,"text","Who owns the underlying IP?"],
 ["team","Team",/\b(founders|founding team|gründerteam)\b/i,"text","What complementary skills does the team still need?"]
 ];
 const money=line=>{
   let m=line.match(/(?:€|\$|EUR|USD)\s*([\d.,]+)\s*(million|mio\.?|m\b|k\b|thousand)?/i);
   if(!m)return null;
   let n=m[1],v;
   if(n.includes(".")&&n.includes(","))v=Number(n.replace(/,/g,""));
   else if(/^\d{1,3}(?:[.,]\d{3})+$/.test(n))v=Number(n.replace(/[.,]/g,""));
   else v=Number(n.replace(",","."));
   if(!Number.isFinite(v))return null;
   const scale=(m[2]||"").toLowerCase();
   if(/^(million|mio|m$)/.test(scale))v*=1000000;
   if(/^(thousand|k$)/.test(scale))v*=1000;
   return (line.includes("$")||/\bUSD\b/i.test(line)?"USD":"EUR")+":"+Math.round(v);
 };
 const count=line=>{
   let m=line.match(/(\d{1,7})\s+(?:paying customers|zahlende kunden)/i)||line.match(/(?:paying customers|zahlende kunden)\s*:?\s*(\d{1,7})/i);
   return m?Number(m[1]):null;
 };
 const hits=[];
 for(const doc of documents||[])for(const page of doc.pages||[])for(const line of String(page.text||"").split(/\n+/)){
   const str=line.trim();if(!str)continue;
   for(const [key,label,matcher,type] of rules){
     if(!matcher.test(str))continue;
     const value=type==="money"?money(str):type==="count"?count(str):null;
     if(type!=="text"&&value===null)continue;
     const projected=type==="money"&&/\b(forecast|forecasted|projected|projection|target|expected in|expected by|future revenue|not current revenue|prognose|geplant)\b/i.test(str);
     hits.push({key,label,value,projected,source:doc.name,page:page.number,excerpt:str.slice(0,420)});
   }
 }
 const fields=rules.map(([key,label,,,question])=>{
   const evidence=hits.filter(x=>x.key===key);
   const actual=[...new Set(evidence.filter(x=>x.value!==null&&!x.projected).map(x=>String(x.value)))];
   const forecast=[...new Set(evidence.filter(x=>x.value!==null&&x.projected).map(x=>String(x.value)))];
   const status=!evidence.length?"missing":actual.length>1?"different":forecast.length&&actual.length===0?"forecast":forecast.length&&actual.length?"mixed":"found";
   return {key,label,question,evidence,status};
 });
 const differences=fields.filter(x=>x.status==="different");
 const missing=fields.filter(x=>x.status==="missing");
 const forecasts=fields.filter(x=>x.status==="forecast"||x.status==="mixed");
 const questions=[...differences.map(x=>"Different "+x.label.toLowerCase()+" figures appear. Which is current, and how do reporting dates differ?"),...forecasts.map(x=>"The "+x.label.toLowerCase()+" figure is a forecast or target, not verified current performance. What is the current actual figure and the evidence behind it?"),...missing.map(x=>x.question),...fields.filter(x=>x.status==="found").map(x=>x.question)].slice(0,5);
 return {fields,differences,missing,forecasts,questions,evidenceCount:hits.length,sourceCount:(documents||[]).length};
};
