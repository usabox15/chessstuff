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


import { BoardTransformation, BoardKings, BoardResult } from './base.js';
import { BoardColors } from './colors.js';
import { MovesCounter, FiftyMovesRuleCounter } from './counters.js';
import { FENData, FENDataCreator } from './fen.js';
import { BoardInitialPosition, BoardInitialCastle, BoardInitial } from './initial.js';
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

  /**
   * Mark position as setted.
   * @return {Object} Action response.
   */
  _markPositionAsSetted() {
    this.refreshAllSquares();
    if (!this._positionIsLegal) {
      this._positionIsSetted = false;
      return this._responseFailAction("The position is illegal.");
    }
    this._positionIsSetted = true;
    return this._responseAction();
  }

  /**
   * Set position.
   * @param {BoardInitialPosition} positionData - Board position data.
   * @return {Object} Action response.
   */
  _setPosition(positionData) {
    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    if (!(positionData instanceof BoardInitialPosition)) {
      return this._responseFailAction("Position data has to be an instance of BoardInitialPosition.");
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
   * @return {Object} Action response.
   */
  _setCurrentColor(color) {
    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    try {
      this._colors.setCurrent(color);
    } catch (err) {
      return this._responseFailAction(err.message);
    }
    return this._responseAction();
  }

  /**
   * Set castle rights.
   * @param {BoardInitialCastle} castleRights - Board castle data.
   * @return {Object} Action response.
   */
  _setCastleRights(castleRights) {
    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    if (!(castleRights instanceof BoardInitialCastle)) {
      return this._responseFailAction("Setted data has to be an instance of BoardInitialCastle.");
    }
    this._initialCastleRights = castleRights;
    for (let king of this._kings) {
      king.setCastle(castleRights[king.color]);
    }
    return this._responseAction();
  }

  /** Rook castle move. */
  _rookCastleMove(castleRoad) {
    let rookFromSquareName = castleRoad.rook.square.name.value;
    let rookToSquareName = castleRoad.rookToSquare.name.value;
    this.movePiece(rookFromSquareName, rookToSquareName, false);
  }

  /**
   * Set en passant square.
   * @param {string} squareName - Square name.
   * @return {Object} Action response.
   */
  _setEnPassantSquare(squareName) {
    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    if (squareName) {
      let allSaquaresNames = Object.keys(this.squares);
      if (!allSaquaresNames.includes(squareName)) {
        return this._responseFailAction(`"${squareName}" is wrong square name. Try one of ${allSaquaresNames}.`);
      }
      this._enPassantSquare = this.squares[squareName];
    } else {
      this._enPassantSquare = null;
    }
    return this._responseAction();
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
      return this._responseFailAction(err.message);
    }
    return this._responseAction();
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

  /** Update counters. */
  _updateCounters() {
    this._fiftyMovesRuleCounter.update();
    if (this._colors.current == Piece.WHITE) {
      this._movesCounter.update();
    }
  }

  /** Roll position back to latest setted position. */
  _rollBack() {
    this._positionIsSetted = false;
    this._kings = new BoardKings;
    this._init(this._latestFEN);
  }

  /**
   * Handle move end.
   * @return {Object} Board response.
   */
  _moveEnd() {
    this.refreshAllSquares(true);
    if (!this._positionIsLegal) {
      this._rollBack();
      return this._responseFail("The position would be illegal after that.");
    }
    this._colors.changePriority();
    this._updateCounters();
    this._latestFEN = this.FEN;
    return this._response();
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
    return this._response();
  }

  /**
   * Refresh all squares.
   * @param {boolean} [afterMove=false] - whether refresh after move or not.
   * @return {Object} Board response.
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
    this._setResultIfNeeded();

    return this._response();
  }

  /** Set result if needed. */
  _setResultIfNeeded() {
    let oppColor = this._positionIsSetted ? this._colors.opponent : this._colors.current;
    let oppKing = this._kings[oppColor];
    if (!oppKing) return;
    if (this._checkFinalKingAttack(oppKing) || this._checkFinalKingDoubleAttack(oppKing)) {
      let firstPriority = this._positionIsSetted ? this._colors.firstPriority : this._colors.secondPriority;
      let secondPriority = this._positionIsSetted ? this._colors.secondPriority : this._colors.firstPriority;
      this._result.setValue(secondPriority, firstPriority);
    } else if (this.insufficientMaterial || this._checkPiecesHaveNoMoves(oppColor)) {
      this._result.setValue(0.5, 0.5);
    }
  }

  /**
   * Check whether there is final king attack or not.
   * @param {King} king - King.
   * @return {boolean} Check result.
   */
  _checkFinalKingAttack(king) {
    if (!king.checkers.single) return false;
    let checker = king.checkers.first;
    let betweenSquares = checker.isLinear ? checker.square.getBetweenSquaresNames(king.square) : [];
    for (let piece of this.allPieces.filter(p => p.sameColor(king))) {
      piece.getCheck(checker, betweenSquares);
      if (!piece.stuck) return false;
    }
    return true;
  }

  /**
   * Check whether there is final king double attack or not.
   * @param {King} king - King.
   * @return {boolean} Check result.
   */
  _checkFinalKingDoubleAttack(king) {
    if (!king.checkers.several) return false;
    for (let piece of this.allPieces.filter(p => p.sameColor(king) && !p.isKing)) {
      piece.getTotalImmobilize();
    }
    return king.stuck;
  }

  /**
   * Check whether particular color pieces have no moves or not.
   * @param {string} color - Pieces color.
   * @return {boolean} Check result.
   */
  _checkPiecesHaveNoMoves(color) {
    return this.allPieces.filter(p => p.hasColor(color) && !p.stuck).length == 0;
  }

  /**
   * Mark position as setted.
   * @return {Object} Board response.
   */
  markPositionAsSetted() {
    return this._responseByResult(this._markPositionAsSetted());
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

  /**
   * Pawn transformation.
   * @param {string} kind - Piece kind.
   * @return {Object} Board response.
   */
  pawnTransformation(kind) {
    if (!Piece.ALL_PAWN_TRANSFORM.includes(kind)) return this._responseFail("Wrong piece kind.");
    if (!this._positionIsSetted) return this._responseFail("The position isn't setted.");
    if (this._result.value) return this._responseFail("The result is already reached.");
    this._checkPositionIsLegal();
    if (!this._positionIsLegal) return this._responseFail("The position isn't legal.");
    if (!this._transformation.on) return this._responseFail("There isn't transformation.");

    this._placePiece(this._colors.current, kind, this._transformation.toSquareName);
    this._removePiece(this._transformation.fromSquareName);
    this._refreshState();
    this._fiftyMovesRuleCounter.switch();
    return this._moveEnd();
  }

  /**
   * Place piece.
   * @param {string} color - One of Piece.ALL_COLORS.
   * @param {string} kind - One of Piece.ALL_KINDS.
   * @param {string} squareName - Name of a square piece place to.
   * @return {Object} Board response.
   */
  placePiece(color, kind, squareName) {
    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    this._placePiece(color, kind, squareName);
    return this._response();
  }

  /**
   * Remove piece.
   * @param {string} squareName - Name of a square piece remove from.
   * @return {Object} Board response.
   */
  removePiece(squareName) {
    if (this._positionIsSetted) return this._responsePositionAlreadySetted();
    this._removePiece(squareName);
    return this._response();
  }

  /**
   * Move piece.
   * @param {string} from - From square name.
   * @param {string} to - To square name.
   * @param {boolean} refresh - Whether need to refresh board after piece has been placed or not.
   * @return {Object|undefined} Board response or undefined.
   */
  movePiece(from, to, refresh=true) {
    if (!this._positionIsSetted) return this._responseFail("The position isn't setted.");
    if (this._result.value) return this._responseFail("The result is already reached.");
    this._checkPositionIsLegal();
    if (!this._positionIsLegal) return this._responseFail("The position isn't legal.");

    let fromSquare = this._squares[from];
    let toSquare = this._squares[to];
    let piece = fromSquare.piece;

    if (!piece) return this._responseFail("There isn't a piece to replace.");
    if (!piece.hasColor(this._colors.current)) return this._responseFail("Wrong color piece.");
    if (!piece.canBeReplacedTo(toSquare)) return this._responseFail("Illegal move.");

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
        return this._response(`Pawn is ready to transform on ${to} square.`);
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
   * Response by result.
   * @param {Object} result - Action response.
   * @param {string} result.description - Result description.
   * @param {boolean} result.success - Whether result is successfull or not.
   * @return {Object} Board response.
   */
  _responseByResult(result) {
    return this._response(result.description, result.success);
  }

  /**
   * Response fail.
   * @param {string} description - Description.
   * @return {Object} Board response.
   */
  _responseFail(description) {
    return this._response(description, false);
  }

  /**
   * Response.
   * @param {string} [description=""] - Description.
   * @param {boolean} [success=true] - Whether responce is successfull or not.
   * @return {Object} Board response.
   */
  _response(description="", success=true) {
    return Object.assign(this.state, this._responseAction(description, success));
  }

  /**
   * Response position already setted.
   * @return {Object} Action response.
   */
  _responsePositionAlreadySetted() {
    this._responseFailAction("Position has been already setted.");
  }

  /**
   * Response fail action.
   * @param {string} description - Description.
   * @return {Object} Action response.
   */
  _responseFailAction(description) {
    return this._responseAction(description, false);
  }

  /**
   * Response action.
   * @param {string} [description=""] - Description.
   * @param {boolean} [success=true] - Whether responce is successfull or not.
   * @return {Object} Action response.
   */
  _responseAction(description="", success=true) {
    return {success: success, description: description};
  }
}


export {
  Board, BoardColors, BoardInitial, BoardInitialCastle, BoardInitialPosition,
  BoardSquares, FENData, FENDataCreator, FiftyMovesRuleCounter, MovesCounter,
};
