import React from 'react';

export const CompositionPicker: React.FC<{
  compositions: string[];
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ compositions, selectedId, onSelect }) => {
  return (
    <div className="flex flex-col gap-1 p-2">
      {compositions.map(id => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
            selectedId === id
              ? 'bg-emerald-600 text-white font-medium'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          {id}
        </button>
      ))}
    </div>
  );
};
