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


import { Piece, StepPiece } from './piece/main.js';


/** Knight class. */
class Knight extends StepPiece {

  /** Step points.
   *    ___ ___ ___ ___ ___
   *   |   | B |   | C |   |
   *  2|___|___|___|___|___|
   *   | A |   |   |   | D |
   *  1|___|___|___|___|___|
   *   |   |   |Kni|   |   |
   *  0|___|___|ght|___|___|
   *   | H |   |   |   | E |
   * -1|___|___|___|___|___|
   *   |   | G |   | F |   |
   * -2|___|___|___|___|___|
   *     -2  -1   0   1   2
   */
  static stepPoints = [
    {x: -2, y: 1},  // A
    {x: -1, y: 2},  // B
    {x: 1, y: 2},   // C
    {x: 2, y: 1},   // D
    {x: 2, y: -1},  // E
    {x: 1, y: -2},  // F
    {x: -1, y: -2}, // G
    {x: -2, y: -1}, // H
  ];

  /**
   * Creation.
   * @param {string} color - Either white or black.
   * @param {Square} square - Square piece place to.
   * @param {boolean} [refresh=true] - Whether refresh board or not.
   */
  constructor(color, square, refresh=true) {
    super(color, square, Piece.KNIGHT, refresh);
  }

  /**
   * Get knight squares by piece action.
   * @param {boolean} isActive - Whether piece is active or not.
   */
  getSquares(isActive) {
    this._refreshSquares();
    this._getStepSquares(Knight.stepPoints, isActive);
  }
}


export { Knight };
