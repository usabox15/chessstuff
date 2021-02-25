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


/** Board moves counter class. */
class MovesCounter {

  /**
   * Creation.
   * @param {integer} initialCount - Initial count number.
   */
  constructor(initialCount) {
    this._value = initialCount;
  }

  /**
   * Current value.
   * @return {integer} Value.
   */
  get value() {
    return this._value;
  }

  /** Update value. */
  update() {
    this._value++;
  }
}


/** Board fifty moves rule counter class. */
class FiftyMovesRuleCounter extends MovesCounter {

  /**
   * Creation.
   * @param {integer} initialCount - Initial count number.
   */
  constructor(initialCount) {
    super(initialCount);
    this._turnedOn = false;
    this._needToRefresh = false;
  }

  /** Switch. */
  switch() {
    this._turnedOn = true;
    this._needToRefresh = true;
  }

  /** Update value. */
  update() {
    if (!this._turnedOn) return;
    if (this._needToRefresh) {
      this._value = 0;
      this._needToRefresh = false;
    }
    else {
      this._value++;
    }
  }
}


module.exports = {
  MovesCounter: MovesCounter,
  FiftyMovesRuleCounter: FiftyMovesRuleCounter,
};
