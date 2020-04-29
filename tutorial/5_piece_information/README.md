# Piece information

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
