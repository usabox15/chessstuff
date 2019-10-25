var board = require('./board');


class Game {
    constructor() {
        this.board = new board.Board;
        this.getInitialPosition();
    }

    getInitialPosition() {
        for (let sqr of ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"]) {
            this.board.placePiece("black", "pawn", sqr);
        }
        for (let sqr of ["b8", "g8"]) {
            this.board.placePiece("black", "knight", sqr);
        }
        for (let sqr of ["c8", "f8"]) {
            this.board.placePiece("black", "bishop", sqr);
        }
        for (let sqr of ["a8", "h8"]) {
            this.board.placePiece("black", "rook", sqr);
        }
        this.board.placePiece("black", "queen", "d8");
        this.board.placePiece("black", "king", "e8");

        for (let sqr of ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]) {
            this.board.placePiece("white", "pawn", sqr);
        }
        for (let sqr of ["b1", "g1"]) {
            this.board.placePiece("white", "knight", sqr);
        }
        for (let sqr of ["c1", "f1"]) {
            this.board.placePiece("white", "bishop", sqr);
        }
        for (let sqr of ["a1", "h1"]) {
            this.board.placePiece("white", "rook", sqr);
        }
        this.board.placePiece("white", "queen", "d1");
        this.board.placePiece("white", "king", "e1");
        this.board.refreshAllSquares();
    }

    move(from, to) {
        return this.board.movePiece(from, to);
    }

    transformation(kind) {
        return this.board.pawnTransformation(kind);
    }
}


module.exports = Game;
