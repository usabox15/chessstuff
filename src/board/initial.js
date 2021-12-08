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


import { Piece, KingCastleRoad, KingCastleInitial } from '../pieces/main.js';
import { Square } from '../square.js';


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


/**
 * Board initial castle class.
 *
 * Scheme:
 * {
 *   color: KingCastleInitial,
 *   ...
 * }
 */
class BoardInitialCastle {

  static WHITE_SHORT = 'K';
  static WHITE_LONG = 'Q';
  static BLACK_SHORT = 'k';
  static BLACK_LONG = 'q';
  static ALL_SIGNS = [
    BoardInitialCastle.WHITE_SHORT,
    BoardInitialCastle.WHITE_LONG,
    BoardInitialCastle.BLACK_SHORT,
    BoardInitialCastle.BLACK_LONG,
  ];
  static VALUES = {
    [BoardInitialCastle.WHITE_SHORT]: [Piece.WHITE, KingCastleRoad.SHORT],
    [BoardInitialCastle.WHITE_LONG]: [Piece.WHITE, KingCastleRoad.LONG],
    [BoardInitialCastle.BLACK_SHORT]: [Piece.BLACK, KingCastleRoad.SHORT],
    [BoardInitialCastle.BLACK_LONG]: [Piece.BLACK, KingCastleRoad.LONG],
  };

  /**
   * Creation.
   * @param {string} [signs="-"] - FEN castling data.
   */
  constructor(signs='-') {
    this._signs = signs.slice(0, 4);
    this._fillData();
  }

  /**
   * Check sign.
   * @param {string} sign - FEN castling sign.
   */
  _checkSign(sign) {
    if (!BoardInitialCastle.ALL_SIGNS.includes(sign)) {
      throw Error(`"${sign}" is not a correct castle rights sign. Use one of ${BoardInitialCastle.ALL_SIGNS}.`);
    }
  }

  /**
   * Get road kinds.
   * @return {Object} Road kinds.
   */
  _getRoadKinds() {
    let data = {};
    for (let color of Piece.ALL_COLORS) {
      data[color] = [];
    }
    for (let sign of this._signs) {
      if (sign == '-') continue;
      this._checkSign(sign);
      let [color, roadKind] = BoardInitialCastle.VALUES[sign];
      data[color].push(roadKind);
    }
    return data;
  }

  /** Fill data. */
  _fillData() {
    let roadKinds = this._getRoadKinds();
    for (let color of Piece.ALL_COLORS) {
      this[color] = new KingCastleInitial(roadKinds[color]);
    }
  }
}


/**
 * Board initial class.
 *
 * Scheme:
 * {
 *   position: BoardInitialPosition,
 *   currentColor: String,
 *   castleRights: BoardInitialCastle,
 *   enPassantSquareName: String or null,
 *   fiftyMovesRuleCounter: Number,
 *   movesCounter: Number,
 * }
 */
class BoardInitial {

  static COLORS = {'w': Piece.WHITE, 'b': Piece.BLACK};

  /**
   * Creation.
   * @param {FENData} data - Parsed FEN data.
   */
  constructor(data) {
    this.position = new BoardInitialPosition(data.positionData);
    this.currentColor = BoardInitial.COLORS[data.currentColorData];
    this.castleRights = new BoardInitialCastle(data.castleRightsData);
    this.enPassantSquareName = data.enPassantData == '-' ? null : data.enPassantData;
    this.fiftyMovesRuleCounter = parseInt(data.fiftyMovesRuleData);
    this.movesCounter = parseInt(data.movesCounterData);
  }
}


export { BoardInitialPosition, BoardInitialCastle, BoardInitial };
