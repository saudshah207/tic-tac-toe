const gameBoard = (function () {
  const board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  const minCellCoord = 0,
    maxCellCoord = board.length - 1;

  function getBoard() {
    return board;
  }

  function getMinCellCoord() {
    return minCellCoord;
  }

  function getMaxCellCoord() {
    return maxCellCoord;
  }

  function mark(cell, marker) {
    if (!board[cell[0]][cell[1]]) {
      board[cell[0]][cell[1]] = marker;

      return true;
    }

    return false;
  }

  function isBoardFilled() {
    let isFilled = false;

    for (const row of board) {
      isFilled = !row.some((cell) => cell === null);

      if (!isFilled) return isFilled;
    }

    return isFilled;
  }

  return { getBoard, getMinCellCoord, getMaxCellCoord, mark, isBoardFilled };
})();

const game = (function () {
  winner = null;
  isTie = false;

  function tie() {
    isTie = true;
  }

  function isGameTie() {
    return isTie;
  }

  function setWinner(player) {
    winner = player;

    return `${player.getName()} has won!`;
  }

  return { tie, isGameTie, setWinner };
})();

function createPlayer(name, marker) {
  const marks = [];

  function getName() {
    return name;
  }

  function getMarker() {
    return marker;
  }

  function recordMark(cell) {
    marks.push(cell);
  }

  function checkForWinningMarks() {
    const marksCount = marks.length;

    const minMarkCoord = gameBoard.getMinCellCoord(),
      maxMarkCoord = gameBoard.getMaxCellCoord();

    if (marksCount < 3) return false;

    let won = false;

    for (let i = 0; i < marksCount && !won; i++) {
      const row = marks[i][0],
        column = marks[i][1];

      let marksInSameRowCount = 0,
        marksInSameColumnCount = 0,
        marksInSameDiagonalCount = 0;

      const difference = Math.abs(row - column);

      const shouldCheckForDiagonalAlignment =
        difference === 0 || difference === 2;

      for (let j = i + 1; j < marksCount; j++) {
        const mark = marks[j],
          markToCheckRow = mark[0],
          markToCheckColumn = mark[1];

        if (markToCheckRow === row) {
          marksInSameRowCount++;
        } else if (markToCheckColumn === column) {
          marksInSameColumnCount++;
        }

        if (shouldCheckForDiagonalAlignment) {
          marksInSameDiagonalCount = checkForDiagonalAlignment(
            row,
            column,
            { mark, row: markToCheckRow, column: markToCheckColumn },
            { min: minMarkCoord, max: maxMarkCoord },
            marksInSameDiagonalCount,
          );
        }
      }

      function hasWon() {
        return (
          marksInSameColumnCount === 2 ||
          marksInSameRowCount === 2 ||
          marksInSameDiagonalCount === 2
        );
      }

      won = hasWon();
    }

    return won;
  }

  function checkForDiagonalAlignment(
    row,
    column,
    markToCheck,
    markCoordsRange,
    marksInSameDiagonalCount,
  ) {
    if (row === markCoordsRange.min) {
      if (column === markCoordsRange.min) {
        if (
          (markToCheck.row === row + 1 && markToCheck.column === column + 1) ||
          (markToCheck.row === row + 2 && markToCheck.column === column + 2)
        )
          marksInSameDiagonalCount++;
      } else if (column === markCoordsRange.max) {
        if (
          (markToCheck.row === row + 1 && markToCheck.column === column - 1) ||
          (markToCheck.row === row + 2 && markToCheck.column === column - 2)
        )
          marksInSameDiagonalCount++;
      }
    } else if (row === markCoordsRange.max) {
      if (column === markCoordsRange.max) {
        if (
          (markToCheck.row === row - 1 && markToCheck.column === column - 1) ||
          (markToCheck.row === row - 2 && markToCheck.column === column - 2)
        )
          marksInSameDiagonalCount++;
      } else if (column === markCoordsRange.min) {
        if (
          (markToCheck.row === row - 1 && markToCheck.column === column + 1) ||
          (markToCheck.row === row - 2 && markToCheck.column === column + 2)
        )
          marksInSameDiagonalCount++;
      }
    } else {
      if (
        (markToCheck.row === row - 1 && markToCheck.column === column - 1) ||
        (markToCheck.row === row + 1 && markToCheck.column === column + 1) ||
        (markToCheck.row === row - 1 && markToCheck.column === column + 1) ||
        (markToCheck.row === row + 1 && markToCheck.column === column - 1)
      )
        marksInSameDiagonalCount++;
    }

    return marksInSameDiagonalCount;
  }

  return { getName, getMarker, recordMark, checkForWinningMarks, marks };
}

const player = createPlayer("Saud", "X"),
  computer = createPlayer("Computer", "O");

function play(row, column) {
  const cell = [row, column];

  if (!gameBoard.mark(cell, player.getMarker())) {
    console.log("Cell already taken! try another one.");
    return;
  }

  player.recordMark(cell);

  computerPlay();
  checkWinner();
}

function computerPlay() {
  if (gameBoard.isBoardFilled()) return;

  let cell, marked;

  do {
    cell = [getRandomCellCoord(), getRandomCellCoord()];
    marked = gameBoard.mark(cell, computer.getMarker());
  } while (!marked);

  computer.recordMark(cell);

  function getRandomCellCoord() {
    return Math.floor(Math.random() * (gameBoard.getMaxCellCoord() + 1));
  }
}

function checkWinner() {
  console.log(gameBoard.getBoard());
  console.log("Player:", player.marks);
  console.log("Computer:", computer.marks);

  let winnerAnnouncement = "";

  if (player.checkForWinningMarks())
    winnerAnnouncement = game.setWinner(player);
  else if (computer.checkForWinningMarks())
    winnerAnnouncement = game.setWinner(computer);
  else if (gameBoard.isBoardFilled()) {
    game.tie();

    winnerAnnouncement = "Game ends in a tie!";
  }

  if (winnerAnnouncement != "") console.log(winnerAnnouncement);
}
