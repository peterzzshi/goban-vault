import { spreadPatterns, type SpreadPatternType } from '../lib/spreadPatterns';
import { useGameStore } from '../stores/gameStore';
import './DummyModeControls.css';

import type { FC } from 'react';

export const DummyModeControls: FC = () => {
    const {
        editStoneColor,
        setEditStoneColor,
        clearBoard,
        spreadPattern,
        setSpreadPattern,
        board,
    } = useGameStore();

    const patternOptions: SpreadPatternType[] = ['distributed', 'checkerboard'];

    const stoneCount = board.flat().filter(s => s !== null).length;
    const blackCount = board.flat().filter(s => s === 'black').length;
    const whiteCount = board.flat().filter(s => s === 'white').length;

    return (
        <div className="dummy-mode-controls">
            <div className="control-section">
                <h3>Spread Pattern</h3>
                <select
                    value={spreadPattern}
                    onChange={e => setSpreadPattern(e.target.value as SpreadPatternType)}
                    className="pattern-select"
                >
                    {patternOptions.map(pattern => (
                        <option key={pattern} value={pattern}>
                            {spreadPatterns[pattern].name}
                        </option>
                    ))}
                </select>
                <p className="pattern-description">
                    {spreadPatterns[spreadPattern].description}
                </p>
            </div>

            <div className="control-section">
                <h3>Place Stones</h3>
                <div className="color-selector">
                    <button
                        className={`color-btn black ${editStoneColor === 'black' ? 'selected' : ''}`}
                        onClick={() => setEditStoneColor('black')}
                    >
                        ⚫ Black
                    </button>
                    <button
                        className={`color-btn white ${editStoneColor === 'white' ? 'selected' : ''}`}
                        onClick={() => setEditStoneColor('white')}
                    >
                        ⚪ White
                    </button>
                </div>

                <p className="stone-count">
                    ⚫ {blackCount} · ⚪ {whiteCount} · Total: {stoneCount}
                </p>

                <button
                    onClick={clearBoard}
                    className="clear-btn"
                    disabled={stoneCount === 0}
                >
                    Clear Board
                </button>
            </div>

            <div className="control-section instructions">
                <p>Click empty positions to place stones.</p>
                <p>Click existing stones to remove them.</p>
                <p>The key updates automatically as you edit.</p>
            </div>
        </div>
    );
};
