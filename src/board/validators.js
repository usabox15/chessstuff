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


/** En passant square placement validator. */
class BoardEnPassantSquareValidator {

  /**
   * Creation.
   * @param {Square} square - Board square.
   */
  constructor(square) {
    this.isLegal = !square || !square.piece && (
      square.onRank(3) && this._checkThirdRank(square)
    ||
      square.onRank(6) && this._checkSixthRank(square)
    );
  }

  /**
   * Check whether third rank square is en passant or not.
   * @param {Square} square - Board square.
   * @return {boolean} Check result.
   */
  _checkThirdRank(square) {
    return (
      !square.neighbors.down.piece
    &&
      square.neighbors.up.piece
    &&
      square.neighbors.up.piece.isPawn
    &&
      square.neighbors.up.piece.hasColor(Piece.WHITE)
    );
  }

  /**
   * Check whether sixth rank square is en passant or not.
   * @param {Square} square - Board square.
   * @return {boolean} Check result.
   */
  _checkSixthRank(square) {
    return (
      !square.neighbors.up.piece
    &&
      square.neighbors.down.piece
    &&
      square.neighbors.down.piece.isPawn
    &&
      square.neighbors.down.piece.hasColor(Piece.BLACK)
    );
  }
}


module.exports = {
  BoardEnPassantSquareValidator: BoardEnPassantSquareValidator,
};
