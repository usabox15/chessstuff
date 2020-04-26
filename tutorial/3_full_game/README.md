# Full game example

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
