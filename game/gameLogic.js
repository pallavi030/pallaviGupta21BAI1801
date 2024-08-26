class Game {
    constructor() {
        this.gridSize = 5;
        this.players = {
            A: ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
            B: ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3'],
        };
        this.grid = this.initializeGrid();
        this.turn = 'A'; // Player A starts
        this.moveHistory = [];
    }

    initializeGrid() {
        const grid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));
        grid[0] = [...this.players.A];
        grid[this.gridSize - 1] = [...this.players.B];
        return grid;
    }

    movePiece(player, piece, direction) {
        // Ensure it's the correct player's turn
        if (player !== this.turn) {
            return { error: `It's Player ${this.turn}'s turn.` };
        }

        // Ensure the piece belongs to the player
        if (!piece.startsWith(player)) {
            return { error: `Invalid piece selection.` };
        }

        const [x, y] = this.findPiece(piece);
        if (!this.isValidMove(player, piece, direction, x, y)) {
            return { error: 'Invalid move' };
        }

        // Perform the move
        this.grid[x][y] = null;
        const [newX, newY] = this.getNewPosition(piece, direction, x, y);

        // Check for opponent's piece at the new position
        if (this.grid[newX][newY]) {
            const opponentPiece = this.grid[newX][newY];
            this.removePiece(opponentPiece);
        }

        // Place the piece at the new position
        this.grid[newX][newY] = piece;

        // Add move to history
        this.moveHistory.push({ player, piece, direction });

        // Switch turn
        this.switchTurn();

        return { grid: this.grid, moveHistory: this.moveHistory, turn: this.turn };
    }

    findPiece(piece) {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === piece) {
                    return [i, j];
                }
            }
        }
        return [null, null]; // Piece not found
    }

    getNewPosition(piece, direction, x, y) {
        const moves = {
            'P': { 'L': [0, -1], 'R': [0, 1], 'F': [-1, 0], 'B': [1, 0] },
            'H1': { 'L': [0, -2], 'R': [0, 2], 'F': [-2, 0], 'B': [2, 0] },
            'H2': {
                'FL': [-2, -2], 'FR': [-2, 2], 'BL': [2, -2], 'BR': [2, 2],
            },
            'H3': { // Assuming H3 logic for 2+1 moves
                'F': [-2, 0], 'B': [2, 0], 'L': [0, -2], 'R': [0, 2],
                'FL': [-1, -2], 'FR': [-1, 2], 'BL': [1, -2], 'BR': [1, 2],
                'LB': [2, -1], 'RB': [2, 1], 'LF': [-2, -1], 'RF': [-2, 1]
            }
        };

        const type = piece.split('-')[1];
        const move = moves[type][direction];

        return [x + move[0], y + move[1]];
    }

    isValidMove(player, piece, direction, x, y) {
        const [newX, newY] = this.getNewPosition(piece, direction, x, y);

        if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) {
            return false; // Out of bounds
        }

        if (this.grid[newX][newY] && this.grid[newX][newY].startsWith(player)) {
            return false; // Friendly fire
        }

        return true;
    }

    removePiece(piece) {
        const [x, y] = this.findPiece(piece);
        if (x !== null && y !== null) {
            this.grid[x][y] = null;
        }
    }

    switchTurn() {
        this.turn = this.turn === 'A' ? 'B' : 'A';
    }

    isGameOver() {
        const remainingA = this.grid.flat().filter((cell) => cell && cell.startsWith('A')).length;
        const remainingB = this.grid.flat().filter((cell) => cell && cell.startsWith('B')).length;
        return remainingA === 0 || remainingB === 0;
    }

    getWinner() {
        const remainingA = this.grid.flat().filter((cell) => cell && cell.startsWith('A')).length;
        const remainingB = this.grid.flat().filter((cell) => cell && cell.startsWith('B')).length;

        if (remainingA > 0 && remainingB === 0) {
            return 'A';
        } else if (remainingB > 0 && remainingA === 0) {
            return 'B';
        } else {
            return null;
        }
    }
}

module.exports = Game;
