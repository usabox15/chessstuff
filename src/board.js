var pieces = require('./pieces');
var Piece = pieces.Piece;
var KingCastle = pieces.KingCastle;
var KingCastleRoad = pieces.KingCastleRoad;
var KingCastleInitial = pieces.KingCastleInitial;
var square = require('./square');
var ar = require('./relations').ActionsRelation;


class BoardSquares {
    constructor(board) {
        this._create(board);
    }

    _create(board) {
        for (let symbol of square.SquareName.symbols) {
            for (let number of square.SquareName.numbers) {
                let name = `${symbol}${number}`;
                this[name] = new square.Square(name, board);
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
        return this[square.Square.coordinatesToName(x, y)];
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
                let squareName = square.Square.coordinatesToName(x, y);
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
        this.value = [
            this._getPositionData(board.squares),
            this.#colors[board.colors.current],
            this._getCastleRightsData(board.kings),
            board.enPassantSquare ? board.enPassantSquare.name.value : '-',
            board.fiftyMovesRuleCounter.value.toString(),
            board.movesCounter.value.toString(),
        ].join(' ');
    }

    _getPositionData(boardSquares) {
        let data = [];
        for (let number of square.SquareName.numbers.reverse()) {
            let rowData = [];
            for (let symbol of square.SquareName.symbols) {
                let square = boardSquares[`${symbol}${number}`];
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
        return data.join('/');
    }

    _getCastleRightsData(kings) {
        data = [];
        for (let color of Piece.ALL_COLORS) {
            let king = kings[color];
            for (let side of KingCastleRoad.ALL_SIDES) {
                if (king.castle[side]) {
                    data.push(this.#castleRights[color][side]);
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

    #piecesBox = {
        [Piece.PAWN]: pieces.Pawn,
        [Piece.KNIGHT]: pieces.Knight,
        [Piece.BISHOP]: pieces.Bishop,
        [Piece.ROOK]: pieces.Rook,
        [Piece.QUEEN]: pieces.Queen,
        [Piece.KING]: pieces.King,
    };
    #emptyFEN = '8/8/8/8/8/8/8/8 w - - 0 1';
    #initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    constructor(initial=null) {
        let initialData = this._getInitialData(initial);
        this._squares = new BoardSquares(this);
        this._colors = new BoardColors(initialData.currentColor);
        this._result = null;
        this._enPassantSquare = (
            initialData.enPassantSquareName ?
            this._squares[initialData.enPassantSquareName] :
            null
        );
        this._transformation = null;
        this._initialCastleRights = initialData.castleRights;
        this._kings = {[Piece.WHITE]: null, [Piece.BLACK]: null};
        this._fiftyMovesRuleCounter = new FiftyMovesRuleCounter(initialData.fiftyMovesRuleCounter);
        this._movesCounter = new MovesCounter(initialData.movesCounter);
        this._positionIsLegal = true;
        this._positionIsSetted = false;
        if (initial) this._setPosition(initialData.position);
    }

    get squares() {
        return this._squares;
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

    _getInitialData(initial) {
        let initialFEN = this.#emptyFEN;
        if (initial) {
            if (initial.startingPosition) {
                initialFEN = this.#initialFEN;
            } else if (initial.FEN) {
                initialFEN = initial.FEN;
            }
        }
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
        this._positionIsLegal = this._positionIsLegal && this._checkPawnsPlacementLegal(allPieces);
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

    _setCurrentColor(color) {
        this.colors = new BoardColors(color);
        this._checkPositionIsLegal();
        if (!this._positionIsLegal) {
            this._rollBack();
            return false;
        }
        return true;
    }

    _setPosition(positionData) {
        for (let [color, piecesData] of Object.entries(positionData)) {
            for (let [pieceName, squareName] of piecesData) {
                this._placePiece(color, pieceName, squareName, false);
            }
        }
        this.refreshAllSquares();
        if (this._positionIsLegal) {
            this._positionIsSetted = true;
        } else {
            this._rollBack();
        }
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
        return this._response("Success!");
    }

    _response(description, success=true, transformation=false) {
        return {
            "description": description,
            "success": success,
            "transformation": transformation,
            "result": this._result
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
        this._checkPositionIsLegal();
        if (!this._positionIsLegal) return this._response("The position isn't legal.", false);
        this._positionIsSetted = true;
        return this._response("Successfully marked!");
    }

    setCurrentColor(color) {
        if (this._positionIsSetted) {
            return this._response(
                "Not allowed to set color after position has been setted.",
                false
            );
        }
        if (!this._setCurrentColor(color)) {
            return this._response("Fail to set color.", false);
        }
        return this._response("Successfully setted!");
    }

    setPosition(positionData) {
        if (this._positionIsSetted) return this._response("The position is already setted.", false);
        this._setPosition(positionData);
        if (!this._positionIsSetted) return this._response("Fail to set position.", false);
        return this._response("Successfully setted!");
    }

    setInitial(data=null) {
        let initialData = new FENDataParser(data || this.#initialFEN);
        let setCurrentColorResponse = this.setCurrentColor(initialData.currentColor);
        if (!setCurrentColorResponse.success) return setCurrentColorResponse;
        let setPositionResponse = this.setPosition();
        if (!setPositionResponse.success) return setPositionResponse;
        return this._response("Successfully setted!");
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
