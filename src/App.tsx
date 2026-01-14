import { Board } from './components/Board';
import { BoardControls } from './components/BoardControls';
import { PrivateKeyInput } from './components/PrivateKeyInput';
import { useGameStore } from './store';
import { BOARD_SIZE_CONFIG } from './types';
import './App.css';

const App: React.FC = () => {
    const { boardSize } = useGameStore();
    const boardConfig = BOARD_SIZE_CONFIG[boardSize];

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎯 Goban Vault</h1>
                <p>Encode private keys as Go board positions • {boardConfig.label} board</p>
            </header>

            <main className="app-main">
                <div className="controls-panel">
                    <PrivateKeyInput />
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
