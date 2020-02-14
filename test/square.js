var assert = require('assert');
var jschess = require('../');
var SquareName = jschess.square.SquareName;
var SquareCoordinates = jschess.square.SquareCoordinates;
var SquareOnEdge = jschess.square.SquareOnEdge;
var Square = jschess.square.Square;
var SquaresLine = jschess.square.SquaresLine;


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

    describe('Test SquaresLine', function () {
        it('should throw error if squares are not on the same line', function () {
            let e4 = new Square('e4');
            assert.throws(() => {SquaresLine(e4, new Square('c5'));});
            assert.throws(() => {SquaresLine(e4, new Square('f8'));});
            assert.throws(() => {SquaresLine(e4, new Square('h2'));});
            assert.throws(() => {SquaresLine(e4, new Square('d1'));});
        });

        it('should get line data between two squares', function () {
            let c3 = new Square('c3');

            let a5 = new Square('a5');
            let c3a5 = new SquaresLine(c3, a5);
            assert.equal(c3a5._direction.x, -1);
            assert.equal(c3a5._direction.y, 1);
            assert.ok(!c3a5.betweenSquaresNames().includes('c3'));
            assert.ok(c3a5.betweenSquaresNames().includes('b4'));
            assert.ok(!c3a5.betweenSquaresNames().includes('a5'));
            assert.equal(c3a5.betweenSquaresCount(), 1);
            assert.ok(c3a5.betweenSquaresNames(true).includes('c3'));
            assert.ok(c3a5.betweenSquaresNames(true).includes('b4'));
            assert.ok(!c3a5.betweenSquaresNames(true).includes('a5'));
            assert.equal(c3a5.betweenSquaresCount(true), 2);
            assert.ok(!c3a5.betweenSquaresNames(false, true).includes('c3'));
            assert.ok(c3a5.betweenSquaresNames(false, true).includes('b4'));
            assert.ok(c3a5.betweenSquaresNames(false, true).includes('a5'));
            assert.equal(c3a5.betweenSquaresCount(false, true), 2);
            assert.ok(c3a5.betweenSquaresNames(true, true).includes('c3'));
            assert.ok(c3a5.betweenSquaresNames(true, true).includes('b4'));
            assert.ok(c3a5.betweenSquaresNames(true, true).includes('a5'));
            assert.equal(c3a5.betweenSquaresCount(true, true), 3);

            let f3 = new Square('f3');
            let c3f3 = new SquaresLine(c3, f3);
            assert.equal(c3f3._direction.x, 1);
            assert.equal(c3f3._direction.y, 0);
            assert.ok(!c3f3.betweenSquaresNames().includes('c3'));
            assert.ok(c3f3.betweenSquaresNames().includes('d3'));
            assert.ok(c3f3.betweenSquaresNames().includes('e3'));
            assert.ok(!c3f3.betweenSquaresNames().includes('f3'));
            assert.equal(c3f3.betweenSquaresCount(), 2);
            assert.ok(c3f3.betweenSquaresNames(true).includes('c3'));
            assert.ok(c3f3.betweenSquaresNames(true).includes('d3'));
            assert.ok(c3f3.betweenSquaresNames(true).includes('e3'));
            assert.ok(!c3f3.betweenSquaresNames(true).includes('f3'));
            assert.equal(c3f3.betweenSquaresCount(true), 3);
            assert.ok(!c3f3.betweenSquaresNames(false, true).includes('c3'));
            assert.ok(c3f3.betweenSquaresNames(false, true).includes('d3'));
            assert.ok(c3f3.betweenSquaresNames(false, true).includes('e3'));
            assert.ok(c3f3.betweenSquaresNames(false, true).includes('f3'));
            assert.equal(c3f3.betweenSquaresCount(false, true), 3);
            assert.ok(c3f3.betweenSquaresNames(true, true).includes('c3'));
            assert.ok(c3f3.betweenSquaresNames(true, true).includes('d3'));
            assert.ok(c3f3.betweenSquaresNames(true, true).includes('e3'));
            assert.ok(c3f3.betweenSquaresNames(true, true).includes('f3'));
            assert.equal(c3f3.betweenSquaresCount(true, true), 4);

            let c7 = new Square('c7');
            let c3c7 = new SquaresLine(c3, c7);
            assert.equal(c3c7._direction.x, 0);
            assert.equal(c3c7._direction.y, 1);
            assert.ok(!c3c7.betweenSquaresNames().includes('c3'));
            assert.ok(c3c7.betweenSquaresNames().includes('c4'));
            assert.ok(c3c7.betweenSquaresNames().includes('c5'));
            assert.ok(c3c7.betweenSquaresNames().includes('c6'));
            assert.ok(!c3c7.betweenSquaresNames().includes('c7'));
            assert.equal(c3c7.betweenSquaresCount(), 3);
            assert.ok(c3c7.betweenSquaresNames(true).includes('c3'));
            assert.ok(c3c7.betweenSquaresNames(true).includes('c4'));
            assert.ok(c3c7.betweenSquaresNames(true).includes('c5'));
            assert.ok(c3c7.betweenSquaresNames(true).includes('c6'));
            assert.ok(!c3c7.betweenSquaresNames(true).includes('c7'));
            assert.equal(c3c7.betweenSquaresCount(true), 4);
            assert.ok(!c3c7.betweenSquaresNames(false, true).includes('c3'));
            assert.ok(c3c7.betweenSquaresNames(false, true).includes('c4'));
            assert.ok(c3c7.betweenSquaresNames(false, true).includes('c5'));
            assert.ok(c3c7.betweenSquaresNames(false, true).includes('c6'));
            assert.ok(c3c7.betweenSquaresNames(false, true).includes('c7'));
            assert.equal(c3c7.betweenSquaresCount(false, true), 4);
            assert.ok(c3c7.betweenSquaresNames(true, true).includes('c3'));
            assert.ok(c3c7.betweenSquaresNames(true, true).includes('c4'));
            assert.ok(c3c7.betweenSquaresNames(true, true).includes('c5'));
            assert.ok(c3c7.betweenSquaresNames(true, true).includes('c6'));
            assert.ok(c3c7.betweenSquaresNames(true, true).includes('c7'));
            assert.equal(c3c7.betweenSquaresCount(true, true), 5);
        });
    });

    describe('Test Square', function () {
        it('should get square name value by square coordinates value', function () {
            assert.equal(Square.coordinatesToName(1, 5), 'b6');
            assert.equal(Square.coordinatesToName(3, 1), 'd2');
            assert.equal(Square.coordinatesToName(4, 4), 'e5');
            assert.equal(Square.coordinatesToName(6, 0), 'g1');
            assert.equal(Square.coordinatesToName(7, 3), 'h4');
        });

        it('should throw error by create with no arguments', function () {
            assert.throws(() => {new Square();});
        });

        it('should check cretion with coordinates', function () {
            let square = new Square([3, 5]);
            assert.equal(square.name.value, 'd6');
        });

        it('should check is light', function () {
            let square = new Square('c4');
            assert.ok(square.isLight);
            square = new Square('f2');
            assert.ok(!square.isLight);
        });

        it('should check piece placement', function () {
            let square = new Square('a1');
            assert.equal(square.piece, null);
            square.placePiece('piece');
            assert.equal(square.piece, 'piece');
            square.removePiece();
            assert.equal(square.piece, null);
        });

        it('should check the same squares', function () {
            let square = new Square('f5');
            assert.ok(square.theSame(new Square('f5')));
            assert.ok(!square.theSame(new Square('c2')));
        });

        it('should check square location', function () {
            let square = new Square('d5');
            assert.ok(square.onVertical('d'));
            assert.ok(!square.onVertical('g'));
            assert.ok(square.onRank('5'));
            assert.ok(!square.onRank('2'));
        });

        it('should check between one square and other square data', function () {
            let square = new Square('g7');
            assert.ok(square.getBetweenSquaresNames(new Square('b2')).includes('e5'));
            assert.ok(square.getBetweenSquaresNames(new Square('b2'), true).includes('g7'));
            assert.ok(square.getBetweenSquaresNames(new Square('b2'), true, true).includes('g7'));
            assert.ok(square.getBetweenSquaresNames(new Square('b2'), false, true).includes('b2'));
            assert.ok(square.getBetweenSquaresNames(new Square('b2'), true, true).includes('b2'));
            assert.ok(square.getBetweenSquaresCount(new Square('g4')), 2);
            assert.ok(square.getBetweenSquaresCount(new Square('g4'), true, false), 3);
            assert.ok(square.getBetweenSquaresCount(new Square('g4'), false, true), 3);
            assert.ok(square.getBetweenSquaresCount(new Square('g4'), true, true), 4);
        });
    });
});
