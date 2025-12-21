import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import type { EncodedResult, DecodedResult } from '../core/types';
import { encodeWithDummyStones } from '../core/encoder';
import { decodeBoard } from '../core/decoder';
import { verifyBoard } from '../core/validator';
import { keyToBinary } from '../utils/keyConverter';
import { KeyInput } from './KeyInput';
import { BoardStats } from './BoardStats';
import { DecodingPanel } from './DecodingPanel';
import { BOARD_SIZE } from '../utils/constants';

export const GobanVaultApp: React.FC = () => {
  const [inputKey, setInputKey] = useState('');
  const [fixedColoursBoard, setFixedColoursBoard] = useState<EncodedResult | null>(null);
  const [mixedColoursBoard, setMixedColoursBoard] = useState<EncodedResult | null>(null);
  const [decodedKeyFixed, setDecodedKeyFixed] = useState<DecodedResult | null>(null);
  const [decodedKeyMixed, setDecodedKeyMixed] = useState<DecodedResult | null>(null);

  // Auto-encode both boards when key changes
  useEffect(() => {
    if (inputKey.trim() === '') {
      setFixedColoursBoard(null);
      setMixedColoursBoard(null);
      setDecodedKeyFixed(null);
      setDecodedKeyMixed(null);
      return;
    }

    const keyBits = keyToBinary(inputKey);

    // Encode with Fixed Colours
    const fixedResult = encodeWithDummyStones(keyBits, BOARD_SIZE, false);
    const fixedVerification = verifyBoard(fixedResult.board, BOARD_SIZE);
    setFixedColoursBoard({
      ...fixedResult,
      keyBits,
      verification: fixedVerification,
      size: BOARD_SIZE,
      mixColors: false
    });

    // Encode with Mixed Colours
    const mixedResult = encodeWithDummyStones(keyBits, BOARD_SIZE, true);
    const mixedVerification = verifyBoard(mixedResult.board, BOARD_SIZE);
    setMixedColoursBoard({
      ...mixedResult,
      keyBits,
      verification: mixedVerification,
      size: BOARD_SIZE,
      mixColors: true
    });

    // Reset decoded keys when input changes
    setDecodedKeyFixed(null);
    setDecodedKeyMixed(null);
  }, [inputKey]);

  const handleDecodeFixed = () => {
    if (!fixedColoursBoard) return;
    const result = decodeBoard(fixedColoursBoard);
    setDecodedKeyFixed(result);
  };

  const handleDecodeMixed = () => {
    if (!mixedColoursBoard) return;
    const result = decodeBoard(mixedColoursBoard);
    setDecodedKeyMixed(result);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-emerald-600" />
          Goban Vault
        </h1>
        <p className="text-lg text-slate-600 ml-13">
          Encode your keys as valid Go game positions with intelligent dummy stones
        </p>
      </div>

      <div className="bg-linear-to-br from-purple-50 via-white to-blue-50 rounded-2xl p-8 mb-6 shadow-xl border-2 border-purple-200">
        <KeyInput value={inputKey} onChange={setInputKey} />
        {inputKey.trim() === '' && (
          <p className="text-sm text-slate-500 mt-2 text-center">
            Enter a key to see both Fixed Colours and Mixed Colours encodings
          </p>
        )}
      </div>

      {fixedColoursBoard && mixedColoursBoard && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Fixed Colours Board */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-teal-600">🎯</span>
              Fixed Colours
            </h2>
            <BoardStats encodedBoard={fixedColoursBoard} />
            <DecodingPanel
              encodedBoard={fixedColoursBoard}
              decodedKey={decodedKeyFixed}
              onDecode={handleDecodeFixed}
            />
          </div>

          {/* Mixed Colours Board */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-emerald-600">✨</span>
              Mixed Colours
            </h2>
            <BoardStats encodedBoard={mixedColoursBoard} />
            <DecodingPanel
              encodedBoard={mixedColoursBoard}
              decodedKey={decodedKeyMixed}
              onDecode={handleDecodeMixed}
            />
          </div>
        </div>
      )}
    </div>
  );
};

