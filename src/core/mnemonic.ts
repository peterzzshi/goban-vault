import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
import type { KeySize } from '../types';

// Make Buffer available globally for bip39
if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
}

export interface MnemonicValidationResult {
    valid: boolean;
    error?: string;
    hex?: string;
    wordCount?: number;
}

// BIP39 phrases are always 12 or 24 words. A 64-bit key rides along inside a
// 12-word phrase (only its leading 64 entropy bits reach the board), so every
// phrase this module produces is a valid, checksummed BIP39 mnemonic.
export const KEY_SIZE_TO_MNEMONIC_WORDS: Record<KeySize, number> = {
    64: 12,
    128: 12,
    256: 24,
};

// Lowercase and treat commas/whitespace as word separators.
export function normalizeMnemonicInput(input: string): string {
    return input
        .toLowerCase()
        .replace(/[\s,]+/g, ' ')
        .trim();
}

export function splitMnemonicWords(input: string): string[] {
    const normalized = normalizeMnemonicInput(input);
    return normalized.length === 0 ? [] : normalized.split(' ');
}

export function mnemonicToHex(mnemonic: string, keySize: KeySize): MnemonicValidationResult {
    const normalized = normalizeMnemonicInput(mnemonic);
    const words = normalized.split(' ').filter(w => w.length > 0);
    const expectedWords = KEY_SIZE_TO_MNEMONIC_WORDS[keySize];

    if (words.length !== expectedWords) {
        return {
            valid: false,
            error: `Expected ${expectedWords} words for ${keySize}-bit key, got ${words.length}`,
        };
    }

    if (!bip39.validateMnemonic(normalized)) {
        return {
            valid: false,
            error: 'Invalid mnemonic phrase (checksum failed or invalid words)',
        };
    }

    const entropy = bip39.mnemonicToEntropy(normalized);
    const hexChars = keySize / 4;

    // Truncate entropy to exact key size
    const truncatedHex = entropy.slice(0, hexChars);

    return {
        valid: true,
        hex: truncatedHex,
        wordCount: words.length,
    };
}

export function hexToMnemonic(hex: string, keySize: KeySize): string {
    const hexChars = keySize / 4;
    const cleanHex = hex.replace(/^0x/, '').padStart(hexChars, '0').slice(0, hexChars);

    // BIP39 entropy must be 16-32 bytes (128-256 bits)
    // For 64-bit keys, pad to 128 bits minimum
    const minEntropyBits = 128;
    const paddedHex = cleanHex.padEnd(minEntropyBits / 4, '0');

    try {
        const mnemonic = bip39.entropyToMnemonic(paddedHex);
        const expectedWords = KEY_SIZE_TO_MNEMONIC_WORDS[keySize];

        const words = mnemonic.split(' ');
        return words.slice(0, expectedWords).join(' ');
    } catch (error) {
        throw new Error(`Failed to generate mnemonic: ${error}`);
    }
}

export function generateMnemonic(keySize: KeySize): string {
    // Generate random hex directly using Web Crypto API
    const byteCount = keySize / 8;
    const bytes = new Uint8Array(byteCount);
    crypto.getRandomValues(bytes);

    const hex = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return hexToMnemonic(hex, keySize);
}

export function validateMnemonicWords(input: string, keySize: KeySize): MnemonicValidationResult {
    const trimmed = input.trim();

    if (trimmed.length === 0) {
        return { valid: true, hex: '' };
    }

    return mnemonicToHex(trimmed, keySize);
}
