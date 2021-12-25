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


import { Relation, PieceSquares } from '../../relations.js';


/** Base piece class. */
class Piece {

  static WHITE = 'white';
  static BLACK = 'black';
  static ALL_COLORS = [Piece.WHITE, Piece.BLACK];

  static PAWN = 'pawn';
  static KNIGHT = 'knight';
  static BISHOP = 'bishop';
  static ROOK = 'rook';
  static QUEEN = 'queen';
  static KING = 'king';
  static ALL_KINDS = [Piece.PAWN, Piece.KNIGHT, Piece.BISHOP, Piece.ROOK, Piece.QUEEN, Piece.KING];
  static ALL_LINEARS = [Piece.BISHOP, Piece.ROOK, Piece.QUEEN];
  static ALL_PAWN_TRANSFORM = [Piece.KNIGHT, Piece.BISHOP, Piece.ROOK, Piece.QUEEN];

  /**
   * Creation.
   * @param {string} color - Either white or black.
   * @param {Square} square - Square piece place to.
   * @param {string} [kind=null] - One of `Piece.ALL_KINDS`.
   * @param {boolean} [refresh=true] - Whether refresh board or not.
   */
  constructor(color, square, kind=null, refresh=true) {
    this.color = color;
    this.kind = kind;
    this._isLinear = Piece.ALL_LINEARS.includes(kind);
    this.squares = new PieceSquares(this);
    this._refreshSquareFinder();
    this.setInitState();
    this.getPlace(square, refresh);
  }

  get color() {
    return this._color;
  }

  /**
   * Set piece color.
   * @param {string} value - One of `Piece.ALL_COLORS`.
   */
  set color(value) {
    if (!Piece.ALL_COLORS.includes(value)) {
      throw Error(`'${value}' is wrong piece color value. Use any of Piece.ALL_COLORS.`);
    }
    this._color = value;
  }

  get stuck() {
    return !this.squares[Relation.MOVE] && !this.squares[Relation.ATTACK];
  }

  get kind() {
    return this._kind;
  }

  /**
   * Set piece kind.
   * @param {string} value - One of `Piece.ALL_KINDS`.
   */
  set kind(value) {
    if (value != null && !Piece.ALL_KINDS.includes(value)) {
      throw Error(`'${value}' is wrong piece kind value. Use any of Piece.ALL_KINDS.`);
    }
    this._kind = value;
  }

  get isLinear() {
    return this._isLinear;
  }

  get board() {
    return this.square.board;
  }

  get isPawn() {
    return this.kind == Piece.PAWN;
  }

  get isKnight() {
    return this.kind == Piece.KNIGHT;
  }

  get isBishop() {
    return this.kind == Piece.BISHOP;
  }

  get isRook() {
    return this.kind == Piece.ROOK;
  }

  get isQueen() {
    return this.kind == Piece.QUEEN;
  }

  get isKing() {
    return this.kind == Piece.KING;
  }

  /** Refresh piece squares data. */
  _refreshSquares() {
    this.squares.refresh();
    this._refreshSquareFinder();
  }

  /** Refresh square finder states. */
  _refreshSquareFinder() {}

  /**
   * Handle square actions.
   * @param {Square} square - Square instance.
   * @param {boolean} isActive - Whether piece is active or not.
   */
  _handleSquareActions(square, isActive) {
    if (square.piece) {
      this._handleSquareActionsWithPiece(square, isActive);
    } else {
      this._handleSquareActionsWithoutPiece(square, isActive);
    }
    this.squares.add(Relation.CONTROL, square);
  }

  /**
   * Handle square actions with piece.
   * @param {Square} square - Square instance.
   * @param {boolean} isActive - Whether piece is active or not.
   */
  _handleSquareActionsWithPiece(square, isActive) {
    if (this.sameColor(square.piece)) {
      if (!isActive) {
        this.squares.add(Relation.COVER, square);
      }
    } else {
      if (isActive) {
        this.squares.add(Relation.ATTACK, square);
      }
      if (square.piece.isKing) {
        this._handleSquareActionsAttackKing(square);
      }
    }
  }

  /**
   * Handle square actions attack king.
   * @param {Square} square - Square instance.
   */
  _handleSquareActionsAttackKing(square) {
    square.piece.checkers.add(this.square.piece);
  }

  /**
   * Handle square actions without piece.
   * @param {Square} square - Square instance.
   * @param {boolean} isActive - Whether piece is active or not.
   */
  _handleSquareActionsWithoutPiece(square, isActive) {
    if (isActive) {
      this.squares.add(Relation.MOVE, square);
    }
  }

  /**
   * Get piece squares by piece action.
   * @param {boolean} isActive - Whether piece is active or not.
   */
  getSquares(isActive) {}

  /** Set piece initial state. */
  setInitState() {
    this.binder = null;
  }

  /**
   * Place piece to square.
   * @param {Square} square - Square to place to.
   * @param {boolean} [refresh=true] - Whether refresh board or not.
   */
  getPlace(square, refresh=true) {
    this.square = square;
    square.placePiece(this, refresh);
  }

  /**
   * Check whether piece is the same with other piece or not.
   * @param {Piece} otherPiece - Other piece.
   * @return {boolean} Whether piece is the same with other piece or not.
   */
  theSame(otherPiece) {
    return this.square.theSame(otherPiece.square);
  }

  /**
   * Check whether piece has same color with other piece or not.
   * @param {Piece} otherPiece - Other piece.
   * @return {boolean} Whether piece has same color with other piece or not.
   */
  sameColor(otherPiece) {
    return this.color === otherPiece.color;
  }

  /**
   * Check whether piece has particular color or not.
   * @param {string} color - Either white or black.
   * @return {boolean} Whether piece has particular color or not.
   */
  hasColor(color) {
    return this.color === color;
  }

  /**
   * Check whether piece could be replaced to particular square or not.
   * @param {Square} square - Square instance.
   * @return {boolean} Whether piece could be replaced to particular square or not.
   */
  canBeReplacedTo(square) {
    return (
      !square.piece
      &&
      this.squares.includes(Relation.MOVE, square)
    ||
      !!square.piece
      &&
      !square.piece.isKing
      &&
      !this.sameColor(square.piece)
      &&
      this.squares.includes(Relation.ATTACK, square)
    );
  }

  /** Immobilize piece. */
  getTotalImmobilize() {
    for (let kind of [Relation.MOVE, Relation.ATTACK, Relation.COVER]) {
      this.squares.refresh(kind);
    }
  }

  /**
   * Bind piece.
   * @param {Square} kingSquare - King square.
   */
  getBind(kingSquare) {
    if (!this.binder) return;
    this.squares.refresh(Relation.XRAY);
    let betweenSquares = this.binder.square.getBetweenSquaresNames(kingSquare, true, true);
    for (let actonKind of [Relation.MOVE, Relation.ATTACK, Relation.COVER]) {
      this.squares.limit(actonKind, betweenSquares);
    }
  }

  /**
   * Change piece action abilities after its king was checked.
   * @param {Piece} checker - Checker piece.
   * @param {string[]} betweenSquaresNames - Names of squares between king and checker.
   */
  getCheck(checker, betweenSquaresNames) {
    this.squares.refresh(Relation.COVER);
    this.squares.refresh(Relation.XRAY);
    this.squares.limit(Relation.ATTACK, [checker.square.name.value]);
    this.squares.limit(Relation.MOVE, betweenSquaresNames);
  }
}


export { Piece };
