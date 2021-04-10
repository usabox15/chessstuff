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


const { Piece } = require('../pieces/main');
const { Relation } = require('../relations');

/** En passant square placement validator. */
class BoardEnPassantSquareValidator {

  /**
   * Creation.
   * @param {Square} square - Board square.
   */
  constructor(square) {
    this._square = square;
    this.isLegal = !square || !square.piece && (
      square.onRank(3) && this._checkThirdRank()
    ||
      square.onRank(6) && this._checkSixthRank()
    );
  }

  /**
   * Check whether third rank square is en passant or not.
   * @return {boolean} Check result.
   */
  _checkThirdRank() {
    return (
      !this._square.neighbors.down.piece
    &&
      this._square.neighbors.up.piece
    &&
      this._square.neighbors.up.piece.isPawn
    &&
      this._square.neighbors.up.piece.hasColor(Piece.WHITE)
    );
  }

  /**
   * Check whether sixth rank square is en passant or not.
   * @return {boolean} Check result.
   */
  _checkSixthRank() {
    return (
      !this._square.neighbors.up.piece
    &&
      this._square.neighbors.down.piece
    &&
      this._square.neighbors.down.piece.isPawn
    &&
      this._square.neighbors.down.piece.hasColor(Piece.BLACK)
    );
  }
}


/** Pieces count validator. */
class BoardPiecesCountValidator {

  /**
   * Creation.
   * @param {Piece[]} pieces - Board pieces.
   * @param {string} color - Pieces color.
   */
  constructor(pieces, color) {
    this._pieces = pieces;
    this._color = color;
    this.isLegal = (
      this._checkKingsCount()
    &&
      this._checkQueensCount()
    &&
      this._checkRooksCount()
    &&
      this._checkBishopsCount()
    &&
      this._checkKnightsCount()
    &&
      this._checkPawnsCount()
    );
  }

  /** Check kings count. */
  _checkKingsCount() {
    return this._pieces.filter(p => p.isKing && p.hasColor(this._color)).length == 1;
  }

  /** Check queens count. */
  _checkQueensCount() {
    return this._pieces.filter(p => p.isQueen && p.hasColor(this._color)).length <= 9;
  }

  /** Check rooks count. */
  _checkRooksCount() {
    return this._pieces.filter(p => p.isRook && p.hasColor(this._color)).length <= 10;
  }

  /** Check bishops count. */
  _checkBishopsCount() {
    return this._pieces.filter(p => p.isBishop && p.hasColor(this._color)).length <= 10;
  }

  /** Check knights count. */
  _checkKnightsCount() {
    return this._pieces.filter(p => p.isKnight && p.hasColor(this._color)).length <= 10;
  }

  /** Check pawns count. */
  _checkPawnsCount() {
    return this._pieces.filter(p => p.isPawn && p.hasColor(this._color)).length <= 8;
  }
}


/** Pawns placement validator. */
class BoardPawnsPlacementValidator {

  /**
   * Creation.
   * @param {Piece[]} pieces - Board pieces.
   */
  constructor(pieces) {
    this.isLegal = pieces.filter(p => p.isPawn && (p.square.onEdge.up || p.square.onEdge.down)).length == 0;
  }
}


/** King placement validator. */
class BoardKingPlacementValidator {

 /**
   * Creation.
   * @param {King} king - King piece.
   */
  constructor(king) {
    this.isLegal = (
      !king.squares[Relation.ATTACK]
    ||
      king.squares[Relation.ATTACK].filter(s => s.piece.isKing).length == 0
    );
  }
}


module.exports = {
  BoardEnPassantSquareValidator: BoardEnPassantSquareValidator,
  BoardPiecesCountValidator: BoardPiecesCountValidator,
  BoardPawnsPlacementValidator: BoardPawnsPlacementValidator,
  BoardKingPlacementValidator: BoardKingPlacementValidator,
};
