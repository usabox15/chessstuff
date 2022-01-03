const AIM = 'aim';
const MARKED = 'marked';

const SYMBOLS = {
    [chessstuff.Piece.WHITE]: {
        [chessstuff.Piece.PAWN]: '♙',
        [chessstuff.Piece.KNIGHT]: '♘',
        [chessstuff.Piece.BISHOP]: '♗',
        [chessstuff.Piece.ROOK]: '♖',
        [chessstuff.Piece.QUEEN]: '♕',
        [chessstuff.Piece.KING]: '♔',
    },
    [chessstuff.Piece.BLACK]: {
        [chessstuff.Piece.PAWN]: '♟',
        [chessstuff.Piece.KNIGHT]: '♞',
        [chessstuff.Piece.BISHOP]: '♝',
        [chessstuff.Piece.ROOK]: '♜',
        [chessstuff.Piece.QUEEN]: '♛',
        [chessstuff.Piece.KING]: '♚',
    },
};


var GLOBAL = {
  actions: Object.fromEntries(
    chessstuff.Relation.ALL_KINDS.map(k => [k, true])
  ),
  aimedSquare: null,
  board: null,
};


function markingSquares(piece, action, aimed=false) {
  if (!GLOBAL.actions[action] || !piece.squares[action]) return;

  let classes = [action, MARKED];
  if (aimed) {
    classes.push(AIM);
  }

  for (let sqr of piece.squares[action]) {
    let x = sqr.name.symbol;
    let y = sqr.name.number;
    let square = document.querySelector(`.square[x="${x}"][y="${y}"]`);
    square.classList.add(...classes);
  }
}


function markingAbilitySquares(piece, aimed=false) {
  for (let action of chessstuff.Relation.ALL_KINDS) {
    markingSquares(piece, action, aimed);
  }
}


function unMarkingSquares() {
  let squares = document.querySelectorAll('.square');
  for (let square of squares) {
    square.classList.remove(AIM, MARKED, ...chessstuff.Relation.ALL_KINDS);
  }
}


function createPiece(color, kind) {
  let piece = document.createElement('p');
  piece.textContent = SYMBOLS[color][kind];
  piece.classList.add('piece');
  return piece;
}



function refreshBoard() {
  let squares = document.querySelectorAll('.square');
  for (let square of squares) {
    square.innerHTML = '';
  }

  for (let piece of GLOBAL.board.squares.allPieces) {
    let pieceElement = createPiece(piece.color, piece.kind);
    let x = piece.square.name.symbol;
    let y = piece.square.name.number;
    let square = document.querySelector(`.square[x="${x}"][y="${y}"]`);
    square.appendChild(pieceElement);
  }
}


function showCover() {
  let cover = document.querySelector('#cover');
  cover.classList.remove('hided');
}

function hideCover() {
  let cover = document.querySelector('#cover');
  cover.classList.add('hided');
}


function showChoicesBox() {
  let choicesBox = document.querySelector('#choicesBox');
  choicesBox.classList.remove('hided');
}

function hideChoicesBox() {
  let choicesBox = document.querySelector('#choicesBox');
  choicesBox.classList.add('hided');
  choicesBox.innerHTML = '';
}


function removeAdditionalInfo() {
  hideChoicesBox();
  hideCover();
}


function fillChoicesBox() {
  let choicesBox = document.querySelector('#choicesBox');
  for (let kind of chessstuff.Piece.ALL_PAWN_TRANSFORM) {
    let choicesItem = document.createElement('div');
    choicesItem.classList.add('square', 'choicesItem');
    choicesItem.addEventListener('click', function(e) {
      e.stopPropagation();
      removeAdditionalInfo();
      response = GLOBAL.board.pawnTransformation(kind);
      if (response.success) {
        refreshBoard();
      }
    });
    pieceElement = createPiece(GLOBAL.board.colors.current, kind);
    choicesItem.appendChild(pieceElement);
    choicesBox.appendChild(choicesItem);
  }
}


function selectPiece(squareElem, squareName) {
  let piece = GLOBAL.board.squares[squareName].piece;
  if (piece && piece.hasColor(GLOBAL.board.colors.current)) {
    squareElem.classList.add(AIM, MARKED);
    markingAbilitySquares(piece, true);
    GLOBAL.aimedSquare = squareName;
  } else {
    GLOBAL.aimedSquare = null;
  }
}


function movePiece(squareElem, squareName) {
  let response = GLOBAL.board.movePiece(GLOBAL.aimedSquare, squareName);
  if (response.success) {
    if (response.transformation) {
      showCover();
      showChoicesBox();
      fillChoicesBox();
    } else {
      refreshBoard();
    }
    GLOBAL.aimedSquare = null;
  } else {
    selectPiece(squareElem, squareName);
  }
}


function setSquaresEvents() {
  let squares = document.querySelectorAll('.square');
  for (let square of squares) {
    square.addEventListener('click', function(e) {
      let x = this.getAttributeNode('x').nodeValue;
      let y = this.getAttributeNode('y').nodeValue;
      let squareName = `${x}${y}`;

      unMarkingSquares();

      if (!GLOBAL.aimedSquare) {
        selectPiece(this, squareName);
      } else if (GLOBAL.aimedSquare != squareName) {
        movePiece(this, squareName);
      }
    });
  }

  squares = document.querySelectorAll('.square:not(.aim)');
  for (let square of squares) {
    square.addEventListener('mouseenter', function(e) {
      if (GLOBAL.aimedSquare) return;

      let x = this.getAttributeNode('x').nodeValue;
      let y = this.getAttributeNode('y').nodeValue;
      let squareName = `${x}${y}`;
      let piece = GLOBAL.board.squares[squareName].piece;
      if (!piece) return;

      markingAbilitySquares(piece);
    });

    square.addEventListener('mouseleave', function(e) {
      if (GLOBAL.aimedSquare) return;
      unMarkingSquares();
    });
  }
}


function setActionEvents(action) {
  let input = document.getElementById(`actions-${action}`);
  input.addEventListener('change', function(e) {
    GLOBAL.actions[action] = this.checked;
  });
  GLOBAL.actions[action] = input.checked;
}


function setActionsEvents() {
  for (let action of chessstuff.Relation.ALL_KINDS) {
    setActionEvents(action);
  }
}


document.addEventListener('DOMContentLoaded', function(e) {
  setActionsEvents();

  setSquaresEvents();

  let cover = document.querySelector('#cover');
  cover.addEventListener('click', function(e) {
      removeAdditionalInfo();
  });

  GLOBAL.board = new chessstuff.Board(chessstuff.Board.INITIAL_FEN);
  refreshBoard();
});
