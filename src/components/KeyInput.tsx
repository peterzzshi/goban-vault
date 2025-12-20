import React from 'react';

interface KeyInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const KeyInput: React.FC<KeyInputProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Private Key (hex, binary, or text)
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., deadbeef or 10110101 or any text"
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
    </div>
  );
};

