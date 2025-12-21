import type { Board } from './types';
import { canPlaceSafely } from './validator';
import {
    BLACK,
    WHITE,
    EMPTY,
    COLOR_VARIATION_ROW_FACTOR,
    COLOR_VARIATION_COL_FACTOR,
    COLOR_VARIATION_THRESHOLD, COLOR_VARIATION_FLIP_THRESHOLD
} from '../utils/constants';

type StoneInfo = [number, number, number, boolean]; // [row, col, baseColor, isDummy]

interface NeighborInfo {
  empty: number;
  black: number;
  white: number;
}

/**
 * Assign colors to stones ensuring Go validity
 */
export const assignColorsWithValidity = (
  board: Board,
  stones: StoneInfo[],
  size: number
): void => {
  // Sort stones by board position for consistent placement
  stones.sort((a, b) => {
    const [r1, c1] = a;
    const [r2, c2] = b;
    return (r1 * size + c1) - (r2 * size + c2);
  });

  for (const [row, col, baseColor, isDummy] of stones) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const neighborInfo: NeighborInfo = { empty: 0, black: 0, white: 0 };

    // Analyze neighbors
    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (board[nr][nc] === EMPTY) neighborInfo.empty++;
        else if (board[nr][nc] === BLACK) neighborInfo.black++;
        else if (board[nr][nc] === WHITE) neighborInfo.white++;
      }
    }

    // Assign color based on neighbors and safety
    if (neighborInfo.empty >= 2) {
      // Safe - vary color for natural appearance using position-based pattern
      const variation = (
        row * COLOR_VARIATION_ROW_FACTOR +
        col * COLOR_VARIATION_COL_FACTOR
      ) % COLOR_VARIATION_THRESHOLD;

      // Flip color for some positions to create natural distribution
      if (variation < COLOR_VARIATION_FLIP_THRESHOLD && !isDummy) {
        board[row][col] = baseColor === BLACK ? WHITE : BLACK;
      } else {
        board[row][col] = baseColor;
      }
    } else if (neighborInfo.empty === 1) {
      if (neighborInfo.black > 0 && canPlaceSafely(board, row, col, BLACK, size)) {
        board[row][col] = BLACK;
      } else if (neighborInfo.white > 0 && canPlaceSafely(board, row, col, WHITE, size)) {
        board[row][col] = WHITE;
      } else {
        board[row][col] = baseColor;
      }
    } else {
      if (neighborInfo.black > 0 && canPlaceSafely(board, row, col, BLACK, size)) {
        board[row][col] = BLACK;
      } else if (neighborInfo.white > 0 && canPlaceSafely(board, row, col, WHITE, size)) {
        board[row][col] = WHITE;
      } else {
        board[row][col] = neighborInfo.black <= neighborInfo.white ? BLACK : WHITE;
      }
    }
  }
};

