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


const { KingCastleRoad, KingCastleInitial, KingCastle } = require('./castle');
const { Piece, StepPiece } = require('../base');
const { Relation } = require('../../relations');


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
    KingCastleRoad: KingCastleRoad,
    KingCastleInitial: KingCastleInitial,
    KingCastle: KingCastle,
    KingCheckers: KingCheckers,
    King: King,
};
