/*
Copyright 2020-2021 Yegor Bitensky

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


const { BoardTransformation, BoardKings, BoardResult } = require('./base');
const { BoardColors } = require('./colors');
const { MovesCounter, FiftyMovesRuleCounter } = require('./counters');
const { FENData, FENDataCreator } = require('./fen');
const { BoardInitialPosition, BoardInitialCastle, BoardInitial } = require('./initial');
const { BoardSquares } = require('./squares');
const {
  BoardEnPassantSquareValidator, BoardPiecesCountValidator, BoardPawnsPlacementValidator,
  BoardKingPlacementValidator, BoardInsufficientMaterialPiecesValidator,
} = require('./validators');
const { Piece, Pawn, Knight, Bishop, Rook, Queen, King } = require('../pieces/main');
const { Relation } = require('../relations');


/** Chess board class. */
class Board {

  static EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';
  static INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  #piecesBox = {
    [Piece.PAWN]: Pawn,
    [Piece.KNIGHT]: Knight,
    [Piece.BISHOP]: Bishop,
    [Piece.ROOK]: Rook,
    [Piece.QUEEN]: Queen,
    [Piece.KING]: King,
  };

  /**
   * Creation.
   * @param {string} [FEN=Board.EMPTY_FEN] - FEN data string.
   */
  constructor(FEN=Board.EMPTY_FEN) {
    this._squares = new BoardSquares(this);
    this._result = new BoardResult;
    this._transformation = new BoardTransformation;
    this._kings = new BoardKings;
    this._positionIsLegal = false;
    this._positionIsSetted = false;
    this._colors = new BoardColors;
    this._initialCastleRights = null;
    this._enPassantSquare = null;
    this._fiftyMovesRuleCounter = new FiftyMovesRuleCounter;
    this._movesCounter = new MovesCounter;
    this._latestFEN = FEN;
    this._init(FEN);
  }

  get squares() {
    return this._squares;
  }

  get positionIsSetted() {
    return this._positionIsSetted;
  }

  get transformation() {
    return this._transformation;
  }

  get colors() {
    return this._colors;
  }

  get kings() {
    return this._kings;
  }

  get enPassantSquare() {
    return this._enPassantSquare;
  }

  get fiftyMovesRuleCounter() {
    return this._fiftyMovesRuleCounter;
  }

  get movesCounter() {
    return this._movesCounter;
  }

  get FEN() {
    return (new FENDataCreator(this)).value;
  }

  get allPieces() {
    return Object.values(this._squares.occupied).map(s => s.piece);
  }

  get insufficientMaterial() {
    return this._positionIsLegal && (new BoardInsufficientMaterialPiecesValidator(this.allPieces)).isLegal;
  }

  get state() {
    return {
      positionIsLegal: this._positionIsLegal,
      FEN: this.FEN,
      insufficientMaterial: this.insufficientMaterial,
      transformation: this._transformation.on,
      result: this._result.value
    }
  }

  /** Initialize. */
  _init(FEN) {
    let initialData = new BoardInitial(new FENData(FEN));
    this._setCurrentColor(initialData.currentColor);
    this._setCastleRights(initialData.castleRights);
    this._setEnPassantSquare(initialData.enPassantSquareName);
    this._setFiftyMovesRuleCounter(initialData.fiftyMovesRuleCounter);
    this._setMovesCounter(initialData.movesCounter);
    this._setPosition(initialData.position);
  }

  /** Refresh state. */
  _refreshState() {
    this._transformation.refreshSquareNames();
    this._enPassantSquare = null;
  }

  /**
   * Check king checkers is legal.
   * @param {King} king - King.
   * @param {boolean} afterMove - Whether check after move or not.
   * @return {boolean} Whether king checkers legal or not.
   */
  _checkCheckersIsLegal(king, afterMove) {
    return king.checkers.isLegal && (!king.checkers.exist || king.hasColor(
      afterMove ? this._colors.opponent : this._colors.current
    ));
  }

  /**
   * Check position is legal.
   * @param {boolean} [afterMove=false] - Whether check after move or not.
   */
  _checkPositionIsLegal(afterMove=false) {
    this._positionIsLegal = true;
    let allPieces = this.allPieces;
    for (let color of Piece.ALL_COLORS) {
      let king = this._kings[color];
      this._positionIsLegal = (
        (new BoardPiecesCountValidator(allPieces, color)).isLegal
      &&
        (new BoardKingPlacementValidator(king)).isLegal
      &&
        this._checkCheckersIsLegal(king, afterMove)
      );
      if (!this._positionIsLegal) return;
    }
    this._positionIsLegal = (
      (new BoardPawnsPlacementValidator(allPieces)).isLegal
    &&
      (new BoardEnPassantSquareValidator(this._enPassantSquare)).isLegal
    );
  }

  /**
   * Place piece.
   * @param {string} color - Piece color (one of Piece.ALL_COLORS).
   * @param {string} kind - Piece kind (one of Piece.ALL_KINDS).
   * @param {string} squareName - Name of a square piece place to.
   */
  _placePiece(color, kind, squareName) {
    new this.#piecesBox[kind](color, this._squares[squareName], false);
  }

  /**
   * Remove piece.
   * @param {string} squareName - Name of a square piece place to.
   */
  _removePiece(squareName) {
    this._squares[squareName].removePiece(false);
  }

  /**
   * Replace piece.
   * @param {string} fromSquareName - Name of a square piece replacing from.
   * @param {string} toSquareName - Name of a square piece replacing to.
   * @param {Piece} piece - Piece instance.
   * @param {boolean} [refresh=true] - Whether need to refresh board or not.
   */
  _replacePiece(fromSquare, toSquare, piece, refresh=true) {
    fromSquare.removePiece(false);
    piece.getPlace(toSquare, refresh);
  }

  /** Mark position as setted. */
  _markPositionAsSetted() {
    this.refreshAllSquares();
    if (!this._positionIsLegal) {
      this._positionIsSetted = false;
      return {
        success: false,
        description: "The position is illegal."
      };
    }
    this._positionIsSetted = true;
    return {success: true};
  }

  _responsePositionAlreadySetted() {
    return {
      success: false,
      description: "Position has been already setted."
    };
  }

  /**
   * Set position.
   * @param {BoardInitialPosition} positionData - Board position data.
   */
  _setPosition(positionData) {
    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    if (!(positionData instanceof BoardInitialPosition)) {
      return {
        success: false,
        description: "Position data has to be an instance of BoardInitialPosition."
      };
    }
    this.squares.removePieces(false);
    for (let color of Piece.ALL_COLORS) {
      let piecesData = positionData[color];
      for (let [pieceName, squareName] of piecesData.filter(d => d[0] != Piece.KING)) {
        this._placePiece(color, pieceName, squareName);
      }
      for (let [pieceName, squareName] of piecesData.filter(d => d[0] == Piece.KING)) {
        this._placePiece(color, pieceName, squareName);
      }
    }
    return this._markPositionAsSetted();
  }

  /**
   * Set current color.
   * @param {string} color - one of Piece.ALL_COLORS.
   */
  _setCurrentColor(color) {
    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    try {
      this._colors.setCurrent(color);
    } catch (err) {
      return {success: false, description: err.message};
    }
    return {success: true};
  }

  _setCastleRights(castleRights) {
    /*
    Params:
      castleRights {BoardInitialCastle}.
    */

    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    if (!castleRights instanceof BoardInitialCastle) {
      return {
        success: false,
        description: "Setted data has to be an instance of BoardInitialCastle."
      };
    }
    this._initialCastleRights = castleRights;
    for (let king of this._kings) {
      king.setCastle(castleRights[king.color]);
    }
    return {success: true};
  }

  _setEnPassantSquare(squareName) {
    /*
    Params:
      squareName {string}.
    */

    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    if (squareName) {
      let allSaquaresNames = Object.keys(this.squares);
      if (!allSaquaresNames.includes(squareName)) {
        return {
          success: false,
          description: `"${squareName}" is wrong square name. Try one of ${allSaquaresNames}.`
        };
      }
      this._enPassantSquare = this.squares[squareName];
    } else {
      this._enPassantSquare = null;
    }
    return {success: true};
  }

  /**
   * Set counter value.
   * @param {Object} counter - Counter instance.
   * @param {integer} count - Moves count.
   * @return {Object} Action response.
   */
  _setCounterValue(counter, count) {
    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    try {
      counter.value = count;
    } catch (err) {
      return {success: false, description: err.message};
    }
    return {success: true};
  }

  /**
   * Set fifty moves rule counter.
   * @param {integer} count - Fifty moves rule count.
   * @return {Object} Action response.
   */
  _setFiftyMovesRuleCounter(count) {
    return this._setCounterValue(this._fiftyMovesRuleCounter, count);
  }

  /**
   * Set moves counter.
   * @param {integer} count - Moves count.
   * @return {Object} Action response.
   */
  _setMovesCounter(count) {
    return this._setCounterValue(this._movesCounter, count);
  }

  _enPassantMatter(fromSquare, toSquare, pawn) {
    /*
    En passant cases handler.
    Params:
      fromSquare {Square};
      toSquare {Square};
      pawn {Pawn}.
    */

    // jump through one square
    if (toSquare.getBetweenSquaresCount(fromSquare) == 1) {
      this._enPassantSquare = this._squares.getFromCoordinates(
        toSquare.coordinates.x,
        toSquare.coordinates.y - pawn.direction
      );
    }
    // catch other pawn en passant
    else if (pawn.squares.includes(Relation.ATTACK, toSquare) && !toSquare.piece) {
      let x = toSquare.coordinates.x;
      let y = fromSquare.coordinates.y;
      this._removePiece(this._squares.getFromCoordinates(x, y).name.value);
    }
  }

  _rookCastleMove(castleRoad) {
    /*
    Params:
      castleRoad {KingCastleRoad}.
    */

    let rookFromSquareName = castleRoad.rook.square.name.value;
    let rookToSquareName = castleRoad.rookToSquare.name.value;
    this.movePiece(rookFromSquareName, rookToSquareName, false);
  }

  _rollBack() {
    // Roll position back to latest setted position

    this._positionIsSetted = false;
    this._kings = new BoardKings;
    this._init(this._latestFEN);
  }

  _updateCounters() {
    this._fiftyMovesRuleCounter.update();
    if (this._colors.current == Piece.WHITE) {
      this._movesCounter.update();
    }
  }

  _moveEnd() {
    this.refreshAllSquares(true);
    if (!this._positionIsLegal) {
      this._rollBack();
      return this._response("The position would be illegal after that.", false);
    }
    this._colors.changePriority();
    this._updateCounters();
    this._latestFEN = this.FEN;
    return this._response();
  }

  /**
   * Response.
   * @param {string} [description=""] - Description.
   * @param {boolean} [success=true] - Whether responce is successfull or not.
   */
  _response(description="", success=true) {
    return Object.assign(this.state, {
      description: description,
      success: success,
    });
  }

  /**
   * Place King.
   * @param {King} king - King instance.
   */
  placeKing(king) {
    this._kings.setItem(king);
    if (this._initialCastleRights && this._initialCastleRights[king.color]) {
      king.setCastle(this._initialCastleRights[king.color]);
    }
    return this._response();
  }

  /**
   * Refresh all squares.
   * @param {boolean} [afterMove=false] - whether refresh after move or not.
   * @return {Object} Response.
   */
  refreshAllSquares(afterMove=false) {
    for (let piece of this.allPieces) {
      piece.setInitState();
    }
    for (let piece of this.allPieces.filter(p => !p.isKing)) {
      piece.getSquares();
    }
    for (let piece of this.allPieces.filter(p => p.binder)) {
      piece.getBind(this._kings[piece.color].square);
    }
    for (let piece of this.allPieces.filter(p => p.isKing)) {
      piece.getSquares();
    }

    this._checkPositionIsLegal(afterMove);

    let oppColor;
    let firstPriority;
    let secondPriority;
    if (this._positionIsSetted) {
      oppColor = this._colors.opponent;
      firstPriority = this._colors.firstPriority;
      secondPriority = this._colors.secondPriority;
    } else {
      oppColor = this._colors.current;
      firstPriority = this._colors.secondPriority;
      secondPriority = this._colors.firstPriority;
    }

    let oppKing = this._kings[oppColor];
    if (oppKing) {
      if (oppKing.checkers.single) {
        let noMoves = true;
        let checker = oppKing.checkers.first;
        let betweenSquares = checker.isLinear ? checker.square.getBetweenSquaresNames(oppKing.square) : [];
        for (let piece of this.allPieces.filter(p => p.sameColor(oppKing))) {
          piece.getCheck(checker, betweenSquares);
          if (!piece.stuck) noMoves = false;
        }
        if (noMoves) this._result.setValue(secondPriority, firstPriority);
      }
      else if (oppKing.checkers.several) {
        for (let piece of this.allPieces.filter(p => p.sameColor(oppKing) && !p.isKing)) {
          piece.getTotalImmobilize();
        }
        if (oppKing.stuck) this._result.setValue(secondPriority, firstPriority);
      }
      else if (this.insufficientMaterial) {
        this._result.setValue(0.5, 0.5);
      }
      else {
        let noMoves = true;
        for (let piece of this.allPieces.filter(p => p.sameColor(oppKing))) {
          if (!piece.stuck) {
            noMoves = false;
            break;
          }
        }
        if (noMoves) this._result.setValue(0.5, 0.5);
      }
    }

    return this._response();
  }

  /**
   * Response by result.
   * @param {Object} result - Result to response with.
   * @param {string} [result.description=''] - Result description.
   * @param {boolean} result.success - Whether result is successfull or not.
   * @return {Object} Board response.
   */
  _responseByResult(result) {
    return this._response(result.description || '', result.success);
  }

  /**
   * Mark position as setted.
   * @return {Object} Board response.
   */
  markPositionAsSetted() {
    return this._responseByResult(this._markPositionAsSetted());
  }

  placePiece(color, kind, squareName) {
    /*
    Params:
      color {string} one of Piece.ALL_COLORS;
      kind {string} one of Piece.ALL_KINDS;
      squareName {string}.
    */

    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    this._placePiece(color, kind, squareName);
    return this._response();
  }

  removePiece(squareName) {
    /*
    Params:
      squareName {string}.
    */

    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    this._removePiece(squareName);
    return this._response();
  }

  /**
   * Set position.
   * @param {BoardInitialPosition} positionData - Board position data.
   * @return {Object} Board response.
   */
  setPosition(positionData) {
    return this._responseByResult(this._setPosition(positionData));
  }

  /**
   * Set current color.
   * @param {string} color - one of Piece.ALL_COLORS.
   * @return {Object} Board response.
   */
  setCurrentColor(color) {
    return this._responseByResult(this._setCurrentColor(color));
  }

  /**
   * Set castle rights.
   * @param {BoardInitialCastle} castleRights - Board castle rights.
   * @return {Object} Board response.
   */
  setCastleRights(castleRights) {
    return this._responseByResult(this._setCastleRights(castleRights));
  }

  /**
   * Set en passant square.
   * @param {string} squareName - En passant square name.
   * @return {Object} Board response.
   */
  setEnPassantSquare(squareName) {
    return this._responseByResult(this._setEnPassantSquare(squareName));
  }

  /**
   * Set fifty moves rule counter.
   * @param {integer} count - Fifty moves rule count.
   * @return {Object} Board response.
   */
  setFiftyMovesRuleCounter(count) {
    return this._responseByResult(this._setFiftyMovesRuleCounter(count));
  }

  /**
   * Set moves counter.
   * @param {integer} count - Moves count.
   * @return {Object} Board response.
   */
  setMovesCounter(count) {
    return this._responseByResult(this._setMovesCounter(count));
  }

  pawnTransformation(kind) {
    /*
    Params:
      kind {string} one of Piece.ALL_KINDS.
    */

    if (!this._positionIsSetted) return this._response("The position isn't setted.", false);
    if (this._result.value) return this._response("The result is already reached.", false);
    this._checkPositionIsLegal();
    if (!this._positionIsLegal) return this._response("The position isn't legal.", false);
    if (!this._transformation.on) return this._response("There isn't transformation.", false);

    this._placePiece(this._colors.current, kind, this._transformation.toSquareName);
    this._removePiece(this._transformation.fromSquareName);
    this._refreshState();
    this._fiftyMovesRuleCounter.switch();
    return this._moveEnd();
  }

  movePiece(from, to, refresh=true) {
    /*
    Params:
      from {string} from square name;
      to {string} to square name;
      refresh {boolean} - whether need to refresh board after piece has been placed or not.
    */

    if (!this._positionIsSetted) return this._response("The position isn't setted.", false);
    if (this._result.value) return this._response("The result is already reached.", false);
    this._checkPositionIsLegal();
    if (!this._positionIsLegal) return this._response("The position isn't legal.", false);

    let fromSquare = this._squares[from];
    let toSquare = this._squares[to];
    let piece = fromSquare.piece;

    if (!piece) return this._response("There isn't a piece to replace.", false);
    if (!piece.hasColor(this._colors.current)) return this._response("Wrong color piece.", false);
    if (!piece.canBeReplacedTo(toSquare)) return this._response("Illegal move.", false);

    this._refreshState();
    if (piece.isKing) {
      let castleRoad = piece.castle.getRoad(toSquare);
      if (castleRoad) {
        this._rookCastleMove(castleRoad);
      }
      piece.castle.stop();
    }
    else if (piece.isRook) {
      if (piece.castleRoad) {
        this._kings[piece.color].castle.stop(piece.castleRoad.side);
      }
    }
    else if (piece.isPawn) {
      if (toSquare.onEdge.up || toSquare.onEdge.down) {
        this._transformation.setSquaresNames(from, to);
        return this._response(`Pawn is ready to transform on ${to} square.`);
      }
      this._enPassantMatter(fromSquare, toSquare, piece);
    }

    this._replacePiece(fromSquare, toSquare, piece, false);

    if (piece.isPawn || piece.squares.includes(Relation.ATTACK, toSquare)) {
      this._fiftyMovesRuleCounter.switch();
    }

    if (refresh) return this._moveEnd();
  }
}


module.exports = {
  Board: Board,
  BoardColors: BoardColors,
  BoardInitial,
  BoardInitialCastle: BoardInitialCastle,
  BoardInitialPosition: BoardInitialPosition,
  BoardSquares: BoardSquares,
  FENData: FENData,
  FENDataCreator: FENDataCreator,
  FiftyMovesRuleCounter: FiftyMovesRuleCounter,
  MovesCounter: MovesCounter
};
