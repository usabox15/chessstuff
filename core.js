var allKinds = [
    "pawn",
    "knight",
    "bishop",
    "rook",
    "queen",
    "king",
];


class Action {
    constructor(color, kind) {
        this.color = color;
        this.items = kind == "queen" ? ["rook", "bishop"] : [kind];
        this.squares = [];
    }

    nextSquareAction(occupiedSquares, nextSquare, isXray=false) {
        let strSquare = this.getSquare(nextSquare);
        if (isXray) {
            this.squares["xray"].push(strSquare);
            return true;
        }
        else if (occupiedSquares[strSquare]) {
            if (occupiedSquares[strSquare].color != this.color) {
                this.squares["attack"].push(strSquare);
            }
            return true;
        }
        this.squares["move"].push(strSquare);
        return false;
    }

    rook(occupiedSquares, square) {
        for (let j = 0; j <= 1; j++) {
            let k = Math.abs(j - 1);
            // up & right
            let isXray = false;
            for (let i = square[k] + 1; i <= 7; i++) {
                let s = []; s[k] = i; s[j] = square[j];
                isXray = this.nextSquareAction(occupiedSquares, s, isXray);
            }
            // down & left
            isXray = false;
            for (let i = square[k] - 1; i >= 0; i--) {
                let s = []; s[k] = i; s[j] = square[j];
                isXray = this.nextSquareAction(occupiedSquares, s, isXray);
            }
        }
    }

    bishop(occupiedSquares, square) {
        // downleft
        let [i, j] = [square[0] - 1, square[1] - 1];
        let isXray = false;
        while (i >= 0 && j >= 0) {
            isXray = this.nextSquareAction(occupiedSquares, [i, j], isXray);
            i--; j--;
        }
        // downright
        [i, j] = [square[0] + 1, square[1] - 1];
        isXray = false;
        while (i <= 7 && j >= 0) {
            isXray = this.nextSquareAction(occupiedSquares, [i, j], isXray);
            i++; j--;
        }
        // upleft
        [i, j] = [square[0] - 1, square[1] + 1];
        isXray = false;
        while (i >= 0 && j <= 7) {
            isXray = this.nextSquareAction(occupiedSquares, [i, j], isXray);
            i--; j++;
        }
        // upright
        [i, j] = [square[0] + 1, square[1] + 1];
        isXray = false;
        while (i <= 7 && j <= 7) {
            isXray = this.nextSquareAction(occupiedSquares, [i, j], isXray);
            i++; j++;
        }
    }

    knight(occupiedSquares, square) {
        let ofsets = [[-2, -1], [-1, -2], [1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1]];
        for (let ofset of ofsets) {
            let x = square[0] + ofset[0];
            let y = square[1] + ofset[1];
            if (x < 0 || x > 7 || y < 0 || y > 7) continue;

            this.nextSquareAction(occupiedSquares, [x, y]);
        }
    }

    king(occupiedSquares, square) {
        let ofsets = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
        for (let ofset of ofsets) {
            let x = square[0] + ofset[0];
            let y = square[1] + ofset[1];
            if (x < 0 || x > 7 || y < 0 || y > 7) continue;

            this.nextSquareAction(occupiedSquares, [x, y]);
        }
    }

    pawn(occupiedSquares, square) {
        let moveSquares = [];
        let attackSquares = [];
        if (this.color == "white") {
            moveSquares.push(this.getSquare([square[0], square[1] + 1]));
            if (square[1] == 1) {
                moveSquares.push(this.getSquare([square[0], square[1] + 2]));
            }
            if (square[0] - 1 >= 0) {
                attackSquares.push(this.getSquare([square[0] - 1, square[1] + 1]))
            }
            if (square[0] + 1 <= 7) {
                attackSquares.push(this.getSquare([square[0] + 1, square[1] + 1]))
            }
        }
        else {
            moveSquares.push(this.getSquare([square[0], square[1] - 1]));
            if (square[1] == 6) {
                moveSquares.push(this.getSquare([square[0], square[1] - 2]));
            }
            if (square[0] - 1 >= 0) {
                attackSquares.push(this.getSquare([square[0] - 1, square[1] - 1]))
            }
            if (square[0] + 1 <= 7) {
                attackSquares.push(this.getSquare([square[0] + 1, square[1] - 1]))
            }
        }

        for (let sqr of moveSquares) {
            if (occupiedSquares[sqr]) break;
            this.squares["move"].push(sqr);
        }

        for (let sqr of attackSquares) {
            if (occupiedSquares[sqr] && occupiedSquares[sqr].color != this.color) {
                this.squares["attack"].push(sqr);
            }
        }
    }

    getSquares(occupiedSquares, square) {
        this.squares = {"move": [], "attack": [], "xray": []};
        for (let item of this.items) {
            this[item](occupiedSquares, square);
        }
    }

    getSquare(numSquare) {
        let numberToSymbol= {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"};
        return numberToSymbol[numSquare[0]] + (numSquare[1] + 1);
    }
}


class Pice {
    constructor(color, kind, square) {
        this.color = color;
        this.kind = kind;
        this.square = square;
        this.action = new Action(color, kind);
    }

    getSquares(occupiedSquares) {
        this.action.getSquares(occupiedSquares, this.square)
    }
}


class Board {
    constructor() {
        this.occupiedSquares = {};
    }

    getSquare(strSquare) {
        let symbolToNumber = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7};
        return [symbolToNumber[strSquare[0]], +strSquare[1] - 1];
    }

    placePice(color, kind, strSquare) {
        this.occupiedSquares[strSquare] = new Pice(color, kind, this.getSquare(strSquare));
    }

    removePice(strSquare) {
        delete this.occupiedSquares[strSquare];
    }

    refreshSquares(strSquare) {
        this.occupiedSquares[strSquare].getSquares(this.occupiedSquares);
    }

    refreshAllSquares() {
        for (let pice of Object.values(this.occupiedSquares)) {
            pice.getSquares(this.occupiedSquares);
        }
    }
}
