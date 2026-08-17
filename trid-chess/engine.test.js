const T = require('./engine.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function clearAttackBoardExcept(state, id, keepIndex) {
  const ab = state.abs.find(x => x.id === id);
  T.abSquares(ab).forEach((c, i) => {
    if (i !== keepIndex) {
      const key = T.k(c.x, c.y, c.z);
      delete state.pieces[key];
      delete state.ids[key];
    }
  });
}

let s = T.start();
assert(Object.keys(s.pieces).length === 32, 'starts with 32 pieces');
assert(T.boardSquares(s).length === 64, 'board always has 64 squares');
assert(T.FILES === 'abcdef', 'Tri-D coordinate system is six files wide');

assert(T.legalMove(s, T.parse('d2@2'), T.parse('d4@2')), 'white pawn double is legal');
let r = T.movePiece(s, T.parse('d2@2'), T.parse('d4@2'));
assert(r.ok && s.turn === 'b', 'piece move mutates state and changes turn');

s = T.undo(s);
assert(s.turn === 'w', 'undo restores previous turn');
assert(s.history.length === 0, 'undo restores compact history');

s = T.start();
delete s.pieces['e8@6']; delete s.ids['e8@6'];
s.pieces['e8@6'] = 'wQ';
s.ids['e8@6'] = 'test-wQ';
s.turn = 'w';
assert(!T.legalMove(s, T.parse('e8@6'), T.parse('e9@7')), 'enemy king cannot be captured directly');

s = T.start();
assert(T.legalMove(s, T.parse('e0@3'), T.parse('f0@3')), 'king-side castling is available from the initial position');
r = T.movePiece(s, T.parse('e0@3'), T.parse('f0@3'));
assert(r.ok, 'king-side castling executes');
assert(T.pieceAt(s, T.parse('f0@3')) === 'wK', 'king swaps onto rook square');
assert(T.pieceAt(s, T.parse('e0@3')) === 'wR', 'rook swaps onto king square');

s = T.start();
clearAttackBoardExcept(s, 'WQ', 2);
let wq = s.abs.find(x => x.id === 'WQ');
assert(T.abEligible(s, wq), 'single-pawn attack board is eligible');
let actions = T.abActions(s, wq);
assert(actions.length > 0, 'eligible attack board has legal actions');

for (const targetRank of [3, 5, 6, 8]) {
  s.turn = 'w';
  wq = s.abs.find(x => x.id === 'WQ');
  const action = T.abActions(s, wq).find(a => a.r === targetRank && (targetRank === 8 || !a.inverted));
  assert(action, `attack board can advance to post rank ${targetRank}`);
  r = T.moveAB(s, 'WQ', action);
  assert(r.ok, `attack board move to ${targetRank} executes`);
}
assert(Object.values(s.pieces).includes('wQ'), 'riding pawn promotes at far rank');

s = T.start();
for (const key of Object.keys(s.pieces)) {
  if (!['wK', 'bK'].includes(s.pieces[key])) {
    delete s.pieces[key];
    delete s.ids[key];
  }
}
s.pieces['c5@4'] = 'wP'; s.ids['c5@4'] = 'wp-test';
s.pieces['d7@6'] = 'bP'; s.ids['d7@6'] = 'bp-test';
s.turn = 'b';
assert(T.legalMove(s, T.parse('d7@6'), T.parse('d5@4')), 'black double pawn move across levels is legal');
T.movePiece(s, T.parse('d7@6'), T.parse('d5@4'));
const epTarget = s.last.path[0];
assert(epTarget, 'double pawn move records intermediate highest-path square');
const epFrom = T.parse('c5@4');
if (Math.abs(epTarget.x - epFrom.x) === 1 && epTarget.y - epFrom.y === 1) {
  assert(T.legalMove(s, epFrom, epTarget), 'en passant target is legal immediately');
}

console.log('engine tests passed');
