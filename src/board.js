var piecesModule = require('./pieces');
var Piece = piecesModule.Piece;
var KingCastle = piecesModule.KingCastle;
var KingCastleRoad = piecesModule.KingCastleRoad;
var KingCastleInitial = piecesModule.KingCastleInitial;

var relationsModule = require('./relations');
var ar = relationsModule.ActionsRelation;

var squareModule = require('./square');
var Square = squareModule.Square;
var SquareName = squareModule.SquareName;


class BoardSquares {
    constructor(board) {
        this._create(board);
    }

    _create(board) {
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
        return Object.fromEntries(
            Object.entries(this)
            .filter(data => data[1].piece)
        );
    }

    getFromCoordinates(x, y) {
        return this[Square.coordinatesToName(x, y)];
    }

    removePieces(refresh) {
        for (let square of this._items) {
            square.removePiece(refresh);
        }
    }
}


class BoardColors {
    #priorities = {
        [Piece.WHITE]: [0, 1],
        [Piece.BLACK]: [1, 0],
    }
    #all = [Piece.WHITE, Piece.BLACK];

    constructor(currentColor) {
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

    Create param:
      - data [String] (FEN piece placement data).
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
        for (let color of Piece.ALL_COLORS) {
            this[color] = [];
        }
        this._rows = this._getRows(data);
        this._fillData();
    }

    _getRows(data) {
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
        this._signs = signs.slice(0, 4);
        this._fillData();
    }

    _checkSign(sign) {
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

    Create param:
      - data [String] (FEN data string).
    */

    constructor(data) {
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

    Create param:
      - data [FENData] (parsed FEN data).
    */

    #colors = {'w': Piece.WHITE, 'b': Piece.BLACK};

    constructor(data) {
        this.position = new BoardInitialPosition(data.positionData);
        this.currentColor = this.#colors[data.currentColorData];
        this.castleRights = new BoardInitialCastle(data.castleRightsData);
        this.enPassantSquareName = data.enPassantData == '-' ? null : data.enPassantData;
        this.fiftyMovesRuleCounter = parseInt(data.fiftyMovesRuleData);
        this.movesCounter = parseInt(data.movesCounterData);
    }
}


class FENDataCreator {
    /*
    Create FEN string.

    Create param:
      - board [Board].
    */

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
    /*
    Chess board class.
    Create param:
      - initial [Object] {
            startingPosition: Boolean, // whether set starting position or not, not required
            FEN: String // FEN data string, not required
        } (not required).
    */

    static EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';
    static INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    #piecesBox = {
        [Piece.PAWN]: piecesModule.Pawn,
        [Piece.KNIGHT]: piecesModule.Knight,
        [Piece.BISHOP]: piecesModule.Bishop,
        [Piece.ROOK]: piecesModule.Rook,
        [Piece.QUEEN]: piecesModule.Queen,
        [Piece.KING]: piecesModule.King,
    };

    constructor(initial=null) {
        this._squares = new BoardSquares(this);
        this._result = null;
        this._transformation = null;
        this._kings = {[Piece.WHITE]: null, [Piece.BLACK]: null};
        this._positionIsLegal = false;
        this._positionIsSetted = false;
        this._colors = null;
        this._initialCastleRights = null;
        this._enPassantSquare = null;
        this._fiftyMovesRuleCounter = null;
        this._movesCounter = null;
        this._latestFEN = null;
        this._init(initial);
    }

    get squares() {
        return this._squares;
    }

    get positionIsSetted() {
        return this._positionIsSetted;
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

    _init(initial) {
        let initialData = this._getInitialData(initial);
        this._setCurrentColor(initialData.currentColor);
        this._setCastleRights(initialData.castleRights);
        this._setEnPassantSquare(initialData.enPassantSquareName);
        this._setFiftyMovesRuleCounter(initialData.fiftyMovesRuleCounter);
        this._setMovesCounter(initialData.movesCounter);
        if (initial) this._setPosition(initialData.position);
    }

    _getInitialData(initial) {
        let initialFEN = Board.EMPTY_FEN;
        if (initial) {
            if (initial.startingPosition) {
                initialFEN = Board.INITIAL_FEN;
            } else if (initial.FEN) {
                initialFEN = initial.FEN;
            }
        }
        this._latestFEN = initialFEN;
        return new BoardInitial(new FENData(initialFEN));
    }

    _setResult(whitePoints, blackPoints) {
        this._result = [whitePoints, blackPoints];
    }

    _setTransformation(fromSquareName, toSquareName) {
        this._transformation = {
            fromSquareName: fromSquareName,
            toSquareName: toSquareName
        };
    }

    _refreshTransformation() {
        this._transformation = null;
    }

    _checkPieceCountLegal(color, allPieces) {
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
        return allPieces.filter(p => p.isPawn && (p.square.onEdge.up || p.square.onEdge.down)).length == 0;
    }

    _checkKingPlacementLegal(king) {
        return (
            !king.squares[ar.ATTACK]
        ||
            king.squares[ar.ATTACK].filter(s => s.piece.isKing).length == 0
        );
    }

    _checkCheckersLegal(king) {
        return king.checkers.isLegal && (!king.checkers.exist || king.hasColor(this._colors.current));
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
            &&
            (
                !this._enPassantSquare.onEdge.left
                &&
                this._enPassantSquare.neighbors.upLeft.piece
                &&
                this._enPassantSquare.neighbors.upLeft.piece.isPawn
                &&
                this._enPassantSquare.neighbors.upLeft.piece.hasColor(Piece.BLACK)
            ||
                !this._enPassantSquare.onEdge.right
                &&
                this._enPassantSquare.neighbors.upRight.piece
                &&
                this._enPassantSquare.neighbors.upRight.piece.isPawn
                &&
                this._enPassantSquare.neighbors.upRight.piece.hasColor(Piece.BLACK)
            )
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
            &&
            (
                !this._enPassantSquare.onEdge.left
                &&
                this._enPassantSquare.neighbors.downLeft.piece
                &&
                this._enPassantSquare.neighbors.downLeft.piece.isPawn
                &&
                this._enPassantSquare.neighbors.downLeft.piece.hasColor(Piece.WHITE)
            ||
                !this._enPassantSquare.onEdge.right
                &&
                this._enPassantSquare.neighbors.downRight.piece
                &&
                this._enPassantSquare.neighbors.downRight.piece.isPawn
                &&
                this._enPassantSquare.neighbors.downRight.piece.hasColor(Piece.WHITE)
            )
        );
    }

    _checkPositionIsLegal() {
        this._positionIsLegal = true;
        let allPieces = this.allPieces;
        for (let color of Piece.ALL_COLORS) {
            let king = this.kings[color];
            this._positionIsLegal = this._positionIsLegal && (
                this._checkPieceCountLegal(color, allPieces)
            &&
                this._checkKingPlacementLegal(king)
            &&
                this._checkCheckersLegal(king)
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

    _placePiece(color, kind, squareName, refresh=true) {
        let data = [color, this._squares[squareName]];
        if (kind == Piece.KING && this._initialCastleRights && this._initialCastleRights[color]) {
            data.push(this._initialCastleRights[color]);
        }
        let piece = new this.#piecesBox[kind](...data, refresh);
        if (piece.isKing) {
            this._kings[color] = piece;
        }
    }

    _removePiece(squareName, refresh=true) {
        this._squares[squareName].removePiece(refresh);
    }

    _replacePiece(fromSquare, toSquare, piece, refresh=true) {
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
        // Decorators: checkPositionIsSetted.
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
                this._placePiece(color, pieceName, squareName, false);
            }
            for (let [pieceName, squareName] of piecesData.filter(d => d[0] == Piece.KING)) {
                this._placePiece(color, pieceName, squareName, false);
            }
        }
        return this._markPositionAsSetted();
    }

    _setCurrentColor(color) {
        // Decorators: checkPositionIsSetted.
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
        // Decorators: checkPositionIsSetted.
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
        // Decorators: checkPositionIsSetted.
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
        // Decorators: checkPositionIsSetted, checkCounterArgument.
        this._fiftyMovesRuleCounter = new FiftyMovesRuleCounter(count);
        return {success: true};
    }

    _setMovesCounter(count) {
        // Decorators: checkPositionIsSetted, checkCounterArgument.
        this._movesCounter = new MovesCounter(count);
        return {success: true};
    }

    _enPassantMatter(fromSquare, toSquare, pawn) {
        // jump through one square
        if (toSquare.getBetweenSquaresCount(fromSquare) == 1) {
            this._enPassantSquare = this._squares.getFromCoordinates(
                toSquare.coordinates.x,
                toSquare.coordinates.y - pawn.direction
            );
            for (let [state, dx] of [["right", 1], ["left", -1]]) {
                if (!toSquare.onEdge[state]) {
                    let x = toSquare.coordinates.x + dx;
                    let y = toSquare.coordinates.y;
                    let otherPiece = this._squares.getFromCoordinates(x, y).piece;
                    if (otherPiece && otherPiece.isPawn) {
                        otherPiece.setEnPassantSquare(this._enPassantSquare);
                    }
                }
            }
        }
        // catch other pawn en passant
        else if (pawn.squares.includes(ar.ATTACK, toSquare) && !toSquare.piece) {
            let x = toSquare.coordinates.x;
            let y = fromSquare.coordinates.y;
            this._removePiece(this._squares.getFromCoordinates(x, y).name.value, false);
        }
    }

    _rookCastleMove(castleRoad) {
        let rookFromSquareName = castleRoad.rook.square.name.value;
        let rookToSquareName = castleRoad.rookToSquare.name.value;
        this.movePiece(rookFromSquareName, rookToSquareName, false);
    }

    _rollBack() {
        this._positionIsSetted = false;
        this._init({FEN: this._latestFEN});
    }

    _updateCounters() {
        this._fiftyMovesRuleCounter.update();
        if (this._colors.current == Piece.BLACK) {
            this._movesCounter.update();
        }
    }

    _moveEnd() {
        this.refreshAllSquares();
        if (!this._positionIsLegal) {
            this._rollBack();
            return this._response("The position would be illegal after that.", false);
        }
        this._colors.changePriority();
        this._enPassantSquare = null;
        this._updateCounters();
        this._latestFEN = this.FEN;
        return this._response("Success!");
    }

    _response(description, success=true, transformation=false) {
        return {
            description: description,
            success: success,
            transformation: transformation,
            FEN: this.FEN,
            result: this._result
        }
    }

    placeKing(king) {
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
    }

    refreshAllSquares() {
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

        let oppKing = this._kings[this._colors.opponent];
        if (oppKing) {
            if (oppKing.checkers.single) {
                let noMoves = true;
                let checker = oppKing.checkers.first;
                let betweenSquares = checker.isLinear ? checker.square.getBetweenSquaresNames(oppKing.square) : [];
                for (let piece of this.allPieces.filter(p => p.sameColor(oppKing))) {
                    piece.getCheck(checker, betweenSquares);
                    if (!piece.stuck) noMoves = false;
                }
                if (noMoves) this._setResult(this._colors.secondPriority, this._colors.firstPriority);
            }
            else if (oppKing.checkers.several) {
                for (let piece of this.allPieces.filter(p => p.sameColor(oppKing) && !p.isKing)) {
                    piece.getTotalImmobilize();
                }
                if (oppKing.stuck) this._setResult(this._colors.secondPriority, this._colors.firstPriority);
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

        this._checkPositionIsLegal();
    }

    markPositionAsSetted() {
        // Decorators: handleSetBoardDataMethodResponse.
        return this._markPositionAsSetted();
    }

    placePiece(color, kind, squareName) {
        // Decorators: checkPositionIsSetted.
        this._placePiece(color, kind, squareName, false);
        return this._response("Successfully placed!");
    }

    removePiece(squareName) {
        // Decorators: checkPositionIsSetted.
        this._removePiece(squareName, false);
        return this._response("Successfully removed!");
    }

    setPosition(positionData) {
        // Decorators: handleSetBoardDataMethodResponse.
        return this._setPosition(positionData);
    }

    setCurrentColor(color) {
        // Decorators: handleSetBoardDataMethodResponse.
        return this._setCurrentColor(color);
    }

    setCastleRights(castleRights) {
        // Decorators: handleSetBoardDataMethodResponse.
        return this._setCastleRights(castleRights);
    }

    setEnPassantSquare(squareName) {
        // Decorators: handleSetBoardDataMethodResponse.
        return this._setEnPassantSquare(squareName);
    }

    setFiftyMovesRuleCounter(count) {
        // Decorators: handleSetBoardDataMethodResponse.
        return this._setFiftyMovesRuleCounter(count);
    }

    setMovesCounter(count) {
        // Decorators: handleSetBoardDataMethodResponse.
        return this._setMovesCounter(count);
    }

    pawnTransformation(kind) {
        if (!this._positionIsSetted) return this._response("The position isn't setted.", false);
        if (this._result) return this._response("The result is already reached.", false);
        this._checkPositionIsLegal();
        if (!this._positionIsLegal) return this._response("The position isn't legal.", false);
        if (!this._transformation) return this._response("There isn't transformation.", false);

        this._placePiece(this._colors.current, kind, this._transformation.toSquareName, false);
        this._removePiece(this._transformation.fromSquareName, false);
        this._refreshTransformation();
        this._fiftyMovesRuleCounter.switch();
        return this._moveEnd();
    }

    movePiece(from, to, refresh=true) {
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

        this._refreshTransformation();
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

        if (piece.isPawn || piece.squares.includes(ar.ATTACK, toSquare)) {
            this._fiftyMovesRuleCounter.switch();
        }

        if (refresh) return this._moveEnd();
    }
}


function checkPositionIsSetted(setBoardDataMethod) {
    /*
    Decorator to check whether board pisition is setted or not when set board data method is called.
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
