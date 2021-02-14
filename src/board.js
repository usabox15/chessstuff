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


const {
    Piece, Pawn, Knight, Bishop, Rook, Queen, King,
    KingCastleRoad, KingCastleInitial, KingCastle
} = require('./pieces');
const { Relation } = require('./relations');
const { Square, SquareName } = require('./square');


class BoardSquares {
    // Board squares handler.

    constructor(board) {
        /*
        Params:
            board {Board}.
        */

        this._create(board);
    }

    _create(board) {
        /*
        Params:
            board {Board}.
        */

        this._items = [];
        for (let symbol of SquareName.symbols) {
            for (let number of SquareName.numbers) {
                let name = `${symbol}${number}`;
                let square = new Square(name, board);
                this[name] = square;
                this._items.push(square);
            }
        }
    }

    get occupied() {
        // Squares with placed pieces.

        return Object.fromEntries(
            Object.entries(this)
            .filter(data => data[1].piece)
        );
    }

    getFromCoordinates(x, y) {
        /*
        Get square by its coordinates.
        Params:
            x {number};
            y {number}.
        */

        return this[Square.coordinatesToName(x, y)];
    }

    removePieces(refresh) {
        /*
        Remove pieces from all squares.
        Params:
            refresh {boolean} - whether need to refresh board after piece has been placed or not.
        */

        for (let square of this._items) {
            square.removePiece(refresh);
        }
    }
}


class BoardColors {
    // Board colors handler.

    #priorities = {
        [Piece.WHITE]: [0, 1],
        [Piece.BLACK]: [1, 0],
    }
    #all = [Piece.WHITE, Piece.BLACK];

    constructor(currentColor) {
        /*
        Params:
            currentColor {string} one of Piece.ALL_COLORS.
        */

        if (!Piece.ALL_COLORS.includes(currentColor)) {
            throw Error(`'${currentColor}' is wrong color value. Use any of Piece.ALL_COLORS.`);
        }
        this._priority = this.#priorities[currentColor];
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


class MovesCounter {
    constructor(initialCount) {
        /*
        Params:
            initialCount {number}.
        */

        this._value = initialCount;
    }

    get value() {
        return this._value;
    }

    update() {
        this._value++;
    }
}


class FiftyMovesRuleCounter extends MovesCounter {
    constructor(initialCount) {
        /*
        Params:
            initialCount {number}.
        */

        super(initialCount);
        this._turnedOn = false;
        this._needToRefresh = false;
    }

    switch() {
        this._turnedOn = true;
        this._needToRefresh = true;
    }

    update() {
        if (!this._turnedOn) return;
        if (this._needToRefresh) {
            this._value = 0;
            this._needToRefresh = false;
        }
        else {
            this._value++;
        }
    }
}


class BoardInitialPosition {
    /*
    Scheme:
        {
            color: [
                [pieceName, squareName],
                ...
            ],
            ...
        }
    */

    static PIECES = {
        'P': [Piece.WHITE, Piece.PAWN],
        'N': [Piece.WHITE, Piece.KNIGHT],
        'B': [Piece.WHITE, Piece.BISHOP],
        'R': [Piece.WHITE, Piece.ROOK],
        'Q': [Piece.WHITE, Piece.QUEEN],
        'K': [Piece.WHITE, Piece.KING],
        'p': [Piece.BLACK, Piece.PAWN],
        'n': [Piece.BLACK, Piece.KNIGHT],
        'b': [Piece.BLACK, Piece.BISHOP],
        'r': [Piece.BLACK, Piece.ROOK],
        'q': [Piece.BLACK, Piece.QUEEN],
        'k': [Piece.BLACK, Piece.KING],
    };

    constructor(data) {
        /*
        Params:
            data {string} FEN piece placement data.
        */

        for (let color of Piece.ALL_COLORS) {
            this[color] = [];
        }
        this._rows = this._getRows(data);
        this._fillData();
    }

    _getRows(data) {
        /*
        Params:
            data {string} FEN piece placement data.
        */

        return (
            data
            .replace(/\d/g, n => {return '0'.repeat(parseInt(n))})
            .split('/')
            .reverse()
        );
    }

    _fillData() {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (this._rows[y][x] == '0') continue;
                let [color, pieceName] = BoardInitialPosition.PIECES[this._rows[y][x]];
                let squareName = Square.coordinatesToName(x, y);
                this[color].push([pieceName, squareName]);
            }
        }
    }
}


class BoardInitialCastle {
    /*
    Scheme:
        {
            color: KingCastleInitial,
            ...
        }

    Create param:
      - signs [String] (FEN castling availability data, not required).
    */

    static WHITE_SHORT = 'K';
    static WHITE_LONG = 'Q';
    static BLACK_SHORT = 'k';
    static BLACK_LONG = 'q';
    static ALL_SIGNS = [
        BoardInitialCastle.WHITE_SHORT,
        BoardInitialCastle.WHITE_LONG,
        BoardInitialCastle.BLACK_SHORT,
        BoardInitialCastle.BLACK_LONG,
    ];
    static VALUES = {
        [BoardInitialCastle.WHITE_SHORT]: [Piece.WHITE, KingCastleRoad.SHORT],
        [BoardInitialCastle.WHITE_LONG]: [Piece.WHITE, KingCastleRoad.LONG],
        [BoardInitialCastle.BLACK_SHORT]: [Piece.BLACK, KingCastleRoad.SHORT],
        [BoardInitialCastle.BLACK_LONG]: [Piece.BLACK, KingCastleRoad.LONG],
    };

    constructor(signs='-') {
        /*
        Params:
            signs {string} FEN castling availability data, not required.
        */

        this._signs = signs.slice(0, 4);
        this._fillData();
    }

    _checkSign(sign) {
        /*
        Params:
            sign {string} FEN castling availability sign.
        */

        if (!BoardInitialCastle.ALL_SIGNS.includes(sign)) {
            throw Error(`"${sign}" is not a correct castle rights sign. Use one of ${BoardInitialCastle.ALL_SIGNS}.`);
        }
    }

    _getRoadKinds() {
        let data = {};
        for (let color of Piece.ALL_COLORS) {
            data[color] = [];
        }
        for (let sign of this._signs) {
            if (sign == '-') continue;
            this._checkSign(sign);
            let [color, roadKind] = BoardInitialCastle.VALUES[sign];
            data[color].push(roadKind);
        }
        return data;
    }

    _fillData() {
        let roadKinds = this._getRoadKinds();
        for (let color of Piece.ALL_COLORS) {
            this[color] = new KingCastleInitial(roadKinds[color]);
        }
    }
}


class FENData {
    /*
    Parse data from FEN string.

    Scheme:
        {
            positionData: String,
            currentColorData: String,
            castleRightsData: String,
            enPassantData: String,
            fiftyMovesRuleData: String,
            movesCounterData: String
        }
    */

    constructor(data) {
        /*
        Params:
            data {string} FEN data string.
        */

        [
            this.positionData,
            this.currentColorData,
            this.castleRightsData,
            this.enPassantData,
            this.fiftyMovesRuleData,
            this.movesCounterData,
        ] = data.split(' ');
    }
}


class BoardInitial {
    /*
    Scheme:
        {
            position: BoardInitialPosition,
            currentColor: String,
            castleRights: BoardInitialCastle,
            enPassantSquareName: String or null,
            fiftyMovesRuleCounter: Number,
            movesCounter: Number
        }
    */

    #colors = {'w': Piece.WHITE, 'b': Piece.BLACK};

    constructor(data) {
        /*
        Params:
            data {FENData} parsed FEN data.
        */

        this.position = new BoardInitialPosition(data.positionData);
        this.currentColor = this.#colors[data.currentColorData];
        this.castleRights = new BoardInitialCastle(data.castleRightsData);
        this.enPassantSquareName = data.enPassantData == '-' ? null : data.enPassantData;
        this.fiftyMovesRuleCounter = parseInt(data.fiftyMovesRuleData);
        this.movesCounter = parseInt(data.movesCounterData);
    }
}


class FENDataCreator {
    // Create FEN string.

    #pieces = {
        [Piece.WHITE]: {
            [Piece.PAWN]: 'P',
            [Piece.KNIGHT]: 'N',
            [Piece.BISHOP]: 'B',
            [Piece.ROOK]: 'R',
            [Piece.QUEEN]: 'Q',
            [Piece.KING]: 'K',
        },
        [Piece.BLACK]: {
            [Piece.PAWN]: 'p',
            [Piece.KNIGHT]: 'n',
            [Piece.BISHOP]: 'b',
            [Piece.ROOK]: 'r',
            [Piece.QUEEN]: 'q',
            [Piece.KING]: 'k',
        },
    };
    #colors = {[Piece.WHITE]: 'w', [Piece.BLACK]: 'b'};
    #castleRights = {
        [Piece.WHITE]: {
            [KingCastleRoad.SHORT]: 'K',
            [KingCastleRoad.LONG]: 'Q',
        },
        [Piece.BLACK]: {
            [KingCastleRoad.SHORT]: 'k',
            [KingCastleRoad.LONG]: 'q',
        },
    };

    constructor(board) {
        /*
        Params:
            board {Board}.
        */

        this._board = board;
        this.value = [
            this._getPositionData(),
            this.#colors[board.colors.current],
            this._getCastleRightsData(),
            board.enPassantSquare ? board.enPassantSquare.name.value : '-',
            board.fiftyMovesRuleCounter.value.toString(),
            board.movesCounter.value.toString(),
        ].join(' ');
    }

    _getPositionData() {
        let data = [];
        for (let number of SquareName.numbers) {
            let rowData = [];
            for (let symbol of SquareName.symbols) {
                let square = this._board.squares[`${symbol}${number}`];
                if (square.piece) {
                    rowData.push(this.#pieces[square.piece.color][square.piece.kind]);
                } else {
                    rowData.push('0');
                }
            }
            data.push(
                rowData
                .join('')
                .replace(/0+/g, n => {return n.length})
            );
        }
        return data.reverse().join('/');
    }

    _getCastleRightsData() {
        let data = [];
        for (let color of Piece.ALL_COLORS) {
            let king = this._board.kings[color];
            if (king) {
                for (let side of KingCastleRoad.ALL_SIDES) {
                    if (king.castle[side]) {
                        data.push(this.#castleRights[color][side]);
                    }
                }
            }
        }
        return data.join('') || '-';
    }
}


class Board {
    // Chess board class.

    static EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';
    static INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    #piecesBox = {
        [Piece.PAWN]: Pawn,
        [Piece.KNIGHT]: Knight,
        [Piece.BISHOP]: Bishop,
        [Piece.ROOK]: Rook,
        [Piece.QUEEN]: Queen,
        [Piece.KING]: King,
    };

    constructor(FEN=Board.EMPTY_FEN) {
        /*
        Params:
            FEN {string} - FEN data string, not required.
        */

        this._squares = new BoardSquares(this);
        this._result = null;
        this._transformation = null;
        this._setKingsInitial();
        this._positionIsLegal = false;
        this._positionIsSetted = false;
        this._colors = null;
        this._initialCastleRights = null;
        this._enPassantSquare = null;
        this._fiftyMovesRuleCounter = null;
        this._movesCounter = null;
        this._latestFEN = FEN;
        this._init(FEN);
    }

    get squares() {
        return this._squares;
    }

    get positionIsSetted() {
        return this._positionIsSetted;
    }

    get transformation() {
        return this._transformation;
    }

    get colors() {
        return this._colors;
    }

    get kings() {
        return this._kings;
    }

    get enPassantSquare() {
        return this._enPassantSquare;
    }

    get fiftyMovesRuleCounter() {
        return this._fiftyMovesRuleCounter;
    }

    get movesCounter() {
        return this._movesCounter;
    }

    get FEN() {
        return (new FENDataCreator(this)).value;
    }

    get allPieces() {
        let pieces = [];
        for (let square of Object.values(this._squares.occupied)) {
            pieces.push(square.piece);
        }
        return pieces;
    }

    get insufficientMaterial() {
        let allPieces = this.allPieces;
        return this._positionIsLegal && !(
            allPieces.filter(p => p.isPawn || p.isRook || p.isQueen).length > 0
        ||
            allPieces.filter(p => p.isKnight).length > 0
            &&
            allPieces.filter(p => p.isBishop).length > 0
        ||
            allPieces.filter(p => p.isKnight).length > 1
        ||
            allPieces.filter(p => p.isBishop && p.square.isLight).length > 0
            &&
            allPieces.filter(p => p.isBishop && !p.square.isLight).length > 0
        );
    }

    get state() {
        return {
            positionIsLegal: this._positionIsLegal,
            FEN: this.FEN,
            insufficientMaterial: this.insufficientMaterial,
            result: this._result
        }
    }

    _init(FEN) {
        let initialData = new BoardInitial(new FENData(FEN));
        this._setCurrentColor(initialData.currentColor);
        this._setCastleRights(initialData.castleRights);
        this._setEnPassantSquare(initialData.enPassantSquareName);
        this._setFiftyMovesRuleCounter(initialData.fiftyMovesRuleCounter);
        this._setMovesCounter(initialData.movesCounter);
        this._setPosition(initialData.position);
    }

    _setKingsInitial() {
        this._kings = {[Piece.WHITE]: null, [Piece.BLACK]: null};
    }

    _setResult(whitePoints, blackPoints) {
        /*
        Params:
            whitePoints {number} 0 || 0.5 || 1;
            blackPoints {number} 0 || 0.5 || 1.
        */

        this._result = [whitePoints, blackPoints];
    }

    _setTransformation(fromSquareName, toSquareName) {
        /*
        Params:
            fromSquareName {string};
            toSquareName {string}.
        */

        this._transformation = {
            fromSquareName: fromSquareName,
            toSquareName: toSquareName
        };
    }

    _refreshState() {
        this._transformation = null;
        this._enPassantSquare = null;
    }

    _checkPieceCountLegal(color, allPieces) {
        /*
        Params:
            color {string} one of Piece.ALL_COLORS;
            allPieces {Array of Piece subclasses}.
        */

        return (
            allPieces.filter(p => p.isKing && p.hasColor(color)).length == 1
        &&
            allPieces.filter(p => p.isQueen && p.hasColor(color)).length <= 9
        &&
            allPieces.filter(p => p.isRook && p.hasColor(color)).length <= 10
        &&
            allPieces.filter(p => p.isBishop && p.hasColor(color)).length <= 10
        &&
            allPieces.filter(p => p.isKnight && p.hasColor(color)).length <= 10
        &&
            allPieces.filter(p => p.isPawn && p.hasColor(color)).length <= 8
        );
    }

    _checkPawnsPlacementLegal(allPieces) {
        /*
        Params:
            allPieces {Array of Piece subclasses}.
        */

        return allPieces.filter(p => p.isPawn && (p.square.onEdge.up || p.square.onEdge.down)).length == 0;
    }

    _checkKingPlacementLegal(king) {
        /*
        Params:
            king {King}.
        */

        return (
            !king.squares[Relation.ATTACK]
        ||
            king.squares[Relation.ATTACK].filter(s => s.piece.isKing).length == 0
        );
    }

    _checkCheckersLegal(king, beforeMove) {
        /*
        Params:
            king {King};
            beforeMove {boolean} whether check before move or after.
        */

        let kingColor = beforeMove ? this._colors.current : this._colors.opponent;
        return king.checkers.isLegal && (!king.checkers.exist || king.hasColor(kingColor));
    }

    _checkEnPassantSquareLegal() {
        return !this._enPassantSquare || !this._enPassantSquare.piece && (
            this._enPassantSquare.onRank(3)
            &&
            !this._enPassantSquare.neighbors.down.piece
            &&
            this._enPassantSquare.neighbors.up.piece
            &&
            this._enPassantSquare.neighbors.up.piece.isPawn
            &&
            this._enPassantSquare.neighbors.up.piece.hasColor(Piece.WHITE)
        ||
            this._enPassantSquare.onRank(6)
            &&
            !this._enPassantSquare.neighbors.up.piece
            &&
            this._enPassantSquare.neighbors.down.piece
            &&
            this._enPassantSquare.neighbors.down.piece.isPawn
            &&
            this._enPassantSquare.neighbors.down.piece.hasColor(Piece.BLACK)
        );
    }

    _checkPositionIsLegal(beforeMove=true) {
        /*
        Params:
            beforeMove {boolean} whether check before move or after.
        */

        this._positionIsLegal = true;
        let allPieces = this.allPieces;
        for (let color of Piece.ALL_COLORS) {
            let king = this.kings[color];
            this._positionIsLegal = this._positionIsLegal && (
                this._checkPieceCountLegal(color, allPieces)
            &&
                this._checkKingPlacementLegal(king)
            &&
                this._checkCheckersLegal(king, beforeMove)
            );
            if (!this._positionIsLegal) return;
        }
        this._positionIsLegal = (
            this._positionIsLegal
        &&
            this._checkPawnsPlacementLegal(allPieces)
        &&
            this._checkEnPassantSquareLegal()
        );
    }

    _placePiece(color, kind, squareName) {
        /*
        Params:
            color {string} one of Piece.ALL_COLORS;
            kind {string} one of Piece.ALL_KINDS;
            squareName {string}.
        */

        new this.#piecesBox[kind](color, this._squares[squareName], false);
    }

    _removePiece(squareName) {
        /*
        Params:
            squareName {string}.
        */

        this._squares[squareName].removePiece(false);
    }

    _replacePiece(fromSquare, toSquare, piece, refresh=true) {
        /*
        Params:
            fromSquareName {string};
            toSquareName {string};
            piece {Piece subclass};
            refresh {boolean} - whether need to refresh board after piece has been placed or not.
        */

        fromSquare.removePiece(false);
        piece.getPlace(toSquare, refresh);
    }

    _markPositionAsSetted() {
        this.refreshAllSquares();
        if (!this._positionIsLegal) {
            this._positionIsSetted = false;
            return {
                success: false,
                description: "The position is illegal."
            };
        }
        this._positionIsSetted = true;
        return {success: true};
    }

    _setPosition(positionData) {
        /*
        Params:
            positionData {booleBoardInitialPositionan}.
        Decorators: checkPositionIsSetted.
        */

        if (!positionData instanceof BoardInitialPosition) {
            return {
                success: false,
                description: "Position data has to be an instance of BoardInitialPosition."
            };
        }
        this.squares.removePieces(false);
        for (let color of Piece.ALL_COLORS) {
            let piecesData = positionData[color];
            for (let [pieceName, squareName] of piecesData.filter(d => d[0] != Piece.KING)) {
                this._placePiece(color, pieceName, squareName);
            }
            for (let [pieceName, squareName] of piecesData.filter(d => d[0] == Piece.KING)) {
                this._placePiece(color, pieceName, squareName);
            }
        }
        return this._markPositionAsSetted();
    }

    _setCurrentColor(color) {
        /*
        Params:
            color {string} one of Piece.ALL_COLORS.
        Decorators: checkPositionIsSetted.
        */

        if (!Piece.ALL_COLORS.includes(color)) {
            return {
                success: false,
                description: `"${color}" is wrong color value. Try one of ${Piece.ALL_COLORS}.`
            };
        }
        this._colors = new BoardColors(color);
        return {success: true};
    }

    _setCastleRights(castleRights) {
        /*
        Params:
            castleRights {BoardInitialCastle}.
        Decorators: checkPositionIsSetted.
        */

        if (!castleRights instanceof BoardInitialCastle) {
            return {
                success: false,
                description: "Setted data has to be an instance of BoardInitialCastle."
            };
        }
        this._initialCastleRights = castleRights;
        for (let king of Object.values(this.kings)) {
            if (king) {
                king.setCastle(castleRights[king.color]);
            }
        }
        return {success: true};
    }

    _setEnPassantSquare(squareName) {
        /*
        Params:
            squareName {string}.
        Decorators: checkPositionIsSetted.
        */

        if (squareName) {
            let allSaquaresNames = Object.keys(this.squares);
            if (!allSaquaresNames.includes(squareName)) {
                return {
                    success: false,
                    description: `"${squareName}" is wrong square name. Try one of ${allSaquaresNames}.`
                };
            }
            this._enPassantSquare = this.squares[squareName];
        } else {
            this._enPassantSquare = null;
        }
        return {success: true};
    }

    _setFiftyMovesRuleCounter(count) {
        /*
        Params:
            count {number}.
        Decorators: checkPositionIsSetted, checkCounterArgument.
        */

        this._fiftyMovesRuleCounter = new FiftyMovesRuleCounter(count);
        return {success: true};
    }

    _setMovesCounter(count) {
        /*
        Params:
            count {number}.
        Decorators: checkPositionIsSetted, checkCounterArgument.
        */

        this._movesCounter = new MovesCounter(count);
        return {success: true};
    }

    _enPassantMatter(fromSquare, toSquare, pawn) {
        /*
        En passant cases handler.
        Params:
            fromSquare {Square};
            toSquare {Square};
            pawn {Pawn}.
        */

        // jump through one square
        if (toSquare.getBetweenSquaresCount(fromSquare) == 1) {
            this._enPassantSquare = this._squares.getFromCoordinates(
                toSquare.coordinates.x,
                toSquare.coordinates.y - pawn.direction
            );
        }
        // catch other pawn en passant
        else if (pawn.squares.includes(Relation.ATTACK, toSquare) && !toSquare.piece) {
            let x = toSquare.coordinates.x;
            let y = fromSquare.coordinates.y;
            this._removePiece(this._squares.getFromCoordinates(x, y).name.value);
        }
    }

    _rookCastleMove(castleRoad) {
        /*
        Params:
            castleRoad {KingCastleRoad}.
        */

        let rookFromSquareName = castleRoad.rook.square.name.value;
        let rookToSquareName = castleRoad.rookToSquare.name.value;
        this.movePiece(rookFromSquareName, rookToSquareName, false);
    }

    _rollBack() {
        // Roll position back to latest setted position

        this._positionIsSetted = false;
        this._setKingsInitial();
        this._init(this._latestFEN);
    }

    _updateCounters() {
        this._fiftyMovesRuleCounter.update();
        if (this._colors.current == Piece.WHITE) {
            this._movesCounter.update();
        }
    }

    _moveEnd() {
        this.refreshAllSquares(false);
        if (!this._positionIsLegal) {
            this._rollBack();
            return this._response("The position would be illegal after that.", false);
        }
        this._colors.changePriority();
        this._updateCounters();
        this._latestFEN = this.FEN;
        return this._response("Success!");
    }

    _response(description, success=true, transformation=false) {
        /*
        Params:
            description {string};
            success {boolean};
            transformation {boolean} - whether there is pawn transformation time or not.
        */

        return Object.assign(this.state, {
            description: description,
            success: success,
            transformation: transformation,
        });
    }

    placeKing(king) {
        /*
        Params:
            king {King}.
        */

        if (!king.isKing) {
            throw Error(`Piece need to be a king not ${king.kind}.`);
        }
        if (this.kings[king.color]) {
            throw Error(`${king.color} king is already exists on this board.`);
        }
        this.kings[king.color] = king;
        if (this._initialCastleRights && this._initialCastleRights[king.color]) {
            king.setCastle(this._initialCastleRights[king.color]);
        }

        return this._response("Success!");
    }

    refreshAllSquares(beforeMove=true) {
        /*
        Params:
            beforeMove {boolean} whether check before move or after.
        */

        for (let piece of this.allPieces) {
            piece.getInitState();
        }
        for (let piece of this.allPieces.filter(p => !p.isKing)) {
            piece.getSquares();
        }
        for (let piece of this.allPieces.filter(p => p.binder)) {
            piece.getBind(this._kings[piece.color].square);
        }
        for (let piece of this.allPieces.filter(p => p.isKing)) {
            piece.getSquares();
        }

        this._checkPositionIsLegal(beforeMove);

        let oppColor;
        let firstPriority;
        let secondPriority;
        if (this._positionIsSetted) {
            oppColor = this._colors.opponent;
            firstPriority = this._colors.firstPriority;
            secondPriority = this._colors.secondPriority;
        } else {
            oppColor = this._colors.current;
            firstPriority = this._colors.secondPriority;
            secondPriority = this._colors.firstPriority;
        }

        let oppKing = this._kings[oppColor];
        if (oppKing) {
            if (oppKing.checkers.single) {
                let noMoves = true;
                let checker = oppKing.checkers.first;
                let betweenSquares = checker.isLinear ? checker.square.getBetweenSquaresNames(oppKing.square) : [];
                for (let piece of this.allPieces.filter(p => p.sameColor(oppKing))) {
                    piece.getCheck(checker, betweenSquares);
                    if (!piece.stuck) noMoves = false;
                }
                if (noMoves) this._setResult(secondPriority, firstPriority);
            }
            else if (oppKing.checkers.several) {
                for (let piece of this.allPieces.filter(p => p.sameColor(oppKing) && !p.isKing)) {
                    piece.getTotalImmobilize();
                }
                if (oppKing.stuck) this._setResult(secondPriority, firstPriority);
            }
            else if (this.insufficientMaterial) {
                this._setResult(0.5, 0.5);
            }
            else {
                let noMoves = true;
                for (let piece of this.allPieces.filter(p => p.sameColor(oppKing))) {
                    if (!piece.stuck) {
                        noMoves = false;
                        break;
                    }
                }
                if (noMoves) this._setResult(0.5, 0.5);
            }
        }

        return this._response("Success!");
    }

    markPositionAsSetted() {
        // Decorators: handleSetBoardDataMethodResponse.

        return this._markPositionAsSetted();
    }

    placePiece(color, kind, squareName) {
        /*
        Params:
            color {string} one of Piece.ALL_COLORS;
            kind {string} one of Piece.ALL_KINDS;
            squareName {string}.
        Decorators: checkPositionIsSetted.
        */

        this._placePiece(color, kind, squareName);
        return this._response("Successfully placed!");
    }

    removePiece(squareName) {
        /*
        Params:
            squareName {string}.
        Decorators: checkPositionIsSetted.
        */

        this._removePiece(squareName);
        return this._response("Successfully removed!");
    }

    setPosition(positionData) {
        /*
        Params:
            positionData {booleBoardInitialPositionan}.
        Decorators: handleSetBoardDataMethodResponse.
        */

        return this._setPosition(positionData);
    }

    setCurrentColor(color) {
        /*
        Params:
            color {string} one of Piece.ALL_COLORS.
        Decorators: handleSetBoardDataMethodResponse.
        */

        return this._setCurrentColor(color);
    }

    setCastleRights(castleRights) {
        /*
        Params:
            castleRights {BoardInitialCastle}.
        Decorators: handleSetBoardDataMethodResponse.
        */

        return this._setCastleRights(castleRights);
    }

    setEnPassantSquare(squareName) {
        /*
        Params:
            squareName {string}.
        Decorators: handleSetBoardDataMethodResponse.
        */

        return this._setEnPassantSquare(squareName);
    }

    setFiftyMovesRuleCounter(count) {
        /*
        Params:
            count {number}.
        Decorators: handleSetBoardDataMethodResponse.
        */

        return this._setFiftyMovesRuleCounter(count);
    }

    setMovesCounter(count) {
        /*
        Params:
            count {number}.
        Decorators: handleSetBoardDataMethodResponse.
        */

        return this._setMovesCounter(count);
    }

    pawnTransformation(kind) {
        /*
        Params:
            kind {string} one of Piece.ALL_KINDS.
        */

        if (!this._positionIsSetted) return this._response("The position isn't setted.", false);
        if (this._result) return this._response("The result is already reached.", false);
        this._checkPositionIsLegal();
        if (!this._positionIsLegal) return this._response("The position isn't legal.", false);
        if (!this.transformation) return this._response("There isn't transformation.", false);

        this._placePiece(this._colors.current, kind, this.transformation.toSquareName);
        this._removePiece(this.transformation.fromSquareName);
        this._refreshState();
        this._fiftyMovesRuleCounter.switch();
        return this._moveEnd();
    }

    movePiece(from, to, refresh=true) {
        /*
        Params:
            from {string} from square name;
            to {string} to square name;
            refresh {boolean} - whether need to refresh board after piece has been placed or not.
        */

        if (!this._positionIsSetted) return this._response("The position isn't setted.", false);
        if (this._result) return this._response("The result is already reached.", false);
        this._checkPositionIsLegal();
        if (!this._positionIsLegal) return this._response("The position isn't legal.", false);

        let fromSquare = this._squares[from];
        let toSquare = this._squares[to];
        let piece = fromSquare.piece;

        if (!piece) return this._response("There isn't a piece to replace.", false);
        if (!piece.hasColor(this._colors.current)) return this._response("Wrong color piece.", false);
        if (!piece.canBeReplacedTo(toSquare)) return this._response("Illegal move.", false);

        this._refreshState();
        if (piece.isKing) {
            let castleRoad = piece.castle.getRoad(toSquare);
            if (castleRoad) {
                this._rookCastleMove(castleRoad);
            }
            piece.castle.stop();
        }
        else if (piece.isRook) {
            if (piece.castleRoad) {
                this._kings[piece.color].castle.stop(piece.castleRoad.side);
            }
        }
        else if (piece.isPawn) {
            if (toSquare.onEdge.up || toSquare.onEdge.down) {
                this._setTransformation(from, to);
                return this._response(`Pawn is ready to transform on ${to} square.`, true, true);
            }
            this._enPassantMatter(fromSquare, toSquare, piece);
        }

        this._replacePiece(fromSquare, toSquare, piece, false);

        if (piece.isPawn || piece.squares.includes(Relation.ATTACK, toSquare)) {
            this._fiftyMovesRuleCounter.switch();
        }

        if (refresh) return this._moveEnd();
    }
}


function checkPositionIsSetted(setBoardDataMethod) {
    /*
    Decorator to check whether board pisition is setted or not when set board data method is called.
    Params:
        setBoardDataMethod {string} - decorated method name.
    */

    function wrapper(...args) {
        if (this._positionIsSetted) {
            return {
                success: false,
                description: "Position has been already setted."
            };
        }
        return setBoardDataMethod.call(this, ...args);
    }
    return wrapper;
}
let checkPositionIsSettedApplyFor = [
    'placePiece',
    'removePiece',
    '_setPosition',
    '_setCurrentColor',
    '_setCastleRights',
    '_setEnPassantSquare',
    '_setFiftyMovesRuleCounter',
    '_setMovesCounter'
];
for (let methodName of checkPositionIsSettedApplyFor) {
    Board.prototype[methodName] = checkPositionIsSetted(Board.prototype[methodName]);
}


function checkCounterArgument(setBoardCounterMethod) {
    /*
    Decorator to check whether count argument is number or not when set board counter method is called.
    Params:
        setBoardCounterMethod {string} - decorated method name.
    */

    function wrapper(count) {
        let countType = typeof count;
        if (countType != 'number') {
            return {
                success: false,
                description: `Count need to be an number. Not "${countType}".`
            };
        }
        return setBoardCounterMethod.call(this, count);
    }
    return wrapper;
}
let checkCounterArgumentApplyFor = ['_setFiftyMovesRuleCounter', '_setMovesCounter'];
for (let methodName of checkCounterArgumentApplyFor) {
    Board.prototype[methodName] = checkPositionIsSetted(Board.prototype[methodName]);
}


function handleSetBoardDataMethodResponse(setBoardDataMethod) {
    /*
    Decorator to handle set board data method response.
    Params:
        handleSetBoardDataMethodResponse {string} - decorated method name.
    */

    function wrapper(...args) {
        let result = setBoardDataMethod.call(this, ...args);
        if (!result.success) return this._response(result.description, false);
        return this._response("Success!");
    }
    return wrapper;
}
let handleSetBoardDataMethodResponseApplyFor = [
    'markPositionAsSetted',
    'setPosition',
    'setCurrentColor',
    'setCastleRights',
    'setEnPassantSquare',
    'setFiftyMovesRuleCounter',
    'setMovesCounter'
];
for (let methodName of handleSetBoardDataMethodResponseApplyFor) {
    Board.prototype[methodName] = checkPositionIsSetted(Board.prototype[methodName]);
}


module.exports = {
    Board: Board,
    BoardColors: BoardColors,
    BoardInitial,
    BoardInitialCastle: BoardInitialCastle,
    BoardInitialPosition: BoardInitialPosition,
    BoardSquares: BoardSquares,
    FENData: FENData,
    FENDataCreator: FENDataCreator,
    FiftyMovesRuleCounter: FiftyMovesRuleCounter,
    MovesCounter: MovesCounter
};
