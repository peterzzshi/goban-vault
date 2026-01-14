import { useGameStore } from '../store';

import type { StoneType } from '../types';
import type { FC, ChangeEvent } from 'react';
import './BoardControls.css';

export const BoardControls: FC = () => {
    const {
        editStoneColour,
        setEditStoneColour,
        clearBoard,
        seed,
        setSeed,
        board,
    } = useGameStore();

    const stoneCount = board.flat().filter((s): s is StoneType => s !== null).length;
    const blackCount = board.flat().filter(s => s === 'black').length;
    const whiteCount = board.flat().filter(s => s === 'white').length;

    const handleSeedChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setSeed(isNaN(value) ? 0 : value);
    };

    const handleColourChange = (colour: StoneType) => {
        setEditStoneColour(colour);
    };

    return (
        <div className="board-controls">
            <div className="control-section">
                <h3>Seed (memorise this)</h3>
                <input
                    type="number"
                    value={seed}
                    onChange={handleSeedChange}
                    className="seed-input"
                    min={0}
                    placeholder="Enter a number..."
                />
                <p className="seed-hint">
                    Same seed = same board layout
                </p>
            </div>

            <div className="control-section">
                <h3>Place Stones</h3>
                <div className="colour-selector">
                    <button
                        className={`colour-btn black ${editStoneColour === 'black' ? 'selected' : ''}`}
                        onClick={() => handleColourChange('black')}
                    >
                        ⚫ Black
                    </button>
                    <button
                        className={`colour-btn white ${editStoneColour === 'white' ? 'selected' : ''}`}
                        onClick={() => handleColourChange('white')}
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
