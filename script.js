const board = document.getElementById('game-board');

const playerState = {
  currentPlayer: 1,
  player1Color: null,
  player2Color: null,
};

function getZone(row, col) {
  if (row < 4) return col < 4 ? 1 : 2;
  if (row < 8) return col < 4 ? 3 : 4;
  return col < 4 ? 5 : 6;
}

function isInStartingZone(player, zone) {
  if (player === 1) return zone === 5 || zone === 6;
  if (player === 2) return zone === 1 || zone === 2;
  return false;
}

function placeTotem(cell, row, col) {
  // Choose a color if none is set
  let playerColor = playerState[`player${playerState.currentPlayer}Color`];
  if (!playerColor) {
    const chosen = prompt(`Player ${playerState.currentPlayer}, choose your color (red, blue, green):`).toLowerCase();
    if (!["red", "blue", "green"].includes(chosen)) {
      alert("Invalid color. Choose red, blue, or green.");
      return;
    }
    playerState[`player${playerState.currentPlayer}Color`] = chosen;
    playerColor = chosen;
  }

  // Place the totem
  const totem = document.createElement('div');
  totem.classList.add('totem', playerColor);
  cell.appendChild(totem);
  cell.classList.add('occupied');
  cell.removeEventListener('click', cell.clickHandler);

  // Switch turns
  playerState.currentPlayer = playerState.currentPlayer === 1 ? 2 : 1;
}

for (let row = 0; row < 12; row++) {
  for (let col = 0; col < 8; col++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    const zone = getZone(row, col);
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.dataset.zone = zone;

    // Add click handler
    const handler = () => {
      if (cell.classList.contains('occupied')) return;

      const player = playerState.currentPlayer;
      const playerColor = playerState[`player${player}Color`];
      const valid = !playerColor && isInStartingZone(player, zone);

      if (valid || playerColor) {
        placeTotem(cell, row, col);
      } else {
        alert(`Player ${player}: You must place your first totem in your starting zones.`);
      }
    };

    cell.addEventListener('click', handler);
    cell.clickHandler = handler;

    board.appendChild(cell);
  }
}
