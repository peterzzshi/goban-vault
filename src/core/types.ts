export type Board = number[][];

export interface Quadrant {
  name: string;
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  baseColor: number;
}

export interface Position {
  pos: [number, number];
  quadrant: string;
  baseColor: number;
  isDummy: boolean;
}

export interface EncodedResult {
  board: Board;
  bitsUsed: number;
  readingOrder: Position[];
  quadrants: Quadrant[];
  centerRow: number;
  centerCol: number;
  totalStones: number;
  dummyCount: number;
  bitsPerQuadrant: number;
  keyBits: string;
  verification: ValidationResult;
  size: number;
  mixColors: boolean;
}

export interface ValidationResult {
  valid: boolean;
  blackExists: boolean;
  whiteExists: boolean;
  blackAlive: boolean;
  whiteAlive: boolean;
  blackStones: number;
  whiteStones: number;
}

export interface DecodedResult {
  bits: string;
  hex: string;
  matches: boolean;
}

