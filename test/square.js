var assert = require('assert');
var jschess = require('../');
var SquareName = jschess.square.SquareName;
var SquareCoordinates = jschess.square.SquareCoordinates;
var SquareOnEdge = jschess.square.SquareOnEdge;
var Square = jschess.square.Square;


describe('Test square', function () {
    describe('Test SquareName', function () {
        it('should throw error by wrong name', function () {
            assert.throws(() => {new SquareName('a9');});
            assert.throws(() => {new SquareName('i1');});
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
            assert.throws(() => {new SquareCoordinates([0, 8]);});
            assert.throws(() => {new SquareCoordinates([8, 0]);});
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
    describe('Test SquareOnEdge', function () {
        it('should define location', function () {
            let a1OE = new SquareOnEdge(new SquareCoordinates([0, 0]));
            assert.ok(!a1OE.up && !a1OE.right && a1OE.down && a1OE.left);

            let a4OE = new SquareOnEdge(new SquareCoordinates([0, 3]));
            assert.ok(!a4OE.up && !a4OE.right && !a4OE.down && a4OE.left);

            let a8OE = new SquareOnEdge(new SquareCoordinates([0, 7]));
            assert.ok(a8OE.up && !a8OE.right && !a8OE.down && a8OE.left);

            let e8OE = new SquareOnEdge(new SquareCoordinates([4, 7]));
            assert.ok(e8OE.up && !e8OE.right && !e8OE.down && !e8OE.left);

            let h8OE = new SquareOnEdge(new SquareCoordinates([7, 7]));
            assert.ok(h8OE.up && h8OE.right && !h8OE.down && !h8OE.left);

            let h5OE = new SquareOnEdge(new SquareCoordinates([7, 4]));
            assert.ok(!h5OE.up && h5OE.right && !h5OE.down && !h5OE.left);

            let h1OE = new SquareOnEdge(new SquareCoordinates([7, 0]));
            assert.ok(!h1OE.up && h1OE.right && h1OE.down && !h1OE.left);

            let d1OE = new SquareOnEdge(new SquareCoordinates([3, 0]));
            assert.ok(!d1OE.up && !d1OE.right && d1OE.down && !d1OE.left);

            let e4OE = new SquareOnEdge(new SquareCoordinates([4, 3]));
            assert.ok(!e4OE.up && !e4OE.right && !e4OE.down && !e4OE.left);
        });
    });
});
