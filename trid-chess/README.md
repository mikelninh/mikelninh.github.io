# Tri-D Command // Opening Deck

A playable Star-Trek-inspired Tri-D chess lab plus a standard chess opening academy. Built because a junior software developer job ad made me curious.

**Live demo:** https://mikelninh.github.io/trid-chess/

## What makes it real Tri-D chess

The game mode models the fan-developed **Federation Revised Standard 5.0** family of rules rather than simply tilting an 8×8 board:

- three fixed 4×4 main boards at elevations 2 / 4 / 6
- four movable 2×2 attack boards
- 64 playable squares total
- ordinary chess piece geometry projected through the stack
- highest-path movement and alternate Path B over attack boards
- attack-board translation, inversion and ownership transfer
- pawns can ride attack boards and promote
- optional a/f-file rook-pawn rule
- king-safety validation

### Deliberate beta edges
Tri-D castling and the unusual en-passant edge cases are documented but not yet implemented. The UI labels the engine **FRS 5.0 Beta** rather than pretending the TV series had an official complete ruleset.

## Opening Academy
16 important classical / hypermodern opening families with a visual line explorer and strategic explanation.

## Stack
- HTML / CSS / vanilla JavaScript
- deterministic Tri-D rules engine
- CSS 3D scene with draggable camera
- ASP.NET Core companion API
- SQLite progress/session storage

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
