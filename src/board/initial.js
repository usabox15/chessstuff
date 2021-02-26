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
const { Square } = require('../square');


/**
 * Board initial position class.
 *
 * Scheme:
 * {
 *   color: [
 *     [pieceName, squareName],
 *     ...
 *   ],
 *   ...
 * }
 */
class BoardInitialPosition {

  static PIECES = {
    'P': [Piece.WHITE, Piece.PAWN],
    'N': [Piece.WHITE, Piece.KNIGHT],
    'B': [Piece.WHITE, Piece.BISHOP],
    'R': [Piece.WHITE, Piece.ROOK],
    'Q': [Piece.WHITE, Piece.QUEEN],
    'K': [Piece.WHITE, Piece.KING],
    'p': [Piece.BLACK, Piece.PAWN],
    'n': [Piece.BLACK, Piece.KNIGHT],
    'b': [Piece.BLACK, Piece.BISHOP],
    'r': [Piece.BLACK, Piece.ROOK],
    'q': [Piece.BLACK, Piece.QUEEN],
    'k': [Piece.BLACK, Piece.KING],
  };

  /**
   * Creation.
   * @param {string} data - FEN piece placement data.
   */
  constructor(data) {
    for (let color of Piece.ALL_COLORS) {
      this[color] = [];
    }
    this._rows = this._getRows(data);
    this._fillData();
  }

  /**
   * Get pieces data by board row.
   * @param {string} data - FEN piece placement data.
   * @return {string[]} Array of pieces data by board row.
   */
  _getRows(data) {
    return (
      data
      .replace(/\d/g, n => {return '0'.repeat(parseInt(n))})
      .split('/')
      .reverse()
    );
  }

  /** Fill data. */
  _fillData() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (this._rows[y][x] == '0') continue;
        let [color, pieceName] = BoardInitialPosition.PIECES[this._rows[y][x]];
        let squareName = Square.coordinatesToName(x, y);
        this[color].push([pieceName, squareName]);
      }
    }
  }
}


module.exports = {
  BoardInitialPosition: BoardInitialPosition,
};
