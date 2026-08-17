(function (global) {
  'use strict';

  const FILES = 'abcdef';

  const MAIN = [
    { id: 'L', z: 2, x0: 1, y0: 1, w: 4, h: 4, label: 'WHITE MAIN' },
    { id: 'N', z: 4, x0: 1, y0: 3, w: 4, h: 4, label: 'NEUTRAL MAIN' },
    { id: 'H', z: 6, x0: 1, y0: 5, w: 4, h: 4, label: 'BLACK MAIN' }
  ];

  const POSTS = [
    { r: 1, z: 2 }, { r: 3, z: 4 }, { r: 4, z: 2 },
    { r: 5, z: 6 }, { r: 6, z: 4 }, { r: 8, z: 6 }
  ];

  const PIECE_SYMBOL = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
  };

  const k = (x, y, z) => `${FILES[x]}${y}@${z}`;
  const parse = (key) => ({
    x: FILES.indexOf(key[0]),
    y: parseInt(key.slice(1, key.indexOf('@')), 10),
    z: parseInt(key.slice(key.indexOf('@') + 1), 10)
  });
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const other = (color) => color === 'w' ? 'b' : 'w';

  function lowerEdge(rank) {
    return [1, 3, 5].includes(rank);
  }

  function abSquares(ab) {
    const xs = ab.kind === 'Q' ? [0, 1] : [4, 5];
    const ys = lowerEdge(ab.anchor.r)
      ? [ab.anchor.r - 1, ab.anchor.r]
      : [ab.anchor.r, ab.anchor.r + 1];
    const z = ab.anchor.z + (ab.inverted ? -1 : 1);

    return [
      { x: xs[0], y: ys[0], z },
      { x: xs[1], y: ys[0], z },
      { x: xs[0], y: ys[1], z },
      { x: xs[1], y: ys[1], z }
    ];
  }

  function boardSquares(state) {
    const out = [];
    for (const b of MAIN) {
      for (let y = b.y0; y < b.y0 + b.h; y++) {
        for (let x = b.x0; x < b.x0 + b.w; x++) {
          out.push({ x, y, z: b.z, board: b.id, type: 'main' });
        }
      }
    }

    for (const ab of state.abs) {
      abSquares(ab).forEach((s, local) => {
        out.push({ ...s, board: ab.id, type: 'attack', local });
      });
    }
    return out;
  }

  function start() {
    const state = {
      turn: 'w',
      pieces: {},
      ids: {},
      movedIds: {},
      abs: [
        { id: 'WQ', kind: 'Q', owner: 'w', anchor: { r: 1, z: 2 }, inverted: false },
        { id: 'WK', kind: 'K', owner: 'w', anchor: { r: 1, z: 2 }, inverted: false },
        { id: 'BQ', kind: 'Q', owner: 'b', anchor: { r: 8, z: 6 }, inverted: false },
        { id: 'BK', kind: 'K', owner: 'b', anchor: { r: 8, z: 6 }, inverted: false }
      ],
      last: null,
      rookPawnOption: true,
      winner: null,
      draw: null,
      history: []
    };

    function put(file, rank, z, code, id) {
      const key = `${file}${rank}@${z}`;
      state.pieces[key] = code;
      state.ids[key] = id;
    }

    put('b', 1, 2, 'wN', 'wN-b');
    put('c', 1, 2, 'wB', 'wB-c');
    put('d', 1, 2, 'wB', 'wB-d');
    put('e', 1, 2, 'wN', 'wN-e');
    ['b', 'c', 'd', 'e'].forEach(f => put(f, 2, 2, 'wP', `wP-${f}2`));

    put('a', 0, 3, 'wR', 'wR-a');
    put('b', 0, 3, 'wQ', 'wQ');
    put('a', 1, 3, 'wP', 'wP-a1');
    put('b', 1, 3, 'wP', 'wP-b1');

    put('e', 0, 3, 'wK', 'wK');
    put('f', 0, 3, 'wR', 'wR-f');
    put('e', 1, 3, 'wP', 'wP-e1');
    put('f', 1, 3, 'wP', 'wP-f1');

    put('b', 8, 6, 'bN', 'bN-b');
    put('c', 8, 6, 'bB', 'bB-c');
    put('d', 8, 6, 'bB', 'bB-d');
    put('e', 8, 6, 'bN', 'bN-e');
    ['b', 'c', 'd', 'e'].forEach(f => put(f, 7, 6, 'bP', `bP-${f}7`));

    put('a', 9, 7, 'bR', 'bR-a');
    put('b', 9, 7, 'bQ', 'bQ');
    put('a', 8, 7, 'bP', 'bP-a8');
    put('b', 8, 7, 'bP', 'bP-b8');

    put('e', 9, 7, 'bK', 'bK');
    put('f', 9, 7, 'bR', 'bR-f');
    put('e', 8, 7, 'bP', 'bP-e8');
    put('f', 8, 7, 'bP', 'bP-f8');

    return state;
  }

  function squareExists(state, c) {
    return boardSquares(state).some(s => s.x === c.x && s.y === c.y && s.z === c.z);
  }

  function pieceAt(state, c) {
    return state.pieces[k(c.x, c.y, c.z)] || null;
  }

  function idAt(state, c) {
    return state.ids[k(c.x, c.y, c.z)] || null;
  }

  function hasMoved(state, c) {
    const id = idAt(state, c);
    return id ? !!state.movedIds[id] : false;
  }

  function squaresAt(state, x, y, maxZ = 99) {
    return boardSquares(state)
      .filter(s => s.x === x && s.y === y && s.z <= maxZ)
      .sort((a, b) => b.z - a.z);
  }

  function projectedSteps(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const n = Math.max(adx, ady);

    if (!n) return [];
    if (!(dx === 0 || dy === 0 || adx === ady)) return null;

    const sx = dx === 0 ? 0 : dx / adx;
    const sy = dy === 0 ? 0 : dy / ady;
    const out = [];
    for (let i = 1; i <= n; i++) out.push({ x: a.x + sx * i, y: a.y + sy * i });
    return out;
  }

  function highestPath(state, a, b, cutoff) {
    const projection = projectedSteps(a, b);
    if (!projection || b.z > cutoff) return null;

    const path = [];
    for (let i = 0; i < projection.length; i++) {
      const p = projection[i];
      if (i === projection.length - 1) {
        if (!squareExists(state, b)) return null;
        path.push({ ...b });
        continue;
      }
      const options = squaresAt(state, p.x, p.y, cutoff);
      if (!options.length) return null;
      path.push({ ...options[0] });
    }
    return path;
  }

  function candidatePaths(state, a, b) {
    const high = Math.max(a.z, b.z);
    const paths = [];
    const pathA = highestPath(state, a, b, high);
    if (pathA) paths.push(pathA);

    if ([2, 4, 6].includes(high)) {
      const projection = projectedSteps(a, b) || [];
      const hasRelevantAB = projection.some(p =>
        boardSquares(state).some(s =>
          s.type === 'attack' && s.z === high + 1 && s.x === p.x && s.y === p.y
        )
      );
      if (hasRelevantAB) {
        const pathB = highestPath(state, a, b, high + 1);
        if (pathB && !paths.some(p => JSON.stringify(p) === JSON.stringify(pathB))) {
          paths.push(pathB);
        }
      }
    }

    return paths;
  }

  function clearPaths(state, a, b, knight = false) {
    if (knight) return [[]];
    return candidatePaths(state, a, b).filter(path =>
      path.slice(0, -1).every(c => !pieceAt(state, c))
    );
  }

  function rookPawnShape(state, a, b, color, capture) {
    if (!state.rookPawnOption || ![0, 5].includes(a.x)) return false;

    const inward = a.x === 0 ? 1 : -1;
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (capture) return dx === inward && Math.abs(dy) === 1;

    const first = !hasMoved(state, a);
    if (dy !== 0) return false;
    return dx === inward || (first && dx === inward * 2);
  }

  function normalPawnShape(state, p, a, b, capture) {
    const dir = p[0] === 'w' ? 1 : -1;
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (capture) return Math.abs(dx) === 1 && dy === dir;
    if (dx !== 0) return false;
    if (dy === dir) return true;
    return !hasMoved(state, a) && dy === 2 * dir;
  }

  function enPassantInfo(state, from, to, p) {
    if (!p || p[1] !== 'P' || pieceAt(state, to)) return null;
    const last = state.last;
    if (!last || last.kind !== 'piece' || !last.piece || last.piece[1] !== 'P') return null;
    if (!last.path || last.path.length < 2) return null;

    const dx = to.x - from.x;
    const dir = p[0] === 'w' ? 1 : -1;
    if (Math.abs(dx) !== 1 || to.y - from.y !== dir) return null;

    const lastFrom = last.from;
    const lastTo = last.to;
    const twoRankMove = Math.abs(lastTo.y - lastFrom.y) === 2 && lastTo.x === lastFrom.x;
    if (!twoRankMove) return null;

    const intermediate = last.path[0];
    if (k(intermediate.x, intermediate.y, intermediate.z) !== k(to.x, to.y, to.z)) return null;

    const captured = pieceAt(state, lastTo);
    if (!captured || captured[0] === p[0] || captured[1] !== 'P') return null;
    return { capturedAt: lastTo };
  }

  function basicShape(state, p, a, b, forAttack = false) {
    const type = p[1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    if (dx === 0 && dy === 0) return false;
    if (type === 'N') return (adx === 1 && ady === 2) || (adx === 2 && ady === 1);
    if (type === 'K') return Math.max(adx, ady) === 1;
    if (type === 'R') return dx === 0 || dy === 0;
    if (type === 'B') return adx === ady;
    if (type === 'Q') return dx === 0 || dy === 0 || adx === ady;

    if (type === 'P') {
      const target = pieceAt(state, b);
      const capture = forAttack || !!(target && target[0] !== p[0]);
      if (rookPawnShape(state, a, b, p[0], capture)) return true;
      return normalPawnShape(state, p, a, b, capture);
    }
    return false;
  }

  function pseudoLegal(state, from, to, forAttack = false) {
    const p = pieceAt(state, from);
    if (!p || !squareExists(state, to)) return false;

    const dest = pieceAt(state, to);
    if (dest && dest[0] === p[0]) return false;

    if (p[1] === 'P' && !forAttack) {
      const ep = enPassantInfo(state, from, to, p);
      if (ep) return clearPaths(state, from, to).length > 0;
    }

    if (!basicShape(state, p, from, to, forAttack)) return false;

    if (p[1] === 'P' && !forAttack) {
      const dx = to.x - from.x;
      if (dx === 0 && dest) return false;
      if (dx !== 0 && !dest) return false;
    }

    return clearPaths(state, from, to, p[1] === 'N').length > 0;
  }

  function kingSquare(state, color) {
    for (const [key, code] of Object.entries(state.pieces)) {
      if (code === `${color}K`) return parse(key);
    }
    return null;
  }

  function isAttacked(state, target, byColor) {
    for (const [key, code] of Object.entries(state.pieces)) {
      if (code[0] !== byColor) continue;
      if (pseudoLegal(state, parse(key), target, true)) return true;
    }
    return false;
  }

  function transferPiece(state, from, to, markMoved = true) {
    const fk = k(from.x, from.y, from.z);
    const tk = k(to.x, to.y, to.z);
    const code = state.pieces[fk];
    const id = state.ids[fk];
    delete state.pieces[fk];
    delete state.ids[fk];
    state.pieces[tk] = code;
    state.ids[tk] = id;
    if (markMoved && id) state.movedIds[id] = true;
  }

  function removePiece(state, c) {
    const key = k(c.x, c.y, c.z);
    const code = state.pieces[key] || null;
    delete state.pieces[key];
    delete state.ids[key];
    return code;
  }

  function home(color) {
    return color === 'w'
      ? {
          king: parse('e0@3'), kingRook: parse('f0@3'),
          queenHome: parse('b0@3'), queenRook: parse('a0@3')
        }
      : {
          king: parse('e9@7'), kingRook: parse('f9@7'),
          queenHome: parse('b9@7'), queenRook: parse('a9@7')
        };
  }

  function castleKind(state, from, to) {
    const p = pieceAt(state, from);
    if (!p || p[1] !== 'K' || p[0] !== state.turn || hasMoved(state, from)) return null;
    const h = home(p[0]);
    if (k(from.x, from.y, from.z) !== k(h.king.x, h.king.y, h.king.z)) return null;
    if (!squareExists(state, from) || isAttacked(state, from, other(p[0]))) return null;

    const kingSideTarget = k(h.kingRook.x, h.kingRook.y, h.kingRook.z);
    if (k(to.x, to.y, to.z) === kingSideTarget) {
      const rook = pieceAt(state, h.kingRook);
      if (rook !== `${p[0]}R` || hasMoved(state, h.kingRook)) return null;

      const n = clone(state);
      const kingId = idAt(n, h.king);
      const rookId = idAt(n, h.kingRook);
      const kk = k(h.king.x, h.king.y, h.king.z);
      const rk = k(h.kingRook.x, h.kingRook.y, h.kingRook.z);
      n.pieces[kk] = `${p[0]}R`; n.ids[kk] = rookId;
      n.pieces[rk] = `${p[0]}K`; n.ids[rk] = kingId;
      if (isAttacked(n, h.kingRook, other(p[0]))) return null;
      return 'king';
    }

    const queenTarget = k(h.queenHome.x, h.queenHome.y, h.queenHome.z);
    if (k(to.x, to.y, to.z) === queenTarget) {
      const rook = pieceAt(state, h.queenRook);
      if (rook !== `${p[0]}R` || hasMoved(state, h.queenRook)) return null;
      if (pieceAt(state, h.queenHome)) return null;
      if (!squareExists(state, h.queenHome) || !squareExists(state, h.queenRook)) return null;

      const n = clone(state);
      const kingId = idAt(n, h.king);
      const rookId = idAt(n, h.queenRook);
      removePiece(n, h.king);
      removePiece(n, h.queenRook);
      const qk = k(h.queenHome.x, h.queenHome.y, h.queenHome.z);
      const kk = k(h.king.x, h.king.y, h.king.z);
      n.pieces[qk] = `${p[0]}K`; n.ids[qk] = kingId;
      n.pieces[kk] = `${p[0]}R`; n.ids[kk] = rookId;
      if (isAttacked(n, h.queenHome, other(p[0]))) return null;
      return 'queen';
    }

    return null;
  }

  function simulatePiece(state, from, to) {
    const n = clone(state);
    const p = pieceAt(n, from);
    const ep = p && p[1] === 'P' ? enPassantInfo(n, from, to, p) : null;
    if (ep) removePiece(n, ep.capturedAt);
    else removePiece(n, to);
    transferPiece(n, from, to);
    return n;
  }

  function legalMove(state, from, to) {
    const p = pieceAt(state, from);
    if (!p || p[0] !== state.turn) return false;

    if (castleKind(state, from, to)) return true;

    const dest = pieceAt(state, to);
    if (dest && dest[1] === 'K') return false;
    if (!pseudoLegal(state, from, to, false)) return false;

    const n = simulatePiece(state, from, to);
    const ks = kingSquare(n, p[0]);
    return !!ks && !isAttacked(n, ks, other(p[0]));
  }

  function legalTargets(state, from) {
    const out = boardSquares(state).filter(s => legalMove(state, from, s));
    const p = pieceAt(state, from);
    if (p && p[1] === 'K' && p[0] === state.turn) {
      const h = home(p[0]);
      if (castleKind(state, from, h.kingRook)) out.push(h.kingRook);
    }
    return out;
  }

  function pushHistory(state) {
    const snap = clone({ ...state, history: [] });
    state.history.push(snap);
  }

  function promoteIfNeeded(state, c) {
    const key = k(c.x, c.y, c.z);
    const p = state.pieces[key];
    if (!p || p[1] !== 'P') return false;
    const promotes = (p[0] === 'w' && c.y >= 8) || (p[0] === 'b' && c.y <= 1);
    if (promotes) state.pieces[key] = `${p[0]}Q`;
    return promotes;
  }

  function captureBoardOwnership(state, to, attackerColor, captured) {
    if (!captured) return;
    const ab = findABAt(state, to);
    if (!ab || ab.owner === attackerColor) return;
    const ownerPiecesRemain = abSquares(ab).some(s => {
      const q = pieceAt(state, s);
      return q && q[0] === ab.owner;
    });
    if (!ownerPiecesRemain) ab.owner = attackerColor;
  }

  function executeCastle(state, from, kind) {
    const color = pieceAt(state, from)[0];
    const h = home(color);
    const kingId = idAt(state, h.king);

    if (kind === 'king') {
      const rookId = idAt(state, h.kingRook);
      const kk = k(h.king.x, h.king.y, h.king.z);
      const rk = k(h.kingRook.x, h.kingRook.y, h.kingRook.z);
      state.pieces[kk] = `${color}R`; state.ids[kk] = rookId;
      state.pieces[rk] = `${color}K`; state.ids[rk] = kingId;
      state.movedIds[kingId] = true; state.movedIds[rookId] = true;
      state.last = { kind: 'castle', side: 'king', color };
      return;
    }

    const rookId = idAt(state, h.queenRook);
    removePiece(state, h.king);
    removePiece(state, h.queenRook);
    const qk = k(h.queenHome.x, h.queenHome.y, h.queenHome.z);
    const kk = k(h.king.x, h.king.y, h.king.z);
    state.pieces[qk] = `${color}K`; state.ids[qk] = kingId;
    state.pieces[kk] = `${color}R`; state.ids[kk] = rookId;
    state.movedIds[kingId] = true; state.movedIds[rookId] = true;
    state.last = { kind: 'castle', side: 'queen', color };
  }

  function movePiece(state, from, to) {
    if (!legalMove(state, from, to)) {
      return { ok: false, msg: 'Illegal move under the current Tri-D rules.' };
    }

    pushHistory(state);
    const p = pieceAt(state, from);
    const castle = castleKind(state, from, to);

    if (castle) {
      executeCastle(state, from, castle);
      state.turn = other(state.turn);
      const st = status(state);
      if (st.checkmate) state.winner = st.winner;
      if (st.stalemate) state.draw = 'stalemate';
      return { ok: true, msg: `${castle === 'king' ? 'King-side' : 'Queen-side'} castling complete.` };
    }

    const paths = p[1] === 'N' ? [[]] : clearPaths(state, from, to);
    const chosenPath = paths[0] || [];
    const ep = p[1] === 'P' ? enPassantInfo(state, from, to, p) : null;
    const captured = ep ? removePiece(state, ep.capturedAt) : removePiece(state, to);

    transferPiece(state, from, to);
    const promoted = promoteIfNeeded(state, to);
    captureBoardOwnership(state, to, p[0], captured);

    state.last = {
      kind: 'piece',
      from: { ...from },
      to: { ...to },
      piece: p,
      captured,
      enPassant: !!ep,
      promoted,
      path: chosenPath.map(x => ({ ...x }))
    };

    state.turn = other(state.turn);
    const st = status(state);
    if (st.checkmate) state.winner = st.winner;
    if (st.stalemate) state.draw = 'stalemate';
    return { ok: true, msg: promoted ? 'Move accepted · promotion.' : 'Move accepted.' };
  }

  function pawnsRemaining(state, color) {
    return Object.values(state.pieces).some(p => p === `${color}P`);
  }

  function findABAt(state, c) {
    return state.abs.find(ab =>
      abSquares(ab).some(s => s.x === c.x && s.y === c.y && s.z === c.z)
    );
  }

  function abContents(state, ab) {
    return abSquares(ab)
      .map((s, i) => ({ s, i, p: pieceAt(state, s), id: idAt(state, s) }))
      .filter(x => x.p);
  }

  function abEligible(state, ab) {
    if (ab.owner !== state.turn || !pawnsRemaining(state, state.turn)) return false;
    const contents = abContents(state, ab);
    return contents.length === 0 ||
      (contents.length === 1 && contents[0].p === `${state.turn}P`);
  }

  function baseABActions(state, ab) {
    if (!abEligible(state, ab)) return [];
    const out = [];

    const invertClash = state.abs.some(x =>
      x.id !== ab.id &&
      x.kind === ab.kind &&
      x.anchor.r === ab.anchor.r &&
      x.anchor.z === ab.anchor.z &&
      x.inverted !== ab.inverted
    );
    if (!invertClash) {
      out.push({
        r: ab.anchor.r, z: ab.anchor.z, inverted: !ab.inverted,
        label: 'Invert on current post'
      });
    }

    for (const p of POSTS) {
      const distance = Math.abs(p.r - ab.anchor.r);
      if (![1, 2].includes(distance)) continue;

      for (const inverted of [ab.inverted, !ab.inverted]) {
        const clash = state.abs.some(x =>
          x.id !== ab.id &&
          x.kind === ab.kind &&
          x.anchor.r === p.r &&
          x.anchor.z === p.z &&
          x.inverted === inverted
        );
        if (!clash) {
          out.push({
            r: p.r, z: p.z, inverted,
            label: `${FILES[ab.kind === 'Q' ? 1 : 4]}${p.r}(${p.z})${inverted ? ' · inverted' : ''}`
          });
        }
      }
    }
    return out;
  }

  function simulateAB(state, abId, action) {
    const n = clone(state);
    const ab = n.abs.find(a => a.id === abId);
    const contents = abContents(n, ab);

    contents.forEach(x => removePiece(n, x.s));
    ab.anchor = { r: action.r, z: action.z };
    ab.inverted = action.inverted;
    const targetSquares = abSquares(ab);

    contents.forEach(x => {
      const target = targetSquares[x.i];
      const key = k(target.x, target.y, target.z);
      n.pieces[key] = x.p;
      n.ids[key] = x.id;
      if (x.id) n.movedIds[x.id] = true;
      promoteIfNeeded(n, target);
    });

    return n;
  }

  function abActions(state, ab) {
    if (!abEligible(state, ab)) return [];
    return baseABActions(state, ab).filter(action => {
      const n = simulateAB(state, ab.id, action);
      const ks = kingSquare(n, state.turn);
      return !!ks && !isAttacked(n, ks, other(state.turn));
    });
  }

  function moveAB(state, id, action) {
    const ab = state.abs.find(a => a.id === id);
    if (!ab || !abEligible(state, ab)) {
      return { ok: false, msg: 'That attack board cannot move now.' };
    }

    const valid = abActions(state, ab).some(a =>
      a.r === action.r && a.z === action.z && a.inverted === action.inverted
    );
    if (!valid) {
      return { ok: false, msg: 'Illegal attack-board destination or it would expose your king.' };
    }

    pushHistory(state);
    const next = simulateAB(state, id, action);
    next.history = state.history;
    next.last = { kind: 'board', id, action: { ...action } };
    next.turn = other(state.turn);

    Object.keys(state).forEach(key => delete state[key]);
    Object.assign(state, next);

    const st = status(state);
    if (st.checkmate) state.winner = st.winner;
    if (st.stalemate) state.draw = 'stalemate';
    return { ok: true, msg: `${id} repositioned.` };
  }

  function hasAnyLegalPieceMove(state, color) {
    if (state.turn !== color) return false;
    for (const [key, p] of Object.entries(state.pieces)) {
      if (p[0] !== color) continue;
      if (legalTargets(state, parse(key)).length) return true;
    }
    return false;
  }

  function hasAnyLegalABMove(state, color) {
    if (state.turn !== color) return false;
    return state.abs.some(ab => ab.owner === color && abActions(state, ab).length);
  }

  function status(state) {
    if (state.winner) {
      return {
        turn: state.turn, check: false, winner: state.winner,
        checkmate: true, stalemate: false
      };
    }
    if (state.draw) {
      return {
        turn: state.turn, check: false, winner: null,
        checkmate: false, stalemate: true
      };
    }

    const ks = kingSquare(state, state.turn);
    const check = ks ? isAttacked(state, ks, other(state.turn)) : false;
    const hasMove = hasAnyLegalPieceMove(state, state.turn) || hasAnyLegalABMove(state, state.turn);

    return {
      turn: state.turn,
      check,
      winner: !hasMove && check ? other(state.turn) : null,
      checkmate: !hasMove && check,
      stalemate: !hasMove && !check
    };
  }

  function undo(state) {
    if (!state.history.length) return state;
    const snap = clone(state.history[state.history.length - 1]);
    snap.history = state.history.slice(0, -1).map(x => clone(x));
    return snap;
  }

  const API = {
    FILES, MAIN, POSTS, PIECE_SYMBOL,
    start, parse, k, boardSquares, abSquares, pieceAt, legalMove, legalTargets,
    movePiece, abActions, abEligible, moveAB, undo, status, findABAt
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.TriD = API;

})(typeof window !== 'undefined' ? window : globalThis);