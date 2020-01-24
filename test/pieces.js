var assert = require('assert');
var jschess = require('../');
var Square = jschess.square.Square;
var Piece = jschess.pieces.Piece;
var Pawn = jschess.pieces.Pawn;
var Knight = jschess.pieces.Knight;
var Bishop = jschess.pieces.Bishop;
var Rook = jschess.pieces.Rook;
var Queen = jschess.pieces.Queen;
var King = jschess.pieces.King;
var KingCastle = jschess.pieces.KingCastle;
var ar = jschess.relations.ActionsRelation;
var Board = jschess.board.Board;


describe('Test pieces', function () {
    describe('Test Piece', function () {
        it('should throw error by wrong piece color', function () {
            assert.throws(() => {new Piece('wrong color', new Square('a1'));});
        });

        it('should check initial piece data', function () {
            let piece = new Piece(Piece.BLACK, new Square('f5'));
            assert.equal(piece.color, Piece.BLACK);
            assert.equal(piece.square.name.value, 'f5');
            assert.equal(piece.sqrBeforeXray, null);
            assert.equal(piece.binder, null);
            assert.equal(piece.kind, null);
            assert.ok(!piece.xrayControl);
            assert.ok(!piece.endOfALine);
            assert.ok(!piece.isPawn);
            assert.ok(!piece.isKnight);
            assert.ok(!piece.isBishop);
            assert.ok(!piece.isRook);
            assert.ok(!piece.isQueen);
            assert.ok(!piece.isKing);
            assert.ok(piece.stuck);
            assert.ok(!piece.isLinear);
        });

        it('should check pieces are the same', function () {
            let piece1 = new Piece(Piece.WHITE, new Square('e6'));
            let piece2 = new Piece(Piece.WHITE, new Square('g1'));
            assert.ok(piece1.theSame(piece1));
            assert.ok(!piece1.theSame(piece2));
        })

        it('should check piece has particular color', function () {
            let piece = new Piece(Piece.BLACK, new Square('a5'));
            assert.ok(piece.hasColor(Piece.BLACK));
            assert.ok(!piece.hasColor(Piece.WHITE));
        })

        it('should check pieces have the same colors', function () {
            let whitePiece1 = new Piece(Piece.WHITE, new Square('h7'));
            let whitePiece2 = new Piece(Piece.WHITE, new Square('b4'));
            let blackPiece = new Piece(Piece.BLACK, new Square('e8'));
            assert.ok(whitePiece1.sameColor(whitePiece2));
            assert.ok(!whitePiece1.sameColor(blackPiece));
        })

        it('should add empty next square to move and control actions', function () {
            let pieceSquare = new Square('c2');
            let nextSquare = new Square('c3');
            let piece = new Piece(Piece.BLACK, pieceSquare);
            assert.equal(piece.squares[ar.MOVE], null);
            assert.equal(piece.squares[ar.CONTROL], null);
            piece._nextSquareAction(nextSquare);
            assert.ok(piece.squares.includes(ar.MOVE, nextSquare));
            assert.ok(piece.squares.includes(ar.CONTROL, nextSquare));
        });

        it('should add the same color piece next square to cover and control actions', function () {
            let pieceSquare = new Square('c2');
            let nextSquare = new Square('c3');
            let piece1 = new Piece(Piece.WHITE, pieceSquare);
            let piece2 = new Piece(Piece.WHITE, nextSquare);
            assert.equal(piece1.squares[ar.COVER], null);
            assert.equal(piece1.squares[ar.CONTROL], null);
            piece1._nextSquareAction(nextSquare);
            assert.ok(piece1.squares.includes(ar.COVER, nextSquare));
            assert.ok(piece1.squares.includes(ar.CONTROL, nextSquare));
        });

        it('should add not the same color piece next square to attack and control actions', function () {
            let pieceSquare = new Square('c2');
            let nextSquare = new Square('c3');
            let piece1 = new Piece(Piece.BLACK, pieceSquare);
            let piece2 = new Piece(Piece.WHITE, nextSquare);
            assert.equal(piece1.squares[ar.ATTACK], null);
            assert.equal(piece1.squares[ar.CONTROL], null);
            piece1._nextSquareAction(nextSquare);
            assert.ok(piece1.squares.includes(ar.ATTACK, nextSquare));
            assert.ok(piece1.squares.includes(ar.CONTROL, nextSquare));
        });

        it('should add next square after piece to xray action if linear', function () {
            let pieceSquare = new Square('e5');
            let nextSquare = new Square('e4');
            let afterNextSquare = new Square('e3');
            let piece1 = new Piece(Piece.BLACK, pieceSquare);
            piece1._isLinear = true;
            let piece2 = new Piece(Piece.BLACK, nextSquare);
            assert.equal(piece1.squares[ar.XRAY], null);
            piece1._nextSquareAction(nextSquare);
            assert.equal(piece1.squares[ar.XRAY], null);
            piece1._nextSquareAction(afterNextSquare);
            assert.ok(piece1.squares.includes(ar.XRAY, afterNextSquare));
        });

        it('should add next square after other color King to controll action if linear', function () {
            let board = new Board();
            let piece1 = new Piece(Piece.WHITE, board.squares.g1);
            piece1._isLinear = true;
            let piece2 = new King(Piece.BLACK, board.squares.d4, {short: false, long: false});
            assert.ok(!piece1.squares.includes(ar.CONTROL, board.squares.c5));
            piece1._nextSquareAction(board.squares.d4);
            assert.ok(!piece1.squares.includes(ar.CONTROL, board.squares.c5));
            piece1._nextSquareAction(board.squares.c5);
            assert.ok(piece1.squares.includes(ar.CONTROL, board.squares.c5));
        });

        it('should make a piece as binder to next square piece before King', function () {
            let board = new Board();
            let piece1 = new Piece(Piece.WHITE, board.squares.h8);
            piece1._isLinear = true;
            let piece2 = new Piece(Piece.BLACK, board.squares.f6);
            let piece3 = new King(Piece.BLACK, board.squares.a1, {short: false, long: false});
            assert.ok(!piece2.binder);
            piece1._nextSquareAction(board.squares.f6);
            assert.ok(!piece2.binder);
            piece1._nextSquareAction(board.squares.a1);
            assert.ok(piece2.binder);
            assert.ok(piece2.binder.theSame(piece1));
        });

        it('should bind a piece', function () {
            let binderSquare = new Square('b5');
            let pieceSquare = new Square('b3');
            let kingSquare = new Square('b1');
            let piece1 = new Piece(Piece.WHITE, binderSquare);
            piece1._isLinear = true;
            let piece2 = new Piece(Piece.BLACK, pieceSquare);
            let b5 = new Square('b5');
            piece2.squares.add(ar.ATTACK, b5);
            piece2.squares.add(ar.CONTROL, b5);
            let b4 = new Square('b4');
            piece2.squares.add(ar.MOVE, b4);
            piece2.squares.add(ar.CONTROL, b4);
            let a3 = new Square('a3');
            piece2.squares.add(ar.ATTACK, a3);
            piece2.squares.add(ar.CONTROL, a3);
            let c3 = new Square('c3');
            piece2.squares.add(ar.MOVE, c3);
            piece2.squares.add(ar.CONTROL, c3);
            let d3 = new Square('d3');
            piece2.squares.add(ar.COVER, d3);
            piece2.squares.add(ar.CONTROL, d3);
            let d4 = new Square('d4');
            piece2.squares.add(ar.XRAY, d4);
            let b2 = new Square('b2');
            piece2.squares.add(ar.MOVE, b2);
            piece2.squares.add(ar.CONTROL, b2);
            let b1 = new Square('b1');
            piece2.squares.add(ar.COVER, b1);
            piece2.squares.add(ar.CONTROL, b1);
            piece2.binder = piece1;
            piece2.getBind(b1);
            assert.ok(!piece2.squares[ar.XRAY]);
            assert.ok(piece2.squares.includes(ar.MOVE, b4));
            assert.ok(!piece2.squares.includes(ar.MOVE, c3));
            assert.ok(piece2.squares.includes(ar.MOVE, b2));
            assert.ok(piece2.squares.includes(ar.ATTACK, b5));
            assert.ok(!piece2.squares.includes(ar.ATTACK, a3));
            assert.ok(!piece2.squares.includes(ar.COVER, d3));
            assert.ok(piece2.squares.includes(ar.COVER, b1));
            assert.ok(piece2.squares.includes(ar.CONTROL, b5));
            assert.ok(piece2.squares.includes(ar.CONTROL, b4));
            assert.ok(piece2.squares.includes(ar.CONTROL, a3));
            assert.ok(piece2.squares.includes(ar.CONTROL, c3));
            assert.ok(piece2.squares.includes(ar.CONTROL, d3));
            assert.ok(piece2.squares.includes(ar.CONTROL, b2));
            assert.ok(piece2.squares.includes(ar.CONTROL, b1));
        });

        it('should handle check logic', function () {
            let checkerSquare = new Square('e4');
            let pieceSquare = new Square('c4');
            let kingSquare = new Square('e8');
            let piece1 = new Piece(Piece.WHITE, checkerSquare);
            let piece2 = new Piece(Piece.BLACK, pieceSquare);
            piece2.squares.add(ar.ATTACK, checkerSquare);
            let c1 = new Square('c1');
            piece2.squares.add(ar.ATTACK, c1);
            let e6 = new Square('e6');
            piece2.squares.add(ar.MOVE, e6);
            let e2 = new Square('e2');
            piece2.squares.add(ar.MOVE, e2);
            let a4 = new Square('a4');
            piece2.squares.add(ar.MOVE, a4);
            let c7 = new Square('c7');
            piece2.squares.add(ar.COVER, c7);
            let c8 = new Square('c8');
            piece2.squares.add(ar.XRAY, c8);
            let betweenSquares = piece1.square.getBetweenSquaresNames(kingSquare);
            piece2.getCheck(piece1, betweenSquares);
            assert.ok(!piece2.squares[ar.XRAY]);
            assert.ok(!piece2.squares[ar.COVER]);
            assert.ok(piece2.squares.includes(ar.ATTACK, checkerSquare));
            assert.ok(!piece2.squares.includes(ar.ATTACK, c1));
            assert.ok(piece2.squares.includes(ar.MOVE, e6));
            assert.ok(!piece2.squares.includes(ar.MOVE, e2));
            assert.ok(!piece2.squares.includes(ar.MOVE, a4));
        })
    });

    describe('Test Pawn', function () {
        it('should check initial pawn data', function () {
            let pawn = new Pawn(Piece.WHITE, new Square('e2'));
            assert.ok(pawn.isPawn);
            assert.equal(pawn.direction, 1);
            assert.equal(pawn._enPassantSquare, null);
            assert.equal(pawn.kind, "pawn");
        });

        it('should check pawn on initial horizontal', function () {
            let pawn1 = new Pawn(Piece.BLACK, new Square('c7'));
            assert.ok(pawn1.onInitialHorizontal);
            let pawn2 = new Pawn(Piece.WHITE, new Square('d3'));
            assert.ok(!pawn2.onInitialHorizontal);
            let pawn3 = new Pawn(Piece.BLACK, new Square('h2'));
            assert.ok(!pawn3.onInitialHorizontal);
            let pawn4 = new Pawn(Piece.WHITE, new Square('f2'));
            assert.ok(pawn4.onInitialHorizontal);
        });

        it('should check pawn move maters', function () {
            let board = new Board();

            let pawn1 = new Pawn(Piece.BLACK, board.squares.e5);
            let pawn1MoveCoordinates = pawn1._getMoveCoordinates();
            assert.equal(pawn1MoveCoordinates.length, 1);
            assert.equal(pawn1MoveCoordinates[0][0], 4);
            assert.equal(pawn1MoveCoordinates[0][1], 3);
            pawn1._getMoveSquares();
            assert.ok(pawn1.squares.includes(ar.MOVE, board.squares.e4));

            let pawn2 = new Pawn(Piece.WHITE, board.squares.a2);
            let pawn2MoveCoordinates = pawn2._getMoveCoordinates();
            assert.equal(pawn2MoveCoordinates.length, 2);
            assert.equal(pawn2MoveCoordinates[0][0], 0);
            assert.equal(pawn2MoveCoordinates[0][1], 2);
            assert.equal(pawn2MoveCoordinates[1][0], 0);
            assert.equal(pawn2MoveCoordinates[1][1], 3);
            pawn2._getMoveSquares();
            assert.ok(pawn2.squares.includes(ar.MOVE, board.squares.a3));
            assert.ok(pawn2.squares.includes(ar.MOVE, board.squares.a4));

            new Piece(Piece.WHITE, board.squares.g5);
            let pawn3 = new Pawn(Piece.BLACK, board.squares.g7);
            let pawn3MoveCoordinates = pawn3._getMoveCoordinates();
            assert.equal(pawn3MoveCoordinates.length, 2);
            assert.equal(pawn3MoveCoordinates[0][0], 6);
            assert.equal(pawn3MoveCoordinates[0][1], 5);
            assert.equal(pawn3MoveCoordinates[1][0], 6);
            assert.equal(pawn3MoveCoordinates[1][1], 4);
            pawn3._getMoveSquares();
            assert.ok(pawn3.squares.includes(ar.MOVE, board.squares.g6));
            assert.ok(!pawn3.squares.includes(ar.MOVE, board.squares.g5));

            new Piece(Piece.BLACK, board.squares.f5);
            let pawn4 = new Pawn(Piece.WHITE, board.squares.f4);
            let pawn4MoveCoordinates = pawn4._getMoveCoordinates();
            assert.equal(pawn4MoveCoordinates.length, 1);
            assert.equal(pawn4MoveCoordinates[0][0], 5);
            assert.equal(pawn4MoveCoordinates[0][1], 4);
            pawn4._getMoveSquares();
            assert.ok(!pawn4.squares.includes(ar.MOVE, board.squares.f5));
        });

        it('should check pawn attack maters', function () {
            let board = new Board();

            let pawn1 = new Pawn(Piece.BLACK, board.squares.b6);
            new Piece(Piece.WHITE, board.squares.c5);
            let pawn1AttackCoordinates = pawn1._getAttackCoordinates();
            assert.equal(pawn1AttackCoordinates.length, 2);
            assert.equal(pawn1AttackCoordinates[0][0], 2);
            assert.equal(pawn1AttackCoordinates[0][1], 4);
            assert.equal(pawn1AttackCoordinates[1][0], 0);
            assert.equal(pawn1AttackCoordinates[1][1], 4);
            pawn1._getAttackSquares();
            assert.ok(pawn1.squares.includes(ar.CONTROL, board.squares.a5));
            assert.ok(pawn1.squares.includes(ar.CONTROL, board.squares.c5));
            assert.ok(!pawn1.squares.includes(ar.ATTACK, board.squares.a5));
            assert.ok(pawn1.squares.includes(ar.ATTACK, board.squares.c5));
            assert.ok(!pawn1.squares.includes(ar.COVER, board.squares.a5));
            assert.ok(!pawn1.squares.includes(ar.COVER, board.squares.c5));

            let pawn2 = new Pawn(Piece.WHITE, board.squares.f2);
            new Piece(Piece.BLACK, board.squares.e3);
            new Piece(Piece.WHITE, board.squares.g3);
            let pawn2AttackCoordinates = pawn2._getAttackCoordinates();
            assert.equal(pawn2AttackCoordinates.length, 2);
            assert.equal(pawn2AttackCoordinates[0][0], 6);
            assert.equal(pawn2AttackCoordinates[0][1], 2);
            assert.equal(pawn2AttackCoordinates[1][0], 4);
            assert.equal(pawn2AttackCoordinates[1][1], 2);
            pawn2._getAttackSquares();
            assert.ok(pawn2.squares.includes(ar.CONTROL, board.squares.e3));
            assert.ok(pawn2.squares.includes(ar.CONTROL, board.squares.g3));
            assert.ok(pawn2.squares.includes(ar.ATTACK, board.squares.e3));
            assert.ok(!pawn2.squares.includes(ar.ATTACK, board.squares.g3));
            assert.ok(!pawn2.squares.includes(ar.COVER, board.squares.e3));
            assert.ok(pawn2.squares.includes(ar.COVER, board.squares.g3));

            let pawn3 = new Pawn(Piece.BLACK, board.squares.a3);
            let pawn3AttackCoordinates = pawn3._getAttackCoordinates();
            assert.equal(pawn3AttackCoordinates.length, 1);
            assert.equal(pawn3AttackCoordinates[0][0], 1);
            assert.equal(pawn3AttackCoordinates[0][1], 1);
            pawn3._getAttackSquares();
            assert.ok(pawn3.squares.includes(ar.CONTROL, board.squares.b2));
            assert.ok(!pawn3.squares.includes(ar.ATTACK, board.squares.b2));
            assert.ok(!pawn3.squares.includes(ar.COVER, board.squares.b2));

            let pawn4 = new Pawn(Piece.WHITE, board.squares.h5);
            pawn4.setEnPassantSquare(board.squares.g6)
            let pawn4AttackCoordinates = pawn4._getAttackCoordinates();
            assert.equal(pawn4AttackCoordinates.length, 1);
            assert.equal(pawn4AttackCoordinates[0][0], 6);
            assert.equal(pawn4AttackCoordinates[0][1], 5);
            pawn4._getAttackSquares();
            assert.equal(pawn4._enPassantSquare, null);
            assert.ok(pawn4.squares.includes(ar.CONTROL, board.squares.g6));
            assert.ok(pawn4.squares.includes(ar.ATTACK, board.squares.g6));
            assert.ok(!pawn4.squares.includes(ar.COVER, board.squares.g6));
        });
    });

    describe('Test Knight', function () {
        it('should check initial knight data', function () {
            let knight = new Knight(Piece.BLACK, new Square('b1'));
            assert.ok(knight.isKnight);
            assert.equal(knight.kind, "knight");
        });

        it('should check knight squares', function () {
            let board = new Board();
            let knight = new Knight(Piece.WHITE, board.squares.d5);

            new Piece(Piece.BLACK, board.squares.e7);
            new Piece(Piece.WHITE, board.squares.e6);
            new Piece(Piece.BLACK, board.squares.d6);
            new Piece(Piece.WHITE, board.squares.f4);
            new Piece(Piece.BLACK, board.squares.c3);
            new Piece(Piece.WHITE, board.squares.b6);

            knight.getSquares();

            assert.equal(knight.squares[ar.MOVE].length, 4);
            assert.ok(knight.squares.includes(ar.MOVE, board.squares.c7));
            assert.ok(knight.squares.includes(ar.MOVE, board.squares.f6));
            assert.ok(knight.squares.includes(ar.MOVE, board.squares.e3));
            assert.ok(knight.squares.includes(ar.MOVE, board.squares.b4));

            assert.equal(knight.squares[ar.ATTACK].length, 2);
            assert.ok(knight.squares.includes(ar.ATTACK, board.squares.e7));
            assert.ok(knight.squares.includes(ar.ATTACK, board.squares.c3));

            assert.equal(knight.squares[ar.COVER].length, 2);
            assert.ok(knight.squares.includes(ar.COVER, board.squares.b6));
            assert.ok(knight.squares.includes(ar.COVER, board.squares.f4));

            assert.equal(knight.squares[ar.CONTROL].length, 8);
            assert.ok(knight.squares.includes(ar.CONTROL, board.squares.b6));
            assert.ok(knight.squares.includes(ar.CONTROL, board.squares.c7));
            assert.ok(knight.squares.includes(ar.CONTROL, board.squares.e7));
            assert.ok(knight.squares.includes(ar.CONTROL, board.squares.f6));
            assert.ok(knight.squares.includes(ar.CONTROL, board.squares.f4));
            assert.ok(knight.squares.includes(ar.CONTROL, board.squares.e3));
            assert.ok(knight.squares.includes(ar.CONTROL, board.squares.c3));
            assert.ok(knight.squares.includes(ar.CONTROL, board.squares.b4));

            assert.equal(knight.squares[ar.XRAY], null);
        });

        it('should check knight get bind', function () {
            let board = new Board();
            let knight = new Knight(Piece.BLACK, board.squares.f6);

            knight.getSquares();

            assert.equal(knight.squares[ar.MOVE].length, 8);
            assert.equal(knight.squares[ar.ATTACK], null);
            assert.equal(knight.squares[ar.COVER], null);
            assert.equal(knight.squares[ar.CONTROL].length, 8);
            assert.equal(knight.squares[ar.XRAY], null);

            knight.getBind();

            assert.equal(knight.squares[ar.MOVE], null);
            assert.equal(knight.squares[ar.ATTACK], null);
            assert.equal(knight.squares[ar.COVER], null);
            assert.equal(knight.squares[ar.CONTROL], null);
            assert.equal(knight.squares[ar.XRAY], null);
        });
    });

    describe('Test Bishop', function () {
        it('should check initial bishop data', function () {
            let bishop = new Bishop(Piece.WHITE, new Square('f8'));
            assert.ok(bishop.isBishop);
            assert.equal(bishop.kind, "bishop");
        });

        it('should check bishop squares', function () {
            let board = new Board();
            let bishop = new Bishop(Piece.BLACK, board.squares.f4);

            new Piece(Piece.WHITE, board.squares.g5);
            new Piece(Piece.BLACK, board.squares.h2);
            new Piece(Piece.WHITE, board.squares.b8);
            new Piece(Piece.BLACK, board.squares.d6);

            bishop.getSquares();

            assert.equal(bishop.squares[ar.MOVE].length, 5);
            assert.ok(bishop.squares.includes(ar.MOVE, board.squares.e5));
            assert.ok(bishop.squares.includes(ar.MOVE, board.squares.g3));
            assert.ok(bishop.squares.includes(ar.MOVE, board.squares.e3));
            assert.ok(bishop.squares.includes(ar.MOVE, board.squares.d2));
            assert.ok(bishop.squares.includes(ar.MOVE, board.squares.c1));

            assert.equal(bishop.squares[ar.ATTACK].length, 1);
            assert.ok(bishop.squares.includes(ar.ATTACK, board.squares.g5));

            assert.equal(bishop.squares[ar.COVER].length, 2);
            assert.ok(bishop.squares.includes(ar.COVER, board.squares.d6));
            assert.ok(bishop.squares.includes(ar.COVER, board.squares.h2));

            assert.equal(bishop.squares[ar.CONTROL].length, 8);
            assert.ok(bishop.squares.includes(ar.CONTROL, board.squares.e5));
            assert.ok(bishop.squares.includes(ar.CONTROL, board.squares.g3));
            assert.ok(bishop.squares.includes(ar.CONTROL, board.squares.e3));
            assert.ok(bishop.squares.includes(ar.CONTROL, board.squares.d2));
            assert.ok(bishop.squares.includes(ar.CONTROL, board.squares.c1));
            assert.ok(bishop.squares.includes(ar.CONTROL, board.squares.g5));
            assert.ok(bishop.squares.includes(ar.CONTROL, board.squares.d6));
            assert.ok(bishop.squares.includes(ar.CONTROL, board.squares.h2));

            assert.equal(bishop.squares[ar.XRAY].length, 3);
            assert.ok(bishop.squares.includes(ar.XRAY, board.squares.h6));
            assert.ok(bishop.squares.includes(ar.XRAY, board.squares.c7));
            assert.ok(bishop.squares.includes(ar.XRAY, board.squares.b8));
        });
    });
});
