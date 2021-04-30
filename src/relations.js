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


/**
 * Relation between pieces and squares by piece action.
 * @class
 */
class Relation {

  static MOVE = 'move';
  static ATTACK = 'attack';
  static XRAY = 'xray';
  static COVER = 'cover';     // protect piece
  static CONTROL = 'control'; // prevent opponent king move to
  static ALL_KINDS = [
    Relation.MOVE,
    Relation.ATTACK,
    Relation.XRAY,
    Relation.COVER,
    Relation.CONTROL
  ];

  /**
   * Creation.
   * @param {Object} target - Relation target (piece or square).
   * @param {string} relatedName - Related items attribute.
   */
  constructor(target, relatedName) {
    this._target = target;
    this._relatedName = relatedName;
    this.refresh();
  }

  /**
   * Check whether piece action kind is valid or not.
   * @param {string} kind - Piece action kind.
   * @param {string} except - Additional valid value.
   */
  _checkKind(kind, except=null) {
    if (!Relation.ALL_KINDS.includes(kind) && except != kind) {
      throw Error(`Wrong relation kind (${kind}) passed`);
    }
  }

  /**
   * Refersh action kind values.
   * @param {string} [kind="all"] - Piece action kind.
   */
  refresh(kind='all') {
    this._checkKind(kind, 'all');
    let kinds = kind === 'all' ? Relation.ALL_KINDS : [kind];
    for (let kind of kinds) {
      if (this[kind]) {
        for (let item of this[kind]) {
          item[this._relatedName].remove(kind, this._target, false);
        }
      }
      this[kind] = null;
    }
  }

  /**
   * Add action kind value.
   * @param {string} kind - Piece action kind.
   * @param {Object} item - Related item (piece/square).
   * @param {boolean} relate - Necessity to add target to relate action.
   */
  add(kind, item, relate=true) {
    this._checkKind(kind);
    if (this[kind]) {
      this[kind].push(item);
    } else {
      this[kind] = [item];
    }
    if (relate) {
      item[this._relatedName].add(kind, this._target, false);
    }
  }

  /**
   * Remove action kind value.
   * @param {string} kind - Piece action kind.
   * @param {Object} item - Related item (piece/square).
   * @param {boolean} relate - Necessity to add target to relate action.
   */
  remove(kind, item, relate=true) {
    this._checkKind(kind);
    if (this[kind]) {
      this[kind] = this[kind].filter(i => !i.theSame(item));
      if (this[kind].length == 0) {
        this[kind] = null;
      }
    }
    if (relate) {
      item[this._relatedName].remove(kind, this._target, false);
    }
  }

  /**
   * Check whether particular action kind includes item.
   * @param {string} kind - Piece action kind.
   * @param {Object} item - Related item (piece/square).
   * @return {boolean} Includes state.
   */
  includes(kind, item) {
    this._checkKind(kind);
    if (!this[kind]) return false;
    return this[kind].filter(i => i.theSame(item)).length != 0;
  }
}


/**
 * Relation between square and pieces by piece action.
 * @class
 */
class SquarePieces extends Relation {

  /**
   * Creation.
   * @param {Object} target - Relation target (square).
   */
  constructor(target) {
    super(target, 'squares');
  }
}


/**
 * Relation between piece and squares by piece action.
 * @class
 */
class PieceSquares extends Relation {

  /**
   * Creation.
   * @param {Object} target - Relation target (piece).
   */
  constructor(target) {
    super(target, 'pieces');
  }

  /**
   * Limit some kind of Piece actions squares by Array of accepted square names.
   * @param {string} kind - Piece action kind.
   * @param {string[]} acceptedNames - Accepted square names.
   */
  limit(kind, acceptedNames) {
    this._checkKind(kind);
    if (!this[kind]) return;
    for (let square of this[kind].filter(square => !acceptedNames.includes(square.name.value))) {
      square[this._relatedName].remove(kind, this._target, false);
    }
    this[kind] = this[kind].filter(square => acceptedNames.includes(square.name.value));
    if (this[kind].length == 0) {
      this[kind] = null;
    }
  }
}


module.exports = {
  Relation: Relation,
  SquarePieces: SquarePieces,
  PieceSquares: PieceSquares
};
