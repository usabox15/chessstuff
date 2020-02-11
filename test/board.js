var assert = require('assert');
var jschess = require('../');
var SquareName = jschess.square.SquareName;
var Piece = jschess.pieces.Piece;
var Board = jschess.board.Board;
var BoardColors = jschess.board.BoardColors;
var BoardSquares = jschess.board.BoardSquares;
var FENDataParser = jschess.board.FENDataParser;
var FiftyMovesRuleCounter = jschess.board.FiftyMovesRuleCounter;
var MovesCounter = jschess.board.MovesCounter;


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

    describe('Test BoardColors', function () {
        it('should check initial', function () {
            let boardColors = new BoardColors(Piece.WHITE);
            assert.equal(boardColors._priority.length, 2);
            assert.equal(boardColors._priority[0], 0);
            assert.equal(boardColors._priority[1], 1);

            boardColors = new BoardColors(Piece.BLACK);
            assert.equal(boardColors._priority.length, 2);
            assert.equal(boardColors._priority[0], 1);
            assert.equal(boardColors._priority[1], 0);
        });

        it('should check change priority', function () {
            let boardColors = new BoardColors(Piece.WHITE);

            assert.equal(boardColors.current, Piece.WHITE);
            assert.equal(boardColors.opponent, Piece.BLACK);
            assert.equal(boardColors.firstPriority, 0);
            assert.equal(boardColors.secondPriority, 1);

            boardColors.changePriority();

            assert.equal(boardColors.current, Piece.BLACK);
            assert.equal(boardColors.opponent, Piece.WHITE);
            assert.equal(boardColors.firstPriority, 1);
            assert.equal(boardColors.secondPriority, 0);
        });
    });

    describe('Test MovesCounter', function () {
        it('should check update', function () {
            let counter = new MovesCounter(5);
            assert.equal(counter.value, 5);
            counter.update();
            assert.equal(counter.value, 6);
            counter.update();
            assert.equal(counter.value, 7);
        });
    });

    describe('Test FiftyMovesRuleCounter', function () {
        it('should check update', function () {
            let counter = new FiftyMovesRuleCounter(15);
            assert.equal(counter.value, 15);
            assert.ok(!counter._turnedOn);
            assert.ok(!counter._needToRefresh);

            counter.update();
            assert.equal(counter.value, 15);

            counter.switch();
            assert.equal(counter.value, 15);
            assert.ok(counter._turnedOn);
            assert.ok(counter._needToRefresh);

            counter.update();
            assert.equal(counter.value, 0);
            assert.ok(counter._turnedOn);
            assert.ok(!counter._needToRefresh);

            counter.update();
            assert.equal(counter.value, 1);
            assert.ok(counter._turnedOn);
            assert.ok(!counter._needToRefresh);

            counter.update();
            assert.equal(counter.value, 2);
            assert.ok(counter._turnedOn);
            assert.ok(!counter._needToRefresh);

            counter.switch();
            assert.equal(counter.value, 2);
            assert.ok(counter._turnedOn);
            assert.ok(counter._needToRefresh);

            counter.update();
            assert.equal(counter.value, 0);
            assert.ok(counter._turnedOn);
            assert.ok(!counter._needToRefresh);
        });
    });
});
