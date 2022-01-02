const AIM = 'aim';
const MARKED = 'marked';

const SYMBOLS = {
    [chessstuff.Piece.WHITE]: {
        [chessstuff.Piece.PAWN]: '&#9817;',
        [chessstuff.Piece.KNIGHT]: '&#9816;',
        [chessstuff.Piece.BISHOP]: '&#9815;',
        [chessstuff.Piece.ROOK]: '&#9814;',
        [chessstuff.Piece.QUEEN]: '&#9813;',
        [chessstuff.Piece.KING]: '&#9812;',
    },
    [chessstuff.Piece.BLACK]: {
        [chessstuff.Piece.PAWN]: '&#9823;',
        [chessstuff.Piece.KNIGHT]: '&#9822;',
        [chessstuff.Piece.BISHOP]: '&#9821;',
        [chessstuff.Piece.ROOK]: '&#9820;',
        [chessstuff.Piece.QUEEN]: '&#9819;',
        [chessstuff.Piece.KING]: '&#9818;',
    },
};


var globalActions = Object.fromEntries(
  chessstuff.Relation.ALL_KINDS.map(k => [k, true])
);
var board = null;
var aimedSquare = null;


function markingSquares(piece, action, aimed=false) {
    if (!globalActions[action] || !piece.squares[action]) return;

    let classes = [action, MARKED];
    if (aimed) {
      classes.push(AIM);
    }

    for (let sqr of piece.squares[action]) {
        $(`.square[x=${sqr.name.symbol}][y=${sqr.name.number}]`)
        .addClass(classes);
    }
}

function markingAbilitySquares(piece, aimed=false) {
    for (let action of chessstuff.Relation.ALL_KINDS){
        markingSquares(piece, action, aimed);
    }
}

function unMarkingSquares() {
    $(".square").removeClass([AIM, MARKED, ...chessstuff.Relation.ALL_KINDS]);
}

function createPiece(color, kind) {
    let piece = $("<p>" + SYMBOLS[color][kind] + "</p>");
    piece.addClass("piece");
    return piece;
}

function refreshBoard(brd) {
    $(".square").empty();
    for (let piece of brd.squares.allPieces) {
        $(`.square[x=${piece.square.name.symbol}][y=${piece.square.name.number}]`)
        .append(createPiece(piece.color, piece.kind));
    }
}


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
            response = board.pawnTransformation(kind);
            if (response.success) {
                refreshBoard(board);
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


function selectPiece(squareElem, squareName) {
  let piece = board.squares[squareName].piece;
  if (piece && piece.hasColor(board.colors.current)) {
    $(squareElem).addClass([AIM, MARKED]);
    markingAbilitySquares(piece, true);
    aimedSquare = squareName;
  } else {
    aimedSquare = null;
  }
}


function movePiece(squareElem, squareName) {
  let response = board.movePiece(aimedSquare, squareName);
  if (response.success) {
    if (response.transformation) {
      showTransformChoices(board.colors.current);
    }
    else {
      refreshBoard(board);
    }
    aimedSquare = null;
  } else {
    selectPiece(this, squareName);
  }
}


$(".square").on("click", function() {
    let newSquare = $(this).attr("x") + $(this).attr("y");

    unMarkingSquares();

    if (!aimedSquare) {
      selectPiece(this, newSquare);
    } else if (aimedSquare != newSquare) {
      movePiece(this, newSquare);
    }
})


$(".square:not(.aim)")
.mouseenter(function(e) {
  if (aimedSquare) return;

  let squareName = $(this).attr("x") + $(this).attr("y");
  let piece = board.squares[squareName].piece;
  if (!piece) return;

  markingAbilitySquares(piece);
})
.mouseleave(function(e) {
  if (aimedSquare) return;
  unMarkingSquares();
});


function setActionEvents(action) {
  let input = document.getElementById(`actions-${action}`);
  input.addEventListener('change', function(e) {
    globalActions[action] = this.checked;
  });
  globalActions[action] = input.checked;
}


function setActionsEvents() {
  for (let action of chessstuff.Relation.ALL_KINDS) {
    setActionEvents(action);
  }
}


document.addEventListener('DOMContentLoaded', function(e) {
  setActionsEvents();

  board = new chessstuff.Board(chessstuff.Board.INITIAL_FEN);
  refreshBoard(board);
});
