import type { Board, ValidationResult } from './types';
import { BLACK, WHITE, EMPTY } from '../utils/constants';

type Position = readonly [number, number];

/**
 * Convert position to string key for Set
 */
const posKey = (row: number, col: number): string => `${row},${col}`;

/**
 * Get valid neighbors for a position
 */
const getNeighbors = (row: number, col: number, size: number): readonly Position[] => {
  const directions: readonly Position[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  return directions
    .map(([dr, dc]): Position => [row + dr, col + dc])
    .filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size);
};

/**
 * Check if a group has liberties
 * Pure from caller's perspective - doesn't mutate inputs
 * IMPLEMENTATION: Creates new Set on first call, then reuses same Set instance during recursion
 * SIDE EFFECT: Mutates the internal visited Set for performance (O(n) vs O(n²))
 */
const hasGroupLiberties = (
  board: Board,
  row: number,
  col: number,
  colour: number,
  size: number,
  visited: Set<string> = new Set()
): boolean => {
  const key = posKey(row, col);

  if (visited.has(key)) return false;

  const cell = board[row][col];
  if (cell === EMPTY) return true;
  if (cell !== colour) return false;

  // Mutable add for performance - visited is internal to this recursion
  visited.add(key);

  return getNeighbors(row, col, size).some(([nr, nc]) =>
    hasGroupLiberties(board, nr, nc, colour, size, visited)
  );
};

/**
 * Get all positions in a group
 */
const getGroupPositions = (
  board: Board,
  row: number,
  col: number,
  colour: number,
  size: number,
  visited: Set<string> = new Set()
): Set<string> => {
  const key = posKey(row, col);

  if (visited.has(key)) return visited;
  if (board[row][col] !== colour) return visited;

  visited.add(key);

  getNeighbors(row, col, size).forEach(([nr, nc]) => {
    getGroupPositions(board, nr, nc, colour, size, visited);
  });

  return visited;
};

/**
 * Check if all groups of a colour have liberties
 */
const allGroupsHaveLiberties = (board: Board, colour: number, size: number): boolean => {
  const checkedPositions = new Set<string>();

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const key = posKey(i, j);

      if (board[i][j] === colour && !checkedPositions.has(key)) {
        if (!hasGroupLiberties(board, i, j, colour, size)) {
          return false;
        }
        const groupPositions = getGroupPositions(board, i, j, colour, size);
        groupPositions.forEach(pos => checkedPositions.add(pos));
      }
    }
  }

  return true;
};

/**
 * Count stones of a specific colour
 */
const countStones = (board: Board, colour: number): number =>
  board.flat().filter(cell => cell === colour).length;

/**
 * Check if a colour exists on the board
 */
const colourExists = (board: Board, colour: number): boolean =>
  board.some(row => row.some(cell => cell === colour));

/**
 * Verify the board follows Go rules (no captured groups)
 */
export const verifyBoard = (board: Board, size: number): ValidationResult => {
  const blackExists = colourExists(board, BLACK);
  const whiteExists = colourExists(board, WHITE);
  const blackStones = countStones(board, BLACK);
  const whiteStones = countStones(board, WHITE);
  const blackAlive = !blackExists || allGroupsHaveLiberties(board, BLACK, size);
  const whiteAlive = !whiteExists || allGroupsHaveLiberties(board, WHITE, size);

  return {
    valid: blackAlive && whiteAlive,
    blackExists,
    whiteExists,
    blackAlive,
    whiteAlive,
    blackStones,
    whiteStones
  };
};

/**
 * Check if a stone can be placed safely at a position
 * Temporarily mutates board cell for performance, then restores original value
 * Safe for single-threaded JavaScript execution
 */
export const canPlaceSafely = (
  board: Board,
  row: number,
  col: number,
  colour: number,
  size: number
): boolean => {
  const originalValue = board[row][col];
  board[row][col] = colour;
  const safe = hasGroupLiberties(board, row, col, colour, size);
  board[row][col] = originalValue;

  return safe;
};

