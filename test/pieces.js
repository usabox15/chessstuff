var assert = require('assert');
var jschess = require('../');
var Square = jschess.square.Square;
var Piece = jschess.pieces.Piece;
var ar = jschess.relations.ActionsRelation;


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
    });
});
