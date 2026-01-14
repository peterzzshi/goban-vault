import React, { useCallback, useMemo } from 'react';

import { wouldBeSuicide, wouldCapture, applyCaptures } from '../core/goRules';
import { useGameStore } from '../store';

import type { BoardSize } from '../types';
import './Board.css';

const getStarPoints = (boardSize: BoardSize): [number, number][] => {
    switch (boardSize) {
        case 9:
            return [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]];
        case 13:
            return [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]];
        case 19:
        default:
            return [
                [3, 3], [3, 9], [3, 15],
                [9, 3], [9, 9], [9, 15],
                [15, 3], [15, 9], [15, 15],
            ];
    }
};

export const Board: React.FC = () => {
    const {
        board,
        boardSize,
        editStoneColour,
        removeStone,
        getStone,
        setBoard,
    } = useGameStore();

    const starPoints = useMemo(() => getStarPoints(boardSize), [boardSize]);

    const isStarPoint = useCallback(
        (row: number, col: number): boolean =>
            starPoints.some(([r, c]) => r === row && c === col),
        [starPoints]
    );

    const handleIntersectionClick = useCallback(
        (row: number, col: number) => {
            const currentStone = getStone(row, col);

            if (currentStone !== null) {
                removeStone(row, col);
            } else {
                const suicide = wouldBeSuicide(board, row, col, editStoneColour, boardSize);
                const captures = wouldCapture(board, row, col, editStoneColour, boardSize);

                if (suicide && captures.length === 0) {
                    return;
                }

                const newBoard = board.map(r => [...r]);
                const boardRow = newBoard[row];
                if (boardRow) {
                    boardRow[col] = editStoneColour;
                }
                const boardWithCaptures = applyCaptures(newBoard, boardSize);
                setBoard(boardWithCaptures);
            }
        },
        [board, boardSize, editStoneColour, removeStone, getStone, setBoard]
    );

    const validationErrors = useMemo(() => {
        const errors = new Map<string, string>();
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row]?.[col] === null) {
                    const suicide = wouldBeSuicide(board, row, col, editStoneColour, boardSize);
                    const captures = wouldCapture(board, row, col, editStoneColour, boardSize);

                    if (suicide && captures.length === 0) {
                        errors.set(`${row}-${col}`, 'Invalid move');
                    }
                }
            }
        }
        return errors;
    }, [board, boardSize, editStoneColour]);

    return (
        <div className={`board board-${boardSize}`}>
            {Array.from({ length: boardSize }, (_, row) => (
                <div key={row} className="board-row">
                    {Array.from({ length: boardSize }, (_, col) => {
                        const stone = getStone(row, col);
                        const key = `${row}-${col}`;
                        const validationError = validationErrors.get(key);

                        return (
                            <div
                                key={col}
                                className={`intersection ${validationError ? 'invalid-hover' : ''}`}
                                onClick={() => handleIntersectionClick(row, col)}
                                title={validationError}
                            >
                                <div className="grid-lines">
                                    <div className={`h-line ${col === 0 ? 'edge-left' : ''} ${col === boardSize - 1 ? 'edge-right' : ''}`} />
                                    <div className={`v-line ${row === 0 ? 'edge-top' : ''} ${row === boardSize - 1 ? 'edge-bottom' : ''}`} />
                                </div>

                                {isStarPoint(row, col) && !stone && (
                                    <div className="star-point" />
                                )}

                                {stone && (
                                    <div className={`stone ${stone}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};
