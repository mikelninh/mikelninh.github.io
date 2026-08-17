# Tri-D Command // Opening Academy

A playable Star-Trek-inspired Tri-D chess lab plus an interactive standard-chess opening trainer. Built because a junior software developer job ad made me curious.

**Live demo:** https://mikelninh.github.io/trid-chess/

## Why this is not just a tilted chessboard

The Tri-D mode models the fan-developed **Federation Revised Standard 5.0** family of rules:

- three fixed 4×4 main boards at elevations 2 / 4 / 6
- four movable 2×2 attack boards
- 64 playable squares total
- ordinary chess geometry projected through the stack
- highest-path movement and alternate Path B over attack boards
- attack-board translation, inversion and ownership transfer
- attack-board actions are rejected if they expose your king
- pawns can ride attack boards and promote
- Tri-D king-side and queen-side castling
- standard en passant using the travelled path
- optional a/f-file rook-pawn rule
- check, checkmate and stalemate; kings are never captured

### Beta boundary

The engine is intentionally labelled **FRS 5.0 Beta**. Core play is implemented and covered by deterministic tests, but exhaustive conformance against every published sample position — especially rare interactions between the optional rook-pawn rule and en passant — remains work to do.

## 60-second Tri-D mission

The demo includes a small onboarding scenario: one white pawn sits on an otherwise empty attack board. Move the board and watch the pawn travel with it. This introduces the mechanic that makes Tri-D chess feel genuinely different before asking a new player to understand the full opening position.

## Opening Academy

16 important classical and hypermodern opening families. The standard 8×8 board is interactive: choose the piece, find the next move, use a vector hint when stuck, and read the strategic reason behind each step.

## Stack

- HTML / CSS / vanilla JavaScript
- deterministic Tri-D rules engine
- CSS 3D scene with draggable camera and top / bridge / side views
- ASP.NET Core companion API
- SQLite progress/session storage

## Validation

Run the rules-engine smoke suite with Node:

```bash
node engine.test.js
```

The suite covers starting geometry, normal movement, undo, king-capture prevention, Tri-D castling, attack-board eligibility/movement, attack-board pawn promotion and en-passant path recording.

## API

The static demo is zero-install. A small .NET 8 companion API lives in `api/StarfleetChess.Api` and exposes health, session and event endpoints.

```bash
cd api/StarfleetChess.Api
dotnet restore
dotnet run
```

## Rules lineage

The Star Trek television prop did not ship with a canonical on-screen ruleset. Andrew Bartmess reverse-engineered a playable game; Charles Roth later published clarifications under **Federation Revised Standard 5.0**. This project follows that lineage and is an unofficial fan implementation.

Reference: Charles Roth, *Star Trek 3-D Chess Rules (Federation Revised Standard 5.0)* — https://www.thedance.net/~roth/TECHBLOG/chess.html

## Disclaimer

Unofficial fan project. Star Trek and related marks belong to their respective owners. No affiliation with Paramount/CBS is implied.
