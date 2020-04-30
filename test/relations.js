/*
Copyright 2020 Yegor Bitensky

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


var assert = require('assert');
var chessstuff = require('../');
var ActionsRelation = chessstuff.relations.ActionsRelation;
var PieceSquares = chessstuff.relations.PieceSquares;
var Square = chessstuff.square.Square;
var Piece = chessstuff.pieces.Piece;

var a1 = new Square('a1');
var b4 = new Square('b4');
var c8 = new Square('c8');
var f3 = new Square('f3');
var knight = new Piece(Piece.WHITE, new Square('b3'));
var bishop = new Piece(Piece.BLACK, new Square('h8'));
var rook = new Piece(Piece.WHITE, new Square('a6'));
var queen = new Piece(Piece.BLACK, new Square('c3'));


describe('Test relations', function () {
    describe('Test ActionsRelation', function () {
        it('should check that new relation should be empty', function () {
            assert.equal(a1.pieces[ActionsRelation.MOVE], null);
            assert.equal(a1.pieces[ActionsRelation.ATTACK], null);
            assert.equal(a1.pieces[ActionsRelation.XRAY], null);
            assert.equal(a1.pieces[ActionsRelation.COVER], null);
            assert.equal(a1.pieces[ActionsRelation.CONTROL], null);
        });

        it('should throw error by wrong action kind', function () {
            assert.throws(() => { a1.pieces._checkKind('WRONGKIND');});
        });

        it('should add items to action', function () {
            for (let piece of [knight, bishop, rook]) {
                a1.pieces.add(ActionsRelation.MOVE, piece);
                assert.equal(a1.pieces[ActionsRelation.MOVE].filter(p => p.theSame(piece)).length, 1);
                assert.equal(piece.squares[ActionsRelation.MOVE].filter(s => s.theSame(a1)).length, 1);
            }
        });

        it('should check whether action includes item or not', function () {
            assert.ok(a1.pieces.includes(ActionsRelation.MOVE, bishop));
            assert.ok(!a1.pieces.includes(ActionsRelation.MOVE, queen));
        });

        it('should remove items from action', function () {
            a1.pieces.remove(ActionsRelation.MOVE, knight);
            assert.ok(!a1.pieces.includes(ActionsRelation.MOVE, knight));
            assert.ok(!knight.squares.includes(ActionsRelation.MOVE, a1));
        });

        it('should refresh action items', function () {
            a1.pieces.refresh(ActionsRelation.MOVE);
            assert.equal(a1.pieces[ActionsRelation.MOVE], null);
            for (let piece of [bishop, rook]) {
                assert.ok(!piece.squares.includes(ActionsRelation.MOVE, a1));
            }
        });
    });

    describe('Test PieceSquares', function () {
        it('should limit action squares', function () {
            for (let square of [a1, b4, c8, f3]) {
                queen.squares.add(ActionsRelation.MOVE, square);
            }
            queen.squares.limit(ActionsRelation.MOVE, ['b4', 'c8']);
            for (let square of [a1, f3]) {
                assert.ok(!queen.squares.includes(ActionsRelation.MOVE, square));
                assert.ok(!square.pieces.includes(ActionsRelation.MOVE, queen));
            }
            for (let square of [b4, c8]) {
                assert.ok(queen.squares.includes(ActionsRelation.MOVE, square));
                assert.ok(square.pieces.includes(ActionsRelation.MOVE, queen));
            }
            queen.squares.limit(ActionsRelation.MOVE, ['b5']);
            assert.ok(!queen.squares[ActionsRelation.MOVE])
        });
    });
});
