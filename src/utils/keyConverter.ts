import { TOTAL_BITS } from './constants';

/**
 * Convert various input formats to binary string
 */
export const keyToBinary = (input: string): string => {
  let keyBits: string;

  // Binary input
  if (input.match(/^[01]+$/)) {
    keyBits = input.padEnd(TOTAL_BITS, '0').slice(0, TOTAL_BITS);
  }
  // Hex input
  else if (input.match(/^[0-9a-fA-F]+$/)) {
    keyBits = input
      .split('')
      .map(h => parseInt(h, 16).toString(2).padStart(4, '0'))
      .join('')
      .padEnd(TOTAL_BITS, '0')
      .slice(0, TOTAL_BITS);
  }
  // Text input - convert to hash
  else {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash = hash & hash;
    }
    keyBits = Math.abs(hash).toString(2).padEnd(TOTAL_BITS, '0').slice(0, TOTAL_BITS);
  }

  return keyBits;
};

/**
 * Convert binary string to hex representation
 *
 * @param binary - Binary string to convert
 * @param length - Number of bits to convert (default: 64)
 * @returns Hex string with proper padding
 */
export const binaryToHex = (binary: string, length: number = 64): string => {
  const hexLength = Math.ceil(length / 4); // Each hex char = 4 bits
  return parseInt(binary.slice(0, length), 2).toString(16).padStart(hexLength, '0');
};

/**
 * Generate deterministic hash from binary string
 */
export const keyHash = (keyBits: string): number => {
  return keyBits.split('').reduce((acc, bit, idx) => acc + parseInt(bit) * (idx + 1), 0);
};

