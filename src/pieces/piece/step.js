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


import { Piece } from './base.js';
import { SquareCoordinates } from '../../square.js';


/** Base step piece class. */
class StepPiece extends Piece {

  /**
   * Creation.
   * @param {string} color - Either white or black.
   * @param {Square} square - Square piece place to.
   * @param {string} kind - One of `Piece.ALL_KINDS`.
   * @param {boolean} [refresh=true] - Whether refresh board or not.
   */
  constructor(color, square, kind, refresh=true) {
    super(color, square, kind, refresh);
  }

  /**
   * Get step piece squares by piece action.
   * @param {Object[]} stepPoints - Squares points.
   * @param {integer} stepPoints.x - X square coordinate.
   * @param {integer} stepPoints.y - Y square coordinate.
   * @param {boolean} isActive - Whether piece is active or not.
   */
  _getStepSquares(stepPoints, isActive) {
    this._refreshSquareFinder();
    for (let stepPoint of stepPoints) {
      let x = this.square.coordinates.x + stepPoint.x;
      let y = this.square.coordinates.y + stepPoint.y;
      if (!SquareCoordinates.correctCoordinates(x, y)) continue;

      let square = this.board.squares.getFromCoordinates(x, y);
      this._handleSquareActions(square, isActive);
    }
  }
}


export { StepPiece };
