import React from 'react';
import { Lock, Sparkles, Info } from 'lucide-react';

interface EncodingControlsProps {
  onEncode: (mixColors: boolean) => void;
}

export const EncodingControls: React.FC<EncodingControlsProps> = ({ onEncode }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <div className="flex items-start gap-3 mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700">
          <strong>Natural Filling Strategy:</strong> Each quadrant uses its first 64 positions for real data.
          The remaining positions (last ~17 per quadrant) are filled with deterministic pseudo-random "dummy" stones
          based on the key hash. This eliminates obvious empty patterns while keeping decoding simple: just read the
          first 64 positions of each quadrant and ignore the rest!
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onEncode(false)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            <span>Fixed Colors</span>
          </div>
          <div className="text-xs opacity-90 mt-1">+ Natural dummy stones</div>
        </button>
        <button
          onClick={() => onEncode(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>Mixed Colors</span>
          </div>
          <div className="text-xs opacity-90 mt-1">+ Natural dummy stones</div>
        </button>
      </div>
    </div>
  );
};

