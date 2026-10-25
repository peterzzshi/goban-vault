import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle, type ChangeEvent, type KeyboardEvent } from 'react';

import { encodePrivateKey, decodeBoard } from '../core/encoder';
import { validatePrivateKey } from '../core/validation';
import { useGameStore } from '../store';

import { KEY_CHAIN_CONFIGS } from '../types';
import type { InputComponentRef } from '../App';
import './PrivateKeyInput.css';

export const PrivateKeyInput = forwardRef<InputComponentRef>((_, ref) => {
    const {
        board,
        setBoard,
        keySize,
        seed,
    } = useGameStore();

    const currentKeyConfig = KEY_CHAIN_CONFIGS.find(opt => opt.size === keySize) ?? KEY_CHAIN_CONFIGS[3];
    const maxHexChars = currentKeyConfig?.hexChars ?? 64;

    const decodedFromBoard = useMemo(() => decodeBoard(board, keySize, seed), [board, keySize, seed]);

    const [inputValue, setInputValue] = useState<string>('');
    const [canonicalKey, setCanonicalKey] = useState<string>('');
    const [validationError, setValidationError] = useState<string>('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const hasStones = useMemo(
        () => board.some(row => row.some(cell => cell !== null)),
        [board]
    );
    const editsDivergeFromKey = canonicalKey !== '' && hasStones && decodedFromBoard !== canonicalKey;

    // The textarea shows the entered key while typing, then the board's decode
    // once the board is the source of truth.
    const shownValue = inputValue || decodedFromBoard;

    useLayoutEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [shownValue]);

    useEffect(() => {
        if (!canonicalKey) return;
        setBoard(encodePrivateKey(canonicalKey, keySize, seed));
    }, [seed, canonicalKey, keySize, setBoard]);

    useEffect(() => {
        setCanonicalKey('');
        setInputValue('');
        setValidationError('');
    }, [keySize]);

    // When board changes externally and differs from canonical key, clear inputValue to show decoded board
    useEffect(() => {
        if (canonicalKey && decodedFromBoard !== canonicalKey && inputValue) {
            setInputValue('');
        }
    }, [decodedFromBoard, canonicalKey, inputValue]);

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
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
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
            }
        }
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

    useImperativeHandle(ref, () => ({
        generateRandom,
        clearAll,
    }), [generateRandom, clearAll]);

    return (
        <div className="private-key-input">
            <div className="input-group">
                <label htmlFor="pk-input">Private Key (Hex)</label>
                <textarea
                    id="pk-input"
                    ref={textareaRef}
                    value={shownValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter exactly ${maxHexChars} hex characters...`}
                    spellCheck={false}
                    autoComplete="off"
                    rows={1}
                    className={validationError ? 'input-error' : ''}
                />
                <div className="input-status">
                    <span className="char-count">{shownValue.length}/{maxHexChars}</span>
                    {validationError && (
                        <span className="error-message">⚠️ {validationError}</span>
                    )}
                </div>
            </div>

            {editsDivergeFromKey && (
                <p className="edit-note">
                    ⚠️ Board edits changed the decoded key — memorize your edits to recover the original.
                </p>
            )}

        </div>
    );
});
