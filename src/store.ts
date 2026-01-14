import { create } from 'zustand';

import { KEY_SIZE_TO_BOARD_SIZE } from './types';

import type {
    BoardSize,
    CellState,
    KeySize,
    PaddingMode,
    StoneType
} from './types';

const createEmptyBoard = (size: BoardSize): CellState[][] =>
    Array.from({ length: size }, () =>
        Array.from({ length: size }, () => null as CellState)
    );

export interface GameState {
    board: CellState[][];
    boardSize: BoardSize;
    keySize: KeySize;
    paddingMode: PaddingMode;
    editStoneColour: StoneType;
    seed: number;

    setBoard: (board: CellState[][]) => void;
    setBoardSize: (size: BoardSize) => void;
    setKeySize: (size: KeySize) => void;
    setPaddingMode: (mode: PaddingMode) => void;
    setEditStoneColour: (colour: StoneType) => void;
    setSeed: (seed: number) => void;
    placeStone: (row: number, col: number) => void;
    removeStone: (row: number, col: number) => void;
    clearBoard: () => void;
    getStone: (row: number, col: number) => CellState;
}

export const useGameStore = create<GameState>()((set, get) => ({
    board: createEmptyBoard(19),
    boardSize: 19,
    keySize: 256,
    paddingMode: 'left',
    editStoneColour: 'white',
    seed: 0,

    setBoard: (board: CellState[][]): void => {
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

    setSeed: (seed: number): void => {
        set({ seed });
    },

    setEditStoneColour: (colour: StoneType): void => {
        set({ editStoneColour: colour });
    },

    placeStone: (row: number, col: number): void => {
        set(state => {
            const newBoard = state.board.map(r => [...r]);
            const boardRow = newBoard[row];
            if (boardRow) {
                boardRow[col] = state.editStoneColour;
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

    getStone: (row: number, col: number): CellState => {
        const state = get();
        return state.board[row]?.[col] ?? null;
    },
}));
