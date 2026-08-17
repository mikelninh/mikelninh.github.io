'use strict';

const $ = id => document.getElementById(id);
const FILES6 = TriD.FILES;
const FILES8 = 'abcdefgh';

let state = TriD.start();
let selected = null;
let selectedAB = null;
let rx = 59;
let rz = -29;
let drag = false;
let lastX = 0;
let lastY = 0;
let missionMode = 'free';

function coordKey(c) {
  return TriD.k(c.x, c.y, c.z);
}

function pretty(c) {
  return `${FILES6[c.x]}${c.y}(${c.z})`;
}

function squareColor(x, y) {
  return ((x + y) % 2 === 0) ? 'light' : 'dark';
}

function pieceName(code) {
  const names = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };
  return `${code[0] === 'w' ? 'White' : 'Black'} ${names[code[1]]}`;
}

function setMission(text, tone = '') {
  const node = $('missionText');
  if (!node) return;
  node.textContent = text;
  node.dataset.tone = tone;
}

function applyView() {
  document.documentElement.style.setProperty('--rx', `${rx}deg`);
  document.documentElement.style.setProperty('--rz', `${rz}deg`);
}

function render() {
  renderScene();
  renderPanel();
  renderStatus();
}

function renderScene() {
  const world = $('world');
  world.innerHTML = '';

  const legal = selected
    ? new Set(TriD.legalTargets(state, selected).map(coordKey))
    : new Set();

  const boards = [
    ...TriD.MAIN.map(b => ({ ...b, type: 'main' })),
    ...state.abs.map(ab => {
      const squares = TriD.abSquares(ab);
      return {
        id: ab.id,
        type: 'attack',
        kind: ab.kind,
        owner: ab.owner,
        squares,
        z: squares[0].z,
        label: `${ab.id} · ${ab.inverted ? 'INVERTED' : 'UPRIGHT'}`
      };
    })
  ];

  for (const b of boards) {
    const plane = document.createElement('div');
    plane.className = `board-plane ${b.type}`;
    plane.dataset.board = b.id;

    let squares = [];
    let x0, y0, z;

    if (b.type === 'main') {
      x0 = b.x0;
      y0 = b.y0;
      z = b.z;
      for (let y = y0 + 3; y >= y0; y--) {
        for (let x = x0; x < x0 + 4; x++) squares.push({ x, y, z });
      }
    } else {
      const raw = b.squares;
      x0 = Math.min(...raw.map(s => s.x));
      y0 = Math.min(...raw.map(s => s.y));
      z = b.z;
      for (let y = Math.max(...raw.map(s => s.y)); y >= Math.min(...raw.map(s => s.y)); y--) {
        for (let x = Math.min(...raw.map(s => s.x)); x <= Math.max(...raw.map(s => s.x)); x++) {
          squares.push(raw.find(s => s.x === x && s.y === y));
        }
      }
    }

    const X = (x0 - 1) * 58 + 155;
    const Y = (7 - y0) * 58 + 74;
    const Z = (z - 4) * 78;
    plane.style.transform = `translate3d(${X}px, ${Y}px, ${Z}px)`;

    const rim = document.createElement('div');
    rim.className = 'deck-rim';
    plane.appendChild(rim);

    const label = document.createElement('div');
    label.className = `board-label ${b.type === 'attack' ? `owner-${b.owner}` : ''}`;
    label.textContent = b.type === 'main' ? `${b.label} · Z${b.z}` : b.label;
    plane.appendChild(label);

    if (b.type === 'attack') {
      const post = document.createElement('div');
      post.className = 'post';
      plane.appendChild(post);
    }

    for (const c of squares) {
      const sq = document.createElement('button');
      sq.className = `board-square ${squareColor(c.x, c.y)}`;
      sq.type = 'button';

      const key = coordKey(c);
      if (selected && key === coordKey(selected)) sq.classList.add('selected');
      if (legal.has(key)) sq.classList.add('legal');

      const p = TriD.pieceAt(state, c);
      if (p) {
        const pc = document.createElement('span');
        pc.className = `piece ${p[0] === 'w' ? 'white' : 'black'}`;
        pc.textContent = TriD.PIECE_SYMBOL[p];
        pc.title = `${pieceName(p)} · ${pretty(c)}`;
        sq.appendChild(pc);
      }

      const tiny = document.createElement('span');
      tiny.className = 'tri-coord';
      tiny.textContent = `${FILES6[c.x]}${c.y}`;
      sq.appendChild(tiny);

      sq.dataset.key = key;
      sq.addEventListener('pointerdown', e => e.stopPropagation());
      sq.onclick = e => {
        e.stopPropagation();
        onSquare(c);
      };
      plane.appendChild(sq);
    }

    world.appendChild(plane);
  }
}

function onSquare(c) {
  const p = TriD.pieceAt(state, c);

  if (selected) {
    const moving = TriD.pieceAt(state, selected);
    const result = TriD.movePiece(state, selected, c);

    if (result.ok) {
      const last = state.last;
      $('lastEvent').textContent = last.kind === 'castle'
        ? result.msg
        : `${pieceName(moving)} · ${pretty(last.from)} → ${pretty(last.to)}${last.captured ? ' · capture' : ''}${last.promoted ? ' · promotion' : ''}`;
      selected = null;
      selectedAB = null;
      if (missionMode === 'free') setMission('Move accepted. Rotate the volume or select another piece.', 'good');
      render();
      return;
    }

    if (p && p[0] === state.turn) {
      selected = c;
      selectedAB = null;
      render();
      return;
    }

    $('moveInfo').textContent = result.msg;
    setMission(result.msg, 'warn');
    return;
  }

  if (p && p[0] === state.turn) {
    selected = c;
    selectedAB = null;
    render();
    return;
  }

  const ab = TriD.findABAt(state, c);
  if (ab && TriD.abEligible(state, ab)) {
    selectedAB = ab.id;
    selected = null;
    render();
  }
}

function renderStatus() {
  state.rookPawnOption = $('rookPawn').checked;
  const st = TriD.status(state);
  $('turnTop').textContent = st.turn === 'w' ? 'WHITE' : 'BLACK';

  let statusText;
  if (st.checkmate) statusText = `${st.winner === 'w' ? 'White' : 'Black'} wins · CHECKMATE`;
  else if (st.stalemate) statusText = 'Draw · STALEMATE';
  else statusText = `${st.turn === 'w' ? 'White' : 'Black'} to move${st.check ? ' · CHECK' : ''}.`;

  $('gameStatus').textContent = statusText;
  $('gameStatus').dataset.alert = st.check ? 'check' : '';
}

function renderPanel() {
  if (selected) {
    const p = TriD.pieceAt(state, selected);
    const targets = TriD.legalTargets(state, selected);
    $('selectedText').textContent = pieceName(p);
    $('selectedSub').textContent = `${pretty(selected)} · ${targets.length} legal vector${targets.length === 1 ? '' : 's'}`;
    $('moveInfo').textContent = targets.length
      ? 'Cyan markers are legal destinations after projected movement, path validation and king-safety checks.'
      : 'No legal destinations from this square.';
  } else if (selectedAB) {
    const ab = state.abs.find(a => a.id === selectedAB);
    $('selectedText').textContent = `Attack board ${ab.id}`;
    $('selectedSub').textContent = `${ab.owner === 'w' ? 'White' : 'Black'} control · ${ab.inverted ? 'inverted' : 'upright'}`;
    $('moveInfo').textContent = 'Repositioning an attack board consumes the turn. It may be empty or carry one owned pawn.';
  } else {
    $('selectedText').textContent = 'Nothing selected';
    $('selectedSub').textContent = 'Choose a piece or an eligible attack board.';
    $('moveInfo').textContent = 'Tip: TOP view makes the “look down through the boards” movement rule much easier to understand.';
  }

  const list = $('abList');
  list.innerHTML = '';

  state.abs.forEach(ab => {
    const button = document.createElement('button');
    const eligible = TriD.abEligible(state, ab);
    button.className = `ab-btn ${selectedAB === ab.id ? 'active' : ''}`;
    button.disabled = !eligible;
    button.innerHTML = `
      <span class="ab-dot ${ab.owner}"></span>
      <span><b>${ab.id}</b><small>${ab.owner === 'w' ? 'WHITE' : 'BLACK'} · ${ab.inverted ? 'inverted' : 'upright'}</small></span>
      <em>${eligible ? 'READY' : 'LOCKED'}</em>
    `;
    button.onclick = () => {
      selectedAB = ab.id;
      selected = null;
      render();
    };
    list.appendChild(button);
  });

  const actions = $('abActions');
  actions.innerHTML = '';

  if (selectedAB) {
    const ab = state.abs.find(a => a.id === selectedAB);
    const choices = TriD.abActions(state, ab);

    if (!choices.length) {
      const note = document.createElement('div');
      note.className = 'empty-actions';
      note.textContent = 'No legal repositioning action from here.';
      actions.appendChild(note);
    }

    choices.forEach(action => {
      const button = document.createElement('button');
      button.className = 'ab-action';
      button.innerHTML = `<span>${action.label}</span><b>EXECUTE ↗</b>`;
      button.onclick = () => {
        const result = TriD.moveAB(state, selectedAB, action);
        $('lastEvent').textContent = result.msg;
        selectedAB = null;
        if (missionMode === 'warp' && result.ok) {
          setMission('Excellent. The pawn rode the attack board. Keep advancing the same board toward rank 8/9 for warp-speed promotion.', 'good');
        }
        render();
      };
      actions.appendChild(button);
    });
  }
}

function resetMatch() {
  state = TriD.start();
  selected = null;
  selectedAB = null;
  missionMode = 'free';
  $('rookPawn').checked = true;
  $('lastEvent').textContent = 'Opening position loaded.';
  setMission('Free play. Select a piece to reveal legal vectors, or launch the 60-second attack-board mission.', '');
  render();
}

function loadWarpMission() {
  state = TriD.start();
  missionMode = 'warp';
  selected = null;
  selectedAB = 'WQ';

  const wq = state.abs.find(x => x.id === 'WQ');
  const keepKey = TriD.k(0, 1, 3);
  for (const c of TriD.abSquares(wq)) {
    const key = TriD.k(c.x, c.y, c.z);
    if (key !== keepKey) {
      delete state.pieces[key];
      delete state.ids[key];
    }
  }

  $('lastEvent').textContent = 'Training scenario: WQ attack board cleared except for one pawn.';
  setMission('60-second mission: the WQ attack board is carrying one pawn. Choose a legal destination below and watch the pawn ride the board.', 'mission');
  render();
}

const BACK = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];

const ACADEMY_LINES = [
  ['e2e4','e7e5','g1f3','b8c6','f1c4'],
  ['e2e4','e7e5','g1f3','b8c6','f1b5'],
  ['e2e4','e7e5','g1f3','b8c6','d2d4'],
  ['e2e4','e7e5','b1c3','g8f6','f2f4'],
  ['e2e4','c7c5','g1f3','d7d6','d2d4'],
  ['e2e4','c7c6','d2d4','d7d5','b1c3'],
  ['e2e4','e7e6','d2d4','d7d5','b1c3'],
  ['d2d4','d7d5','c2c4','e7e6','b1c3'],
  ['d2d4','d7d5','c2c4','c7c6','g1f3'],
  ['d2d4','g8f6','c2c4','g7g6','b1c3','f8g7'],
  ['d2d4','g8f6','c2c4','e7e6','b1c3','f8b4'],
  ['d2d4','g8f6','c2c4','g7g6','b1c3','d7d5'],
  ['d2d4','g8f6','c2c4','e7e6','g2g3','d7d5','f1g2'],
  ['d2d4','d7d5','g1f3','g8f6','c1f4'],
  ['c2c4','e7e5','b1c3','g8f6','g2g3'],
  ['g1f3','d7d5','c2c4','e7e6','g2g3']
];

const MOVE_NOTES = {
  e4: 'Claim the centre and open lines for the queen and king-side bishop.',
  d4: 'Take central space and release the c1 bishop.',
  c4: 'Pressure the centre from the flank; in Queen’s Gambit structures this attacks d5.',
  e5: 'Meet White in the centre and claim equal space.',
  d5: 'Challenge the centre immediately.',
  c5: 'Create asymmetry and attack d4 from the flank.',
  c6: 'Prepare a supported …d5 while keeping the light bishop flexible.',
  e6: 'Build a solid structure and prepare …d5.',
  Nf3: 'Develop toward the centre, influence e5/d4 and prepare king safety.',
  Nc3: 'Develop toward the centre and support the key e4/d5 squares.',
  Nf6: 'Develop with central pressure and prepare castling.',
  Nc6: 'Develop while reinforcing the e5 centre.',
  Bc4: 'Develop with tempo toward f7, Black’s most sensitive early square.',
  Bb5: 'Pressure the knight that defends e5 instead of rushing to capture anything.',
  Bf4: 'Place the bishop outside the pawn chain before e3.',
  Bg7: 'Complete the fianchetto and attack the centre from long range.',
  Bg2: 'Activate the long diagonal while preparing a safe king.',
  g3: 'Prepare a fianchetto and keep the centre flexible.',
  g6: 'Prepare …Bg7 and a hypermodern fight against the centre.',
  f4: 'Turn the Vienna into an aggressive kingside challenge.',
  Bb4: 'Pin the c3 knight and make White’s ideal e4 centre harder to build.'
};

let oi = 0;
let ply = 0;
let acad = {};
let academySelected = null;
let academyStatus = '';

function academyStart() {
  acad = {};
  for (let i = 0; i < 8; i++) {
    acad[`${FILES8[i]}1`] = `w${BACK[i]}`;
    acad[`${FILES8[i]}2`] = 'wP';
    acad[`${FILES8[i]}7`] = 'bP';
    acad[`${FILES8[i]}8`] = `b${BACK[i]}`;
  }
}

function academyMove(move) {
  const from = move.slice(0, 2);
  const to = move.slice(2);
  const p = acad[from];
  if (!p) return false;
  delete acad[from];
  acad[to] = p;
  return true;
}

function expectedAcademyMove() {
  return ACADEMY_LINES[oi][ply] || null;
}

function moveTurnText() {
  if (ply >= ACADEMY_LINES[oi].length) return 'LINE COMPLETE';
  return ply % 2 === 0 ? 'WHITE TO MOVE' : 'BLACK TO MOVE';
}

function noteForCurrentMove() {
  if (ply >= OPENINGS[oi].moves.length) {
    return 'Reset the line and reproduce the sequence without using Reveal. Pattern recognition beats memorising a wall of notation.';
  }
  const san = OPENINGS[oi].moves[ply];
  return MOVE_NOTES[san] || 'Develop with purpose: improve a piece, influence the centre, or prepare king safety.';
}

function handleAcademySquare(square) {
  if (ply >= ACADEMY_LINES[oi].length) return;
  const expected = expectedAcademyMove();

  if (!academySelected) {
    const p = acad[square];
    if (!p) {
      academyStatus = 'Select a piece first.';
      renderAcademy();
      return;
    }
    const correctColor = (ply % 2 === 0 ? 'w' : 'b');
    if (p[0] !== correctColor) {
      academyStatus = `${correctColor === 'w' ? 'White' : 'Black'} is to move.`;
      renderAcademy();
      return;
    }
    academySelected = square;
    academyStatus = 'Now choose the destination.';
    renderAcademy();
    return;
  }

  if (square === academySelected) {
    academySelected = null;
    academyStatus = '';
    renderAcademy();
    return;
  }

  const attempted = academySelected + square;
  if (attempted === expected) {
    academyMove(expected);
    ply += 1;
    academySelected = null;
    academyStatus = 'Correct. You found the pattern. ✦';
    renderAcademy(false);
  } else {
    academyStatus = 'Not this line. Ask what the opening is trying to achieve.';
    academySelected = acad[square] && acad[square][0] === (ply % 2 === 0 ? 'w' : 'b') ? square : null;
    renderAcademy();
  }
}

function renderAcademy(rebuild = true) {
  if (rebuild) {
    academyStart();
    for (let i = 0; i < ply; i++) academyMove(ACADEMY_LINES[oi][i]);
  }

  $('openingName').textContent = OPENINGS[oi].name;
  $('openingWhy').textContent = OPENINGS[oi].why;
  $('academyTurn').textContent = moveTurnText();
  $('academyInsight').textContent = noteForCurrentMove();
  $('academyStatus').textContent = academyStatus || 'Find the next move directly on the board.';
  $('academyProgress').style.width = `${Math.round((ply / ACADEMY_LINES[oi].length) * 100)}%`;

  const moveList = $('openingMoves');
  moveList.innerHTML = '';
  OPENINGS[oi].moves.forEach((m, i) => {
    const span = document.createElement('span');
    span.textContent = m;
    span.className = i < ply ? 'done' : i === ply ? 'current' : '';
    moveList.appendChild(span);
  });

  const board = $('academyBoard');
  board.innerHTML = '';
  const expected = expectedAcademyMove();

  for (let rank = 8; rank >= 1; rank--) {
    for (let f = 0; f < 8; f++) {
      const file = FILES8[f];
      const square = `${file}${rank}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `acad-sq ${squareColor(f, rank)}`;
      button.dataset.square = square;

      if (academySelected === square) button.classList.add('selected');
      if (academySelected && expected && expected.slice(0,2) === academySelected && expected.slice(2) === square) {
        button.classList.add('hint-target');
      }

      const p = acad[square];
      if (p) {
        const piece = document.createElement('span');
        piece.className = `academy-piece ${p[0] === 'w' ? 'white' : 'black'}`;
        piece.textContent = TriD.PIECE_SYMBOL[p];
        button.appendChild(piece);
      }

      if (rank === 1) {
        const coord = document.createElement('span');
        coord.className = 'acad-file';
        coord.textContent = file;
        button.appendChild(coord);
      }
      if (f === 0) {
        const coord = document.createElement('span');
        coord.className = 'acad-rank';
        coord.textContent = rank;
        button.appendChild(coord);
      }

      button.onclick = () => handleAcademySquare(square);
      board.appendChild(button);
    }
  }

  document.querySelectorAll('.opening-item').forEach((el, i) => {
    el.classList.toggle('active', i === oi);
  });
}

function buildOpeningList() {
  const list = $('openingList');
  list.innerHTML = '';

  OPENINGS.forEach((opening, i) => {
    const button = document.createElement('button');
    button.className = 'opening-item';
    button.innerHTML = `
      <span class="opening-index">${String(i + 1).padStart(2, '0')}</span>
      <span><b>${opening.name}</b><small>${opening.why}</small></span>
    `;
    button.onclick = () => {
      oi = i;
      ply = 0;
      academySelected = null;
      academyStatus = '';
      renderAcademy();
    };
    list.appendChild(button);
  });
}

function revealAcademyMove() {
  const expected = expectedAcademyMove();
  if (!expected) return;
  academyStart();
  for (let i = 0; i < ply; i++) academyMove(ACADEMY_LINES[oi][i]);
  academyMove(expected);
  ply += 1;
  academySelected = null;
  academyStatus = 'Move revealed. Reset later and try to reproduce it yourself.';
  renderAcademy(false);
}

$('reset').onclick = resetMatch;

$('undo').onclick = () => {
  if (state.history.length) {
    state = TriD.undo(state);
    selected = null;
    selectedAB = null;
    $('lastEvent').textContent = 'Temporal rollback complete.';
    setMission('Previous position restored.', '');
    render();
  }
};

$('rookPawn').onchange = () => {
  state.rookPawnOption = $('rookPawn').checked;
  render();
};

$('warpMission').onclick = loadWarpMission;
$('freePlay').onclick = resetMatch;

$('heroView').onclick = () => { rx = 59; rz = -29; applyView(); };
$('topView').onclick = () => { rx = 5; rz = 0; applyView(); };
$('sideView').onclick = () => { rx = 69; rz = -3; applyView(); };

const scene = $('scene');
scene.addEventListener('pointerdown', e => {
  drag = true;
  lastX = e.clientX;
  lastY = e.clientY;
  scene.setPointerCapture(e.pointerId);
});
scene.addEventListener('pointermove', e => {
  if (!drag) return;
  rz += (e.clientX - lastX) * 0.18;
  rx = Math.max(3, Math.min(78, rx - (e.clientY - lastY) * 0.14));
  lastX = e.clientX;
  lastY = e.clientY;
  applyView();
});
scene.addEventListener('pointerup', () => drag = false);
scene.addEventListener('pointercancel', () => drag = false);

document.querySelectorAll('.tabs button').forEach(button => {
  button.onclick = () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === button));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    $(`${button.dataset.tab}Tab`).classList.add('active');
  };
});

$('revealOpening').onclick = revealAcademyMove;
$('prevOpening').onclick = () => {
  ply = Math.max(0, ply - 1);
  academySelected = null;
  academyStatus = 'Rewound one ply.';
  renderAcademy();
};
$('resetOpening').onclick = () => {
  ply = 0;
  academySelected = null;
  academyStatus = '';
  renderAcademy();
};
$('hintOpening').onclick = () => {
  const expected = expectedAcademyMove();
  if (!expected) return;
  academySelected = expected.slice(0,2);
  academyStatus = `Vector hint: start from ${expected.slice(0,2).toUpperCase()}.`;
  renderAcademy();
};

buildOpeningList();
renderAcademy();
applyView();
resetMatch();