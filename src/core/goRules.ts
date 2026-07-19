import type { CellState, PlacedStone, StoneType } from '../types';

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
    board: CellState[][],
    startRow: number,
    startCol: number,
    visited: Set<string>,
    boardSize: number
): Position[] {
    const colour = board[startRow]?.[startCol];
    if (colour === null || colour === undefined) return [];

    const group: Position[] = [];
    const stack: Position[] = [{ row: startRow, col: startCol }];

    while (stack.length > 0) {
        const pos = stack.pop();
        if (!pos) continue;
        const { row, col } = pos;
        const key = `${row}-${col}`;

        if (visited.has(key)) continue;
        if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) continue;
        if (board[row]?.[col] !== colour) continue;

        visited.add(key);
        group.push({ row, col });

        for (const dir of DIRECTIONS) {
            stack.push({ row: row + dir.row, col: col + dir.col });
        }
    }

    return group;
}

function countLiberties(board: CellState[][], group: Position[], boardSize: number): number {
    const liberties = new Set<string>();

    for (const { row, col } of group) {
        for (const dir of DIRECTIONS) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;

            if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
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
    board: CellState[][],
    row: number,
    col: number,
    colour: CellState,
    boardSize: number
): Position[] {
    if (colour === null) return [];

    const tempBoard = board.map(r => [...r]);
    const tempRow = tempBoard[row];
    if (tempRow) {
        tempRow[col] = colour;
    }

    const captured: Position[] = [];
    const visited = new Set<string>();
    const opponentColour: StoneType = colour === 'black' ? 'white' : 'black';

    for (const dir of DIRECTIONS) {
        const adjRow = row + dir.row;
        const adjCol = col + dir.col;

        if (adjRow < 0 || adjRow >= boardSize || adjCol < 0 || adjCol >= boardSize) {
            continue;
        }

        if (tempBoard[adjRow]?.[adjCol] === opponentColour) {
            const key = `${adjRow}-${adjCol}`;
            if (!visited.has(key)) {
                const group = getGroup(tempBoard, adjRow, adjCol, visited, boardSize);
                if (countLiberties(tempBoard, group, boardSize) === 0) {
                    captured.push(...group);
                }
            }
        }
    }

    return captured;
}

export function wouldBeSuicide(
    board: CellState[][],
    row: number,
    col: number,
    colour: CellState,
    boardSize: number
): boolean {
    if (colour === null) return false;

    if (wouldCapture(board, row, col, colour, boardSize).length > 0) {
        return false;
    }

    const tempBoard = board.map(r => [...r]);
    const tempRow = tempBoard[row];
    if (tempRow) {
        tempRow[col] = colour;
    }

    const visited = new Set<string>();
    const group = getGroup(tempBoard, row, col, visited, boardSize);
    return countLiberties(tempBoard, group, boardSize) === 0;
}

function setCell(board: CellState[][], row: number, col: number, value: CellState): void {
    const target = board[row];
    if (target) {
        target[col] = value;
    }
}

// Places a stone under Go rules, returning the new board and any captured
// stones. Returns null for an illegal (non-capturing suicide) move.
export function placeStoneWithCaptures(
    board: CellState[][],
    row: number,
    col: number,
    colour: StoneType,
    boardSize: number
): { board: CellState[][]; captured: PlacedStone[] } | null {
    const capturedPositions = wouldCapture(board, row, col, colour, boardSize);
    if (capturedPositions.length === 0 && wouldBeSuicide(board, row, col, colour, boardSize)) {
        return null;
    }

    const next = board.map(r => [...r]);
    const captured: PlacedStone[] = [];
    for (const { row: r, col: c } of capturedPositions) {
        const stone = board[r]?.[c];
        if (stone != null) {
            captured.push({ row: r, col: c, colour: stone });
        }
        setCell(next, r, c, null);
    }
    setCell(next, row, col, colour);
    return { board: next, captured };
}

