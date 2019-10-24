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


class ActionsRelation {
    /*
    Relation between whether piece and squares or square and pieces by piece action.
    */

    #allKinds = ['move', 'attack', 'xray', 'cover', 'control'];

    constructor(target) {
        this.target = target;
        this.refresh();
    }

    refresh(kind='all') {
        let kinds = kind === 'all' ? this.#allKinds : [kind];
        for (let kind of kinds) {
            if (this[kind]) {
                for (let item of this[kind]) {
                    item[this._getRelatedName(item)].remove(kind, this.target, false);
                }
                this[kind] = null;
            }
        }
    }

    add(kind, item, relate=true) {
        if (this[kind]) {
            this[kind].push(item);
        }
        else {
            this[kind] = [item];
        }
        if (relate) {
            item[this._getRelatedName(item)].add(kind, this.target, false);
        }
    }

    remove(kind, item, relate=true) {
        if (this[kind]) {
            this[kind] = this[kind].filter(i => !i.theSame(item));
            if (this[kind].length == 0) {
                this[kind] = null;
            }
        }
        if (relate) {
            item[this._getRelatedName(item)].remove(kind, this.target, false);
        }
    }

    includes(kind, item) {
        if (!this[kind]) {
            return false;
        }
        return this[kind].filter(i => i.theSame(item)).length != 0;
    }

    _getRelatedName(item) {
        return item instanceof Piece ? 'squares' : 'pieces';
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
        this.pieces = new ActionsRelation(this);
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


class PieceSquares extends ActionsRelation {
    constructor(target) {
        super(target);
    }

    limit(kind, acceptedNames) {
        // limit some kind of Piece actions squares by Array of accepted square names
        if (this[kind]) {
            this[kind] = this[kind].filter(square => acceptedNames.includes(square.name.value));
            for (let square of this[kind].filter(square => !acceptedNames.includes(square.name.value))) {
                square[this._getRelatedName(square)].remove(kind, this.target, false);
            }
        }
    }
}


class Piece {
    /*
    Base chess piece class.
    There are create params:
      - color [string] (white or black);
      - square [Square class instance] (where piece is placed).
    */

    constructor(color, square) {
        this.color = color;
        this.getPlace(square);
        this.squares = new PieceSquares(this);
        this.refreshSquareFinder();
        this.getInitState();
        this.getKind();
        this.isLinear = false;
        this._kind = null;
    }

    get stuck() {
        // check the piece get stucked
        return !this.squares.move && !this.squares.attack;
    }

    get kind() {
        return this._kind;
    }

    refreshSquareFinder() {
        this.sqrBeforeXray = null; // square before xray (always occupied by piece)
        this.xrayControl = false; // control square behind checked king (inline of piece attack)
        this.endOfALine = false;
    }

    refreshSquares() {
        this.squares.refresh();
        this.refreshSquareFinder();
    }

    getInitState() {
        this.binder = null;
    }

    getKind() {
        this.isPawn = false;
        this.isKnight = false;
        this.isBishop = false;
        this.isRook = false;
        this.isQueen = false;
        this.isKing = false;
    }

    getPlace(square) {
        this.square = square;
        square.placePiece(this);
    }

    theSame(otherPiece) {
        return this.square.theSame(otherPiece.square);
    }

    sameColor(otherPiece) {
        return this.color === otherPiece.color;
    }

    hasColor(color) {
        return this.color === color;
    }

    nextSquareAction(nextSquare) {
        // define next square kinds and handle logic with it
        if (this.sqrBeforeXray) {
            this.squares.add("xray", nextSquare);
            if (this.xrayControl) {
                this.squares.add("control", nextSquare);
                this.xrayControl = false;
            }
            if (nextSquare.piece) {
                let isOppKingSquare = nextSquare.piece.isKing && !this.sameColor(nextSquare.piece);
                let isOppPieceBeforeXray = !this.sameColor(this.sqrBeforeXray.piece);
                if (isOppKingSquare && isOppPieceBeforeXray) {
                    this.sqrBeforeXray.piece.binder = this;
                }
                this.endOfALine = true;
            }
        }
        else if (nextSquare.piece) {
            if (this.sameColor(nextSquare.piece)) {
                this.squares.add("cover", nextSquare);
            }
            else {
                this.squares.add("attack", nextSquare);
                if (nextSquare.piece.isKing) {
                    nextSquare.piece.checkers.add(this.square.piece);
                    this.xrayControl = true;
                }
            }
            this.squares.add("control", nextSquare);
            if (this.isLinear) this.sqrBeforeXray = nextSquare;
        }
        else {
            this.squares.add("move", nextSquare);
            this.squares.add("control", nextSquare);
        }
    }

    getTotalImmobilize() {
        this.squares.refresh();
    }

    getBind(kingSquare) {
        // make piece is binded
        this.squares.refresh("xray");
        let betweenSquares = this.binder.square.getBetweenSquaresNames(kingSquare, true);
        for (let actonKind of ["move", "attack", "cover"]) {
            this.squares.limit(actonKind, betweenSquares);
        }
    }

    getCheck(checker, betweenSquares) {
        // change Piece action abilities after its king was checked
        this.squares.refresh("cover");
        this.squares.refresh("xray");
        this.squares.limit("attack", [checker.square.name.value]);
        this.squares.limit("move", betweenSquares);
    }
}


class Pawn extends Piece {
    constructor(color, square) {
        super(color, square);
        this.isPawn = true;
        this.direction = color == "white" ? 1 : -1;
        this.enPassantSquare = null;
        this._kind = "pawn";
    }

    get onInitialHorizontal() {
        return (
            this.color == "white" && this.square.coordinates.y == 1
            ||
            this.color == "black" && this.square.coordinates.y == 6
        )
    }

    _getMoveCoordinates() {
        let moveSquaresCoordinates = [];
        moveSquaresCoordinates.push([
            this.square.coordinates.x,
            this.square.coordinates.y + 1 * this.direction
        ]);
        if (this.onInitialHorizontal) {
            moveSquaresCoordinates.push([
                this.square.coordinates.x,
                this.square.coordinates.y + 2 * this.direction
            ]);
        }
        return moveSquaresCoordinates;
    }

    _getMoveSquares(boardSquares) {
        for (let [x, y] of this._getMoveCoordinates()) {
            let square = boardSquares.getFromCoordinates(x, y);
            if (square.piece) break;
            this.squares.add("move", square);
        }
    }

    _getAttackCoordinates() {
        let attackSquaresCoordinates = [];
        if (!this.square.onRightEdge) {
            attackSquaresCoordinates.push([
                this.square.coordinates.x + 1,
                this.square.coordinates.y + 1 * this.direction
            ]);
        }
        if (!this.square.onLeftEdge) {
            attackSquaresCoordinates.push([
                this.square.coordinates.x - 1,
                this.square.coordinates.y + 1 * this.direction
            ]);
        }
        return attackSquaresCoordinates;
    }

    _getAttackSquares(boardSquares) {
        for (let [x, y] of this._getAttackCoordinates()) {
            let square = boardSquares.getFromCoordinates(x, y);
            this.squares.add("control", square);
            if (square.piece) {
                if (this.sameColor(square.piece)) {
                    this.squares.add("cover", square);
                }
                else {
                    this.squares.add("attack", square);
                    if (square.piece.isKing) {
                        square.piece.checkers.add(this.square.piece);
                    }
                }
            }
        }
        if (this.enPassantSquare) {
            this.squares.add("attack", this.enPassantSquare);
            this.enPassantSquare = null;
        }
    }

    getSquares(boardSquares) {
        this.refreshSquares();
        this._getMoveSquares(boardSquares);
        this._getAttackSquares(boardSquares);
    }
}


class StepPiece extends Piece {
    constructor(color, square) {
        super(color, square);
    }

    getStepSquares(boardSquares, stepPoints) {
        this.refreshSquareFinder();
        for (let stepPoint of stepPoints) {
            let x = this.square.coordinates.x + stepPoint.x;
            let y = this.square.coordinates.y + stepPoint.y;
            if (!SquareCoordinates.correctCoordinates(x, y)) continue;

            this.nextSquareAction(boardSquares.getFromCoordinates(x, y));
        }
    }
}


class Knight extends StepPiece {
    /*  Step points
         ___ ___ ___ ___ ___
        |   | B |   | C |   |
       2|___|___|___|___|___|
        | A |   |   |   | D |
       1|___|___|___|___|___|
        |   |   |Kni|   |   |
       0|___|___|ght|___|___|
        | H |   |   |   | E |
      -1|___|___|___|___|___|
        |   | G |   | F |   |
      -2|___|___|___|___|___|
          -2  -1   0   1   2
    */
    #stepPoints = [
        {x: -2, y: 1},  // A
        {x: -1, y: 2},  // B
        {x: 1, y: 2},   // C
        {x: 2, y: 1},   // D
        {x: 2, y: -1},  // E
        {x: 1, y: -2},  // F
        {x: -1, y: -2}, // G
        {x: -2, y: -1}, // H
    ];

    constructor(color, square) {
        super(color, square);
        this.isKnight = true;
        this._kind = "knight";
    }

    getSquares(boardSquares) {
        this.refreshSquares();
        this.getStepSquares(boardSquares, this.#stepPoints);
    }

    getBind() {
        this.getTotalImmobilize();
    }
}


class LinearPiece extends Piece {
    constructor(color, square) {
        super(color, square);
        this.isLinear = true;
    }

    getLinearSquares(boardSquares, directions) {
        for (let direction of directions) {
            this.refreshSquareFinder();
            let x = this.square.coordinates.x + direction.x;
            let y = this.square.coordinates.y + direction.y;
            while (SquareCoordinates.correctCoordinates(x, y)) {
                this.nextSquareAction(boardSquares.getFromCoordinates(x, y));
                if (this.endOfALine) break;
                x += direction.x;
                y += direction.y;
            }
        }
    }
}


class Bishop extends LinearPiece {
    /*  Directions
         ___ ___ ___
        | A |   | B |
       1|___|___|___|
        |   |Bis|   |
       0|___|hop|___|
        | D |   | C |
      -1|___|___|___|
          -1   0   1
    */
    static directions = [
        {x: -1, y: 1},  // A (upleft)
        {x: 1, y: 1},   // B (upright)
        {x: 1, y: -1},  // C (downright)
        {x: -1, y: -1}, // D (downleft)
    ];

    constructor(color, square) {
        super(color, square);
        this.isBishop = true;
        this._kind = "bishop";
    }

    getSquares(boardSquares) {
        this.refreshSquares();
        this.getLinearSquares(boardSquares, Bishop.directions);
    }
}


class Rook extends LinearPiece {
    /*  Directions
         ___ ___ ___
        |   | A |   |
       1|___|___|___|
        | D |Ro | B |
       0|___| ok|___|
        |   | C |   |
      -1|___|___|___|
          -1   0   1
    */
    static directions = [
        {x: 0, y: 1},  // A (up)
        {x: 1, y: 0},  // B (right)
        {x: 0, y: -1}, // C (down)
        {x: -1, y: 0}, // D (left)
    ];

    constructor(color, square) {
        super(color, square);
        this.isRook = true;
        this.side = square.onVertical("a") ? "long" : "short";
        this._kind = "rook";
    }

    getSquares(boardSquares) {
        this.refreshSquares();
        this.getLinearSquares(boardSquares, Rook.directions);
    }
}


class Queen extends LinearPiece {
    /*  Directions
         ___ ___ ___
        | A | B | C |
       1|___|___|___|
        | H |Que| D |
       0|___| en|___|
        | G | F | E |
      -1|___|___|___|
          -1   0   1

        Actualy use Bishop and Rook directions.
    */

    constructor(color, square) {
        super(color, square);
        this.isQueen = true;
        this._kind = "queen";
    }

    getSquares(boardSquares) {
        this.refreshSquares();
        this.getLinearSquares(boardSquares, Bishop.directions);
        this.getLinearSquares(boardSquares, Rook.directions);
    }
}


class KingCastle {
    constructor(color, boardSquares) {
        let horizontal = color == "white" ? "1" : "8";
        this.color = color;
        this.short = {
            accepted: true,
            square: boardSquares[`g${horizontal}`],
            free: [
                boardSquares[`f${horizontal}`],
                boardSquares[`g${horizontal}`]
            ],
            safe: [
                boardSquares[`f${horizontal}`],
                boardSquares[`g${horizontal}`]
            ],
        };
        this.long = {
            accepted: true,
            square: boardSquares[`c${horizontal}`],
            free: [
                boardSquares[`b${horizontal}`],
                boardSquares[`c${horizontal}`],
                boardSquares[`d${horizontal}`]
            ],
            safe: [
                boardSquares[`c${horizontal}`],
                boardSquares[`d${horizontal}`]
            ],
        };
    }

    _freeCastleRoad(side) {
        for (let square of this[side].free) {
            if (square.piece) return false;
        }
        return true;
    }

    _safeCastleRoad(side) {
        for (let square of this[side].safe) {
            if (square.pieces.control.filter(p => !p.hasColor(this.color)).length > 0) {
                return false;
            }
        }
        return true;
    }

    isLegal(side) {
        if (!this._freeCastleRoad(side)) {
            return false;
        }
        if (!this._safeCastleRoad(side)) {
            return false;
        }
        return true;
    }

    stop(side='all') {
        let sides = side == 'all' ? ['short', 'long'] : [side];
        for (let s of sides) {
            this[s].accepted = false;
        }
    }
}


class KingCheckers {
    constructor() {
        this._items = [];
    }

    get first() {
        return this._items.length > 0 ? this._items[0] : null;
    }

    get second() {
        return this._items.length == 2 ? this._items[1] : null;
    }

    get exist() {
        return this._items.length > 0;
    }

    get single() {
        return this._items.length == 1;
    }

    get several() {
        return this._items.length == 2;
    }

    add(piece) {
        this._items.push(piece);
    }
}


class King extends StepPiece {
    /*  Step points
         ___ ___ ___
        | A | B | C |
       1|___|___|___|
        | H |Ki | D |
       0|___| ng|___|
        | G | F | E |
      -1|___|___|___|
          -1   0   1
    */
    #stepPoints = [
        {x: -1, y: 1},  // A
        {x: 0, y: 1},   // B
        {x: 1, y: 1},   // C
        {x: 1, y: 0},   // D
        {x: 1, y: -1},  // E
        {x: 0, y: -1},  // F
        {x: -1, y: -1}, // G
        {x: -1, y: 0},  // H
    ];

    constructor(color, square, boardSquares) {
        super(color, square);
        this.castle = new KingCastle(color, boardSquares);
        this.isKing = true;
        this._kind = "king";
    }

    getInitState() {
        this.checkers = new KingCheckers;
    }

    _removeEnemyControlledSquares() {
        for (let kingAction of ["move", "attack"]) {
            if (this.squares[kingAction]) {
                let squaresToRemove = [];
                for (let square of this.squares[kingAction]) {
                    if (square.pieces.control.filter(p => !this.sameColor(p)).length > 0) {
                        squaresToRemove.push(square);
                    }
                }
                for (let square of squaresToRemove) {
                    this.squares.remove(kingAction, square);
                }
            }
        }
    }

    _addCastleMoves() {
        for (let side of ["long", "short"]) {
            if (this.castle[side].accepted && this.castle.isLegal(side)) {
                this.squares.add("move", this.castle[side].square);
            }
        }
    }

    _removeCastleMoves() {
        for (let side of ["long", "short"]) {
            this.squares.remove("move", this.castle[side].square);
        }
    }

    getSquares(boardSquares) {
        this.refreshSquares();
        this.getStepSquares(boardSquares, this.#stepPoints);
        this._removeEnemyControlledSquares();
        this._addCastleMoves();
    }

    getCheck() {
        this._removeCastleMoves();
    }
}


class BoardSquares {
    constructor() {
        this._create();
    }

    _create() {
        for (let symbol of SquareName.symbols) {
            for (let number of SquareName.numbers) {
                let name = `${symbol}${number}`;
                this[name] = new Square(name);
            }
        }
    }

    get occupied() {
        return Object.fromEntries(
            Object.entries(this)
            .filter(data => data[1].piece)
        );
    }

    getFromCoordinates(x, y) {
        return this[Square.coordinatesToName(x, y)];
    }

}


class BoardColors {
    #all = ["white", "black"];

    constructor(reversePriority=false) {
        this._priority = reversePriority ? [1, 0] : [0, 1];
    }

    get current() {
        return this.#all[this._priority[0]];
    }

    get opponent() {
        return this.#all[this._priority[1]];
    }

    get firstPriority() {
        return this._priority[0];
    }

    get secondPriority() {
        return this._priority[1];
    }

    changePriority() {
        this._priority = [this._priority[1], this._priority[0]]
    }
}


class Board {
    #piecesBox = {
        "pawn": Pawn,
        "knight": Knight,
        "bishop": Bishop,
        "rook": Rook,
        "queen": Queen,
        "king": King,
    };

    constructor() {
        this.squares = new BoardSquares;
        this.colors = new BoardColors;
        this.result = null;
        this.transformation = null;
        this.kings = {"white": null, "black": null};
    }

    get allPieces() {
        let pieces = [];
        for (let square of Object.values(this.squares.occupied)) {
            pieces.push(square.piece);
        }
        return pieces;
    }

    refreshState() {
        this.refreshAllSquares();
        this.colors.changePriority();
    }

    placePiece(color, kind, squareName) {
        let piece = new this.#piecesBox[kind](color, this.squares[squareName], this.squares);
        if (piece.isKing) {
            this.kings[color] = piece;
        }
    }

    removePiece(squareName) {
        this.squares[squareName].removePiece();
    }

    _castleRookMove(from, to, king) {
        let horizontal = king.castle.horizontal;
        if (from == `e${horizontal}`) {
            if (to == `c${horizontal}`) {
                this.movePiece(`a${horizontal}`, `d${horizontal}`, false);
            }
            else if (to == `g${horizontal}`) {
                this.movePiece(`h${horizontal}`, `f${horizontal}`, false);
            }
        }
    }

    stopKingCastleRights(color) {
       this.kings[color].castle.stop();
    }

    stopRookCastleRights(piece) {
        this.kings[piece.color].castle.stop(piece.side);
    }

    enPassantMatter(fromSquare, toSquare, pawn) {
        // jump through one square
        if (toSquare.getBetweenSquaresCount(fromSquare) == 1) {
            let enPassantSquare = this.squares.getFromCoordinates(
                toSquare.coordinates.x,
                toSquare.coordinates.y - pawn.direction
            );
            for (let [state, dx] of [["onRightEdge", 1], ["onLeftEdge", -1]]) {
                if (!toSquare[state]) {
                    let x = toSquare.coordinates.x + dx;
                    let y = toSquare.coordinates.y;
                    let otherPiece = this.squares.getFromCoordinates(x, y).piece;
                    if (otherPiece && otherPiece.isPawn) {
                        otherPiece.enPassantSquare = enPassantSquare;
                    }
                }
            }
        }
        // catch other pawn en passant
        else if (pawn.squares.includes("attack", toSquare) && !toSquare.piece) {
            let x = toSquare.coordinates.x;
            let y = fromSquare.coordinates.y;
            this.removePiece(this.squares.getFromCoordinates(x, y).name.value);
        }
    }

    pawnTransformation(kind) {
        if (!this.transformation) {
            return {
                "success": false,
                "transformation": false,
                "description": "There isn't transformation."
            };
        }

        this.placePiece(this.colors.current, kind, this.transformation.transformationSquare);
        this.removePiece(this.transformation.upToTransformationSquare);
        this.transformation = null;
        this.refreshState();
        return {
            "success": true,
            "transformation": false,
            "description": "Successfully transformed!"
        };
    }

    _replacePiece(fromSquare, toSquare, piece) {
        fromSquare.removePiece();
        piece.getPlace(toSquare);
    }

    movePiece(from, to, refresh=true) {
        let fromSquare = this.squares[from];
        let toSquare = this.squares[to];
        let piece = fromSquare.piece;

        if (!piece) {
            return {
                "success": false,
                "transformation": false,
                "description": "There isn't a piece to replace."
            };
        }
        if (!piece.hasColor(this.colors.current)) {
            return {
                "success": false,
                "transformation": false,
                "description": "Wrong color piece."
            };
        }
        if (!piece.squares.includes("move", toSquare) && !piece.squares.includes("attack", toSquare)) {
            return {
                "success": false,
                "transformation": false,
                "description": "Illegal move."
            };
        }

        this.transformation = null;
        if (piece.isKing) {
            this._castleRookMove(from, to, piece);
            this.stopKingCastleRights(piece.color);
        }
        else if (piece.isRook) {
            this.stopRookCastleRights(piece);
        }
        else if (piece.isPawn) {
            if (toSquare.onUpEdge || toSquare.onDownEdge) {
                this.transformation = {
                    upToTransformationSquare: from,
                    transformationSquare: to
                };
                return {
                    "success": true,
                    "transformation": true,
                    "description": `Pawn is ready to transform on ${to} square.`
                };
            }
            this.enPassantMatter(fromSquare, toSquare, piece);
        }

        this._replacePiece(fromSquare, toSquare, piece);

        if (refresh) this.refreshState();

        return {
            "success": true,
            "transformation": false,
            "description": "Successfully moved!"
        };
    }

    refreshAllSquares() {
        for (let piece of this.allPieces) {
            piece.getInitState();
        }
        for (let piece of this.allPieces.filter(p => !p.isKing)) {
            piece.getSquares(this.squares);
        }
        for (let piece of this.allPieces.filter(p => p.binder)) {
            piece.getBind(this.kings[piece.color].square);
        }
        for (let piece of this.allPieces.filter(p => p.isKing)) {
            piece.getSquares(this.squares);
        }
        let oppKing = this.kings[this.colors.opponent];
        if (oppKing.checkers.single) {
            let noMoves = true;
            let checker = oppKing.checkers.first;
            let betweenSquares = checker.isLinear ? checker.square.getBetweenSquaresNames(oppKing.square) : [];
            for (let piece of this.allPieces.filter(p => p.sameColor(oppKing))) {
                piece.getCheck(checker, betweenSquares);
                if (!piece.stuck) noMoves = false;
            }
            if (noMoves) this.result = [this.colors.secondPriority, this.colors.firstPriority];
        }
        else if (oppKing.checkers.several) {
            for (let piece of this.allPieces.filter(p => p.sameColor(oppKing) && !p.isKing)) {
                piece.getTotalImmobilize();
            }
            if (oppKing.stuck) this.result = [this.colors.secondPriority, this.colors.firstPriority];
        }
        else {
            let noMoves = true;
            for (let piece of this.allPieces.filter(p => p.sameColor(oppKing))) {
                if (!piece.stuck) {
                    noMoves = false;
                    break;
                }
            }
            if (noMoves) this.result = [0.5, 0.5];
        }
    }
}


class Game {
    constructor() {
        this.board = new Board;
        this.getInitialPosition();
    }

    getInitialPosition() {
        for (let sqr of ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"]) {
            this.board.placePiece("black", "pawn", sqr);
        }
        for (let sqr of ["b8", "g8"]) {
            this.board.placePiece("black", "knight", sqr);
        }
        for (let sqr of ["c8", "f8"]) {
            this.board.placePiece("black", "bishop", sqr);
        }
        for (let sqr of ["a8", "h8"]) {
            this.board.placePiece("black", "rook", sqr);
        }
        this.board.placePiece("black", "queen", "d8");
        this.board.placePiece("black", "king", "e8");

        for (let sqr of ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]) {
            this.board.placePiece("white", "pawn", sqr);
        }
        for (let sqr of ["b1", "g1"]) {
            this.board.placePiece("white", "knight", sqr);
        }
        for (let sqr of ["c1", "f1"]) {
            this.board.placePiece("white", "bishop", sqr);
        }
        for (let sqr of ["a1", "h1"]) {
            this.board.placePiece("white", "rook", sqr);
        }
        this.board.placePiece("white", "queen", "d1");
        this.board.placePiece("white", "king", "e1");
        this.board.refreshAllSquares();
    }

    move(from, to) {
        return this.board.movePiece(from, to);
    }

    transformation(kind) {
        return this.board.pawnTransformation(kind);
    }
}


module.exports = {
    board: {
        board: Board,
        boardColors: BoardColors,
        boardSquares: BoardSquares
    },
    game: Game,
    pieces: {
        piece: Piece,
        stepPiece: StepPiece,
        linearPiece: LinearPiece,
        pawn: Pawn,
        knight: Knight,
        bishop: Bishop,
        rook: Rook,
        queen: Queen,
        kingCastle: KingCastle,
        kingCheckers: KingCheckers,
        king: King
    },
    relations: {
        actionsRelation: ActionsRelation,
        pieceSquares: PieceSquares
    },
    square: {
        square: Square,
        squareCoordinates: SquareCoordinates,
        squareName: SquareName
    }
};
