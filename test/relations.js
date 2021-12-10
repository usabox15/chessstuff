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


import { strict as assert } from 'assert';
import { Piece, Relation, Square } from '../src/main.js'


var a1 = new Square('a1');
var b4 = new Square('b4');
var c8 = new Square('c8');
var f3 = new Square('f3');
var knight = new Piece(Piece.WHITE, new Square('b3'));
var bishop = new Piece(Piece.BLACK, new Square('h8'));
var rook = new Piece(Piece.WHITE, new Square('a6'));
var queen = new Piece(Piece.BLACK, new Square('c3'));


describe('Test relations', function () {
  describe('Test Relation', function () {
    it('should check that new relation should be empty', function () {
      assert.equal(a1.pieces[Relation.MOVE], null);
      assert.equal(a1.pieces[Relation.ATTACK], null);
      assert.equal(a1.pieces[Relation.XRAY], null);
      assert.equal(a1.pieces[Relation.COVER], null);
      assert.equal(a1.pieces[Relation.CONTROL], null);
    });

    it('should throw error by wrong action kind', function () {
      assert.throws(() => { a1.pieces._checkKind('WRONGKIND');});
    });

    it('should add items to action', function () {
      for (let piece of [knight, bishop, rook]) {
        a1.pieces.add(Relation.MOVE, piece);
        assert.equal(a1.pieces[Relation.MOVE].filter(p => p.theSame(piece)).length, 1);
        assert.equal(piece.squares[Relation.MOVE].filter(s => s.theSame(a1)).length, 1);
      }
    });

    it('should check whether action includes item or not', function () {
      assert.ok(a1.pieces.includes(Relation.MOVE, bishop));
      assert.ok(!a1.pieces.includes(Relation.MOVE, queen));
    });

    it('should remove items from action', function () {
      a1.pieces.remove(Relation.MOVE, knight);
      assert.ok(!a1.pieces.includes(Relation.MOVE, knight));
      assert.ok(!knight.squares.includes(Relation.MOVE, a1));
    });

    it('should refresh action items', function () {
      a1.pieces.refresh(Relation.MOVE);
      assert.equal(a1.pieces[Relation.MOVE], null);
      for (let piece of [bishop, rook]) {
        assert.ok(!piece.squares.includes(Relation.MOVE, a1));
      }
    });
  });

  describe('Test PieceSquares', function () {
    it('should limit action squares', function () {
      for (let square of [a1, b4, c8, f3]) {
        queen.squares.add(Relation.MOVE, square);
      }
      queen.squares.limit(Relation.MOVE, ['b4', 'c8']);
      for (let square of [a1, f3]) {
        assert.ok(!queen.squares.includes(Relation.MOVE, square));
        assert.ok(!square.pieces.includes(Relation.MOVE, queen));
      }
      for (let square of [b4, c8]) {
        assert.ok(queen.squares.includes(Relation.MOVE, square));
        assert.ok(square.pieces.includes(Relation.MOVE, queen));
      }
      queen.squares.limit(Relation.MOVE, ['b5']);
      assert.ok(!queen.squares[Relation.MOVE])
    });
  });
});
