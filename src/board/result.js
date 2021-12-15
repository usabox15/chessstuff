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


/** Board result class. */
class BoardResult {

  static VALUES_CHOICES = [0, 0.5, 1];

  /** Creation. */
  constructor(board) {
    this._board = board;
    this._value = null;
  }

  /**
   * Value.
   * @return {null|float[]|integer[]} Value.
   */
  get value() {
    return this._value;
  }

  /** Try set value. */
  trySetValue() {
    let oppColor;
    if (this._board.positionIsSetted) {
      oppColor = this._board.colors.opponent;
    } else {
      oppColor = this._board.colors.current;
    }

    let oppKing = this._board.kings[oppColor];
    if (!oppKing) return;

    if (this._checkFinalKingAttack(oppKing) || this._checkFinalKingDoubleAttack(oppKing)) {
      let value;
      if (this._board.positionIsSetted) {
        value = [this._board.colors.secondPriority, this._board.colors.firstPriority];
      } else {
        value = [this._board.colors.firstPriority, this._board.colors.secondPriority];
      }
      this._setValue(...value);
    } else if (this._board.insufficientMaterial || this._checkPiecesHaveNoMoves(oppColor)) {
      this._setValue(0.5, 0.5);
    }
  }

  /**
   * Check whether there is final king attack or not.
   * @param {King} king - King.
   * @return {boolean} Check result.
   */
  _checkFinalKingAttack(king) {
    if (!king.checkers.single) return false;
    let checker = king.checkers.first;
    let betweenSquares = [];
    if (checker.isLinear) {
      betweenSquares = checker.square.getBetweenSquaresNames(king.square);
    }
    let pieces = this._board.allPieces.filter(p => p.sameColor(king));
    for (let piece of pieces) {
      piece.getCheck(checker, betweenSquares);
      if (!piece.stuck) return false;
    }
    return true;
  }

  /**
   * Check whether there is final king double attack or not.
   * @param {King} king - King.
   * @return {boolean} Check result.
   */
  _checkFinalKingDoubleAttack(king) {
    if (!king.checkers.several) return false;
    let pieces = this._board.allPieces.filter(p => p.sameColor(king) && !p.isKing);
    for (let piece of pieces) {
      piece.getTotalImmobilize();
    }
    return king.stuck;
  }

  /**
   * Check whether particular color pieces have no moves or not.
   * @param {string} color - Pieces color.
   * @return {boolean} Check result.
   */
  _checkPiecesHaveNoMoves(color) {
    return (
      this._board.allPieces
      .filter(p => p.hasColor(color) && !p.stuck)
    ).length == 0;
  }

  /**
   * Set value.
   * @param {float|integer} whitePoints - White side points.
   * @param {float|integer} blackPoints - Black side points.
   */
  _setValue(whitePoints, blackPoints) {
    if (!BoardResult.VALUES_CHOICES.includes(whitePoints) || !BoardResult.VALUES_CHOICES.includes(blackPoints)) {
      throw Error(`Wrong points value. Try one of ${BoardResult.VALUES_CHOICES}.`);
    }
    this._value = [whitePoints, blackPoints];
  }
}


export { BoardResult };
