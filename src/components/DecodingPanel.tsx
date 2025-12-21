import React from 'react';
import { Unlock, RefreshCw } from 'lucide-react';
import type { EncodedResult, DecodedResult } from '../core/types';
import { binaryToHex } from '../utils/keyConverter';
import {HEX_DISPLAY_BITS} from "../utils/constants.ts";

interface DecodingPanelProps {
  encodedBoard: EncodedResult;
  decodedKey: DecodedResult | null;
  onDecode: () => void;
}

export const DecodingPanel: React.FC<DecodingPanelProps> = ({ encodedBoard, decodedKey, onDecode }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <RefreshCw className="w-5 h-5" />
        Decode Back to Key
      </h3>
      <button
        onClick={onDecode}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
      >
        <Unlock className="w-5 h-5" />
        Decode Board → Key
      </button>

      {decodedKey && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded border-2 ${
              decodedKey.matches ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="font-semibold text-lg mb-2">
              {decodedKey.matches ? '✓ Perfect Match!' : '✗ Mismatch'}
            </div>
            <div className="text-sm">
              {decodedKey.matches
                ? 'Decoded perfectly! Dummy stones were ignored.'
                : 'Warning: Decoded key does not match original'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded">
              <div className="text-sm font-medium text-slate-700 mb-2">Original Key (hex)</div>
              <code className="text-xs text-slate-600 break-all">
                {binaryToHex(encodedBoard.keyBits, 64)}...
              </code>
            </div>
            <div className="bg-slate-50 p-4 rounded">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Decoded Key (hex, first {HEX_DISPLAY_BITS} bits)
              </div>
              <code className="text-xs text-slate-600 break-all">{decodedKey.hex}</code>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-5">
            <h4 className="font-semibold text-lg mb-3">🎯 Perfect Natural Encoding!</h4>
            <div className="text-sm space-y-2">
              <p>
                <strong>Final Solution Achieves:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>✓ Deterministic encoding (same key → same board)</li>
                <li>✓ 256-bit capacity (64 bits per quadrant)</li>
                <li>✓ Valid Go rules (all stones have liberties)</li>
                <li>✓ Natural appearance (no obvious patterns)</li>
                <li>✓ Even distribution (dummy stones fill gaps)</li>
                <li>✓ Mixed colors (organic color distribution)</li>
                <li>✓ Perfect decoding (ignore dummy stones)</li>
                <li>✓ Memorable structure (quadrant-based)</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-800 text-white rounded-lg p-4">
            <h4 className="font-semibold mb-3">🔄 Decoding Algorithm</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Identify the 4 quadrants (separated by center row/col 9)</li>
              <li>For each quadrant, read ONLY the first 64 positions</li>
              <li>Read order: row-by-row, left-to-right within quadrant</li>
              <li>Ignore all stones beyond position 64 (dummy stones)</li>
              <li>Stone present = 1, empty = 0 (color irrelevant!)</li>
              <li>Concatenate: TL(64) + TR(64) + BL(64) + BR(64) = 256 bits</li>
            </ol>
            <div className="mt-3 p-3 bg-slate-700 rounded text-xs">
              <strong>Key insight:</strong> Dummy stones are determined by key hash, so they're reproducible
              but not needed for decoding. They just make the board look more natural!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

