// /public/script.js
const socket = new WebSocket('ws://localhost:8080');
let currentPlayer = 'A';
let selectedPiece = null;

socket.addEventListener('open', () => {
    console.log('Connected to the server');
});

socket.addEventListener('message', (event) => {
    const state = JSON.parse(event.data);
    if (state.grid) {
        renderGameBoard(state.grid);
    } else if (state.error) {
        alert(state.error);
    } else if (state.gameOver) {
        alert(`Game Over! Player ${state.winner} wins!`);
    }
});

function renderGameBoard(grid) {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    grid.forEach(row => {
        row.forEach(cell => {
            const div = document.createElement('div');
            div.classList.add('grid-cell');
            div.textContent = cell || '';
            div.addEventListener('click', () => selectPiece(cell));
            if (cell === selectedPiece) {
                div.classList.add('selected');
            }
            gameBoard.appendChild(div);
        });
    });
}

function selectPiece(piece) {
    selectedPiece = piece;
    document.getElementById('selected-piece').textContent = `Selected: ${selectedPiece}`;
}

document.getElementById('move-left').addEventListener('click', () => movePiece('L'));
document.getElementById('move-right').addEventListener('click', () => movePiece('R'));
document.getElementById('move-forward').addEventListener('click', () => movePiece('F'));
document.getElementById('move-backward').addEventListener('click', () => movePiece('B'));

function movePiece(direction) {
    if (!selectedPiece) {
        alert('No piece selected');
        return;
    }
    const message = {
        player: currentPlayer,
        piece: selectedPiece,
        move: direction,
    };
    socket.send(JSON.stringify(message));
}
