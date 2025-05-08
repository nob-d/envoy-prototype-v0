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

const playerZones = {
  1: new Set(),
  2: new Set(),
};

const zoneAdjacency = {
  1: [2, 3],
  2: [1, 4],
  3: [1, 4, 5],
  4: [2, 3, 6],
  5: [3, 6],
  6: [4, 5],
};

function isAdjacentToControlledZone(player, targetZone) {
  const controlled = playerZones[player];
  for (const zone of controlled) {
    if (zoneAdjacency[zone].includes(Number(targetZone))) {
      return true;
    }
  }
  return false;
}

function placeTotem(cell, row, col) {
  // Choose a color if none is set
  let playerColor = playerState[`player${playerState.currentPlayer}Color`];
  if (!playerColor) {
    const chosen = prompt(`Player ${playerState.currentPlayer}, choose your color (red, blue, green):`).trim().toLowerCase();
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

// Record zone ownership
const zone = Number(cell.dataset.zone);
playerZones[playerState.currentPlayer].add(zone);

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
      
      if (!playerColor && isInStartingZone(player, zone)) {
        // First totem — allow placement
        placeTotem(cell, row, col);
      } else if (playerColor && playerZones[player].size === 0) {
        alert(`Player ${player}: Your first totem must go in a starting zone.`);
      } else if (playerColor && isAdjacentToControlledZone(player, zone)) {
        // Legal follow-up placement
        placeTotem(cell, row, col);
      } else {
        alert(`Player ${player}: You can only place totems in zones adjacent to your existing ones.`);
      }
      
    };

    cell.addEventListener('click', handler);
    cell.clickHandler = handler;

    board.appendChild(cell);
  }
}
