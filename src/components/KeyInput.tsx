import React from 'react';

interface KeyInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const KeyInput: React.FC<KeyInputProps> = ({ value, onChange }) => {
  return (
    <div className="mb-2">
      <label className="block text-sm font-semibold bg-linear-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-3">
        🔑 Private Key (hex, binary, or text)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., deadbeef or 10110101 or any text"
        rows={3}
        className="w-full px-5 py-4 border-2 border-indigo-300 rounded-2xl focus:ring-4 focus:ring-emerald-400 focus:border-emerald-500 transition-all bg-linear-to-br from-slate-50 to-blue-50 hover:from-white hover:to-purple-50 focus:from-white focus:to-emerald-50 resize-none font-mono text-sm shadow-md hover:shadow-lg focus:shadow-xl"
      />
    </div>
  );
};

