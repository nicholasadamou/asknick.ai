"use client";

import { Send, Info, MoreVertical } from "lucide-react";
import { Context } from "@/types/chat";
import { ContextDrawer } from "@/components/ContextDrawer";
import { NextStepsMenu } from "@/components/NextStepsMenu";

interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  context: Context;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isContextDrawerOpen?: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onContextChange: (context: Context) => void;
  onContextDrawerToggle?: () => void;
  onMobileMenuOpen: () => void;
}

export function ChatInput({
  inputValue,
  isLoading,
  context,
  inputRef,
  isContextDrawerOpen,
  onInputChange,
  onSubmit,
  onContextChange,
  onContextDrawerToggle,
  onMobileMenuOpen,
}: ChatInputProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 m-auto max-w-4xl">
      <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
        {/* Context Drawer */}
        <ContextDrawer 
          context={context} 
          onContextChange={onContextChange}
          isOpen={isContextDrawerOpen}
          onToggle={onContextDrawerToggle}
        />

        {/* Input Form */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Next Steps Button */}
          <button
            type="button"
            onClick={onMobileMenuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 sm:hidden"
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {/* Next Steps Menu (outside form to avoid nested forms in modals) */}
          <NextStepsMenu />

          <form onSubmit={onSubmit} className="flex flex-1 items-center gap-2 sm:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition-colors focus:border-accent dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 disabled:opacity-50 sm:px-4 sm:py-3"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-all hover:bg-blue-600 dark:bg-accent dark:hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center gap-1.5 px-2 text-center text-[11px] text-gray-500 dark:text-gray-500 sm:gap-2 sm:text-xs">
          <Info className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <p className="leading-tight">
            AI responses may be inaccurate. Data isn't stored beyond this session.
          </p>
        </div>
      </div>
    </div>
  );
}
