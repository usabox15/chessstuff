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


import { Piece } from './piece/main.js';
import { Relation } from '../relations.js';


/** Pawn class. */
class Pawn extends Piece {

  static DIRECTIONS = {[Piece.WHITE]: 1, [Piece.BLACK]: -1};
  static INITIAL_RANKS = {[Piece.WHITE]: "2", [Piece.BLACK]: "7"};

  /**
   * Creation.
   * @param {string} color - Either white or black.
   * @param {Square} square - Square piece place to.
   * @param {boolean} [refresh=true] - Whether refresh board or not.
   */
  constructor(color, square, refresh=true) {
    if (square.onEdge.up || square.onEdge.down) {
      throw Error(`Pawn couldn't be placed on ${square.name.value} square.`);
    }
    super(color, square, Piece.PAWN, refresh);
  }

  get direction() {
    return Pawn.DIRECTIONS[this.color];
  }

  get onInitialRank() {
    return this.square.onRank(Pawn.INITIAL_RANKS[this.color]);
  }

  /** Get pawn squares by piece action. */
  getSquares() {
    this._refreshSquares();
    this._getMoveSquares();
    this._getAttackSquares();
  }

  /** Get pawn move squares. */
  _getMoveSquares() {
    for (let [x, y] of this._getMoveCoordinates()) {
      let square = this.board.squares.getFromCoordinates(x, y);
      if (square.piece) break;
      this.squares.add(Relation.MOVE, square);
    }
  }

  /**
   * Get pawn move coords.
   * @return {integer[][]} Move coords.
   */
  _getMoveCoordinates() {
    let moveSquaresCoordinates = [];
    moveSquaresCoordinates.push([
      this.square.coordinates.x,
      this.square.coordinates.y + 1 * this.direction
    ]);
    if (this.onInitialRank) {
      moveSquaresCoordinates.push([
        this.square.coordinates.x,
        this.square.coordinates.y + 2 * this.direction
      ]);
    }
    return moveSquaresCoordinates;
  }

  /** Get pawn attack squares. */
  _getAttackSquares() {
    for (let [x, y] of this._getAttackCoordinates()) {
      let square = this.board.squares.getFromCoordinates(x, y);
      this.squares.add(Relation.CONTROL, square);
      if (square.piece) {
        if (this.sameColor(square.piece)) {
          this.squares.add(Relation.COVER, square);
        }
        else {
          this.squares.add(Relation.ATTACK, square);
          if (square.piece.isKing) {
            square.piece.checkers.add(this.square.piece);
          }
        }
      } else if (this._checkEnPassantSquare(square)) {
        this.squares.add(Relation.ATTACK, square);
        this.squares.add(Relation.MOVE, square);
      }
    }
  }

  /**
   * Get pawn attack coords.
   * @return {integer[][]} Attack coords.
   */
  _getAttackCoordinates() {
    let attackSquaresCoordinates = [];
    if (!this.square.onEdge.right) {
      attackSquaresCoordinates.push([
        this.square.coordinates.x + 1,
        this.square.coordinates.y + 1 * this.direction
      ]);
    }
    if (!this.square.onEdge.left) {
      attackSquaresCoordinates.push([
        this.square.coordinates.x - 1,
        this.square.coordinates.y + 1 * this.direction
      ]);
    }
    return attackSquaresCoordinates;
  }

  /**
   * Check whether square is en passant square or not.
   * @param {Square} square - Square to check.
   * @return {boolean} Whether square is en passant square or not.
   */
  _checkEnPassantSquare(square) {
    return (
      this.board.enPassantSquare
    &&
      square.theSame(this.board.enPassantSquare)
    &&
      !this.hasColor(this.board.colors.current)
    );
  }
}


export { Pawn };
