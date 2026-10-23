import { describe, it, expect } from 'vitest';
import { placeStoneWithCaptures, wouldCapture, wouldBeSuicide } from './goRules';

import type { CellState } from '../types';

const empty9x9 = (): CellState[][] =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null));

describe('placeStoneWithCaptures', () => {
    it('places a stone on an empty board', () => {
        const board = empty9x9();
        const result = placeStoneWithCaptures(board, 4, 4, 'black', 9);
        expect(result).not.toBeNull();
        expect(result!.board[4]?.[4]).toBe('black');
        expect(result!.captured).toHaveLength(0);
    });

    it('captures a single surrounded stone', () => {
        const board = empty9x9();
        board[4]![4] = 'white';
        board[3]![4] = 'black';
        board[5]![4] = 'black';
        board[4]![3] = 'black';
        // Place final surrounding stone
        const result = placeStoneWithCaptures(board, 4, 5, 'black', 9);
        expect(result).not.toBeNull();
        expect(result!.captured).toHaveLength(1);
        expect(result!.captured[0]).toEqual({ row: 4, col: 4, colour: 'white' });
        expect(result!.board[4]?.[4]).toBeNull();
    });

    it('captures a two-stone group', () => {
        const board = empty9x9();
        board[4]![4] = 'white';
        board[4]![5] = 'white';
        board[3]![4] = 'black';
        board[3]![5] = 'black';
        board[5]![4] = 'black';
        board[5]![5] = 'black';
        board[4]![3] = 'black';
        // Final capture
        const result = placeStoneWithCaptures(board, 4, 6, 'black', 9);
        expect(result).not.toBeNull();
        expect(result!.captured).toHaveLength(2);
        expect(result!.board[4]?.[4]).toBeNull();
        expect(result!.board[4]?.[5]).toBeNull();
    });

    it('prevents suicide moves', () => {
        const board = empty9x9();
        board[3]![4] = 'white';
        board[5]![4] = 'white';
        board[4]![3] = 'white';
        board[4]![5] = 'white';
        // Black (4,4) would have no liberties
        const result = placeStoneWithCaptures(board, 4, 4, 'black', 9);
        expect(result).toBeNull();
    });

    it('allows self-atari when capturing', () => {
        const board = empty9x9();
        board[4]![4] = 'white';
        board[3]![4] = 'black';
        board[5]![4] = 'black';
        board[4]![3] = 'black';
        board[3]![5] = 'white';
        board[5]![5] = 'white';
        board[4]![6] = 'white';
        // Black (4,5) captures white (4,4), even though black group ends with 1 liberty
        const result = placeStoneWithCaptures(board, 4, 5, 'black', 9);
        expect(result).not.toBeNull();
        expect(result!.captured).toHaveLength(1);
    });

    it('handles corner captures correctly', () => {
        const board = empty9x9();
        board[0]![0] = 'white';
        board[1]![0] = 'black';
        // Capture in corner
        const result = placeStoneWithCaptures(board, 0, 1, 'black', 9);
        expect(result).not.toBeNull();
        expect(result!.captured).toHaveLength(1);
        expect(result!.board[0]?.[0]).toBeNull();
    });

    it('handles edge captures correctly', () => {
        const board = empty9x9();
        board[0]![4] = 'white';
        board[0]![3] = 'black';
        board[1]![4] = 'black';
        // Capture on top edge
        const result = placeStoneWithCaptures(board, 0, 5, 'black', 9);
        expect(result).not.toBeNull();
        expect(result!.captured).toHaveLength(1);
    });
});

describe('wouldCapture', () => {
    it('detects capture before placement', () => {
        const board = empty9x9();
        board[4]![4] = 'white';
        board[3]![4] = 'black';
        board[5]![4] = 'black';
        board[4]![3] = 'black';
        const captured = wouldCapture(board, 4, 5, 'black', 9);
        expect(captured).toHaveLength(1);
        expect(captured[0]).toEqual({ row: 4, col: 4 });
    });

    it('returns empty array when no capture', () => {
        const board = empty9x9();
        board[4]![4] = 'white';
        const captured = wouldCapture(board, 3, 3, 'black', 9);
        expect(captured).toHaveLength(0);
    });
});

describe('wouldBeSuicide', () => {
    it('detects suicide moves', () => {
        const board = empty9x9();
        board[3]![4] = 'white';
        board[5]![4] = 'white';
        board[4]![3] = 'white';
        board[4]![5] = 'white';
        expect(wouldBeSuicide(board, 4, 4, 'black', 9)).toBe(true);
    });

    it('allows moves with liberties', () => {
        const board = empty9x9();
        board[3]![4] = 'white';
        expect(wouldBeSuicide(board, 4, 4, 'black', 9)).toBe(false);
    });

    it('allows capturing moves even if self-atari', () => {
        const board = empty9x9();
        board[4]![4] = 'white';
        board[3]![4] = 'black';
        board[5]![4] = 'black';
        board[4]![3] = 'black';
        // Capturing move is not suicide even if results in atari
        expect(wouldBeSuicide(board, 4, 5, 'black', 9)).toBe(false);
    });
});
