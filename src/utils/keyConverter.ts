import { TOTAL_BITS } from './constants';

/**
 * Pad or truncate binary string to exact length
 */
const normalizeBinaryLength = (binary: string, length: number): string =>
  binary.padEnd(length, '0').slice(0, length);

/**
 * Convert hex character to binary (4 bits)
 */
const hexToBinary = (hexChar: string): string =>
  parseInt(hexChar, 16).toString(2).padStart(4, '0');

/**
 * Hash text to number using DJB2 algorithm
 * Returns unsigned 32-bit integer
 *
 * Note: Uses >>> 0 to ensure unsigned conversion (differs from original implementation
 * which used hash & hash). This produces different hash values than the old version.
 */
const hashText = (text: string): number =>
  text.split('').reduce(
    (hash, char) => (((hash << 5) - hash) + char.charCodeAt(0)) >>> 0,
    0
  );

/**
 * Convert hex string to binary
 */
const hexStringToBinary = (hex: string): string =>
  hex.split('').map(hexToBinary).join('');

/**
 * Convert text to binary via hashing
 */
const textToBinary = (text: string): string =>
  hashText(text).toString(2);

/**
 * Detect input type and convert to binary
 * Supports: binary (01), hex (0-9a-f), or text (hashed)
 */
const detectAndConvert = (input: string): string => {
  if (/^[01]+$/.test(input)) return input;
  if (/^[0-9a-fA-F]+$/.test(input)) return hexStringToBinary(input);
  return textToBinary(input);
};

/**
 * Convert various input formats to 256-bit binary string
 */
export const keyToBinary = (input: string): string =>
  normalizeBinaryLength(detectAndConvert(input), TOTAL_BITS);

/**
 * Convert binary string to hex representation
 */
export const binaryToHex = (binary: string, length: number = 64): string => {
  const hexLength = Math.ceil(length / 4);
  const trimmedBinary = binary.slice(0, length);
  return parseInt(trimmedBinary, 2).toString(16).padStart(hexLength, '0');
};

/**
 * Generate deterministic hash from binary string
 * Uses modulo to prevent overflow for long bit strings
 */
export const keyHash = (keyBits: string): number =>
  keyBits.split('').reduce(
    (acc, bit, idx) => (acc + parseInt(bit, 10) * (idx + 1)) % Number.MAX_SAFE_INTEGER,
    0
  );

