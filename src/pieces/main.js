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


const { Pawn } = require('./pawn');
const { Piece, StepPiece, LinearPiece } = require('./base');
const { Relation } = require('../relations');


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
    static stepPoints = [
        {x: -2, y: 1},  // A
        {x: -1, y: 2},  // B
        {x: 1, y: 2},   // C
        {x: 2, y: 1},   // D
        {x: 2, y: -1},  // E
        {x: 1, y: -2},  // F
        {x: -1, y: -2}, // G
        {x: -2, y: -1}, // H
    ];

    constructor(color, square, refresh=true) {
        /*
        Params:
            color {string} (white or black);
            square {Square} - where piece is placed;
            refresh {boolean} - whether refresh board after piece placed or not.
        */

        super(color, square, Piece.KNIGHT, refresh);
    }

    getSquares() {
        // Get knight squares by piece action.

        this._refreshSquares();
        this._getStepSquares(Knight.stepPoints);
    }

    getBind() {
        // Bind knight.

        this.getTotalImmobilize();
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

    constructor(color, square, refresh=true) {
        /*
        Params:
            color {string} (white or black);
            square {Square} - where piece is placed;
            refresh {boolean} - whether refresh board after piece placed or not.
        */

        super(color, square, Piece.BISHOP, refresh);
    }

    getSquares() {
        // Get bishop squares by piece action.

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

    constructor(color, square, refresh=true) {
        /*
        Params:
            color {string} (white or black);
            square {Square} - where piece is placed;
            refresh {boolean} - whether refresh board after piece placed or not.
        */

        super(color, square, Piece.ROOK, refresh);
    }

    get castleRoad() {
        if (this.hasOwnProperty('_castleRoad')) {
            return this._castleRoad;
        }
        return null
    }

    getSquares() {
        // Get rook squares by piece action.

        this._refreshSquares();
        this._getLinearSquares(Rook.directions);
    }

    setCastleRoad(castleRoad) {
        /*
        Params:
            castleRoad {KingCastleRoad}.
        */

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

    constructor(color, square, refresh=true) {
        /*
        Params:
            color {string} (white or black);
            square {Square} - where piece is placed;
            refresh {boolean} - whether refresh board after piece placed or not.
        */

        super(color, square, Piece.QUEEN, refresh);
    }

    getSquares() {
        // Get queen squares by piece action.

        this._refreshSquares();
        this._getLinearSquares(Bishop.directions);
        this._getLinearSquares(Rook.directions);
    }
}


class KingCastleRoad {
    static SHORT = 'short';
    static LONG = 'long';
    static ALL_SIDES = [KingCastleRoad.SHORT, KingCastleRoad.LONG];
    static toSquaresSigns = {[KingCastleRoad.SHORT]: 'g', [KingCastleRoad.LONG]: 'c'};
    static rookToSquaresSigns = {[KingCastleRoad.SHORT]: 'f', [KingCastleRoad.LONG]: 'd'};
    static rookSquaresSigns = {[KingCastleRoad.SHORT]: 'h', [KingCastleRoad.LONG]: 'a'};
    static freeSigns = {[KingCastleRoad.SHORT]: ['f', 'g'], [KingCastleRoad.LONG]: ['b', 'c', 'd']};
    static safeSigns = {[KingCastleRoad.SHORT]: ['f', 'g'], [KingCastleRoad.LONG]: ['c', 'd']};

    constructor(castle, rank, side) {
        /*
        Params:
            castle {KingCastle};
            rank {number or string} - first or eights rank;
            side {string} - one of KingCastleRoad.ALL_SIDES.
        */

        this._castle = castle;
        this._rank = rank;
        this._side = side;
        let kingToSquareName = `${KingCastleRoad.toSquaresSigns[side]}${this._rank}`;
        this._toSquare = castle.king.board.squares[kingToSquareName];
        let rookToSquareName = `${KingCastleRoad.rookToSquaresSigns[side]}${this._rank}`;
        this._rookToSquare = castle.king.board.squares[rookToSquareName];
        let rookSquareName = `${KingCastleRoad.rookSquaresSigns[side]}${this._rank}`;
        this._rook = castle.king.board.squares[rookSquareName].piece;
        this._checkRook();
        this._rook.setCastleRoad(this);
        this._needToBeFreeSquares = [];
        this._needToBeSafeSquares = [];
        this._fill();
    }

    get toSquare() {
        // King move to square

        return this._toSquare;
    }

    get rookToSquare() {
        // Rook move to square

        return this._rookToSquare;
    }

    get rook() {
        return this._rook;
    }

    get side() {
        return this._side;
    }

    get isFree() {
        return this._needToBeFreeSquares.filter(square => square.piece).length == 0;
    }

    get isSafe() {
        for (let square of this._needToBeSafeSquares) {
            let controlledByOppositeColorPeace = (
                square.pieces[Relation.CONTROL] &&
                square.pieces[Relation.CONTROL].filter(p => !p.hasColor(this._castle.king.color)).length > 0
            )
            if (controlledByOppositeColorPeace) return false;
        }
        return true;
    }

    get isLegal() {
        return this.isFree && this.isSafe;
    }

    _checkRook() {
        if (!this._rook || !this._rook.isRook || !this._castle.king.sameColor(this._rook)) {
            throw Error(`Fail to assign rook to ${this._castle.king.color} king ${this._side} castle road.`);
        }
    }

    _fill() {
        let data = [
            [this._needToBeFreeSquares, KingCastleRoad.freeSigns[this._side]],
            [this._needToBeSafeSquares, KingCastleRoad.safeSigns[this._side]]
        ];
        for (let [target, signs] of data) {
            for (let sign of signs) {
                target.push(this._castle.king.board.squares[`${sign}${this._rank}`]);
            }
        }
    }
}


class KingCastleInitial {
    /*
    Scheme:
        {
            kindOfCastleRoad: Boolean,
            ...
        }

    Example:
        {
            [KingCastleRoad.SHORT]: true,
            [KingCastleRoad.LONG]: false
        }
    */

    constructor(acceptedSides=null) {
        /*
        Params:
            acceptedSides {Array} - some of KingCastleRoad.ALL_SIDES.
        */

        acceptedSides = acceptedSides || [];
        acceptedSides = acceptedSides.slice(0, 2);
        this._checkAcceptedSides(acceptedSides);
        for (let side of KingCastleRoad.ALL_SIDES) {
            this[side] = acceptedSides.includes(side);
        }
    }

    _checkAcceptedSides(acceptedSides) {
        /*
        Params:
            acceptedSides {Array} - some of KingCastleRoad.ALL_SIDES.
        */

        for (let side of acceptedSides) {
            if (!KingCastleRoad.ALL_SIDES.includes(side)) {
                throw Error(`${side} is not a correct castle side name. Use one of ${KingCastleRoad.ALL_SIDES}.`);
            }
        }
    }
}


class KingCastle {
    static RANKS = {[Piece.WHITE]: "1", [Piece.BLACK]: "8"};

    constructor(king, initial=null) {
        /*
        Params:
            king {King};
            initial {KingCastleInitial}.
        */

        this._king = king;
        let accepted;
        if (king.onInitialSquare && initial) {
            if (!initial instanceof KingCastleInitial) {
                throw Error("Castle initial data has to be an instance of KingCastleInitial.");
            }
            accepted = initial;
        } else {
            accepted = new KingCastleInitial();
        }
        for (let side of KingCastleRoad.ALL_SIDES) {
            if (accepted[side]) {
                this[side] = new KingCastleRoad(this, KingCastle.RANKS[king.color], side);
            } else {
                this[side] = null;
            }
        }
    }

    get king() {
        return this._king;
    }

    stop(side='all') {
        /*
        Stop castle rights.
        Params:
            side {string} one of KingCastleRoad.ALL_SIDES.
        */

        let sides = side == 'all' ? KingCastleRoad.ALL_SIDES : [side];
        for (let s of sides) {
            if (this[s]) {
                this[s].rook.removeCastleRoad();
                this[s] = null;
            }
        }
    }

    getRoad(toSquare) {
        /*
        Get castle road by king to square.
        Params:
            toSquare {Square}.
        */

        for (let side of KingCastleRoad.ALL_SIDES) {
            if (this[side] && this[side].toSquare.theSame(toSquare)) {
                return this[side];
            }
        }
        return null;
    }
}


class KingCheckers extends Array {
    constructor(king) {
        /*
        Params:
            king {King}.
        */

        super();
        this._king = king;
    }

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

    get isLegal() {
        return !this.exist || this._isPiecesLegal() && (this.single || this.several && this._isSeveralLegal());
    }

    _isPiecesLegal() {
        return (
            this.filter(p => p.isKing).length == 0
        &&
            this.filter(p => !p.squares.includes(Relation.CONTROL, this._king.square)).length == 0
        );
    }

    _isDiscoverLegal(discoverer, discoveredAttacker) {
        /*
        Legality of a discover check that cause a double check.
        Params:
            discoverer {Piece subclass} piece that discover attack;
            discoveredAttacker {Piece subclass} piece that attack by discover.
        */

        if (!discoveredAttacker.isLinear) return false;
        let discoveredAttackSquaresNames = discoveredAttacker.square.getBetweenSquaresNames(this._king.square);
        for (let squareName of discoveredAttackSquaresNames) {
            let square = this._king.board.squares[squareName];
            if (!square.piece && discoverer.squares.includes(Relation.CONTROL, square)) {
                return true;
            }
        }
        return false;
    }

    _isSeveralLegal() {
        return this._isDiscoverLegal(this.first, this.second) || this._isDiscoverLegal(this.second, this.first);
    }

    add(piece) {
        /*
        Params:
            piece {Piece subclass}.
        */

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
    */

    static INITIAL_SQUARE_NAMES = {[Piece.WHITE]: "e1", [Piece.BLACK]: "e8"};
    static stepPoints = [
        {x: -1, y: 1},  // A
        {x: 0, y: 1},   // B
        {x: 1, y: 1},   // C
        {x: 1, y: 0},   // D
        {x: 1, y: -1},  // E
        {x: 0, y: -1},  // F
        {x: -1, y: -1}, // G
        {x: -1, y: 0},  // H
    ];

    constructor(color, square, refresh=true) {
        /*
        Params:
            color {string} (white or black);
            square {Square} - where piece is placed;
            refresh {boolean} - whether refresh board after piece placed or not.
        */

        super(color, square, Piece.KING, refresh);
    }

    get onInitialSquare() {
        return this.square.name.value == King.INITIAL_SQUARE_NAMES[this.color];
    }

    _removeEnemyControlledSquares() {
        for (let kingAction of [Relation.MOVE, Relation.ATTACK]) {
            if (this.squares[kingAction]) {
                let squaresToRemove = [];
                for (let square of this.squares[kingAction]) {
                    if (square.pieces[Relation.CONTROL].filter(p => !this.sameColor(p)).length > 0) {
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
        for (let side of KingCastleRoad.ALL_SIDES) {
            if (this.castle[side] && this.castle[side].isLegal) {
                this.squares.add(Relation.MOVE, this.castle[side].toSquare);
            }
        }
    }

    _removeCastleMoves() {
        for (let side of KingCastleRoad.ALL_SIDES) {
            if (this.castle[side]) {
                this.squares.remove(Relation.MOVE, this.castle[side].toSquare);
            }
        }
    }

    setInitState() {
        this.checkers = new KingCheckers(this);
    }

    getSquares() {
        // Get king squares by piece action

        this._refreshSquares();
        this._getStepSquares(King.stepPoints);
        this._removeEnemyControlledSquares();
        this._addCastleMoves();
    }

    getCheck() {
        this._removeCastleMoves();
    }

    setCastle(castleInitial) {
        /*
        Params:
            castleInitial {KingCastleInitial}.
        */

        this.castle = new KingCastle(this, castleInitial);
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
    KingCastleRoad: KingCastleRoad,
    KingCastleInitial: KingCastleInitial,
    KingCastle: KingCastle,
    KingCheckers: KingCheckers,
    King: King
};
