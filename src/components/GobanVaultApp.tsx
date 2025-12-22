import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import type { EncodedResult, DecodedResult } from '../core/types';
import { encodeWithDummyStones } from '../core/encoder';
import { decodeBoard } from '../core/decoder';
import { verifyBoard } from '../core/validator';
import { keyToBinary } from '../utils/keyConverter';
import { KeyInput } from './KeyInput';
import { GoBoard } from './GoBoard';
import { DecodingPanel } from './DecodingPanel';
import { BOARD_SIZE } from '../utils/constants';
import { Eye } from 'lucide-react';

export const GobanVaultApp: React.FC = () => {
  const [inputKey, setInputKey] = useState('');
  const [phantomBoard, setPhantomBoard] = useState<EncodedResult | null>(null);
  const [realBoard, setRealBoard] = useState<EncodedResult | null>(null);
  const [decodedKey, setDecodedKey] = useState<DecodedResult | null>(null);

  // Auto-encode both boards when key changes
  useEffect(() => {
    const encodeBoards = () => {
      const trimmedKey = inputKey.trim();

      if (trimmedKey === '') {
        setPhantomBoard(null);
        setRealBoard(null);
        setDecodedKey(null);
        return;
      }

      const keyBits = keyToBinary(trimmedKey);

      // Encode Phantom Go
      const phantomResult = encodeWithDummyStones(keyBits, BOARD_SIZE, false);
      const phantomVerification = verifyBoard(phantomResult.board, BOARD_SIZE);
      const newPhantomBoard: EncodedResult = {
        ...phantomResult,
        keyBits,
        verification: phantomVerification,
        size: BOARD_SIZE,
        mixColours: false
      };

      // Encode Real Go (Mixed Colours - adds black stones for realness)
      const realResult = encodeWithDummyStones(keyBits, BOARD_SIZE, true);
      const realVerification = verifyBoard(realResult.board, BOARD_SIZE);
      const newRealBoard: EncodedResult = {
        ...realResult,
        keyBits,
        verification: realVerification,
        size: BOARD_SIZE,
        mixColours: true
      };

      // Batch state updates together
      setPhantomBoard(newPhantomBoard);
      setRealBoard(newRealBoard);
      setDecodedKey(null);
    };

    encodeBoards();
  }, [inputKey]);

  const handleDecode = () => {
    // Decode from either board (they encode the same key)
    if (!phantomBoard) return;

    const result = decodeBoard(phantomBoard);
    setDecodedKey(result);
  };

  const totalStones = phantomBoard
    ? phantomBoard.verification.blackStones + phantomBoard.verification.whiteStones
    : 0;

  const isValidPosition = phantomBoard?.verification.valid ?? false;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-emerald-600" />
          Goban Vault
        </h1>
        <p className="text-lg text-slate-600 ml-13">
          From Phantom Go to Real Go - Progressive stone placement encoding
        </p>
      </div>

      <div className="bg-linear-to-br from-purple-50 via-white to-blue-50 rounded-2xl p-8 mb-6 shadow-xl border-2 border-purple-200">
        <KeyInput value={inputKey} onChange={setInputKey} />
        {inputKey.trim() === '' && (
          <p className="text-sm text-slate-500 mt-2 text-center">
            Enter a key to see the encoding progression: Phantom Go → Real Go
          </p>
        )}
      </div>

      {phantomBoard && realBoard && (
        <div className="space-y-6">
          {/* Combined Stats Section */}
          <div className="bg-linear-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 shadow-2xl border-2 border-purple-200">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Eye className="w-6 h-6 text-teal-600" />
              Encoded Go Boards (19×19) - Stone Placement Encoding
            </h3>

            <div className="grid grid-cols-5 gap-4 mb-8">
              <div className="bg-linear-to-br from-blue-500 via-indigo-500 to-blue-700 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform">
                <div className="text-xs font-medium opacity-90">Data Bits</div>
                <div className="text-2xl font-bold mt-1">256</div>
              </div>
              <div className="bg-linear-to-br from-purple-500 via-fuchsia-500 to-purple-700 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform">
                <div className="text-xs font-medium opacity-90">Dummy Stones</div>
                <div className="text-2xl font-bold mt-1">{phantomBoard.dummyCount}</div>
              </div>
              <div className="bg-linear-to-br from-slate-600 via-gray-600 to-slate-800 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform">
                <div className="text-xs font-medium opacity-90">Total Stones</div>
                <div className="text-2xl font-bold mt-1">{totalStones}</div>
              </div>
              <div className="bg-linear-to-br from-amber-500 via-orange-500 to-amber-700 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform">
                <div className="text-xs font-medium opacity-90">Phantom</div>
                <div className="text-2xl font-bold mt-1">{phantomBoard.verification.whiteStones}</div>
              </div>
              <div
                className={`p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform ${
                  isValidPosition
                    ? 'bg-linear-to-br from-green-500 via-emerald-500 to-teal-600' 
                    : 'bg-linear-to-br from-red-500 via-pink-500 to-orange-600'
                }`}
              >
                <div className="text-xs font-medium opacity-90">Valid</div>
                <div className="text-2xl font-bold mt-1">
                  {isValidPosition ? '✓' : '✗'}
                </div>
              </div>
            </div>

            {/* Phantom Go Board */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">👻</span>
                Step 1: Phantom Go (Fixed Colours)
              </h4>
              <p className="text-sm text-slate-600 mb-4">
                Initial encoding with fixed colour assignment - establishes the base stone positions
              </p>
              <GoBoard
                board={phantomBoard.board}
                size={phantomBoard.size}
                centerRow={phantomBoard.centerRow}
                centerCol={phantomBoard.centerCol}
              />
            </div>

            {/* Real Go Board */}
            <div>
              <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Step 2: Real Go (Mixed Colours)
              </h4>
              <p className="text-sm text-slate-600 mb-4">
                Adding realness with mixed colours - same positions, more natural appearance
              </p>
              <GoBoard
                board={realBoard.board}
                size={realBoard.size}
                centerRow={realBoard.centerRow}
                centerCol={realBoard.centerCol}
              />
            </div>

            <div
              className={`p-6 rounded-2xl border-2 mt-6 shadow-lg ${
                isValidPosition
                  ? 'bg-linear-to-r from-green-100 via-emerald-50 to-teal-100 border-green-400'
                  : 'bg-linear-to-r from-red-100 via-pink-50 to-orange-100 border-red-400'
              }`}
            >
              <div className="font-bold text-lg flex items-center gap-2 text-slate-800">
                {isValidPosition ? '✓ Valid Go Positions' : '✗ Invalid Positions'}
              </div>
              <div className="text-sm text-slate-600 mt-2">
                Both boards encode the same key with identical stone placements - only colours vary
              </div>
            </div>
          </div>

          {/* Single Decode Panel */}
          <DecodingPanel
            encodedBoard={phantomBoard}
            decodedKey={decodedKey}
            onDecode={handleDecode}
          />
        </div>
      )}
    </div>
  );
};

