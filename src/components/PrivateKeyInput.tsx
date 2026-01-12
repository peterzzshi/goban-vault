import { useCallback, useEffect, useRef, useState, type FC, type ChangeEvent, type KeyboardEvent } from 'react';

import { encodePrivateKey, decodeBoard } from '../lib/encoder';
import { useGameStore, type KeySize, type PaddingMode } from '../stores/gameStore';
import './PrivateKeyInput.css';

const KEY_SIZE_OPTIONS: { size: KeySize; hexChars: number; label: string }[] = [
    { size: 64, hexChars: 16, label: '64 bits (16 hex)' },
    { size: 128, hexChars: 32, label: '128 bits (32 hex)' },
    { size: 256, hexChars: 64, label: '256 bits (64 hex)' },
];

const PADDING_MODE_OPTIONS: { mode: PaddingMode; label: string }[] = [
    { mode: 'left', label: 'Pad Left (zeros)' },
    { mode: 'right', label: 'Pad Right (zeros)' },
    { mode: 'none', label: 'No Padding' },
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
        board,
        setBoard,
        spreadPattern,
        keySize,
        setKeySize,
        paddingMode,
        setPaddingMode,
    } = useGameStore();

    const [inputValue, setInputValue] = useState('');
    const [isUserEditing, setIsUserEditing] = useState(false);
    const prevSpreadPatternRef = useRef(spreadPattern);

    const currentKeyConfig = KEY_SIZE_OPTIONS.find(opt => opt.size === keySize) ?? KEY_SIZE_OPTIONS[2];
    const maxHexChars = currentKeyConfig?.hexChars ?? 64;

    const decodedKey = decodeBoard(board, spreadPattern, keySize);

    useEffect(() => {
        if (prevSpreadPatternRef.current !== spreadPattern && inputValue) {
            const newBoard = encodePrivateKey(inputValue, spreadPattern, keySize);
            setBoard(newBoard);
        }
        prevSpreadPatternRef.current = spreadPattern;
    }, [spreadPattern, inputValue, keySize, setBoard]);

    useEffect(() => {
        if (!isUserEditing) {
            const timeoutId = setTimeout(() => {
                setInputValue(decodedKey);
            }, 0);
            return () => clearTimeout(timeoutId);
        }
        return undefined;
    }, [decodedKey, isUserEditing]);

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.replace(/[^0-9a-fA-F]/g, '').toLowerCase().slice(0, maxHexChars);
            setInputValue(value);
            setIsUserEditing(true);
        },
        [maxHexChars]
    );

    const applyKeyToBoard = useCallback(() => {
        setIsUserEditing(false);
        const paddedValue = applyPadding(inputValue, maxHexChars, paddingMode);
        const newBoard = encodePrivateKey(paddedValue, spreadPattern, keySize);
        setBoard(newBoard);
        setInputValue(paddedValue);
    }, [inputValue, maxHexChars, paddingMode, spreadPattern, keySize, setBoard]);

    const handleInputBlur = useCallback(() => {
        applyKeyToBoard();
    }, [applyKeyToBoard]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                applyKeyToBoard();
            }
        },
        [applyKeyToBoard]
    );

    const handleKeySizeChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const newSize = Number(e.target.value) as KeySize;
            setKeySize(newSize);
            setInputValue('');
            setIsUserEditing(false);
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
        setInputValue(hex);
        const newBoard = encodePrivateKey(hex, spreadPattern, keySize);
        setBoard(newBoard);
        setIsUserEditing(false);
    }, [setBoard, spreadPattern, keySize, maxHexChars]);

    const clearAll = useCallback(() => {
        setInputValue('');
        setBoard(encodePrivateKey('', spreadPattern, keySize));
        setIsUserEditing(false);
    }, [setBoard, spreadPattern, keySize]);


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
                <label>Current Key (from board):</label>
                <code>{decodedKey || '(empty)'}</code>
            </div>
        </div>
    );
};
