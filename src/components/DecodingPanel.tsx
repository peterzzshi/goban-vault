import React, { useMemo } from 'react';
import { Unlock, RefreshCw } from 'lucide-react';
import type { EncodedResult, DecodedResult } from '../core/types';
import { binaryToHex } from '../utils/keyConverter';
import { HEX_DISPLAY_BITS } from '../utils/constants';

interface DecodingPanelProps {
  encodedBoard: EncodedResult;
  decodedKey: DecodedResult | null;
  onDecode: () => void;
}

export const DecodingPanel: React.FC<DecodingPanelProps> = ({ encodedBoard, decodedKey, onDecode }) => {
  const originalKeyHex = useMemo(
    () => binaryToHex(encodedBoard.keyBits, 64),
    [encodedBoard.keyBits]
  );

  const matchStatusClass = decodedKey?.matches
    ? 'bg-linear-to-r from-green-100 via-emerald-50 to-teal-100 border-green-400'
    : 'bg-linear-to-r from-red-100 via-pink-50 to-orange-100 border-red-400';

  return (
    <div className="bg-linear-to-br from-cyan-50 via-white to-indigo-50 rounded-2xl p-8 shadow-2xl border-2 border-cyan-200">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
        <RefreshCw className="w-6 h-6 text-blue-600" />
        Decode Back to Key
      </h3>
      <button
        onClick={onDecode}
        className="w-full bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2 mb-6"
      >
        <Unlock className="w-5 h-5" />
        Decode Board → Key
      </button>

      {decodedKey && (
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl border-2 shadow-lg ${matchStatusClass}`}>
            <div className="font-bold text-lg mb-2 text-slate-800">
              {decodedKey.matches ? '✓ Perfect Match!' : '✗ Mismatch'}
            </div>
            <div className="text-sm text-slate-600">
              {decodedKey.matches
                ? 'Decoded perfectly! Dummy stones were ignored.'
                : 'Warning: Decoded key does not match original'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-linear-to-br from-purple-100 via-pink-50 to-blue-100 p-5 rounded-2xl border-2 border-purple-300 shadow-md">
              <div className="text-sm font-semibold text-slate-700 mb-2">Original Key (hex)</div>
              <code className="text-xs text-slate-600 break-all block bg-white p-3 rounded-xl shadow-inner">
                {originalKeyHex}...
              </code>
            </div>
            <div className="bg-linear-to-br from-blue-100 via-cyan-50 to-indigo-100 p-5 rounded-2xl border-2 border-blue-300 shadow-md">
              <div className="text-sm font-semibold text-slate-700 mb-2">
                Decoded Key (hex, first {HEX_DISPLAY_BITS} bits)
              </div>
              <code className="text-xs text-slate-600 break-all block bg-white p-3 rounded-xl shadow-inner">{decodedKey.hex}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

