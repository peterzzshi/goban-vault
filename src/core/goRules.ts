import type { CellState, StoneType } from '../types';

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

export function applyCaptures(board: CellState[][], boardSize: number): CellState[][] {
    const newBoard = board.map(r => [...r]);
    let changed = true;

    while (changed) {
        changed = false;
        const visited = new Set<string>();

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const stone = newBoard[row]?.[col];
                if (stone === null) continue;

                const key = `${row}-${col}`;
                if (visited.has(key)) continue;

                const group = getGroup(newBoard, row, col, visited, boardSize);
                if (countLiberties(newBoard, group, boardSize) === 0) {
                    for (const pos of group) {
                        const boardRow = newBoard[pos.row];
                        if (boardRow) {
                            boardRow[pos.col] = null;
                        }
                    }
                    changed = true;
                }
            }
        }
    }

    return newBoard;
}

