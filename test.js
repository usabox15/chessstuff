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

function markingSquares(piece, actionKind, aimed=false) {
    let squares = piece.squares[actionKind] || [];
    let aimClassName = (aimed ? "aim " : "");
    for (let sqr of squares) {
        $(`.square[x=${sqr.name.symbol}][y=${sqr.name.number}]`)
        .addClass(`${aimClassName}${actionKind} marked`);
    }
}

function markingAbilitySquares(piece, aimed=false) {
    for (let actionKind of ["move", "attack", "xray", "cover"]){
        markingSquares(piece, actionKind, aimed);
    }
}

function unMarkingSquares() {
    $(".square").removeClass("aim move attack xray cover control marked");
}

function createPiece(color, kind) {
    let piece = $("<p>" + symbols[color][kind] + "</p>");
    piece.addClass("piece");
    return piece;
}

function refreshBoard(brd) {
    $(".square").empty();
    for (let piece of brd.allPieces) {
        $(`.square[x=${piece.square.name.symbol}][y=${piece.square.name.number}]`)
        .append(createPiece(piece.color, piece.kind));
    }
}



// // TEST ACTION SQUARES

// var board = new Board;

// board.placePiece("black", "pawn", "g2");
// board.placePiece("black", "knight", "e5");
// board.placePiece("black", "bishop", "d7");
// board.placePiece("black", "rook", "c4");
// board.placePiece("black", "queen", "f6");
// board.placePiece("black", "king", "b2");

// refreshBoard(board)

// $(".square")
// .mouseenter(function() {
//     let square = $(this).attr("x") + $(this).attr("y");
//     let piece = new Piece("white", "queen", board.getSquare(square));
//     piece.getSquares(board.occupiedSquares);
//     markingAbilitySquares(piece);
// })
// .mouseleave(function() {
//     unMarkingSquares();
// });



// // TEST PIeCES ACTION

// var board = new Board;

// board.placePiece("black", "rook", "a8");
// board.placePiece("black", "king", "c8");
// board.placePiece("black", "rook", "h8");
// board.placePiece("black", "pawn", "a7");
// board.placePiece("black", "pawn", "b7");
// board.placePiece("black", "pawn", "c7");
// board.placePiece("black", "pawn", "h7");
// board.placePiece("black", "knight", "e5");
// board.placePiece("black", "queen", "f5");
// board.placePiece("black", "bishop", "h3");
// board.placePiece("black", "pawn", "g2");

// board.placePiece("white", "bishop", "g5");
// board.placePiece("white", "pawn", "d4");
// board.placePiece("white", "pawn", "h4");
// board.placePiece("white", "queen", "c3");
// board.placePiece("white", "pawn", "a2");
// board.placePiece("white", "pawn", "b2");
// board.placePiece("white", "pawn", "c2");
// board.placePiece("white", "knight", "e2");
// board.placePiece("white", "king", "b1");
// board.placePiece("white", "rook", "d1");
// board.placePiece("white", "rook", "g1");

// board.refreshAllSquares();

// refreshBoard(board)

// $(".square")
// .mouseenter(function() {
//     let piece = board.occupiedSquares[$(this).attr("x") + $(this).attr("y")];
//     if (piece) {
//         markingAbilitySquares(piece);
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
        choicesItem.append(createPiece(color, kind));
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
            if (response.success) {
                if (response.transformation) {
                    showTransformChoices(game.board.colors.current);
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
        let piece = game.board.squares[newSquare].piece;
        if (piece && piece.hasColor(game.board.colors.current)) {
            $(this).addClass("aim marked");
            markingAbilitySquares(piece, true);
            aimedSquare = newSquare;
        }
    }
})

$(".square:not(.aim)")
.mouseenter(function() {
    if (!aimedSquare) {
        let piece = game.board.squares[$(this).attr("x") + $(this).attr("y")].piece;
        if (piece) {
            if (piece.hasColor(game.board.colors.current)) {
                markingAbilitySquares(piece);
            }
            else {
                markingSquares(piece, "control");
            }
        }
    }
})
.mouseleave(function() {
    if (!aimedSquare) {
        unMarkingSquares();
    }
});
