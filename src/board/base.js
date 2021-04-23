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


const { Piece, King } = require('../pieces/main');


/** Board transformation class. */
class BoardTransformation {

  /** Creation. */
  constructor() {
    this.refreshSquareNames();
  }

  /**
   * Transformation from square name.
   * @return {string|null} Square name or null.
   */
  get fromSquareName() {
    return this._fromSquareName;
  }

  /**
   * Transformation to square name.
   * @return {string|null} Square name or null.
   */
  get toSquareName() {
    return this._toSquareName;
  }

  /**
   * Get whether transformation enable or not.
   * @return {boolean} Whether transformation enable or not.
   */
  get on() {
    return this.fromSquareName !== null && this.toSquareName !== null;
  }

  /**
   * Set squares.
   * @param {string} fromSquareName - Transformation from square.
   * @param {string} toSquareName - Transformation to square.
   */
  setSquaresNames(fromSquareName, toSquareName) {
    this._fromSquareName = fromSquareName;
    this._toSquareName = toSquareName;
  }

  /** Refresh squares. */
  refreshSquareNames() {
    this._fromSquareName = null;
    this._toSquareName = null;
  }
}


/** Board kings class. */
class BoardKings {

  /** Creation. */
  constructor() {
    for (let color of Piece.ALL_COLORS) {
      this[color] = null;
    }
  }

  /**
   * Items iterator.
   * @yield {King} King instance.
   */
  *[Symbol.iterator]() {
    for (let color of Piece.ALL_COLORS) {
      if (!this[color]) continue;
      yield this[color];
    }
  }

  /**
   * Set item.
   * @param {King} king - King instance.
   */
  setItem(king) {
    if (!(king instanceof King)) {
      throw Error('King instance expected.');
    }
    if (this[king.color]) {
      throw Error(`${king.color} king is already exists.`);
    }
    this[king.color] = king;
  }
}


/** Board result class. */
class BoardResult {

  static VALUES_CHOICES = [0, 0.5, 1];

  /** Creation. */
  constructor() {
    this._value = null;
  }

  /**
   * Value.
   * @return {null|float[]|integer[]} Value.
   */
  get value() {
    return this._value;
  }

  /**
   * Set value.
   * @param {float|integer} whitePoints - White side points.
   * @param {float|integer} blackPoints - Black side points.
   */
  setValue(whitePoints, blackPoints) {
    if (!BoardResult.VALUES_CHOICES.includes(whitePoints) || !BoardResult.VALUES_CHOICES.includes(blackPoints)) {
      throw Error(`Wrong points value. Try one of ${BoardResult.VALUES_CHOICES}.`);
    }
    this._value = [whitePoints, blackPoints];
  }
}


module.exports = {
  BoardTransformation: BoardTransformation,
  BoardKings: BoardKings,
  BoardResult: BoardResult,
};
