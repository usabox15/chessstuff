# Move pieces

## Pieces movement

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

## Castling

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

## Take pawn en passant

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

## Pawn transformation

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
