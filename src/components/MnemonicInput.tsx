import { useCallback, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle, type ChangeEvent, type KeyboardEvent } from 'react';
import * as bip39 from 'bip39';

import { encodePrivateKey, decodeBoard } from '../core/encoder';
import {
    mnemonicToHex,
    hexToMnemonic,
    generateMnemonic,
    KEY_SIZE_TO_MNEMONIC_WORDS,
} from '../core/mnemonic';
import { useGameStore } from '../store';
import type { InputComponentRef } from '../App';

import './MnemonicInput.css';

const WORDLIST = bip39.wordlists.english as string[];

const GRID_COLUMNS: Record<number, number> = {
    12: 3,
    24: 4,
};

// BIP39 words are 3–8 characters. Boxes are sized to their content so a word
// is always fully readable instead of being clipped by a fixed-width input.
const MIN_WORD_CHARS = 8;

export const MnemonicInput = forwardRef<InputComponentRef>((_, ref) => {
    const {
        board,
        setBoard,
        keySize,
        seed,
    } = useGameStore();

    const expectedWords = KEY_SIZE_TO_MNEMONIC_WORDS[keySize];
    const columns = GRID_COLUMNS[expectedWords] ?? 4;

    const decodedFromBoard = useMemo(() => decodeBoard(board, keySize, seed), [board, keySize, seed]);
    const hasStones = useMemo(
        () => board.some(row => row.some(cell => cell !== null)),
        [board]
    );

    // The phrase the board currently represents (entropy + checksum recomputed).
    const boardWords = useMemo(() => {
        if (!hasStones) return null;
        try {
            return hexToMnemonic(decodedFromBoard, keySize).split(' ');
        } catch {
            return null;
        }
    }, [decodedFromBoard, keySize, hasStones]);

    // `cells` is the phrase the user is drafting. The grid shows the draft while
    // editing and the board's decode the rest of the time, so both stay in sync.
    const [cells, setCells] = useState<string[]>([]);
    const [draftActive, setDraftActive] = useState(false);
    const [canonicalHex, setCanonicalHex] = useState<string>('');
    const [draftHex, setDraftHex] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [focusTarget, setFocusTarget] = useState<number | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const displayWords = draftActive ? cells : (boardWords ?? []);

    // Each column is as wide as its longest word, so no input is ever clipped.
    const columnWidths = useMemo(() => {
        const widths: number[] = new Array<number>(columns).fill(MIN_WORD_CHARS);
        displayWords.forEach((word, index) => {
            const column = index % columns;
            widths[column] = Math.max(widths[column] ?? MIN_WORD_CHARS, word.trim().length);
        });
        return widths;
    }, [displayWords, columns]);

    const widthFor = useCallback(
        (index: number) => Math.max(columnWidths[index % columns] ?? MIN_WORD_CHARS, 3),
        [columnWidths, columns]
    );

    const filledCount = useMemo(
        () => cells.filter(word => word.trim().length > 0).length,
        [cells]
    );

    // The board was edited outside the grid, so the phrase it now decodes to
    // differs from the one the user entered.
    const boardDiverged = useMemo(
        () => canonicalHex !== '' && decodedFromBoard !== canonicalHex,
        [canonicalHex, decodedFromBoard]
    );

    // Validate the draft; only a well-formed BIP39 phrase may reach the board.
    useEffect(() => {
        if (!draftActive) return;

        const trimmed = cells.map(word => word.trim());
        const filled = trimmed.filter(word => word.length > 0);

        if (filled.length === 0) {
            // Nothing typed — fall back to showing the board again.
            setDraftActive(false);
            setDraftHex('');
            setError('');
            return;
        }

        if (filled.length < expectedWords) {
            setDraftHex('');
            setError(`Enter all ${expectedWords} words (${filled.length}/${expectedWords})`);
            return;
        }

        const badWord = trimmed.find(word => word.length > 0 && !WORDLIST.includes(word.toLowerCase()));
        if (badWord) {
            setDraftHex('');
            setError(`Unknown word: ${badWord}`);
            return;
        }

        const result = mnemonicToHex(filled.join(' '), keySize);
        if (!result.valid || !result.hex) {
            setDraftHex('');
            setError('Invalid mnemonic checksum');
            return;
        }

        setError('');
        setDraftHex(result.hex);
        setCanonicalHex(result.hex);
    }, [cells, draftActive, expectedWords, keySize]);

    // Re-encode whenever the seed or key size changes.
    useEffect(() => {
        if (!canonicalHex) return;
        setBoard(encodePrivateKey(canonicalHex, keySize, seed));
    }, [canonicalHex, keySize, seed, setBoard]);

    // Once the board reflects the draft, hand display back to the board.
    useEffect(() => {
        if (!draftActive) return;
        if (draftHex !== '' && decodedFromBoard === draftHex) {
            setDraftActive(false);
        }
    }, [draftActive, draftHex, decodedFromBoard]);

    // A different key size means a different number of words — start over.
    useEffect(() => {
        setCells(new Array<string>(expectedWords).fill(''));
        setDraftActive(false);
        setCanonicalHex('');
        setDraftHex('');
        setError('');
    }, [expectedWords]);

    useEffect(() => {
        if (focusTarget === null) return;
        const el = inputRefs.current[focusTarget];
        el?.focus();
        el?.select();
        setFocusTarget(null);
    }, [focusTarget]);

    const handleWordChange = useCallback(
        (index: number, raw: string) => {
            const base = draftActive ? cells : (boardWords ?? cells);
            const next = [...base];

            const lowered = raw.toLowerCase();
            const parts = lowered.split(/[\s,]+/).filter(part => part.length > 0);
            const trailingSpace = /\s$/.test(lowered);

            if (parts.length > expectedWords) {
                setError(`This grid holds ${expectedWords} words — the phrase has ${parts.length}. Switch key size for longer phrases.`);
                return;
            }

            if (parts.length === 0) {
                next[index] = '';
            } else if (parts.length === 1) {
                next[index] = parts[0] ?? '';
            } else {
                // Pasted a phrase — fan the words out across the following cells.
                parts.forEach((word, offset) => {
                    if (index + offset < next.length) {
                        next[index + offset] = word;
                    }
                });
            }

            setCells(next);
            setDraftActive(true);
            setError('');

            const nextIndex = index + parts.length;
            if (nextIndex < expectedWords && (trailingSpace || parts.length > 1)) {
                setFocusTarget(nextIndex);
            }
        },
        [cells, boardWords, draftActive, expectedWords]
    );

    const handleKeyDown = useCallback(
        (index: number, e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace' && (cells[index] ?? '') === '' && index > 0) {
                e.preventDefault();
                setFocusTarget(index - 1);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const nextIndex = index + 1;
                if (nextIndex < expectedWords) setFocusTarget(nextIndex);
            }
        },
        [cells, expectedWords]
    );

    const generateRandom = useCallback(() => {
        const words = generateMnemonic(keySize).split(' ');
        setCells(words);
        setDraftActive(true);
        setError('');
    }, [keySize]);

    const clearAll = useCallback(() => {
        setCells(new Array<string>(expectedWords).fill(''));
        setDraftActive(false);
        setCanonicalHex('');
        setDraftHex('');
        setError('');
        setBoard(encodePrivateKey('', keySize, seed));
    }, [setBoard, keySize, seed, expectedWords]);

    useImperativeHandle(ref, () => ({
        generateRandom,
        clearAll,
    }), [generateRandom, clearAll]);

    return (
        <div className="mnemonic-input">
            <div className="input-group">
                <label htmlFor="mnemonic-word-0">Mnemonic Phrase (BIP39)</label>
                <div
                    className="word-grid"
                    style={{ gridTemplateColumns: `repeat(${columns}, max-content)` }}
                >
                    {Array.from({ length: expectedWords }, (_, index) => {
                        const value = displayWords[index] ?? '';
                        const invalid = value.trim().length > 0 && !WORDLIST.includes(value.trim().toLowerCase());
                        return (
                            <div className="word-cell" key={index}>
                                <label className="word-index" htmlFor={`mnemonic-word-${index}`}>
                                    {index + 1}
                                </label>
                                <input
                                    id={`mnemonic-word-${index}`}
                                    ref={el => { inputRefs.current[index] = el; }}
                                    value={value}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleWordChange(index, e.target.value)}
                                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                                    placeholder="—"
                                    spellCheck={false}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    className={invalid ? 'input-error' : ''}
                                    aria-label={`Word ${index + 1}`}
                                    // `ch` units are exact for the monospace font, so the
                                    // box always fits the longest word in its column.
                                    size={widthFor(index)}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="input-status">
                    <span className="word-count">{filledCount}/{expectedWords} words</span>
                    {error && (
                        <span className="error-message">⚠️ {error}</span>
                    )}
                </div>
            </div>

            {boardDiverged && (
                <p className="edit-note">
                    ⚠️ Board edits changed the decoded phrase — memorize your edits to recover the original.
                </p>
            )}
        </div>
    );
});
