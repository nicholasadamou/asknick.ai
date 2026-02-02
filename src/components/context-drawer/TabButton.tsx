"use client";

import { ReactNode } from "react";

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  hasContext?: boolean;
}

export function TabButton({ isActive, onClick, icon, label, hasContext }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
        isActive
          ? "border-b-2 border-blue-500 bg-gray-50 dark:border-blue-400 dark:bg-gray-800"
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <span className={isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}>
        {icon}
      </span>
      <span className={isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}>
        {label}
      </span>
      {hasContext && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
      )}
    </button>
  );
}
