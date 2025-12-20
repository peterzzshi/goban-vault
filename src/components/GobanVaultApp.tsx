import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { EncodedResult, DecodedResult } from '../core/types';
import { encodeWithDummyStones } from '../core/encoder';
import { decodeBoard } from '../core/decoder';
import { verifyBoard } from '../core/validator';
import { keyToBinary } from '../utils/keyConverter';
import { KeyInput } from './KeyInput';
import { EncodingControls } from './EncodingControls';
import { BoardStats } from './BoardStats';
import { DecodingPanel } from './DecodingPanel';
import { BOARD_SIZE } from '../utils/constants';

export const GobanVaultApp: React.FC = () => {
  const [inputKey, setInputKey] = useState('');
  const [encodedBoard, setEncodedBoard] = useState<EncodedResult | null>(null);
  const [decodedKey, setDecodedKey] = useState<DecodedResult | null>(null);

  const handleEncode = (mixColors: boolean) => {
    const keyBits = keyToBinary(inputKey);
    const result = encodeWithDummyStones(keyBits, BOARD_SIZE, mixColors);
    const verification = verifyBoard(result.board, BOARD_SIZE);

    setEncodedBoard({
      ...result,
      keyBits,
      verification,
      size: BOARD_SIZE,
      mixColors
    });
    setDecodedKey(null);
  };

  const handleDecode = () => {
    if (!encodedBoard) return;
    const result = decodeBoard(encodedBoard);
    setDecodedKey(result);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-emerald-600" />
          Goban Vault - Naturally Filled Go Board Encoder
        </h1>
        <p className="text-slate-600">
          Encode your keys as valid Go game positions with intelligent dummy stones
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <KeyInput value={inputKey} onChange={setInputKey} />
      </div>

      <EncodingControls onEncode={handleEncode} />

      {encodedBoard && (
        <>
          <BoardStats encodedBoard={encodedBoard} />
          <DecodingPanel
            encodedBoard={encodedBoard}
            decodedKey={decodedKey}
            onDecode={handleDecode}
          />
        </>
      )}
    </div>
  );
};

