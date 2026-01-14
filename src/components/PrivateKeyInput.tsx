import { useCallback, useEffect, useRef, type FC, type ChangeEvent, type KeyboardEvent } from 'react';

import { encodePrivateKey, decodeBoard } from '../core/encoder';
import { useGameStore } from '../store';

import type { KeySize, PaddingMode } from '../types';
import './PrivateKeyInput.css';

const KEY_SIZE_OPTIONS: { size: KeySize; hexChars: number; label: string }[] = [
    { size: 64, hexChars: 16, label: '64 bits (16 hex)' },
    { size: 128, hexChars: 32, label: '128 bits (32 hex)' },
    { size: 256, hexChars: 64, label: '256 bits (64 hex)' },
];

const PADDING_MODE_OPTIONS: { mode: PaddingMode; label: string }[] = [
    { mode: 'left', label: 'Pad Left (zeros)' },
    { mode: 'right', label: 'Pad Right (zeros)' },
];

const applyPadding = (hex: string, targetLength: number, mode: PaddingMode): string => {
    if (hex.length >= targetLength) {
        return hex.slice(0, targetLength);
    }
    const padding = '0'.repeat(targetLength - hex.length);
    return mode === 'left' ? padding + hex : hex + padding;
};

export const PrivateKeyInput: FC = () => {
    const {
        board,
        setBoard,
        keySize,
        setKeySize,
        paddingMode,
        setPaddingMode,
        seed,
    } = useGameStore();

    const prevSeedRef = useRef(seed);

    const currentKeyConfig = KEY_SIZE_OPTIONS.find(opt => opt.size === keySize) ?? KEY_SIZE_OPTIONS[2];
    const maxHexChars = currentKeyConfig?.hexChars ?? 64;

    const decodedKey = decodeBoard(board, keySize, seed);

    useEffect(() => {
        const seedChanged = prevSeedRef.current !== seed;

        if (seedChanged && decodedKey) {
            const newBoard = encodePrivateKey(decodedKey, keySize, seed);
            setBoard(newBoard);
        }
        prevSeedRef.current = seed;
    }, [seed, decodedKey, keySize, setBoard]);

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.replace(/[^0-9a-fA-F]/g, '').toLowerCase().slice(0, maxHexChars);
            const paddedValue = applyPadding(value, maxHexChars, paddingMode);
            const newBoard = encodePrivateKey(paddedValue, keySize, seed);
            setBoard(newBoard);
        },
        [maxHexChars, paddingMode, keySize, seed, setBoard]
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
        },
        [setKeySize]
    );

    const handlePaddingModeChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            setPaddingMode(e.target.value as PaddingMode);
        },
        [setPaddingMode]
    );

    const generateRandom = useCallback(() => {
        const byteCount = maxHexChars / 2;
        const bytes = new Uint8Array(byteCount);
        crypto.getRandomValues(bytes);
        const hex = Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        const newBoard = encodePrivateKey(hex, keySize, seed);
        setBoard(newBoard);
    }, [setBoard, keySize, seed, maxHexChars]);

    const clearAll = useCallback(() => {
        setBoard(encodePrivateKey('', keySize, seed));
    }, [setBoard, keySize, seed]);

    const needsPadding = decodedKey.length > 0 && decodedKey.length < maxHexChars;

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
                        {KEY_SIZE_OPTIONS.map(opt => (
                            <option key={opt.size} value={opt.size}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="config-group">
                    <label htmlFor="padding-mode">Padding</label>
                    <select
                        id="padding-mode"
                        value={paddingMode}
                        onChange={handlePaddingModeChange}
                        className="config-select"
                    >
                        {PADDING_MODE_OPTIONS.map(opt => (
                            <option key={opt.mode} value={opt.mode}>
                                {opt.label}
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
                    value={decodedKey}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter ${maxHexChars} hex characters...`}
                    maxLength={maxHexChars}
                    spellCheck={false}
                    autoComplete="off"
                />
                <div className="input-status">
                    <span className="char-count">{decodedKey.length}/{maxHexChars}</span>
                    {needsPadding && (
                        <span className="padding-hint">
                            Will pad {paddingMode === 'left' ? 'left' : 'right'} with zeros
                        </span>
                    )}
                </div>
            </div>

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
