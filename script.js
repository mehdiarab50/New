// Constants for Map
const MAP_ROWS = 10;
const MAP_COLS = 10;

// DOM Elements
const gameBoardElement = document.getElementById('game-board');
const turnInfoElement = document.getElementById('turn-info');
const selectedUnitInfoElement = document.getElementById('selected-unit-info');
const endTurnButton = document.getElementById('end-turn-button');
const messageLogElement = document.getElementById('message-log'); // For UI message log

// Game State Variables
let mapData = [];
const IRAN_CAPITAL = { row: Math.floor(MAP_ROWS / 2), col: 1 };
const USA_CAPITAL = { row: Math.floor(MAP_ROWS / 2), col: MAP_COLS - 2 };

const UNIT_TYPES = {
    INFANTRY: { name: "پیاده", attack: 5, defense: 3, maxHp: 10, movement: 3, symbol: "Inf" },
    TANK: { name: "تانک", attack: 8, defense: 7, maxHp: 15, movement: 2, symbol: "Tnk" }
};
const PLAYER_IRAN = "Iran";
const PLAYER_USA = "USA";

let units = [];
let nextUnitId = 0;

let currentPlayer = PLAYER_IRAN;
let selectedUnit = null;
let gamePhase = "unitSelection"; // "unitSelection", "unitMovement", "unitAttack"

const MAX_LOG_MESSAGES = 15; // Increased slightly for more debug history

// --- Utility Functions ---
function getUnitAt(row, col) {
    return units.find(u => u.row === row && u.col === col);
}

function getDistance(unit, targetRow, targetCol) {
    return Math.abs(unit.row - targetRow) + Math.abs(unit.col - targetCol);
}

// --- Logging Function ---
function logMessage(message) {
    const listItem = document.createElement('li');
    listItem.textContent = message;
    if (messageLogElement) { // Check if element exists, for robustness
        messageLogElement.prepend(listItem);
        while (messageLogElement.children.length > MAX_LOG_MESSAGES) {
            messageLogElement.removeChild(messageLogElement.lastChild);
        }
    }
    console.log(`LOG: ${message}`); // Keep console log for dev debugging
}


// --- Map Initialization ---
function initializeMapData() {
    mapData = [];
    for (let r = 0; r < MAP_ROWS; r++) {
        const row = [];
        for (let c = 0; c < MAP_COLS; c++) {
            row.push(0);
        }
        mapData.push(row);
    }
    // Ensure mapData is large enough before setting capitals
    if (IRAN_CAPITAL.row < MAP_ROWS && IRAN_CAPITAL.col < MAP_COLS && mapData[IRAN_CAPITAL.row]) {
      mapData[IRAN_CAPITAL.row][IRAN_CAPITAL.col] = 1;
    } else {
      console.error("Error setting Iran capital: Position out of bounds or mapData not initialized correctly for row " + IRAN_CAPITAL.row);
      logMessage("خطا در تنظیم پایتخت ایران: موقعیت نامعتبر.");
    }
    if (USA_CAPITAL.row < MAP_ROWS && USA_CAPITAL.col < MAP_COLS && mapData[USA_CAPITAL.row]) {
      mapData[USA_CAPITAL.row][USA_CAPITAL.col] = 2;
    } else {
      console.error("Error setting USA capital: Position out of bounds or mapData not initialized correctly for row " + USA_CAPITAL.row);
      logMessage("خطا در تنظیم پایتخت آمریکا: موقعیت نامعتبر.");
    }
}

// --- Unit Initialization ---
function createUnit(type, owner, row, col) {
    // Basic check for position being within map bounds
    if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) {
        logMessage(`خطا: تلاش برای ایجاد واحد ${type.name} خارج از نقشه در (${row},${col}).`);
        console.error(`Error: Attempt to create unit ${type.name} off-map at (${row},${col}).`);
        return null; // Do not create the unit
    }
    const unit = {
        id: nextUnitId++,
        type: type,
        owner: owner,
        hp: type.maxHp,
        row: row,
        col: col,
        movedThisTurn: false,
        attackedThisTurn: false
    };
    units.push(unit);
    return unit;
}

function initializeUnits() {
    units = [];
    nextUnitId = 0;
    // Iran's units
    createUnit(UNIT_TYPES.INFANTRY, PLAYER_IRAN, IRAN_CAPITAL.row, IRAN_CAPITAL.col + 1);
    createUnit(UNIT_TYPES.INFANTRY, PLAYER_IRAN, IRAN_CAPITAL.row + 1, IRAN_CAPITAL.col + 1);
    createUnit(UNIT_TYPES.TANK, PLAYER_IRAN, IRAN_CAPITAL.row - 1, IRAN_CAPITAL.col + 1);
    // USA's units
    createUnit(UNIT_TYPES.INFANTRY, PLAYER_USA, USA_CAPITAL.row, USA_CAPITAL.col - 1);
    createUnit(UNIT_TYPES.INFANTRY, PLAYER_USA, USA_CAPITAL.row + 1, USA_CAPITAL.col - 1);
    createUnit(UNIT_TYPES.TANK, PLAYER_USA, USA_CAPITAL.row - 1, USA_CAPITAL.col - 1);
}

// --- Rendering ---
function renderMap() {
    if (!gameBoardElement) {
        console.error("renderMap: gameBoardElement is null. Aborting render.");
        return;
    }
    gameBoardElement.innerHTML = '';
    gameBoardElement.style.gridTemplateColumns = `repeat(${MAP_COLS}, 1fr)`;
    gameBoardElement.style.gridTemplateRows = `repeat(${MAP_ROWS}, 1fr)`;

    for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Highlights
            if (selectedUnit) {
                if (selectedUnit.row === r && selectedUnit.col === c) {
                    // cell.classList.add('selected-unit-cell');
                }
                // Use isHighlighting = true for canMoveTo and canAttack during rendering
                if (!selectedUnit.movedThisTurn && canMoveTo(selectedUnit, r, c, true)) {
                    const unitInTargetCell = getUnitAt(r,c);
                    if (!unitInTargetCell) { // Only highlight empty cells for movement
                        cell.classList.add('movable-cell');
                    }
                }
                if (!selectedUnit.attackedThisTurn) {
                    const unitInTargetCell = getUnitAt(r,c);
                    if(unitInTargetCell && unitInTargetCell.owner !== selectedUnit.owner && canAttack(selectedUnit, unitInTargetCell, true)){
                        cell.classList.add('attackable-cell');
                    }
                }
            }

            // Capitals
            if (mapData[r] && mapData[r][c] === 1) {
                cell.classList.add('iran-capital');
                cell.innerHTML = 'پایتخت<br>ایران';
            } else if (mapData[r] && mapData[r][c] === 2) {
                cell.classList.add('usa-capital');
                cell.innerHTML = 'پایتخت<br>آمریکا';
            }

            // Units
            const unitsInCell = units.filter(u => u.row === r && u.col === c);
            unitsInCell.forEach(unit => {
                const unitElement = document.createElement('div');
                unitElement.classList.add('unit');
                unitElement.classList.add(unit.owner === PLAYER_IRAN ? 'iran-unit' : 'usa-unit');
                if (selectedUnit && selectedUnit.id === unit.id) {
                    unitElement.classList.add('selected-unit-marker');
                }
                unitElement.textContent = unit.type.symbol;
                unitElement.title = `${unit.type.name} (${unit.owner}) HP: ${unit.hp}/${unit.type.maxHp} | M:${unit.movedThisTurn} A:${unit.attackedThisTurn}`;
                cell.appendChild(unitElement);
            });

            cell.addEventListener('click', () => onCellClick(r, c));
            gameBoardElement.appendChild(cell);
        }
    }
}

// --- Game Logic: Turn Management ---
function switchTurn() {
    currentPlayer = (currentPlayer === PLAYER_IRAN) ? PLAYER_USA : PLAYER_IRAN;
    const currentTurnText = `نوبت ${currentPlayer === PLAYER_IRAN ? 'ایران' : 'آمریکا'}`;
    if(turnInfoElement) turnInfoElement.textContent = currentTurnText;
    logMessage(`--- ${currentTurnText} ---`);

    selectedUnit = null;
    gamePhase = "unitSelection";
    updateSelectedUnitInfo();

    units.forEach(unit => {
        if (unit.owner === currentPlayer) {
            unit.movedThisTurn = false;
            unit.attackedThisTurn = false;
        }
    });

    if(checkForWin()) return;
    renderMap();
}

// --- Game Logic: Selection ---
function selectUnit(unit) {
    if (unit) {
        if (unit.owner === currentPlayer) {
            selectedUnit = unit;
            gamePhase = "unitMovement";
            logMessage(`selectUnit: Unit ID ${unit.id} (${unit.type.name}) selected. Game phase: ${gamePhase}.`);
        } else {
            logMessage(`selectUnit: Attempted to select unit ID ${unit.id} not belonging to current player ${currentPlayer}. Deselecting previous if any.`);
            selectedUnit = null;
            gamePhase = "unitSelection";
        }
    } else {
        logMessage("selectUnit: Called with null. Deselecting unit.");
        selectedUnit = null;
        gamePhase = "unitSelection";
    }
}

function updateSelectedUnitInfo() {
    if (!selectedUnitInfoElement) return;
    if (selectedUnit) {
        selectedUnitInfoElement.textContent = `واحد انتخاب شده: ${selectedUnit.type.name} (${selectedUnit.owner}) HP: ${selectedUnit.hp}/${selectedUnit.type.maxHp} | حرکت: ${selectedUnit.movedThisTurn} | حمله: ${selectedUnit.attackedThisTurn}`;
    } else {
        selectedUnitInfoElement.textContent = "واحد انتخاب شده: -";
    }
}

// --- Game Logic: Movement ---
function canMoveTo(unit, targetRow, targetCol, isHighlighting = false) {
    const logFn = isHighlighting ? () => {} : logMessage; // Simplified: no console log for highlighting pass

    if (!isHighlighting) logFn(`canMoveTo: Unit ID ${unit.id} to (${targetRow},${targetCol}). Moved: ${unit.movedThisTurn}`);

    if (unit.movedThisTurn) {
        if (!isHighlighting) logFn("canMoveTo: FAILED - unit.movedThisTurn is true.");
        return false;
    }

    const distance = getDistance(unit, targetRow, targetCol);
    if (!isHighlighting) logFn(`canMoveTo: Dist: ${distance}, MaxMove: ${unit.type.movement}`);
    if (distance === 0) {
        if (!isHighlighting) logFn("canMoveTo: FAILED - distance is 0.");
        return false;
    }
    if (distance > unit.type.movement) {
        if (!isHighlighting) logFn("canMoveTo: FAILED - distance > movement.");
        return false;
    }

    if (!isHighlighting) logFn(`canMoveTo: Target (${targetRow},${targetCol}). Map: ${MAP_ROWS}x${MAP_COLS}`);
    if (targetRow < 0 || targetRow >= MAP_ROWS || targetCol < 0 || targetCol >= MAP_COLS) {
        if (!isHighlighting) logFn("canMoveTo: FAILED - target off map.");
        return false;
    }

    const targetCellUnit = getUnitAt(targetRow, targetCol);
    if (targetCellUnit) {
        if (!isHighlighting) logFn(`canMoveTo: Target cell has unit ID ${targetCellUnit.id}, Owner: ${targetCellUnit.owner}.`);
        if (targetCellUnit.owner === unit.owner) {
            if (!isHighlighting) logFn("canMoveTo: FAILED - target cell occupied by friendly unit.");
            return false;
        }
        if (!isHighlighting) logFn("canMoveTo: Target cell has enemy. (Move allowed by canMoveTo, moveUnit must check).");
    } else {
        if (!isHighlighting) logFn("canMoveTo: Target cell is empty.");
    }

    if (!isHighlighting) logFn("canMoveTo: PASSED.");
    return true;
}

function moveUnit(unit, targetRow, targetCol) {
    logMessage(`moveUnit: Unit ID ${unit.id} from (${unit.row},${unit.col}) to (${targetRow},${targetCol}).`);
    if (!canMoveTo(unit, targetRow, targetCol, false)) {
        logMessage("moveUnit: Initial canMoveTo FAILED."); // Reasons logged by canMoveTo
        return false;
    }

    const targetUnit = getUnitAt(targetRow, targetCol);
    if (targetUnit && targetUnit.owner !== unit.owner) { // Check if target has an ENEMY unit
        logMessage(`moveUnit: FAILED - Target cell (${targetRow},${targetCol}) occupied by enemy ID ${targetUnit.id}. Use Attack.`);
        return false;
    }
    // If targetUnit is friendly, canMoveTo would have returned false.
    // If targetUnit is null (empty), this condition is false.

    const prevPos = {row: unit.row, col: unit.col};
    unit.row = targetRow;
    unit.col = targetCol;
    unit.movedThisTurn = true;
    logMessage(`moveUnit: SUCCESS - Unit ID ${unit.id} (${unit.type.name}) moved from (${prevPos.row},${prevPos.col}) to (${unit.row},${unit.col}). Moved: ${unit.movedThisTurn}.`);

    if(checkForWin()) return true;

    logMessage(`moveUnit: Deselecting unit ID ${unit.id}.`);
    selectUnit(null);
    return true;
}

// --- Game Logic: Combat ---
function canAttack(attacker, defender, isHighlighting = false) {
    const logFn = isHighlighting ? () => {} : logMessage;
    if(!isHighlighting) logFn(`canAttack: Attacker ID ${attacker.id} vs Defender ID ${defender.id}. AttackedThisTurn: ${attacker.attackedThisTurn}`);

    if (!attacker || !defender) {
        if(!isHighlighting) logFn("canAttack: FAILED - attacker or defender is null.");
        return false;
    }
    if (attacker.attackedThisTurn) {
        if(!isHighlighting) logFn("canAttack: FAILED - attacker.attackedThisTurn.");
        return false;
    }
    if (attacker.owner === defender.owner) {
        if(!isHighlighting) logFn("canAttack: FAILED - same owner.");
        return false;
    }

    const distance = getDistance(attacker, defender.row, defender.col);
    if(!isHighlighting) logFn(`canAttack: Distance: ${distance}. Required: 1.`);
    if (distance !== 1) {
        if(!isHighlighting) logFn("canAttack: FAILED - distance not 1.");
        return false;
    }

    if(!isHighlighting) logFn("canAttack: PASSED.");
    return true;
}

function attackUnit(attacker, defender) {
    logMessage(`attackUnit: Unit ID ${attacker.id} (${attacker.type.name}) attacks ID ${defender.id} (${defender.type.name}).`);
    if (!canAttack(attacker, defender, false)) {
        logMessage("attackUnit: canAttack FAILED."); // Reasons logged by canAttack
        return false;
    }

    logMessage(`${attacker.type.name} (Att:${attacker.type.attack},HP:${attacker.hp}) vs ${defender.type.name} (Def:${defender.type.defense},HP:${defender.hp})`);

    let damage = Math.max(1, attacker.type.attack - defender.type.defense);
    defender.hp -= damage;
    logMessage(`${defender.type.name} ${defender.owner} takes ${damage} damage. HP left: ${defender.hp}`);

    attacker.attackedThisTurn = true;
    attacker.movedThisTurn = true;

    if (defender.hp <= 0) {
        logMessage(`${defender.type.name} ${defender.owner} destroyed!`);
        units = units.filter(u => u.id !== defender.id);
    }

    if(checkForWin()) return true;

    logMessage(`attackUnit: Deselecting unit ID ${attacker.id}.`);
    selectUnit(null);
    return true;
}

// --- Game Logic: Win Condition ---
function checkForWin() {
    if (currentPlayer === null) return true; // Game already ended and processed

    let winner = null;
    const usaUnitOnIranCapital = units.find(u => u.owner === PLAYER_USA && u.row === IRAN_CAPITAL.row && u.col === IRAN_CAPITAL.col);
    if (usaUnitOnIranCapital) {
        winner = PLAYER_USA;
    }

    const iranUnitOnUsaCapital = units.find(u => u.owner === PLAYER_IRAN && u.row === USA_CAPITAL.row && u.col === USA_CAPITAL.col);
    if (iranUnitOnUsaCapital && !winner) { // Check !winner to avoid double message if both happen same time (unlikely)
        winner = PLAYER_IRAN;
    }

    if (winner) {
        const winMessage = `بازی تمام شد! ${winner === PLAYER_IRAN ? 'ایران' : 'آمریکا'} پیروز شد!`;
        logMessage(winMessage);
        if(gameBoardElement) gameBoardElement.style.pointerEvents = 'none';
        if(endTurnButton) endTurnButton.disabled = true;
        if(turnInfoElement) turnInfoElement.textContent = `برنده: ${winner === PLAYER_IRAN ? 'ایران' : 'آمریکا'}`;
        currentPlayer = null; // Mark game as ended
        selectedUnit = null; // Clear selection
        return true;
    }
    return false;
}

// --- Event Handling ---
function onCellClick(row, col) {
    if (currentPlayer === null) {
        logMessage("onCellClick: Game has ended. No actions allowed.");
        return;
    }

    logMessage(`onCellClick: Cell (${row}, ${col}). Phase: ${gamePhase}. Player: ${currentPlayer}.`);
    if(selectedUnit) {
        logMessage(`onCellClick: Selected ID: ${selectedUnit.id} (${selectedUnit.type.name}), Mvd: ${selectedUnit.movedThisTurn}, Atkd: ${selectedUnit.attackedThisTurn}`);
    } else {
        logMessage("onCellClick: No unit selected.");
    }

    const unitInClickedCell = getUnitAt(row, col);
    if(unitInClickedCell) {
        logMessage(`onCellClick: Unit in cell: ID ${unitInClickedCell.id} (${unitInClickedCell.type.name}), Owner: ${unitInClickedCell.owner}`);
    } else {
        logMessage("onCellClick: Clicked cell is empty.");
    }

    if (gamePhase === "unitSelection") {
        logMessage("onCellClick: Phase 'unitSelection'.");
        if (unitInClickedCell && unitInClickedCell.owner === currentPlayer) {
            selectUnit(unitInClickedCell);
        } else {
            logMessage("onCellClick: Invalid selection click (no unit / not player's unit). Deselecting.");
            if (selectedUnit) {
                logMessage("onCellClick: (Deselecting previous unit).");
            }
            selectUnit(null);
        }
    } else if (gamePhase === "unitMovement" && selectedUnit) {
        logMessage("onCellClick: Phase 'unitMovement'.");
        if (unitInClickedCell) {
            logMessage("onCellClick: Target cell has a unit.");
            if (unitInClickedCell.owner !== currentPlayer && canAttack(selectedUnit, unitInClickedCell, false)) {
                logMessage("onCellClick: Attempting attack.");
                attackUnit(selectedUnit, unitInClickedCell);
            } else if (unitInClickedCell.id === selectedUnit.id) {
                logMessage("onCellClick: Clicked selected unit again. Deselecting.");
                selectUnit(null);
            } else if (unitInClickedCell.owner === currentPlayer) {
                logMessage("onCellClick: Clicked another friendly unit. Switching selection.");
                selectUnit(unitInClickedCell);
            } else {
                logMessage("onCellClick: Clicked unit, no valid action (not attackable, self, or other friendly).");
            }
        } else { // Clicked on an empty cell
            logMessage(`onCellClick: Target cell empty. Attempting move to (${row}, ${col}).`);
            if (!selectedUnit) { // Defensive check from previous debugging attempt
                logMessage("onCellClick: CRITICAL - selectedUnit is null. Aborting move.");
            } else if (canMoveTo(selectedUnit, row, col, false)) {
                 logMessage("onCellClick: canMoveTo TRUE. Calling moveUnit.");
                 moveUnit(selectedUnit, row, col);
            } else {
                logMessage("onCellClick: canMoveTo FALSE. Move not executed."); // Reasons in canMoveTo log
            }
        }
    } else {
        logMessage(`onCellClick: Unhandled. Phase: ${gamePhase}, SelUnit: ${selectedUnit ? selectedUnit.id : 'null'}`);
    }
    renderMap();
    updateSelectedUnitInfo();
}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    if (!gameBoardElement || !turnInfoElement || !selectedUnitInfoElement || !endTurnButton || !messageLogElement) {
        console.error("CRITICAL DOM SETUP ERROR: Essential game elements missing.");
        alert("خطای بارگذاری بازی! عناصر اصلی صفحه موجود نیستند.");
        // Attempt to log to messageLog if it exists, otherwise, it's a lost cause.
        if(typeof logMessage === "function") logMessage("خطای بسیار جدی: عناصر HTML اصلی بازی یافت نشدند!");
        return;
    }

    logMessage("بازی در حال بارگذاری اولیه...");
    initializeMapData();
    initializeUnits();
    renderMap();

    const initialTurnText = `نوبت ${PLAYER_IRAN}`;
    turnInfoElement.textContent = initialTurnText;
    logMessage(`--- ${initialTurnText} ---`);
    updateSelectedUnitInfo();

    endTurnButton.addEventListener('click', () => {
        if (currentPlayer === null) {
             logMessage("endTurnButton: Game has ended.");
             return;
        }
        logMessage(`${currentPlayer} نوبت خود را به پایان رساند.`);
        switchTurn();
    });
    logMessage("بازی با موفقیت بارگذاری و آماده شد.");
});
