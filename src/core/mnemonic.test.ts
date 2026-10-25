import { describe, it, expect } from 'vitest';
import * as bip39 from 'bip39';
import {
    mnemonicToHex,
    hexToMnemonic,
    generateMnemonic,
    validateMnemonicWords,
    normalizeMnemonicInput,
    splitMnemonicWords,
    KEY_SIZE_TO_MNEMONIC_WORDS,
} from './mnemonic';

describe('mnemonic', () => {
    describe('KEY_SIZE_TO_MNEMONIC_WORDS', () => {
        it('maps key sizes to correct word counts', () => {
            expect(KEY_SIZE_TO_MNEMONIC_WORDS[64]).toBe(12);
            expect(KEY_SIZE_TO_MNEMONIC_WORDS[128]).toBe(12);
            expect(KEY_SIZE_TO_MNEMONIC_WORDS[256]).toBe(24);
        });
    });

    describe('mnemonicToHex', () => {
        it('converts valid 12-word mnemonic to hex', () => {
            const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
            const result = mnemonicToHex(mnemonic, 128);

            expect(result.valid).toBe(true);
            expect(result.hex).toBeDefined();
            expect(result.hex?.length).toBe(32); // 128 bits = 32 hex chars
        });

        it('converts valid 24-word mnemonic to hex', () => {
            const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art';
            const result = mnemonicToHex(mnemonic, 256);

            expect(result.valid).toBe(true);
            expect(result.hex).toBeDefined();
            expect(result.hex?.length).toBe(64); // 256 bits = 64 hex chars
        });

        it('rejects mnemonic with wrong word count', () => {
            const mnemonic = 'abandon abandon abandon';
            const result = mnemonicToHex(mnemonic, 128);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('Expected 12 words');
        });

        it('rejects invalid mnemonic (bad checksum)', () => {
            const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon';
            const result = mnemonicToHex(mnemonic, 128);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid mnemonic');
        });

        it('rejects mnemonic with invalid words', () => {
            const mnemonic = 'invalid word sequence that does not exist in wordlist foo bar baz';
            const result = mnemonicToHex(mnemonic, 128);

            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('handles extra whitespace', () => {
            const mnemonic = '  abandon  abandon  abandon abandon abandon abandon abandon abandon abandon abandon abandon about  ';
            const result = mnemonicToHex(mnemonic, 128);

            expect(result.valid).toBe(true);
            expect(result.hex).toBeDefined();
        });
    });

    describe('hexToMnemonic', () => {
        it('converts 128-bit hex to 12-word mnemonic', () => {
            const hex = '00000000000000000000000000000000';
            const mnemonic = hexToMnemonic(hex, 128);
            const words = mnemonic.split(' ');

            expect(words.length).toBe(12);
            expect(words.every(w => w.length > 0)).toBe(true);
        });

        it('converts 256-bit hex to 24-word mnemonic', () => {
            const hex = '0000000000000000000000000000000000000000000000000000000000000000';
            const mnemonic = hexToMnemonic(hex, 256);
            const words = mnemonic.split(' ');

            expect(words.length).toBe(24);
            expect(words.every(w => w.length > 0)).toBe(true);
        });

        it('handles hex with 0x prefix', () => {
            const hex = '0x00000000000000000000000000000000';
            const mnemonic = hexToMnemonic(hex, 128);
            const words = mnemonic.split(' ');

            expect(words.length).toBe(12);
        });

        it('pads short hex strings', () => {
            const hex = 'abc123';
            const mnemonic = hexToMnemonic(hex, 128);
            const words = mnemonic.split(' ');

            expect(words.length).toBe(12);
        });

        it('truncates long hex strings', () => {
            const hex = '0'.repeat(100);
            const mnemonic = hexToMnemonic(hex, 128);
            const words = mnemonic.split(' ');

            expect(words.length).toBe(12);
        });
    });

    describe('generateMnemonic', () => {
        it('generates a 12-word mnemonic for 64-bit', () => {
            const mnemonic = generateMnemonic(64);
            const words = mnemonic.split(' ');

            expect(words.length).toBe(12);
            expect(words.every(w => w.length > 0)).toBe(true);
        });

        it('generates 12-word mnemonic for 128-bit', () => {
            const mnemonic = generateMnemonic(128);
            const words = mnemonic.split(' ');

            expect(words.length).toBe(12);
            expect(words.every(w => w.length > 0)).toBe(true);
        });

        it('generates 24-word mnemonic for 256-bit', () => {
            const mnemonic = generateMnemonic(256);
            const words = mnemonic.split(' ');

            expect(words.length).toBe(24);
            expect(words.every(w => w.length > 0)).toBe(true);
        });

        it('generates different mnemonics on each call', () => {
            const mnemonic1 = generateMnemonic(128);
            const mnemonic2 = generateMnemonic(128);

            expect(mnemonic1).not.toBe(mnemonic2);
        });

        it('generates valid mnemonics that can be converted to hex', () => {
            const mnemonic = generateMnemonic(128);
            const result = mnemonicToHex(mnemonic, 128);

            expect(result.valid).toBe(true);
            expect(result.hex).toBeDefined();
        });
    });

    describe('validateMnemonicWords', () => {
        it('validates empty input', () => {
            const result = validateMnemonicWords('', 128);

            expect(result.valid).toBe(true);
            expect(result.hex).toBe('');
        });

        it('validates correct mnemonic', () => {
            const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
            const result = validateMnemonicWords(mnemonic, 128);

            expect(result.valid).toBe(true);
            expect(result.hex).toBeDefined();
        });

        it('rejects invalid mnemonic', () => {
            const mnemonic = 'invalid words here';
            const result = validateMnemonicWords(mnemonic, 128);

            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('handles whitespace', () => {
            const mnemonic = '  abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about  ';
            const result = validateMnemonicWords(mnemonic, 128);

            expect(result.valid).toBe(true);
        });
    });

    describe('round-trip conversion', () => {
        it('hex → mnemonic → hex preserves value', () => {
            const originalHex = 'a1b2c3d4e5f67890a1b2c3d4e5f67890';
            const mnemonic = hexToMnemonic(originalHex, 128);
            const result = mnemonicToHex(mnemonic, 128);

            expect(result.valid).toBe(true);
            expect(result.hex).toBe(originalHex);
        });

        it('mnemonic → hex → mnemonic preserves phrase', () => {
            const originalMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
            const result = mnemonicToHex(originalMnemonic, 128);
            const roundTripMnemonic = hexToMnemonic(result.hex!, 128);

            expect(roundTripMnemonic).toBe(originalMnemonic);
        });

        it('64-bit key round-trips through a 12-word phrase', () => {
            const originalHex = 'a1b2c3d4e5f67890';
            const mnemonic = hexToMnemonic(originalHex, 64);
            const result = mnemonicToHex(mnemonic, 64);

            expect(mnemonic.split(' ').length).toBe(12);
            expect(result.valid).toBe(true);
            expect(result.hex).toBe(originalHex);
        });

        it('produces valid BIP39 phrases for every key size', () => {
            for (const size of [64, 128, 256] as const) {
                const mnemonic = generateMnemonic(size);

                expect(bip39.validateMnemonic(mnemonic)).toBe(true);
            }
        });
    });

    describe('normalizeMnemonicInput', () => {
        it('lowercases and collapses whitespace', () => {
            expect(normalizeMnemonicInput('  ABANDON   about  ')).toBe('abandon about');
        });

        it('treats commas as separators', () => {
            expect(normalizeMnemonicInput('abandon,about')).toBe('abandon about');
        });

        it('trims newlines and tabs', () => {
            expect(normalizeMnemonicInput('abandon\n\tabout')).toBe('abandon about');
        });
    });

    describe('splitMnemonicWords', () => {
        it('splits into words', () => {
            expect(splitMnemonicWords('abandon about')).toEqual(['abandon', 'about']);
        });

        it('returns an empty array for empty input', () => {
            expect(splitMnemonicWords('   ')).toEqual([]);
        });
    });
});
