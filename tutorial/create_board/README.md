# Create board

There are three variants:
1. [Create board from FEN string](#create-board-from-fen-string)
2. [Create empty board and set it manually up](#create-empty-board-and-set-it-manually-up)
3. [Create empty board and set position by manually pieces creation](#create-empty-board-and-set-position-by-manually-pieces-creation)


## Create board from FEN string

```javascript
> var board = new chessstuff.Board('8/8/2k5/4q3/6K1/8/1R3R2/8 w - - 0 1');
undefined
> board.state;
{
  positionIsLegal: true,
  FEN: '8/8/2k5/4q3/6K1/8/1R3R2/8 w - - 0 1',
  insufficientMaterial: false,
  transformation: false,
  result: null
}
```


## Create empty board and set it manually up

```javascript
> var board = new chessstuff.Board();
undefined
> board.setCurrentColor(chessstuff.Piece.BLACK);
{ success: true }
> var castleRights = new chessstuff.BoardInitialCastle('Kq');
undefined
> board.setCastleRights(castleRights);
{ success: true }
> board.setEnPassantSquare('c3');
{ success: true }
> board.setFiftyMovesRuleCounter(0);
{ success: true }
> board.setMovesCounter(34);
{ success: true }
> var initialPosition = new chessstuff.BoardInitialPosition('r3k3/8/6p1/8/2P5/8/8/4K2R');
undefined
> board.setPosition(initialPosition);
{ success: true }
> board.state;
{
  positionIsLegal: true,
  FEN: 'r3k3/8/6p1/8/2P5/8/8/4K2R b Kq c3 0 34',
  insufficientMaterial: false,
  transformation: false,
  result: null
}
```


## Create empty board and set position by manually pieces creation

> If position is setted by pieces creation you need to mark position as setted manually to start make moves or to get position result if so.

```javascript
> var board = new chessstuff.Board();
undefined
> new chessstuff.King(chessstuff.Piece.WHITE, board.squares.e3);
King {...}
> new chessstuff.King(chessstuff.Piece.BLACK, board.squares.b5);
King {...}
> board.state;
{
  positionIsLegal: true,
  FEN: '8/8/8/1k6/8/4K3/8/8 w - - 0 1',
  insufficientMaterial: true,
  transformation: false,
  result: null
}
> board.markPositionAsSetted();
{ success: true }
> board.state;
{
  positionIsLegal: true,
  FEN: '8/8/8/1k6/8/4K3/8/8 w - - 0 1',
  insufficientMaterial: true,
  transformation: false,
  result: [ 0.5, 0.5 ]
}
```
