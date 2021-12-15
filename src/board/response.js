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


/** Board response handler. */
class BoardResponse {

  constructor(board) {
    this._board = board;
  }

  /**
   * Handle position is illegal.
   * @return {Object} Board response object.
   */
  positionIsIllegal() {
    return this.fail('Board position is illegal.');
  }

  /**
   * Handle position already setted.
   * @return {Object} Board response object.
   */
  positionAlreadySetted() {
    return this.fail('Board position has been already setted.');
  }

  /**
   * Handle position not setted.
   * @return {Object} Board response object.
   */
  positionNotSetted() {
    return this.fail('Board position isn\'t setted.');
  }

  /**
   * Handle result already reached.
   * @return {Object} Board response object.
   */
  resultAlreadyReached() {
    return this.fail('Result is already reached.');
  }

  /**
   * Handle fail response.
   * @param {string} description - Description.
   * @return {Object} Board response object.
   */
  fail(description) {
    return this.success({
      description: description,
      success: false,
    });
  }

  /**
   * Handle success response.
   * @param {Object} [options] - response options.
   * @param {string} [options.description=""] - Description.
   * @param {boolean} [options.success=true] - Whether responce is successful or not.
   * @return {Object} Board response object.
   */
  success(options) {
    return {
      ...this._board.state,
      description: '',
      success: true,
      ...(options || {}),
    };
  }
}


export { BoardResponse };
