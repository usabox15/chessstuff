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


import { KingCastleRoad } from './road.js';


/**
 * King castle initial class.
 *
 * Scheme:
 *   {
 *     kindOfCastleRoad: Boolean,
 *     ...
 *   }
 *
 * Example:
 *   {
 *     [KingCastleRoad.SHORT]: true,
 *     [KingCastleRoad.LONG]: false
 *   }
 */
class KingCastleInitial {

  /**
   * Creation.
   * @param {string[]|null} [acceptedSides=null] - One of `KingCastleRoad.ALL_SIDES`.
   */
  constructor(acceptedSides=null) {
    acceptedSides = (acceptedSides || []).slice(0, 2);
    this._checkAcceptedSides(acceptedSides);
    for (let side of KingCastleRoad.ALL_SIDES) {
      this[side] = acceptedSides.includes(side);
    }
  }

  /**
   * Check accepted sides.
   * @param {string[]} acceptedSides - One of `KingCastleRoad.ALL_SIDES`.
   */
  _checkAcceptedSides(acceptedSides) {
    for (let side of acceptedSides) {
      if (!KingCastleRoad.ALL_SIDES.includes(side)) {
        throw Error(`${side} is not a correct castle side name. Use one of ${KingCastleRoad.ALL_SIDES}.`);
      }
    }
  }
}


export { KingCastleInitial };
