import React from 'react';
import type { Board } from '../core/types';
import { CELL_SIZE, STAR_POINTS, BLACK, WHITE, EMPTY } from '../utils/constants';

interface GoBoardProps {
  board: Board;
  size: number;
  centerRow: number;
  centerCol: number;
}

export const GoBoard: React.FC<GoBoardProps> = ({ board, size, centerRow, centerCol }) => {
  return (
    <div className="flex justify-center">
      <svg
        width={size * CELL_SIZE + 20}
        height={size * CELL_SIZE + 20}
        className="border-2 border-slate-400 bg-amber-100 shadow-lg rounded"
      >
        {/* Grid lines */}
        {Array.from({ length: size }).map((_, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={10}
              y1={10 + i * CELL_SIZE}
              x2={10 + (size - 1) * CELL_SIZE}
              y2={10 + i * CELL_SIZE}
              stroke="#8B7355"
              strokeWidth="1"
            />
            <line
              x1={10 + i * CELL_SIZE}
              y1={10}
              x2={10 + i * CELL_SIZE}
              y2={10 + (size - 1) * CELL_SIZE}
              stroke="#8B7355"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Highlight center lines (subtle) */}
        <line
          x1={10}
          y1={10 + centerRow * CELL_SIZE}
          x2={10 + (size - 1) * CELL_SIZE}
          y2={10 + centerRow * CELL_SIZE}
          stroke="#D97706"
          strokeWidth="1.5"
          opacity="0.2"
        />
        <line
          x1={10 + centerCol * CELL_SIZE}
          y1={10}
          x2={10 + centerCol * CELL_SIZE}
          y2={10 + (size - 1) * CELL_SIZE}
          stroke="#D97706"
          strokeWidth="1.5"
          opacity="0.2"
        />

        {/* Star points */}
        {STAR_POINTS.map(([r, c]) => (
          <circle
            key={`star-${r}-${c}`}
            cx={10 + c * CELL_SIZE}
            cy={10 + r * CELL_SIZE}
            r={2.5}
            fill="#8B7355"
          />
        ))}

        {/* Stones */}
        {board.map((row, i) =>
          row.map((cell, j) => {
            if (cell === EMPTY) return null;
            return (
              <g key={`stone-${i}-${j}`}>
                <circle
                  cx={10 + j * CELL_SIZE}
                  cy={10 + i * CELL_SIZE}
                  r={CELL_SIZE * 0.45}
                  fill={cell === BLACK ? '#1a1a1a' : '#f8f8f8'}
                  stroke={cell === BLACK ? '#000' : '#aaa'}
                  strokeWidth="1.5"
                />
                {cell === BLACK && (
                  <circle
                    cx={10 + j * CELL_SIZE - 2}
                    cy={10 + i * CELL_SIZE - 2}
                    r={CELL_SIZE * 0.15}
                    fill="rgba(255,255,255,0.4)"
                  />
                )}
                {cell === WHITE && (
                  <circle
                    cx={10 + j * CELL_SIZE - 1.5}
                    cy={10 + i * CELL_SIZE - 1.5}
                    r={CELL_SIZE * 0.12}
                    fill="rgba(255,255,255,0.8)"
                  />
                )}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

