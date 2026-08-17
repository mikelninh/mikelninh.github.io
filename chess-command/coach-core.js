(function(global){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const normLoss=a=>{const x=avg(a);return x==null?null:clamp(Math.round(100-x/3.2),5,100)};
function rowsFromGames(games=[]){return games.flatMap(g=>g?.review?.moves||[]).filter(r=>r&&r.side==='w')}
function keyword(s,re){return re.test(String(s||'').toLowerCase())}
function skillScores(input={}){
 const rows=rowsFromGames(input.games),opening=[],calc=[],tactics=[],development=[],king=[],endgame=[];
 for(const r of rows){
  const loss=Number(r.loss)||0;calc.push(loss);
  if((r.moveNo||0)<=10)opening.push(loss);
  if((r.moveNo||0)>=24)endgame.push(loss);
  if(keyword(r.explain,/capture|forcing|tactic|threat|check|fork|pin|hanging/))tactics.push(loss);
  if(keyword(r.explain,/develop|queen moved early|minor piece|activity|piece/)&&(r.moveNo||0)<=15)development.push(loss);
  if(keyword(r.explain,/king|castle|back rank|mate/))king.push(loss);
 }
 const puzzle=input.puzzleStats||{};
 const openingStats=input.openingStats||{};
 const lesson=input.lessonProgress||{};
 const blend=(base,extra,weight=.35)=>base==null?(extra==null?50:extra):extra==null?base:Math.round(base*(1-weight)+extra*weight);
 const pct=(ok,total)=>total?Math.round(ok/total*100):null;
 const tacticalPuzzles=Object.entries(puzzle).filter(([k])=>/fork|pin|mate|tactic|hanging|skewer|threat|check/i.test(k)).reduce((a,[,v])=>({ok:a.ok+(v.correct||0),n:a.n+(v.attempts||0)}),{ok:0,n:0});
 const endPuzzles=Object.entries(puzzle).filter(([k])=>/endgame|promotion|rook|queen mate/i.test(k)).reduce((a,[,v])=>({ok:a.ok+(v.correct||0),n:a.n+(v.attempts||0)}),{ok:0,n:0});
 const openingPct=pct(openingStats.correct||0,openingStats.attempts||0);
 const tacticPct=pct(tacticalPuzzles.ok,tacticalPuzzles.n);
 const endPct=pct(endPuzzles.ok,endPuzzles.n);
 const lessonDone=Object.values(lesson).filter(Boolean).length;
 const scores={
  opening:blend(normLoss(opening),openingPct),
  tactics:blend(normLoss(tactics),tacticPct,.45),
  calculation:normLoss(calc)??50,
  development:normLoss(development)??(normLoss(opening)??50),
  kingSafety:normLoss(king)??55,
  endgame:blend(normLoss(endgame),endPct??(lessonDone?clamp(45+lessonDone*8,45,90):null),.45)
 };
 const confidence={
  opening:opening.length+(openingStats.attempts||0),tactics:tactics.length+tacticalPuzzles.n,calculation:calc.length,
  development:development.length,kingSafety:king.length,endgame:endgame.length+endPuzzles.n+lessonDone
 };
 return{scores,confidence,rows:rows.length};
}
function weakest(scores){return Object.entries(scores).sort((a,b)=>a[1]-b[1])[0]||['calculation',50]}
function prettySkill(k){return({opening:'Opening memory',tactics:'Tactics',calculation:'Calculation',development:'Development',kingSafety:'King safety',endgame:'Endgame'})[k]||k}
function recommendation(input={}){
 const rating=Number(input.rating)||600,goal=Number(input.goal)||1000,scores=input.scores||{},due=Number(input.due)||0,personal=Number(input.personalPuzzles)||0;
 const [weak,score]=weakest(scores);
 if(due>0)return{kind:'opening',title:`Review ${due} due opening position${due===1?'':'s'}`,why:'Spaced repetition is time-sensitive. Clear due positions before adding new lines.',cta:'Review openings',skill:'opening'};
 if(personal>0&&(weak==='calculation'||weak==='tactics'))return{kind:'personal',title:'Repair a mistake from your own game',why:'A position you actually misplayed has unusually high training value.',cta:'Practise mistake',skill:weak};
 if(weak==='endgame')return{kind:'endgame',title:'Do one endgame foundation',why:`Endgame is currently your weakest measured area (${score}/100).`,cta:'Train endgame',skill:weak};
 if(weak==='tactics'||weak==='calculation')return{kind:'puzzle',title:'Solve a focused tactical set',why:`${prettySkill(weak)} is currently your weakest measured area (${score}/100).`,cta:'Start puzzles',skill:weak};
 if(weak==='opening'||weak==='development')return{kind:'learn',title:'Rehearse one opening line',why:`${prettySkill(weak)} is the clearest current gap (${score}/100).`,cta:'Open academy',skill:weak};
 const target=Math.min(goal,Math.max(400,Math.round((rating+100)/100)*100));
 return{kind:'play',title:`Play one focused game around ${target} Elo`,why:'Your review queue is healthy. Create new evidence at a slightly uncomfortable level.',cta:'Play now',skill:weak,target};
}
function opponentSummary(games=[]){
 const counts={};for(const g of games){const k=g.opening||'Unclassified';counts[k]=(counts[k]||0)+1}
 const ranked=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
 return{games:games.length,topOpening:ranked[0]?.[0]||null,topCount:ranked[0]?.[1]||0,openings:ranked};
}
function streak(days={},today=new Date()){
 let n=0,d=new Date(today);for(;;){const k=d.toISOString().slice(0,10),x=days[k];if(!x||!((x.games||0)+(x.puzzles||0)+(x.openings||0)+(x.study||0)))break;n++;d.setUTCDate(d.getUTCDate()-1)}return n;
}
const API={clamp,skillScores,weakest,prettySkill,recommendation,opponentSummary,streak};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else global.ChessCoachCore=API;
})(typeof window!=='undefined'?window:globalThis);
