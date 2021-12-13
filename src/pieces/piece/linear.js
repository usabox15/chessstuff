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


/** Base linear piece class. */
class LinearPiece extends Piece {

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
   * @param {Object[]} directions - Squares directions.
   * @param {integer} directions.x - X direction delta.
   * @param {integer} directions.y - Y direction delta.
   */
  _getLinearSquares(directions) {
    for (let direction of directions) {
      this._refreshSquareFinder();
      let x = this.square.coordinates.x + direction.x;
      let y = this.square.coordinates.y + direction.y;
      while (SquareCoordinates.correctCoordinates(x, y)) {
        this._nextSquareAction(this.board.squares.getFromCoordinates(x, y));
        if (this.endOfALine) break;
        x += direction.x;
        y += direction.y;
      }
    }
  }
}


export { LinearPiece };
