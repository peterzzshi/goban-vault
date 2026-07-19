import { create } from 'zustand';

import { placeStoneWithCaptures } from './core/goRules';
import { KEY_SIZE_TO_BOARD_SIZE } from './types';

import type {
    BoardSize,
    CellState,
    KeySize,
    PaddingMode,
    PlacedStone,
    StoneType
} from './types';

export type EditMove =
    | { type: 'place'; row: number; col: number; captured: PlacedStone[] }
    | { type: 'remove'; row: number; col: number; colour: StoneType };

const createEmptyBoard = (size: BoardSize): CellState[][] =>
    Array.from({ length: size }, () =>
        Array.from({ length: size }, () => null as CellState)
    );

const withCell = (
    board: CellState[][],
    row: number,
    col: number,
    value: CellState
): CellState[][] =>
    board.map((r, ri) => (ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r));

export interface GameState {
    board: CellState[][];
    boardSize: BoardSize;
    keySize: KeySize;
    paddingMode: PaddingMode;
    editStoneColour: StoneType;
    seed: number;
    editLog: EditMove[];

    setBoard: (board: CellState[][]) => void;
    setBoardSize: (size: BoardSize) => void;
    setKeySize: (size: KeySize) => void;
    setPaddingMode: (mode: PaddingMode) => void;
    setEditStoneColour: (colour: StoneType) => void;
    setSeed: (seed: number) => void;
    toggleStone: (row: number, col: number) => void;
    revertEdits: () => void;
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
    editLog: [],

    // Encoding a key produces a fresh base board, so pending edits are discarded.
    setBoard: (board: CellState[][]): void => {
        set({ board, editLog: [] });
    },

    setBoardSize: (size: BoardSize): void => {
        set({ boardSize: size, board: createEmptyBoard(size), editLog: [] });
    },

    setKeySize: (size: KeySize): void => {
        const boardSize = KEY_SIZE_TO_BOARD_SIZE[size];
        set({ keySize: size, boardSize, board: createEmptyBoard(boardSize), editLog: [] });
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

    // Toggles a stone under Go rules and appends the reversible move to editLog.
    toggleStone: (row: number, col: number): void => {
        set(state => {
            const current = state.board[row]?.[col] ?? null;
            if (current !== null) {
                return {
                    board: withCell(state.board, row, col, null),
                    editLog: [...state.editLog, { type: 'remove', row, col, colour: current }],
                };
            }

            const result = placeStoneWithCaptures(
                state.board, row, col, state.editStoneColour, state.boardSize
            );
            if (!result) return state;

            return {
                board: result.board,
                editLog: [...state.editLog, { type: 'place', row, col, captured: result.captured }],
            };
        });
    },

    // Undoes every logged edit (restoring captured stones) back to the base board.
    revertEdits: (): void => {
        set(state => {
            const board = state.editLog.reduceRight((acc, move) => {
                if (move.type === 'place') {
                    const cleared = withCell(acc, move.row, move.col, null);
                    return move.captured.reduce(
                        (b, s) => withCell(b, s.row, s.col, s.colour),
                        cleared
                    );
                }
                return withCell(acc, move.row, move.col, move.colour);
            }, state.board);

            return { board, editLog: [] };
        });
    },

    clearBoard: (): void => {
        set(state => ({ board: createEmptyBoard(state.boardSize), editLog: [] }));
    },

    getStone: (row: number, col: number): CellState => get().board[row]?.[col] ?? null,
}));
