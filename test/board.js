/*
Copyright 2020-2021 Yegor Bitensky

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


const assert = require('assert');
const {
  board: {
    Board,
    BoardColors, BoardSquares,
    BoardInitial, BoardInitialCastle, BoardInitialPosition,
    FENData, FENDataCreator,
    MovesCounter, FiftyMovesRuleCounter,
  },
  pieces: { Piece, Pawn, Knight, Bishop, Rook, Queen, King, KingCastleRoad },
  square: { SquareName },
} = require('../');


describe('Test board', function () {
  describe('Test BoardSquares', function () {
    it('should check initial', function () {
      let board = new Board();
      for (let symbol of SquareName.symbols) {
        for (let number of SquareName.numbers) {
          let name = `${symbol}${number}`;
          assert.ok(board.squares.hasOwnProperty(name));
        }
      }
    });

    it('should check occupied', function () {
      let board = new Board();
      new Piece(Piece.WHITE, board.squares.b3);
      new Piece(Piece.BLACK, board.squares.e8);
      new Piece(Piece.WHITE, board.squares.g5);
      new Piece(Piece.BLACK, board.squares.c2);
      new Piece(Piece.WHITE, board.squares.h4);
      new Piece(Piece.BLACK, board.squares.f1);
      assert.equal(Object.entries(board.squares.occupied).length, 6);
      for (let name of ['b3', 'e8', 'g5', 'c2', 'h4', 'f1']) {
        assert.ok(board.squares.hasOwnProperty(name));
      }
    });

    it('should check get square from coordinates', function () {
      let board = new Board();
      assert.ok(board.squares.getFromCoordinates(3, 5).theSame(board.squares.d6));
      assert.ok(board.squares.getFromCoordinates(7, 2).theSame(board.squares.h3));
      assert.ok(board.squares.getFromCoordinates(0, 7).theSame(board.squares.a8));
    });
  });

  describe('Test BoardColors', function () {
    it('should throw error by wrong color', function () {
      assert.throws(() => {new BoardColors('wrong color');});
    });

    it('should check initial', function () {
      let boardColors = new BoardColors(Piece.WHITE);
      assert.equal(boardColors._priority.length, 2);
      assert.equal(boardColors._priority[0], 0);
      assert.equal(boardColors._priority[1], 1);

      boardColors = new BoardColors(Piece.BLACK);
      assert.equal(boardColors._priority.length, 2);
      assert.equal(boardColors._priority[0], 1);
      assert.equal(boardColors._priority[1], 0);
    });

    it('should check change priority', function () {
      let boardColors = new BoardColors(Piece.WHITE);

      assert.equal(boardColors.current, Piece.WHITE);
      assert.equal(boardColors.opponent, Piece.BLACK);
      assert.equal(boardColors.firstPriority, 0);
      assert.equal(boardColors.secondPriority, 1);

      boardColors.changePriority();

      assert.equal(boardColors.current, Piece.BLACK);
      assert.equal(boardColors.opponent, Piece.WHITE);
      assert.equal(boardColors.firstPriority, 1);
      assert.equal(boardColors.secondPriority, 0);
    });
  });

  describe('Test MovesCounter', function () {
    it('should check update', function () {
      let counter = new MovesCounter(5);
      assert.equal(counter.value, 5);
      counter.update();
      assert.equal(counter.value, 6);
      counter.update();
      assert.equal(counter.value, 7);
    });
  });

  describe('Test FiftyMovesRuleCounter', function () {
    it('should check update', function () {
      let counter = new FiftyMovesRuleCounter(15);
      assert.equal(counter.value, 15);
      assert.ok(!counter._turnedOn);
      assert.ok(!counter._needToRefresh);

      counter.update();
      assert.equal(counter.value, 15);

      counter.switch();
      assert.equal(counter.value, 15);
      assert.ok(counter._turnedOn);
      assert.ok(counter._needToRefresh);

      counter.update();
      assert.equal(counter.value, 0);
      assert.ok(counter._turnedOn);
      assert.ok(!counter._needToRefresh);

      counter.update();
      assert.equal(counter.value, 1);
      assert.ok(counter._turnedOn);
      assert.ok(!counter._needToRefresh);

      counter.update();
      assert.equal(counter.value, 2);
      assert.ok(counter._turnedOn);
      assert.ok(!counter._needToRefresh);

      counter.switch();
      assert.equal(counter.value, 2);
      assert.ok(counter._turnedOn);
      assert.ok(counter._needToRefresh);

      counter.update();
      assert.equal(counter.value, 0);
      assert.ok(counter._turnedOn);
      assert.ok(!counter._needToRefresh);
    });
  });

  describe('Test BoardInitialPosition', function () {
    it('should check creation', function () {
      let position = new BoardInitialPosition('4k1r1/3n1p2/4p1q1/3bP3/Q1pN1B2/6P1/5P2/4R1K1');

      assert.equal(position[Piece.WHITE].length, 8);
      assert.equal(position[Piece.WHITE][0][0], Piece.ROOK);
      assert.equal(position[Piece.WHITE][0][1], 'e1');
      assert.equal(position[Piece.WHITE][1][0], Piece.KING);
      assert.equal(position[Piece.WHITE][1][1], 'g1');
      assert.equal(position[Piece.WHITE][2][0], Piece.PAWN);
      assert.equal(position[Piece.WHITE][2][1], 'f2');
      assert.equal(position[Piece.WHITE][3][0], Piece.PAWN);
      assert.equal(position[Piece.WHITE][3][1], 'g3');
      assert.equal(position[Piece.WHITE][4][0], Piece.QUEEN);
      assert.equal(position[Piece.WHITE][4][1], 'a4');
      assert.equal(position[Piece.WHITE][5][0], Piece.KNIGHT);
      assert.equal(position[Piece.WHITE][5][1], 'd4');
      assert.equal(position[Piece.WHITE][6][0], Piece.BISHOP);
      assert.equal(position[Piece.WHITE][6][1], 'f4');
      assert.equal(position[Piece.WHITE][7][0], Piece.PAWN);
      assert.equal(position[Piece.WHITE][7][1], 'e5');

      assert.equal(position[Piece.BLACK].length, 8);
      assert.equal(position[Piece.BLACK][0][0], Piece.PAWN);
      assert.equal(position[Piece.BLACK][0][1], 'c4');
      assert.equal(position[Piece.BLACK][1][0], Piece.BISHOP);
      assert.equal(position[Piece.BLACK][1][1], 'd5');
      assert.equal(position[Piece.BLACK][2][0], Piece.PAWN);
      assert.equal(position[Piece.BLACK][2][1], 'e6');
      assert.equal(position[Piece.BLACK][3][0], Piece.QUEEN);
      assert.equal(position[Piece.BLACK][3][1], 'g6');
      assert.equal(position[Piece.BLACK][4][0], Piece.KNIGHT);
      assert.equal(position[Piece.BLACK][4][1], 'd7');
      assert.equal(position[Piece.BLACK][5][0], Piece.PAWN);
      assert.equal(position[Piece.BLACK][5][1], 'f7');
      assert.equal(position[Piece.BLACK][6][0], Piece.KING);
      assert.equal(position[Piece.BLACK][6][1], 'e8');
      assert.equal(position[Piece.BLACK][7][0], Piece.ROOK);
      assert.equal(position[Piece.BLACK][7][1], 'g8');
    });
  });

  describe('Test BoardInitialCastle', function () {
    it('should check creation', function () {
      assert.throws(() => {
        new BoardInitialCastle('wrong');
      });

      let castleRights = new BoardInitialCastle();
      assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.LONG]);

      castleRights = new BoardInitialCastle('-');
      assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.LONG]);

      castleRights = new BoardInitialCastle('KQ');
      assert.ok(castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(castleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(!castleRights[Piece.BLACK][KingCastleRoad.LONG]);

      castleRights = new BoardInitialCastle('kq');
      assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(!castleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(castleRights[Piece.BLACK][KingCastleRoad.LONG]);

      castleRights = new BoardInitialCastle('KQkq');
      assert.ok(castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(castleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(castleRights[Piece.BLACK][KingCastleRoad.LONG]);
    });
  });

  describe('Test FENData', function () {
    it('should check creation', function () {
      let data = new FENData('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      assert.equal(data.positionData, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
      assert.equal(data.currentColorData, 'w');
      assert.equal(data.castleRightsData, 'KQkq');
      assert.equal(data.enPassantData, '-');
      assert.equal(data.fiftyMovesRuleData, '0');
      assert.equal(data.movesCounterData, '1');
    });
  });

  describe('Test BoardInitial', function () {
    it('should check position', function () {
      let data = new BoardInitial(
        new FENData('2kr4/1bp3q1/1pn5/p7/5Q2/5N1P/5PPB/5RK1 w - a6 0 25')
      );

      assert.equal(data.position[Piece.WHITE].length, 8);
      assert.equal(data.position[Piece.WHITE][0][0], Piece.ROOK);
      assert.equal(data.position[Piece.WHITE][0][1], 'f1');
      assert.equal(data.position[Piece.WHITE][1][0], Piece.KING);
      assert.equal(data.position[Piece.WHITE][1][1], 'g1');
      assert.equal(data.position[Piece.WHITE][2][0], Piece.PAWN);
      assert.equal(data.position[Piece.WHITE][2][1], 'f2');
      assert.equal(data.position[Piece.WHITE][3][0], Piece.PAWN);
      assert.equal(data.position[Piece.WHITE][3][1], 'g2');
      assert.equal(data.position[Piece.WHITE][4][0], Piece.BISHOP);
      assert.equal(data.position[Piece.WHITE][4][1], 'h2');
      assert.equal(data.position[Piece.WHITE][5][0], Piece.KNIGHT);
      assert.equal(data.position[Piece.WHITE][5][1], 'f3');
      assert.equal(data.position[Piece.WHITE][6][0], Piece.PAWN);
      assert.equal(data.position[Piece.WHITE][6][1], 'h3');
      assert.equal(data.position[Piece.WHITE][7][0], Piece.QUEEN);
      assert.equal(data.position[Piece.WHITE][7][1], 'f4');

      assert.equal(data.position[Piece.BLACK].length, 8);
      assert.equal(data.position[Piece.BLACK][0][0], Piece.PAWN);
      assert.equal(data.position[Piece.BLACK][0][1], 'a5');
      assert.equal(data.position[Piece.BLACK][1][0], Piece.PAWN);
      assert.equal(data.position[Piece.BLACK][1][1], 'b6');
      assert.equal(data.position[Piece.BLACK][2][0], Piece.KNIGHT);
      assert.equal(data.position[Piece.BLACK][2][1], 'c6');
      assert.equal(data.position[Piece.BLACK][3][0], Piece.BISHOP);
      assert.equal(data.position[Piece.BLACK][3][1], 'b7');
      assert.equal(data.position[Piece.BLACK][4][0], Piece.PAWN);
      assert.equal(data.position[Piece.BLACK][4][1], 'c7');
      assert.equal(data.position[Piece.BLACK][5][0], Piece.QUEEN);
      assert.equal(data.position[Piece.BLACK][5][1], 'g7');
      assert.equal(data.position[Piece.BLACK][6][0], Piece.KING);
      assert.equal(data.position[Piece.BLACK][6][1], 'c8');
      assert.equal(data.position[Piece.BLACK][7][0], Piece.ROOK);
      assert.equal(data.position[Piece.BLACK][7][1], 'd8');
    });

    it('should check currentColor', function () {
      let data = new BoardInitial(new FENData('5r2/8/3k4/8/5K2/8/R7/8 w - - 0 1'));
      assert.equal(data.currentColor, Piece.WHITE);

      data = new BoardInitial(new FENData('5r2/8/3k4/8/4K3/8/R7/8 b - - 0 1'));
      assert.equal(data.currentColor, Piece.BLACK);
    });

    it('should check castleRights', function () {
      let data = new BoardInitial(new FENData('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1'));
      assert.ok(data.castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(data.castleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(data.castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(data.castleRights[Piece.BLACK][KingCastleRoad.LONG]);

      data = new BoardInitial(new FENData('r3k3/pppppppp/8/8/8/8/PPPPPPPP/4K2R w Kq - 0 1'));
      assert.ok(data.castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(!data.castleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(!data.castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(data.castleRights[Piece.BLACK][KingCastleRoad.LONG]);

      data = new BoardInitial(new FENData('4k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K3 w Qk - 0 1'));
      assert.ok(!data.castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(data.castleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(data.castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(!data.castleRights[Piece.BLACK][KingCastleRoad.LONG]);

      data = new BoardInitial(new FENData('4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1'));
      assert.ok(!data.castleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(!data.castleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(!data.castleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(!data.castleRights[Piece.BLACK][KingCastleRoad.LONG]);
    });

    it('should check enPassantSquareName', function () {
      let data = new BoardInitial(new FENData('4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1'));
      assert.equal(data.enPassantSquareName, null);

      data = new BoardInitial(new FENData('4k3/pppppppp/8/8/4P3/8/PPPP1PPP/4K3 w - e3 0 1'));
      assert.equal(data.enPassantSquareName, 'e3');
    });

    it('should check moves counters', function () {
      let data = new BoardInitial(
          new FENData('rnbq1bnr/pppkpppp/8/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQ - 2 3 ')
      );
      assert.equal(data.fiftyMovesRuleCounter, 2);
      assert.equal(data.movesCounter, 3);
    });
  });

  describe('Test FENDataCreator', function () {
    it('should check creation', function () {
      let board = new Board();
      assert.equal(new FENDataCreator(board).value, Board.EMPTY_FEN);

      board = new Board(Board.INITIAL_FEN);
      assert.equal(new FENDataCreator(board).value, Board.INITIAL_FEN);

      let fenString = 'r3k2r/1bp1npb1/ppnp1qp1/7p/2P1P3/P1N1PNB1/1PBQ1PP1/2KR3R b kq - 3 26';
      board = new Board(fenString);
      assert.equal(new FENDataCreator(board).value, fenString);
    });
  });

  describe('Test Board', function () {
    it('should check initial state without initial data', function () {
      let board = new Board();

      assert.equal(board.allPieces.length, 0);
      assert.equal(board.colors.current, Piece.WHITE);
      assert.equal(board._result.value, null);
      assert.equal(board.enPassantSquare, null);
      assert.equal(board._latestFEN, Board.EMPTY_FEN);
      assert.ok(!board._positionIsLegal);
      assert.ok(!board.positionIsSetted);
      assert.ok(!board._initialCastleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(!board._initialCastleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(!board._initialCastleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(!board._initialCastleRights[Piece.BLACK][KingCastleRoad.LONG]);
      assert.equal(board.kings[Piece.WHITE], null);
      assert.equal(board.kings[Piece.BLACK], null);
      assert.equal(board.fiftyMovesRuleCounter.value, 0);
      assert.equal(board.movesCounter.value, 1);
      assert.equal(board.FEN, Board.EMPTY_FEN);
    });

    it('should check initial state with initial position', function () {
      let board = new Board(Board.INITIAL_FEN);

      assert.equal(board.allPieces.length, 32);
      assert.equal(board.colors.current, Piece.WHITE);
      assert.equal(board._result.value, null);
      assert.equal(board.enPassantSquare, null);
      assert.equal(board._latestFEN, Board.INITIAL_FEN);
      assert.ok(board._positionIsLegal);
      assert.ok(board.positionIsSetted);
      assert.ok(board._initialCastleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(board._initialCastleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(board._initialCastleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(board._initialCastleRights[Piece.BLACK][KingCastleRoad.LONG]);
      assert.equal(board.kings[Piece.WHITE].square.name.value, 'e1');
      assert.equal(board.kings[Piece.BLACK].square.name.value, 'e8');
      assert.equal(board.fiftyMovesRuleCounter.value, 0);
      assert.equal(board.movesCounter.value, 1);
      assert.equal(board.FEN, Board.INITIAL_FEN);
    });

    it('should check initial state with FEN', function () {
      let fenString = 'r3k2r/p2n1pbp/1p2p1p1/2p5/3pP1P1/1P1N2P1/P1P5/R2QK1Nb b Qkq e3 0 37';
      let board = new Board(fenString);

      assert.equal(board.allPieces.length, 25);
      assert.equal(board.colors.current, Piece.BLACK);
      assert.equal(board._result.value, null);
      assert.ok(board.enPassantSquare.theSame(board.squares.e3));
      assert.equal(board._latestFEN, fenString);
      assert.ok(board._positionIsLegal);
      assert.ok(board.positionIsSetted);
      assert.ok(!board._initialCastleRights[Piece.WHITE][KingCastleRoad.SHORT]);
      assert.ok(board._initialCastleRights[Piece.WHITE][KingCastleRoad.LONG]);
      assert.ok(board._initialCastleRights[Piece.BLACK][KingCastleRoad.SHORT]);
      assert.ok(board._initialCastleRights[Piece.BLACK][KingCastleRoad.LONG]);
      assert.equal(board.kings[Piece.WHITE].square.name.value, 'e1');
      assert.equal(board.kings[Piece.BLACK].square.name.value, 'e8');
      assert.equal(board.fiftyMovesRuleCounter.value, 0);
      assert.equal(board.movesCounter.value, 37);
      assert.equal(board.FEN, fenString);
    });

    it('should check init board with manually added pieces', function () {
      let board = new Board();
      new King(Piece.WHITE, board.squares.c4);
      new King(Piece.BLACK, board.squares.d7);
      board.placePiece(Piece.WHITE, Piece.ROOK, 'g2');
      board.placePiece(Piece.BLACK, Piece.ROOK, 'e6');
      assert.ok(board.markPositionAsSetted().success);
      // couldn't place piece after position is setted
      assert.throws(() => {new Pawn(Piece.WHITE, board.squares.b2);});
      assert.equal(board.FEN, '8/3k4/4r3/8/2K5/8/6R1/8 w - - 0 1');

      board = new Board();
      assert.ok(!board.markPositionAsSetted().success);
      new King(Piece.BLACK, board.squares.e8);
      assert.ok(!board.markPositionAsSetted().success);
      // place pawn on wrong square
      new Pawn(Piece.WHITE, board.squares.d7);
      assert.ok(!board.markPositionAsSetted().success);
      board.placePiece(Piece.WHITE, Piece.KING, 'b5');
      assert.ok(!board.markPositionAsSetted().success);
      // remove pawn
      board.removePiece('d7');
      assert.ok(board.markPositionAsSetted().success);
      assert.equal(board.FEN, '4k3/8/8/1K6/8/8/8/8 w - - 0 1');
    });

    it('should check init board by parts', function () {
      board = new Board();
      assert.ok(board.setCurrentColor(Piece.BLACK).success);
      assert.ok(board.setCastleRights(new BoardInitialCastle('Q')).success);
      assert.ok(board.setEnPassantSquare('e3').success);
      assert.ok(board.setFiftyMovesRuleCounter(5).success);
      assert.ok(board.setMovesCounter(31).success);
      assert.ok(board.setPosition(
          new BoardInitialPosition('2kb1r1q/2pn3r/1p1p4/pP1P4/P3Pp2/2P5/1B1N2Q1/R3K1R1')
      ).success);
      assert.ok(board.positionIsSetted);
      assert.equal(board.FEN, '2kb1r1q/2pn3r/1p1p4/pP1P4/P3Pp2/2P5/1B1N2Q1/R3K1R1 b Q e3 5 31');
    });

    it('should check board insufficient material', function () {
      let board = new Board('8/8/3k4/8/2q5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/2r5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/2p5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/1bn5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/1Bn5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/1bN5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/1nn5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/1Nn5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/1bb5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/1bB5/4K3/8/8 w - - 0 1');
      assert.ok(!board.insufficientMaterial);

      board = new Board('8/8/3k4/8/8/4K3/8/8 w - - 0 1');
      assert.ok(board.insufficientMaterial);

      board = new Board('8/8/3k4/8/1N6/4K3/8/8 w - - 0 1');
      assert.ok(board.insufficientMaterial);

      board = new Board('8/8/3k4/8/2B5/4K3/8/8 w - - 0 1');
      assert.ok(board.insufficientMaterial);

      board = new Board('8/8/3k4/8/B1B5/4K3/8/8 w - - 0 1');
      assert.ok(board.insufficientMaterial);

      board = new Board('8/8/3k4/8/b1B5/4K3/8/8 w - - 0 1');
      assert.ok(board.insufficientMaterial);
    });

    it('should check board pieces count legality', function () {
      let board = new Board('qqqqqqqq/3q4/3q4/3k4/8/8/8/3K4 w - - 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('rrrrrrrr/3r4/3r4/3r4/3k4/8/8/3K4 w - - 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('nnnnnnnn/3n4/3n4/3n4/3k4/8/8/3K4 w - - 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('bbbbbbbb/3b4/3b4/3b4/3k4/8/8/3K4 w - - 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('8/pppppppp/3p4/8/3k4/8/8/3K4 w - - 0 1');
      assert.ok(!board._positionIsLegal);
    });

    it('should check board pawns placement legality', function () {
      let board = new Board();
      board.placePiece(Piece.WHITE, Piece.KING, 'd3');
      board.placePiece(Piece.BLACK, Piece.KING, 'e7');

      let pawn = new Pawn(Piece.WHITE, board.squares.g2);
      board._replacePiece(board.squares.g2, board.squares.g1, pawn);
      assert.ok(!board._positionIsLegal);
      board._removePiece('g1');
      board.refreshAllSquares();
      assert.ok(board._positionIsLegal);

      pawn = new Pawn(Piece.BLACK, board.squares.c7);
      board._replacePiece(board.squares.c7, board.squares.c8, pawn);
      assert.ok(!board._positionIsLegal);
      board._removePiece('c8');
      board.refreshAllSquares();
      assert.ok(board._positionIsLegal);
    });

    it('should check board kings placement legality', function () {
      let board = new Board('8/8/8/3k4/4K3/8/8/8 w - - 0 1');
      assert.ok(!board._positionIsLegal);
    });

    it('should check board kings checkers legality', function () {
      let board = new Board('8/8/8/2k5/4K3/2R5/8/8 w - - 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('8/8/6b1/2k5/4K3/8/8/8 b - - 0 1');
      assert.ok(!board._positionIsLegal);
    });

    it('should check board en passant square legality', function () {
      let board = new Board('8/8/8/2k3Pp/4K3/8/8/8 b - g4 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('8/8/8/2k5/6Pp/8/6K1/8 b - g3 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('8/8/8/2k5/7p/8/4K3/8 b - g3 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('8/8/8/2k5/6Np/8/4K3/8 b - g3 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('8/8/8/2k5/6pp/8/4K3/8 b - g3 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('8/4k3/8/4pP2/8/8/6K1/8 b - e6 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('3k4/8/8/5P2/8/8/6K1/8 b - e6 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('8/2k5/8/4rP2/8/8/6K1/8 b - e6 0 1');
      assert.ok(!board._positionIsLegal);

      board = new Board('8/2k5/8/4PP2/8/8/6K1/8 b - e6 0 1');
      assert.ok(!board._positionIsLegal);
    });

    it('should check pawn transformation', function () {
      let board = new Board('8/2P1k3/8/8/8/8/6K1/8 w - - 0 1');
      let response = board.movePiece('c7', 'c8');
      assert.ok(response.success);
      response = board.pawnTransformation(Piece.BISHOP);
      assert.ok(response.success);

      board = new Board('8/4k3/8/8/8/8/2p3K1/8 b - - 0 1');
      response = board.pawnTransformation(Piece.KNIGHT);
      assert.ok(!response.success);
    });

    it('should check en passant', function () {
      let board = new Board('4k3/8/8/8/2p5/8/1P6/4K3 w - - 0 1');
      let response = board.movePiece('b2', 'b4');
      assert.ok(response.success);
      assert.ok(board.squares.b3.theSame(board.enPassantSquare));
      response = board.movePiece('c4', 'b3');
      assert.ok(response.success);
      assert.equal(board.FEN, '4k3/8/8/8/8/1p6/8/4K3 w - - 0 2');

      board = new Board('4k3/6p1/8/5P2/8/8/8/4K3 b - - 0 1');
      response = board.movePiece('g7', 'g5');
      assert.ok(response.success);
      assert.ok(board.squares.g6.theSame(board.enPassantSquare));
      response = board.movePiece('e1', 'e2');
      assert.ok(response.success);
      response = board.movePiece('e8', 'e7');
      assert.ok(response.success);
      response = board.movePiece('f5', 'g6');
      assert.ok(!response.success);
    });

    it('should check caltle', function () {
      let board = new Board('4k3/8/8/8/8/8/8/4K2R w K - 0 1');
      let response = board.movePiece('e1', 'g1');
      assert.ok(response.success);
      assert.equal(board.FEN, '4k3/8/8/8/8/8/8/5RK1 b - - 0 1');

      board = new Board('4k3/8/8/8/5r2/8/8/4K2R w K - 0 1');
      response = board.movePiece('e1', 'g1');
      assert.ok(!response.success);
      assert.equal(board.FEN, '4k3/8/8/8/5r2/8/8/4K2R w K - 0 1');

      board = new Board('r3k3/8/8/8/8/8/8/4K3 b q - 0 1');
      response = board.movePiece('e8', 'c8');
      assert.ok(response.success);
      assert.equal(board.FEN, '2kr4/8/8/8/8/8/8/4K3 w - - 0 2');

      board = new Board('rn2k3/8/8/8/8/8/8/4K3 b q - 0 1');
      response = board.movePiece('e8', 'c8');
      assert.ok(!response.success);
      assert.equal(board.FEN, 'rn2k3/8/8/8/8/8/8/4K3 b q - 0 1');

      board = new Board('4k3/8/8/8/8/8/8/R3K3 w Q - 0 1');
      response = board.movePiece('e1', 'c1');
      assert.ok(response.success);
      assert.equal(board.FEN, '4k3/8/8/8/8/8/8/2KR4 b - - 0 1');

      board = new Board('4k3/8/8/8/4q3/8/8/R3K3 w Q - 0 1');
      response = board.movePiece('e1', 'c1');
      assert.ok(!response.success);
      assert.equal(board.FEN, '4k3/8/8/8/4q3/8/8/R3K3 w Q - 0 1');
    });

    it('should check rollback', function () {
      let board = new Board(Board.INITIAL_FEN);
      assert.equal(board.FEN, Board.INITIAL_FEN);

      let response = board.movePiece('g1', 'f3');
      assert.ok(response.success);
      assert.equal(board.FEN, 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 0 1');

      board._latestFEN = Board.INITIAL_FEN;
      board._rollBack();
      assert.equal(board.FEN, Board.INITIAL_FEN);
    });

    it('should check moves', function () {
      let board = new Board(Board.INITIAL_FEN);

      let response = board.movePiece('e2', 'e4');
      assert.ok(response.success);
      assert.equal(board.FEN, 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');

      response = board.movePiece('a7', 'a5');
      assert.ok(response.success);
      assert.equal(board.FEN, 'rnbqkbnr/1ppppppp/8/p7/4P3/8/PPPP1PPP/RNBQKBNR w KQkq a6 0 2');

      response = board.movePiece('g1', 'f3');
      assert.ok(response.success);
      assert.equal(board.FEN, 'rnbqkbnr/1ppppppp/8/p7/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2');

      response = board.movePiece('a8', 'a6');
      assert.ok(response.success);
      assert.ok(!board.kings[Piece.BLACK].castle[KingCastleRoad.LONG]);
      assert.equal(board.FEN, '1nbqkbnr/1ppppppp/r7/p7/4P3/5N2/PPPP1PPP/RNBQKB1R w KQk - 2 3');

      response = board.movePiece('e4', 'e5');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nbqkbnr/1ppppppp/r7/p3P3/8/5N2/PPPP1PPP/RNBQKB1R b KQk - 0 3');

      response = board.movePiece('d7', 'd5');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nbqkbnr/1pp1pppp/r7/p2pP3/8/5N2/PPPP1PPP/RNBQKB1R w KQk d6 0 4');

      response = board.movePiece('e5', 'd6');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nbqkbnr/1pp1pppp/r2P4/p7/8/5N2/PPPP1PPP/RNBQKB1R b KQk - 0 4');

      response = board.movePiece('g8', 'f6');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nbqkb1r/1pp1pppp/r2P1n2/p7/8/5N2/PPPP1PPP/RNBQKB1R w KQk - 1 5');

      response = board.movePiece('d6', 'c7');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nbqkb1r/1pP1pppp/r4n2/p7/8/5N2/PPPP1PPP/RNBQKB1R b KQk - 0 5');

      response = board.movePiece('d8', 'd2');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nb1kb1r/1pP1pppp/r4n2/p7/8/5N2/PPPq1PPP/RNBQKB1R w KQk - 0 6');

      response = board.movePiece('f1', 'd3');
      assert.ok(!response.success);
      assert.equal(board.FEN, '1nb1kb1r/1pP1pppp/r4n2/p7/8/5N2/PPPq1PPP/RNBQKB1R w KQk - 0 6');

      response = board.movePiece('e1', 'd2');
      assert.ok(response.success);
      assert.ok(!board.kings[Piece.WHITE].castle[KingCastleRoad.SHORT]);
      assert.ok(!board.kings[Piece.WHITE].castle[KingCastleRoad.LONG]);
      assert.equal(board.FEN, '1nb1kb1r/1pP1pppp/r4n2/p7/8/5N2/PPPK1PPP/RNBQ1B1R b k - 0 6');

      response = board.movePiece('e7', 'e6');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nb1kb1r/1pP2ppp/r3pn2/p7/8/5N2/PPPK1PPP/RNBQ1B1R w k - 0 7');

      response = board.movePiece('b1', 'c3');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nb1kb1r/1pP2ppp/r3pn2/p7/8/2N2N2/PPPK1PPP/R1BQ1B1R b k - 1 7');

      response = board.movePiece('f8', 'b4');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nb1k2r/1pP2ppp/r3pn2/p7/1b6/2N2N2/PPPK1PPP/R1BQ1B1R w k - 2 8');

      response = board.movePiece('a2', 'a3');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nb1k2r/1pP2ppp/r3pn2/p7/1b6/P1N2N2/1PPK1PPP/R1BQ1B1R b k - 0 8');

      response = board.movePiece('e8', 'g8');
      assert.ok(!board.kings[Piece.BLACK].castle[KingCastleRoad.SHORT]);
      assert.ok(response.success);
      assert.equal(board.FEN, '1nb2rk1/1pP2ppp/r3pn2/p7/1b6/P1N2N2/1PPK1PPP/R1BQ1B1R w - - 1 9');

      response = board.movePiece('a3', 'b4');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nb2rk1/1pP2ppp/r3pn2/p7/1P6/2N2N2/1PPK1PPP/R1BQ1B1R b - - 0 9');

      response = board.movePiece('f8', 'd8');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nbr2k1/1pP2ppp/r3pn2/p7/1P6/2N2N2/1PPK1PPP/R1BQ1B1R w - - 1 10');

      response = board.movePiece('c7', 'd8');
      assert.ok(response.success);
      assert.ok(response.transformation);
      response = board.pawnTransformation(Piece.ROOK);
      assert.ok(response.success);
      assert.equal(board.FEN, '1nbR2k1/1p3ppp/r3pn2/p7/1P6/2N2N2/1PPK1PPP/R1BQ1B1R b - - 0 10');

      response = board.movePiece('f6', 'e8');
      assert.ok(response.success);
      assert.equal(board.FEN, '1nbRn1k1/1p3ppp/r3p3/p7/1P6/2N2N2/1PPK1PPP/R1BQ1B1R w - - 1 11');

      response = board.movePiece('d8', 'e8');
      assert.ok(response.success);
      assert.ok(response.result);
      assert.equal(response.result[0], 1);
      assert.equal(response.result[1], 0);
      assert.equal(board.FEN, '1nb1R1k1/1p3ppp/r3p3/p7/1P6/2N2N2/1PPK1PPP/R1BQ1B1R b - - 0 11');
    });

    it('should check result', function () {
      let board = new Board('8/8/1R6/4k3/5q2/3K2R1/7B/5n2 w - - 0 1');
      let response = board.movePiece('g3', 'g5');
      assert.ok(response.success);
      assert.ok(response.result);
      assert.equal(response.result[0], 1);
      assert.equal(response.result[1], 0);
      assert.equal(board.FEN, '8/8/1R6/4k1R1/5q2/3K4/7B/5n2 b - - 0 1');

      board = new Board('8/8/1R6/4k1R1/5q2/3K4/7B/5n2 b - - 0 1');
      assert.ok(board.state.result);
      assert.equal(board.state.result[0], 1);
      assert.equal(board.state.result[1], 0);

      board = new Board('8/R3q3/8/4n2k/1bpP1Q2/4KB2/8/8 b - - 0 1');
      response = board.movePiece('e5', 'g4');
      assert.ok(response.success);
      assert.ok(response.result);
      assert.equal(response.result[0], 0);
      assert.equal(response.result[1], 1);
      assert.equal(board.FEN, '8/R3q3/8/7k/1bpP1Qn1/4KB2/8/8 w - - 0 2');

      board = new Board('8/R3q3/8/7k/1bpP1Qn1/4KB2/8/8 w - - 0 2');
      assert.ok(board.state.result);
      assert.equal(board.state.result[0], 0);
      assert.equal(board.state.result[1], 1);

      board = new Board('8/8/8/5k2/1r6/2K5/8/8 w - - 0 1');
      response = board.movePiece('c3', 'b4');
      assert.ok(response.success);
      assert.ok(response.result);
      assert.equal(response.result[0], 0.5);
      assert.equal(response.result[1], 0.5);
      assert.equal(board.FEN, '8/8/8/5k2/1K6/8/8/8 b - - 0 1');

      board = new Board('8/8/8/5k2/1K6/8/8/8 b - - 0 1');
      assert.ok(board.state.result);
      assert.equal(board.state.result[0], 0.5);
      assert.equal(board.state.result[1], 0.5);

      board = new Board('1q1Q2r1/bP6/P1K5/5r2/6k1/8/8/8 b - - 0 1');
      response = board.movePiece('g8', 'd8');
      assert.ok(response.success);
      assert.ok(response.result);
      assert.equal(response.result[0], 0.5);
      assert.equal(response.result[1], 0.5);
      assert.equal(board.FEN, '1q1r4/bP6/P1K5/5r2/6k1/8/8/8 w - - 0 2');

      board = new Board('1q1r4/bP6/P1K5/5r2/6k1/8/8/8 w - - 0 2');
      assert.ok(board.state.result);
      assert.equal(board.state.result[0], 0.5);
      assert.equal(board.state.result[1], 0.5);
    });
  });
});
