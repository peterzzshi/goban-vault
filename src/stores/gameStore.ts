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
    label: string;
}> = {
    9: { size: 9, label: '9×9' },
    13: { size: 13, label: '13×13' },
    19: { size: 19, label: '19×19' },
};

const createEmptyBoard = (size: BoardSize = 19): StoneColor[][] =>
    Array.from({ length: size }, () =>
        Array.from({ length: size }, () => null as StoneColor)
    );

export interface GameState {
    board: StoneColor[][];
    boardSize: BoardSize;
    keySize: KeySize;
    paddingMode: PaddingMode;
    spreadPattern: SpreadPatternType;
    editStoneColor: 'black' | 'white';

    setBoard: (board: StoneColor[][]) => void;
    setBoardSize: (size: BoardSize) => void;
    setKeySize: (size: KeySize) => void;
    setPaddingMode: (mode: PaddingMode) => void;
    setSpreadPattern: (pattern: SpreadPatternType) => void;
    setEditStoneColor: (color: 'black' | 'white') => void;
    placeStone: (row: number, col: number) => void;
    removeStone: (row: number, col: number) => void;
    clearBoard: () => void;
    getStone: (row: number, col: number) => StoneColor;
}

export const useGameStore = create<GameState>()((set, get) => ({
    board: createEmptyBoard(19),
    boardSize: 19,
    keySize: 256,
    paddingMode: 'left',
    spreadPattern: 'distributed',
    editStoneColor: 'white',

    setBoard: (board: StoneColor[][]): void => {
        set({ board });
    },

    setBoardSize: (size: BoardSize): void => {
        set({
            boardSize: size,
            board: createEmptyBoard(size),
        });
    },

    setKeySize: (size: KeySize): void => {
        const newBoardSize = KEY_SIZE_TO_BOARD_SIZE[size];
        set({
            keySize: size,
            boardSize: newBoardSize,
            board: createEmptyBoard(newBoardSize),
        });
    },

    setPaddingMode: (mode: PaddingMode): void => {
        set({ paddingMode: mode });
    },

    setSpreadPattern: (pattern: SpreadPatternType): void => {
        set({ spreadPattern: pattern });
    },


    setEditStoneColor: (color: 'black' | 'white'): void => {
        set({ editStoneColor: color });
    },

    placeStone: (row: number, col: number): void => {
        set(state => {
            const newBoard = state.board.map(r => [...r]);
            const boardRow = newBoard[row];
            if (boardRow) {
                boardRow[col] = state.editStoneColor;
            }
            return { board: newBoard };
        });
    },

    removeStone: (row: number, col: number): void => {
        set(state => {
            const newBoard = state.board.map(r => [...r]);
            const boardRow = newBoard[row];
            if (boardRow) {
                boardRow[col] = null;
            }
            return { board: newBoard };
        });
    },

    clearBoard: (): void => {
        set(state => ({ board: createEmptyBoard(state.boardSize) }));
    },

    getStone: (row: number, col: number): StoneColor => {
        const state = get();
        return state.board[row]?.[col] ?? null;
    },
}));
