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


import { Piece, LinearPiece } from './base.js';


/** Bishop class. */
class Bishop extends LinearPiece {

  /*  Directions
   *    ___ ___ ___
   *   | A |   | B |
   *  1|___|___|___|
   *   |   |Bis|   |
   *  0|___|hop|___|
   *   | D |   | C |
   * -1|___|___|___|
   *     -1   0   1
   */
  static directions = [
    {x: -1, y: 1},  // A (upleft)
    {x: 1, y: 1},   // B (upright)
    {x: 1, y: -1},  // C (downright)
    {x: -1, y: -1}, // D (downleft)
  ];

  /**
   * Creation.
   * @param {string} color - Either white or black.
   * @param {Square} square - Square piece place to.
   * @param {boolean} [refresh=true] - Whether refresh board or not.
   */
  constructor(color, square, refresh=true) {
    super(color, square, Piece.BISHOP, refresh);
  }

  /** Get bishop squares by piece action. */
  getSquares() {
    this._refreshSquares();
    this._getLinearSquares(Bishop.directions);
  }
}


export { Bishop };
