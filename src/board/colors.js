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


/** Board colors class. */
class BoardColors {

  #priorities = {
    [Piece.WHITE]: [0, 1],
    [Piece.BLACK]: [1, 0],
  }
  #all = [Piece.WHITE, Piece.BLACK];

  /**
   * Creation.
   * @param {string} currentColor - One of `Piece.ALL_COLORS`.
   */
  constructor(currentColor) {
    if (!Piece.ALL_COLORS.includes(currentColor)) {
      throw Error(`'${currentColor}' is wrong color value. Use any of Piece.ALL_COLORS.`);
    }
    this._priority = this.#priorities[currentColor];
  }

  /**
   * Current color.
   * @return {string} Color.
   */
  get current() {
    return this.#all[this._priority[0]];
  }

  /**
   * Opponent color.
   * @return {string} Color.
   */
  get opponent() {
    return this.#all[this._priority[1]];
  }

  /**
   * First color index.
   * @return {intger} Index.
   */
  get firstPriority() {
    return this._priority[0];
  }

  /**
   * Second color index.
   * @return {intger} Index.
   */
  get secondPriority() {
    return this._priority[1];
  }

  /** Change colors priority. */
  changePriority() {
    this._priority = [this._priority[1], this._priority[0]]
  }
}


module.exports = {
  BoardColors: BoardColors,
};
