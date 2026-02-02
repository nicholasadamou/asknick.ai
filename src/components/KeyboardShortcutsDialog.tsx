"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Command } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["⌘", "K"], description: "Clear conversation" },
  { keys: ["⌘", "L"], description: "Toggle context drawer" },
  { keys: ["⌘", "⌫"], description: "Clear all context" },
  { keys: ["⌘", "Enter"], description: "Send message" },
  { keys: ["←", "→"], description: "Navigate context tabs" },
  { keys: ["1", "-", "4"], description: "Jump to context tab" },
  { keys: ["⌘", "Shift", "T"], description: "Toggle light/dark mode" },
  { keys: ["⌘", "Shift", "S"], description: "Schedule a call" },
  { keys: ["⌘", "Shift", "D"], description: "Download resume" },
  { keys: ["⌘", "Shift", "L"], description: "View LinkedIn" },
  { keys: ["⌘", "Shift", "Q"], description: "Suggest a question" },
  { keys: ["⌘", "Shift", "R"], description: "Report issue" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
];

export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    // Detect if user is on Mac
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // Just ? key (Shift+/) - don't trigger if user is typing
      if (
        e.shiftKey &&
        e.key === "?" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isTyping
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleOpenShortcuts = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-keyboard-shortcuts", handleOpenShortcuts);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(
        "open-keyboard-shortcuts",
        handleOpenShortcuts
      );
    };
  }, [isOpen]);

  const modifierKey = isMac ? "⌘" : "Ctrl";

  // Replace ⌘ with Ctrl for non-Mac users
  const displayShortcuts = shortcuts.map((shortcut) => ({
    ...shortcut,
    keys: shortcut.keys.map((key) => (key === "⌘" ? modifierKey : key)),
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="rounded-2xl border border-gray-300 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-300 p-6 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Command className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="p-6">
                <div className="space-y-3">
                  {displayShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="rounded border border-gray-300 bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer hint */}
                <div className="mt-6 border-t border-gray-300 pt-4 text-center text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400">
                  Press{" "}
                  <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    Esc
                  </kbd>{" "}
                  to close
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
