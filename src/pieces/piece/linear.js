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
import { Relation } from '../../relations.js';
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

  /** Refresh square finder states. */
  _refreshSquareFinder() {
    this.sqrBeforeXray = null; // square before xray (always occupied by piece)
    this.xrayControl = false; // control square behind checked king (inline of piece attack)
    this.endOfALine = false;
  }

  /**
   * Handle square actions.
   * @param {Square} square - Square instance.
   */
  _handleSquareActions(square) {
    if (this.sqrBeforeXray) {
      this.squares.add(Relation.XRAY, square);
      if (this.xrayControl) {
        this.squares.add(Relation.CONTROL, square);
        this.xrayControl = false;
      }
      if (square.piece) {
        let isOppKingSquare = square.piece.isKing && !this.sameColor(square.piece);
        let isOppPieceBeforeXray = !this.sameColor(this.sqrBeforeXray.piece);
        if (isOppKingSquare && isOppPieceBeforeXray) {
          this.sqrBeforeXray.piece.binder = this;
        }
        this.endOfALine = true;
      }
    } else {
      super._handleSquareActions(square);
    }
  }

  /**
   * Handle square actions with piece.
   * @param {Square} square - Square instance.
   */
  _handleSquareActionsWithPiece(square) {
    super._handleSquareActionsWithPiece(square);
    this.sqrBeforeXray = square;
  }

  /**
   * Handle square actions attack king.
   * @param {Square} square - Square instance.
   */
  _handleSquareActionsAttackKing(square) {
    super._handleSquareActionsAttackKing(square)
    this.xrayControl = true;
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
        this._handleSquareActions(this.board.squares.getFromCoordinates(x, y));
        if (this.endOfALine) break;
        x += direction.x;
        y += direction.y;
      }
    }
  }
}


export { LinearPiece };
