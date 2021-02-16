/*
Copyright 2020-2021 Yegor Bitensky

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


const { SquarePieces } = require('./relations');


/**
 * Relation between pieces and squares by piece action.
 * Human readable chess board square name.
 *   _ _ _ _ _ _ _ _
 * 8|_|_|_|_|_|_|_|_|
 * 7|_|_|_|_|_|_|_|_|
 * 6|_|_|_|_|_|_|_|_|
 * 5|_|_|_|_|_|_|_|_|
 * 4|_|_|_|_|_|_|_|_|
 * 3|_|_|_|_|_|_|_|_|
 * 2|_|_|_|_|_|_|_|_|
 * 1|_|_|_|_|_|_|_|_|
 *   a b c d e f g h
 *
 * ```javascript
 * new SquareName('a1');
 * ```
 *
 * @class
 */
class SquareName {

    static symbols = ["a", "b", "c", "d", "e", "f", "g", "h"]; // possible symbols
    static numbers = ["1", "2", "3", "4", "5", "6", "7", "8"]; // possible numbers

    /**
     * Creation.
     * @param {string} name - two characters square name (symbol and number).
     */
    constructor(name) {
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

/**
 * Chess board square coordinates.
 *   _ _ _ _ _ _ _ _
 * 7|_|_|_|_|_|_|_|_|
 * 6|_|_|_|_|_|_|_|_|
 * 5|_|_|_|_|_|_|_|_|
 * 4|_|_|_|_|_|_|_|_|
 * 3|_|_|_|_|_|_|_|_|
 * 2|_|_|_|_|_|_|_|_|
 * 1|_|_|_|_|_|_|_|_|
 * 0|_|_|_|_|_|_|_|_|
 *   0 1 2 3 4 5 6 7
 *
 * ```javascript
 * new SquareCoordinates([0, 0]);
 * ```
 *
 * @class
 */
class SquareCoordinates {

    static numbers = [0, 1, 2, 3, 4, 5, 6, 7]; // possible numbers

    /**
     * Check whether coordinate is correct or not.
     * @param {integer} coordinate - One of possible numbers.
     * @return {boolean} Whether coordinate is correct or not.
     */
    static correctCoordinate(coordinate) {
        return SquareCoordinates.numbers.includes(coordinate);
    }

    /**
     * Check whether coordinates (x and y) are correct or not.
     * @param {integer} x - One of possible numbers.
     * @param {integer} y - One of possible numbers.
     * @return {boolean} Whether coordinates are correct or not.
     */
    static correctCoordinates(x, y) {
        return SquareCoordinates.correctCoordinate(x) && SquareCoordinates.correctCoordinate(y);
    }

    /**
     * Creation.
     * @param {integer[]} coordinates - two numbers from possible numbers.
     */
    constructor(coordinates) {
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


/**
 * Chess board square location on edge.
 *
 * ```javascript
 * let coordinates = new SquareCoordinates([0, 0]);
 * new SquareOnEdge(coordinates);
 * ```
 *
 * @class
 */
class SquareOnEdge {

    /**
     * Creation.
     * @param {SquareCoordinates} coordinates - Square coordinates.
     */
    constructor(coordinates) {
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


/**
 * Line between two chess board squares.
 *
 * ```javascript
 * let startSquare = new Square('a1');
 * let endSquare = new Square('c3');
 * new SquaresLine(startSquare, endSquare);
 * ```
 *
 * @class
 */
class SquaresLine {

    /**
     * Creation.
     * @param {Square} startSquare - Start square.
     * @param {Square} endSquare - End square.
     */
    constructor(startSquare, endSquare) {
        this._dx = Math.abs(startSquare.coordinates.x - endSquare.coordinates.x);
        this._dy = Math.abs(startSquare.coordinates.y - endSquare.coordinates.y);
        if (this._dx != this._dy && this._dx != 0 && this._dy != 0) {
            throw Error(`
                Squares ${startSquare.name.value} and ${endSquare.name.value}
                aren't located on the same line (horizontal, vertical, diagonal).
            `);
        }

        this._startSquare = startSquare;
        this._endSquare = endSquare;

        this._betweenSquaresNames = [];
        this._betweenSquaresCount = 0;
        this._getBetweenSquaresData();
    }

    /**
     * Get squares names between start square and end square.
     * @param {boolean} includeStart - Whether include start square name or not.
     * @param {boolean} includeEnd - Whether include end square name or not.
     * @return {string[]} Between squares names.
     */
    betweenSquaresNames(includeStart=false, includeEnd=false) {
        return [
            ...(includeStart ? [this._startSquare.name.value] : []),
            ...this._betweenSquaresNames,
            ...(includeEnd ? [this._endSquare.name.value] : []),
        ];
    }

    /**
     * Get squares count between start square and end square.
     * @param {boolean} includeStart - Whether include start square or not.
     * @param {boolean} includeEnd - Whether include end square or not.
     * @return {integer} Between squares count.
     */
    betweenSquaresCount(includeStart=false, includeEnd=false) {
        return this._betweenSquaresCount + (includeStart ? 1 : 0) + (includeEnd ? 1 : 0);
    }

    /** Get names and count of squares between start square and end square. */
    _getBetweenSquaresData() {
        // Direction of distance between start square and end square
        let direction = {x: 0, y: 0};
        for (let i of ['x', 'y']) {
            if (this._startSquare.coordinates[i] > this._endSquare.coordinates[i]) {
                direction[i] = -1;
            } else if (this._startSquare.coordinates[i] < this._endSquare.coordinates[i]) {
                direction[i] = 1;
            }
        }

        let distance = Math.max(this._dx, this._dy);
        for (let i = 1; i < distance; i++) {
            let coordinates = [];
            for (let j of ['x', 'y']) {
                coordinates.push(this._startSquare.coordinates[j] + i * direction[j]);
            }
            this._betweenSquaresNames.push(Square.coordinatesToName(...coordinates));
        }
        this._betweenSquaresCount = this._betweenSquaresNames.length;
    }
}


/**
 * Chess board square neighbors squares.
 *
 * ```javascript
 * let square = new Square('a1');
 * new SquaresLine(square);
 * ```
 *
 * @class
 */
class SquareNeighbors {

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

    /**
     * Creation.
     * @param {Square} square - Square.
     */
    constructor(square) {
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

    /**
     * Get neighbor square.
     * @param {string} kind - Direction name.
     * @return {Square} Neighbor square.
     */
    _getSquare(kind) {
        if (!this._square.board || !this.#validate[kind](this._square)) return null;
        let x = this._square.coordinates.x + this.#delta[kind].x;
        let y = this._square.coordinates.y + this.#delta[kind].y;
        let squareName = Square.coordinatesToName(x, y);
        return this._square.board.squares[squareName];
    }
}


/**
 * Chess board square.
 *
 * ```javascript
 * new Square('a1');
 * ```
 *
 * @class
 */
class Square {

    static symbolToNumber = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7};
    static numberToSymbol = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"};

    /**
     * Convert square coordinates to square name.
     * @param {integer} x - X coordinate.
     * @param {integer} y - Y coordinate.
     * @return {string} Square name value.
     */
    static coordinatesToName(x, y) {
        if (!SquareCoordinates.correctCoordinates(x, y)) {
            throw Error(`Incorrect square coordinates (x - ${x}, y - ${y}).`);
        }
        x = Square.numberToSymbol[x];
        y++;
        return `${x}${y}`;
    }

    /**
     * Creation.
     * @param {Square} identifier - SquareName create param.
     * @param {integer[]} identifier - SquareCoordinates create param.
     * @param {Board} [board] - link to the Board.
     */
    constructor(identifier, board=null) {
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
        this.pieces = new SquarePieces(this);
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

    /** Check whether square is light or not. */
    _getIsLight() {
        let xIsEven = this.coordinates.x % 2 == 0;
        let yIsEven = this.coordinates.y % 2 == 0;
        return xIsEven && !yIsEven || !xIsEven && yIsEven;
    }

    /**
     * Place piece to square.
     * @param {Piece} piece - Piece.
     * @param {boolean} [refresh=true] - whether need to refresh board or not.
     */
    placePiece(piece, refresh=true) {
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

    /**
     * Remove piece from square.
     * @param {boolean} [refresh=true] - whether need to refresh board or not.
     */
    removePiece(refresh=true) {
        this._piece = null;
        if (refresh && this.board) this.board.refreshAllSquares();
    }

    /**
     * Check square is the same with other square.
     * @param {Square} otherSquare - Other square.
     * @return {boolean} Whether square is the same with other square or not.
     */
    theSame(otherSquare) {
        return this.name.value === otherSquare.name.value;
    }

    /**
     * Check square is placed on particular vertical.
     * @param {string} vertical - Vertical.
     * @return {boolean} Whether square is placed on particular vertical or not.
     */
    onVertical(vertical) {
        return this.name.symbol === vertical;
    }

    /**
     * Check square is placed on particular rank.
     * @param {string} rank - Rank.
     * @param {integer} rank - Rank.
     * @return {boolean} Whether square is placed on particular rank or not.
     */
    onRank(rank) {
        return this.name.number == rank;
    }

    /**
     * Get squares names between this square and other square.
     * @param {Square} otherSquare - Other square.
     * @param {boolean} [includeThisSquare=false] - Include this square.
     * @param {boolean} [includeOtherSquare=false] - Include other square.
     * @return {string[]} Between squares names.
     */
    getBetweenSquaresNames(otherSquare, includeThisSquare=false, includeOtherSquare=false) {
        return new SquaresLine(this, otherSquare).betweenSquaresNames(includeThisSquare, includeOtherSquare);
    }

    /**
     * Get squares count between this square and other square
     * @param {Square} otherSquare - Other square.
     * @param {boolean} [includeThisSquare=false] - Include this square.
     * @param {boolean} [includeOtherSquare=false] - Include other square.
     * @return {integer} Between squares count.
     */
    getBetweenSquaresCount(otherSquare, includeThisSquare=false, includeOtherSquare=false) {
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
