var relations = require('./relations');
var ar = relations.ActionsRelation;


class Piece {
    /*
    Base chess piece class.
    There are create params:
      - color [string] (white or black);
      - square [square instance] (where piece is placed).
    */

    static WHITE = 'white';
    static BLACK = 'black';

    #colors = [Piece.WHITE, Piece.BLACK];

    constructor(color, square) {
        this._setColor(color);
        this.getPlace(square);
        this.squares = new relations.PieceSquares(this, 'pieces');
        this._refreshSquareFinder();
        this.getInitState();
        this._getKind();
        this._isLinear = false;
        this._kind = null;
    }

    get color() {
        return this._color;
    }

    get stuck() {
        // check the piece get stucked
        return !this.squares[ar.MOVE] && !this.squares[ar.ATTACK];
    }

    get kind() {
        return this._kind;
    }

    get isLinear() {
        return this._isLinear;
    }

    _setColor(color) {
        if (!this.#colors.includes(color)) {
            throw Error(`'${color}' is wrong piece color value.`);
        }
        this._color = color;
    }

    _refreshSquareFinder() {
        this.sqrBeforeXray = null; // square before xray (always occupied by piece)
        this.xrayControl = false; // control square behind checked king (inline of piece attack)
        this.endOfALine = false;
    }

    _refreshSquares() {
        this.squares.refresh();
        this._refreshSquareFinder();
    }

    _getKind() {
        this.isPawn = false;
        this.isKnight = false;
        this.isBishop = false;
        this.isRook = false;
        this.isQueen = false;
        this.isKing = false;
    }

    _nextSquareAction(nextSquare) {
        // define next square kinds and handle logic with it
        if (this.sqrBeforeXray) {
            this.squares.add(ar.XRAY, nextSquare);
            if (this.xrayControl) {
                this.squares.add(ar.CONTROL, nextSquare);
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
                this.squares.add(ar.COVER, nextSquare);
            }
            else {
                this.squares.add(ar.ATTACK, nextSquare);
                if (nextSquare.piece.isKing) {
                    nextSquare.piece.checkers.add(this.square.piece);
                    this.xrayControl = true;
                }
            }
            this.squares.add(ar.CONTROL, nextSquare);
            if (this.isLinear) this.sqrBeforeXray = nextSquare;
        }
        else {
            this.squares.add(ar.MOVE, nextSquare);
            this.squares.add(ar.CONTROL, nextSquare);
        }
    }

    getInitState() {
        this.binder = null;
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

    getTotalImmobilize() {
        this.squares.refresh();
    }

    getBind(kingSquare) {
        // make piece is binded
        this.squares.refresh(ar.XRAY);
        let betweenSquares = this.binder.square.getBetweenSquaresNames(kingSquare, true, true);
        for (let actonKind of [ar.MOVE, ar.ATTACK, ar.COVER]) {
            this.squares.limit(actonKind, betweenSquares);
        }
    }

    getCheck(checker, betweenSquaresNames) {
        // change Piece action abilities after its king was checked
        this.squares.refresh(ar.COVER);
        this.squares.refresh(ar.XRAY);
        this.squares.limit(ar.ATTACK, [checker.square.name.value]);
        this.squares.limit(ar.MOVE, betweenSquaresNames);
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
            this.squares.add(ar.MOVE, square);
        }
    }

    _getAttackCoordinates() {
        let attackSquaresCoordinates = [];
        if (!this.square.onEdge.right) {
            attackSquaresCoordinates.push([
                this.square.coordinates.x + 1,
                this.square.coordinates.y + 1 * this.direction
            ]);
        }
        if (!this.square.onEdge.left) {
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
            this.squares.add(ar.CONTROL, square);
            if (square.piece) {
                if (this.sameColor(square.piece)) {
                    this.squares.add(ar.COVER, square);
                }
                else {
                    this.squares.add(ar.ATTACK, square);
                    if (square.piece.isKing) {
                        square.piece.checkers.add(this.square.piece);
                    }
                }
            }
        }
        if (this.enPassantSquare) {
            this.squares.add(ar.ATTACK, this.enPassantSquare);
            this.enPassantSquare = null;
        }
    }

    getSquares(boardSquares) {
        this._refreshSquares();
        this._getMoveSquares(boardSquares);
        this._getAttackSquares(boardSquares);
    }
}


class StepPiece extends Piece {
    constructor(color, square) {
        super(color, square);
    }

    _getStepSquares(boardSquares, stepPoints) {
        this._refreshSquareFinder();
        for (let stepPoint of stepPoints) {
            let x = this.square.coordinates.x + stepPoint.x;
            let y = this.square.coordinates.y + stepPoint.y;
            if (!SquareCoordinates.correctCoordinates(x, y)) continue;

            this._nextSquareAction(boardSquares.getFromCoordinates(x, y));
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
        this._refreshSquares();
        this._getStepSquares(boardSquares, this.#stepPoints);
    }

    getBind() {
        this.getTotalImmobilize();
    }
}


class LinearPiece extends Piece {
    constructor(color, square) {
        super(color, square);
        this._isLinear = true;
    }

    _getLinearSquares(boardSquares, directions) {
        for (let direction of directions) {
            this._refreshSquareFinder();
            let x = this.square.coordinates.x + direction.x;
            let y = this.square.coordinates.y + direction.y;
            while (SquareCoordinates.correctCoordinates(x, y)) {
                this._nextSquareAction(boardSquares.getFromCoordinates(x, y));
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
        this._refreshSquares();
        this._getLinearSquares(boardSquares, Bishop.directions);
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
        this._refreshSquares();
        this._getLinearSquares(boardSquares, Rook.directions);
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
        this._refreshSquares();
        this._getLinearSquares(boardSquares, Bishop.directions);
        this._getLinearSquares(boardSquares, Rook.directions);
    }
}


class KingCastleRoad {
    constructor(horizontal, boardSquares, accepted, squareSign, freeSigns, safeSigns) {
        this._accepted = accepted;
        this._horizontal = horizontal;
        this._square = boardSquares[`${squareSign}${this._horizontal}`];
        this._free = [];
        this._safe = [];
        this._getFree(freeSigns, boardSquares);
        this._getSafe(safeSigns, boardSquares);
    }

    get accepted() {
        return this._accepted;
    }

    get square() {
        return this._square;
    }

    get free() {
        return this._free;
    }

    get safe() {
        return this._safe;
    }

    _fill(target, signs, boardSquares) {
        for (let sign of signs) {
            target.push(boardSquares[`${sign}${this._horizontal}`]);
        }
    }

    _getFree(freeSigns, boardSquares) {
        this._fill(this._free, freeSigns, boardSquares);
    }

    _getSafe(safeSigns, boardSquares) {
        this._fill(this._safe, safeSigns, boardSquares);
    }
}


class KingCastle {
    constructor(color, boardSquares, acceptedDefault=null) {
        let horizontal = color == "white" ? "1" : "8";
        this.color = color;
        this.short = new KingCastleRoad(
            horizontal,
            boardSquares,
            !acceptedDefault || acceptedDefault.short,
            'g',
            ['f', 'g'],
            ['f', 'g']
        );
        this.long = new KingCastleRoad(
            horizontal,
            boardSquares,
            !acceptedDefault || acceptedDefault.long,
            'c',
            ['b', 'c', 'd'],
            ['c', 'd']
        );
    }

    _freeCastleRoad(side) {
        for (let square of this[side].free) {
            if (square.piece) return false;
        }
        return true;
    }

    _safeCastleRoad(side) {
        for (let square of this[side].safe) {
            if (square.pieces[ar.CONTROL].filter(p => !p.hasColor(this.color)).length > 0) {
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
        for (let kingAction of [ar.MOVE, ar.ATTACK]) {
            if (this.squares[kingAction]) {
                let squaresToRemove = [];
                for (let square of this.squares[kingAction]) {
                    if (square.pieces[ar.CONTROL].filter(p => !this.sameColor(p)).length > 0) {
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
                this.squares.add(ar.MOVE, this.castle[side].square);
            }
        }
    }

    _removeCastleMoves() {
        for (let side of ["long", "short"]) {
            this.squares.remove(ar.MOVE, this.castle[side].square);
        }
    }

    getSquares(boardSquares) {
        this._refreshSquares();
        this._getStepSquares(boardSquares, this.#stepPoints);
        this._removeEnemyControlledSquares();
        this._addCastleMoves();
    }

    getCheck() {
        this._removeCastleMoves();
    }
}


module.exports = {
    Piece: Piece,
    StepPiece: StepPiece,
    LinearPiece: LinearPiece,
    Pawn: Pawn,
    Knight: Knight,
    Bishop: Bishop,
    Rook: Rook,
    Queen: Queen,
    KingCastle: KingCastle,
    KingCheckers: KingCheckers,
    King: King
};
