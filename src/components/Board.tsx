import React, { useCallback, useMemo } from 'react';

import { validateDummyPlacement } from '../lib/goRules';
import { useGameStore, type BoardSize } from '../stores/gameStore';
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
        dummyStones,
        isDummyMode,
        dummyStoneColor,
        placeDummyStone,
        removeDummyStone,
        getVisibleStone,
        isDummyStoneAt,
    } = useGameStore();

    const starPoints = useMemo(() => getStarPoints(boardSize), [boardSize]);

    const isStarPoint = useCallback(
        (row: number, col: number): boolean =>
            starPoints.some(([r, c]) => r === row && c === col),
        [starPoints]
    );

    const handleIntersectionClick = useCallback(
        (row: number, col: number) => {
            if (isDummyMode) {
                if (isDummyStoneAt(row, col)) {
                    removeDummyStone(row, col);
                } else if (board[row]?.[col] === null) {
                    const validation = validateDummyPlacement(
                        board,
                        dummyStones,
                        row,
                        col,
                        dummyStoneColor
                    );
                    if (validation.valid) {
                        placeDummyStone(row, col);
                    } else {
                        console.warn(validation.reason);
                    }
                }
            }
        },
        [isDummyMode, dummyStoneColor, board, dummyStones, placeDummyStone, removeDummyStone, isDummyStoneAt]
    );

    const validationErrors = useMemo(() => {
        if (!isDummyMode) return new Map<string, string>();

        const errors = new Map<string, string>();
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row]?.[col] === null && !isDummyStoneAt(row, col)) {
                    const validation = validateDummyPlacement(
                        board,
                        dummyStones,
                        row,
                        col,
                        dummyStoneColor
                    );
                    if (!validation.valid) {
                        errors.set(`${row}-${col}`, validation.reason ?? 'Invalid');
                    }
                }
            }
        }
        return errors;
    }, [isDummyMode, board, boardSize, dummyStones, dummyStoneColor, isDummyStoneAt]);

    return (
        <div className={`board board-${boardSize} ${isDummyMode ? 'dummy-mode' : ''}`}>
            {Array.from({ length: boardSize }, (_, row) => (
                <div key={row} className="board-row">
                    {Array.from({ length: boardSize }, (_, col) => {
                        const visibleStone = getVisibleStone(row, col);
                        const isDummy = isDummyStoneAt(row, col);
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

                                {isStarPoint(row, col) && !visibleStone && (
                                    <div className="star-point" />
                                )}

                                {visibleStone && (
                                    <div
                                        className={`stone ${visibleStone} ${isDummy ? 'dummy' : ''} ${isDummy && isDummyMode ? 'dummy-editing' : ''}`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};
