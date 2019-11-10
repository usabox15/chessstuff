var assert = require('assert');
var jschess = require('../');
var SquareName = jschess.square.SquareName;
var SquareCoordinates = jschess.square.SquareCoordinates;
var Square = jschess.square.Square;


describe('Test square', function () {
    describe('Test SquareName', function () {
        it('should throw error by wrong name', function () {
            assert.throws(() => { new SquareName('a9');});
            assert.throws(() => { new SquareName('i1');});
        });

        it('should check instance data', function () {
            let a1 = new SquareName('a1');
            assert.equal(a1.symbol, 'a');
            assert.equal(a1.number, '1');
            assert.equal(a1.value, 'a1');
        });
    });
    describe('Test SquareCoordinates', function () {
        it('should check correct coordinates', function () {
            assert.ok(SquareCoordinates.correctCoordinate(2));
            assert.ok(!SquareCoordinates.correctCoordinate(8));
            assert.ok(SquareCoordinates.correctCoordinates(3, 7));
            assert.ok(!SquareCoordinates.correctCoordinates(5, 9));
        });

        it('should throw error by wrong coordinates', function () {
            assert.throws(() => { new SquareCoordinates([0, 8]);});
            assert.throws(() => { new SquareCoordinates([8, 0]);});
        });

        it('should check instance data', function () {
            let a6 = new SquareCoordinates([0, 5]);
            assert.equal(a6.x, 0);
            assert.equal(a6.y, 5);
            assert.equal(a6.value.length, 2);
            assert.ok(a6.value.includes(0));
            assert.ok(a6.value.includes(5));
        });
    });
});
