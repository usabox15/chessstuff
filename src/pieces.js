var relations = require('./relations');
var square = require('./square');
var ar = relations.ActionsRelation;
var SquareCoordinates = square.SquareCoordinates;


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

    get board() {
        return this.square.board;
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
    static DIRECTIONS = {[Piece.WHITE]: 1, [Piece.BLACK]: -1};
    static INITIAL_RANKS = {[Piece.WHITE]: "2", [Piece.BLACK]: "7"};

    constructor(color, square) {
        super(color, square);
        this.isPawn = true;
        this._enPassantSquare = null;
        this._kind = "pawn";
    }

    get direction() {
        return Pawn.DIRECTIONS[this.color];
    }

    get onInitialRank() {
        return this.square.onRank(Pawn.INITIAL_RANKS[this.color]);
    }

    _getMoveCoordinates() {
        let moveSquaresCoordinates = [];
        moveSquaresCoordinates.push([
            this.square.coordinates.x,
            this.square.coordinates.y + 1 * this.direction
        ]);
        if (this.onInitialRank) {
            moveSquaresCoordinates.push([
                this.square.coordinates.x,
                this.square.coordinates.y + 2 * this.direction
            ]);
        }
        return moveSquaresCoordinates;
    }

    _getMoveSquares() {
        for (let [x, y] of this._getMoveCoordinates()) {
            let square = this.board.squares.getFromCoordinates(x, y);
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

    _getAttackSquares() {
        for (let [x, y] of this._getAttackCoordinates()) {
            let square = this.board.squares.getFromCoordinates(x, y);
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
        if (this._enPassantSquare) {
            this.squares.add(ar.ATTACK, this._enPassantSquare);
            this.clearEnPassantSquare();
        }
    }

    setEnPassantSquare(square) {
        this._enPassantSquare = square;
    }

    clearEnPassantSquare() {
        this.setEnPassantSquare(null);
    }

    getSquares() {
        this._refreshSquares();
        this._getMoveSquares();
        this._getAttackSquares();
    }
}


class StepPiece extends Piece {
    constructor(color, square) {
        super(color, square);
    }

    _getStepSquares(stepPoints) {
        this._refreshSquareFinder();
        for (let stepPoint of stepPoints) {
            let x = this.square.coordinates.x + stepPoint.x;
            let y = this.square.coordinates.y + stepPoint.y;
            if (!SquareCoordinates.correctCoordinates(x, y)) continue;

            this._nextSquareAction(this.board.squares.getFromCoordinates(x, y));
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

    getSquares() {
        this._refreshSquares();
        this._getStepSquares(this.#stepPoints);
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

    _getLinearSquares(directions) {
        for (let direction of directions) {
            this._refreshSquareFinder();
            let x = this.square.coordinates.x + direction.x;
            let y = this.square.coordinates.y + direction.y;
            while (SquareCoordinates.correctCoordinates(x, y)) {
                this._nextSquareAction(this.board.squares.getFromCoordinates(x, y));
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

    getSquares() {
        this._refreshSquares();
        this._getLinearSquares(Bishop.directions);
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
        this._castleRoad = null;
        this._kind = "rook";
    }

    get castleRoad() {
        return this._castleRoad;
    }

    getSquares() {
        this._refreshSquares();
        this._getLinearSquares(Rook.directions);
    }

    setCastleRoad(castleRoad) {
        this._castleRoad = castleRoad;
    }

    removeCastleRoad() {
        this._castleRoad = null;
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

    getSquares() {
        this._refreshSquares();
        this._getLinearSquares(Bishop.directions);
        this._getLinearSquares(Rook.directions);
    }
}


class KingCastleRoad {
    static toSquaresSigns = {short: 'g', long: 'c'};
    static rookToSquaresSigns = {short: 'f', long: 'd'};
    static rookSquaresSigns = {short: 'h', long: 'a'};
    static freeSigns = {short: ['f', 'g'], long: ['b', 'c', 'd']};
    static safeSigns = {short: ['f', 'g'], long: ['c', 'd']};

    constructor(horizontal, side) {
        this._horizontal = horizontal;
        this._toSquare = this.board.squares[`${KingCastleRoad.toSquaresSigns[side]}${this._horizontal}`];
        this._rookToSquare = this.board.squares[`${KingCastleRoad.rookToSquaresSigns[side]}${this._horizontal}`];
        this._rook = this.board.squares[`${KingCastleRoad.rookSquaresSigns[side]}${this._horizontal}`].piece;
        this._rook.setCastleRoad(this);
        this._side = side;
        this._free = [];
        this._safe = [];
        this._fill(this._free, KingCastleRoad.freeSigns[side]);
        this._fill(this._safe, KingCastleRoad.safeSigns[side]);
    }

    get toSquare() {
        return this._toSquare;
    }

    get rookToSquare() {
        return this._rookToSquare;
    }

    get rook() {
        return this._rook;
    }

    get side() {
        return this._side;
    }

    get isFree() {
        for (let square of this._free) {
            if (square.piece) return false;
        }
        return true;
    }

    get isSafe() {
        for (let square of this._safe) {
            if (square.pieces[ar.CONTROL].filter(p => !p.hasColor(this.color)).length > 0) {
                return false;
            }
        }
        return true;
    }

    get isLegal() {
        return this.isFree && this.isSafe;
    }

    _fill(target, signs) {
        for (let sign of signs) {
            target.push(this.board.squares[`${sign}${this._horizontal}`]);
        }
    }
}


class KingCastle {
    static SIDES = ['short', 'long'];

    constructor(color, acceptedDefault=null) {
        let accepted = acceptedDefault || {short: true, long: true};
        let horizontal = color == "white" ? "1" : "8";
        this.color = color;
        for (let side of KingCastle.SIDES) {
            if (accepted[side]) {
                this[side] = new KingCastleRoad(horizontal, side);
            } else {
                this[side] = null;
            }
        }
    }

    stop(side='all') {
        let sides = side == 'all' ? KingCastle.SIDES : [side];
        for (let s of sides) {
            if (this[s]) {
                this[s].rook.removeCastleRoad();
                this[s] = null;
            }
        }
    }

    sideHappening(toSquare) {
        for (let side of KingCastle.SIDES) {
            if (this[side] && this[side].toSquare.theSame(toSquare)) {
                return this[side];
            }
        }
        return null;
    }
}


class KingCheckers extends Array {
    get first() {
        return this.length > 0 ? this[0] : null;
    }

    get second() {
        return this.length == 2 ? this[1] : null;
    }

    get exist() {
        return this.length > 0;
    }

    get single() {
        return this.length == 1;
    }

    get several() {
        return this.length == 2;
    }

    add(piece) {
        this.push(piece);
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

    There are additional create params:
      - castleAccepted [Object] (example {short: false, long: true}).
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

    constructor(color, square, castleAccepted=null) {
        super(color, square);
        this.castle = new KingCastle(color, castleAccepted);
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
        for (let side of KingCastle.SIDES) {
            if (this.castle[side] && this.castle[side].isLegal) {
                this.squares.add(ar.MOVE, this.castle[side].toSquare);
            }
        }
    }

    _removeCastleMoves() {
        for (let side of KingCastle.SIDES) {
            if (this.castle[side]) {
                this.squares.remove(ar.MOVE, this.castle[side].toSquare);
            }
        }
    }

    getSquares() {
        this._refreshSquares();
        this._getStepSquares(this.#stepPoints);
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
