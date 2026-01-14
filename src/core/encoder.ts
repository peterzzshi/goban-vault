import { applyCaptures } from './goRules';
import { generatePositions } from './positionGenerator';
import { KEY_SIZE_TO_BOARD_SIZE } from '../types';

import type {
    CellState,
    KeySize,
    StoneType
} from '../types';

export function encodePrivateKey(
    privateKeyHex: string,
    keySize: KeySize,
    seed: number
): CellState[][] {
    const boardSize = KEY_SIZE_TO_BOARD_SIZE[keySize];
    const totalPositions = boardSize * boardSize;
    const hexChars = keySize / 4;

    const board: CellState[][] = Array.from({ length: boardSize }, () =>
        Array.from({ length: boardSize }, () => null as CellState)
    );

    const cleanHex = privateKeyHex
        .replace(/^0x/, '')
        .padStart(hexChars, '0')
        .slice(0, hexChars);

    if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
        return board;
    }

    const binaryStr = cleanHex
        .split('')
        .map(c => parseInt(c, 16).toString(2).padStart(4, '0'))
        .join('');

    const positions = generatePositions(keySize, totalPositions, seed);

    for (let bit = 0; bit < keySize; bit++) {
        if (binaryStr[bit] === '1') {
            const posIndex = positions[bit];
            if (posIndex === undefined) continue;
            const row = Math.floor(posIndex / boardSize);
            const col = posIndex % boardSize;
            const boardRow = board[row];
            if (boardRow) {
                boardRow[col] = assignStoneColour(row, col, bit, seed);
            }
        }
    }

    return applyCaptures(board, boardSize);
}

function seededRandom(seed: number): () => number {
    let state = seed || 1;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

function assignStoneColour(row: number, col: number, bitIndex: number, seed: number): StoneType {
    const random = seededRandom(seed + bitIndex * 31);
    const value = random();

    const positionBias = (row + col) % 2;
    const threshold = 0.5 + (positionBias === 0 ? 0.1 : -0.1);

    return value < threshold ? 'black' : 'white';
}

export function decodeBoard(
    board: CellState[][],
    keySize: KeySize,
    seed: number
): string {
    const boardSize = KEY_SIZE_TO_BOARD_SIZE[keySize];
    const totalPositions = boardSize * boardSize;
    const positions = generatePositions(keySize, totalPositions, seed);

    let binaryStr = '';
    for (let bit = 0; bit < keySize; bit++) {
        const posIndex = positions[bit];
        if (posIndex === undefined) {
            binaryStr += '0';
            continue;
        }
        const row = Math.floor(posIndex / boardSize);
        const col = posIndex % boardSize;
        binaryStr += board[row]?.[col] !== null ? '1' : '0';
    }

    let hexStr = '';
    for (let i = 0; i < binaryStr.length; i += 4) {
        const nibble = binaryStr.slice(i, i + 4);
        hexStr += parseInt(nibble, 2).toString(16);
    }

    return hexStr;
}
