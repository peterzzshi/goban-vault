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

// Stone colours
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;
export const PENDING_COLOUR = -1; // Marker for stones awaiting colour assignment in mixed mode

// Dummy stone placement probability
export const DUMMY_STONE_PROBABILITY = 40;

// Magic multipliers for deterministic pseudo-random placement
// These prime-like numbers create varied, deterministic patterns
// Used in: (hash × HASH_MULT + row × ROW_MULT + col × COL_MULT + quad × QUAD_MULT) % 100
export const HASH_MULTIPLIER = 7;
export const ROW_MULTIPLIER = 11;
export const COL_MULTIPLIER = 13;
export const QUADRANT_MULTIPLIER = 17;

// colour variation constants for natural appearance
// Used to create organic colour distribution in mixed mode
export const COLOUR_VARIATION_ROW_FACTOR = 7;
export const COLOUR_VARIATION_COL_FACTOR = 11;
export const COLOUR_VARIATION_THRESHOLD = 5; // Modulo divisor for variation pattern
export const COLOUR_VARIATION_FLIP_THRESHOLD = 2; // Values < this flip colour

// Display constants
export const HEX_DISPLAY_BITS = 64; // Show first 64 bits (16 hex chars) in UI
