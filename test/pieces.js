var assert = require('assert');
var jschess = require('../');
var Square = jschess.square.Square;
var Piece = jschess.pieces.Piece;
var Knight = jschess.pieces.Knight;
var Bishop = jschess.pieces.Bishop;
var Rook = jschess.pieces.Rook;
var Queen = jschess.pieces.Queen;
var King = jschess.pieces.King;
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
            let pieceSquare = new Square('g1');
            let nextSquare = new Square('d4');
            let afterNextSquare = new Square('c5');
            let piece1 = new Piece(Piece.WHITE, pieceSquare);
            piece1._isLinear = true;
            let piece2 = new Piece(Piece.BLACK, nextSquare);
            piece2.isKing = true;
            piece2.checkers = {
                items: [],
                add: function(piece) {
                    this.items.push(piece);
                }
            };
            assert.ok(!piece1.squares.includes(ar.CONTROL, afterNextSquare));
            piece1._nextSquareAction(nextSquare);
            assert.ok(!piece1.squares.includes(ar.CONTROL, afterNextSquare));
            piece1._nextSquareAction(afterNextSquare);
            assert.ok(piece1.squares.includes(ar.CONTROL, afterNextSquare));
        });

        it('should make a piece as binder to next square piece before King', function () {
            let pieceSquare = new Square('h8');
            let nextSquare = new Square('f6');
            let kingSquare = new Square('a1');
            let piece1 = new Piece(Piece.WHITE, pieceSquare);
            piece1._isLinear = true;
            let piece2 = new Piece(Piece.BLACK, nextSquare);
            let piece3 = new Piece(Piece.BLACK, kingSquare);
            piece3.isKing = true;
            assert.ok(!piece2.binder);
            piece1._nextSquareAction(nextSquare);
            assert.ok(!piece2.binder);
            piece1._nextSquareAction(kingSquare);
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
    });
});
