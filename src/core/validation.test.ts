import { describe, it, expect } from 'vitest';
import { validatePrivateKey } from './validation';

describe('validatePrivateKey', () => {
    it('accepts valid full-length hex keys', () => {
        const result = validatePrivateKey('0123456789abcdef', 16);
        expect(result.valid).toBe(true);
        expect(result.cleanHex).toBe('0123456789abcdef');
    });

    it('accepts hex with 0x prefix', () => {
        const result = validatePrivateKey('0x0123456789abcdef', 16);
        expect(result.valid).toBe(true);
        expect(result.cleanHex).toBe('0123456789abcdef');
    });

    it('accepts uppercase hex', () => {
        const result = validatePrivateKey('0123456789ABCDEF', 16);
        expect(result.valid).toBe(true);
        expect(result.cleanHex).toBe('0123456789abcdef');
    });

    it('accepts empty input', () => {
        const result = validatePrivateKey('', 16);
        expect(result.valid).toBe(true);
        expect(result.cleanHex).toBe('');
    });

    it('rejects keys with invalid characters', () => {
        const result = validatePrivateKey('ghijklmnop', 16);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid hex characters');
    });

    it('rejects incomplete keys', () => {
        const result = validatePrivateKey('0123456789', 16);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Key too short');
    });

    it('truncates keys that are too long', () => {
        const result = validatePrivateKey('0123456789abcdef0000', 16);
        expect(result.valid).toBe(true);
        expect(result.cleanHex).toBe('0123456789abcdef');
    });

    it('validates 256-bit keys correctly', () => {
        const key64 = '0'.repeat(64);
        const result = validatePrivateKey(key64, 64);
        expect(result.valid).toBe(true);
        expect(result.cleanHex).toBe(key64);
    });

    it('rejects incomplete 256-bit keys', () => {
        const key63 = '0'.repeat(63);
        const result = validatePrivateKey(key63, 64);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Key too short');
    });
});
