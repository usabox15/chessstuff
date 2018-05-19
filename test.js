var symbols = {
    "white": {
        "pawn": "&#9817;",
        "knight": "&#9816;",
        "bishop": "&#9815;",
        "rook": "&#9814;",
        "queen": "&#9813;",
        "king": "&#9812;",
    },
    "black": {
        "pawn": "&#9823;",
        "knight": "&#9822;",
        "bishop": "&#9821;",
        "rook": "&#9820;",
        "queen": "&#9819;",
        "king": "&#9818;",
    },
};

function markingSquares(pice, actionKind, aimed=false) {
    for (let sqr of pice.squares[actionKind]) {
        $(".square[x=" + sqr[0] + "][y=" + sqr[1] + "]").addClass((aimed ? "aim " : "") + actionKind + " marked");
    }
}

function markingAbilitySquares(pice, aimed=false) {
    for (let actionKind of ["move", "attack", "xray", "cover"]){
        markingSquares(pice, actionKind, aimed);
    }
}

function unMarkingSquares() {
    $(".square").removeClass("aim move attack xray cover control marked");
}

function createPice(color, kind) {
    let pice = $("<p>" + symbols[color][kind] + "</p>");
    pice.addClass("pice");
    return pice;
}

function refreshBoard(brd) {
    $(".square").empty();
    for (let square in brd.occupiedSquares) {
        let pice = brd.occupiedSquares[square];
        $(".square[x=" + square[0] + "][y=" + square[1] + "]")
        .append(createPice(pice.color, pice.kind));
    }
}



// // TEST ACTION SQUARES

// var board = new Board;

// board.placePice("black", "pawn", "g2");
// board.placePice("black", "knight", "e5");
// board.placePice("black", "bishop", "d7");
// board.placePice("black", "rook", "c4");
// board.placePice("black", "queen", "f6");
// board.placePice("black", "king", "b2");

// refreshBoard(board)

// $(".square")
// .mouseenter(function() {
//     let square = $(this).attr("x") + $(this).attr("y");
//     let pice = new Pice("white", "queen", board.getSquare(square));
//     pice.getSquares(board.occupiedSquares);
//     markingAbilitySquares(pice);
// })
// .mouseleave(function() {
//     unMarkingSquares();
// });



// // TEST PICES ACTION

// var board = new Board;

// board.placePice("black", "rook", "a8");
// board.placePice("black", "king", "c8");
// board.placePice("black", "rook", "h8");
// board.placePice("black", "pawn", "a7");
// board.placePice("black", "pawn", "b7");
// board.placePice("black", "pawn", "c7");
// board.placePice("black", "pawn", "h7");
// board.placePice("black", "knight", "e5");
// board.placePice("black", "queen", "f5");
// board.placePice("black", "bishop", "h3");
// board.placePice("black", "pawn", "g2");

// board.placePice("white", "bishop", "g5");
// board.placePice("white", "pawn", "d4");
// board.placePice("white", "pawn", "h4");
// board.placePice("white", "queen", "c3");
// board.placePice("white", "pawn", "a2");
// board.placePice("white", "pawn", "b2");
// board.placePice("white", "pawn", "c2");
// board.placePice("white", "knight", "e2");
// board.placePice("white", "king", "b1");
// board.placePice("white", "rook", "d1");
// board.placePice("white", "rook", "g1");

// board.refreshAllSquares();

// refreshBoard(board)

// $(".square")
// .mouseenter(function() {
//     let pice = board.occupiedSquares[$(this).attr("x") + $(this).attr("y")];
//     if (pice) {
//         markingAbilitySquares(pice);
//     }
// })
// .mouseleave(function() {
//     unMarkingSquares();
// });



// TEST GAME

var game = new Game;
var aimedSquare = null;

refreshBoard(game.board);

function removeAdditionalInfo() {
    for (let elem of ["#hider", "#choicesBox"]) {
        $(elem).remove();
    }
}

function hideBoard() {
    let position = $(".square[x=a][y=8]").position();
    let hider = $("<div></div>");
    hider.attr("id", "hider");
    hider.css("top", position.top);
    hider.css("left", position.left);
    $("body").append(hider);
}

function showTransformChoices(color) {
    hideBoard();
    let position = $(".square[x=a][y=8]").position();
    let choicesBox = $("<div></div>");
    choicesBox.addClass("row");
    choicesBox.attr("id", "choicesBox");
    choicesBox.css("top", position.top + 190);
    choicesBox.css("left", position.left + 106);
    for (let kind of ["queen", "rook", "bishop", "knight"]) {
        let choicesItem = $("<div></div>");
        choicesItem.addClass("square choicesItem");
        choicesItem.on("click", function(e) {
            e.stopPropagation();
            removeAdditionalInfo();
            response = game.transformation(kind);
            if (response.success) {
                refreshBoard(game.board);
            }
        })
        choicesItem.append(createPice(color, kind));
        choicesBox.append(choicesItem);
    }
    $("body").append(choicesBox);
}

$("body").on("click", "#hider", function(e) {
    removeAdditionalInfo();
})

$("body").on("click", ".choicesBox", function() {
    removeAdditionalInfo();
})

$(".square").on("click", function() {
    let newSquare = $(this).attr("x") + $(this).attr("y");
    if (aimedSquare) {
        if (aimedSquare != newSquare) {
            let response = game.move(aimedSquare, newSquare);
            // console.log(game.board.result);
            // console.log(response);
            if (response.success) {
                if (response.transformation) {
                    showTransformChoices(game.board.currentColor);
                }
                else {
                    refreshBoard(game.board);
                }
            }
        }
        unMarkingSquares();
        aimedSquare = null;
    }
    else {
        let pice = game.board.occupiedSquares[newSquare];
        if (pice && pice.color == game.board.currentColor) {
            $(this).addClass("aim marked");
            markingAbilitySquares(pice, true);
            aimedSquare = newSquare;
        }
    }
})

$(".square:not(.aim)")
.mouseenter(function() {
    if (!aimedSquare) {
        let pice = game.board.occupiedSquares[$(this).attr("x") + $(this).attr("y")];
        if (pice) {
            if (pice.color == game.board.currentColor) {
                markingAbilitySquares(pice);
            }
            else {
                markingSquares(pice, "control");
            }
        }
    }
})
.mouseleave(function() {
    if (!aimedSquare) {
        unMarkingSquares();
    }
});