import React from 'react';

export const PropsEditor: React.FC<{
  props: Record<string, unknown>;
  onChange: (props: Record<string, unknown>) => void;
}> = ({ props, onChange }) => {
  const [text, setText] = React.useState(JSON.stringify(props, null, 2));
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <textarea
        className={`flex-1 w-full bg-gray-900 border ${
          error ? 'border-red-500' : 'border-gray-800'
        } rounded p-3 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500/50 text-emerald-50`}
        value={text}
        onChange={handleChange}
        spellCheck={false}
      />
      {error && (
        <div className="mt-2 text-xs text-red-500 font-mono">
          {error}
        </div>
      )}
    </div>
  );
};
