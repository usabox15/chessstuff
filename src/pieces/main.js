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


const { Piece, StepPiece, LinearPiece } = require('./base');
const { Pawn } = require('./pawn');
const { Knight } = require('./knight');
const { Bishop } = require('./bishop');
const { Rook } = require('./rook');
const { Queen } = require('./queen');
const {
  KingCastleRoad, KingCastleInitial, KingCastle, KingCheckers, King,
} = require('./king/main');


module.exports = {
  Piece: Piece,
  StepPiece: StepPiece,
  LinearPiece: LinearPiece,
  Pawn: Pawn,
  Knight: Knight,
  Bishop: Bishop,
  Rook: Rook,
  Queen: Queen,
  KingCastleRoad: KingCastleRoad,
  KingCastleInitial: KingCastleInitial,
  KingCastle: KingCastle,
  KingCheckers: KingCheckers,
  King: King,
};
