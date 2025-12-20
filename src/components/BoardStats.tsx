import React from 'react';
import { Eye } from 'lucide-react';
import type { EncodedResult } from '../core/types';
import { GoBoard } from './GoBoard';

interface BoardStatsProps {
  encodedBoard: EncodedResult;
}

export const BoardStats: React.FC<BoardStatsProps> = ({ encodedBoard }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5" />
        Encoded Go Board (19×19) - {encodedBoard.mixColors ? 'Mixed Colors' : 'Fixed Colors'}
      </h3>

      <GoBoard
        board={encodedBoard.board}
        size={encodedBoard.size}
        centerRow={encodedBoard.centerRow}
        centerCol={encodedBoard.centerCol}
      />

      <div className="grid grid-cols-5 gap-3 mt-6">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-xs text-slate-600">Data Bits</div>
          <div className="text-lg font-semibold">256</div>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-xs text-slate-600">Dummy Stones</div>
          <div className="text-lg font-semibold">{encodedBoard.dummyCount}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded">
          <div className="text-xs text-slate-600">Black</div>
          <div className="text-lg font-semibold">{encodedBoard.verification.blackStones}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded">
          <div className="text-xs text-slate-600">White</div>
          <div className="text-lg font-semibold">{encodedBoard.verification.whiteStones}</div>
        </div>
        <div
          className={`p-3 rounded ${
            encodedBoard.verification.valid ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <div className="text-xs text-slate-600">Valid</div>
          <div className="text-sm font-semibold">
            {encodedBoard.verification.valid ? '✓' : '✗'}
          </div>
        </div>
      </div>

      <div
        className={`p-4 rounded border-2 mt-4 ${
          encodedBoard.verification.valid
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
        }`}
      >
        <div className="font-semibold flex items-center gap-2">
          {encodedBoard.verification.valid ? '✓ Valid Go Position' : '✗ Invalid Position'}
        </div>
        <div className="text-sm text-slate-600 mt-1">
          Natural appearance with no obvious empty patterns - looks like a real game!
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded">
        <h4 className="font-semibold mb-2">🎨 How Dummy Stones Work:</h4>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Each quadrant: first 64 positions = real data</li>
          <li>Remaining ~17 positions per quadrant = dummy zone</li>
          <li>Dummy placement: deterministic pseudo-random (~40% density)</li>
          <li>Based on key hash: same key → same dummy pattern</li>
          <li>Decoding: read only first 64 positions, ignore rest</li>
          <li>Result: natural distribution with no empty rows!</li>
        </ul>
      </div>
    </div>
  );
};

