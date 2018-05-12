var allKinds = [
    "pawn",
    "knight",
    "bishop",
    "rook",
    "queen",
    "king",
];

var allColors = ["white", "black"];


class Action {
    constructor(color, kind) {
        this.color = color;
        this.items = kind == "queen" ? ["rook", "bishop"] : [kind];
        this.getInitState();
    }

    refreshSquareFinder() {
        this.sqrBeforeXray = null;
        this.endOfALine = false;
    }

    getInitState() {
        this.squares = {"move": [], "attack": [], "xray": [], "cover": []};
        this.refreshSquareFinder();
    }

    nextSquareAction(occupiedSquares, square, nextSquare, linear=false) {
        let strSquare = this.getSquare(nextSquare);
        if (this.sqrBeforeXray) {
            this.squares["xray"].push(strSquare);
            if (occupiedSquares[strSquare]) {
                if (occupiedSquares[strSquare].color != this.color && occupiedSquares[strSquare].kind == "king" && this.squares["attack"].length > 0) {
                    occupiedSquares[this.sqrBeforeXray].binnersSquares.push(this.getSquare(square));
                }
                this.endOfALine = true;
            }
        }
        else if (occupiedSquares[strSquare]) {
            if (occupiedSquares[strSquare].color != this.color) {
                this.squares["attack"].push(strSquare);
                if (occupiedSquares[strSquare].kind == "king") {
                    occupiedSquares[strSquare].checkersSquares.push(this.getSquare(square));
                }
            }
            else {
                this.squares["cover"].push(strSquare);
            }
            if (linear) this.sqrBeforeXray = strSquare;
        }
        else {
            this.squares["move"].push(strSquare);
        }
    }

    rook(occupiedSquares, square) {
        for (let j = 0; j <= 1; j++) {
            let k = Math.abs(j - 1);
            // up & right
            this.refreshSquareFinder();
            for (let i = square[k] + 1; i <= 7; i++) {
                let s = []; s[k] = i; s[j] = square[j];
                this.nextSquareAction(occupiedSquares, square, s, true);
                if (this.endOfALine) break;
            }
            // down & left
            this.refreshSquareFinder();
            for (let i = square[k] - 1; i >= 0; i--) {
                let s = []; s[k] = i; s[j] = square[j];
                this.nextSquareAction(occupiedSquares, square, s, true);
                if (this.endOfALine) break;
            }
        }
    }

    bishop(occupiedSquares, square) {
        // downleft
        let [i, j] = [square[0] - 1, square[1] - 1];
        this.refreshSquareFinder();
        while (i >= 0 && j >= 0) {
            this.nextSquareAction(occupiedSquares, square, [i, j], true);
            if (this.endOfALine) break;
            i--; j--;
        }
        // downright
        [i, j] = [square[0] + 1, square[1] - 1];
        this.refreshSquareFinder();
        while (i <= 7 && j >= 0) {
            this.nextSquareAction(occupiedSquares, square, [i, j], true);
            if (this.endOfALine) break;
            i++; j--;
        }
        // upleft
        [i, j] = [square[0] - 1, square[1] + 1];
        this.refreshSquareFinder();
        while (i >= 0 && j <= 7) {
            this.nextSquareAction(occupiedSquares, square, [i, j], true);
            if (this.endOfALine) break;
            i--; j++;
        }
        // upright
        [i, j] = [square[0] + 1, square[1] + 1];
        this.refreshSquareFinder();
        while (i <= 7 && j <= 7) {
            this.nextSquareAction(occupiedSquares, square, [i, j], true);
            if (this.endOfALine) break;
            i++; j++;
        }
    }

    knight(occupiedSquares, square) {
        let ofsets = [[-2, -1], [-1, -2], [1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1]];
        for (let ofset of ofsets) {
            let x = square[0] + ofset[0];
            let y = square[1] + ofset[1];
            if (x < 0 || x > 7 || y < 0 || y > 7) continue;

            this.nextSquareAction(occupiedSquares, square, [x, y]);
        }
    }

    king(occupiedSquares, square) {
        let ofsets = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
        for (let ofset of ofsets) {
            let x = square[0] + ofset[0];
            let y = square[1] + ofset[1];
            if (x < 0 || x > 7 || y < 0 || y > 7) continue;

            this.nextSquareAction(occupiedSquares, square, [x, y]);
        }

        let thisKing = occupiedSquares[this.getSquare(square)]
        for (let [kingAction, conterAction] of [["move", "move"], ["attack", "cover"]]) {
            let wrongSquares = [];
            for (let sqr of this.squares[kingAction]) {
                let isWrongSquare = false;
                for (let p of Object.values(occupiedSquares)) {
                    if (p.color != thisKing.color && p.action.squares[conterAction].includes(sqr)) {
                        isWrongSquare = true;
                        wrongSquares.push(sqr);
                        break;
                    }
                }
                if (isWrongSquare) continue;
                for (let checkerSquare of thisKing.checkersSquares) {
                    let linedXray = false;
                    let checker = occupiedSquares[checkerSquare];
                    if (checker.action.squares["xray"].includes(sqr)) {
                        if (checker.kind == "queen") {
                            let [numCheckerSquare, numKingSquare] = (new Game).getNumCheckerAndKingSquares(checkerSquare, this.getSquare(square));
                            let dif = (new Game).getLinedCheckerDirection(numCheckerSquare, numKingSquare);
                            let extLineSqr = [numKingSquare[0] - dif[0], numKingSquare[1] - dif[1]];
                            if (!(extLineSqr[0] < 0 || extLineSqr[0] > 7 || extLineSqr[1] < 0 || extLineSqr[1] > 7) && (new Action).getSquare(extLineSqr) == escapeSquare) {
                                linedXray = true;
                            }
                        }
                        else {
                            linedXray = true;
                        }
                    }
                    if (linedXray) {
                        wrongSquares.push(sqr);
                        break;
                    }
                }
            }
            for (let wsqr of wrongSquares) {
                this.squares[kingAction].splice(this.squares[kingAction].indexOf(wsqr), 1);
            }
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
                if (occupiedSquares[sqr].kind == "king") {
                    occupiedSquares[sqr].checkersSquares.push(this.getSquare(square));
                }
            }
        }
    }

    getSquares(occupiedSquares, square) {
        this.getInitState();
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
        this.getInitState();
    }

    getInitState() {
        this[this.kind == "king" ? "checkersSquares" : "binnersSquares"] = [];
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

    replacePice(from, to) {
        let pice = this.occupiedSquares[from];
        this.removePice(from);
        this.occupiedSquares[to] = pice;
        pice.square = this.getSquare(to);
        this.refreshAllSquares();
    }

    refreshSquares(strSquare) {
        this.occupiedSquares[strSquare].getSquares(this.occupiedSquares);
    }

    refreshAllSquares() {
        for (let pice of Object.values(this.occupiedSquares)) {
            pice.getInitState();
        }
        for (let pice of Object.values(this.occupiedSquares)) {
            pice.getSquares(this.occupiedSquares);
        }
    }
}


class Game {
    constructor() {
        this.board = new Board;
        this.getInitialPosition();
        this.priority = 0;
        this.castleRights = {
            "white": {"short": true, "long": true},
            "black": {"short": true, "long": true},
        }
        this.kingsPlaces = {"white": "e1", "black": "e8"}
    }

    get turnOf() {
        return allColors[this.priority];
    }

    changePriority() {
        this.priority = Math.abs(this.priority - 1);
    }

    getInitialPosition() {
        for (let sqr of ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"]) {
            this.board.placePice("black", "pawn", sqr);
        }
        for (let sqr of ["b8", "g8"]) {
            this.board.placePice("black", "knight", sqr);
        }
        for (let sqr of ["c8", "f8"]) {
            this.board.placePice("black", "bishop", sqr);
        }
        for (let sqr of ["a8", "h8"]) {
            this.board.placePice("black", "rook", sqr);
        }
        this.board.placePice("black", "queen", "d8");
        this.board.placePice("black", "king", "e8");

        for (let sqr of ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]) {
            this.board.placePice("white", "pawn", sqr);
        }
        for (let sqr of ["b1", "g1"]) {
            this.board.placePice("white", "knight", sqr);
        }
        for (let sqr of ["c1", "f1"]) {
            this.board.placePice("white", "bishop", sqr);
        }
        for (let sqr of ["a1", "h1"]) {
            this.board.placePice("white", "rook", sqr);
        }
        this.board.placePice("white", "queen", "d1");
        this.board.placePice("white", "king", "e1");
        this.board.refreshAllSquares();
    }

    getCastleKind(pice, from, to) {
        if (pice.kind != "king") return null;
        let r = this.turnOf == "white" ? "1" : "8";
        if (from == "e" + r) {
            if (to == "c" + r && this.freeCastleRoad(["b" + r, "c" + r, "d" + r]) && this.safeCastleRoad(["c" + r, "d" + r])) {
                return "long";
            }
            if (to == "g" + r && this.freeCastleRoad(["f" + r, "g" + r]) && this.safeCastleRoad(["f" + r, "g" + r])) {
                return "short";
            }
        }
        return null;
    }

    freeCastleRoad(squares) {
        for (let sqr of squares) {
            if (this.board.occupiedSquares[sqr]) return false;
        }
        return true;
    }

    safeCastleRoad(squares) {
        for (let pice of Object.values(this.board.occupiedSquares)) {
            for (let sqr of squares) {
                if (pice.color != this.turnOf && pice.action.squares["move"].includes(sqr)) return false;
            }
        }
        return true;
    }

    castleReplacePice(kind, kingFrom, kingTo) {
        let rank = this.turnOf == "white" ? "1" : "8";
        if (kind == "long") {
            var rookFrom = "a" + rank;
            var rookTo = "d" + rank;
        }
        else {
            var rookFrom = "h" + rank;
            var rookTo = "f" + rank;
        }
        this.board.replacePice(kingFrom, kingTo);
        this.board.replacePice(rookFrom, rookTo);
    }

    getNumCheckerAndKingSquares(checkerSquare, kingSquare) {
        let getNumSquare = (new Board).getSquare;
        return [getNumSquare(checkerSquare), getNumSquare(kingSquare)];
    }

    getLinedCheckerDirection(numCheckerSquare, numKingSquare) {
        let dif = [0, 0];
        for (let i in dif) {
            if (numKingSquare[i] > numCheckerSquare[i]) {
                dif[i] = -1;
            }
            else if (numKingSquare[i] < numCheckerSquare[i]) {
                dif[i] = 1;
            }
        }
        return dif;
    }

    linedXray(escapeSquare, checkerSquare, kingSquare) {
        let checker = this.board.occupiedSquares[checkerSquare];
        if (checker.action.squares["xray"].includes(escapeSquare)) {
            if (checker.kind == "queen") {
                let [numCheckerSquare, numKingSquare] = this.getNumCheckerAndKingSquares(checkerSquare, kingSquare);
                let dif = this.getLinedCheckerDirection(numCheckerSquare, numKingSquare);
                let extLineSqr = [numKingSquare[0] - dif[0], numKingSquare[1] - dif[1]];
                if (extLineSqr[0] < 0 || extLineSqr[0] > 7 || extLineSqr[1] < 0 || extLineSqr[1] > 7) {
                    return false;
                }
                let getStrSquare = (new Action).getSquare;
                if (getStrSquare(extLineSqr) == escapeSquare) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        return false;
    }

    checkMate() {
        let oppColor = this.turnOf == "white" ? "black" : "white";
        let oppKing = this.board.occupiedSquares[this.kingsPlaces[oppColor]];
        if (oppKing.checkersSquares.length != 0) {
            let escapeSquares = oppKing.action.squares["move"].concat(oppKing.action.squares["attack"]);
            let notEscapeSquares = [];
            for (let sqr of escapeSquares) {
                for (let p of Object.values(this.board.occupiedSquares)) {
                    if (p.color == this.turnOf && (p.action.squares["move"].includes(sqr) || p.action.squares["cover"].includes(sqr))) {
                        notEscapeSquares.push(sqr);
                        break;
                    }
                }
                if (!notEscapeSquares.includes(sqr)) {
                    for (let checkerSquare of oppKing.checkersSquares) {
                        if (this.linedXray(sqr, checkerSquare, this.kingsPlaces[oppColor])) {
                            notEscapeSquares.push(sqr);
                            break;
                        }
                    }
                }
            }
            for (let sqr of notEscapeSquares) {
                escapeSquares.splice(escapeSquares.indexOf(sqr), 1);
            }
            if (escapeSquares.length != 0) {
                return false;
            }

            if (oppKing.checkersSquares.length == 1) {
                let sqr = oppKing.checkersSquares[0];

                let checker = this.board.occupiedSquares[sqr];
                let betweenSquares = [];
                if (["queen", "rook", "bishop"].includes(checker.kind)) {
                    let [numCheckerSquare, numKingSquare] = this.getNumCheckerAndKingSquares(sqr, this.kingsPlaces[oppColor]);
                    let dif = this.getLinedCheckerDirection(numCheckerSquare, numKingSquare);
                    let distance = Math.max(Math.abs(numKingSquare[0] - numCheckerSquare[0]), Math.abs(numKingSquare[1] - numCheckerSquare[1]));
                    if (distance > 1) {
                        let getStrSquare = (new Action).getSquare;
                        for (let i = 1; i < distance; i++) {
                            betweenSquares.push(getStrSquare([numKingSquare[0] + i * dif[0], numKingSquare[1] + i * dif[1]]));
                        }
                    }
                }

                for (let p of Object.values(this.board.occupiedSquares)) {
                    if (p.color != this.turnOf && p.kind != "king" && p.binnersSquares.length == 0) {
                        if (p.action.squares["attack"].includes(sqr)) {
                            return false;
                        }
                        for (let bsqr of betweenSquares) {
                            if (p.action.squares["move"].includes(bsqr)) {
                                return false;
                            }
                        }
                    }
                }
            }

            return true;
        }

        return false;
    }

    move(from, to) {
        let pice = this.board.occupiedSquares[from];
        if (!pice || pice.color != this.turnOf) {
            return false;
        }

        let castleKind = this.getCastleKind(pice, from, to);
        if (castleKind && this.castleRights[this.turnOf][castleKind]) {
            this.castleReplacePice(castleKind, from, to);
            this.changePriority();
            return true;
        }

        if (!pice.action.squares["move"].includes(to) && !pice.action.squares["attack"].includes(to)) {
            return false;
        }

        let occupiedSquaresClone = Object.assign({}, this.board.occupiedSquares);
        this.board.replacePice(from, to);
        let kingPlace = pice.kind == "king" ? to : this.kingsPlaces[this.turnOf];
        if (this.board.occupiedSquares[kingPlace].checkersSquares.length > 0) {
            this.board.occupiedSquares = occupiedSquaresClone;
            return false;
        }

        if (pice.kind == "king") {
            this.kingsPlaces[this.turnOf] = to;
        }

        let isMate = this.checkMate();

        this.changePriority();
        return true;
    }
}
