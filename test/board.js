var assert = require('assert');
var jschess = require('../');
var SquareName = jschess.square.SquareName;
var Piece = jschess.pieces.Piece;
var KingCastleRoad = jschess.pieces.KingCastleRoad;
var Board = jschess.board.Board;
var BoardColors = jschess.board.BoardColors;
var BoardInitial = jschess.board.BoardInitial;
var BoardInitialCastle = jschess.board.BoardInitialCastle;
var BoardInitialPosition = jschess.board.BoardInitialPosition;
var BoardSquares = jschess.board.BoardSquares;
var FENData = jschess.board.FENData;
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
        it('should throw error by wrong color', function () {
            assert.throws(() => {new BoardColors('wrong color');});
        });

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

    describe('Test BoardInitialPosition', function () {
        it('should check creation', function () {
            let position = new BoardInitialPosition('4k1r1/3n1p2/4p1q1/3bP3/Q1pN1B2/6P1/5P2/4R1K1');

            assert.equal(position[Piece.WHITE].length, 8);
            assert.equal(position[Piece.WHITE][0][0], Piece.ROOK);
            assert.equal(position[Piece.WHITE][0][1], 'e1');
            assert.equal(position[Piece.WHITE][1][0], Piece.KING);
            assert.equal(position[Piece.WHITE][1][1], 'g1');
            assert.equal(position[Piece.WHITE][2][0], Piece.PAWN);
            assert.equal(position[Piece.WHITE][2][1], 'f2');
            assert.equal(position[Piece.WHITE][3][0], Piece.PAWN);
            assert.equal(position[Piece.WHITE][3][1], 'g3');
            assert.equal(position[Piece.WHITE][4][0], Piece.QUEEN);
            assert.equal(position[Piece.WHITE][4][1], 'a4');
            assert.equal(position[Piece.WHITE][5][0], Piece.KNIGHT);
            assert.equal(position[Piece.WHITE][5][1], 'd4');
            assert.equal(position[Piece.WHITE][6][0], Piece.BISHOP);
            assert.equal(position[Piece.WHITE][6][1], 'f4');
            assert.equal(position[Piece.WHITE][7][0], Piece.PAWN);
            assert.equal(position[Piece.WHITE][7][1], 'e5');

            assert.equal(position[Piece.BLACK].length, 8);
            assert.equal(position[Piece.BLACK][0][0], Piece.PAWN);
            assert.equal(position[Piece.BLACK][0][1], 'c4');
            assert.equal(position[Piece.BLACK][1][0], Piece.BISHOP);
            assert.equal(position[Piece.BLACK][1][1], 'd5');
            assert.equal(position[Piece.BLACK][2][0], Piece.PAWN);
            assert.equal(position[Piece.BLACK][2][1], 'e6');
            assert.equal(position[Piece.BLACK][3][0], Piece.QUEEN);
            assert.equal(position[Piece.BLACK][3][1], 'g6');
            assert.equal(position[Piece.BLACK][4][0], Piece.KNIGHT);
            assert.equal(position[Piece.BLACK][4][1], 'd7');
            assert.equal(position[Piece.BLACK][5][0], Piece.PAWN);
            assert.equal(position[Piece.BLACK][5][1], 'f7');
            assert.equal(position[Piece.BLACK][6][0], Piece.KING);
            assert.equal(position[Piece.BLACK][6][1], 'e8');
            assert.equal(position[Piece.BLACK][7][0], Piece.ROOK);
            assert.equal(position[Piece.BLACK][7][1], 'g8');
        });
    });

    describe('Test BoardInitialCastle', function () {
        it('should check creation', function () {
            assert.throws(() => {
                new BoardInitialCastle('wrong');
            });

            let castleRights = new BoardInitialCastle();
            assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
            assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.LONG]);
            assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
            assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.LONG]);

            castleRights = new BoardInitialCastle('-');
            assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
            assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.LONG]);
            assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
            assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.LONG]);

            castleRights = new BoardInitialCastle('KQ');
            assert.ok(castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
            assert.ok(castleRights[Piece.WHITE][KingCastleRoad.LONG]);
            assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
            assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.LONG]);

            castleRights = new BoardInitialCastle('kq');
            assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
            assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.LONG]);
            assert.ok(castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
            assert.ok(castleRights[Piece.BLACK][KingCastleRoad.LONG]);

            castleRights = new BoardInitialCastle('KQkq');
            assert.ok(castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
            assert.ok(castleRights[Piece.WHITE][KingCastleRoad.LONG]);
            assert.ok(castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
            assert.ok(castleRights[Piece.BLACK][KingCastleRoad.LONG]);
        });
    });

    describe('Test BoardInitial', function () {
        it('should check position', function () {
            let data = new BoardInitial(
                new FENData('2kr4/1bp3q1/1pn5/p7/5Q2/5N1P/5PPB/5RK1 w - a6 0 25')
            );

            assert.equal(data.position[Piece.WHITE].length, 8);
            assert.equal(data.position[Piece.WHITE][0][0], Piece.ROOK);
            assert.equal(data.position[Piece.WHITE][0][1], 'f1');
            assert.equal(data.position[Piece.WHITE][1][0], Piece.KING);
            assert.equal(data.position[Piece.WHITE][1][1], 'g1');
            assert.equal(data.position[Piece.WHITE][2][0], Piece.PAWN);
            assert.equal(data.position[Piece.WHITE][2][1], 'f2');
            assert.equal(data.position[Piece.WHITE][3][0], Piece.PAWN);
            assert.equal(data.position[Piece.WHITE][3][1], 'g2');
            assert.equal(data.position[Piece.WHITE][4][0], Piece.BISHOP);
            assert.equal(data.position[Piece.WHITE][4][1], 'h2');
            assert.equal(data.position[Piece.WHITE][5][0], Piece.KNIGHT);
            assert.equal(data.position[Piece.WHITE][5][1], 'f3');
            assert.equal(data.position[Piece.WHITE][6][0], Piece.PAWN);
            assert.equal(data.position[Piece.WHITE][6][1], 'h3');
            assert.equal(data.position[Piece.WHITE][7][0], Piece.QUEEN);
            assert.equal(data.position[Piece.WHITE][7][1], 'f4');

            assert.equal(data.position[Piece.BLACK].length, 8);
            assert.equal(data.position[Piece.BLACK][0][0], Piece.PAWN);
            assert.equal(data.position[Piece.BLACK][0][1], 'a5');
            assert.equal(data.position[Piece.BLACK][1][0], Piece.PAWN);
            assert.equal(data.position[Piece.BLACK][1][1], 'b6');
            assert.equal(data.position[Piece.BLACK][2][0], Piece.KNIGHT);
            assert.equal(data.position[Piece.BLACK][2][1], 'c6');
            assert.equal(data.position[Piece.BLACK][3][0], Piece.BISHOP);
            assert.equal(data.position[Piece.BLACK][3][1], 'b7');
            assert.equal(data.position[Piece.BLACK][4][0], Piece.PAWN);
            assert.equal(data.position[Piece.BLACK][4][1], 'c7');
            assert.equal(data.position[Piece.BLACK][5][0], Piece.QUEEN);
            assert.equal(data.position[Piece.BLACK][5][1], 'g7');
            assert.equal(data.position[Piece.BLACK][6][0], Piece.KING);
            assert.equal(data.position[Piece.BLACK][6][1], 'c8');
            assert.equal(data.position[Piece.BLACK][7][0], Piece.ROOK);
            assert.equal(data.position[Piece.BLACK][7][1], 'd8');
        });

        it('should check currentColor', function () {
            let data = new BoardInitial(new FENData('5r2/8/3k4/8/5K2/8/R7/8 w - - 0 1'));
            assert.equal(data.currentColor, Piece.WHITE);

            data = new BoardInitial(new FENData('5r2/8/3k4/8/4K3/8/R7/8 b - - 0 1'));
            assert.equal(data.currentColor, Piece.BLACK);
        });

        it('should check castleRights', function () {
            let data = new BoardInitial(new FENData('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1'));
            assert.ok(data.castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
            assert.ok(data.castleRights[Piece.WHITE][KingCastleRoad.LONG]);
            assert.ok(data.castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
            assert.ok(data.castleRights[Piece.BLACK][KingCastleRoad.LONG]);

            data = new BoardInitial(new FENData('r3k3/pppppppp/8/8/8/8/PPPPPPPP/4K2R w Kq - 0 1'));
            assert.ok(data.castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
            assert.ok(!data.castleRights[Piece.WHITE][KingCastleRoad.LONG]);
            assert.ok(!data.castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
            assert.ok(data.castleRights[Piece.BLACK][KingCastleRoad.LONG]);

            data = new BoardInitial(new FENData('4k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K3 w Qk - 0 1'));
            assert.ok(!data.castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
            assert.ok(data.castleRights[Piece.WHITE][KingCastleRoad.LONG]);
            assert.ok(data.castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
            assert.ok(!data.castleRights[Piece.BLACK][KingCastleRoad.LONG]);

            data = new BoardInitial(new FENData('4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1'));
            assert.ok(!data.castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
            assert.ok(!data.castleRights[Piece.WHITE][KingCastleRoad.LONG]);
            assert.ok(!data.castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
            assert.ok(!data.castleRights[Piece.BLACK][KingCastleRoad.LONG]);
        });

        it('should check enPassantSquareName', function () {
            let data = new BoardInitial(new FENData('4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1'));
            assert.equal(data.enPassantSquareName, null);

            data = new BoardInitial(new FENData('4k3/pppppppp/8/8/4P3/8/PPPP1PPP/4K3 w - e3 0 1'));
            assert.equal(data.enPassantSquareName, 'e3');
        });

        it('should check moves counters', function () {
            let data = new BoardInitial(
                new FENData('rnbq1bnr/pppkpppp/8/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQ - 2 3 ')
            );
            assert.equal(data.fiftyMovesRuleCounter, 2);
            assert.equal(data.movesCounter, 3);
        });
    });
});
