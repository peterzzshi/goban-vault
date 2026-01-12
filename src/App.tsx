import { useEffect } from 'react';

import { Board } from './components/Board';
import { DummyModeControls } from './components/DummyModeControls';
import { PrivateKeyInput } from './components/PrivateKeyInput';
import { encodePrivateKey } from './lib/encoder';
import { useGameStore, BOARD_SIZE_CONFIG } from './stores/gameStore';
import './App.css';

const App: React.FC = () => {
  const { spreadPattern, privateKey, keySize, boardSize, setBoard } = useGameStore();

  useEffect(() => {
    if (privateKey) {
      const newBoard = encodePrivateKey(privateKey, spreadPattern, keySize);
      setBoard(newBoard);
    }
  }, [spreadPattern, privateKey, keySize, setBoard]);

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
            <DummyModeControls />
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
