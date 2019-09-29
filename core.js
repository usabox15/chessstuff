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
        this.symbol = symbol;
        this.number = number;
        this.value = `${symbol}${number}`;
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
        this.x = x;
        this.y = y;
        this.value = [x, y];
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
            this._name = SquareName(name);
            this._coordinates = SquareCoordinates([Square.symbolToNumber[this._name.symbol], +(this._name.number - 1)]);
        }
        else if (coordinates) {
            this._coordinates = SquareCoordinates(coordinates);
            this._name = SquareName(Square.numberToSymbol[this._coordinates.x] + (this._coordinates.y + 1));
        }
        else {
            throw Error("To create Square instance you need to pass either name or coordinates param");
        }
        this._pice = null;
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

    get pice() {
        return this._pice;
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

    placePice(pice) {
        this._pice = pice;
    }

    removePice() {
        this._pice = null;
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
}


class PiceSquares {
    /*
    Chess pice dependent squares storage.
    */

    #allKinds = ['move', 'attack', 'xray', 'cover', 'control'];

    constructor() {
        this.refresh();
    }

    refresh(kind='all') {
        let kinds = kind === 'all' ? this.#allKinds : [kind];
        for (let kind of kinds) {
            this[kind] = null;
        }
    }

    add(kind, square) {
        if (this[kind]) {
            this[kind].push(square);
        }
        else {
            this[kind] = [square];
        }
    }

    remove(kind, squareToRemove) {
        this[kind] = this[kind].filter(square => !square.theSame(squareToRemove));
    }

    limit(kind, acceptedNames) {
        // limit some kind of Pice actions squares by Array of accepted square names
        this[kind] = this[kind].filter(square => acceptedNames.includes(square.name.value));
    }

    includes(kind, square) {
        return this[kind].filter(s => s.theSame(square)).length != 0;
    }
}


class Pice {
    /*
    Base chess pice class.
    There are create params:
      - color [string] (white or black);
      - square [Square class instance] (where pice is placed).
    */

    constructor(color, square) {
        this.color = color;
        this.getPlace(square);
        this.squares = new PiceSquares;
        this.refreshSquareFinder();
        this.getInitState();
        this.getKind();
        this.isLinear = false;
    }

    get stuck() {
        // check the pice get stucked
        return !this.squares.move && !this.squares.attack;
    }

    refreshSquareFinder() {
        this.sqrBeforeXray = null; // square before xray (always occupied by pice)
        this.xrayControl = false; // control square behind checked king (inline of pice attack)
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
        this.isQeen = false;
        this.isKing = false;
    }

    getPlace(square) {
        this.square = square;
        square.placePice(this);
    }

    sameColor(otherPice) {
        return this.color === otherPice.color;
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
            if (nextSquare.pice) {
                let isOppKingSquare = nextSquare.pice.isKing && !this.sameColor(nextSquare.pice);
                let isOppPiceBeforeXray = !this.sameColor(this.sqrBeforeXray.pice);
                if (isOppKingSquare && isOppPiceBeforeXray) {
                    this.sqrBeforeXray.pice.binder = this;
                }
                this.endOfALine = true;
            }
        }
        else if (nextSquare.pice) {
            if (this.sameColor(nextSquare.pice)) {
                this.squares.add("cover", nextSquare);
            }
            else {
                this.squares.add("attack", nextSquare);
                if (nextSquare.pice.isKing) {
                    nextSquare.pice.checkersSquares.push(this.square);
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
        // make pice is binded
        this.squares.refresh("xray");
        let betweenSquares = this.binder.square.getBetweenSquaresNames(kingSquare, true);
        for (let actonKind of ["move", "attack", "cover"]) {
            this.squares.limit(actonKind, betweenSquares);
        }
    }

    getCheck(checker, betweenSquares) {
        // change Pice action abilities after its king was checked
        this.squares.refresh("cover");
        this.squares.refresh("xray");
        this.squares.limit("attack", [checker.square.name.value]);
        this.squares.limit("move", betweenSquares);
    }
}


class Pawn extends Pice {
    constructor(color, square) {
        super(color, square);
        this.isPawn = true;
        this.direction = color == "white" ? 1 : -1;
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
            if (square.pice) break;
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
            if (square.pice) {
                if (this.sameColor(square.pice)) {
                    this.squares.add("cover", square);
                }
                else {
                    this.squares.add("attack", square);
                    if (square.pice.isKing) {
                        square.pice.checkersSquares.push(this.square);
                    }
                }
            }
            else if (enPassant && square.theSame(enPassant)) {
                this.squares.add("attack", square);
            }
        }
    }

    getSquares(boardSquares, enPassant) {
        this.refreshSquares();
        this._getMoveSquares(boardSquares);
        this._getAttackSquares(boardSquares);
    }
}


class StepPice extends Pice {
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


class Knight extends StepPice {
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
    }

    getSquares(boardSquares) {
        this.getStepSquares(boardSquares, this.#stepPoints);
    }

    getBind() {
        this.getTotalImmobilize();
    }
}


class LinearPice extends Pice {
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


class Bishop extends LinearPice {
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
    }

    getSquares(boardSquares) {
        this.getLinearSquares(boardSquares, Bishop.directions);
    }
}


class Rook extends LinearPice {
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
    }

    getSquares(boardSquares) {
        this.getLinearSquares(boardSquares, Rook.directions);
    }
}


class Queen extends LinearPice {
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
        this.isQeen = true;
    }

    getSquares(boardSquares) {
        this.getLinearSquares(boardSquares, Bishop.directions);
        this.getLinearSquares(boardSquares, Rook.directions);
    }
}


class KingCastle {
    constructor(color) {
        horizontal = color == "white" ? "1" : "8";
        this.short = {
            accepted: true,
            squareName: `g${horizontal}`,
            free: [`f${horizontal}`, `g${horizontal}`],
            safe: [`f${horizontal}`, `g${horizontal}`],
        };
        this.long = {
            accepted: true,
            squareName: `c${horizontal}`,
            free: [`b${horizontal}`, `c${horizontal}`, `d${horizontal}`],
            safe: [`c${horizontal}`, `d${horizontal}`],
        };
    }

    _freeCastleRoad(boardSquares, side) {
        for (let squareName of this[side].free) {
            if (boardSquares[squareName].pice) return false;
        }
        return true;
    }

    _safeCastleRoad(boardSquares, side) {
        for (let sqr of Object.values(boardSquares.occupied).filter(s => !this.sameColor(s.pice))) {
            for (let squareName of this[side].safe) {
                if (sqr.pice.squares.includes("control", boardSquares[squareName])) return false;
            }
        }
        return true;
    }

    isLegal(boardSquares, side) {
        if (!this._freeCastleRoad(boardSquares, side)) {
            return false;
        }
        if (!this._safeCastleRoad(boardSquares, side)) {
            return false;
        }
        return true;
    }

    stop(side='all') {
        sides = side == 'all' ? ['short', 'long'] : [side];
        for (let s in sides) {
            this[s].accepted = false;
        }
    }
}


class King extends StepPice {
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

    constructor(color, square) {
        super(color, square);
        this.castle = KingCastle(color);
        this.isKing = true;
    }

    getInitState() {
        this.checkersSquares = [];
    }

    _removeEnemyControlledSquares(boardSquares) {
        for (let kingAction of ["move", "attack"]) {
            let squaresToRemove = [];
            for (let sqr of this.squares[kingAction]) {
                for (let s of Object.values(boardSquares.occupied)) {
                    if (!this.sameColor(s.pice) && s.pice.squares.includes("control", sqr)) {
                        squaresToRemove.push(sqr);
                        break;
                    }
                }
            }
            for (let sqr of squaresToRemove) {
                this.squares.remove(kingAction, sqr);
            }
        }
    }

    _addCastleMoves(boardSquares) {
        for (let side of ["long", "short"]) {
            if (this.castle[side].accepted && this.castle.isLegal(boardSquares, side)) {
                this.squares.add("move", boardSquares[this.castle[side].squareName]);
            }
        }
    }

    _removeCastleMoves() {
        for (let side of ["long", "short"]) {
            this.squares.remove("move", boardSquares[this.castle[side].squareName]);
        }
    }

    getSquares(boardSquares) {
        this.getStepSquares(boardSquares, this.#stepPoints);
        this._removeEnemyControlledSquares(boardSquares);
        this._addCastleMoves(boardSquares);
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
                this[name] = Square(name);
            }
        }
    }

    get occupied() {
        return Object.fromEntries(
            Object.entries(this)
            .filter(data => data[1].pice)
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
    #picesBox = {
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
        this.enPassant = null;
        this.result = null;
        this.transformation = null;
        this.kings = {"white": null, "black": null};
    }

    get allPices() {
        let pices = [];
        for (let square of Object.values(this.squares.occupied)) {
            pices.push(square.pice);
        }
        return pices;
    }

    get allOccupiedSquares() {
        return Object.keys(this.squares.occupied);
    }

    refreshState() {
        this.refreshAllSquares();
        this.colors.changePriority();
    }

    placePice(color, kind, squareName) {
        let pice = new this.#picesBox[kind](color, this.squares[squareName]);
        if (pice.isKing) {
            this.kings[color] = pice;
        }
    }

    removePice(squareName) {
        this.squares[squareName].removePice();
    }

    castleRookMove(from, to, king) {
        horizontal = king.castle.horizontal;
        if (from == `e${horizontal}`) {
            if (to == `c${horizontal}`) {
                this.movePice(`a${horizontal}`, `d${horizontal}`, false);
            }
            else if (to == `g${horizontal}`) {
                this.movePice(`h${horizontal}`, `f${horizontal}`, false);
            }
        }
    }

    stopKingCastleRights(color) {
       this.kings[color].castle.stop();
    }

    stopRookCastleRights(pice) {
        this.kings[pice.color].castle.stop(pice.side);
    }

    enPassantMatter(from, to, pice) {
        let toSquare = this.squares[to];
        if (Math.abs(from[1] - to[1]) == 2) {
            this.enPassant = from[0] + (+from[1] + (this.colors.current == "white" ? 1 : -1));
        }
        else if (pice.squares.includes("attack", toSquare) && !toSquare.pice) {
            this.removePice(to[0] + from[1]);
        }
    }

    pawnTransformation(kind) {
        this.placePice(this.colors.current, kind, this.transformation[1]);
        this.removePice(this.transformation[0]);
        this.transformation = null;
        this.refreshState();
        return {
            "success": true,
            "transformation": false,
            "description": "Successfully transformed!"};
    }

    _replacePice(fromSquare, toSquare, pice) {
        fromSquare.removePice();
        pice.getPlace(toSquare);
    }

    movePice(from, to, refresh=true) {
        let fromSquare = this.squares[from];
        let toSquare = this.squares[to];
        let pice = fromSquare.pice;

        if (!pice) {
            return {
                "success": false,
                "transformation": false,
                "description": "There isn't a pice to replace."};
        }
        if (!pice.hasColor(this.colors.current)) {
            return {
                "success": false,
                "transformation": false,
                "description": "Wrong color pice."};
        }
        if (!pice.squares.includes("move", toSquare) && !pice.squares.includes("attack", toSquare)) {
            return {
                "success": false,
                "transformation": false,
                "description": "Illegal move."};
        }

        this.transformation = null;
        if (pice.isKing) {
            this.castleRookMove(from, to, pice);
            this.stopKingCastleRights(pice.color);
        }
        else if (pice.isRook) {
            this.stopRookCastleRights(pice);
        }
        else if (pice.isPawn) {
            if (["1", "8"].includes(to[1])) {
                this.transformation = [from, to];
                return {
                    "success": true,
                    "transformation": true,
                    "description": "Pawn is ready to transform on " + to + "."};
            }
            this.enPassantMatter(from, to, pice);
        }

        this._replacePice(fromSquare, toSquare, pice);

        if (refresh) this.refreshState();

        return {
            "success": true,
            "transformation": false,
            "description": "Successfully moved!"};
    }

    refreshAllSquares() {
        for (let pice of this.allPices) {
            pice.getInitState();
        }
        for (let pice of this.allPices.filter(p => !p.isPawn)) {
            pice.getSquares(this.squares);
        }
        for (let pice of this.allPices.filter(p => p.isPawn)) {
            pice.getSquares(this.squares, this.enPassant);
        }
        for (let pice of this.allPices.filter(p => p.binder)) {
            pice.getBind(this.kings[pice.color].square);
        }
        let oppKing = this.kings[this.colors.opponent];
        if (oppKing.checkersSquares.length == 1) {
            let noMoves = true;
            let checker = this.squares[oppKing.checkersSquares[0]];
            let betweenSquares = checker.isLinear ? checker.square.getBetweenSquaresNames(oppKing.square) : [];
            for (let pice of this.allPices.filter(p => p.sameColor(oppKing))) {
                pice.getCheck(checker, betweenSquares);
                if (!pice.stuck) noMoves = false;
            }
            if (noMoves) this.result = [this.colors.secondPriority, this.colors.firstPriority];
        }
        else if (oppKing.checkersSquares.length > 1) {
            for (let pice of this.allPices.filter(p => p.sameColor(oppKing) && !p.isKing)) {
                pice.getTotalImmobilize();
            }
            if (oppKing.stuck) this.result = [this.colors.secondPriority, this.colors.firstPriority];
        }
        else {
            let noMoves = true;
            for (let pice of this.allPices.filter(p => p.sameColor(oppKing))) {
                if (!pice.stuck) {
                    noMoves = false;
                    break;
                }
            }
            if (noMoves) this.result = [0.5, 0.5];
        }
        this.enPassant = null;
    }
}


class Game {
    constructor() {
        this.board = new Board;
        this.getInitialPosition();
    }

    getInitialPosition() {
        for (let sqr of ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"]) {
            this.board.placePice("black", "pawn", sqr);
        }
        for (let sqr of ["b8", "g8"]) {
            this.board.placePice("black", "knight", sqr);
        }
        for (let sqr of ["c8", "f8"]) {
            this.board.placePice("black", "bishop", sqr);
        }
        for (let sqr of ["a8", "h8"]) {
            this.board.placePice("black", "rook", sqr);
        }
        this.board.placePice("black", "queen", "d8");
        this.board.placePice("black", "king", "e8");

        for (let sqr of ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]) {
            this.board.placePice("white", "pawn", sqr);
        }
        for (let sqr of ["b1", "g1"]) {
            this.board.placePice("white", "knight", sqr);
        }
        for (let sqr of ["c1", "f1"]) {
            this.board.placePice("white", "bishop", sqr);
        }
        for (let sqr of ["a1", "h1"]) {
            this.board.placePice("white", "rook", sqr);
        }
        this.board.placePice("white", "queen", "d1");
        this.board.placePice("white", "king", "e1");
        this.board.refreshAllSquares();
    }

    move(from, to) {
        return this.board.movePice(from, to);
    }

    transformation(kind) {
        return this.board.pawnTransformation(kind);
    }
}
