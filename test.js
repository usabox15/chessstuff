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

var board = new Board;

board.placePice("black", "pawn", "g2");
board.placePice("black", "knight", "e5");
board.placePice("black", "bishop", "d7");
board.placePice("black", "rook", "c4");
board.placePice("black", "queen", "f6");
board.placePice("black", "king", "b2");

board.refreshAllSquares();


for (let square in board.occupiedSquares) {
    let pice = board.occupiedSquares[square];
    $(".square[x=" + square[0] + "][y=" + square[1] + "]")
    .append("<p style='font-size: 40; margin: 0;'>" + symbols[pice.color][pice.kind] + "</p>");
}


$(".square")
.mouseenter(function() {
    let square = $(this).attr("x") + $(this).attr("y");
    let pice = board.occupiedSquares[square];

    if (pice) {
        for (let actionKind of ["move", "attack"]){
            for (let sqr of pice.squares[actionKind]) {
                $(".square[x=" + sqr[0] + "][y=" + sqr[1] + "]").addClass(actionKind + " marked");
            }
        }
    }
})
.mouseleave(function() {
    $(".square").removeClass("attack move marked");
});




// // Test action squares

// var board = new Board;

// $(".square")
// .mouseenter(function() {
//     let square = $(this).attr("x") + $(this).attr("y");
//     let pice = new Pice("black", "pawn", board.getSquare(square));
//     pice.getSquares(board.occupiedSquares);

//     for (let actionKind of ["move", "attack"]){
//         for (let sqr of pice.squares[actionKind]) {
//             $(".square[x=" + sqr[0] + "][y=" + sqr[1] + "]").addClass(actionKind + " marked");
//         }
//     }
// })
// .mouseleave(function() {
//     $(".square").removeClass("attack move marked");
// });