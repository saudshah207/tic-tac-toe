function setUpTicTacToe() {
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

  const computer = (function () {
    const player = createPlayer("Computer", "O");

    player.play = function () {
      let cell, marked;

      const marker = player.getMarker();

      do {
        cell = [getRandomCellCoord(), getRandomCellCoord()];
        marked = gameBoard.mark(cell, marker);
      } while (!marked);

      player.recordMark(cell);

      displayController.renderMark(cell, marker);

      return true;

      function getRandomCellCoord() {
        return Math.floor(Math.random() * (gameBoard.getMaxCellCoord() + 1));
      }
    };

    return player;
  })();

  const game = (function (playerOne, playerTwo) {
    let playerTakingTurn = playerOne;

    let isPlayingAgainstComputer = true,
      isRoundComplete = false;

    const humanOpponent = createPlayer("Player Two", "O");

    let winner = null,
      isTie = false;

    function isOver() {
      return isTie || winner;
    }

    function setWinner(player) {
      winner = player;

      return `${winner.getName()} (${winner.getMarker()}) won!`;
    }

    function play(row, column) {
      const isPlayerTakingTurnPlayerOne = playerTakingTurn === playerOne;

      if (isOver()) {
        if (isPlayerTakingTurnPlayerOne)
          displayController.showFeedback(
            "Game is over! restart to play again.",
          );
        else playerTakingTurn = playerOne;

        return;
      }

      const wasTurnSuccessfullyPlayed = playerTakingTurn.play(row, column);

      if (isPlayerTakingTurnPlayerOne) isRoundComplete = false;

      if (wasTurnSuccessfullyPlayed) {
        displayController.showFeedback(game.checkWinner());

        playerTakingTurn = isPlayerTakingTurnPlayerOne ? playerTwo : playerOne;

        if (isPlayingAgainstComputer && !isRoundComplete) {
          isRoundComplete = true;

          play();
        }
      }
    }

    function playAgainstComputer() {
      playerTwo = computer;
    }

    function playAgainstHuman() {
      playerTwo = humanOpponent;
    }

    function checkWinner() {
      let winnerAnnouncement = "";

      if (playerOne.checkForWinningMarks())
        winnerAnnouncement = setWinner(playerOne);
      else if (playerTwo.checkForWinningMarks())
        winnerAnnouncement = setWinner(playerTwo);
      else if (gameBoard.isBoardFilled()) {
        isTie = true;

        winnerAnnouncement = "Game ends in a tie!";
      }

      return winnerAnnouncement;
    }

    function reset(feedback = "") {
      playerTakingTurn = playerOne;
      winner = null;
      isTie = false;

      gameBoard.reset();

      playerOne.resetMarks();
      playerTwo.resetMarks();

      displayController.resetBoard();

      displayController.showFeedback(feedback);
    }

    function toggleOpponent(toggle) {
      if (!isPlayingAgainstComputer) {
        playAgainstComputer();

        displayController.updatePlayerNamesHtml(
          playerOne.getName(),
          playerTwo.getName(),
        );
      } else {
        playAgainstHuman();

        displayController.updatePlayerNamesHtml(
          playerOne.getName(),
          playerTwo.getName(),
          true,
        );
      }

      isPlayingAgainstComputer = !isPlayingAgainstComputer;

      toggle.textContent = toggle.textContent.endsWith("computer")
        ? "Play against a friend"
        : "Play against computer";

      reset();
    }

    function updatePlayerName(player, name) {
      player = player === "one" ? playerOne : playerTwo;

      player.setName(name);
    }

    return {
      play,
      checkWinner,
      reset,
      toggleOpponent,
      updatePlayerName,
    };
  })(createPlayer("Player One", "X"), computer);

  const displayController = (function () {
    const board = gameBoard.getBoard();

    const boardElement = document.querySelector(".game-board"),
      feedbackElement = document.querySelector(".game-feedback");

    const againstFriendPlayerNamesHtml = buildPlayerNamesHtml(true),
      againstComputerPlayerNamesHtml = buildPlayerNamesHtml();

    function buildPlayerNamesHtml(isPlayingAgainstFriend = false) {
      const wrapper = document.createElement("div"),
        playerOneNameInput = document.createElement("input"),
        vsElement = document.createElement("span"),
        playerTwoNameElement = isPlayingAgainstFriend
          ? document.createElement("input")
          : document.createElement("span");

      wrapper.classList.add("player-names", "flex", "flex-wrap");
      vsElement.classList.add("vs");
      playerOneNameInput.classList.add("player-name", "player-name-input");
      if (isPlayingAgainstFriend) {
        playerTwoNameElement.classList.add("player-name", "player-name-input");
      } else playerTwoNameElement.classList.add("player-name");

      playerOneNameInput.setAttribute("data-player", "one");
      playerTwoNameElement.setAttribute("data-player", "two");

      vsElement.textContent = "vs";

      wrapper.append(playerOneNameInput, vsElement, playerTwoNameElement);

      return wrapper;
    }

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

    function updatePlayerNamesHtml(
      playerOneName,
      playerTwoName,
      isPlayingAgainstFriend = false,
    ) {
      const previousHtml = document.querySelector(".player-names");
      previousHtml.remove();

      let html = againstComputerPlayerNamesHtml;

      let playerTwoNameElement = html.querySelector("[data-player='two']");
      playerTwoNameElement.textContent = playerTwoName;

      if (isPlayingAgainstFriend) {
        html = againstFriendPlayerNamesHtml;

        playerTwoNameElement = html.querySelector("[data-player='two']");
        playerTwoNameElement.value = playerTwoName;
      }

      const playerOneNameElement = html.querySelector("[data-player='one']");

      playerOneNameElement.value = playerOneName;

      boardElement.insertAdjacentElement("afterend", html);
    }

    function delegateClickEvent(event) {
      const target = event.target;

      const isTargetGameBoardCell = target.closest(".cell"),
        isTargetRestartButton = target.closest(".restart"),
        isTargetOpponentToggle = target.closest(".opponent-toggle");

      if (isTargetGameBoardCell) {
        game.play(+target.dataset.row, +target.dataset.column);
      } else if (isTargetRestartButton) {
        game.reset();
      } else if (isTargetOpponentToggle) {
        game.toggleOpponent(target);
      }
    }

    document.addEventListener("click", delegateClickEvent);

    function changePlayerNames(event) {
      const target = event.target;

      const isTargetPlayerNameInput = target.closest(
        ".player-name-input[data-player]",
      );

      if (isTargetPlayerNameInput)
        game.updatePlayerName(target.dataset.player, target.value);
    }

    document.addEventListener("change", changePlayerNames);

    return { showFeedback, renderMark, resetBoard, updatePlayerNamesHtml };
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

    return {
      getName,
      setName,
      checkForWinningMarks,
      getMarker,
      recordMark,
      play,
      resetMarks,
    };
  }
}

setUpTicTacToe();