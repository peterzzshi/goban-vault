import { create } from 'zustand';

import type { SpreadPatternType } from '../lib/spreadPatterns';

export type StoneColor = 'black' | 'white' | null;
export type KeySize = 64 | 128 | 256;
export type BoardSize = 9 | 13 | 19;
export type PaddingMode = 'left' | 'right' | 'none';

export const KEY_SIZE_TO_BOARD_SIZE: Record<KeySize, BoardSize> = {
    64: 9,
    128: 13,
    256: 19,
};

export const BOARD_SIZE_CONFIG: Record<BoardSize, {
    size: BoardSize;
    quadrantSize: number;
    bitsPerQuadrant: number;
    hasCenter: boolean;
    label: string;
}> = {
    9: { size: 9, quadrantSize: 9, bitsPerQuadrant: 64, hasCenter: false, label: '9×9' },
    13: { size: 13, quadrantSize: 6, bitsPerQuadrant: 32, hasCenter: true, label: '13×13' },
    19: { size: 19, quadrantSize: 9, bitsPerQuadrant: 64, hasCenter: true, label: '19×19' },
};

const createEmptyBoard = (size: BoardSize = 19): StoneColor[][] =>
    Array.from({ length: size }, () =>
        Array.from({ length: size }, () => null as StoneColor)
    );

export interface GameState {
    board: StoneColor[][];
    boardSize: BoardSize;
    dummyStones: Map<string, 'black' | 'white'>;
    privateKey: string;
    keySize: KeySize;
    paddingMode: PaddingMode;
    spreadPattern: SpreadPatternType;
    isDummyMode: boolean;
    dummyStoneColor: 'black' | 'white';

    setBoard: (board: StoneColor[][]) => void;
    setBoardSize: (size: BoardSize) => void;
    setPrivateKey: (key: string) => void;
    setKeySize: (size: KeySize) => void;
    setPaddingMode: (mode: PaddingMode) => void;
    setSpreadPattern: (pattern: SpreadPatternType) => void;
    toggleDummyMode: () => void;
    setDummyMode: (enabled: boolean) => void;
    setDummyStoneColor: (color: 'black' | 'white') => void;
    placeDummyStone: (row: number, col: number) => void;
    removeDummyStone: (row: number, col: number) => void;
    clearDummyStones: () => void;
    getVisibleStone: (row: number, col: number) => StoneColor;
    isDummyStoneAt: (row: number, col: number) => boolean;
}

export const useGameStore = create<GameState>()(set => ({
    board: createEmptyBoard(19),
    boardSize: 19,
    dummyStones: new Map<string, 'black' | 'white'>(),
    privateKey: '',
    keySize: 256,
    paddingMode: 'left',
    spreadPattern: 'sequential',
    isDummyMode: false,
    dummyStoneColor: 'black',

    setBoard: (board: StoneColor[][]): void => {
        set({ board });
    },

    setBoardSize: (size: BoardSize): void => {
        set({
            boardSize: size,
            board: createEmptyBoard(size),
            dummyStones: new Map<string, 'black' | 'white'>(),
        });
    },

    setPrivateKey: (key: string): void => {
        set({ privateKey: key });
    },

    setKeySize: (size: KeySize): void => {
        const newBoardSize = KEY_SIZE_TO_BOARD_SIZE[size];
        set({
            keySize: size,
            boardSize: newBoardSize,
            board: createEmptyBoard(newBoardSize),
            dummyStones: new Map<string, 'black' | 'white'>(),
        });
    },

    setPaddingMode: (mode: PaddingMode): void => {
        set({ paddingMode: mode });
    },

    setSpreadPattern: (pattern: SpreadPatternType): void => {
        set({ spreadPattern: pattern });
    },

    toggleDummyMode: (): void => {
        set(state => ({ isDummyMode: !state.isDummyMode }));
    },

    setDummyMode: (enabled: boolean): void => {
        set({ isDummyMode: enabled });
    },

    setDummyStoneColor: (color: 'black' | 'white'): void => {
        set({ dummyStoneColor: color });
    },

    placeDummyStone: (row: number, col: number): void => {
        set(state => {
            if (state.board[row]?.[col] !== null) {
                return state;
            }
            const newDummyStones = new Map(state.dummyStones);
            newDummyStones.set(`${row}-${col}`, state.dummyStoneColor);
            return { dummyStones: newDummyStones };
        });
    },

    removeDummyStone: (row: number, col: number): void => {
        set(state => {
            const newDummyStones = new Map(state.dummyStones);
            newDummyStones.delete(`${row}-${col}`);
            return { dummyStones: newDummyStones };
        });
    },

    clearDummyStones: (): void => {
        set({ dummyStones: new Map<string, 'black' | 'white'>() });
    },

    getVisibleStone: (row: number, col: number): StoneColor => {
        const state = useGameStore.getState();
        const boardRow = state.board[row];
        if (boardRow && boardRow[col] !== null) {
            return boardRow[col] ?? null;
        }
        const key = `${row}-${col}`;
        return state.dummyStones.get(key) ?? null;
    },

    isDummyStoneAt: (row: number, col: number): boolean => {
        const key = `${row}-${col}`;
        return useGameStore.getState().dummyStones.has(key);
    },
}));
