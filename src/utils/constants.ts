// Board configuration constants
export const BOARD_SIZE = 19;
export const BITS_PER_QUADRANT = 64;
export const TOTAL_BITS = 256;
export const CELL_SIZE = 20;

// Star point positions on 19x19 board
export const STAR_POINTS: readonly (readonly [number, number])[] = [
  [3, 3], [3, 9], [3, 15],
  [9, 3], [9, 9], [9, 15],
  [15, 3], [15, 9], [15, 15]
];

// Stone colors
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

// Dummy stone placement probability
export const DUMMY_STONE_PROBABILITY = 40;

