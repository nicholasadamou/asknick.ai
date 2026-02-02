"use client";

import { Clipboard } from "lucide-react";

interface TextTabProps {
  pastedText: string;
  onPastedTextChange: (value: string) => void;
  onClear: () => void;
}

export function TextTab({ pastedText, onPastedTextChange, onClear }: TextTabProps) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onPastedTextChange(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Paste or type text
        </span>
        <button
          onClick={handlePaste}
          className="cursor-pointer flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
        >
          <Clipboard className="h-3.5 w-3.5" />
          <span>Paste</span>
        </button>
      </div>
      <textarea
        value={pastedText}
        onChange={(e) => onPastedTextChange(e.target.value)}
        placeholder="Paste or type text here (e.g., job description, resume, etc.)..."
        rows={8}
        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition-colors focus:border-accent dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 sm:px-4 sm:py-3"
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {pastedText.length} characters
        </span>
        {pastedText && (
          <button
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
