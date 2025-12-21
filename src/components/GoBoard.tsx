import React from 'react';
import type { Board } from '../core/types';
import { CELL_SIZE, STAR_POINTS, BLACK, EMPTY } from '../utils/constants';

interface GoBoardProps {
  board: Board;
  size: number;
  centerRow: number;
  centerCol: number;
}

export const GoBoard: React.FC<GoBoardProps> = ({ board, size, centerRow, centerCol }) => {
  return (
    <div className="flex justify-center">
      <div className="p-4 bg-linear-to-br from-amber-800 to-amber-900 rounded-xl shadow-2xl">
        <svg
          width={size * CELL_SIZE + 20}
          height={size * CELL_SIZE + 20}
          className="bg-linear-to-br from-amber-200 via-amber-100 to-yellow-50 rounded-lg"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
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
            const cx = 10 + j * CELL_SIZE;
            const cy = 10 + i * CELL_SIZE;
            const radius = CELL_SIZE * 0.45;

            return (
              <g key={`stone-${i}-${j}`}>
                {/* Shadow */}
                <circle
                  cx={cx + 1}
                  cy={cy + 2}
                  r={radius}
                  fill="rgba(0,0,0,0.2)"
                  filter="blur(2px)"
                />

                {cell === BLACK ? (
                  <>
                    {/* Black stone with gradient */}
                    <defs>
                      <radialGradient id={`black-grad-${i}-${j}`}>
                        <stop offset="0%" stopColor="#4a4a4a" />
                        <stop offset="70%" stopColor="#1a1a1a" />
                        <stop offset="100%" stopColor="#000000" />
                      </radialGradient>
                    </defs>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={`url(#black-grad-${i}-${j})`}
                      stroke="#000"
                      strokeWidth="1"
                    />
                    {/* Highlight */}
                    <circle
                      cx={cx - 3}
                      cy={cy - 3}
                      r={CELL_SIZE * 0.15}
                      fill="rgba(255,255,255,0.35)"
                    />
                  </>
                ) : (
                  <>
                    {/* White stone with gradient */}
                    <defs>
                      <radialGradient id={`white-grad-${i}-${j}`}>
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="70%" stopColor="#f5f5f5" />
                        <stop offset="100%" stopColor="#d1d1d1" />
                      </radialGradient>
                    </defs>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={`url(#white-grad-${i}-${j})`}
                      stroke="#999"
                      strokeWidth="1"
                    />
                    {/* Highlight */}
                    <circle
                      cx={cx - 2}
                      cy={cy - 2}
                      r={CELL_SIZE * 0.12}
                      fill="rgba(255,255,255,0.9)"
                    />
                  </>
                )}
              </g>
            );
          })
        )}
      </svg>
      </div>
    </div>
  );
};

