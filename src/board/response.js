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

  /**
   * Handle fail.
   * @param {Object} state - Board state.
   * @param {string} description - Description.
   * @return {Object} Board response object.
   */
  handleFail(state, description) {
    return this.handle(state, {
      description: description
      success: false,
    });
  }

  /**
   * Handle.
   * @param {Object} state - Board state.
   * @param {Object} [options] - response options.
   * @param {string} [description=""] - Description.
   * @param {boolean} [success=true] - Whether responce is successful or not.
   * @return {Object} Board response object.
   */
  handle(state, options) {
    return {
      ...state,
      description: "",
      success: true,
      ...(options || {}),
    };
  }
}
