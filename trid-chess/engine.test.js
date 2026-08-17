const T=require('./engine.js');
function assert(x,m){if(!x)throw new Error(m)}
let s=T.start();
assert(Object.keys(s.pieces).length===32,'32 pieces');
assert(T.boardSquares(s).length===64,'64 squares');
let from=T.parse('d2@2'),to=T.parse('d4@2');
assert(T.legalMove(s,from,to),'white pawn double');
let r=T.movePiece(s,from,to);
assert(r.ok,'move works');
assert(s.turn==='b','turn changes');
let bq=s.abs.find(x=>x.id==='BQ');
for(const c of T.abSquares(bq))delete s.pieces[T.k(c.x,c.y,c.z)];
assert(T.abEligible(s,bq),'black attack board eligible after clearing');
assert(T.abActions(s,bq).length>0,'attack board actions');
console.log('engine tests passed');
