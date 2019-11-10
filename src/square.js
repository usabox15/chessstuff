var relations = require('./relations');


class SquareName {
    /*
    Human readable chess board square name.
    Create param:
      - name [string] (include two characters - symbol and number, for example 'a1').
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
    */

    static symbols = ["a", "b", "c", "d", "e", "f", "g", "h"];
    static numbers = ["1", "2", "3", "4", "5", "6", "7", "8"];

    constructor(name) {
        let symbol = name[0];
        let number = name[1];
        if (!SquareName.symbols.includes(symbol)) {
            throw Error(`Wrong symbol (${symbol}) passed`);
        }
        if (!SquareName.numbers.includes(number)) {
            throw Error(`Wrong number (${number}) passed`);
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
    Create param:
      - coordinates [Array] (include two numbers - square coordinates from 0 to 7, for example [0, 0]).
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
    */

    static numbers = [0, 1, 2, 3, 4, 5, 6, 7];

    static correctCoordinate(coordinate) {
        return SquareCoordinates.numbers.includes(coordinate);
    }

    static correctCoordinates(x, y) {
        return SquareCoordinates.correctCoordinate(x) && SquareCoordinates.correctCoordinate(y);
    }

    constructor(coordinates) {
        let x = coordinates[0];
        let y = coordinates[1];
        if (!SquareCoordinates.correctCoordinate(x)) {
            throw Error(`Wrong x value (${x}) passed`);
        }
        if (!SquareCoordinates.correctCoordinate(y)) {
            throw Error(`Wrong y value (${y}) passed`);
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


class Square {
    /*
    Chess board square.
    There are create params:
      - name [string] (SquareName class create param);
      - coordinates [Array] (SquareCoordinates class create param).
    To create instance you need to pass one of this params.
    */

    static symbolToNumber = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7};
    static numberToSymbol = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"};

    constructor(name=null, coordinates=null) {
        if (name) {
            this._name = new SquareName(name);
            this._coordinates = new SquareCoordinates([Square.symbolToNumber[this._name.symbol], +(this._name.number - 1)]);
        }
        else if (coordinates) {
            this._coordinates = new SquareCoordinates(coordinates);
            this._name = new SquareName(Square.numberToSymbol[this._coordinates.x] + (this._coordinates.y + 1));
        }
        else {
            throw Error("To create Square instance you need to pass either name or coordinates param");
        }
        this._piece = null;
        this.pieces = new relations.ActionsRelation(this, 'squares');
    }

    static coordinatesToName(x, y) {
        return Square.numberToSymbol[x] + (y + 1);
    }

    get name() {
        return this._name;
    }

    get coordinates() {
        return this._coordinates;
    }

    get piece() {
        return this._piece;
    }

    get onUpEdge() {
        return this.coordinates.y == 7;
    }

    get onRightEdge() {
        return this.coordinates.x == 7;
    }

    get onDownEdge() {
        return this.coordinates.y == 0;
    }

    get onLeftEdge() {
        return this.coordinates.x == 0;
    }

    placePiece(piece) {
        this._piece = piece;
    }

    removePiece() {
        this._piece = null;
    }

    theSame(otherSquare) {
        return this.name.value === otherSquare.name.value;
    }

    onVertical(vertical) {
        return this.name.symbol === vertical;
    }

    onHorizontal(horizontal) {
        return this.name.number == horizontal;
    }

    _getLinedCheckerDirection(otherSquare) {
        // get direction of distance between this square and other one
        let dif = {x: 0, y: 0};
        for (let i of ['x', 'y']) {
            if (otherSquare.coordinates[i] > this.coordinates[i]) {
                dif[i] = -1;
            }
            else if (otherSquare.coordinates[i] < this.coordinates[i]) {
                dif[i] = 1;
            }
        }
        return dif;
    }

    getBetweenSquaresNames(otherSquare, include=false) {
        // get names of squares between this square and other one
        let dx = Math.abs(otherSquare.coordinates.x - this.coordinates.x);
        let dy = Math.abs(otherSquare.coordinates.y - this.coordinates.y);
        if (dx != dy && dx != 0 && dy != 0) {
            return [];
        }
        let betweenSquaresNames = [];
        let dif = this._getLinedCheckerDirection(otherSquare);
        let distance = Math.max(dx, dy);
        let start = include ? 0 : 1;
        for (let i = start; i <= distance - start; i++) {
            let x = otherSquare.coordinates.x + i * dif.x;
            let y = otherSquare.coordinates.y + i * dif.y;
            betweenSquaresNames.push(Square.coordinatesToName(x, y));
        }
        return betweenSquaresNames;
    }

    getBetweenSquaresCount(otherSquare) {
        // get count of squares between this square and other one
        return this.getBetweenSquaresNames(otherSquare).length;
    }
}


module.exports = {
    Square: Square,
    SquareCoordinates: SquareCoordinates,
    SquareName: SquareName
};
