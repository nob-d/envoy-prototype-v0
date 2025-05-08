const board = document.getElementById('game-board');

for (let row = 0; row < 12; row++) {
  for (let col = 0; col < 8; col++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    // Assign zone class based on row and column
    let zone = '';
    if (row < 4) {
      if (col < 4) zone = 'zone-1';
      else zone = 'zone-2';
    } else if (row < 8) {
      if (col < 4) zone = 'zone-3';
      else zone = 'zone-4';
    } else {
      if (col < 4) zone = 'zone-5';
      else zone = 'zone-6';
    }

    cell.classList.add(zone);
    board.appendChild(cell);
  }
}
