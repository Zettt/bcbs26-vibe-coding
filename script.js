const BOARD_SIZE = 10;
const SHIP_TYPES = [
    { id: 'battleship', name: 'Schlachtschiff', size: 5, count: 1 },
    { id: 'cruiser', name: 'Kreuzer', size: 4, count: 2 },
    { id: 'destroyer', name: 'Zerstörer', size: 3, count: 3 },
    { id: 'submarine', name: 'U-Boot', size: 2, count: 4 }
];

// State
let state = {
    isAI: false,
    currentPlayer: 1, // 1 or 2
    phase: 'start', // start, setup, transition, battle, gameover
    nextPhase: null, // Used for transition routing
    boards: {
        1: createEmptyBoard(),
        2: createEmptyBoard()
    },
    // Tracking setup
    setup: {
        orientation: 'horizontal',
        selectedShip: null,
        shipsPlaced: { 1: [], 2: [] } // lists of placed ships
    }
};

// 0: Water, 1: Ship, 2: Miss (Water hit), 3: Hit (Ship hit)
function createEmptyBoard() {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
}

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    transition: document.getElementById('transition-screen'),
    setup: document.getElementById('setup-screen'),
    battle: document.getElementById('battle-screen'),
    gameover: document.getElementById('gameover-screen')
};

// UI Initialization
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-start-pvp').addEventListener('click', () => startGame(false));
    document.getElementById('btn-start-ai').addEventListener('click', () => startGame(true));
    document.getElementById('btn-ready').addEventListener('click', handleTransitionReady);
    document.getElementById('btn-rotate').addEventListener('click', toggleOrientation);
    document.getElementById('btn-finish-setup').addEventListener('click', finishSetup);
    document.getElementById('btn-restart').addEventListener('click', () => location.reload());
});

function showScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenId].classList.add('active');
}

function startGame(vsAI) {
    state.isAI = vsAI;
    state.currentPlayer = 1;
    state.boards = { 1: createEmptyBoard(), 2: createEmptyBoard() };
    state.setup.shipsPlaced = { 1: [], 2: [] };
    initSetupPhase();
}

// --- SETUP PHASE ---
function initSetupPhase() {
    state.phase = 'setup';
    state.setup.orientation = 'horizontal';
    document.getElementById('orientation-label').innerText = 'Horizontal';
    document.getElementById('setup-player-title').innerText = `Spieler ${state.currentPlayer} - Flotte platzieren`;
    document.getElementById('btn-finish-setup').disabled = true;
    
    renderSetupBoard();
    renderFleetSelection();
    showScreen('setup');
}

function renderSetupBoard() {
    const boardEl = document.getElementById('setup-board');
    boardEl.innerHTML = '';
    const board = state.boards[state.currentPlayer];

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[y][x] === 1) cell.classList.add('ship');
            
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Hover effects
            cell.addEventListener('mouseenter', handleSetupHover);
            cell.addEventListener('mouseleave', clearSetupHover);
            cell.addEventListener('click', handleSetupClick);

            boardEl.appendChild(cell);
        }
    }
}

function renderFleetSelection() {
    const container = document.getElementById('fleet-container');
    container.innerHTML = '';
    state.setup.selectedShip = null;

    let shipIdCounter = 0;
    const placedShips = state.setup.shipsPlaced[state.currentPlayer];

    SHIP_TYPES.forEach(type => {
        for (let i = 0; i < type.count; i++) {
            const uniqueId = `${type.id}-${i}`;
            const isPlaced = placedShips.includes(uniqueId);

            const shipEl = document.createElement('div');
            shipEl.classList.add('ship-item');
            if (isPlaced) shipEl.classList.add('placed');
            shipEl.dataset.id = uniqueId;
            shipEl.dataset.size = type.size;

            const nameEl = document.createElement('span');
            nameEl.innerText = type.name;

            const previewEl = document.createElement('div');
            previewEl.classList.add('ship-preview');
            for (let s = 0; s < type.size; s++) {
                const box = document.createElement('div');
                box.classList.add('ship-preview-cell');
                previewEl.appendChild(box);
            }

            shipEl.appendChild(previewEl);
            shipEl.appendChild(nameEl);

            if (!isPlaced) {
                shipEl.addEventListener('click', () => selectShip(shipEl, uniqueId, type.size));
            }

            container.appendChild(shipEl);
        }
    });

    // Auto-select first available
    const firstAvailable = container.querySelector('.ship-item:not(.placed)');
    if (firstAvailable) {
        selectShip(firstAvailable, firstAvailable.dataset.id, parseInt(firstAvailable.dataset.size));
    }
}

function selectShip(element, id, size) {
    document.querySelectorAll('.ship-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    state.setup.selectedShip = { id, size };
}

function toggleOrientation() {
    state.setup.orientation = state.setup.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    document.getElementById('orientation-label').innerText = state.setup.orientation === 'horizontal' ? 'Horizontal' : 'Vertikal';
}

function getShipCoordinates(startX, startY, size, orientation) {
    let coords = [];
    for (let i = 0; i < size; i++) {
        if (orientation === 'horizontal') {
            coords.push({ x: startX + i, y: startY });
        } else {
            coords.push({ x: startX, y: startY + i });
        }
    }
    return coords;
}

function isPlacementValid(coords) {
    const board = state.boards[state.currentPlayer];
    for (let pos of coords) {
        if (pos.x < 0 || pos.x >= BOARD_SIZE || pos.y < 0 || pos.y >= BOARD_SIZE) return false;
        if (board[pos.y][pos.x] === 1) return false; // Overlap
    }
    return true;
}

function handleSetupHover(e) {
    if (!state.setup.selectedShip) return;
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const coords = getShipCoordinates(x, y, state.setup.selectedShip.size, state.setup.orientation);
    
    const valid = isPlacementValid(coords);
    
    coords.forEach(pos => {
        if (pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE) {
            const index = pos.y * BOARD_SIZE + pos.x;
            const cell = document.getElementById('setup-board').children[index];
            if (cell) {
                cell.classList.add(valid ? 'preview-valid' : 'preview-invalid');
            }
        }
    });
}

function clearSetupHover() {
    const cells = document.getElementById('setup-board').children;
    for (let cell of cells) {
        cell.classList.remove('preview-valid', 'preview-invalid');
    }
}

function handleSetupClick(e) {
    if (!state.setup.selectedShip) return;
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const coords = getShipCoordinates(x, y, state.setup.selectedShip.size, state.setup.orientation);
    
    if (isPlacementValid(coords)) {
        // Place ship
        const board = state.boards[state.currentPlayer];
        coords.forEach(pos => {
            board[pos.y][pos.x] = 1;
        });
        
        state.setup.shipsPlaced[state.currentPlayer].push(state.setup.selectedShip.id);
        
        clearSetupHover();
        renderSetupBoard();
        renderFleetSelection();
        checkSetupComplete();
    }
}

function checkSetupComplete() {
    const totalShips = SHIP_TYPES.reduce((acc, type) => acc + type.count, 0);
    if (state.setup.shipsPlaced[state.currentPlayer].length === totalShips) {
        document.getElementById('btn-finish-setup').disabled = false;
        state.setup.selectedShip = null;
    }
}

function finishSetup() {
    if (state.currentPlayer === 1) {
        if (state.isAI) {
            autoPlaceShips(2);
            state.currentPlayer = 1;
            initBattlePhase();
        } else {
            goToTransition(2, 'setup');
        }
    } else {
        goToTransition(1, 'battle');
    }
}

// --- TRANSITION PHASE ---
function goToTransition(nextPlayer, nextPhase) {
    if (state.isAI) {
        state.currentPlayer = nextPlayer;
        if (nextPhase === 'battle') {
            if (nextPlayer === 2) {
                computerTurn();
            } else {
                initBattlePhase();
            }
        }
        return;
    }

    state.phase = 'transition';
    state.currentPlayer = nextPlayer;
    state.nextPhase = nextPhase;
    
    document.getElementById('transition-message').innerText = `Bitte das Gerät an Spieler ${nextPlayer} übergeben.`;
    showScreen('transition');
}

function handleTransitionReady() {
    if (state.nextPhase === 'setup') {
        initSetupPhase();
    } else if (state.nextPhase === 'battle') {
        initBattlePhase();
    }
}

// --- BATTLE PHASE ---
function initBattlePhase() {
    state.phase = 'battle';
    document.getElementById('battle-player-title').innerText = `Zug: Spieler ${state.currentPlayer}`;
    document.getElementById('battle-status').innerText = 'Wähle eine Zielkoordinate auf dem Radarfeld.';
    
    renderBattleBoards();
    showScreen('battle');
}

function renderBattleBoards() {
    const ownBoardEl = document.getElementById('battle-own-board');
    const targetBoardEl = document.getElementById('battle-target-board');
    ownBoardEl.innerHTML = '';
    targetBoardEl.innerHTML = '';

    const opponent = state.currentPlayer === 1 ? 2 : 1;
    const ownBoardState = state.boards[state.currentPlayer];
    const targetBoardState = state.boards[opponent];

    // Render Own Board (Small)
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const val = ownBoardState[y][x];
            
            if (val === 1 || val === 3) cell.classList.add('ship'); // Show ship
            if (val === 2) cell.classList.add('miss');
            if (val === 3) cell.classList.add('hit');
            
            ownBoardEl.appendChild(cell);
        }
    }

    // Render Target Board (Large, Interactive)
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const val = targetBoardState[y][x];
            
            // Only show hits and misses, hide ships (1)
            if (val === 2) cell.classList.add('miss');
            if (val === 3) cell.classList.add('hit');
            
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (val === 0 || val === 1) {
                cell.addEventListener('click', handleFireClick);
            }

            targetBoardEl.appendChild(cell);
        }
    }
}

function handleFireClick(e) {
    if (state.phase !== 'battle') return;
    if (state.isAI && state.currentPlayer === 2) return; // Prevent human click during AI turn
    
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const opponent = state.currentPlayer === 1 ? 2 : 1;
    const targetBoardState = state.boards[opponent];

    let resultMsg = "";
    let hitSuccess = false;
    if (targetBoardState[y][x] === 1) {
        // Hit
        targetBoardState[y][x] = 3;
        resultMsg = "Treffer! Du bist nochmal dran.";
        hitSuccess = true;
    } else if (targetBoardState[y][x] === 0) {
        // Miss
        targetBoardState[y][x] = 2;
        resultMsg = "Wasser.";
    } else {
        return; // Already shot here
    }

    renderBattleBoards();
    document.getElementById('battle-status').innerText = resultMsg;
    
    // Disable further clicks
    state.phase = 'wait'; 

    setTimeout(() => {
        if (checkWin(opponent)) {
            endGame(state.currentPlayer);
        } else {
            if (hitSuccess) {
                // Keep the same player, just go back to battle phase
                state.phase = 'battle';
                document.getElementById('battle-status').innerText = 'Wähle ein weiteres Ziel...';
            } else {
                goToTransition(opponent, 'battle');
            }
        }
    }, 1500);
}

function checkWin(opponentPlayer) {
    const board = state.boards[opponentPlayer];
    // Check if any '1' (intact ship part) remains
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] === 1) return false;
        }
    }
    return true; // No intact ship parts left
}

function endGame(winner) {
    state.phase = 'gameover';
    document.getElementById('winner-title').innerText = `Spieler ${winner} gewinnt!`;
    showScreen('gameover');
}

function autoPlaceShips(player) {
    state.setup.shipsPlaced[player] = [];
    
    SHIP_TYPES.forEach(type => {
        for (let i = 0; i < type.count; i++) {
            let placed = false;
            while (!placed) {
                const x = Math.floor(Math.random() * BOARD_SIZE);
                const y = Math.floor(Math.random() * BOARD_SIZE);
                const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                
                // Get coords without modifying DOM or state
                let coords = [];
                for (let step = 0; step < type.size; step++) {
                    if (orientation === 'horizontal') coords.push({ x: x + step, y: y });
                    else coords.push({ x: x, y: y + step });
                }
                
                // Check validity manually
                let valid = true;
                const board = state.boards[player];
                for (let pos of coords) {
                    if (pos.x < 0 || pos.x >= BOARD_SIZE || pos.y < 0 || pos.y >= BOARD_SIZE) {
                        valid = false;
                        break;
                    }
                    if (board[pos.y][pos.x] === 1) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    coords.forEach(pos => {
                        board[pos.y][pos.x] = 1;
                    });
                    state.setup.shipsPlaced[player].push(`${type.id}-${i}`);
                    placed = true;
                }
            }
        }
    });
}

function computerTurn() {
    state.phase = 'wait';
    document.getElementById('battle-player-title').innerText = `Zug: Computer`;
    document.getElementById('battle-status').innerText = 'Computer überlegt...';
    renderBattleBoards();

    setTimeout(() => {
        const opponent = 1; 
        const targetBoardState = state.boards[opponent];
        
        // Find valid random target
        let validTargets = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (targetBoardState[y][x] === 0 || targetBoardState[y][x] === 1) {
                    validTargets.push({x, y});
                }
            }
        }
        
        if (validTargets.length === 0) return;
        
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        const x = target.x;
        const y = target.y;

        let resultMsg = "";
        let hitSuccess = false;
        
        if (targetBoardState[y][x] === 1) {
            targetBoardState[y][x] = 3;
            resultMsg = "Computer: Treffer!";
            hitSuccess = true;
        } else {
            targetBoardState[y][x] = 2;
            resultMsg = "Computer: Wasser.";
        }

        renderBattleBoards();
        document.getElementById('battle-status').innerText = resultMsg;

        setTimeout(() => {
            if (checkWin(opponent)) {
                endGame(2);
            } else {
                if (hitSuccess) {
                    computerTurn(); // AI shoots again
                } else {
                    goToTransition(1, 'battle');
                }
            }
        }, 1500);

    }, 1500);
}
