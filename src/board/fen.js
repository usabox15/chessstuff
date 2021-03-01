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


module.exports = {
  FENData: FENData,
};
