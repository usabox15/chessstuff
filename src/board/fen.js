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


const { Piece, KingCastleRoad } = require('../pieces/main');
const { Relation } = require('../relations');
const { SquareName } = require('../square');


/**
 * FEN string data parser class.
 *
 * Scheme:
 * {
 *   positionData: String,
 *   currentColorData: String,
 *   castleRightsData: String,
 *   enPassantData: String,
 *   fiftyMovesRuleData: String,
 *   movesCounterData: String,
 * }
 */
class FENData {

  /**
   * Creation.
   * @param {string} data - FEN string data.
   */
  constructor(data) {
    [
      this.positionData,
      this.currentColorData,
      this.castleRightsData,
      this.enPassantData,
      this.fiftyMovesRuleData,
      this.movesCounterData,
    ] = data.split(' ');
  }
}


/** FEN string data creator class. */
class FENDataCreator {

  static PIECES = {
    [Piece.WHITE]: {
      [Piece.PAWN]: 'P',
      [Piece.KNIGHT]: 'N',
      [Piece.BISHOP]: 'B',
      [Piece.ROOK]: 'R',
      [Piece.QUEEN]: 'Q',
      [Piece.KING]: 'K',
    },
    [Piece.BLACK]: {
      [Piece.PAWN]: 'p',
      [Piece.KNIGHT]: 'n',
      [Piece.BISHOP]: 'b',
      [Piece.ROOK]: 'r',
      [Piece.QUEEN]: 'q',
      [Piece.KING]: 'k',
    },
  };
  static COLORS = {[Piece.WHITE]: 'w', [Piece.BLACK]: 'b'};
  static CASTLE_RIGHTS = {
    [Piece.WHITE]: {
      [KingCastleRoad.SHORT]: 'K',
      [KingCastleRoad.LONG]: 'Q',
    },
    [Piece.BLACK]: {
      [KingCastleRoad.SHORT]: 'k',
      [KingCastleRoad.LONG]: 'q',
    },
  };

  /**
   * Creation.
   * @param {Board} board - Board instance.
   */
  constructor(board) {
    this._board = board;
    this.value = [
      this._getPositionData(),
      FENDataCreator.COLORS[board.colors.current],
      this._getCastleRightsData(),
      board.enPassantSquare ? board.enPassantSquare.name.value : '-',
      board.fiftyMovesRuleCounter.value.toString(),
      board.movesCounter.value.toString(),
    ].join(' ');
  }

  /**
   * Get position data.
   * @return {string} FEN position data.
   */
  _getPositionData() {
    let data = [];
    for (let number of SquareName.numbers) {
      let rowData = [];
      for (let symbol of SquareName.symbols) {
        let square = this._board.squares[`${symbol}${number}`];
        if (square.piece) {
          rowData.push(FENDataCreator.PIECES[square.piece.color][square.piece.kind]);
        } else {
          rowData.push('0');
        }
      }
      data.push(
        rowData
        .join('')
        .replace(/0+/g, n => {return n.length})
      );
    }
    return data.reverse().join('/');
  }

  /**
   * Get castle rights data.
   * @return {string} FEN castle rights data.
   */
  _getCastleRightsData() {
    let data = [];
    for (let king of this._board.kings) {
      for (let side of KingCastleRoad.ALL_SIDES) {
        if (!king.castle[side]) continue;
        data.push(FENDataCreator.CASTLE_RIGHTS[king.color][side]);
      }
    }
    return data.join('') || '-';
  }
}


module.exports = {
  FENData: FENData,
  FENDataCreator: FENDataCreator,
};
