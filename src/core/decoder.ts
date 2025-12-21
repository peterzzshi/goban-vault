import type { EncodedResult, DecodedResult } from './types';
import { binaryToHex } from '../utils/keyConverter';
import {TOTAL_BITS, EMPTY, HEX_DISPLAY_BITS} from '../utils/constants';

/**
 * Decode board back to key
 */
export const decodeBoard = (encodedBoard: EncodedResult): DecodedResult => {
  const { board, readingOrder, keyBits } = encodedBoard;
  let decodedBits = '';

  // Only read the first 64 positions of each quadrant (real data)
  // Ignore anything beyond position 64 in each quadrant (dummy stones)
  for (const { pos, isDummy } of readingOrder) {
    if (!isDummy) {
      const [row, col] = pos;
      decodedBits += board[row][col] !== EMPTY ? '1' : '0';
    }
  }

  // Should be exactly 256 bits
  decodedBits = decodedBits.slice(0, TOTAL_BITS);

  return {
    bits: decodedBits,
    // Show first 64 bits (16 hex chars) for display, append "..." to indicate truncation
    hex: binaryToHex(decodedBits, HEX_DISPLAY_BITS) + '...',
    matches: decodedBits === keyBits
  };
};

