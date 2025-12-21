import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

interface EncodingControlsProps {
  onEncode: (mixColors: boolean) => void;
}

export const EncodingControls: React.FC<EncodingControlsProps> = ({ onEncode }) => {
  return (
    <div className="bg-linear-to-br from-indigo-50 via-white to-pink-50 rounded-2xl p-8 mb-6 shadow-xl border-2 border-indigo-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Choose Encoding Mode</h3>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onEncode(false)}
          className="group relative overflow-hidden bg-linear-to-br from-teal-500 via-cyan-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white font-semibold py-5 px-6 rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Lock className="w-6 h-6" />
              <span className="text-lg">Fixed Colours</span>
            </div>
            <div className="text-xs opacity-90">+ Natural dummy stones</div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </button>

        <button
          onClick={() => onEncode(true)}
          className="group relative overflow-hidden bg-linear-to-br from-emerald-500 via-green-500 to-green-700 hover:from-emerald-600 hover:to-green-800 text-white font-semibold py-5 px-6 rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-6 h-6" />
              <span className="text-lg">Mixed Colours</span>
            </div>
            <div className="text-xs opacity-90">+ Natural dummy stones</div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </button>
      </div>
    </div>
  );
};

