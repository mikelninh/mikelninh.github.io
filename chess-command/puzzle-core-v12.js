(function(global){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const THEMES=['Mixed','Mate','Fork','Pin','Skewer','Hanging piece','Deflection','Removing defender','Defense','Discovered attack'];
const PUZZLES=[
 {id:'v12-mate-rank',title:'Seal the eighth rank',theme:'Mate',rating:450,fen:'7k/6pp/8/8/8/8/6PP/5RK1 w - - 0 1',line:['f1f8'],hint:'The rook wants the eighth rank.',explain:'Rf8# seals every escape square.'},
 {id:'v12-mate-back',title:'The pawn cage',theme:'Mate',rating:700,fen:'6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',line:['e1e8'],hint:'The pawns around the king are also a cage.',explain:'Re8# is the classic back-rank pattern.'},
 {id:'v12-mate-queen',title:'Queen and king cooperate',theme:'Mate',rating:760,fen:'7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',line:['g1g7'],hint:'Put the queen where your king protects it.',explain:'Qg7# works because the king controls the escape squares.'},
 {id:'v12-fork-heavy',title:'Fork the heavy pieces',theme:'Fork',rating:620,fen:'1r1q2k1/8/8/4N3/8/8/8/6K1 w - - 0 1',line:['e5c6'],hint:'Can the knight attack both heavy pieces?',explain:'Nc6 attacks the queen on d8 and rook on b8 at once.'},
 {id:'v12-fork-kingqueen',title:'Check first, queen second',theme:'Fork',rating:780,fen:'q3k3/8/8/3N4/8/8/8/6K1 w - - 0 1',line:['d5c7'],hint:'A knight check can attack something behind it too.',explain:'Nc7+ forks the king on e8 and queen on a8.'},
 {id:'v12-fork-pawn',title:'The humble pawn fork',theme:'Fork',rating:700,fen:'6k1/3q1r2/8/4P3/8/8/8/6K1 w - - 0 1',line:['e5e6'],hint:'Advance with tempo and look at both pawn diagonals.',explain:'e6 attacks the queen on d7 and rook on f7.'},
 {id:'v12-fork-bishop',title:'Bishop double attack',theme:'Fork',rating:820,fen:'4q1k1/5p2/8/8/2B5/8/8/6K1 w - - 0 1',line:['c4f7'],hint:'Can you check the king and attack the queen with the same bishop?',explain:'Bxf7+ checks the king and attacks the queen on e8.'},
 {id:'v12-fork-master',title:'Knight fork from nowhere',theme:'Fork',rating:980,fen:'2q1k3/8/8/5N2/8/8/8/6K1 w - - 0 1',line:['f5d6'],hint:'Look for a checking knight move that also hits c8.',explain:'Nd6+ forks the king and queen.'},
 {id:'v12-loose-queen',title:'Take the free queen',theme:'Hanging piece',rating:400,fen:'6k1/8/8/8/3q4/2B5/8/6K1 w - - 0 1',line:['c3d4'],hint:'Before calculating anything fancy: what is simply undefended?',explain:'Bxd4 wins the queen. Loose pieces drop off.'},
 {id:'v12-loose-rook',title:'Long diagonal, free rook',theme:'Hanging piece',rating:520,fen:'6k1/1r6/8/8/8/8/6B1/6K1 w - - 0 1',line:['g2b7'],hint:'Trace your bishop all the way along the diagonal.',explain:'Bxb7 simply wins the undefended rook.'},
 {id:'v12-loose-rook-file',title:'Open file harvest',theme:'Hanging piece',rating:560,fen:'3r2k1/8/8/8/8/8/8/3Q2K1 w - - 0 1',line:['d1d8'],hint:'The d-file is completely open.',explain:'Qxd8+ wins the loose rook with check.'},
 {id:'v12-pin-queen',title:'Exploit the absolute pin',theme:'Pin',rating:760,fen:'4k3/4q3/8/8/8/8/8/4R1K1 w - - 0 1',line:['e1e7'],hint:'The queen cannot move away from the king behind it.',explain:'Rxe7+ wins the pinned queen.'},
 {id:'v12-pin-knight',title:'Pinned knight falls',theme:'Pin',rating:680,fen:'4k3/8/2n5/1B6/8/8/8/6K1 w - - 0 1',line:['b5c6'],hint:'The knight sits on the line to its king.',explain:'Bxc6+ removes the pinned knight with tempo.'},
 {id:'v12-skewer-bishop',title:'Move the king, take the queen',theme:'Skewer',rating:1020,fen:'8/4q3/3k4/8/8/2B5/8/6K1 w - - 0 1',line:['c3b4','d6e6','b4e7'],hint:'Check along the diagonal that also contains the queen.',explain:'Bb4+ drives the king away; after ...Ke6, Bxe7 wins the queen.'},
 {id:'v12-deflect-rook',title:'Drag the defender away',theme:'Deflection',rating:1120,fen:'5rk1/6pp/8/7Q/8/8/8/4R1K1 w - - 0 1',line:['h5f7','f8f7','e1e8'],hint:'Offer the queen with check to pull the rook off the back rank.',explain:'Qf7+ deflects the rook; after ...Rxf7, Re8+ crashes through.'},
 {id:'v12-remove-knight',title:'Remove the h7 defender',theme:'Removing defender',rating:1080,fen:'6k1/6pp/5n2/6BQ/8/8/8/6K1 w - - 0 1',line:['g5f6','g7f6','h5h7'],hint:'Which black piece helps protect the king and can be exchanged first?',explain:'Bxf6 removes the knight. After ...gxf6, Qxh7+ breaks in.'},
 {id:'v12-defense-capture',title:'Answer the check',theme:'Defense',rating:440,fen:'6k1/8/8/8/8/8/6r1/6K1 w - - 0 1',line:['g1g2'],hint:'You are in check. Can the king safely take the checking piece?',explain:'Kxg2 removes the checking rook.'},
 {id:'v12-defense-block',title:'Interpose the rook',theme:'Defense',rating:680,fen:'6r1/8/8/8/8/8/4R3/6K1 w - - 0 1',line:['e2g2'],hint:'You cannot capture the rook, but you can block the g-file.',explain:'Rg2 blocks the check and keeps the king safe.'},
 {id:'v12-discovered',title:'Move with check, uncover the rook',theme:'Discovered attack',rating:980,fen:'3q2k1/7p/8/8/8/3B4/8/3R2K1 w - - 0 1',line:['d3h7'],hint:'Move the bishop with tempo and look at what the rook sees afterward.',explain:'Bh7+ discovers the rook attack on the queen on d8.'},
 {id:'v12-double-queen',title:'Check and hit the rook',theme:'Fork',rating:860,fen:'r3k3/8/8/8/8/8/8/3Q2K1 w - - 0 1',line:['d1a4'],hint:'A queen check from a4 also attacks something on the a-file.',explain:'Qa4+ checks the king and attacks the rook on a8.'}
];
const RANKS=[
 {min:1,title:'Pawn Scout'},{min:3,title:'Knight Cadet'},{min:5,title:'Bishop Analyst'},{min:8,title:'Rook Captain'},{min:12,title:'Queen Tactician'},{min:16,title:'Chess Commander'},{min:22,title:'Tactical Master'}
];
function levelForXp(xp=0){return Math.max(1,Math.floor(Math.sqrt(Math.max(0,xp)/45))+1)}
function xpForLevel(level){level=Math.max(1,level);return 45*Math.pow(level-1,2)}
function rankForLevel(level){let out=RANKS[0];for(const r of RANKS)if(level>=r.min)out=r;return out.title}
function xpGain({correct=true,firstTry=true,streak=0,dailyComplete=false}={}){if(!correct)return 0;return 10+(firstTry?5:0)+Math.min(10,Math.max(0,streak-1)*2)+(dailyComplete?15:0)}
function expectedScore(player,puzzle){return 1/(1+Math.pow(10,(puzzle-player)/400))}
function ratingDelta(player,puzzle,correct,firstTry=true){const score=correct?(firstTry?1:.65):0;return Math.round(22*(score-expectedScore(player,puzzle)))}
function mastery(stat={}){const attempts=stat.attempts||0,correct=stat.correct||0,first=stat.firstTry||0;if(!attempts)return 0;const acc=correct/attempts,clean=first/attempts,volume=Math.min(1,attempts/12);return clamp(Math.round((acc*.65+clean*.25+volume*.10)*100),0,100)}
function choose(pool=PUZZLES,opt={}){
 const theme=opt.theme||'Mixed',rating=Number(opt.rating)||600,seen=new Set(opt.seen||[]),stats=opt.themeStats||{};
 let p=pool.filter(x=>theme==='Mixed'||x.theme===theme);if(!p.length)p=[...pool];
 if(theme==='Mixed'){
  const weak=THEMES.filter(x=>x!=='Mixed').map(t=>[t,mastery(stats[t])]).sort((a,b)=>a[1]-b[1])[0]?.[0];
  const weighted=p.filter(x=>x.theme===weak);if(weighted.length&&Math.random()<.45)p=weighted;
 }
 p.sort((a,b)=>{const sa=(seen.has(a.id)?180:0)+Math.abs(a.rating-rating),sb=(seen.has(b.id)?180:0)+Math.abs(b.rating-rating);return sa-sb});
 const top=p.slice(0,Math.min(5,p.length));return top[Math.floor(Math.random()*top.length)]||p[0]||null;
}
const API={clamp,THEMES,PUZZLES,RANKS,levelForXp,xpForLevel,rankForLevel,xpGain,expectedScore,ratingDelta,mastery,choose};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else global.PuzzleCoreV12=API;
})(typeof window!=='undefined'?window:globalThis);
