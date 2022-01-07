/*
Copyright 2020-2022 Yegor Bitensky

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


import { BoardTransformation, BoardKings } from './base.js';
import { BoardColors } from './colors.js';
import { MovesCounter, FiftyMovesRuleCounter } from './counters.js';
import { FENData, FENDataCreator } from './fen.js';
import { BoardInitialPosition, BoardInitialCastle, BoardInitial } from './initial.js';
import { BoardResponse } from './response.js';
import { BoardResult } from './result.js';
import { BoardSquares } from './squares.js';
import {
  BoardEnPassantSquareValidator, BoardPiecesCountValidator, BoardPawnsPlacementValidator,
  BoardKingPlacementValidator, BoardInsufficientMaterialPiecesValidator,
} from './validators.js';
import { Piece, Pawn, Knight, Bishop, Rook, Queen, King } from '../pieces/main.js';
import { Relation } from '../relations.js';


/** Chess board class. */
class Board {

  static EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';
  static INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  static PIECES_BOX = {
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
  constructor(FEN) {
    FEN = FEN || Board.EMPTY_FEN;

    this._response = new BoardResponse(this);
    this._squares = new BoardSquares(this);
    this._result = new BoardResult(this);
    this._transformation = new BoardTransformation;
    this._kings = new BoardKings;
    this._afterMove = false;
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

  get afterMove() {
    return this._afterMove;
  }

  get activeColor() {
    return (this._afterMove ? this._colors.opponent : this._colors.current);
  }

  get positionIsSetted() {
    return this._positionIsSetted;
  }

  get positionIsLegal() {
    return this._positionIsLegal;
  }

  get transformation() {
    return this._transformation;
  }

  get colors() {
    return this._colors;
  }

  get result() {
    return this._result;
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

  get insufficientMaterial() {
    return (
      this._positionIsLegal
    &&
      (new BoardInsufficientMaterialPiecesValidator(this)).isLegal
    );
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

  /**
   * Set current color.
   * @param {string} color - one of Piece.ALL_COLORS.
   * @return {Object} Board response.
   */
  setCurrentColor(color) {
    if (this._positionIsSetted) return this._response.positionAlreadySetted();
    try {
      this._setCurrentColor(color);
    } catch (err) {
      return this._response.fail(err.message);
    }
    return this._response.success();
  }

  /**
   * Set castle rights.
   * @param {BoardInitialCastle} castleRights - Board castle data.
   * @return {Object} Board response.
   */
  setCastleRights(castleRights) {
    if (this._positionIsSetted) return this._response.positionAlreadySetted();
    if (!(castleRights instanceof BoardInitialCastle)) {
      return this._response.fail(
        'Setted data has to be an instance of BoardInitialCastle.');
    }
    this._setCastleRights(castleRights);
    return this._response.success();
  }

  /**
   * Set en passant square.
   * @param {string} squareName - Square name.
   * @return {Object} Board response.
   */
  setEnPassantSquare(squareName) {
    if (this._positionIsSetted) return this._response.positionAlreadySetted();
    if (squareName) {
      let allSaquaresNames = Object.keys(this.squares);
      if (!allSaquaresNames.includes(squareName)) {
        return this._response.fail(
          `"${squareName}" is wrong square name. Try one of ${allSaquaresNames}.`);
      }
    }
    this._setEnPassantSquare(squareName);
    return this._response.success();
  }

  /**
   * Set fifty moves rule counter.
   * @param {integer} count - Fifty moves rule count.
   * @return {Object} Board response.
   */
  setFiftyMovesRuleCounter(count) {
    return this.setCounterValue(this._fiftyMovesRuleCounter, count);
  }

  /**
   * Set moves counter.
   * @param {integer} count - Moves count.
   * @return {Object} Board response.
   */
  setMovesCounter(count) {
    return this.setCounterValue(this._movesCounter, count);
  }

  /**
   * Set counter value.
   * @param {Object} counter - Counter instance.
   * @param {integer} count - Moves count.
   * @return {Object} Board response.
   */
  setCounterValue(counter, count) {
    if (this._positionIsSetted) return this._response.positionAlreadySetted();
    try {
      counter.value = count;
    } catch (err) {
      return this._response.fail(err.message);
    }
    return this._response.success();
  }

  /**
   * Set position.
   * @param {BoardInitialPosition} positionData - Board position data.
   * @return {Object} Board response.
   */
  setPosition(positionData) {
    if (this._positionIsSetted) {
      return this._response.positionAlreadySetted();
    }
    if (!(positionData instanceof BoardInitialPosition)) {
      return this._response.fail(
        'Position data has to be an instance of BoardInitialPosition.');
    }
    this._setPosition(positionData);
    return this.markPositionAsSetted();
  }

  /**
   * Mark position as setted.
   * @return {Object} Board response.
   */
  markPositionAsSetted() {
    this._markPositionAsSetted();
    if (!this._positionIsLegal) {
      return this._response.positionIsIllegal();
    }
    return this._response.success();
  }

  /**
   * Pawn transformation.
   * @param {string} kind - Piece kind.
   * @return {Object} Board response.
   */
  pawnTransformation(kind) {
    if (!Piece.ALL_PAWN_TRANSFORM.includes(kind)) {
      return this._response.fail('Wrong piece kind.');
    }
    if (!this._positionIsSetted) return this._response.positionNotSetted();
    if (this._result.value) return this._response.resultAlreadyReached();

    this._checkPositionIsLegal();

    if (!this._positionIsLegal) return this._response.positionIsIllegal();
    if (!this._transformation.on) {
      return this._response.fail('There isn\'t transformation.');
    }

    this._placePiece(this._colors.current, kind, this._transformation.toSquareName);
    this._removePiece(this._transformation.fromSquareName);
    this._refreshState();
    this._fiftyMovesRuleCounter.switch();
    return this._moveEnd();
  }

  /**
   * Place King.
   * @param {King} king - King instance.
   * @return {Object} Board response.
   */
  placeKing(king) {
    this._kings.setItem(king);
    if (this._initialCastleRights && this._initialCastleRights[king.color]) {
      king.setCastle(this._initialCastleRights[king.color]);
    }
    return this._response.success();
  }

  /**
   * Place piece.
   * @param {string} color - One of Piece.ALL_COLORS.
   * @param {string} kind - One of Piece.ALL_KINDS.
   * @param {string} squareName - Name of a square piece place to.
   * @return {Object} Board response.
   */
  placePiece(color, kind, squareName) {
    if (this._positionIsSetted) return this._response.positionAlreadySetted();
    this._placePiece(color, kind, squareName);
    return this._response.success();
  }

  /**
   * Remove piece.
   * @param {string} squareName - Name of a square piece remove from.
   * @return {Object} Board response.
   */
  removePiece(squareName) {
    if (this._positionIsSetted) return this._response.positionAlreadySetted();
    this._removePiece(squareName);
    return this._response.success();
  }

  /**
   * Move piece.
   * @param {string} from - From square name.
   * @param {string} to - To square name.
   * @param {boolean} refresh - Whether need to refresh board after piece has been placed or not.
   * @return {Object|undefined} Board response or undefined.
   */
  movePiece(from, to, refresh=true) {
    if (!this._positionIsSetted) return this._response.positionNotSetted();
    if (this._result.value) return this._response.resultAlreadyReached();
    this._checkPositionIsLegal();
    if (!this._positionIsLegal) return this._response.positionIsIllegal();

    let fromSquare = this._squares[from];
    let toSquare = this._squares[to];
    let piece = fromSquare.piece;

    if (!piece) return this._response.fail('There isn\'t a piece to replace.');
    if (!piece.hasColor(this._colors.current)) {
      return this._response.fail('Wrong color piece.');
    }
    if (!piece.canBeReplacedTo(toSquare)) {
      return this._response.fail('Illegal move.');
    }

    this._refreshState();
    if (piece.isKing) {
      let castleRoad = piece.castle.getRoad(toSquare);
      if (castleRoad) {
        this._rookCastleMove(castleRoad);
      }
      piece.castle.stop();
    } else if (piece.isRook) {
      if (piece.castleRoad) {
        this._kings[piece.color].castle.stop(piece.castleRoad.side);
      }
    } else if (piece.isPawn) {
      if (toSquare.onEdge.up || toSquare.onEdge.down) {
        this._transformation.setSquaresNames(from, to);
        return this._response.success({
          description: `Pawn is ready to transform on ${to} square.`
        });
      }
      this._handleEnPassant(fromSquare, toSquare, piece);
    }

    this._replacePiece(fromSquare, toSquare, piece, false);

    if (piece.isPawn || piece.squares.includes(Relation.ATTACK, toSquare)) {
      this._fiftyMovesRuleCounter.switch();
    }

    if (refresh) return this._moveEnd();
  }

  /**
   * Check position is legal.
   */
  _checkPositionIsLegal() {
    this._positionIsLegal = true;
    for (let color of Piece.ALL_COLORS) {
      let king = this._kings[color];
      this._positionIsLegal = (
        (new BoardPiecesCountValidator(this, color)).isLegal
      &&
        (new BoardKingPlacementValidator(king)).isLegal
      &&
        this._checkCheckersIsLegal(king)
      );
      if (!this._positionIsLegal) return;
    }
    this._positionIsLegal = (
      (new BoardPawnsPlacementValidator(this)).isLegal
    &&
      (new BoardEnPassantSquareValidator(this._enPassantSquare)).isLegal
    );
  }

  /**
   * Refresh all squares.
   * @return {Object} Board response.
   */
  refreshAllSquares() {
    let activeColor = this.activeColor;

    for (let piece of this.squares.allPieces) {
      piece.setInitState();
    }
    for (let piece of this.squares.pieces(p => !p.isKing)) {
      let isActive = piece.hasColor(activeColor);
      piece.getSquares(isActive);
    }
    for (let piece of this.squares.pieces(p => p.binder)) {
      piece.getBind(this._kings[piece.color].square);
    }
    for (let king of this._kings) {
      let isActive = king.hasColor(activeColor);
      king.getSquares(isActive);
    }

    this._checkPositionIsLegal();
    this._handleKingChecks(this._kings[activeColor]);
    this._result.trySetValue();

    return this._response.success();
  }

  /**
   * Handle king checks.
   * @param {King} king - King.
   */
  _handleKingChecks(king) {
    if (!king || !king.checkers.exist || !king.checkers.isLegal) return;

    if (king.checkers.single) {
      let checker = king.checkers.first;
      let betweenSquares = [];
      if (checker.isLinear) {
        betweenSquares = checker.square.getBetweenSquaresNames(king.square);
      }
      let pieces = this.squares.pieces(p => p.sameColor(king));
      for (let piece of pieces) {
        piece.getCheck(checker, betweenSquares);
      }
    } else {
      let pieces = this.squares.pieces(p => p.sameColor(king) && !p.isKing);
      for (let piece of pieces) {
        piece.getTotalImmobilize();
      }
    }
  }

  /**
   * Check king checkers is legal.
   * @param {King} king - King.
   * @return {boolean} Whether king checkers legal or not.
   */
  _checkCheckersIsLegal(king) {
    return king.checkers.isLegal && (!king.checkers.exist || king.hasColor(this.activeColor));
  }

  /** Refresh state. */
  _refreshState() {
    this._transformation.refreshSquareNames();
    this._enPassantSquare = null;
  }

  /**
   * Handle en passant case.
   * @param {Square} fromSquare - Square that pawn jump from.
   * @param {Square} toSquare - Square that pawn jump to.
   * @param {Pawn} pawn - Pawn that jumped through one square.
   */
  _handleEnPassant(fromSquare, toSquare, pawn) {
    if (toSquare.getBetweenSquaresCount(fromSquare) == 1) {
      // jump through one square
      this._enPassantSquare = this._squares.getFromCoordinates(
        toSquare.coordinates.x,
        toSquare.coordinates.y - pawn.direction
      );
    } else if (pawn.squares.includes(Relation.ATTACK, toSquare) && !toSquare.piece) {
      // catch other pawn en passant
      let x = toSquare.coordinates.x;
      let y = fromSquare.coordinates.y;
      this._removePiece(this._squares.getFromCoordinates(x, y).name.value);
    }
  }

  /**
   * Place piece.
   * @param {string} color - Piece color (one of Piece.ALL_COLORS).
   * @param {string} kind - Piece kind (one of Piece.ALL_KINDS).
   * @param {string} squareName - Name of a square piece place to.
   */
  _placePiece(color, kind, squareName) {
    new Board.PIECES_BOX[kind](color, this._squares[squareName], false);
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

  /** Rook castle move. */
  _rookCastleMove(castleRoad) {
    let rookFromSquareName = castleRoad.rook.square.name.value;
    let rookToSquareName = castleRoad.rookToSquare.name.value;
    this.movePiece(rookFromSquareName, rookToSquareName, false);
  }

  /**
   * Handle move end.
   * @return {Object} Board response.
   */
  _moveEnd() {
    this._afterMove = true;
    this.refreshAllSquares();
    if (!this._positionIsLegal) {
      this._rollBack();
      return this._response.fail('Illegal position has been prevented.');
    }
    this._colors.changePriority();
    this._updateCounters();
    this._latestFEN = this.FEN;
    this._afterMove = false;
    return this._response.success();
  }

  /** Roll position back to latest setted position. */
  _rollBack() {
    this._positionIsSetted = false;
    this._kings = new BoardKings;
    this._init(this._latestFEN);
  }

  /** Update counters. */
  _updateCounters() {
    this._fiftyMovesRuleCounter.update();
    if (this._colors.current == Piece.WHITE) {
      this._movesCounter.update();
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
    this._markPositionAsSetted();
  }

  /**
   * Set current color.
   * @param {string} color - one of Piece.ALL_COLORS.
   */
  _setCurrentColor(color) {
    this._colors.setCurrent(color);
  }

  /**
   * Set castle rights.
   * @param {BoardInitialCastle} castleRights - Board castle data.
   */
  _setCastleRights(castleRights) {
    this._initialCastleRights = castleRights;
    for (let king of this._kings) {
      king.setCastle(castleRights[king.color]);
    }
  }

  /**
   * Set en passant square.
   * @param {string} squareName - Square name.
   */
  _setEnPassantSquare(squareName) {
    if (squareName) {
      this._enPassantSquare = this.squares[squareName];
    } else {
      this._enPassantSquare = null;
    }
  }

  /**
   * Set fifty moves rule counter.
   * @param {integer} count - Fifty moves rule count.
   */
  _setFiftyMovesRuleCounter(count) {
    this._setCounterValue(this._fiftyMovesRuleCounter, count);
  }

  /**
   * Set moves counter.
   * @param {integer} count - Moves count.
   */
  _setMovesCounter(count) {
    this._setCounterValue(this._movesCounter, count);
  }

  /**
   * Set counter value.
   * @param {Object} counter - Counter instance.
   * @param {integer} count - Moves count.
   */
  _setCounterValue(counter, count) {
    counter.value = count;
  }

  /**
   * Set position.
   * @param {BoardInitialPosition} positionData - Board position data.
   */
  _setPosition(positionData) {
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
  }

  /**
   * Mark position as setted.
   */
  _markPositionAsSetted() {
    this.refreshAllSquares();
    this._positionIsSetted = this._positionIsLegal;
    this._result.trySetValue();
  }
}


export {
  Board, BoardColors, BoardInitial, BoardInitialCastle, BoardInitialPosition,
  BoardSquares, FENData, FENDataCreator, FiftyMovesRuleCounter, MovesCounter,
};
