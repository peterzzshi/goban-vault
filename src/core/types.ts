export type Board = number[][];

export type Quadrant = {
  readonly name: string;
  readonly startRow: number;
  readonly endRow: number;
  readonly startCol: number;
  readonly endCol: number;
  readonly baseColour: number;
};

export type Position = {
  readonly pos: readonly [number, number];
  readonly quadrant: string;
  readonly baseColour: number;
  readonly isDummy: boolean;
};

export type EncodedResult = {
  readonly board: Board;
  readonly bitsUsed: number;
  readonly readingOrder: readonly Position[];
  readonly quadrants: readonly Quadrant[];
  readonly centerRow: number;
  readonly centerCol: number;
  readonly totalStones: number;
  readonly dummyCount: number;
  readonly bitsPerQuadrant: number;
  readonly keyBits: string;
  readonly verification: ValidationResult;
  readonly size: number;
  readonly mixColours: boolean;
};

export type ValidationResult = {
  readonly valid: boolean;
  readonly blackExists: boolean;
  readonly whiteExists: boolean;
  readonly blackAlive: boolean;
  readonly whiteAlive: boolean;
  readonly blackStones: number;
  readonly whiteStones: number;
};

export type DecodedResult = {
  readonly bits: string;
  readonly hex: string;
  readonly matches: boolean;
};

