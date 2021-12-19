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


import { Piece, LinearPiece } from './piece/main.js';


/** Rook class. */
class Rook extends LinearPiece {

  /*  Directions
   *    ___ ___ ___
   *   |   | A |   |
   *  1|___|___|___|
   *   | D |Ro | B |
   *  0|___| ok|___|
   *   |   | C |   |
   * -1|___|___|___|
   *     -1   0   1
   */
  static directions = [
    {x: 0, y: 1},  // A (up)
    {x: 1, y: 0},  // B (right)
    {x: 0, y: -1}, // C (down)
    {x: -1, y: 0}, // D (left)
  ];

  /**
   * Creation.
   * @param {string} color - Either white or black.
   * @param {Square} square - Square piece place to.
   * @param {boolean} [refresh=true] - Whether refresh board or not.
   */
  constructor(color, square, refresh=true) {
    super(color, square, Piece.ROOK, refresh);
  }

  /** Rook castle road. */
  get castleRoad() {
    if (!this.hasOwnProperty('_castleRoad')) return null;
    return this._castleRoad;
  }

  /**
   * Get rook squares by piece action.
   * @param {boolean} isActive - Whether piece is active or not.
   */
  getSquares(isActive) {
    this._refreshSquares();
    this._getLinearSquares(Rook.directions, isActive);
  }

  /**
   * Set castle road.
   * @param {KingCastleRoad} castleRoad - Castle road.
   */
  setCastleRoad(castleRoad) {
    this._castleRoad = castleRoad;
  }

  /** Remove castle road. */
  removeCastleRoad() {
    this._castleRoad = null;
  }
}


export { Rook };
