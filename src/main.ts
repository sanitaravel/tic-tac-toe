/* ---------- Theme Handling ---------- */
const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement | null;
if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme', themeToggle.checked);
    });
}

/* ---------- Win Overlay Handling ---------- */
const winOverlay = document.getElementById('win-overlay');
if (winOverlay) {
    winOverlay.addEventListener('click', () => {
        winOverlay.style.display = 'none';
    });
}

/* ---------- Game State & Local Storage ---------- */
let gameOver = false;
let currentMove: 'X' | 'O' = 'X';
const tiles = document.querySelectorAll<HTMLButtonElement>('.board button[data-index]');

function updateLocalStorage() {
    const board = Array.from(tiles).map(tile => tile.innerText);
    const state = { board, currentMove, gameOver };
    localStorage.setItem('ticTacToeState', JSON.stringify(state));
}

function updateCurrentMoveDisplay() {
    const moveElement = document.getElementById('current-move');
    if (moveElement) {
        moveElement.innerText = `Current move: ${currentMove}`;
    }
}

/* Restore saved state, if any */
const savedState = localStorage.getItem('ticTacToeState');
if (savedState) {
    try {
        const { board, currentMove: savedCurrentMove, gameOver: savedGameOver } = JSON.parse(savedState);
        gameOver = savedGameOver;
        currentMove = savedCurrentMove;
        board.forEach((value: string, index: number) => {
            tiles[index].innerText = value;
        });
        if (gameOver) {
            tiles.forEach(t => t.disabled = true);
        }
    } catch (e) {
        console.error('Error parsing saved state', e);
    }
}
updateCurrentMoveDisplay();

/* ---------- Overlay Helper Function ---------- */
function showOverlay(message: string) {
    const winOverlay = document.getElementById('win-overlay');
    const winMessage = document.getElementById('win-message');
    if (winOverlay && winMessage) {
        winMessage.innerText = message;
        winOverlay.style.display = 'flex';
    }
    tiles.forEach(t => t.disabled = true);
}

/* ---------- Tile Event Handlers ---------- */
tiles.forEach(tile => {
    tile.addEventListener('mouseenter', () => {
        if (gameOver) return;
        if (!tile.innerText) {
            tile.innerText = currentMove;
            tile.classList.add('preview');
        }
    });
    tile.addEventListener('mouseleave', () => {
        if (gameOver) return;
        if (tile.classList.contains('preview')) {
            tile.innerText = '';
            tile.classList.remove('preview');
        }
    });
    tile.addEventListener('click', () => {
        if (gameOver) return;
        if (!tile.classList.contains('preview')) return;
        
        tile.classList.remove('preview');
        // Commit the move & toggle player.
        currentMove = currentMove === 'X' ? 'O' : 'X';
        updateCurrentMoveDisplay();

        const winner = checkWin();
        if (winner) {
            gameOver = true;
            showOverlay(`Player ${winner} wins!`);
        } else {
            const boardFull = Array.from(tiles).every(t => t.innerText !== '');
            if (boardFull) {
                gameOver = true;
                showOverlay("Tie! No winner!");
            }
        }
        updateLocalStorage();
    });
});

/* ---------- Check Win Function ---------- */
function checkWin(): string | null {
    const winningCombinations = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];
    const board = Array.from(tiles).map(tile => tile.innerText);
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            console.log('Winner:', board[a]);
            return board[a];
        }
    }
    return null;
}

/* ---------- Restart Game Handling ---------- */
const restartBtn = document.getElementById('restart-btn') as HTMLButtonElement | null;
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        gameOver = false;
        currentMove = 'X';
        tiles.forEach(tile => {
            tile.disabled = false;
            tile.innerText = '';
            tile.classList.remove('preview');
        });
        if (winOverlay) {
            winOverlay.style.display = 'none';
        }
        updateLocalStorage();
        updateCurrentMoveDisplay();
    });
}
