# Square information

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
