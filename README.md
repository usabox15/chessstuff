# Chess stuff

Chess utility to handle whole game or particular positions. Provides work with board, squares and pieces.


## Install

### Server

`$ npm install chessstuff`

### Client

1. Copy lib file (`chessstuff.min.js`).
2. Add to html file link to copied file.

> Now you can use `window.chessstuff` or just `chessstuff` object.


## Usage

```javascript
> const chessstuff = require('chessstuff'); // skip this line if you use client version
undefined
> chessstuff.board.Board.INITIAL_FEN;
'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
> var board = new chessstuff.board.Board(chessstuff.board.Board.INITIAL_FEN);
undefined
> board.movePiece('g2', 'g4');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/pppppppp/8/8/6P1/8/PPPPPP1P/RNBQKBNR b KQkq g3 0 1',
  insufficientMaterial: false,
  transformation: false,
  result: null,
  success: true,
  description: ''
}
> board.movePiece('e7', 'e5');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/8/PPPPPP1P/RNBQKBNR w KQkq e6 0 2',
  insufficientMaterial: false,
  transformation: false,
  result: null,
  success: true,
  description: ''
}
> board.movePiece('f2', 'f3');
{
  positionIsLegal: true,
  FEN: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2',
  insufficientMaterial: false,
  transformation: false,
  result: null,
  success: true,
  description: ''
}
> board.movePiece('d8', 'h4');
{
  positionIsLegal: true,
  FEN: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
  insufficientMaterial: false,
  transformation: false,
  result: [ 0, 1 ],
  success: true,
  description: ''
}
```

## Tutorial

[View tutorial](https://github.com/YegorDB/chessstuff/tree/master/tutorial)
