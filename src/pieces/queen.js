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
import { Bishop } from './bishop.js';
import { Rook } from './rook.js';


/** Queen class. */
class Queen extends LinearPiece {

  /**
   * Creation.
   *
   * Directions (actualy use Bishop and Rook directions)
   *    ___ ___ ___
   *   | A | B | C |
   *  1|___|___|___|
   *   | H |Que| D |
   *  0|___| en|___|
   *   | G | F | E |
   * -1|___|___|___|
   *     -1   0   1
   *
   * @param {string} color - Either white or black.
   * @param {Square} square - Square piece place to.
   * @param {boolean} [refresh=true] - Whether refresh board or not.
   */
  constructor(color, square, refresh=true) {
    super(color, square, Piece.QUEEN, refresh);
  }

  /** Get queen squares by piece action. */
  getSquares() {
    this._refreshSquares();
    this._getLinearSquares(Bishop.directions);
    this._getLinearSquares(Rook.directions);
  }
}


export { Queen };
