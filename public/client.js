const ws = new WebSocket('ws://localhost:8080');

// Store move history
let moveHistory = '';

ws.onmessage = (message) => {
    const data = JSON.parse(message.data);

    if (data.type === 'init' || data.type === 'update') {
        renderBoard(data.grid);
        document.getElementById('turn').textContent = `Current Player: ${data.turn}`;
    } else if (data.type === 'error') {
        alert(data.message);
    } else if (data.type === 'gameOver') {
        document.getElementById('status').textContent = `Game Over! Winner: Player ${data.winner}`;
    } else if (data.type === 'moveHistory') {
        moveHistory += `${data.move}\n`;
        document.getElementById('moveHistory').textContent = `Move History:\n${moveHistory}`;
    }
};

function renderBoard(grid) {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (grid[i][j]) {
                cell.textContent = grid[i][j];
                cell.classList.add(grid[i][j][0]); // Add class A or B based on the player
                cell.addEventListener('click', () => handleMove(grid[i][j]));
            }
            boardElement.appendChild(cell);
        }
    }
}

function handleMove(piece) {
    const directions = {
        'P': ['L', 'R', 'F', 'B'],
        'H1': ['L', 'R', 'F', 'B'],
        'H2': ['FL', 'FR', 'BL', 'BR'],
        'H3': ['L', 'R', 'F', 'B', 'FL', 'FR', 'BL', 'BR']
    };

    const pieceType = piece.split('-')[1];
    const validDirections = directions[pieceType];
    let direction = prompt(`Enter move direction (${validDirections.join(', ')}):`);

    while (!validDirections.includes(direction)) {
        direction = prompt(`Invalid direction. Enter move direction (${validDirections.join(', ')}):`);
    }

    const player = piece[0];
    ws.send(JSON.stringify({ type: 'move', player, piece, direction }));
}
