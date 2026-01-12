import {spreadPatterns, type SpreadPatternType} from './spreadPatterns';
import {
    BOARD_SIZE_CONFIG,
    type BoardSize,
    KEY_SIZE_TO_BOARD_SIZE,
    type KeySize,
    type StoneColor
} from '../stores/gameStore';

interface BoardConfig {
    boardSize: BoardSize;
    quadrantSize: number;
    bitsPerQuadrant: number;
    hasCenter: boolean;
    quadrants: { rowStart: number; colStart: number }[];
    totalBits: number;
    hexChars: number;
}

function getBoardConfig(keySize: KeySize): BoardConfig {
    const boardSize = KEY_SIZE_TO_BOARD_SIZE[keySize];
    const config = BOARD_SIZE_CONFIG[boardSize];

    let quadrants: { rowStart: number; colStart: number }[];

    if (boardSize === 9) {
        quadrants = [{ rowStart: 0, colStart: 0 }];
    } else if (boardSize === 13) {
        quadrants = [
            { rowStart: 0, colStart: 0 },
            { rowStart: 0, colStart: 7 },
            { rowStart: 7, colStart: 0 },
            { rowStart: 7, colStart: 7 },
        ];
    } else {
        quadrants = [
            { rowStart: 0, colStart: 0 },
            { rowStart: 0, colStart: 10 },
            { rowStart: 10, colStart: 0 },
            { rowStart: 10, colStart: 10 },
        ];
    }

    return {
        boardSize,
        quadrantSize: config.quadrantSize,
        bitsPerQuadrant: config.bitsPerQuadrant,
        hasCenter: config.hasCenter,
        quadrants,
        totalBits: keySize,
        hexChars: keySize / 4,
    };
}

function quadrantPosToBoard(
    quadrant: { rowStart: number; colStart: number },
    posIndex: number,
    quadrantSize: number
): { row: number; col: number } {
    const localRow = Math.floor(posIndex / quadrantSize);
    const localCol = posIndex % quadrantSize;
    return {
        row: quadrant.rowStart + localRow,
        col: quadrant.colStart + localCol,
    };
}

function boardPosToQuadrant(
    quadrant: { rowStart: number; colStart: number },
    row: number,
    col: number,
    quadrantSize: number
): number {
    const localRow = row - quadrant.rowStart;
    const localCol = col - quadrant.colStart;
    return localRow * quadrantSize + localCol;
}

export function encodePrivateKey(
    privateKeyHex: string,
    patternType: SpreadPatternType = 'sequential',
    keySize: KeySize = 256
): StoneColor[][] {
    const config = getBoardConfig(keySize);

    const board: StoneColor[][] = Array.from({ length: config.boardSize }, () =>
        Array.from({ length: config.boardSize }, () => null as StoneColor)
    );

    const cleanHex = privateKeyHex
        .replace(/^0x/, '')
        .padStart(config.hexChars, '0')
        .slice(0, config.hexChars);

    if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
        return board;
    }

    const pattern = spreadPatterns[patternType];
    const hexCharsPerQuadrant = config.bitsPerQuadrant / 4;

    for (let q = 0; q < config.quadrants.length; q++) {
        const quadrant = config.quadrants[q];
        if (!quadrant) continue;

        const hexChunk = cleanHex.slice(q * hexCharsPerQuadrant, (q + 1) * hexCharsPerQuadrant);

        const binaryStr = hexChunk
            .split('')
            .map(c => parseInt(c, 16).toString(2).padStart(4, '0'))
            .join('');

        for (let bit = 0; bit < config.bitsPerQuadrant; bit++) {
            if (binaryStr[bit] === '1') {
                const posIndex = pattern.bitToPosition(bit, config.bitsPerQuadrant);
                const { row, col } = quadrantPosToBoard(quadrant, posIndex, config.quadrantSize);
                const boardRow = board[row];
                if (boardRow) {
                    boardRow[col] = assignStoneColor(row, col, q, bit);
                }
            }
        }
    }

    return board;
}

function assignStoneColor(row: number, col: number, quadrant: number, bitIndex: number): 'black' | 'white' {
    const pattern = (row + col + quadrant) % 3;
    if (pattern === 0) return 'black';
    if (pattern === 1) return 'white';
    return bitIndex % 2 === 0 ? 'black' : 'white';
}

export function decodeBoard(
    board: StoneColor[][],
    patternType: SpreadPatternType = 'sequential',
    keySize: KeySize = 256
): string {
    const config = getBoardConfig(keySize);
    const pattern = spreadPatterns[patternType];
    let binaryStr = '';

    for (const quadrant of config.quadrants) {
        if (!quadrant) continue;

        let quadrantBinary = '';

        for (let bit = 0; bit < config.bitsPerQuadrant; bit++) {
            const posIndex = pattern.bitToPosition(bit, config.bitsPerQuadrant);
            const { row, col } = quadrantPosToBoard(quadrant, posIndex, config.quadrantSize);
            quadrantBinary += board[row]?.[col] !== null ? '1' : '0';
        }

        binaryStr += quadrantBinary;
    }

    let hexStr = '';
    for (let i = 0; i < binaryStr.length; i += 4) {
        const nibble = binaryStr.slice(i, i + 4);
        hexStr += parseInt(nibble, 2).toString(16);
    }

    return hexStr;
}

export function isCenterPosition(row: number, col: number, boardSize: BoardSize = 19): boolean {
    if (boardSize === 9) return false;
    const center = Math.floor(boardSize / 2);
    return row === center || col === center;
}

export function getQuadrantIndex(
    row: number,
    col: number,
    boardSize: BoardSize = 19
): number | null {
    if (boardSize === 9) return 0;

    const center = Math.floor(boardSize / 2);
    if (row === center || col === center) return null;

    if (row < center && col < center) return 0;
    if (row < center && col > center) return 1;
    if (row > center && col < center) return 2;
    if (row > center && col > center) return 3;

    return null;
}

export function isDataPosition(
    row: number,
    col: number,
    patternType: SpreadPatternType = 'sequential',
    keySize: KeySize = 256
): boolean {
    const config = getBoardConfig(keySize);
    const quadrantIdx = getQuadrantIndex(row, col, config.boardSize);
    if (quadrantIdx === null) return false;

    const quadrant = config.quadrants[quadrantIdx];
    if (!quadrant) return false;

    const posIndex = boardPosToQuadrant(quadrant, row, col, config.quadrantSize);
    const pattern = spreadPatterns[patternType];

    return pattern.positionToBit(posIndex, config.bitsPerQuadrant) !== -1;
}

