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


import { Relation } from '../../../relations.js';


/** King castle road class. */
class KingCastleRoad {
  static SHORT = 'short';
  static LONG = 'long';
  static ALL_SIDES = [KingCastleRoad.SHORT, KingCastleRoad.LONG];
  static toSquaresSigns = {[KingCastleRoad.SHORT]: 'g', [KingCastleRoad.LONG]: 'c'};
  static rookToSquaresSigns = {[KingCastleRoad.SHORT]: 'f', [KingCastleRoad.LONG]: 'd'};
  static rookSquaresSigns = {[KingCastleRoad.SHORT]: 'h', [KingCastleRoad.LONG]: 'a'};
  static freeSigns = {[KingCastleRoad.SHORT]: ['f', 'g'], [KingCastleRoad.LONG]: ['b', 'c', 'd']};
  static safeSigns = {[KingCastleRoad.SHORT]: ['f', 'g'], [KingCastleRoad.LONG]: ['c', 'd']};

  /**
   * Creation.
   * @param {KingCastle} castle - King castle instance.
   * @param {integer|string} rank - Either first or eight rank.
   * @param {string} side - One of `KingCastleRoad.ALL_SIDES`.
   */
  constructor(castle, rank, side) {
    this._castle = castle;
    this._rank = rank;
    this._side = side;
    let kingToSquareName = `${KingCastleRoad.toSquaresSigns[side]}${this._rank}`;
    this._toSquare = castle.king.board.squares[kingToSquareName];
    let rookToSquareName = `${KingCastleRoad.rookToSquaresSigns[side]}${this._rank}`;
    this._rookToSquare = castle.king.board.squares[rookToSquareName];
    let rookSquareName = `${KingCastleRoad.rookSquaresSigns[side]}${this._rank}`;
    this._rook = castle.king.board.squares[rookSquareName].piece;
    this._checkRook();
    this._rook.setCastleRoad(this);
    this._needToBeFreeSquares = [];
    this._needToBeSafeSquares = [];
    this._fill();
  }

  /**
   * Square king move to.
   * @return {Square} Square instance.
   */
  get toSquare() {
    return this._toSquare;
  }

  /**
   * Square rook move to.
   * @return {Square} Square instance.
   */
  get rookToSquare() {
    return this._rookToSquare;
  }

  /**
   * Castle road rook.
   * @return {Rook} Rook instance.
   */
  get rook() {
    return this._rook;
  }

  /**
   * Castle side.
   * @return {string} One of `KingCastleRoad.ALL_SIDES`.
   */
  get side() {
    return this._side;
  }

  /**
   * Check whether castle road is free or not.
   * @return {boolean} Whether castle road is free or not.
   */
  get isFree() {
    return this._needToBeFreeSquares.filter(square => square.piece).length == 0;
  }

  /**
   * Check whether castle road is safe or not.
   * @return {boolean} Whether castle road is safe or not.
   */
  get isSafe() {
    for (let square of this._needToBeSafeSquares) {
      let controlledByOppositeColorPeace = (
        square.pieces[Relation.CONTROL] &&
        square.pieces[Relation.CONTROL].filter(p => !p.hasColor(this._castle.king.color)).length > 0
      )
      if (controlledByOppositeColorPeace) return false;
    }
    return true;
  }

  /**
   * Check whether castle road is legal or not.
   * @return {boolean} Whether castle road is legal or not.
   */
  get isLegal() {
    return this.isFree && this.isSafe;
  }

  /** Check castle road rook. */
  _checkRook() {
    if (!this._rook || !this._rook.isRook || !this._castle.king.sameColor(this._rook)) {
      throw Error(`Fail to assign rook to ${this._castle.king.color} king ${this._side} castle road.`);
    }
  }

  /** Fill squares data. */
  _fill() {
    let data = [
      [this._needToBeFreeSquares, KingCastleRoad.freeSigns[this._side]],
      [this._needToBeSafeSquares, KingCastleRoad.safeSigns[this._side]]
    ];
    for (let [target, signs] of data) {
      for (let sign of signs) {
        target.push(this._castle.king.board.squares[`${sign}${this._rank}`]);
      }
    }
  }
}


export { KingCastleRoad };
