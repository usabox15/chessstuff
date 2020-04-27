/*
Copyright 2020 Yegor Bitensky

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


var relations = require('./relations');


class SquareName {
    /*
    Human readable chess board square name.
      _ _ _ _ _ _ _ _
    8|_|_|_|_|_|_|_|_|
    7|_|_|_|_|_|_|_|_|
    6|_|_|_|_|_|_|_|_|
    5|_|_|_|_|_|_|_|_|
    4|_|_|_|_|_|_|_|_|
    3|_|_|_|_|_|_|_|_|
    2|_|_|_|_|_|_|_|_|
    1|_|_|_|_|_|_|_|_|
      a b c d e f g h

    Example:
        new SquareName('a1');
    */

    static symbols = ["a", "b", "c", "d", "e", "f", "g", "h"]; // possible symbols
    static numbers = ["1", "2", "3", "4", "5", "6", "7", "8"]; // possible numbers

    constructor(name) {
        /*
        Params:
            name {string} - two characters square name (includes symbol and number).
        */

        let symbol = name[0];
        let number = name[1];
        if (!SquareName.symbols.includes(symbol)) {
            throw Error(`Wrong symbol (${symbol}) passed. Try one of ${SquareName.symbols}`);
        }
        if (!SquareName.numbers.includes(number)) {
            throw Error(`Wrong number (${number}) passed. Try one of ${SquareName.numbers}`);
        }
        this._symbol = symbol;
        this._number = number;
        this._value = `${symbol}${number}`;
    }

    get symbol() {
        return this._symbol;
    }

    get number() {
        return this._number;
    }

    get value() {
        return this._value;
    }
}


class SquareCoordinates {
    /*
    Chess board square coordinates.
      _ _ _ _ _ _ _ _
    7|_|_|_|_|_|_|_|_|
    6|_|_|_|_|_|_|_|_|
    5|_|_|_|_|_|_|_|_|
    4|_|_|_|_|_|_|_|_|
    3|_|_|_|_|_|_|_|_|
    2|_|_|_|_|_|_|_|_|
    1|_|_|_|_|_|_|_|_|
    0|_|_|_|_|_|_|_|_|
      0 1 2 3 4 5 6 7

    Example:
        new SquareCoordinates([0, 0]);
    */

    static numbers = [0, 1, 2, 3, 4, 5, 6, 7]; // possible numbers

    static correctCoordinate(coordinate) {
        /*
        Check whether coordinate is correct or not.
        Params:
            coordinate {number}.
        */

        return SquareCoordinates.numbers.includes(coordinate);
    }

    static correctCoordinates(x, y) {
        /*
        Check whether coordinates (x and y) are correct or not.
        Params:
            x {number};
            y {number}.
        */

        return SquareCoordinates.correctCoordinate(x) && SquareCoordinates.correctCoordinate(y);
    }

    constructor(coordinates) {
        /*
        Params:
            coordinates {Array} - two numbers from 0 to 7.
        */

        let x = coordinates[0];
        let y = coordinates[1];
        if (!SquareCoordinates.correctCoordinate(x)) {
            throw Error(`Wrong x value (${x}) passed. Try one of ${SquareCoordinates.numbers}`);
        }
        if (!SquareCoordinates.correctCoordinate(y)) {
            throw Error(`Wrong y value (${y}) passed. Try one of ${SquareCoordinates.numbers}`);
        }
        this._x = x;
        this._y = y;
        this._value = [x, y];
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get value() {
        return this._value;
    }
}


class SquareOnEdge {
    // Chess board square location on edge.

    constructor(coordinates) {
        /*
        Params:
            coordinates {SquareCoordinates}.
        */

        this._up = false;
        this._right = false;
        this._down = false;
        this._left = false;
        if (coordinates.y == 7) {
            this._up = true;
        } else if (coordinates.y == 0) {
            this._down = true;
        }
        if (coordinates.x == 7) {
            this._right = true;
        } else if (coordinates.x == 0) {
            this._left = true;
        }
    }

    get up() {
        return this._up;
    }

    get right() {
        return this._right;
    }

    get down() {
        return this._down;
    }

    get left() {
        return this._left;
    }
}


class SquaresLine {
    // Line between two chess board squares.

    constructor(startSquare, endSquare) {
        /*
        Params:
            startSquare {Square};
            endSquare {Square}.
        */

        this._startSquare = startSquare;
        this._endSquare = endSquare;
        this._dx = Math.abs(startSquare.coordinates.x - endSquare.coordinates.x);
        this._dy = Math.abs(startSquare.coordinates.y - endSquare.coordinates.y);
        this._direction = {x: 0, y: 0};
        this._betweenSquaresNames = [];
        this._betweenSquaresCount = 0;
        this._getBetweenSquaresData();
    }

    _checkOnTheSameLine() {
        // Throw error if squares aren't located on the same line

        if (this._dx != this._dy && this._dx != 0 && this._dy != 0) {
            throw Error(`
                Squares ${this._startSquare.name.value} and ${this._endSquare.name.value}
                aren't located on the same line (horizontal, vertical, diagonal).
            `);
        }
    }

    _getDirection() {
        // Get direction of distance between start square and end square

        this._checkOnTheSameLine();
        for (let i of ['x', 'y']) {
            if (this._startSquare.coordinates[i] > this._endSquare.coordinates[i]) {
                this._direction[i] = -1;
            }
            else if (this._startSquare.coordinates[i] < this._endSquare.coordinates[i]) {
                this._direction[i] = 1;
            }
        }
    }

    _getBetweenSquaresData() {
        // Get names and count of squares between start square and end square

        this._getDirection();
        let distance = Math.max(this._dx, this._dy);
        for (let i = 1; i <= distance - 1; i++) {
            let coordinates = [];
            for (let j of ['x', 'y']) {
                coordinates.push(this._startSquare.coordinates[j] + i * this._direction[j]);
            }
            this._betweenSquaresNames.push(Square.coordinatesToName(...coordinates));
        }
        this._betweenSquaresCount = this._betweenSquaresNames.length;
    }

    betweenSquaresNames(includeStart=false, includeEnd=false) {
        /*
        Get squares names between start square and end square
        Params:
            includeStart {boolean} - whether include start square name or not;
            includeEnd {boolean} - whether include end square name or not.
        */

        let start = includeStart ? [this._startSquare.name.value] : [];
        let end = includeEnd ? [this._endSquare.name.value] : [];
        return [...start, ...this._betweenSquaresNames, ...end];
    }

    betweenSquaresCount(includeStart=false, includeEnd=false) {
        /*
        Get squares count between start square and end square
        Params:
            includeStart {boolean} - whether include start square or not;
            includeEnd {boolean} - whether include end square or not.
        */

        return this._betweenSquaresCount + (includeStart ? 1 : 0) + (includeEnd ? 1 : 0);
    }
}


class SquareNeighbors {
    // Chess board square neighbors squares.

    static UP_LEFT = 'upLeft';
    static UP = 'up';
    static UP_RIGHT = 'upRight';
    static RIGHT = 'right';
    static DOWN_RIGHT = 'downRight';
    static DOWN = 'down';
    static DOWN_LEFT = 'downLeft';
    static LEFT = 'left';

    #validate = {
        [SquareNeighbors.UP_LEFT]: (square) => {return !square.onEdge.up && !square.onEdge.left;},
        [SquareNeighbors.UP]: (square) => {return !square.onEdge.up;},
        [SquareNeighbors.UP_RIGHT]: (square) => {return !square.onEdge.up && !square.onEdge.right;},
        [SquareNeighbors.RIGHT]: (square) => {return !square.onEdge.right;},
        [SquareNeighbors.DOWN_RIGHT]: (square) => {return !square.onEdge.down && !square.onEdge.right;},
        [SquareNeighbors.DOWN]: (square) => {return !square.onEdge.down;},
        [SquareNeighbors.DOWN_LEFT]: (square) => {return !square.onEdge.down && !square.onEdge.left;},
        [SquareNeighbors.LEFT]: (square) => {return !square.onEdge.left;},
    };
    #delta = {
        [SquareNeighbors.UP_LEFT]: {x: -1, y: 1},
        [SquareNeighbors.UP]: {x: 0, y: 1},
        [SquareNeighbors.UP_RIGHT]: {x: 1, y: 1},
        [SquareNeighbors.RIGHT]: {x: 1, y: 0},
        [SquareNeighbors.DOWN_RIGHT]: {x: 1, y: -1},
        [SquareNeighbors.DOWN]: {x: 0, y: -1},
        [SquareNeighbors.DOWN_LEFT]: {x: -1, y: -1},
        [SquareNeighbors.LEFT]: {x: -1, y: 0},
    };

    constructor(square) {
        /*
        Params:
            square {Square}.
        */

        this._square = square;
    }

    get upLeft() {
        return this._getSquare(SquareNeighbors.UP_LEFT);
    }

    get up() {
        return this._getSquare(SquareNeighbors.UP);
    }

    get upRight() {
        return this._getSquare(SquareNeighbors.UP_RIGHT);
    }

    get right() {
        return this._getSquare(SquareNeighbors.RIGHT);
    }

    get downRight() {
        return this._getSquare(SquareNeighbors.DOWN_RIGHT);
    }

    get down() {
        return this._getSquare(SquareNeighbors.DOWN);
    }

    get downLeft() {
        return this._getSquare(SquareNeighbors.DOWN_LEFT);
    }

    get left() {
        return this._getSquare(SquareNeighbors.LEFT);
    }

    _getSquare(kind) {
        /*
        Get neighbor.
        Params:
            kind {string} - direction name.
        */

        if (!this._square.board || !this.#validate[kind](this._square)) return null;
        let x = this._square.coordinates.x + this.#delta[kind].x;
        let y = this._square.coordinates.y + this.#delta[kind].y;
        let squareName = Square.coordinatesToName(x, y);
        return this._square.board.squares[squareName];
    }
}


class Square {
    // Chess board square.

    static symbolToNumber = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7};
    static numberToSymbol = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"};

    static coordinatesToName(x, y) {
        /*
        Convert square coordinates to square name.
        Params:
            x {number};
            y {number}.
        */

        if (!SquareCoordinates.correctCoordinates(x, y)) {
            throw Error(`Incorrect square coordinates (x - ${x}, y - ${y}).`);
        }
        return Square.numberToSymbol[x] + (y + 1);
    }

    constructor(identifier, board=null) {
        /*
        Params:
            identifier {string or Array} - SquareName or SquareCoordinates create param;
            board {Board} - link to the Board (optional).
        */

        if (typeof(identifier) === 'string') {
            this._name = new SquareName(identifier);
            let x = Square.symbolToNumber[this._name.symbol];
            let y = parseInt(this._name.number) - 1;
            this._coordinates = new SquareCoordinates([x, y]);
        } else if (Array.isArray(identifier)) {
            this._coordinates = new SquareCoordinates(identifier);
            let symbol = Square.numberToSymbol[this._coordinates.x];
            let number = this._coordinates.y + 1;
            this._name = new SquareName(`${symbol}${number}`);
        } else {
            throw Error("Wrong identifier passed. It need to be SquareName or SquareCoordinates create param.");
        }

        this._board = board;
        this._piece = null;
        this.pieces = new relations.ActionsRelation(this, 'squares');
        this.onEdge = new SquareOnEdge(this.coordinates);
        this.neighbors = new SquareNeighbors(this);
        this._isLight = this._getIsLight();
    }

    get name() {
        return this._name;
    }

    get coordinates() {
        return this._coordinates;
    }

    get board() {
        return this._board;
    }

    get piece() {
        return this._piece;
    }

    get isLight() {
        return this._isLight;
    }

    _getIsLight() {
        // Check whether square is light or not.

        let xIsEven = this.coordinates.x % 2 == 0;
        let yIsEven = this.coordinates.y % 2 == 0;
        return xIsEven && !yIsEven || !xIsEven && yIsEven;
    }

    placePiece(piece, refresh=true) {
        /*
        Place piece to square.
        Params:
            piece {Piece or its subclass};
            refresh {boolean} - whether need to refresh board after piece has been placed or not.
        */

        if (this.board && !piece.canBeReplacedTo(this)) {
            let positionIsSetted = (
                this.board.positionIsSetted
            &&
                (!this.board.transformation || this.name.value != this.board.transformation.toSquareName)
            );
            if (positionIsSetted) {
                throw Error('Board position is already setted.');
            }
            if (piece.isKing) {
                this.board.placeKing(piece);
            }
        }
        this._piece = piece;
        if (refresh && this.board) this.board.refreshAllSquares();
    }

    removePiece(refresh=true) {
        /*
        Remove piece from square.
        Params:
            refresh {boolean} - whether need to refresh board after piece has been placed or not.
        */

        this._piece = null;
        if (refresh && this.board) this.board.refreshAllSquares();
    }

    theSame(otherSquare) {
        /*
        Check square is the same with other square.
        Params:
            otherSquare {Square}.
        */

        return this.name.value === otherSquare.name.value;
    }

    onVertical(vertical) {
        /*
        Check square is placed on particular vertical.
        Params:
            vertical {string}.
        */

        return this.name.symbol === vertical;
    }

    onRank(rank) {
        /*
        Check square is placed on particular rank.
        Params:
            rank {number or string}.
        */

        return this.name.number == rank;
    }

    getBetweenSquaresNames(otherSquare, includeThisSquare=false, includeOtherSquare=false) {
        /*
        Get squares names between this square and other square
        Params:
            otherSquare {Square};
            includeThisSquare {boolean};
            includeOtherSquare {boolean}.
        */

        return new SquaresLine(this, otherSquare).betweenSquaresNames(includeThisSquare, includeOtherSquare);
    }

    getBetweenSquaresCount(otherSquare, includeThisSquare=false, includeOtherSquare=false) {
        /*
        Get squares count between this square and other square
        Params:
            otherSquare {Square};
            includeThisSquare {boolean};
            includeOtherSquare {boolean}.
        */

        return new SquaresLine(this, otherSquare).betweenSquaresCount(includeThisSquare, includeOtherSquare);
    }
}


module.exports = {
    Square: Square,
    SquareCoordinates: SquareCoordinates,
    SquareNeighbors: SquareNeighbors,
    SquareName: SquareName,
    SquareOnEdge: SquareOnEdge,
    SquaresLine: SquaresLine
};
