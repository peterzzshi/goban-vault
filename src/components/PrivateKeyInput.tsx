import { useCallback, useEffect, useMemo, useState, type FC, type ChangeEvent, type KeyboardEvent } from 'react';

import { encodePrivateKey, decodeBoard } from '../core/encoder';
import { validatePrivateKey } from '../core/validation';
import { useGameStore } from '../store';

import type { KeySize } from '../types';
import { KEY_CHAIN_CONFIGS } from '../types';
import './PrivateKeyInput.css';

export const PrivateKeyInput: FC = () => {
    const {
        board,
        setBoard,
        keySize,
        setKeySize,
        seed,
    } = useGameStore();

    const currentKeyConfig = KEY_CHAIN_CONFIGS.find(opt => opt.size === keySize) ?? KEY_CHAIN_CONFIGS[3];
    const maxHexChars = currentKeyConfig?.hexChars ?? 64;

    const decodedFromBoard = useMemo(() => decodeBoard(board, keySize, seed), [board, keySize, seed]);

    const [inputValue, setInputValue] = useState<string>('');
    const [canonicalKey, setCanonicalKey] = useState<string>('');
    const [validationError, setValidationError] = useState<string>('');

    const displayedKey = canonicalKey || decodedFromBoard;

    const hasStones = useMemo(
        () => board.some(row => row.some(cell => cell !== null)),
        [board]
    );
    const editsDivergeFromKey = canonicalKey !== '' && hasStones && decodedFromBoard !== canonicalKey;

    useEffect(() => {
        if (!canonicalKey) return;
        setBoard(encodePrivateKey(canonicalKey, keySize, seed));
    }, [seed, canonicalKey, keySize, setBoard]);

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value.toLowerCase();
            setInputValue(raw);
            setValidationError('');

            // Allow typing, but don't encode until valid
            const validation = validatePrivateKey(raw, maxHexChars);

            if (!validation.valid) {
                setValidationError(validation.error ?? 'Invalid key');
                return;
            }

            const cleanHex = validation.cleanHex ?? '';
            setCanonicalKey(cleanHex);
            setBoard(encodePrivateKey(cleanHex, keySize, seed));
        },
        [maxHexChars, keySize, seed, setBoard]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.currentTarget.blur();
            }
        },
        []
    );

    const handleKeySizeChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const newSize = Number(e.target.value) as KeySize;
            setKeySize(newSize);
            setCanonicalKey('');
            setInputValue('');
            setValidationError('');
        },
        [setKeySize]
    );

    const generateRandom = useCallback(() => {
        const byteCount = maxHexChars / 2;
        const bytes = new Uint8Array(byteCount);
        crypto.getRandomValues(bytes);
        const hex = Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        setInputValue(hex);
        setCanonicalKey(hex);
        setValidationError('');
        setBoard(encodePrivateKey(hex, keySize, seed));
    }, [setBoard, keySize, seed, maxHexChars]);

    const clearAll = useCallback(() => {
        setCanonicalKey('');
        setInputValue('');
        setValidationError('');
        setBoard(encodePrivateKey('', keySize, seed));
    }, [setBoard, keySize, seed]);

    return (
        <div className="private-key-input">
            <div className="key-config-row">
                <div className="config-group">
                    <label htmlFor="key-size">Key Size</label>
                    <select
                        id="key-size"
                        value={keySize}
                        onChange={handleKeySizeChange}
                        className="config-select"
                    >
                        {KEY_CHAIN_CONFIGS.map(opt => (
                            <option key={opt.size} value={opt.size}>
                                {opt.label} ({opt.hexChars} hex) — {opt.chains}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="input-group">
                <label htmlFor="pk-input">Private Key (Hex)</label>
                <input
                    id="pk-input"
                    type="text"
                    value={inputValue || displayedKey}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter exactly ${maxHexChars} hex characters...`}
                    spellCheck={false}
                    autoComplete="off"
                    className={validationError ? 'input-error' : ''}
                />
                <div className="input-status">
                    <span className="char-count">{(inputValue || displayedKey).length}/{maxHexChars}</span>
                    {validationError && (
                        <span className="error-message">⚠️ {validationError}</span>
                    )}
                </div>
            </div>

            {canonicalKey !== '' && hasStones && (
                <div className={`board-decode-readout ${editsDivergeFromKey ? 'diverged' : 'matched'}`}>
                    <span className="readout-label">Board decodes to</span>
                    <code className="readout-value">{decodedFromBoard}</code>
                    <span className="readout-note">
                        {editsDivergeFromKey
                            ? '⚠️ Differs from your key — these edits are your second secret. Memorise them to reverse and recover the key.'
                            : '✓ Matches your key. Edit stones to add your second secret (click positions to mutate the board).'}
                    </span>
                </div>
            )}

            <div className="button-group">
                <button onClick={generateRandom} className="btn-generate">
                    🎲 Generate Random
                </button>
                <button onClick={clearAll} className="btn-clear">
                    🗑️ Clear
                </button>
            </div>

        </div>
    );
};
