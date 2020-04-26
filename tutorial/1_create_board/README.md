# Create board

## Create board from FEN string

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

## Create empty board and set it up

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


## Create empty board and set position by pieces creation

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
