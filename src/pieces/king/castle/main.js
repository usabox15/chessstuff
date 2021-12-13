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


import { KingCastleInitial } from './initial.js';
import { KingCastleRoad } from './road.js';
import { Piece } from '../../piece/main.js';


/** King castle class. */
class KingCastle {

  static RANKS = {[Piece.WHITE]: "1", [Piece.BLACK]: "8"};

  /**
   * Creation.
   * @param {King} king - King instance.
   * @param {KingCastleInitial|null} [initial=null] - KingCastleInitial instance.
   */
  constructor(king, initial=null) {
    this._king = king;
    let accepted;
    if (king.onInitialSquare && initial) {
      if (!initial instanceof KingCastleInitial) {
        throw Error("Castle initial data has to be an instance of KingCastleInitial.");
      }
      accepted = initial;
    } else {
      accepted = new KingCastleInitial();
    }
    for (let side of KingCastleRoad.ALL_SIDES) {
      if (accepted[side]) {
        this[side] = new KingCastleRoad(this, KingCastle.RANKS[king.color], side);
      } else {
        this[side] = null;
      }
    }
  }

  /**
   * King.
   * @return {King} King instance.
   */
  get king() {
    return this._king;
  }

  /**
   * Stop castle rights.
   * @param {string} [side="all"] - One of `KingCastleRoad.ALL_SIDES`.
   */
  stop(side='all') {
    let sides = side == 'all' ? KingCastleRoad.ALL_SIDES : [side];
    for (let s of sides) {
      if (this[s]) {
        this[s].rook.removeCastleRoad();
        this[s] = null;
      }
    }
  }

  /**
   * Get castle road by square king move to.
   * @param {Square} toSquare - Square king move to.
   */
  getRoad(toSquare) {
    for (let side of KingCastleRoad.ALL_SIDES) {
      if (this[side] && this[side].toSquare.theSame(toSquare)) {
        return this[side];
      }
    }
    return null;
  }
}


export { KingCastleRoad, KingCastleInitial, KingCastle };
