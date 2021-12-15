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


import { Piece } from '../pieces/main.js';


/** Board colors class. */
class BoardColors {

  static PRIORITIES = {
    [Piece.WHITE]: [0, 1],
    [Piece.BLACK]: [1, 0],
  };
  static ALL = [Piece.WHITE, Piece.BLACK];

  /** Creation. */
  constructor() {
    this._priority = null;
  }

  /**
   * First color index.
   * @return {intger} Index.
   */
  get firstPriority() {
    this._checkWasSetted();
    return this._priority[0];
  }

  /**
   * Second color index.
   * @return {intger} Index.
   */
  get secondPriority() {
    this._checkWasSetted();
    return this._priority[1];
  }

  /**
   * Current color.
   * @return {string} Color.
   */
  get current() {
    return BoardColors.ALL[this.firstPriority];
  }

  /**
   * Opponent color.
   * @return {string|null} Color.
   */
  get opponent() {
    return BoardColors.ALL[this.secondPriority];
  }

  /** Check whether color was setted or not. */
  _checkWasSetted() {
    if (!this._priority) {
      throw Error('Board color wasn\'t setted.');
    }
  }

  /**
   * Set current.
   * @param {string} color - One of `Piece.ALL_COLORS`.
   */
  setCurrent(color) {
    if (!Piece.ALL_COLORS.includes(color)) {
      throw Error(`'${color}' is wrong color value. Use any of ${Piece.ALL_COLORS}.`);
    }
    this._priority = BoardColors.PRIORITIES[color];
  }

  /** Change colors priority. */
  changePriority() {
    this._priority = [this.secondPriority, this.firstPriority];
  }
}


export { BoardColors };
