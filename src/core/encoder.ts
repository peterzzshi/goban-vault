import type { Board, Quadrant, Position } from './types';
import { assignColoursWithValidity } from './colourAssigner';
import { keyHash } from '../utils/keyConverter';
import {
    BOARD_SIZE,
    BITS_PER_QUADRANT,
    EMPTY,
    WHITE,
    PENDING_COLOUR,
    DUMMY_STONE_PROBABILITY,
    HASH_MULTIPLIER,
    ROW_MULTIPLIER,
    COL_MULTIPLIER,
    QUADRANT_MULTIPLIER
} from '../utils/constants';

type StoneInfo = readonly [number, number, number, boolean]; // [row, col, baseColour, isDummy]

/**
 * Create empty board
 */
const createEmptyBoard = (size: number): Board =>
  Array.from({ length: size }, () => Array(size).fill(EMPTY));

/**
 * Create the four quadrants of the Go board
 */
const createQuadrants = (size: number): readonly Quadrant[] => {
  const centerRow = Math.floor(size / 2);
  const centerCol = Math.floor(size / 2);

  return [
    {
      name: 'Top-Left',
      startRow: 0,
      endRow: centerRow - 1,
      startCol: 0,
      endCol: centerCol - 1,
      baseColour: 1
    },
    {
      name: 'Top-Right',
      startRow: 0,
      endRow: centerRow - 1,
      startCol: centerCol + 1,
      endCol: size - 1,
      baseColour: 2
    },
    {
      name: 'Bottom-Left',
      startRow: centerRow + 1,
      endRow: size - 1,
      startCol: 0,
      endCol: centerCol - 1,
      baseColour: 2
    },
    {
      name: 'Bottom-Right',
      startRow: centerRow + 1,
      endRow: size - 1,
      startCol: centerCol + 1,
      endCol: size - 1,
      baseColour: 1
    }
  ] as const;
};

/**
 * Get all positions in a quadrant (row by row)
 */
const getQuadrantPositions = (quad: Quadrant): readonly (readonly [number, number])[] => {
  const positions: (readonly [number, number])[] = [];
  for (let r = quad.startRow; r <= quad.endRow; r++) {
    for (let c = quad.startCol; c <= quad.endCol; c++) {
      positions.push([r, c] as const);
    }
  }
  return positions;
};

/**
 * Get bits for a specific quadrant
 */
const getQuadrantBits = (keyBits: string, quadrantIndex: number): string => {
  const startBit = quadrantIndex * BITS_PER_QUADRANT;
  const endBit = Math.min(startBit + BITS_PER_QUADRANT, keyBits.length);

  if (startBit >= keyBits.length) {
    return '0'.repeat(BITS_PER_QUADRANT);
  }

  return keyBits.slice(startBit, endBit).padEnd(BITS_PER_QUADRANT, '0');
};

/**
 * Determine if dummy stone should be placed
 */
const shouldPlaceDummyStone = (
  hashValue: number,
  row: number,
  col: number,
  quadrantIndex: number
): boolean => {
  const pseudoRandom = (
    hashValue * HASH_MULTIPLIER +
    row * ROW_MULTIPLIER +
    col * COL_MULTIPLIER +
    quadrantIndex * QUADRANT_MULTIPLIER
  ) % 100;

  return pseudoRandom < DUMMY_STONE_PROBABILITY;
};

/**
 * Create reading order for data stones
 */
const createDataStonePositions = (
  quadrant: Quadrant,
  positions: readonly (readonly [number, number])[]
): readonly Position[] => {
  const dataPositions: Position[] = [];

  for (let i = 0; i < BITS_PER_QUADRANT && i < positions.length; i++) {
    const [r, c] = positions[i];
    dataPositions.push({
      pos: [r, c] as const,
      quadrant: quadrant.name,
      baseColour: quadrant.baseColour,
      isDummy: false
    });
  }

  return dataPositions;
};

/**
 * Create stones to place for data bits
 */
const createDataStones = (
  quadBits: string,
  positions: readonly (readonly [number, number])[],
  baseColour: number
): readonly StoneInfo[] => {
  const stones: StoneInfo[] = [];

  for (let i = 0; i < BITS_PER_QUADRANT && i < positions.length; i++) {
    if (quadBits[i] === '1') {
      const [r, c] = positions[i];
      stones.push([r, c, baseColour, false] as const);
    }
  }

  return stones;
};

/**
 * Create dummy stones for remaining positions
 */
const createDummyStones = (
  positions: readonly (readonly [number, number])[],
  baseColour: number,
  hashValue: number,
  quadrantIndex: number
): readonly StoneInfo[] => {
  const dummyStones: StoneInfo[] = [];

  for (let i = BITS_PER_QUADRANT; i < positions.length; i++) {
    const [r, c] = positions[i];
    if (shouldPlaceDummyStone(hashValue, r, c, quadrantIndex)) {
      dummyStones.push([r, c, baseColour, true] as const);
    }
  }

  return dummyStones;
};

/**
 * Process a single quadrant
 */
const processQuadrant = (
  quadrant: Quadrant,
  quadrantIndex: number,
  keyBits: string,
  hashValue: number
): {
  readonly readingOrder: readonly Position[];
  readonly stones: readonly StoneInfo[];
  readonly dummyCount: number;
} => {
  const positions = getQuadrantPositions(quadrant);
  const quadBits = getQuadrantBits(keyBits, quadrantIndex);

  const readingOrder = createDataStonePositions(quadrant, positions);
  const dataStones = createDataStones(quadBits, positions, quadrant.baseColour);
  const dummyStones = createDummyStones(positions, quadrant.baseColour, hashValue, quadrantIndex);

  return {
    readingOrder,
    stones: [...dataStones, ...dummyStones],
    dummyCount: dummyStones.length
  };
};

/**
 * Encode key bits with natural filling including dummy stones
 *
 * @param keyBits - 256-bit binary string to encode
 * @param size - Board size (default: 19)
 * @param mixColours - If true, applies colour variation; if false, uses all white stones
 * @returns Encoded board with metadata
 *
 * Note: assignColoursWithValidity always finds valid placements that follow Go rules.
 * It adjusts colours as needed to ensure no captured groups exist.
 */
export const encodeWithDummyStones = (
  keyBits: string,
  size: number = BOARD_SIZE,
  mixColours: boolean = false
) => {
  const board = createEmptyBoard(size);
  const centerRow = Math.floor(size / 2);
  const centerCol = Math.floor(size / 2);
  const quadrants = createQuadrants(size);
  const hashValue = keyHash(keyBits);

  const quadrantResults = quadrants.map((quad, idx) =>
    processQuadrant(quad, idx, keyBits, hashValue)
  );

  const readingOrder = quadrantResults.flatMap(r => r.readingOrder);
  const allStones = quadrantResults.flatMap(r => r.stones);
  const totalDummyCount = quadrantResults.reduce((sum, r) => sum + r.dummyCount, 0);

  // Place stones on board
  if (mixColours) {
    for (const [r, c] of allStones) {
      board[r][c] = PENDING_COLOUR;
    }
    assignColoursWithValidity(board, allStones, size);
  } else {
    for (const [r, c] of allStones) {
      board[r][c] = WHITE;
    }
  }

  return {
    board,
    bitsUsed: 256,
    readingOrder,
    quadrants,
    centerRow,
    centerCol,
    totalStones: allStones.length,
    dummyCount: totalDummyCount,
    bitsPerQuadrant: BITS_PER_QUADRANT
  } as const;
};

