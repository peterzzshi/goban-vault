import type { Board } from './types';
import { canPlaceSafely } from './validator';
import {
  BLACK,
  COLOUR_VARIATION_COL_FACTOR,
  COLOUR_VARIATION_FLIP_THRESHOLD,
  COLOUR_VARIATION_ROW_FACTOR,
  COLOUR_VARIATION_THRESHOLD,
  EMPTY,
  WHITE,
} from '../utils/constants';

type StoneInfo = readonly [number, number, number, boolean]; // [row, col, baseColour, isDummy]

type NeighborInfo = {
  readonly empty: number;
  readonly black: number;
  readonly white: number;
};

type Direction = readonly [number, number];
const DIRECTIONS: readonly Direction[] = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;

/**
 * Get neighbor information for a position (pure function)
 */
const getNeighborInfo = (board: Board, row: number, col: number, size: number): NeighborInfo => {
  const neighbors = DIRECTIONS
    .map(([dr, dc]): readonly [number, number] => [row + dr, col + dc])
    .filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)
    .map(([r, c]) => board[r][c]);

  return {
    empty: neighbors.filter(cell => cell === EMPTY).length,
    black: neighbors.filter(cell => cell === BLACK).length,
    white: neighbors.filter(cell => cell === WHITE).length
  };
};

/**
 * Calculate colour variation based on position (pure function)
 */
const calculateColourVariation = (row: number, col: number): number =>
  (row * COLOUR_VARIATION_ROW_FACTOR + col * COLOUR_VARIATION_COL_FACTOR) % COLOUR_VARIATION_THRESHOLD;

/**
 * Determine if colour should be flipped for natural appearance (pure function)
 */
const shouldFlipColour = (row: number, col: number, isDummy: boolean): boolean =>
  !isDummy && calculateColourVariation(row, col) < COLOUR_VARIATION_FLIP_THRESHOLD;

/**
 * Choose colour based on safety and neighbors (pure function)
 */
const chooseColourSafely = (
  board: Board,
  row: number,
  col: number,
  baseColour: number,
  neighborInfo: NeighborInfo,
  size: number
): number => {
  const { empty, black, white } = neighborInfo;

  // Prefer black if it has neighbors and is safe
  if (black > 0 && canPlaceSafely(board, row, col, BLACK, size)) {
    return BLACK;
  }

  // Prefer white if it has neighbors and is safe
  if (white > 0 && canPlaceSafely(board, row, col, WHITE, size)) {
    return WHITE;
  }

  // Fall back to base colour or balance
  return empty === 0 ? (black <= white ? BLACK : WHITE) : baseColour;
};

/**
 * Determine colour for a stone (pure function)
 */
const determineStoneColour = (
  board: Board,
  row: number,
  col: number,
  baseColour: number,
  isDummy: boolean,
  size: number
): number => {
  const neighborInfo = getNeighborInfo(board, row, col, size);

  // Safe placement with 2+ empty neighbors - can vary colour
  if (neighborInfo.empty >= 2) {
    return shouldFlipColour(row, col, isDummy)
      ? (baseColour === BLACK ? WHITE : BLACK)
      : baseColour;
  }

  // Tight placement - choose based on safety
  if (neighborInfo.empty === 1) {
    return chooseColourSafely(board, row, col, baseColour, neighborInfo, size);
  }

  // No empty neighbors - must be very careful
  return chooseColourSafely(board, row, col, baseColour, neighborInfo, size);
};

/**
 * Sort stones by board position for consistent placement (pure function)
 */
const sortStonesByPosition = (stones: readonly StoneInfo[], size: number): readonly StoneInfo[] =>
  [...stones].sort((a, b) => {
    const [r1, c1] = a;
    const [r2, c2] = b;
    return (r1 * size + c1) - (r2 * size + c2);
  });

/**
 * Assign colours to stones ensuring Go validity
 * Mutates the board in place
 */
export const assignColoursWithValidity = (
  board: Board,
  stones: readonly StoneInfo[],
  size: number
): void => {
  const sortedStones = sortStonesByPosition(stones, size);

  for (const [row, col, baseColour, isDummy] of sortedStones) {
    board[row][col] = determineStoneColour(board, row, col, baseColour, isDummy, size);
  }
};
