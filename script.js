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
    const [row, column] = [cell[0], cell[1]];

    if (board[row] !== undefined && board[row][column] === null) {
      board[row][column] = marker;

      return true;
    }

    return false;
  }

  function isBoardFilled() {
    let isFilled = true;

    for (const row of board) {
      if (isFilled) isFilled = !row.some((cell) => cell === null);
    }

    return isFilled;
  }

  return { getBoard, getMinCellCoord, getMaxCellCoord, mark, isBoardFilled };
})();

const game = (function (playerOne, playerTwo) {
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

  function checkWinner() {
    console.log(gameBoard.getBoard());
    console.log("Player:", playerOne.marks);
    console.log("Computer:", playerTwo.marks);

    let winnerAnnouncement = "";

    if (playerOne.checkForWinningMarks())
      winnerAnnouncement = setWinner(playerOne);
    else if (playerTwo.checkForWinningMarks())
      winnerAnnouncement = setWinner(playerTwo);
    else if (gameBoard.isBoardFilled()) {
      tie();

      winnerAnnouncement = "Game ends in a tie!";
    }

    if (winnerAnnouncement != "") console.log(winnerAnnouncement);
  }

  return { playerOne, playerTwo, tie, isGameTie, setWinner, checkWinner };
})(createPlayer("Saud", "X"), createPlayer("Computer", "O"));

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

      let diagonalDirection = {
        slanting: null,
        previouslySlanting: [],
      };

      for (let j = i + 1; j < marksCount; j++) {
        const markToCheck = {
          mark: marks[j],
          row: marks[j][0],
          column: marks[j][1],
        };

        if (markToCheck.row === row) {
          marksInSameRowCount++;
        } else if (markToCheck.column === column) {
          marksInSameColumnCount++;
        }

        if (shouldCheckForDiagonalAlignment) {
          ({ marksInSameDiagonalCount, diagonalDirection } =
            checkForDiagonalAlignment(
              row,
              column,
              markToCheck,
              diagonalDirection,
              marksInSameDiagonalCount,
            ));
        }
      }

      won =
        marksInSameColumnCount === 2 ||
        marksInSameRowCount === 2 ||
        marksInSameDiagonalCount === 2;
    }

    return won;
  }

  const markCoordsRange = {
    min: gameBoard.getMinCellCoord(),
    max: gameBoard.getMaxCellCoord(),
  };

  function checkForDiagonalAlignment(
    row,
    column,
    markToCheck,
    diagonalDirection,
    marksInSameDiagonalCount,
  ) {
    const [markToCheckRow, markToCheckColumn] = [
      markToCheck.row,
      markToCheck.column,
    ];

    if (row === markCoordsRange.min) {
      if (column === row) {
        if (
          (markToCheckRow === row + 1 && markToCheckColumn === column + 1) ||
          (markToCheckRow === row + 2 && markToCheckColumn === column + 2)
        )
          marksInSameDiagonalCount++;
      } else if (column === markCoordsRange.max) {
        if (
          (markToCheckRow === row + 1 && markToCheckColumn === column - 1) ||
          (markToCheckRow === row + 2 && markToCheckColumn === column - 2)
        )
          marksInSameDiagonalCount++;
      }
    } else if (row === markCoordsRange.max) {
      if (column === row) {
        if (
          (markToCheckRow === row - 1 && markToCheckColumn === column - 1) ||
          (markToCheckRow === row - 2 && markToCheckColumn === column - 2)
        )
          marksInSameDiagonalCount++;
      } else if (column === markCoordsRange.min) {
        if (
          (markToCheckRow === row - 1 && markToCheckColumn === column + 1) ||
          (markToCheckRow === row - 2 && markToCheckColumn === column + 2)
        )
          marksInSameDiagonalCount++;
      }
    } else {
      if (
        (markToCheckRow === row - 1 && markToCheckColumn === column - 1) ||
        (markToCheckRow === row + 1 && markToCheckColumn === column + 1)
      )
        diagonalDirection.slanting = "LEFT";
      else if (
        (markToCheckRow === row - 1 && markToCheckColumn === column + 1) ||
        (markToCheckRow === row + 1 && markToCheckColumn === column - 1)
      )
        diagonalDirection.slanting = "RIGHT";

      const isThereAMarkInThisDirection =
        diagonalDirection.previouslySlanting.includes(
          diagonalDirection.slanting,
        );

      if (
        diagonalDirection.slanting &&
        (isThereAMarkInThisDirection ||
          !diagonalDirection.previouslySlanting.length)
      ) {
        marksInSameDiagonalCount++;
      }
      console.log(getName(), diagonalDirection);

      if (!isThereAMarkInThisDirection && diagonalDirection.slanting)
        diagonalDirection.previouslySlanting.push(diagonalDirection.slanting);

      diagonalDirection.slanting = null;
    }

    return { marksInSameDiagonalCount, diagonalDirection };
  }

  function play(row, column) {
    const cell = [row, column];

    if (!gameBoard.mark(cell, getMarker())) {
      console.log("Cell already taken or out of range! try another one.");
      return;
    }

    recordMark(cell);

    automatedPlay();
    game.checkWinner();
  }

  function automatedPlay() {
    if (gameBoard.isBoardFilled()) return;

    const computer = game.playerTwo;

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

  return { getName, getMarker, recordMark, checkForWinningMarks, play, marks };
}
