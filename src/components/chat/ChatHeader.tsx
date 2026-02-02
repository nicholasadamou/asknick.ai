"use client";

import { useEffect } from "react";
import { Sun, Moon, RotateCw, HelpCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { siteConfig } from "@/config/site";

interface ChatHeaderProps {
  hasMessages: boolean;
  onNewChat: () => void;
}

export function ChatHeader({ hasMessages, onNewChat }: ChatHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  // Keyboard shortcut to toggle theme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (isTyping) return;

      // Cmd/Ctrl + Shift + T: Toggle theme
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "t") {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
          Ask {siteConfig.name}
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Help Button */}
          <div className="group relative flex flex-col items-center">
            <button
              onClick={() =>
                window.dispatchEvent(new Event("open-keyboard-shortcuts"))
              }
              className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 sm:p-2"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <span className="pointer-events-none absolute top-full mt-1 hidden whitespace-nowrap rounded-full bg-gray-700 px-3 py-1 text-[11px] text-gray-300 group-hover:block sm:group-hover:block">
              Help (?)
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 sm:p-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>

          {/* New Chat Button */}
          <div className="group relative flex flex-col items-center">
            <button
              onClick={onNewChat}
              disabled={!hasMessages}
              className="cursor-pointer text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Start new chat"
            >
              <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <span className="pointer-events-none absolute top-full mt-1 hidden whitespace-nowrap rounded-full bg-gray-700 px-3 py-1 text-[11px] text-gray-300 group-hover:block sm:group-hover:block">
              New Chat
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
