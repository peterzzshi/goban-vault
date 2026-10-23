import { describe, it, expect } from 'vitest';
import { createSeededRandom } from './rng';

describe('createSeededRandom', () => {
    it('produces deterministic sequences for the same seed', () => {
        const rng1 = createSeededRandom(42);
        const rng2 = createSeededRandom(42);

        const seq1 = Array.from({ length: 100 }, () => rng1());
        const seq2 = Array.from({ length: 100 }, () => rng2());

        expect(seq1).toEqual(seq2);
    });

    it('produces different sequences for different seeds', () => {
        const rng1 = createSeededRandom(42);
        const rng2 = createSeededRandom(43);

        const seq1 = Array.from({ length: 100 }, () => rng1());
        const seq2 = Array.from({ length: 100 }, () => rng2());

        expect(seq1).not.toEqual(seq2);
    });

    it('handles zero seed correctly', () => {
        const rng = createSeededRandom(0);
        const values = Array.from({ length: 10 }, () => rng());

        // Should produce values, not crash or return NaN
        expect(values.every(v => !isNaN(v))).toBe(true);
        expect(values.every(v => v >= 0 && v <= 1)).toBe(true);
    });

    it('produces values in [0, 1] range', () => {
        const rng = createSeededRandom(12345);
        const values = Array.from({ length: 1000 }, () => rng());

        expect(values.every(v => v >= 0 && v <= 1)).toBe(true);
    });

    it('is reproducible across instances', () => {
        const rng1 = createSeededRandom(999);
        const first1 = rng1();
        const second1 = rng1();

        const rng2 = createSeededRandom(999);
        const first2 = rng2();
        const second2 = rng2();

        expect(first1).toBe(first2);
        expect(second1).toBe(second2);
    });

    it('produces different values on successive calls', () => {
        const rng = createSeededRandom(777);
        const values = Array.from({ length: 50 }, () => rng());

        // Not all values should be identical
        const uniqueValues = new Set(values);
        expect(uniqueValues.size).toBeGreaterThan(1);
    });
});
