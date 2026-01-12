import { useCallback, useEffect, useState, type FC, type ChangeEvent, type KeyboardEvent } from 'react';

import { encodePrivateKey, decodeBoard } from '../lib/encoder';
import { useGameStore, type KeySize, type PaddingMode } from '../stores/gameStore';
import './PrivateKeyInput.css';

const KEY_SIZE_OPTIONS: { size: KeySize; hexChars: number; label: string }[] = [
    { size: 64, hexChars: 16, label: '64 bits (16 hex)' },
    { size: 128, hexChars: 32, label: '128 bits (32 hex)' },
    { size: 256, hexChars: 64, label: '256 bits (64 hex)' },
];

const PADDING_MODE_OPTIONS: { mode: PaddingMode; label: string; description: string }[] = [
    { mode: 'left', label: 'Pad Left (zeros)', description: 'Add zeros at the start' },
    { mode: 'right', label: 'Pad Right (zeros)', description: 'Add zeros at the end' },
    { mode: 'none', label: 'No Padding', description: 'Use input as-is' },
];

const applyPadding = (hex: string, targetLength: number, mode: PaddingMode): string => {
    if (hex.length >= targetLength || mode === 'none') {
        return hex.slice(0, targetLength);
    }
    const padding = '0'.repeat(targetLength - hex.length);
    return mode === 'left' ? padding + hex : hex + padding;
};

export const PrivateKeyInput: FC = () => {
    const {
        privateKey,
        setPrivateKey,
        setBoard,
        board,
        spreadPattern,
        keySize,
        setKeySize,
        paddingMode,
        setPaddingMode,
    } = useGameStore();

    const [inputValue, setInputValue] = useState(privateKey);
    const [isEditing, setIsEditing] = useState(false);

    const currentKeyConfig = KEY_SIZE_OPTIONS.find(opt => opt.size === keySize) ?? KEY_SIZE_OPTIONS[2];
    const maxHexChars = currentKeyConfig?.hexChars ?? 64;

    useEffect(() => {
        if (!isEditing && inputValue !== privateKey) {
            const timeoutId = setTimeout(() => {
                setInputValue(privateKey);
            }, 0);
            return () => clearTimeout(timeoutId);
        }
        return undefined;
    }, [privateKey, isEditing, inputValue]);

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, maxHexChars);
            setInputValue(value);
            setIsEditing(true);
        },
        [maxHexChars]
    );

    const handleInputBlur = useCallback(() => {
        setIsEditing(false);
        if (inputValue !== privateKey) {
            const paddedValue = applyPadding(inputValue, maxHexChars, paddingMode);
            setPrivateKey(paddedValue);
            const newBoard = encodePrivateKey(paddedValue, spreadPattern, keySize);
            setBoard(newBoard);
        }
    }, [inputValue, privateKey, setPrivateKey, setBoard, spreadPattern, keySize, maxHexChars, paddingMode]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleInputBlur();
            }
        },
        [handleInputBlur]
    );

    const handleKeySizeChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const newSize = Number(e.target.value) as KeySize;
            setKeySize(newSize);

            const newConfig = KEY_SIZE_OPTIONS.find(opt => opt.size === newSize);
            if (newConfig && inputValue) {
                const paddedValue = applyPadding(inputValue, newConfig.hexChars, paddingMode);
                setInputValue(paddedValue);
                setPrivateKey(paddedValue);
                const newBoard = encodePrivateKey(paddedValue, spreadPattern, newSize);
                setBoard(newBoard);
            }
        },
        [inputValue, paddingMode, setKeySize, setPrivateKey, setBoard, spreadPattern]
    );

    const handlePaddingModeChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const newMode = e.target.value as PaddingMode;
            setPaddingMode(newMode);
        },
        [setPaddingMode]
    );

    const decodedKey = decodeBoard(board, spreadPattern, keySize);

    const generateRandom = useCallback(() => {
        const byteCount = maxHexChars / 2;
        const bytes = new Uint8Array(byteCount);
        crypto.getRandomValues(bytes);
        const hex = Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        setInputValue(hex);
        setPrivateKey(hex);
        const newBoard = encodePrivateKey(hex, spreadPattern, keySize);
        setBoard(newBoard);
    }, [setPrivateKey, setBoard, spreadPattern, keySize, maxHexChars]);

    const clearAll = useCallback(() => {
        setInputValue('');
        setPrivateKey('');
        setBoard(encodePrivateKey('', spreadPattern, keySize));
    }, [setPrivateKey, setBoard, spreadPattern, keySize]);

    const needsPadding = inputValue.length > 0 && inputValue.length < maxHexChars;

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
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter ${maxHexChars} hex characters...`}
                    maxLength={maxHexChars}
                    spellCheck={false}
                    autoComplete="off"
                />
                <div className="input-status">
                    <span className="char-count">{inputValue.length}/{maxHexChars}</span>
                    {needsPadding && paddingMode !== 'none' && (
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

            <div className="decoded-display">
                <label>Decoded from Board:</label>
                <code className={decodedKey === privateKey ? 'match' : 'mismatch'}>
                    {decodedKey || '(empty)'}
                </code>
                {decodedKey && decodedKey !== privateKey && (
                    <span className="sync-warning">⚠️ Out of sync</span>
                )}
            </div>
        </div>
    );
};
