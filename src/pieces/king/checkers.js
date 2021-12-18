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


import { Relation } from '../../relations.js';


/** King checkers class. */
class KingCheckers extends Array {

  /**
   * Creation.
   * @param {King} king - King instance.
   */
  constructor(king) {
    super();
    this._king = king;
  }

  /**
   * First king checker.
   * @return {Piece} Checker piece.
   */
  get first() {
    return this.length > 0 ? this[0] : null;
  }

  /**
   * Second king checker.
   * @return {Piece} Checker piece.
   */
  get second() {
    return this.length == 2 ? this[1] : null;
  }

  /**
   * Check whether king checkers exist or not.
   * @return {boolean} Whether king checkers exist or not.
   */
  get exist() {
    return this.length > 0;
  }

  /**
   * Check whether king checker is single or not.
   * @return {boolean} Whether king checker is single or not.
   */
  get single() {
    return this.length == 1;
  }

  /**
   * Check whether king checkers are several or not.
   * @return {boolean} Whether king checkers are several or not.
   */
  get several() {
    return this.length == 2;
  }

  /**
   * Check legality.
   * @return {boolean} Legality.
   */
  get isLegal() {
    return !this.exist || this._isPiecesLegal() && (this.single || this.several && this._isSeveralLegal());
  }

  /** Remove all items. */
  empty() {
    this.splice(0, this.length);
  }

  /**
   * Check whether king checkers pieces are legal or not.
   * @return {boolean} Whether king checkers pieces are legal or not.
   */
  _isPiecesLegal() {
    return (
      this.filter(p => p.isKing).length == 0
    &&
      this.filter(p => !p.squares.includes(Relation.CONTROL, this._king.square)).length == 0
    );
  }

  /**
   * Check legality of a discover check that cause a double check.
   * @param {Piece} discoverer - Piece that discover attack.
   * @param {Piece} discoveredAttacker - Piece that attack by discover.
   * @return {boolean} Legality.
   */
  _isDiscoverLegal(discoverer, discoveredAttacker) {
    if (!discoveredAttacker.isLinear) return false;
    let discoveredAttackSquaresNames = discoveredAttacker.square.getBetweenSquaresNames(this._king.square);
    for (let squareName of discoveredAttackSquaresNames) {
      let square = this._king.board.squares[squareName];
      if (!square.piece && discoverer.squares.includes(Relation.CONTROL, square)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check whether several king checkers pieces are legal or not.
   * @return {boolean} Whether several king checkers pieces are legal or not.
   */
  _isSeveralLegal() {
    return this._isDiscoverLegal(this.first, this.second) || this._isDiscoverLegal(this.second, this.first);
  }

  /**
   * Add piece to king checkers.
   * @param {Piece} piece - King checker piece.
   */
  add(piece) {
    this.push(piece);
  }
}


export { KingCheckers };
