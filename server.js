const WebSocket = require('ws');
const Game = require('./game/gameLogic');

const server = new WebSocket.Server({ port: 8080 });

let game = new Game();
let moveHistory = []; // Track move history

server.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        const { type, player, piece, direction } = parsedMessage;

        if (type === 'move') {
            const result = game.movePiece(player, piece, direction);
            if (result.error) {
                ws.send(JSON.stringify({ type: 'error', message: result.error }));
            } else {
                // Track move history
                const moveRecord = `Player ${player} moved ${piece} ${direction}`;
                moveHistory.push(moveRecord);

                // Broadcast updated game state and move history
                broadcast(JSON.stringify({ type: 'update', grid: game.grid, turn: game.turn }));
                broadcast(JSON.stringify({ type: 'moveHistory', move: moveRecord }));

                if (game.isGameOver()) {
                    broadcast(JSON.stringify({ type: 'gameOver', winner: game.getWinner() }));
                    game = new Game(); // Reset the game for a new round
                    moveHistory = []; // Clear move history
                }
            }
        }
    });

    // Send initial game state and move history to the client
    ws.send(JSON.stringify({ type: 'init', grid: game.grid, turn: game.turn }));
    broadcast(JSON.stringify({ type: 'moveHistory', move: 'Game started.' }));
});

function broadcast(data) {
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

console.log('Server is running on ws://localhost:8080');
