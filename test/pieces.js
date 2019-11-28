var assert = require('assert');
var jschess = require('../');
var Square = jschess.square.Square;
var Piece = jschess.pieces.Piece;


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
    });
});
