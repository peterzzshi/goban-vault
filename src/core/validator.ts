import type { Board, ValidationResult } from './types';
import { BLACK, WHITE } from '../utils/constants';

/**
 * Check if a group has liberties (empty adjacent spaces)
 */
const checkGroupLiberties = (
  board: Board,
  visited: boolean[][],
  row: number,
  col: number,
  color: number,
  size: number
): boolean => {
  if (row < 0 || row >= size || col < 0 || col >= size) return false;
  if (visited[row][col]) return false;

  const cell = board[row][col];
  if (cell === 0) return true;
  if (cell !== color) return false;

  visited[row][col] = true;

  return (
    checkGroupLiberties(board, visited, row - 1, col, color, size) ||
    checkGroupLiberties(board, visited, row + 1, col, color, size) ||
    checkGroupLiberties(board, visited, row, col - 1, color, size) ||
    checkGroupLiberties(board, visited, row, col + 1, color, size)
  );
};

/**
 * Mark all stones in a group as visited
 */
const markGroup = (
  board: Board,
  visited: boolean[][],
  row: number,
  col: number,
  color: number,
  size: number
): void => {
  if (row < 0 || row >= size || col < 0 || col >= size) return;
  if (visited[row][col] || board[row][col] !== color) return;

  visited[row][col] = true;

  markGroup(board, visited, row - 1, col, color, size);
  markGroup(board, visited, row + 1, col, color, size);
  markGroup(board, visited, row, col - 1, color, size);
  markGroup(board, visited, row, col + 1, color, size);
};

/**
 * Check if all groups of a color have liberties
 */
const hasLiberties = (board: Board, color: number, size: number): boolean => {
  const visited = Array(size).fill(null).map(() => Array(size).fill(false));

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] === color && !visited[i][j]) {
        const groupVisited = Array(size).fill(null).map(() => Array(size).fill(false));
        if (!checkGroupLiberties(board, groupVisited, i, j, color, size)) {
          return false;
        }
        markGroup(board, visited, i, j, color, size);
      }
    }
  }
  return true;
};

/**
 * Verify the board follows Go rules
 */
export const verifyBoard = (board: Board, size: number): ValidationResult => {
  const blackExists = board.some(row => row.some(cell => cell === BLACK));
  const whiteExists = board.some(row => row.some(cell => cell === WHITE));

  const blackStones = board.flat().filter(c => c === BLACK).length;
  const whiteStones = board.flat().filter(c => c === WHITE).length;

  const blackAlive = !blackExists || hasLiberties(board, BLACK, size);
  const whiteAlive = !whiteExists || hasLiberties(board, WHITE, size);

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
 */
export const canPlaceSafely = (
  board: Board,
  row: number,
  col: number,
  color: number,
  size: number
): boolean => {
  board[row][col] = color;
  const visited = Array(size).fill(null).map(() => Array(size).fill(false));
  const safe = checkGroupLiberties(board, visited, row, col, color, size);
  board[row][col] = -1;
  return safe;
};

