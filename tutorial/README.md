# Tutorial

1. [Create board](#1-create-board)
2. [Move pieces](#2-move-pieces)
3. [Full game example](#3-full-game-example)
4. [Square information](#4-square-information)
5. [Piece information](#5-piece-information)

## 1. Create board

### Create board from FEN string

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board('8/8/2k5/4q3/6K1/8/1R3R2/8 w - - 0 1');
undefined
> board.state;
{
  positionIsLegal: true,
  FEN: '8/8/2k5/4q3/6K1/8/1R3R2/8 w - - 0 1',
  insufficientMaterial: false,
  result: null
}
```

### Create empty board and set it up

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board();
undefined
> board.setCurrentColor(chessstaff.pieces.Piece.BLACK);
{ success: true }
> var castleRights = new chessstaff.board.BoardInitialCastle('Kq');
undefined
> board.setCastleRights(castleRights);
{ success: true }
> board.setEnPassantSquare('c3');
{ success: true }
> board.setFiftyMovesRuleCounter(0);
{ success: true }
> board.setMovesCounter(34);
{ success: true }
> var initialPosition = new chessstaff.board.BoardInitialPosition('r3k3/8/6p1/8/2P5/8/8/4K2R');
undefined
> board.setPosition(initialPosition);
{ success: true }
> board.state;
{
  positionIsLegal: true,
  FEN: 'r3k3/8/6p1/8/2P5/8/8/4K2R b Kq c3 0 34',
  insufficientMaterial: false,
  result: null
}
```

### Create empty board and set position by pieces creation

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board();
undefined
> new chessstaff.pieces.King('white', board.squares.e3);
King {...}
> new chessstaff.pieces.King('black', board.squares.b5);
King {...}
> board.state;
{
  positionIsLegal: true,
  FEN: '8/8/8/1k6/8/4K3/8/8 w - - 0 1',
  insufficientMaterial: true,
  result: [ 0.5, 0.5 ]
}
```

> If position is setted by pieces creation you need to mark position as setted manualy to start make moves.

```javascript
> board.markPositionAsSetted();
{ success: true }
```

## 2. Move pieces

### Pieces movement

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board('8/8/5N2/8/6K1/1k6/3r4/8 b - - 0 1');
undefined
```

Move rook to d5

```javascript
> board.movePiece('d2', 'd5');
{
  positionIsLegal: true,
  FEN: '8/8/5N2/3r4/6K1/1k6/8/8 w - - 0 2',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
```

Try to make illegal move by knight

```javascript
> board.movePiece('f6', 'd4');
{
  positionIsLegal: true,
  FEN: '8/8/5N2/3r4/6K1/1k6/8/8 w - - 0 2',
  insufficientMaterial: false,
  result: null,
  description: 'Illegal move.',
  success: false,
  transformation: false
}
```

Take rook by knight

```javascript
> board.movePiece('f6', 'd5');
{
  positionIsLegal: true,
  FEN: '8/8/8/3N4/6K1/1k6/8/8 b - - 0 2',
  insufficientMaterial: true,
  result: [ 0.5, 0.5 ],
  description: 'Success!',
  success: true,
  transformation: false
}
```

### Castling

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board('4k2r/8/8/8/6b1/8/8/R3K3 b Qk - 0 1');
undefined
```

Black king short castle

```javascript
> board.movePiece('e8', 'g8');
{
  positionIsLegal: true,
  FEN: '5rk1/8/8/8/6b1/8/8/R3K3 w Q - 0 2',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}

```

Try to castle long by white king

```javascript
> board.movePiece('e1', 'c1');
{
  positionIsLegal: true,
  FEN: '5rk1/8/8/8/6b1/8/8/R3K3 w Q - 0 2',
  insufficientMaterial: false,
  result: null,
  description: 'Illegal move.',
  success: false,
  transformation: false
}
```

White king can't castle at that moment (d1 square is controlled by black bishop)

### Take pawn en passant

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board('4k3/p7/8/1P6/8/8/8/4K3 b - - 0 1');
undefined
> board.movePiece('a7', 'a5');
{
  positionIsLegal: true,
  FEN: '4k3/8/8/pP6/8/8/8/4K3 w - a6 0 2',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
> board.enPassantSquare.name.value;
'a6'
> board.movePiece('b5', 'a6');
{
  positionIsLegal: true,
  FEN: '4k3/8/P7/8/8/8/8/4K3 b - - 0 2',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
```

### Pawn transformation

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board('8/8/3k4/8/8/6K1/5p2/8 b - - 0 1');
undefined
> board.movePiece('f2', 'f1');
{
  positionIsLegal: true,
  FEN: '8/8/3k4/8/8/6K1/5p2/8 b - - 0 1',
  insufficientMaterial: false,
  result: null,
  description: 'Pawn is ready to transform on f1 square.',
  success: true,
  transformation: true
}
> board.transformation;
{ fromSquareName: 'f2', toSquareName: 'f1' }
> board.pawnTransformation('queen');
{
  positionIsLegal: true,
  FEN: '8/8/3k4/8/8/6K1/8/5q2 w - - 0 2',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
```

## 3. Full game example

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board(chessstaff.board.Board.INITIAL_FEN);
undefined
> board.movePiece('e2', 'e4');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
> board.movePiece('e7', 'e5');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
> board.movePiece('f1', 'c4');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
> board.movePiece('d7', 'd6');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/ppp2ppp/3p4/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 3',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
> board.movePiece('d1', 'f3');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/ppp2ppp/3p4/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 1 3',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
> board.movePiece('h7', 'h6');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/ppp2pp1/3p3p/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4',
  insufficientMaterial: false,
  result: null,
  description: 'Success!',
  success: true,
  transformation: false
}
> board.movePiece('f3', 'f7');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/ppp2Qp1/3p3p/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
  insufficientMaterial: false,
  result: [ 1, 0 ],
  description: 'Success!',
  success: true,
  transformation: false
}
```

## 4. Square information

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board('8/4K3/3B4/1k1pN3/8/5B2/4q3/8 b - - 0 1');
undefined
```

Square name

```javascript
> board.squares.d5.name.value
'd5'
> board.squares.d5.name.symbol
'd'
> board.squares.d5.name.number
'5'
```

Square coordinates

```javascript
> board.squares.d5.coordinates.value
[ 3, 4 ]
> board.squares.d5.coordinates.x
3
> board.squares.d5.coordinates.y
4
```

Square the same

```javascript
> board.squares.g6.theSame(board.squares.c1);
false
> board.squares.g6.theSame(board.squares.g6);
true
```

Square is light

```javascript
> board.squares.d4.isLight;
false
> board.squares.e4.isLight;
true
```

Square on vertical

```javascript

> board.squares.b7.onVertical('h');
false
> board.squares.b7.onVertical('b');
true
```

Square on rank

```javascript
> board.squares.f2.onRank('5');
false
> board.squares.f2.onRank('2');
true
```

Square on edge

```javascript
> board.squares.a1.onEdge.up
false
> board.squares.a1.onEdge.right
false
> board.squares.a1.onEdge.down
true
> board.squares.a1.onEdge.left
true
```

Square neighbors

```javascript
> board.squares.h7.neighbors.upLeft.name.value
'g8'
> board.squares.h7.neighbors.up.name.value
'h8'
> board.squares.h7.neighbors.upRight
null
> board.squares.h7.neighbors.right
null
> board.squares.h7.neighbors.downRight
null
> board.squares.h7.neighbors.down.name.value
'h6'
> board.squares.h7.neighbors.downLeft.name.value
'g6'
> board.squares.h7.neighbors.left.name.value
'g7'
```

Between squares

```javascript
> board.squares.a8.getBetweenSquaresNames(board.squares.h1);
[ 'b7', 'c6', 'd5', 'e4', 'f3', 'g2' ]
> board.squares.a8.getBetweenSquaresCount(board.squares.h1);
6
> board.squares.a8.getBetweenSquaresNames(board.squares.h1, true); // with start square
[ 'a8', 'b7', 'c6', 'd5', 'e4', 'f3', 'g2' ]
> board.squares.a8.getBetweenSquaresCount(board.squares.h1, true);
7
> board.squares.a8.getBetweenSquaresNames(board.squares.h1, false, true); // with end square
[ 'b7', 'c6', 'd5', 'e4', 'f3', 'g2', 'h1' ]
> board.squares.a8.getBetweenSquaresCount(board.squares.h1, false, true);
7
> board.squares.a8.getBetweenSquaresNames(board.squares.h1, true, true); // with start and end squares
[ 'a8', 'b7', 'c6', 'd5', 'e4', 'f3', 'g2', 'h1' ]
> board.squares.a8.getBetweenSquaresCount(board.squares.h1, true, true);
8
```

Square piece

```javascript
> board.squares.e2.piece;
<ref *1> Queen {...}
> board.squares.e2.piece.color;
'black'
> board.squares.e2.piece.kind;
'queen'
```

Square related pieces by piece action

```javascript
> var queen = board.squares.e2.piece;
undefined
> var bishop = board.squares.d6.piece;
undefined
>
>
> board.squares.e5.pieces.includes('move', queen);
false
> board.squares.e5.pieces.includes('move', bishop);
false
> board.squares.e5.pieces.move;
null
>
>
> board.squares.e5.pieces.includes('attack', queen);
true
> board.squares.e5.pieces.includes('attack', bishop);
false
> for (let piece of board.squares.e5.pieces.attack) {
... console.log(piece.color, piece.kind);
... }
black queen
undefined
>
>
> board.squares.e5.pieces.includes('cover', queen);
false
> board.squares.e5.pieces.includes('cover', bishop);
true
> for (let piece of board.squares.e5.pieces.cover) {
... console.log(piece.color, piece.kind);
... 
... }
white bishop
undefined
>
>
> board.squares.e5.pieces.includes('control', queen);
true
> board.squares.e5.pieces.includes('control', bishop);
true
> for (let piece of board.squares.e5.pieces.control) {
... console.log(piece.color, piece.kind);
... }
white bishop
black queen
undefined
>
>
> board.squares.e5.pieces.includes('xray', queen);
false
> board.squares.e5.pieces.includes('xray', bishop);
false
> board.squares.e5.pieces.xray
null
> 
>
>
>
> board.squares.c6.pieces.move;
null
> board.squares.c6.pieces.attack;
null
> board.squares.c6.pieces.cover;
null
> for (let piece of board.squares.c6.pieces.control) {
... console.log(piece.color, piece.kind);
... }
white knight
black king
undefined
> for (let piece of board.squares.c6.pieces.xray) {
... console.log(piece.color, piece.kind);
... }
white bishop
undefined
> 
>
>
>
> for (let piece of board.squares.c4.pieces.move) {
... console.log(piece.color, piece.kind);
... }
black queen
undefined
> board.squares.c4.pieces.attack;
null
> board.squares.c4.pieces.cover;
null
> for (let piece of board.squares.c4.pieces.control) {
... console.log(piece.color, piece.kind);
... }
black pawn
black queen
white knight
black king
undefined
> board.squares.c4.pieces.xray;
null
```

## 5. Piece information

```javascript
> const chessstaff = require('chessstaff');
undefined
> var board = new chessstaff.board.Board('7r/3k1pp1/2p1p3/3n4/3Q4/P7/1PP5/1K6 b - - 0 1');
undefined
> var queen = board.squares.d4.piece;
undefined
> queen.kind;
'queen'
> queen.color;
'white'
> queen.isLinear;
true
> queen.stuck; // piece has no move or attack squares
false
```

Check piece the same

```javascript
> queen.theSame(board.squares.d4.piece);
true
> queen.theSame(board.squares.d5.piece);
false
```

Check piece color

```javascript
> queen.sameColor(board.squares.b1.piece);
true
> queen.sameColor(board.squares.d7.piece);
false
> queen.hasColor('white');
true
> queen.hasColor('black');
false
```

Piece placement ability

```javascript
> queen.canBeReplacedTo(board.squares.d5);
true
> queen.canBeReplacedTo(board.squares.d6);
false
```

Piece related squares by piece action

```javascript
> queen.squares.includes('move', board.squares.c3);
true
> queen.squares.includes('move', board.squares.f3);
false
> for (let square of queen.squares.move) {
... console.log(square.name.value);
... }
c5
b6
a7
e5
f6
e3
f2
g1
c3
e4
f4
g4
h4
d3
d2
d1
c4
b4
a4
undefined
>
>
> queen.squares.includes('attack', board.squares.g7);
true
> queen.squares.includes('attack', board.squares.e2);
false
> for (let square of queen.squares.attack) {
... console.log(square.name.value);
... }
g7
d5
undefined
>
>
> queen.squares.includes('cover', board.squares.b2);
true
> queen.squares.includes('cover', board.squares.b3);
false
> for (let square of queen.squares.cover) {
... console.log(square.name.value);
... }
b2
undefined
>
>
> queen.squares.includes('control', board.squares.f4);
true
> queen.squares.includes('control', board.squares.g2);
false
> for (let square of queen.squares.control) {
... console.log(square.name.value);
... }
c5
b6
a7
e5
f6
g7
e3
f2
g1
c3
b2
d5
e4
f4
g4
h4
d3
d2
d1
c4
b4
a4
undefined
>
>
> queen.squares.includes('xray', board.squares.a1);
true
> queen.squares.includes('xray', board.squares.a2);
false
> for (let square of queen.squares.xray) {
... console.log(square.name.value);
... }
h8
a1
d6
d7
undefined
```

Pawn special

```javascript
> var whitePawn = board.squares.a3.piece;
undefined
> whitePawn.direction;
1
> whitePawn.onInitialRank;
false
> var blackPawn = board.squares.g7.piece;
undefined
> blackPawn.direction;
-1
> blackPawn.onInitialRank;
true
```

King castle

```javascript
> var board = new chessstaff.board.Board('r3k1r1/8/8/8/8/8/8/R1B1K2R w KQq - 0 1');
undefined
> board.kings.white.castle.short.isFree; // there is no pieces between king and rook
true
> board.kings.white.castle.short.isSafe; // king move to squares isn't controlled by opponents pieces
false
> board.kings.white.castle.short.isLegal; // free and safe
false
> board.kings.white.castle.long.isFree;
false
> board.kings.white.castle.long.isSafe;
true
> board.kings.white.castle.long.isLegal;
false
> board.kings.black.castle.long.isFree;
true
> board.kings.black.castle.long.isSafe;
true
> board.kings.black.castle.long.isLegal;
true
> board.kings.black.castle.short;
null
```

King checkers

```javascript
> var board = new chessstaff.board.Board('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
undefined
> board.kings.white.checkers.exist;
false
> board.kings.white.checkers.single;
false
> board.kings.white.checkers.several;
false
> board.kings.white.checkers.first;
null
> board.kings.white.checkers.second;
null
> board.kings.white.checkers.isLegal;
true
>
>
> var board = new chessstaff.board.Board('4k3/8/8/1B6/8/8/8/4K3 b - - 0 1');
undefined
> board.kings.black.checkers.exist;
true
> board.kings.white.checkers.single;
true
> board.kings.white.checkers.several;
false
> board.kings.black.checkers.first;
<ref *1> Bishop {...}
> board.kings.black.checkers.second;
null
> board.kings.black.checkers.isLegal;
true
>
>
> var board = new chessstaff.board.Board('4k3/4r3/8/8/8/5n2/8/4K3 w - - 0 1');
undefined
> board.kings.white.checkers.exist;
true
> board.kings.white.checkers.single;
false
> board.kings.white.checkers.several;
true
> board.kings.white.checkers.first;
<ref *1> Rook {...}
> board.kings.white.checkers.second;
<ref *1> Knight {...}
> board.kings.white.checkers.isLegal;
true
```
