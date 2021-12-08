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


import { Square, SquareName } from '../square.js';


/** Board squares class. */
class BoardSquares {

  /**
   * Creation.
   * @param {Board} board - Board instance.
   */
  constructor(board) {
    this._items = [];
    for (let symbol of SquareName.symbols) {
      for (let number of SquareName.numbers) {
        let name = `${symbol}${number}`;
        let square = new Square(name, board);
        this[name] = square;
        this._items.push(square);
      }
    }
  }

  /**
   * Squares with placed pieces.
   * @return {Square[]} Squares.
   */
  get occupied() {
    return Object.fromEntries(
      Object.entries(this).filter(data => data[1].piece)
    );
  }

  /**
   * Get square by its coordinates.
   * @param {integer} x - X square coordinate.
   * @param {integer} y - Y square coordinate.
   */
  getFromCoordinates(x, y) {
    return this[Square.coordinatesToName(x, y)];
  }

  /**
   * Remove pieces from all squares.
   * @param {boolean} refresh - Whether need to refresh board or not.
   */
  removePieces(refresh) {
    for (let square of this._items) {
      square.removePiece(refresh);
    }
  }
}


export { BoardSquares };
