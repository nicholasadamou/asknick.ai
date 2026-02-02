"use client";

import { ReactNode, RefObject } from "react";

interface DragDropUploadProps {
  inputRef: RefObject<HTMLInputElement | null>;
  accept?: string;
  multiple?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: ReactNode;
  label: string;
}

export function DragDropUpload({
  inputRef,
  accept,
  multiple = true,
  onChange,
  icon,
  label,
}: DragDropUploadProps) {
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-600 transition-colors hover:border-blue-400 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:bg-gray-700"
      >
        {icon}
        <span>{label}</span>
      </button>
    </>
  );
}
