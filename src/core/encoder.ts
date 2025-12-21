import type { Board, Quadrant, Position } from './types';
import { assignColorsWithValidity } from './colorAssigner';
import { keyHash } from '../utils/keyConverter';
import {
    BOARD_SIZE,
    BITS_PER_QUADRANT,
    EMPTY,
    DUMMY_STONE_PROBABILITY, HASH_MULTIPLIER, ROW_MULTIPLIER, COL_MULTIPLIER, QUADRANT_MULTIPLIER
} from '../utils/constants';

type StoneInfo = [number, number, number, boolean]; // [row, col, baseColor, isDummy]

/**
 * Create the four quadrants of the Go board
 */
const createQuadrants = (size: number): Quadrant[] => {
  const centerRow = Math.floor(size / 2);
  const centerCol = Math.floor(size / 2);

  return [
    {
      name: 'Top-Left',
      startRow: 0,
      endRow: centerRow - 1,
      startCol: 0,
      endCol: centerCol - 1,
      baseColor: 1
    },
    {
      name: 'Top-Right',
      startRow: 0,
      endRow: centerRow - 1,
      startCol: centerCol + 1,
      endCol: size - 1,
      baseColor: 2
    },
    {
      name: 'Bottom-Left',
      startRow: centerRow + 1,
      endRow: size - 1,
      startCol: 0,
      endCol: centerCol - 1,
      baseColor: 2
    },
    {
      name: 'Bottom-Right',
      startRow: centerRow + 1,
      endRow: size - 1,
      startCol: centerCol + 1,
      endCol: size - 1,
      baseColor: 1
    }
  ];
};

/**
 * Get all positions in a quadrant (row by row)
 */
const getQuadrantPositions = (quad: Quadrant): [number, number][] => {
  const positions: [number, number][] = [];
  for (let r = quad.startRow; r <= quad.endRow; r++) {
    for (let c = quad.startCol; c <= quad.endCol; c++) {
      positions.push([r, c]);
    }
  }
  return positions;
};

/**
 * Encode key bits with natural filling including dummy stones
 */
export const encodeWithDummyStones = (
  keyBits: string,
  size: number = BOARD_SIZE,
  mixColors: boolean = false
) => {
  const board: Board = Array(size).fill(null).map(() => Array(size).fill(EMPTY));
  const centerRow = Math.floor(size / 2);
  const centerCol = Math.floor(size / 2);

  const quadrants = createQuadrants(size);
  const readingOrder: Position[] = [];
  const stonesToPlace: StoneInfo[] = [];
  const dummyPositions = new Set<string>();

  // Calculate key hash for deterministic dummy placement
  const hashValue = keyHash(keyBits);

  // Process each quadrant
  for (let qIdx = 0; qIdx < quadrants.length; qIdx++) {
    const quad = quadrants[qIdx];
    const quadPositions = getQuadrantPositions(quad);

    // Get bits for this quadrant
    const startBit = qIdx * BITS_PER_QUADRANT;
    const endBit = Math.min(startBit + BITS_PER_QUADRANT, keyBits.length);
    let quadBits = '';

    if (startBit < keyBits.length) {
      quadBits = keyBits.slice(startBit, endBit);
      quadBits = quadBits.padEnd(BITS_PER_QUADRANT, '0');
    } else {
      quadBits = '0'.repeat(BITS_PER_QUADRANT);
    }

    // Place real data stones (first 64 positions)
    for (let i = 0; i < BITS_PER_QUADRANT && i < quadPositions.length; i++) {
      const [r, c] = quadPositions[i];
      readingOrder.push({
        pos: [r, c],
        quadrant: quad.name,
        baseColor: quad.baseColor,
        isDummy: false
      });

      if (quadBits[i] === '1') {
        board[r][c] = mixColors ? -1 : quad.baseColor;
        stonesToPlace.push([r, c, quad.baseColor, false]);
      }
    }

    // Place dummy stones (remaining positions)
    for (let i = BITS_PER_QUADRANT; i < quadPositions.length; i++) {
      const [r, c] = quadPositions[i];
      // Deterministic pseudo-random placement using key hash and position
      const shouldPlace = (
        (hashValue * HASH_MULTIPLIER +
         r * ROW_MULTIPLIER +
         c * COL_MULTIPLIER +
         qIdx * QUADRANT_MULTIPLIER) % 100
      ) < DUMMY_STONE_PROBABILITY;

      if (shouldPlace) {
        board[r][c] = mixColors ? -1 : quad.baseColor;
        stonesToPlace.push([r, c, quad.baseColor, true]);
        dummyPositions.add(`${r},${c}`);
      }
    }
  }

  // Assign colors if mixing
  if (mixColors) {
    assignColorsWithValidity(board, stonesToPlace, size);
  }

  return {
    board,
    bitsUsed: 256,
    readingOrder,
    quadrants,
    centerRow,
    centerCol,
    totalStones: stonesToPlace.length,
    dummyCount: dummyPositions.size,
    bitsPerQuadrant: BITS_PER_QUADRANT
  };
};

