import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import { Board } from './components/Board';
import { BoardControls } from './components/BoardControls';
import { PrivateKeyInput } from './components/PrivateKeyInput';
import { MnemonicInput } from './components/MnemonicInput';
import { useGameStore } from './store';
import { BOARD_SIZE_CONFIG, KEY_CHAIN_CONFIGS, type KeySize } from './types';
import './App.css';

type InputMode = 'hex' | 'mnemonic';

export interface InputComponentRef {
    generateRandom: () => void;
    clearAll: () => void;
}

const App: React.FC = () => {
    const { boardSize, keySize, setKeySize } = useGameStore();
    const boardConfig = BOARD_SIZE_CONFIG[boardSize];
    const [inputMode, setInputMode] = useState<InputMode>('hex');
    const hexInputRef = useRef<InputComponentRef>(null);
    const mnemonicInputRef = useRef<InputComponentRef>(null);

    const handleKeySizeChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const newSize = Number(e.target.value) as KeySize;
            setKeySize(newSize);
        },
        [setKeySize]
    );

    const handleGenerateRandom = useCallback(() => {
        const ref = inputMode === 'hex' ? hexInputRef : mnemonicInputRef;
        ref.current?.generateRandom();
    }, [inputMode]);

    const handleClearAll = useCallback(() => {
        const ref = inputMode === 'hex' ? hexInputRef : mnemonicInputRef;
        ref.current?.clearAll();
    }, [inputMode]);

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎯 Goban Vault</h1>
                <p>Encode private keys as Go board positions • {boardConfig.label} board</p>
            </header>

            <main className="app-main">
                <div className={`controls-panel ${inputMode === 'mnemonic' ? 'controls-panel-wide' : ''}`}>
                    <div className="key-config-row">
                        <div className="config-group">
                            <label htmlFor="key-size">Key Size</label>
                            <select
                                id="key-size"
                                value={keySize}
                                onChange={handleKeySizeChange}
                                className="config-select"
                            >
                                {KEY_CHAIN_CONFIGS.map(opt => (
                                    <option key={opt.size} value={opt.size}>
                                        {opt.label} ({opt.hexChars} hex) — {opt.chains}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="input-mode-toggle">
                        <button
                            className={inputMode === 'hex' ? 'active' : ''}
                            onClick={() => setInputMode('hex')}
                        >
                            Hex Input
                        </button>
                        <button
                            className={inputMode === 'mnemonic' ? 'active' : ''}
                            onClick={() => setInputMode('mnemonic')}
                        >
                            Mnemonic Words
                        </button>
                    </div>

                    {inputMode === 'hex' ? <PrivateKeyInput ref={hexInputRef} /> : <MnemonicInput ref={mnemonicInputRef} />}

                    <div className="button-group">
                        <button onClick={handleGenerateRandom} className="btn-generate">
                            🎲 Generate Random
                        </button>
                        <button onClick={handleClearAll} className="btn-clear">
                            🗑️ Clear
                        </button>
                    </div>

                    <BoardControls />
                </div>

                <div className="board-container">
                    <Board />
                </div>
            </main>

            <footer className="app-footer">
                <p>
                    ⚠️ This is an experimental tool. Never use for real funds without proper backup.
                </p>
            </footer>
        </div>
    );
};

export default App;
