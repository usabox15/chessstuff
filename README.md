# Chess staff

Chess utility to handle whole game or particular positions. Provides work with board, squares and pieces.

## Install

`npm install chessstaff`

## Brief view

```javascript
> const chessstaff = require('chessstaff');
undefined
> chessstaff.board.Board.INITIAL_FEN;
'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
> var board = new chessstaff.board.Board(chessstaff.board.Board.INITIAL_FEN);
undefined
> board.movePiece('g2', 'g4');
{ ... }
> board.movePiece('e7', 'e5');
{ ... }
> board.movePiece('f2', 'f3');
{ ... }
> board.movePiece('d8', 'h4');
{
  positionIsLegal: true,
  FEN: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
  insufficientMaterial: false,
  result: [ 0, 1 ],
  description: 'Success!',
  success: true,
  transformation: false
}
```

## Tutorial

[View tutorial](https://github.com/YegorDB/chessstaff/tree/master/tutorial)
