import type { StoneColor } from '../stores/gameStore';

const BOARD_SIZE = 19;

interface Position {
    row: number;
    col: number;
}

const DIRECTIONS: Position[] = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
];

function getGroup(
    board: StoneColor[][],
    startRow: number,
    startCol: number,
    visited: Set<string>
): Position[] {
    const color = board[startRow]?.[startCol];
    if (color === null || color === undefined) return [];

    const group: Position[] = [];
    const stack: Position[] = [{ row: startRow, col: startCol }];

    while (stack.length > 0) {
        const { row, col } = stack.pop()!;
        const key = `${row}-${col}`;

        if (visited.has(key)) continue;
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) continue;
        if (board[row]?.[col] !== color) continue;

        visited.add(key);
        group.push({ row, col });

        for (const dir of DIRECTIONS) {
            stack.push({ row: row + dir.row, col: col + dir.col });
        }
    }

    return group;
}

function countLiberties(board: StoneColor[][], group: Position[]): number {
    const liberties = new Set<string>();

    for (const { row, col } of group) {
        for (const dir of DIRECTIONS) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;

            if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
                continue;
            }

            if (board[newRow]?.[newCol] === null) {
                liberties.add(`${newRow}-${newCol}`);
            }
        }
    }

    return liberties.size;
}

export function wouldCapture(
    board: StoneColor[][],
    row: number,
    col: number,
    color: StoneColor
): Position[] {
    if (color === null) return [];

    const tempBoard = board.map(r => [...r]);
    const tempRow = tempBoard[row];
    if (tempRow) {
        tempRow[col] = color;
    }

    const captured: Position[] = [];
    const visited = new Set<string>();
    const opponentColor = color === 'black' ? 'white' : 'black';

    for (const dir of DIRECTIONS) {
        const adjRow = row + dir.row;
        const adjCol = col + dir.col;

        if (adjRow < 0 || adjRow >= BOARD_SIZE || adjCol < 0 || adjCol >= BOARD_SIZE) {
            continue;
        }

        if (tempBoard[adjRow]?.[adjCol] === opponentColor) {
            const key = `${adjRow}-${adjCol}`;
            if (!visited.has(key)) {
                const group = getGroup(tempBoard, adjRow, adjCol, visited);
                if (countLiberties(tempBoard, group) === 0) {
                    captured.push(...group);
                }
            }
        }
    }

    return captured;
}

export function wouldBeSuicide(
    board: StoneColor[][],
    row: number,
    col: number,
    color: StoneColor
): boolean {
    if (color === null) return false;

    if (wouldCapture(board, row, col, color).length > 0) {
        return false;
    }

    const tempBoard = board.map(r => [...r]);
    const tempRow = tempBoard[row];
    if (tempRow) {
        tempRow[col] = color;
    }

    const visited = new Set<string>();
    const group = getGroup(tempBoard, row, col, visited);
    return countLiberties(tempBoard, group) === 0;
}

export function validateDummyPlacement(
    encodedBoard: StoneColor[][],
    dummyStones: Map<string, 'black' | 'white'>,
    row: number,
    col: number,
    color: 'black' | 'white'
): { valid: boolean; reason?: string } {
    if (encodedBoard[row]?.[col] !== null) {
        return { valid: false, reason: 'Position occupied by encoded stone' };
    }

    const key = `${row}-${col}`;
    if (dummyStones.has(key)) {
        return { valid: false, reason: 'Position already has a dummy stone' };
    }

    const combinedBoard = encodedBoard.map(r => [...r]);
    for (const [posKey, stoneColor] of dummyStones) {
        const [rStr, cStr] = posKey.split('-');
        const r = Number(rStr);
        const c = Number(cStr);
        const combinedRow = combinedBoard[r];
        if (combinedRow) {
            combinedRow[c] = stoneColor;
        }
    }

    const captures = wouldCapture(combinedBoard, row, col, color);
    if (captures.length > 0) {
        return { valid: false, reason: 'Would capture stones - not allowed for dummy stones' };
    }

    if (wouldBeSuicide(combinedBoard, row, col, color)) {
        return { valid: false, reason: 'Suicide move - no liberties' };
    }

    return { valid: true };
}
