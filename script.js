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

  function reset() {
    for (const row of board) {
      row.fill(null);
    }
  }

  return {
    getBoard,
    getMinCellCoord,
    getMaxCellCoord,
    mark,
    isBoardFilled,
    reset,
  };
})();

const game = (function (playerOne, playerTwo) {
  let playerTakingTurn = playerOne,
    computer = null;

  let winner = null,
    isTie = false;

  function tie() {
    isTie = true;
  }

  function isOver() {
    return isTie || winner;
  }

  function setWinner(player) {
    winner = player;

    return `${winner.getName()} won!`;
  }

  function play(row, column) {
    const wasTurnSuccessfullyPlayed = playerTakingTurn.play(row, column);

    console.log(wasTurnSuccessfullyPlayed);

    if (wasTurnSuccessfullyPlayed) {
      displayController.showFeedback(game.checkWinner());

      if (!computer)
        playerTakingTurn =
          playerTakingTurn === playerOne ? playerTwo : playerOne;
      else computer.automatedPlay();

      displayController.showFeedback(game.checkWinner());
    }
  }

  function setComputerPlayer() {
    computer = playerTwo;

    computer.setName("Computer");
  }

  function unsetComputerPlayer() {
    computer = null;

    playerTwo.setName("Player Two");
  }

  function getComputerPlayer() {
    return computer;
  }

  function checkWinner() {
    console.log(gameBoard.getBoard());

    let winnerAnnouncement = "";

    if (playerOne.checkForWinningMarks())
      winnerAnnouncement = setWinner(playerOne);
    else if (playerTwo.checkForWinningMarks())
      winnerAnnouncement = setWinner(playerTwo);
    else if (gameBoard.isBoardFilled()) {
      tie();

      winnerAnnouncement = "Game ends in a tie!";
    }

    return winnerAnnouncement;
  }

  function reset() {
    playerTakingTurn = playerOne;
    winner = null;
    isTie = false;

    gameBoard.reset();

    playerOne.resetMarks();
    if (!computer) playerTwo.resetMarks();
    else computer.resetMarks();
  }

  function toggleOpponent(toggle) {
    displayController.resetBoard();
    reset();

    if (!getComputerPlayer()) setComputerPlayer();
    else unsetComputerPlayer();

    toggle.textContent = toggle.textContent.endsWith("computer")
      ? "Play against a friend"
      : "Play against computer";

    displayController.showFeedback("");
  }

  return {
    play,
    getComputerPlayer,
    isOver,
    checkWinner,
    toggleOpponent,
  };
})(createPlayer("Player One", "X"), createPlayer("Player Two", "O"));

const displayController = (function () {
  const board = gameBoard.getBoard();

  const boardElement = document.querySelector(".game-board"),
    feedbackElement = document.querySelector(".game-feedback");

  function showFeedback(feedback) {
    feedbackElement.textContent = feedback;
  }

  function renderMark(cell, marker) {
    const cellElement = boardElement.querySelector(
      `[data-row="${cell[0]}"][data-column="${cell[1]}"]`,
    );

    cellElement.textContent = marker;
  }

  function resetBoard() {
    for (const cell of boardElement.children) {
      cell.textContent = "";
    }
  }

  function delegateClickEvent(event) {
    const target = event.target;

    const isTargetGameBoardCell = target.closest(".cell"),
      isTargetOpponentToggle = target.closest(".opponent-toggle");

    if (isTargetGameBoardCell) {
      game.play(+target.dataset.row, +target.dataset.column);
    } else if (isTargetOpponentToggle) {
      game.toggleOpponent(target);
    }
  }

  document.addEventListener("click", delegateClickEvent);

  return { showFeedback, renderMark, resetBoard };
})();

function createPlayer(name, marker) {
  const marks = [];

  function resetMarks() {
    marks.splice(0);
  }

  function getName() {
    return name;
  }

  function setName(newName) {
    if (newName && newName != "") name = newName;
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
    if (this === game.getComputerPlayer()) return false;

    if (game.isOver()) {
      displayController.showFeedback("Game is over! refresh to play again.");
      return false;
    }

    const cell = [row, column];

    if (!gameBoard.mark(cell, getMarker())) {
      displayController.showFeedback(
        "Cell already taken or out of range! try another one.",
      );
      return false;
    }

    recordMark(cell);

    displayController.renderMark(cell, getMarker());

    return true;
  }

  function automatedPlay() {
    if (gameBoard.isBoardFilled() || game.isOver()) return;

    let cell, marked;

    const marker = getMarker();

    do {
      cell = [getRandomCellCoord(), getRandomCellCoord()];
      marked = gameBoard.mark(cell, marker);
    } while (!marked);

    recordMark(cell);

    displayController.renderMark(cell, marker);

    function getRandomCellCoord() {
      return Math.floor(Math.random() * (gameBoard.getMaxCellCoord() + 1));
    }
  }

  return {
    getName,
    setName,
    checkForWinningMarks,
    play,
    automatedPlay,
    resetMarks,
  };
}
