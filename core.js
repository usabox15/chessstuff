var allKinds = ["pawn", "knight", "bishop", "rook", "queen", "king"];
var allColors = ["white", "black"];
var symbolToNumber = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7};
var numberToSymbol= {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"};


function strToNum(square) {
    return [symbolToNumber[square[0]], +square[1] - 1];
}


function numToStr(square) {
    return numberToSymbol[square[0]] + (square[1] + 1);
}


function getLinedCheckerDirection(numCheckerSquare, numKingSquare) {
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


function getBetweenSquares(numSquare1, numSquare2, include=false) {
    let dx = Math.abs(numSquare2[0] - numSquare1[0]);
    let dy = Math.abs(numSquare2[1] - numSquare1[1]);
    if (dx != dy && dx != 0 && dy != 0) {
        return [];
    }
    let betweenSquares = [];
    let dif = getLinedCheckerDirection(numSquare1, numSquare2);
    let distance = Math.max(dx, dy);
    let start = include ? 0 : 1;
    let end = distance - start;
    for (let i = start; i <= end; i++) {
        betweenSquares.push(numToStr([numSquare2[0] + i * dif[0], numSquare2[1] + i * dif[1]]));
    }
    return betweenSquares;
}


class Pice {
    constructor(color, kind, square) {
        this.color = color;
        this.kind = kind;
        this.getPlace(square);
        this.getInitSquares();
        this.getInitState();
    }

    get stuck() {
        return this.squares["move"].length == 0 && this.squares["attack"].length == 0;
    }

    refreshSquareFinder() {
        this.sqrBeforeXray = null;
        this.endOfALine = false;
    }

    getInitSquares() {
        this.squares = {"move": [], "attack": [], "xray": [], "cover": [], "control": []};
        this.refreshSquareFinder();
    }

    getInitState() {
        if (this.kind == "king") {
            this.checkersSquares = [];
        }
        else {
            this.binderSquare = null;
        }
    }

    getPlace(square) {
        this.strSquare = square;
        this.numSquare = strToNum(square);
    }

    getSquares(occupiedSquares) {
        this.getInitSquares();
        this[this.kind + "Squares"](occupiedSquares);
    }

    nextSquareAction(occupiedSquares, square, nextSquare, linear=false) {
        let strSquare = numToStr(nextSquare);
        if (this.sqrBeforeXray) {
            this.squares["xray"].push(strSquare);
            if (occupiedSquares[strSquare]) {
                if (occupiedSquares[strSquare].color != this.color && occupiedSquares[strSquare].kind == "king" && occupiedSquares[this.sqrBeforeXray].color != this.color) {
                    occupiedSquares[this.sqrBeforeXray].binderSquare = square;
                }
                this.endOfALine = true;
            }
        }
        else if (occupiedSquares[strSquare]) {
            if (occupiedSquares[strSquare].color != this.color) {
                this.squares["attack"].push(strSquare);
                if (occupiedSquares[strSquare].kind == "king") {
                    occupiedSquares[strSquare].checkersSquares.push(numToStr(square));
                }
            }
            else {
                this.squares["cover"].push(strSquare);
            }
            this.squares["control"].push(strSquare);
            if (linear) this.sqrBeforeXray = strSquare;
        }
        else {
            this.squares["move"].push(strSquare);
            this.squares["control"].push(strSquare);
        }
    }

    getTotalImmobilize() {
        for (let actonKind of ["move", "attack", "cover", "xray"]) {
            this.squares[actonKind] = [];
        }
    }

    getBind(occupiedSquares, kingSquare) {
        if (this.kind == "knight") {
            this.getTotalImmobilize();
        }
        else {
            this.squares["xray"] = [];
            let betweenSquares = getBetweenSquares(this.binderSquare, strToNum(kingSquare), true);
            for (let actonKind of ["move", "attack", "cover"]) {
                let wrongSquares = [];
                for (let sqr of this.squares[actonKind]) {
                    if (!betweenSquares.includes(sqr)) {
                        wrongSquares.push(sqr);
                    }
                }
                for (let wsqr of wrongSquares) {
                    this.squares[actonKind].splice(this.squares[actonKind].indexOf(wsqr), 1);
                }
            }
        }
    }

    getCheck(checker, betweenSquares) {
        for (let actonKind of ["cover", "xray"]) {
            this.squares[actonKind] = [];
        }
        if (this.squares["attack"].includes(checker.strSquare)) {
            this.squares["attack"] = [checker.strSquare];
        }
        else {
            this.squares["attack"] = [];
        }
        let wrongMoves = [];
        for (let sqr of this.squares["move"]) {
            if (!betweenSquares.includes(sqr)) {
                wrongMoves.push(sqr);
            }
        }
        for (let sqr of wrongMoves) {
            this.squares["move"].splice(this.squares["move"].indexOf(sqr), 1);
        }
    }
}


class Pawn extends Pice {
    constructor(color, square) {
        super(color, "pawn", square);
    }

    pawnSquares(occupiedSquares) {
        let moveSquares = [];
        let attackSquares = [];
        if (this.color == "white") {
            moveSquares.push(numToStr([this.numSquare[0], this.numSquare[1] + 1]));
            if (this.numSquare[1] == 1) {
                moveSquares.push(numToStr([this.numSquare[0], this.numSquare[1] + 2]));
            }
            if (this.numSquare[0] - 1 >= 0) {
                attackSquares.push(numToStr([this.numSquare[0] - 1, this.numSquare[1] + 1]))
            }
            if (this.numSquare[0] + 1 <= 7) {
                attackSquares.push(numToStr([this.numSquare[0] + 1, this.numSquare[1] + 1]))
            }
        }
        else {
            moveSquares.push(numToStr([this.numSquare[0], this.numSquare[1] - 1]));
            if (this.numSquare[1] == 6) {
                moveSquares.push(numToStr([this.numSquare[0], this.numSquare[1] - 2]));
            }
            if (this.numSquare[0] - 1 >= 0) {
                attackSquares.push(numToStr([this.numSquare[0] - 1, this.numSquare[1] - 1]))
            }
            if (this.numSquare[0] + 1 <= 7) {
                attackSquares.push(numToStr([this.numSquare[0] + 1, this.numSquare[1] - 1]))
            }
        }

        for (let sqr of moveSquares) {
            if (occupiedSquares[sqr]) break;
            this.squares["move"].push(sqr);
        }

        for (let sqr of attackSquares) {
            this.squares["control"].push(sqr);
            if (occupiedSquares[sqr]) {
                if (occupiedSquares[sqr].color == this.color) {
                    this.squares["cover"].push(sqr);
                }
                else {
                    this.squares["attack"].push(sqr);
                    if (occupiedSquares[sqr].kind == "king") {
                        occupiedSquares[sqr].checkersSquares.push(this.strSquare);
                    }
                }
            }
        }
    }
}


class Knight extends Pice {
    constructor(color, square) {
        super(color, "knight", square);
    }

    knightSquares(occupiedSquares) {
        let ofsets = [[-2, -1], [-1, -2], [1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1]];
        for (let ofset of ofsets) {
            let x = this.numSquare[0] + ofset[0];
            let y = this.numSquare[1] + ofset[1];
            if (x < 0 || x > 7 || y < 0 || y > 7) continue;

            this.nextSquareAction(occupiedSquares, this.numSquare, [x, y]);
        }
    }
}


class Bishop extends Pice {
    constructor(color, square) {
        super(color, "bishop", square);
    }

    bishopSquares(occupiedSquares) {
        // downleft
        let [i, j] = [this.numSquare[0] - 1, this.numSquare[1] - 1];
        this.refreshSquareFinder();
        while (i >= 0 && j >= 0) {
            this.nextSquareAction(occupiedSquares, this.numSquare, [i, j], true);
            if (this.endOfALine) break;
            i--; j--;
        }
        // downright
        [i, j] = [this.numSquare[0] + 1, this.numSquare[1] - 1];
        this.refreshSquareFinder();
        while (i <= 7 && j >= 0) {
            this.nextSquareAction(occupiedSquares, this.numSquare, [i, j], true);
            if (this.endOfALine) break;
            i++; j--;
        }
        // upleft
        [i, j] = [this.numSquare[0] - 1, this.numSquare[1] + 1];
        this.refreshSquareFinder();
        while (i >= 0 && j <= 7) {
            this.nextSquareAction(occupiedSquares, this.numSquare, [i, j], true);
            if (this.endOfALine) break;
            i--; j++;
        }
        // upright
        [i, j] = [this.numSquare[0] + 1, this.numSquare[1] + 1];
        this.refreshSquareFinder();
        while (i <= 7 && j <= 7) {
            this.nextSquareAction(occupiedSquares, this.numSquare, [i, j], true);
            if (this.endOfALine) break;
            i++; j++;
        }
    }
}


class Rook extends Pice {
    constructor(color, square) {
        super(color, "rook", square);
    }

    rookSquares(occupiedSquares) {
        for (let j = 0; j <= 1; j++) {
            let k = Math.abs(j - 1);
            // up & right
            this.refreshSquareFinder();
            for (let i = this.numSquare[k] + 1; i <= 7; i++) {
                let s = []; s[k] = i; s[j] = this.numSquare[j];
                this.nextSquareAction(occupiedSquares, this.numSquare, s, true);
                if (this.endOfALine) break;
            }
            // down & left
            this.refreshSquareFinder();
            for (let i = this.numSquare[k] - 1; i >= 0; i--) {
                let s = []; s[k] = i; s[j] = this.numSquare[j];
                this.nextSquareAction(occupiedSquares, this.numSquare, s, true);
                if (this.endOfALine) break;
            }
        }
    }
}


class Queen extends Pice {
    constructor(color, square) {
        super(color, "queen", square);
    }

    queenSquares(occupiedSquares) {
        this.rookSquares(occupiedSquares);
        this.bishopSquares(occupiedSquares);
    }
}
Object.defineProperty(Queen.prototype, "rookSquares", Object.getOwnPropertyDescriptor(Rook.prototype, "rookSquares"));
Object.defineProperty(Queen.prototype, "bishopSquares", Object.getOwnPropertyDescriptor(Bishop.prototype, "bishopSquares"));


class King extends Pice {
    constructor(color, square) {
        super(color, "king", square);
    }

    kingSquares(occupiedSquares) {
        let ofsets = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
        for (let ofset of ofsets) {
            let x = this.numSquare[0] + ofset[0];
            let y = this.numSquare[1] + ofset[1];
            if (x < 0 || x > 7 || y < 0 || y > 7) continue;

            this.nextSquareAction(occupiedSquares, this.numSquare, [x, y]);
        }

        for (let kingAction of ["move", "attack"]) {
            let wrongSquares = [];
            for (let sqr of this.squares[kingAction]) {
                let isWrongSquare = false;
                for (let p of Object.values(occupiedSquares)) {
                    if (p.color != this.color && p.squares["control"].includes(sqr)) {
                        isWrongSquare = true;
                        wrongSquares.push(sqr);
                        break;
                    }
                }
                if (isWrongSquare) continue;
                for (let checkerSquare of this.checkersSquares) {
                    let linedXray = false;
                    let checker = occupiedSquares[checkerSquare];
                    if (checker.squares["xray"].includes(sqr)) {
                        if (checker.kind == "queen") {
                            let dif = getLinedCheckerDirection(checker.numSquare, this.numSquare);
                            let extLineSqr = [this.numSquare[0] - dif[0], this.numSquare[1] - dif[1]];
                            if (!(extLineSqr[0] < 0 || extLineSqr[0] > 7 || extLineSqr[1] < 0 || extLineSqr[1] > 7) && numToStr(extLineSqr) == escapeSquare) {
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
}


class Board {
    constructor() {
        this.occupiedSquares = {};
        this.priority = [0, 1];
        this.result = null;
        this.kingsPlaces = {"white": "e1", "black": "e8"};
        this.picesBox = {
            "pawn": Pawn,
            "knight": Knight,
            "bishop": Bishop,
            "rook": Rook,
            "queen": Queen,
            "king": King,
        }
    }

    get allPices() {
        return Object.values(this.occupiedSquares);
    }

    get currentColor() {
        return allColors[this.priority[0]];
    }

    get opponentColor() {
        return allColors[this.priority[1]];
    }

    changePriority() {
        this.priority = [this.priority[1], this.priority[0]]
    }

    placePice(color, kind, strSquare) {
        this.occupiedSquares[strSquare] = new this.picesBox[kind](color, strSquare);
    }

    removePice(strSquare) {
        delete this.occupiedSquares[strSquare];
    }

    replacePice(from, to) {
        let pice = this.occupiedSquares[from];
        this.removePice(from);
        this.occupiedSquares[to] = pice;
        pice.getPlace(to);
        if (pice.kind == "king") this.kingsPlaces[pice.color] = to;
        this.refreshAllSquares();
    }

    refreshAllSquares() {
        for (let pice of this.allPices) {
            pice.getInitState();
        }
        for (let pice of this.allPices.filter(p => p.kind != "king")) {
            pice.getSquares(this.occupiedSquares);
        }
        for (let pice of this.allPices.filter(p => p.kind == "king")) {
            pice.getSquares(this.occupiedSquares);
        }
        for (let pice of this.allPices.filter(p => p.binderSquare)) {
            pice.getBind(this.occupiedSquares, this.kingsPlaces[pice.color]);
        }
        let oppKing = this.occupiedSquares[this.kingsPlaces[this.opponentColor]];
        let noMoves = false;
        if (oppKing.checkersSquares.length == 1) {
            let betweenSquares = [];
            noMoves = true;
            let checker = this.occupiedSquares[oppKing.checkersSquares[0]];
            if (["queen", "rook", "bishop"].includes(checker.kind)) {
                betweenSquares = getBetweenSquares(checker.numSquare, oppKing.numSquare);
            }
            for (let pice of this.allPices.filter(p => p.color == this.opponentColor && p.kind != "king")) {
                pice.getCheck(checker, betweenSquares);
                if (!pice.stuck) noMoves = false;
            }
        }
        else if (oppKing.checkersSquares.length == 2) {
            noMoves = true;
            for (let pice of this.allPices.filter(p => p.color == this.opponentColor && p.kind != "king")) {
                pice.getTotalImmobilize();
            }
        }
        if (noMoves && oppKing.stuck) {
            this.result = [this.priority[1], this.priority[0]];
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
        };
        this.kingsPlaces = {"white": "e1", "black": "e8"};
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
                if (pice.color != this.turnOf && pice.squares["move"].includes(sqr)) return false;
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

    move(from, to) {
        let pice = this.board.occupiedSquares[from];
        if (!pice || pice.color != this.turnOf) {
            return false;
        }

        let castleKind = this.getCastleKind(pice, from, to);
        if (castleKind && this.castleRights[this.turnOf][castleKind]) {
            this.castleReplacePice(castleKind, from, to);
            this.kingsPlaces[this.turnOf] = to;
            this.changePriority();
            this.board.changePriority();
            return true;
        }

        if (!pice.squares["move"].includes(to) && !pice.squares["attack"].includes(to)) {
            return false;
        }

        this.board.replacePice(from, to);

        if (pice.kind == "king") {
            this.kingsPlaces[this.turnOf] = to;
        }

        console.log("result", this.board.result);

        this.changePriority();
        this.board.changePriority();
        return true;
    }
}
