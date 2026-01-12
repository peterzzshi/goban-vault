import { spreadPatterns, type SpreadPatternType } from '../lib/spreadPatterns';
import { useGameStore } from '../stores/gameStore';
import './DummyModeControls.css';

import type { FC } from 'react';

export const DummyModeControls: FC = () => {
    const {
        isDummyMode,
        toggleDummyMode,
        dummyStoneColor,
        setDummyStoneColor,
        clearDummyStones,
        spreadPattern,
        setSpreadPattern,
        dummyStones,
    } = useGameStore();

    const patternOptions: SpreadPatternType[] = ['sequential', 'distributed', 'checkerboard', 'spiral'];

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
                <h3>Dummy Stone Mode</h3>
                <button
                    onClick={toggleDummyMode}
                    className={`mode-toggle ${isDummyMode ? 'active' : ''}`}
                >
                    {isDummyMode ? '🔵 Dummy Mode ON' : '⚪ Dummy Mode OFF'}
                </button>

                {isDummyMode && (
                    <div className="dummy-options">
                        <div className="color-selector">
                            <label>Stone Color:</label>
                            <button
                                className={`color-btn black ${dummyStoneColor === 'black' ? 'selected' : ''}`}
                                onClick={() => setDummyStoneColor('black')}
                            >
                                ⚫ Black
                            </button>
                            <button
                                className={`color-btn white ${dummyStoneColor === 'white' ? 'selected' : ''}`}
                                onClick={() => setDummyStoneColor('white')}
                            >
                                ⚪ White
                            </button>
                        </div>

                        <p className="dummy-count">
                            Dummy stones placed: {dummyStones.size}
                        </p>

                        <button
                            onClick={clearDummyStones}
                            className="clear-btn"
                            disabled={dummyStones.size === 0}
                        >
                            Clear All Dummy Stones
                        </button>
                    </div>
                )}
            </div>

            <div className="control-section instructions">
                {isDummyMode ? (
                    <>
                        <p>🔵 <strong>Dummy Mode Active</strong></p>
                        <p>Click empty positions to place dummy stones.</p>
                        <p>Click existing dummy stones to remove them.</p>
                        <p>Dummy stones won't affect the private key.</p>
                    </>
                ) : (
                    <>
                        <p>Click board positions to toggle encoded bits.</p>
                        <p>Enable Dummy Mode to add decorative stones.</p>
                    </>
                )}
            </div>
        </div>
    );
};
