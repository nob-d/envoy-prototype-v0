const board = document.getElementById('game-board');

for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 12; col++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    board.appendChild(cell);
  }
}
