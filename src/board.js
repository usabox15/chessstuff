var pieces = require('./pieces');
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
        [pieces.Piece.WHITE]: [0, 1],
        [pieces.Piece.BLACK]: [1, 0],
    }
    #all = [pieces.Piece.WHITE, pieces.Piece.BLACK];

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


class Board {
    #piecesBox = {
        "pawn": pieces.Pawn,
        "knight": pieces.Knight,
        "bishop": pieces.Bishop,
        "rook": pieces.Rook,
        "queen": pieces.Queen,
        "king": pieces.King,
    };

    constructor() {
        this.squares = new BoardSquares(this);
        this.colors = new BoardColors(pieces.Piece.WHITE);
        this.result = null;
        this.transformation = null;
        this.kings = {[pieces.Piece.WHITE]: null, [pieces.Piece.BLACK]: null};
    }

    get allPieces() {
        let pieces = [];
        for (let square of Object.values(this.squares.occupied)) {
            pieces.push(square.piece);
        }
        return pieces;
    }

    _response(description, success=true, transformation=false) {
        return {
            "description": description,
            "success": success,
            "transformation": transformation,
            "result": this.result
        }
    }

    refreshState() {
        this.refreshAllSquares();
        this.colors.changePriority();
    }

    placePiece(color, kind, squareName) {
        let piece = new this.#piecesBox[kind](color, this.squares[squareName]);
        if (piece.isKing) {
            this.kings[color] = piece;
        }
    }

    removePiece(squareName) {
        this.squares[squareName].removePiece();
    }

    _enPassantMatter(fromSquare, toSquare, pawn) {
        // jump through one square
        if (toSquare.getBetweenSquaresCount(fromSquare) == 1) {
            let enPassantSquare = this.squares.getFromCoordinates(
                toSquare.coordinates.x,
                toSquare.coordinates.y - pawn.direction
            );
            for (let [state, dx] of [["right", 1], ["left", -1]]) {
                if (!toSquare.onEdge[state]) {
                    let x = toSquare.coordinates.x + dx;
                    let y = toSquare.coordinates.y;
                    let otherPiece = this.squares.getFromCoordinates(x, y).piece;
                    if (otherPiece && otherPiece.isPawn) {
                        otherPiece.setEnPassantSquare(enPassantSquare);
                    }
                }
            }
        }
        // catch other pawn en passant
        else if (pawn.squares.includes(ar.ATTACK, toSquare) && !toSquare.piece) {
            let x = toSquare.coordinates.x;
            let y = fromSquare.coordinates.y;
            this.removePiece(this.squares.getFromCoordinates(x, y).name.value);
        }
    }

    pawnTransformation(kind) {
        if (!this.transformation) return this._response("There isn't transformation.", false);

        this.placePiece(this.colors.current, kind, this.transformation.transformationSquare);
        this.removePiece(this.transformation.upToTransformationSquare);
        this.transformation = null;
        this.refreshState();
        return this._response("Successfully transformed!");
    }

    _replacePiece(fromSquare, toSquare, piece) {
        fromSquare.removePiece();
        piece.getPlace(toSquare);
    }

    _rookCastleMove(castleRoad) {
        let rookFromSquareName = castleRoad.rook.square.name.value;
        let rookToSquareName = castleRoad.rookToSquare.name.value;
        this.movePiece(rookFromSquareName, rookToSquareName, false);
    }

    setInitialPosition() {
        let firstRank = {[pieces.Piece.WHITE]: "1", [pieces.Piece.BLACK]: "8"};
        let secondRank = {[pieces.Piece.WHITE]: "2", [pieces.Piece.BLACK]: "7"};

        for (let color of [pieces.Piece.WHITE, pieces.Piece.BLACK]) {
            piecesData = [
                ["pawn", "abcdefgh", secondRank[color]],
                ["knight", "bg", firstRank[color]],
                ["bishop", "cf", firstRank[color]],
                ["rook", "ah", firstRank[color]],
                ["queen", "d", firstRank[color]],
                ["king", "e", firstRank[color]],
            ];
            for (let [name, signs, rank] of piecesData) {
                for (let sign of signs) {
                    this.placePiece(color, name, `${sign}${rank}`);
                }
            }
        }

        this.refreshAllSquares();

        return this._response("Successfully created!");
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

        if (refresh) this.refreshState();

        return this._response("Successfully moved!");
    }

    refreshAllSquares() {
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
}


module.exports = {
    Board: Board,
    BoardColors: BoardColors,
    BoardSquares: BoardSquares
};
