import { spreadPatterns, type SpreadPatternType } from './spreadPatterns';
import {
    KEY_SIZE_TO_BOARD_SIZE,
    type KeySize,
    type StoneColor
} from '../stores/gameStore';

export function encodePrivateKey(
    privateKeyHex: string,
    patternType: SpreadPatternType,
    keySize: KeySize
): StoneColor[][] {
    const boardSize = KEY_SIZE_TO_BOARD_SIZE[keySize];
    const totalPositions = boardSize * boardSize;
    const hexChars = keySize / 4;

    const board: StoneColor[][] = Array.from({ length: boardSize }, () =>
        Array.from({ length: boardSize }, () => null as StoneColor)
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

    const pattern = spreadPatterns[patternType];
    const positions = pattern.generatePositions(keySize, totalPositions);

    for (let bit = 0; bit < keySize; bit++) {
        if (binaryStr[bit] === '1') {
            const posIndex = positions[bit];
            if (posIndex === undefined) continue;
            const row = Math.floor(posIndex / boardSize);
            const col = posIndex % boardSize;
            const boardRow = board[row];
            if (boardRow) {
                boardRow[col] = assignStoneColor(row, col, bit, cleanHex);
            }
        }
    }

    return board;
}

function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

function generateColorSeed(hexKey: string): number {
    let hash = 0;
    for (let i = 0; i < hexKey.length; i++) {
        const char = hexKey.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function assignStoneColor(row: number, col: number, bitIndex: number, hexKey: string): 'black' | 'white' {
    const seed = generateColorSeed(hexKey);
    const random = seededRandom(seed + bitIndex);
    const value = random();

    const positionBias = (row + col) % 2;
    const threshold = 0.5 + (positionBias === 0 ? 0.1 : -0.1);

    return value < threshold ? 'black' : 'white';
}

export function decodeBoard(
    board: StoneColor[][],
    patternType: SpreadPatternType,
    keySize: KeySize
): string {
    const boardSize = KEY_SIZE_TO_BOARD_SIZE[keySize];
    const totalPositions = boardSize * boardSize;
    const pattern = spreadPatterns[patternType];
    const positions = pattern.generatePositions(keySize, totalPositions);

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
