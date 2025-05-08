const board = document.getElementById('game-board');

const playerState = {
  currentPlayer: 1,
  player1Color: null,
  player2Color: null,
};

const cellData = []; // to track totems and envoys

// Default envoy symbol by color
const envoySymbols = {
  red: "⚔️",
  blue: "⚡",
  green: "🐍",
};

// Envoy Data
envoyData = {
  "red": [
    {
      "name": "Red - Rare Infantry",
      "rarity": "rare",
      "role": "infantry",
      "movement": [[0, -2], [0, -1], [0, 1], [0, 2]]
    },
    {
      "name": "Red - Uncommon Infantry",
      "rarity": "uncommon",
      "role": "infantry",
      "movement": [[-1, -1], [0, -1], [1, -1]]
    },
    {
      "name": "Red - Uncommon Artillery",
      "rarity": "uncommon",
      "role": "artillery",
      "movement": [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]]
    },
    {
      "name": "Red - Common Infantry 1",
      "rarity": "common",
      "role": "infantry",
      "movement": [[0, -2], [0, -1]]
    },
    {
      "name": "Red - Common Ranger",
      "rarity": "common",
      "role": "ranger",
      "movement": [[-1, 0], [0, 0], [1, 0]]
    },
    {
      "name": "Red - Common Artillery",
      "rarity": "common",
      "role": "artillery",
      "movement": [[-2, 0], [-1, 0], [1, 0], [2, 0]]
    }
  ],
  "green": [
    {
      "name": "Green - Rare Ranger",
      "rarity": "rare",
      "role": "ranger",
      "movement": [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
    },
    {
      "name": "Green - Uncommon Ranger",
      "rarity": "uncommon",
      "role": "ranger",
      "movement": [[-1, -2], [-1, 2], [1, -2], [1, 2]]
    },
    {
      "name": "Green - Uncommon Infantry",
      "rarity": "uncommon",
      "role": "infantry",
      "movement": [[-2, -1], [-1, 0], [1, 0], [2, -1]]
    },
    {
      "name": "Green - Common Ranger",
      "rarity": "common",
      "role": "ranger",
      "movement": [[-1, -2], [0, 2], [2, -2]]
    },
    {
      "name": "Green - Common Infantry",
      "rarity": "common",
      "role": "infantry",
      "movement": [[-1, 0], [1, 0]]
    },
    {
      "name": "Green - Common Artillery",
      "rarity": "common",
      "role": "artillery",
      "movement": [[-2, 0], [0, -2], [0, 2], [2, 0]]
    }
  ],
  "blue": [
    {
      "name": "Blue - Rare Artillery",
      "rarity": "rare",
      "role": "artillery",
      "movement": [[-2, -1], [-1, -1], [0, -2], [0, -1], [1, -1], [2, -1]]
    },
    {
      "name": "Blue - Uncommon Artillery",
      "rarity": "uncommon",
      "role": "artillery",
      "movement": [[-2, -2], [-2, -1], [-2, 0], [-1, -2], [-1, -1], [0, -2], [1, 1]]
    },
    {
      "name": "Blue - Uncommon Ranger",
      "rarity": "uncommon",
      "role": "ranger",
      "movement": [[-1, 1], [-1, 2], [1, -1], [1, 0]]
    },
    {
      "name": "Blue - Common Infantry",
      "rarity": "common",
      "role": "infantry",
      "movement": [[-1, -1], [1, -1]]
    },
    {
      "name": "Blue - Common Ranger",
      "rarity": "common",
      "role": "ranger",
      "movement": [[-1, 2], [0, 0], [1, -1]]
    },
    {
      "name": "Blue - Common Artillery",
      "rarity": "common",
      "role": "artillery",
      "movement": [[-2, 2], [-1, 1], [1, -1], [2, -2]]
    }
  ]
}

// Playtest Roster

const playerRosters = {
  red: {
    "Red - Rare Infantry": 1,
    "Red - Uncommon Infantry": 1,
    "Red - Uncommon Artillery": 1,
    "Red - Common Infantry 1": 3,
    "Red - Common Ranger": 2,
    "Red - Common Artillery": 2
  },
  green: {
    "Green - Rare Ranger": 1,
    "Green - Uncommon Ranger": 1,
    "Green - Uncommon Infantry": 1,
    "Green - Common Ranger": 3,
    "Green - Common Infantry": 2,
    "Green - Common Artillery": 2
  },
  blue: {
    "Blue - Rare Artillery": 1,
    "Blue - Uncommon Artillery": 1,
    "Blue - Uncommon Ranger": 1,
    "Blue - Common Infantry": 3,
    "Blue - Common Ranger": 2,
    "Blue - Common Artillery": 2
  }
};

let selectedEnvoy = null;
let summonTarget = null;
let highlightedCells = [];

function updateStatus() {
  const player = playerState.currentPlayer;
  const color = playerState[`player${player}Color`] || "?";
  document.getElementById("status").textContent = `Player ${player}'s turn (${color})`;
}

function isAdjacentToFriendlyTotem(row, col, playerColor) {
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
  ];
  for (let [dx, dy] of directions) {
    const r = row + dx;
    const c = col + dy;
    const neighbor = cellData.find(cell => cell.row == r && cell.col == c);
    if (neighbor && neighbor.contents === "totem" && neighbor.color === playerColor) {
      return true;
    }
  }
  return false;
}

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
    updateStatus();
    updateZoneControlVisuals();
  }

  // Place the totem
  const totem = document.createElement('div');
  totem.classList.add('totem', playerColor);
  cell.appendChild(totem);
  cell.classList.add('occupied');
  cell.removeEventListener('click', cell.clickHandler);

  // Update cellData for this cell
  const data = cellData.find(c => c.row === row && c.col === col);
  if (data) {
    data.contents = "totem";
    data.color = playerColor;
  }

  // Record zone ownership
  const zone = Number(cell.dataset.zone);
  playerZones[playerState.currentPlayer].add(zone);

  // Switch turns
  playerState.currentPlayer = playerState.currentPlayer === 1 ? 2 : 1;
}

// Count summoned envoys of each type
function countPlayerSummons(color) {
  const roster = {};
  for (let c of cellData) {
    if (c.contents === "envoy" && c.color === color) {
      const key = c.name;
      roster[key] = (roster[key] || 0) + 1;
    }
  }
  return roster;
}

function openSummonMenu(row, col) {
  const player = playerState.currentPlayer;
  const color = playerState[`player${player}Color`];
  const menu = document.getElementById("summon-menu");
  const options = document.getElementById("summon-options");

  options.innerHTML = "";
  summonTarget = { row, col };

  const used = countPlayerSummons(color);
  const limit = playerRosters[color];

  envoyData[color].forEach((envoy, index) => {
    const count = used[envoy.name] || 0;
    const allowed = limit[envoy.name] || 0;
    const button = document.createElement("button");
    button.textContent = `${envoy.name} (${envoy.rarity}, ${envoy.role})`;
    button.disabled = count >= allowed;
    if (!button.disabled) {
      button.onclick = () => {
        summonEnvoy(envoy, row, col);
        menu.style.display = "none";
        summonTarget = null;
      };
    } else {
      button.style.opacity = 0.5;
      button.title = "No more of this envoy available.";
    }
    options.appendChild(button);
  });

  menu.style.display = "block";
}

function summonEnvoy(envoyData, row, col) {
  const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
  const playerColor = playerState[`player${playerState.currentPlayer}Color`];

  const span = document.createElement('span');
  span.textContent = envoySymbols[playerColor];
  cell.appendChild(span);
  cell.classList.add('occupied');
  cell.removeEventListener('click', cell.clickHandler);

  // Create the envoy object and include row/col directly
  const newEnvoy = {
    row,
    col,
    zone: getZone(row, col),
    contents: "envoy",
    color: playerColor,
    type: envoyData.role,
    rarity: envoyData.rarity,
    movement: envoyData.movement,
    name: envoyData.name
  };

  cellData.push(newEnvoy); // Store it in cellData

  endTurn();
}

function updateZoneControlVisuals() {
  const zones = [1, 2, 3, 4, 5, 6];
  zones.forEach(zone => {
    const zoneCells = document.querySelectorAll(`.cell[data-zone='${zone}']`);
    const playersWithTotem = [];

    for (let player = 1; player <= 2; player++) {
      const color = playerState[`player${player}Color`];
      const hasTotem = cellData.some(c => c.zone == zone && c.contents === "totem" && c.color === color);
      if (hasTotem) playersWithTotem.push(color);
    }

    // Remove old zone classes
    zoneCells.forEach(cell => {
      cell.classList.remove("zone-red", "zone-blue", "zone-green",
                            "zone-contested-red", "zone-contested-blue", "zone-contested-green");
    });

    // Apply new styles
    if (playersWithTotem.length === 1) {
      zoneCells.forEach(cell => cell.classList.add(`zone-${playersWithTotem[0]}`));
    } else if (playersWithTotem.length === 2) {
      zoneCells.forEach(cell => {
        cell.classList.add(`zone-contested-${playersWithTotem[0]}`);
        cell.classList.add(`zone-contested-${playersWithTotem[1]}`);
      });
    }
  });
}


function buildBoard() {
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
        const player = playerState.currentPlayer;
        const playerColor = playerState[`player${player}Color`];
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const zone = Number(cell.dataset.zone);

        // Click a move or attack target
        if (selectedEnvoy) {
          const target = cellData.find(c => c.row === row && c.col === col);
          const zone = Number(cell.dataset.zone);
          const playerColor = selectedEnvoy.color;
          const isEnemy = target && target.color !== playerColor;
          const totemInZone = cellData.some(c => c.contents === "totem" && c.zone === zone && c.color === playerColor);
        
          // Infantry
          if (selectedEnvoy.type === "infantry") {
            if (!target) {
              moveEnvoyTo(selectedEnvoy, row, col);
            } else if (isEnemy && target.type !== "artillery") {
              destroyAt(row, col);
              moveEnvoyTo(selectedEnvoy, row, col);
            } else {
              alert("Infantry cannot attack artillery.");
            }
            endTurn();
          }
        
          // Ranger
          else if (selectedEnvoy.type === "ranger") {
            if (!target) {
              moveEnvoyTo(selectedEnvoy, row, col); // move
            } else if (isEnemy && target.type !== "artillery") {
              destroyAt(row, col); // ranged attack
            } else {
              alert("Rangers cannot attack artillery.");
            }
            endTurn();
          }
        
          // Artillery
          else if (selectedEnvoy.type === "artillery") {
            if (!totemInZone) {
              alert("Artillery cannot fire without a matching Totem in this zone.");
            } else if (isEnemy && target.type === "artillery") {
              destroyAt(row, col);
              endTurn();
            } else {
              alert("Artillery can only destroy other artillery.");
            }
          }
        
          clearHighlights();
          selectedEnvoy = null;
          return;
        }
        
        // Select your own envoy to move/attack
        const selected = cellData.find(c => c.row === row && c.col === col);
        if (selected && selected.contents === "envoy" && selected.color === playerColor) {
          clearHighlights();
          selectedEnvoy = selected;
          highlightOptions(selected);
          return;
        }

        // Prevent placing on occupied squares
        if (cell.classList.contains('occupied')) return;

        // First totem must be in starting zone
        if (!playerColor && isInStartingZone(player, zone)) {
          placeTotem(cell, row, col);
          return;
        }

        // First totem placement enforcement
        if (playerColor && playerZones[player].size === 0) {
          alert(`Player ${player}: Your first totem must go in a starting zone.`);
          return;
        }

        // Choose between totem and envoy
        const action = prompt(`Player ${player}, type "totem" to place a totem or "envoy" to summon:`).toLowerCase();

        if (action === "totem") {
          if (isAdjacentToControlledZone(player, zone)) {
            placeTotem(cell, row, col);
          } else {
            alert("Totem must be placed in an adjacent zone.");
          }

        } else if (action === "envoy") {
          if (!isAdjacentToFriendlyTotem(row, col, playerColor)) {
            alert("Envoy must be summoned adjacent to a friendly Totem.");
            return;
          }

          openSummonMenu(row, col);

        } else {
          alert("Invalid action. Type 'totem' or 'envoy'.");
        }

        updateStatus();
      };

      cell.addEventListener('click', handler);
      cell.clickHandler = handler;

      cell.addEventListener('mouseenter', () => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const player = playerState.currentPlayer;
        const playerColor = playerState[`player${player}Color`];
      
        const hovered = cellData.find(c => c.row === row && c.col === col);
        if (hovered && hovered.contents === "envoy" && hovered.color === playerColor) {
          highlightOptions(hovered);
        }
      });
      
      cell.addEventListener('mouseleave', () => {
        clearHighlights();
      });      

      board.appendChild(cell);

      cellData.push({
        row,
        col,
        zone,
        contents: null,
        color: null
      });
    }
  }
}

function highlightOptions(envoy) {
  const pattern = envoy.movement;
  const colorClass = `highlight-${envoy.color}`;

  for (let [dx, dy] of pattern) {
    const r = envoy.row + dy;
    const c = envoy.col + dx;
    if (r >= 0 && r < 12 && c >= 0 && c < 8) {
      const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
      const target = cellData.find(cd => cd.row === r && cd.col === c);

      // Attack targets
      if (target && target.contents === "envoy" && target.color !== envoy.color) {
        if (envoy.type === "artillery" || envoy.type === "ranger") {
          cell.classList.add("attack-option", colorClass);
          highlightedCells.push(cell);
        }
        if (envoy.type === "infantry") {
          cell.classList.add("move-option", colorClass);
          highlightedCells.push(cell);
        }
      }
      // Move targets
      if ((!target || !target.contents) && envoy.type !== "artillery") {
        cell.classList.add("move-option", colorClass);
        highlightedCells.push(cell);
      }
    }
  }
}

function clearHighlights() {
  for (let cell of highlightedCells) {
    cell.classList.remove('move-option', 'attack-option');
  }
  highlightedCells = [];
}

function moveEnvoyTo(envoy, newRow, newCol) {
  const fromCell = document.querySelector(`.cell[data-row='${envoy.row}'][data-col='${envoy.col}']`);
  const toCell = document.querySelector(`.cell[data-row='${newRow}'][data-col='${newCol}']`);

  // Clear old cell
  fromCell.innerHTML = "";
  fromCell.classList.remove('occupied');

  // Move to new cell
  const symbol = document.createElement('span');
  symbol.textContent = envoySymbols[envoy.color];
  toCell.appendChild(symbol);
  toCell.classList.add('occupied');

  // Update envoy tracking
  envoy.row = newRow;
  envoy.col = newCol;
}

function destroyAt(row, col) {
  const index = cellData.findIndex(c => c.row === row && c.col === col && c.contents === "envoy");
  if (index !== -1) {
    cellData.splice(index, 1);
    const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    cell.innerHTML = "";
    cell.classList.remove('occupied');
  }
}

function endTurn() {
  playerState.currentPlayer = playerState.currentPlayer === 1 ? 2 : 1;
  updateStatus();
  checkVictory(); // <- ADD THIS
}

function checkVictory() {
  const p1Zones = getControlledZones(1);
  const p2Zones = getControlledZones(2);

  const p1Totems = countTotems(1);
  const p2Totems = countTotems(2);

  if (p1Totems >= 4 && p1Zones.length >= 3) {
    document.getElementById("victory").textContent = "Player 1 wins!";
    disableBoard();
  } else if (p2Totems >= 4 && p2Zones.length >= 3) {
    document.getElementById("victory").textContent = "Player 2 wins!";
    disableBoard();
  }
}

function getControlledZones(player) {
  const opponent = player === 1 ? 2 : 1;
  const controlled = [];

  for (let z = 1; z <= 6; z++) {
    const playerHasTotem = Array.from(cellData).some(c => c.zone == z && c.contents === "totem" && c.color === playerState[`player${player}Color`]);
    const opponentHasTotem = Array.from(cellData).some(c => c.zone == z && c.contents === "totem" && c.color === playerState[`player${opponent}Color`]);
    if (playerHasTotem && !opponentHasTotem) {
      controlled.push(z);
    }
  }

  return controlled;
}

function countTotems(player) {
  return cellData.filter(c => c.contents === "totem" && c.color === playerState[`player${player}Color`]).length;
}

function disableBoard() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.removeEventListener('click', cell.clickHandler);
    cell.style.cursor = 'not-allowed';
  });

  // Show "Play Again" button
  document.getElementById("play-again").style.display = "inline-block";
}

document.getElementById("play-again").addEventListener("click", () => {
  // Reset global state
  playerState.currentPlayer = 1;
  playerState.player1Color = null;
  playerState.player2Color = null;
  selectedEnvoy = null;
  highlightedCells = [];
  cellData.length = 0;
  playerZones[1].clear();
  playerZones[2].clear();
  updateZoneControlVisuals();

  // Clear board visually
  const board = document.getElementById("game-board");
  board.innerHTML = "";

  // Hide victory message & button
  document.getElementById("victory").textContent = "";
  document.getElementById("play-again").style.display = "none";

  // Rebuild grid
  buildBoard();
  updateStatus();
});


buildBoard();
updateStatus();