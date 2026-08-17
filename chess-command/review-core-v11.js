(function(global){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const LABELS={
  'missed-mate':'Missed mate','missed-check':'Missed forcing check','missed-tactic':'Missed tactic','bad-capture':'Bad capture',
  'early-queen':'Early queen move','development':'Development','king-safety':'King safety','endgame-technique':'Endgame technique',
  'calculation':'Calculation','positional':'Positional precision','clean':'Clean move'
};
function phase(input={}){
  if(Number(input.moveNo)<=10)return'opening';
  const material=Number(input.materialPieces);
  if(Number.isFinite(material)&&material<=10)return'endgame';
  if(Number(input.moveNo)>=28)return'endgame';
  return'middlegame';
}
function classifyLoss(loss,bestMatched=false){
  loss=Math.max(0,Number(loss)||0);
  if(bestMatched)return'Best';
  if(loss<=18)return'Excellent';
  if(loss<=55)return'Good';
  if(loss<=110)return'Inaccuracy';
  if(loss<=230)return'Mistake';
  return'Blunder';
}
function theme(input={}){
  const loss=Number(input.loss)||0,p=phase(input),piece=String(input.piece||'').toUpperCase();
  if(input.bestMate&&!input.actualMate)return'missed-mate';
  if(input.bestCheck&&!input.actualCheck&&loss>70)return'missed-check';
  if(input.bestCapture&&!input.actualCapture&&loss>90)return'missed-tactic';
  if(input.actualCapture&&loss>120)return'bad-capture';
  if(piece==='Q'&&Number(input.moveNo)<=6&&loss>55)return'early-queen';
  if(input.kingExposed&&loss>70)return'king-safety';
  if(p==='opening'&&loss>65)return'development';
  if(p==='endgame'&&loss>55)return'endgame-technique';
  if(loss>150)return'calculation';
  if(loss>55)return'positional';
  return'clean';
}
function explanation(input={}){
  const t=input.theme||theme(input),best=input.bestSan||input.bestMove||'the engine move',actual=input.actualSan||'your move';
  const lead={
    'missed-mate':`There was a forcing mate. ${best} should be the first move you calculate.`,
    'missed-check':`A forcing check changed the position immediately. Start your scan with checks before quieter moves.`,
    'missed-tactic':`A tactical capture was available. Before committing, scan checks, captures and threats in that order.`,
    'bad-capture':`${actual} wins something visually, but the reply gives too much back. Calculate the recapture sequence before taking.`,
    'early-queen':`The queen moved before development was finished. Prefer a minor-piece move when it improves activity with tempo.`,
    'development':`The opening priority was development and king safety, not creating a new plan yet.`,
    'king-safety':`This move loosened your king. When the centre can open, king safety outranks a small positional gain.`,
    'endgame-technique':`This is an endgame-technique moment. Reduce the position to a concrete plan: activate the king, create a passer, or improve the rook.`,
    'calculation':`The position demanded one move more calculation. Compare ${actual} with ${best} and identify the opponent reply you missed.`,
    'positional':`${actual} is playable, but ${best} keeps more of the position's value. Ask which piece is worst placed and improve it.`,
    'clean':`The move keeps the position healthy. Remember the underlying idea rather than memorising the square.`
  }[t];
  return lead||`Compare ${actual} with ${best}.`;
}
function accuracy(losses=[]){
  if(!losses.length)return 100;
  const avg=losses.reduce((a,b)=>a+Math.max(0,Number(b)||0),0)/losses.length;
  return clamp(Math.round(100*Math.exp(-avg/230)),1,100);
}
function priority(rows=[]){
  return rows.filter(r=>r&&r.side==='w').sort((a,b)=>(b.loss||0)-(a.loss||0))[0]||null;
}
function themeCounts(rows=[]){
  const counts={};for(const r of rows.filter(x=>x&&x.side==='w')){const t=r.theme||'clean';counts[t]=(counts[t]||0)+1}
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]);
}
function label(t){return LABELS[t]||String(t||'').replace(/-/g,' ')}
function evalSeries(rows=[]){
  const out=[];for(const r of rows){const cp=clamp(Number(r.evalAfter)||0,-1200,1200);out.push({ply:r.ply,cp,classification:r.classification,side:r.side})}return out;
}
const API={clamp,phase,classifyLoss,theme,explanation,accuracy,priority,themeCounts,label,evalSeries};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else global.ReviewCoreV11=API;
})(typeof window!=='undefined'?window:globalThis);
