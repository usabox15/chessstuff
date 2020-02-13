var pieces = require('./pieces');
var Piece = pieces.Piece;
var KingCastleRoad = pieces.KingCastleRoad;
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


class FENDataParser {
    /*
    Parse data from FEN string.
    */

    #pieces = {
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
    #colors = {'w': Piece.WHITE, 'b': Piece.BLACK};
    #castleRights = {
        'K': [Piece.WHITE, KingCastleRoad.SHORT],
        'Q': [Piece.WHITE, KingCastleRoad.LONG],
        'k': [Piece.BLACK, KingCastleRoad.SHORT],
        'q': [Piece.BLACK, KingCastleRoad.LONG],
    };

    constructor(data) {
        let [
            positionData,
            currentColorData,
            castleRightsData,
            enPassantData,
            fiftyMovesRuleData,
            movesCounterData,
        ] = data.split(' ');
        this.position = {[Piece.WHITE]: [], [Piece.BLACK]: []};
        this._getPosition(positionData);
        this.currentColor = this.#colors[currentColorData];
        this.castleRights = {
            [Piece.WHITE]: {
                [KingCastleRoad.SHORT]: false,
                [KingCastleRoad.LONG]: false,
            },
            [Piece.BLACK]: {
                [KingCastleRoad.SHORT]: false,
                [KingCastleRoad.LONG]: false,
            }
        };
        this._castleRights(castleRightsData);
        this.enPassantSquareName = enPassantData == '-' ? null : enPassantData;
        this.fiftyMovesRuleCounter = parseInt(fiftyMovesRuleData);
        this.movesCounter = parseInt(movesCounterData);
    }

    _getPosition(positionData) {
        let rows = (
            positionData
            .replace(/\d/g, n => {return '1'.repeat(parseInt(n))})
            .split('/')
            .reverse()
        );
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (rows[y][x] == '1') continue;
                let [color, pieceName] = this.#pieces[rows[y][x]];
                let squareName = square.Square.coordinatesToName(x, y);
                this.position[color].push([pieceName, squareName]);
            }
        }
    }

    _castleRights(castleRightsData) {
        for (let sign of castleRightsData) {
            if (sign == '-') continue;
            let [color, roadKind] = this.#castleRights[sign];
            this.castleRights[color][roadKind] = true;
        }
    }
}


class Board {
    /*
    Chess board class.
    There is create param:
      - initial [Object] {
            FEN [String] (FEN data string, not required)
            data [Object] {
                position [Object] {
                    color: [
                        [pieceName, squareName],
                    ],
                } (pieces placing, not required)
                currentColor [String] (default is Piece.WHITE, not required)
                castleRights [Object] {
                    color: {
                        kindOfCastleRoad: boolean,
                    },
                } (not required)
                enPassantSquareName [String] (not required)
                fiftyMovesRuleCounter [Number] (
                    count of half moves after latest pawn move or latest piece capture
                    not required
                )
                movesCounter [Number] (not required)
            } (not required)
        } (not required).

    Initial example with FEN:
        initial = {
            FEN: 'r3k3/8/8/8/6P1/8/8/4K2R b Kq g3 0 1'
        }

    Initial example with data:
        initial = {
            data: {
                position: {
                    [Piece.WHITE]: [
                        [Piece.ROOK, 'h1'],
                        [Piece.PAWN, 'g4'],
                        [Piece.KING, 'e1'],
                    ],
                    [Piece.BLACK]: [
                        [Piece.ROOK, 'a8'],
                        [Piece.KING, 'e8'],
                    ]
                },
                currentColor: Piece.BLACK,
                castleRights: {
                    [Piece.WHITE]: {
                        [KingCastleRoad.SHORT]: true,
                        [KingCastleRoad.LONG]: false,
                    }
                    [Piece.BLACK]: {
                        [KingCastleRoad.SHORT]: false,
                        [KingCastleRoad.LONG]: true,
                    }
                },
                enPassantSquareName: 'g3',
                fiftyMovesRuleCounter: 0,
                movesCounter: 1,
            }
        }
    */

    #piecesBox = {
        [Piece.PAWN]: pieces.Pawn,
        [Piece.KNIGHT]: pieces.Knight,
        [Piece.BISHOP]: pieces.Bishop,
        [Piece.ROOK]: pieces.Rook,
        [Piece.QUEEN]: pieces.Queen,
        [Piece.KING]: pieces.King,
    };
    #initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    constructor(initial=null) {
        let initialData = {};
        if (initial) {
            if (initial.FEN) {
                initialData = new FENDataParser(initial.FEN);
            } else if (initial.data) {
                initialData = initial.data;
            }
        }
        this.squares = new BoardSquares(this);
        this.colors = new BoardColors(initialData.currentColor || Piece.WHITE);
        this.result = null;
        this.enPassantSquare = null;
        if (initialData.enPassantSquareName) {
            this.enPassantSquare = this.squares[initialData.enPassantSquareName];
        }
        this.transformation = null;
        this.initialCastleRights = initialData.castleRights || null;
        this.kings = {[Piece.WHITE]: null, [Piece.BLACK]: null};
        this.fiftyMovesRuleCounter = new FiftyMovesRuleCounter(initialData.fiftyMovesRuleCounter || 0);
        this.movesCounter = new MovesCounter(initialData.movesCounter || 1);
        if (initialData.position) this._setPosition(initialData.position);
    }

    get allPieces() {
        let pieces = [];
        for (let square of Object.values(this.squares.occupied)) {
            pieces.push(square.piece);
        }
        return pieces;
    }

    _placePiece(color, kind, squareName) {
        let data = [color, this.squares[squareName]];
        if (kind == Piece.KING && this.initialCastleRights && this.initialCastleRights[color]) {
            data.push(this.initialCastleRights[color]);
        }
        let piece = new this.#piecesBox[kind](...data);
        if (piece.isKing) {
            this.kings[color] = piece;
        }
    }

    _removePiece(squareName) {
        this.squares[squareName].removePiece();
    }

    _replacePiece(fromSquare, toSquare, piece) {
        fromSquare.removePiece();
        piece.getPlace(toSquare);
    }

    _setPosition(positionData) {
        for (let [color, piecesData] of Object.entries(positionData)) {
            for (let [pieceName, squareName] of piecesData) {
                this._placePiece(color, pieceName, squareName);
            }
        }
        this._refreshAllSquares();
    }

    _enPassantMatter(fromSquare, toSquare, pawn) {
        // jump through one square
        if (toSquare.getBetweenSquaresCount(fromSquare) == 1) {
            this.enPassantSquare = this.squares.getFromCoordinates(
                toSquare.coordinates.x,
                toSquare.coordinates.y - pawn.direction
            );
            for (let [state, dx] of [["right", 1], ["left", -1]]) {
                if (!toSquare.onEdge[state]) {
                    let x = toSquare.coordinates.x + dx;
                    let y = toSquare.coordinates.y;
                    let otherPiece = this.squares.getFromCoordinates(x, y).piece;
                    if (otherPiece && otherPiece.isPawn) {
                        otherPiece.setEnPassantSquare(this.enPassantSquare);
                    }
                }
            }
        }
        // catch other pawn en passant
        else if (pawn.squares.includes(ar.ATTACK, toSquare) && !toSquare.piece) {
            let x = toSquare.coordinates.x;
            let y = fromSquare.coordinates.y;
            this._removePiece(this.squares.getFromCoordinates(x, y).name.value);
        }
    }

    _rookCastleMove(castleRoad) {
        let rookFromSquareName = castleRoad.rook.square.name.value;
        let rookToSquareName = castleRoad.rookToSquare.name.value;
        this.movePiece(rookFromSquareName, rookToSquareName, false);
    }

    _refreshAllSquares() {
        for (let piece of this.allPieces) {
            piece.getInitState();
        }
        for (let piece of this.allPieces.filter(p => !p.isKing)) {
            piece.getSquares();
        }
        for (let piece of this.allPieces.filter(p => p.binder)) {
            piece.getBind(this.kings[piece.color].square);
        }
        for (let piece of this.allPieces.filter(p => p.isKing)) {
            piece.getSquares();
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

    _updateCounters() {
        this.fiftyMovesRuleCounter.update();
        if (this.colors.current == Piece.BLACK) {
            this.movesCounter.update();
        }
    }

    _refreshState() {
        this._refreshAllSquares();
        this.colors.changePriority();
        this.enPassantSquare = null;
    }

    _moveEnd() {
        this._updateCounters();
        this._refreshState();
    }

    _response(description, success=true, transformation=false) {
        return {
            "description": description,
            "success": success,
            "transformation": transformation,
            "result": this.result
        }
    }

    setInitialPosition() {
        this._setPosition(new FENDataParser(this.#initialFEN));
    }

    pawnTransformation(kind) {
        if (!this.transformation) return this._response("There isn't transformation.", false);

        this._placePiece(this.colors.current, kind, this.transformation.transformationSquare);
        this._removePiece(this.transformation.upToTransformationSquare);
        this.transformation = null;
        this.fiftyMovesRuleCounter.switch();
        this._moveEnd();
        return this._response("Successfully transformed!");
    }

    movePiece(from, to, refresh=true) {
        let fromSquare = this.squares[from];
        let toSquare = this.squares[to];
        let piece = fromSquare.piece;

        if (!piece) return this._response("There isn't a piece to replace.", false);
        if (!piece.hasColor(this.colors.current)) return this._response("Wrong color piece.", false);
        if (!piece.canBeReplacedTo(toSquare)) return this._response("Illegal move.", false);

        this.transformation = null;
        if (piece.isKing) {
            let castleRoad = piece.castle.getRoad(toSquare);
            if (castleRoad) {
                this._rookCastleMove(castleRoad);
            }
            piece.castle.stop();
        }
        else if (piece.isRook) {
            if (piece.castleRoad) {
                this.kings[piece.color].castle.stop(piece.castleRoad.side);
            }
        }
        else if (piece.isPawn) {
            if (toSquare.onEdge.up || toSquare.onEdge.down) {
                this.transformation = {
                    upToTransformationSquare: from,
                    transformationSquare: to
                };
                return this._response(`Pawn is ready to transform on ${to} square.`, true, true);
            }
            this._enPassantMatter(fromSquare, toSquare, piece);
        }

        this._replacePiece(fromSquare, toSquare, piece);

        if (piece.isPawn || piece.squares.includes(ar.ATTACK, toSquare)) {
            this.fiftyMovesRuleCounter.switch();
        }

        if (refresh) this._moveEnd();

        return this._response("Successfully moved!");
    }
}


module.exports = {
    Board: Board,
    BoardColors: BoardColors,
    BoardSquares: BoardSquares,
    FENDataParser: FENDataParser,
    FiftyMovesRuleCounter: FiftyMovesRuleCounter,
    MovesCounter: MovesCounter
};
