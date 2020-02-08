var assert = require('assert');
var jschess = require('../');
var SquareName = jschess.square.SquareName;
var Piece = jschess.pieces.Piece;
var Board = jschess.board.Board;
var BoardColors = jschess.board.BoardColors;
var BoardSquares = jschess.board.BoardSquares;


describe('Test board', function () {
    describe('Test BoardSquares', function () {
        it('should check initial', function () {
            let board = new Board();
            assert.equal(Object.entries(board.squares).length, 64);
            for (let symbol of SquareName.symbols) {
                for (let number of SquareName.numbers) {
                    let name = `${symbol}${number}`;
                    assert.ok(board.squares.hasOwnProperty(name));
                }
            }
        });

        it('should check occupied', function () {
            let board = new Board();
            new Piece(Piece.WHITE, board.squares.b3);
            new Piece(Piece.BLACK, board.squares.e8);
            new Piece(Piece.WHITE, board.squares.g5);
            new Piece(Piece.BLACK, board.squares.c2);
            new Piece(Piece.WHITE, board.squares.h4);
            new Piece(Piece.BLACK, board.squares.f1);
            assert.equal(Object.entries(board.squares.occupied).length, 6);
            for (let name of ['b3', 'e8', 'g5', 'c2', 'h4', 'f1']) {
                assert.ok(board.squares.hasOwnProperty(name));
            }
        });

        it('should check get square from coordinates', function () {
            let board = new Board();
            assert.ok(board.squares.getFromCoordinates(3, 5).theSame(board.squares.d6));
            assert.ok(board.squares.getFromCoordinates(7, 2).theSame(board.squares.h3));
            assert.ok(board.squares.getFromCoordinates(0, 7).theSame(board.squares.a8));
        });
    });
});
