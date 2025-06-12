// Add these at the top of script.js
const MAP_ROWS = 10;
const MAP_COLS = 10;

// Add near the top with other constants
const UNIT_TYPES = {
    INFANTRY: { name: "پیاده", attack: 5, defense: 3, maxHp: 10, movement: 3, symbol: "Inf" },
    TANK: { name: "تانک", attack: 8, defense: 7, maxHp: 15, movement: 2, symbol: "Tnk" }
};

const PLAYER_IRAN = "Iran";
const PLAYER_USA = "USA";

// Add these global variables at the top of script.js
let currentPlayer = PLAYER_IRAN;
let selectedUnit = null; // Will store the currently selected unit object
let gamePhase = "unitSelection"; // "unitSelection", "unitMovement", "unitAttack"

// Ensure existing global variables like MAP_ROWS, MAP_COLS, gameBoardElement, etc., are present.
// Ensure UNIT_TYPES, PLAYER_IRAN, PLAYER_USA, units, nextUnitId, IRAN_CAPITAL, USA_CAPITAL are defined.

// Add this global variable at the top of script.js
const messageLogElement = document.getElementById('message-log');
const MAX_LOG_MESSAGES = 10; // Max messages to keep in log

// Function to add a message to the game log
function logMessage(message) {
    const listItem = document.createElement('li');
    listItem.textContent = message;
    messageLogElement.prepend(listItem); // Add new messages to the top

    // Keep the log from getting too long
    while (messageLogElement.children.length > MAX_LOG_MESSAGES) {
        messageLogElement.removeChild(messageLogElement.lastChild);
    }
    console.log(`LOG: ${message}`); // Keep console logging as well for debugging
}

// --- Modify existing functions to use logMessage ---

// Example in switchTurn:
let units = []; // Array to store all active unit objects
let nextUnitId = 0;

// Add these variables near mapData and capitals
// Capital positions (ensure these are defined, from previous step)
// const IRAN_CAPITAL = { row: Math.floor(MAP_ROWS / 2), col: 1 };
// const USA_CAPITAL = { row: Math.floor(MAP_ROWS / 2), col: MAP_COLS - 2 };


// --- Helper Functions ---
function getUnitAt(row, col) {
    return units.find(u => u.row === row && u.col === col);
}

function getDistance(unit, targetRow, targetCol) {
    return Math.abs(unit.row - targetRow) + Math.abs(unit.col - targetCol); // Manhattan distance
}

// --- Turn Management ---
// Example in switchTurn:
function switchTurn() {
    currentPlayer = (currentPlayer === PLAYER_IRAN) ? PLAYER_USA : PLAYER_IRAN;
    const currentTurnText = `نوبت ${currentPlayer === PLAYER_IRAN ? 'ایران' : 'آمریکا'}`;
    turnInfoElement.textContent = currentTurnText;
    logMessage(`--- ${currentTurnText} ---`); // Log turn change
    selectedUnit = null;
    gamePhase = "unitSelection";
    updateSelectedUnitInfo();

    units.forEach(unit => {
        if (unit.owner === currentPlayer) {
            unit.movedThisTurn = false;
            unit.attackedThisTurn = false;
        }
    });
    checkForWin();
    renderMap(); // Moved renderMap here to ensure highlights are cleared AFTER turn switch logic
}

// --- Unit Selection ---
function selectUnit(unit) {
    if (unit && unit.owner === currentPlayer) {
        selectedUnit = unit;
        gamePhase = "unitMovement"; // Or "unitAttack" if preferred to show options first
        console.log(`Unit selected: ${selectedUnit.type.name} at (${selectedUnit.row}, ${selectedUnit.col})`);
    } else {
        selectedUnit = null;
        gamePhase = "unitSelection";
    }
    updateSelectedUnitInfo();
}

function updateSelectedUnitInfo() {
    if (selectedUnit) {
        selectedUnitInfoElement.textContent = `واحد انتخاب شده: ${selectedUnit.type.name} (${selectedUnit.owner}) HP: ${selectedUnit.hp}/${selectedUnit.type.maxHp} | حرکت: ${selectedUnit.movedThisTurn} | حمله: ${selectedUnit.attackedThisTurn}`;
    } else {
        selectedUnitInfoElement.textContent = "واحد انتخاب شده: -";
    }
}

// --- Movement Logic ---
// Example in moveUnit (for invalid move):
function canMoveTo(unit, targetRow, targetCol) {
    if (unit.movedThisTurn) return false;
    const distance = getDistance(unit, targetRow, targetCol);
    if (distance === 0 || distance > unit.type.movement) return false;
    if (targetRow < 0 || targetRow >= MAP_ROWS || targetCol < 0 || targetCol >= MAP_COLS) return false; // Off map
    const targetCellUnit = getUnitAt(targetRow, targetCol);
    if (targetCellUnit && targetCellUnit.owner === unit.owner) return false; // Cannot move to friendly occupied cell
    // Allow moving into enemy occupied cell for attack, or empty cell
    return true;
}

function moveUnit(unit, targetRow, targetCol) {
    if (!canMoveTo(unit, targetRow, targetCol)) {
        logMessage("حرکت نامعتبر است."); // Log invalid move
        return false;
    }

    const enemyInCell = getUnitAt(targetRow, targetCol);
    if (enemyInCell && enemyInCell.owner !== unit.owner) {
        logMessage("سلول توسط دشمن اشغال شده. ابتدا باید حمله کنید."); // Log cell occupied by enemy
        return false;
    }

    const prevPos = {row: unit.row, col: unit.col}; // Store previous position for logging
    unit.row = targetRow;
    unit.col = targetCol;
    unit.movedThisTurn = true;
    logMessage(`${unit.type.name} ${unit.owner} از (${prevPos.row},${prevPos.col}) به (${targetRow},${targetCol}) حرکت کرد.`);

    renderMap();
    updateSelectedUnitInfo();
    checkForWin();
    // After move, deselect or allow further action based on rules
    selectUnit(null); // Deselect after move for now
    return true;
}

// --- Combat Logic ---
// Example in attackUnit:
function canAttack(attacker, defender) {
    if (!attacker || !defender || attacker.attackedThisTurn || attacker.owner === defender.owner) return false;
    const distance = getDistance(attacker, defender.row, defender.col);
    // Basic melee attack: distance of 1. Can be expanded for ranged units.
    return distance === 1;
}

function attackUnit(attacker, defender) {
    if (!canAttack(attacker, defender)) {
        logMessage("امکان حمله به این هدف وجود ندارد.");
        return false;
    }

    logMessage(`${attacker.type.name} ${attacker.owner} به ${defender.type.name} ${defender.owner} حمله می‌کند.`);

    let damage = Math.max(1, attacker.type.attack - defender.type.defense);
    defender.hp -= damage;
    logMessage(`${defender.type.name} ${defender.owner} ${damage} آسیب دید. HP باقی‌مانده: ${defender.hp}`);

    attacker.attackedThisTurn = true;
    attacker.movedThisTurn = true;

    if (defender.hp <= 0) {
        logMessage(`${defender.type.name} ${defender.owner} نابود شد!`);
        units = units.filter(u => u.id !== defender.id);
    }

    renderMap();
    updateSelectedUnitInfo();
    checkForWin();
    // After attack, deselect or allow further action
    selectUnit(null); // Deselect after attack for now
    return true;
}

// --- Win Condition ---
// In checkForWin, replace alert with logMessage for the winner announcement,
// but keep the game disabling logic. The alert is quite intrusive.
function checkForWin() {
    let winner = null;
    // Check if Iran's capital is occupied by USA
    const usaUnitOnIranCapital = units.find(u => u.owner === PLAYER_USA && u.row === IRAN_CAPITAL.row && u.col === IRAN_CAPITAL.col);
    if (usaUnitOnIranCapital) {
        winner = PLAYER_USA;
    }

    // Check if USA's capital is occupied by Iran
    const iranUnitOnUsaCapital = units.find(u => u.owner === PLAYER_IRAN && u.row === USA_CAPITAL.row && u.col === USA_CAPITAL.col);
    if (iranUnitOnUsaCapital) {
        winner = PLAYER_IRAN;
    }

    // Also consider if one side has no units left (optional win condition)
    // const iranUnitsLeft = units.some(u => u.owner === PLAYER_IRAN);
    // const usaUnitsLeft = units.some(u => u.owner === PLAYER_USA);
    // if (!iranUnitsLeft && usaUnitsLeft) winner = PLAYER_USA;
    // if (!usaUnitsLeft && iranUnitsLeft) winner = PLAYER_IRAN;


    if (winner) {
        // Delay alert slightly to allow map to re-render if a unit just moved/died
        setTimeout(() => {
            alert(`بازی تمام شد! ${winner === PLAYER_IRAN ? 'ایران' : 'آمریکا'} پیروز شد!`);
            // Disable further actions
            gameBoardElement.style.pointerEvents = 'none';
            endTurnButton.disabled = true;
            turnInfoElement.textContent = `برنده: ${winner === PLAYER_IRAN ? 'ایران' : 'آمریکا'}`;
        }, 100); // 100ms delay
        return true;
    }
    return false;
}


// --- Event Handling ---
// Modify renderMap to add click listeners to cells
const gameBoardElement = document.getElementById('game-board');
const turnInfoElement = document.getElementById('turn-info');
const selectedUnitInfoElement = document.getElementById('selected-unit-info');
const endTurnButton = document.getElementById('end-turn-button');

// Represents the game map. 0 = empty, 1 = Iran capital, 2 = USA capital
// We can extend this later for terrain, etc.
let mapData = [];

// Capital positions
const IRAN_CAPITAL = { row: Math.floor(MAP_ROWS / 2), col: 1 }; // Example: Mid-left
const USA_CAPITAL = { row: Math.floor(MAP_ROWS / 2), col: MAP_COLS - 2 }; // Example: Mid-right

function createUnit(type, owner, row, col) {
    const unit = {
        id: nextUnitId++,
        type: type, // e.g., UNIT_TYPES.INFANTRY
        owner: owner, // e.g., PLAYER_IRAN
        hp: type.maxHp,
        row: row,
        col: col,
        movedThisTurn: false, // To track if unit has moved
        attackedThisTurn: false // To track if unit has attacked
    };
    units.push(unit);
    return unit;
}

function initializeUnits() {
    units = []; // Clear existing units
    nextUnitId = 0;

    // Iran's units (example placement)
    createUnit(UNIT_TYPES.INFANTRY, PLAYER_IRAN, IRAN_CAPITAL.row, IRAN_CAPITAL.col + 1);
    createUnit(UNIT_TYPES.INFANTRY, PLAYER_IRAN, IRAN_CAPITAL.row + 1, IRAN_CAPITAL.col + 1);
    createUnit(UNIT_TYPES.TANK, PLAYER_IRAN, IRAN_CAPITAL.row -1 , IRAN_CAPITAL.col + 1 );

    // USA's units (example placement)
    createUnit(UNIT_TYPES.INFANTRY, PLAYER_USA, USA_CAPITAL.row, USA_CAPITAL.col - 1);
    createUnit(UNIT_TYPES.INFANTRY, PLAYER_USA, USA_CAPITAL.row + 1, USA_CAPITAL.col - 1);
    createUnit(UNIT_TYPES.TANK, PLAYER_USA, USA_CAPITAL.row - 1, USA_CAPITAL.col - 1);
}

function initializeMapData() {
    mapData = []; // Clear previous map data if any
    for (let r = 0; r < MAP_ROWS; r++) {
        const row = [];
        for (let c = 0; c < MAP_COLS; c++) {
            row.push(0); // Initialize all cells as empty
        }
        mapData.push(row);
    }
    // Set capitals
    mapData[IRAN_CAPITAL.row][IRAN_CAPITAL.col] = 1; // Mark Iran's capital
    mapData[USA_CAPITAL.row][USA_CAPITAL.col] = 2; // Mark USA's capital
}

function renderMap() {
    gameBoardElement.innerHTML = ''; // Clear previous map
    gameBoardElement.style.gridTemplateColumns = `repeat(${MAP_COLS}, 1fr)`;
    gameBoardElement.style.gridTemplateRows = `repeat(${MAP_ROWS}, 1fr)`;

    for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Display capital
            if (mapData[r][c] === 1) { // Iran Capital
                cell.classList.add('iran-capital');
                cell.innerHTML = 'پایتخت<br>ایران'; // Use innerHTML for line break
            } else if (mapData[r][c] === 2) { // USA Capital
                cell.classList.add('usa-capital');
                cell.innerHTML = 'پایتخت<br>آمریکا';
            }

            // Display units in this cell
            const unitsInCell = units.filter(u => u.row === r && u.col === c);
            unitsInCell.forEach(unit => {
                const unitElement = document.createElement('div');
                unitElement.classList.add('unit');
                unitElement.classList.add(unit.owner === PLAYER_IRAN ? 'iran-unit' : 'usa-unit');
                unitElement.textContent = unit.type.symbol; // e.g., "Inf" or "Tnk"
                unitElement.title = `${unit.type.name} (${unit.owner}) HP: ${unit.hp}/${unit.type.maxHp}`;
                cell.appendChild(unitElement);
            });

            // Add click listener for cell selection (will be detailed in Core Game Logic)
            // cell.addEventListener('click', () => onCellClick(r, c));

            gameBoardElement.appendChild(cell);
        }
    }
}

// Update DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("بازی بارگذاری شد. آماده برای شروع!");
    initializeMapData();
    initializeUnits(); // Call this new function
    renderMap();
    turnInfoElement.textContent = "نوبت ایران"; // Starting player
});

// More game logic will be added later
