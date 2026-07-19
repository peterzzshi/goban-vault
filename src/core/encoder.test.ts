import { describe, expect, it } from 'vitest';

import { decodeBoard, encodePrivateKey } from './encoder';

import type { KeySize } from '../types';

const KEY_SIZES: KeySize[] = [64, 128, 256];

function randomHex(chars: number): string {
    const digits = '0123456789abcdef';
    let out = '';
    for (let i = 0; i < chars; i++) {
        out += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return out;
}

describe('encode/decode round-trip', () => {
    for (const keySize of KEY_SIZES) {
        it(`recovers any ${keySize}-bit key exactly`, () => {
            const hexChars = keySize / 4;
            for (let trial = 0; trial < 500; trial++) {
                const seed = Math.floor(Math.random() * 100_000);
                const key = randomHex(hexChars);
                const board = encodePrivateKey(key, keySize, seed);
                expect(decodeBoard(board, keySize, seed)).toBe(key);
            }
        });
    }

    it('is deterministic for a given key and seed', () => {
        const first = encodePrivateKey('deadbeef', 64, 42);
        const second = encodePrivateKey('deadbeef', 64, 42);
        expect(second).toStrictEqual(first);
    });
});
