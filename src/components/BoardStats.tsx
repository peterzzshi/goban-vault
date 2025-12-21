import React from 'react';
import { Eye } from 'lucide-react';
import type { EncodedResult } from '../core/types';
import { GoBoard } from './GoBoard';

interface BoardStatsProps {
  encodedBoard: EncodedResult;
}

export const BoardStats: React.FC<BoardStatsProps> = ({ encodedBoard }) => {
  return (
    <div className="bg-linear-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 mb-6 shadow-2xl border-2 border-purple-200">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <Eye className="w-6 h-6 text-teal-600" />
        Encoded Go Board (19×19) - {encodedBoard.mixColors ? 'Mixed Colours' : 'Fixed Colours'}
      </h3>

      <GoBoard
        board={encodedBoard.board}
        size={encodedBoard.size}
        centerRow={encodedBoard.centerRow}
        centerCol={encodedBoard.centerCol}
      />

      <div className="grid grid-cols-5 gap-4 mt-8">
        <div className="bg-linear-to-br from-blue-500 via-indigo-500 to-blue-700 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform">
          <div className="text-xs font-medium opacity-90">Data Bits</div>
          <div className="text-2xl font-bold mt-1">256</div>
        </div>
        <div className="bg-linear-to-br from-purple-500 via-fuchsia-500 to-purple-700 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform">
          <div className="text-xs font-medium opacity-90">Dummy Stones</div>
          <div className="text-2xl font-bold mt-1">{encodedBoard.dummyCount}</div>
        </div>
        <div className="bg-linear-to-br from-slate-600 via-gray-600 to-slate-800 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform">
          <div className="text-xs font-medium opacity-90">Black</div>
          <div className="text-2xl font-bold mt-1">{encodedBoard.verification.blackStones}</div>
        </div>
        <div className="bg-linear-to-br from-slate-400 via-gray-400 to-slate-600 p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform">
          <div className="text-xs font-medium opacity-90">White</div>
          <div className="text-2xl font-bold mt-1">{encodedBoard.verification.whiteStones}</div>
        </div>
        <div
          className={`p-5 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform ${
            encodedBoard.verification.valid 
              ? 'bg-linear-to-br from-green-500 via-emerald-500 to-teal-600' 
              : 'bg-linear-to-br from-red-500 via-pink-500 to-orange-600'
          }`}
        >
          <div className="text-xs font-medium opacity-90">Valid</div>
          <div className="text-2xl font-bold mt-1">
            {encodedBoard.verification.valid ? '✓' : '✗'}
          </div>
        </div>
      </div>

      <div
        className={`p-6 rounded-2xl border-2 mt-6 shadow-lg ${
          encodedBoard.verification.valid
            ? 'bg-linear-to-r from-green-100 via-emerald-50 to-teal-100 border-green-400'
            : 'bg-linear-to-r from-red-100 via-pink-50 to-orange-100 border-red-400'
        }`}
      >
        <div className="font-bold text-lg flex items-center gap-2 text-slate-800">
          {encodedBoard.verification.valid ? '✓ Valid Go Position' : '✗ Invalid Position'}
        </div>
        <div className="text-sm text-slate-600 mt-2">
          Natural appearance with no obvious empty patterns - looks like a real game!
        </div>
      </div>
    </div>
  );
};

