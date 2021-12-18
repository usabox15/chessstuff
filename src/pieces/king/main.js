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


import { KingCastleRoad, KingCastleInitial, KingCastle } from './castle/main.js';
import { KingCheckers } from './checkers.js';
import { Piece, StepPiece } from '../piece/main.js';
import { Relation } from '../../relations.js';


/** King class. */
class King extends StepPiece {

  /*  Step points
   *    ___ ___ ___
   *   | A | B | C |
   *  1|___|___|___|
   *   | H |Ki | D |
   *  0|___| ng|___|
   *   | G | F | E |
   * -1|___|___|___|
   *     -1   0   1
   */
  static stepPoints = [
    {x: -1, y: 1},  // A
    {x: 0, y: 1},   // B
    {x: 1, y: 1},   // C
    {x: 1, y: 0},   // D
    {x: 1, y: -1},  // E
    {x: 0, y: -1},  // F
    {x: -1, y: -1}, // G
    {x: -1, y: 0},  // H
  ];

  static INITIAL_SQUARE_NAMES = {[Piece.WHITE]: "e1", [Piece.BLACK]: "e8"};

  /**
   * Creation.
   * @param {string} color - Either white or black.
   * @param {Square} square - Square piece place to.
   * @param {boolean} [refresh=true] - Whether refresh board or not.
   */
  constructor(color, square, refresh=true) {
    super(color, square, Piece.KING, refresh);
  }

  /**
   * Check whether kins is on initial square or not.
   * @return {boolean} Whether kins is on initial square or not.
   */
  get onInitialSquare() {
    return this.square.name.value == King.INITIAL_SQUARE_NAMES[this.color];
  }

  /** Remove squares controlled by enemy pieces. */
  _removeEnemyControlledSquares() {
    for (let kingAction of [Relation.MOVE, Relation.ATTACK]) {
      if (!this.squares[kingAction]) continue;
      let squaresToRemove = [];
      for (let square of this.squares[kingAction]) {
        if (square.pieces[Relation.CONTROL].filter(p => !this.sameColor(p)).length > 0) {
          squaresToRemove.push(square);
        }
      }
      for (let square of squaresToRemove) {
        this.squares.remove(kingAction, square);
      }
    }
  }

  /** Add castle moves. */
  _addCastleMoves() {
    for (let side of KingCastleRoad.ALL_SIDES) {
      if (this.castle[side] && this.castle[side].isLegal) {
        this.squares.add(Relation.MOVE, this.castle[side].toSquare);
      }
    }
  }

  /** Remove castle moves. */
  _removeCastleMoves() {
    for (let side of KingCastleRoad.ALL_SIDES) {
      if (this.castle[side]) {
        this.squares.remove(Relation.MOVE, this.castle[side].toSquare);
      }
    }
  }

  /** Set initial state. */
  setInitState() {
    if (this.checkers) {
      this.checkers.empty();
    } else {
      this.checkers = new KingCheckers(this);
    }
  }

  /** Get king squares by piece action. */
  getSquares() {
    this._refreshSquares();
    this._getStepSquares(King.stepPoints);
    this._removeEnemyControlledSquares();
    this._addCastleMoves();
  }

  /** Get check. */
  getCheck() {
    this._removeCastleMoves();
  }

  /**
   * Set king castle.
   * @param {KingCastleInitial} castleInitial - KingCastleInitial instance.
   */
  setCastle(castleInitial) {
    this.castle = new KingCastle(this, castleInitial);
  }
}


export { KingCastleRoad, KingCastleInitial, KingCastle, KingCheckers, King };
