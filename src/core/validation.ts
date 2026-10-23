export interface ValidationResult {
    valid: boolean;
    error?: string;
    cleanHex?: string;
}

export function validatePrivateKey(
    input: string,
    expectedHexChars: number
): ValidationResult {
    const cleaned = input.replace(/^0x/, '').toLowerCase();

    // Check for invalid characters
    if (!/^[0-9a-f]*$/.test(cleaned)) {
        return {
            valid: false,
            error: 'Invalid hex characters (only 0-9, a-f allowed)',
        };
    }

    // Empty input is valid (will produce empty board)
    if (cleaned.length === 0) {
        return { valid: true, cleanHex: '' };
    }

    // Reject incomplete keys
    if (cleaned.length < expectedHexChars) {
        return {
            valid: false,
            error: `Key too short: ${cleaned.length} chars, expected ${expectedHexChars}`,
        };
    }

    // Truncate if too long
    const finalHex = cleaned.slice(0, expectedHexChars);

    return { valid: true, cleanHex: finalHex };
}
