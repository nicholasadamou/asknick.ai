"use client";

import { MessageSquare } from "lucide-react";
import { Modal } from "./Modal";

interface StartNewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function StartNewChatModal({
  isOpen,
  onClose,
  onConfirm,
}: StartNewChatModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Chat"
      subtitle="Begin a fresh conversation"
      icon={<MessageSquare className="h-6 w-6 text-blue-500" />}
    >
      {/* Warning Message */}
      <div className="rounded-lg border border-gray-300 bg-gray-100 p-4 dark:border-gray-800 dark:bg-gray-900/50">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          This will clear your current conversation and start fresh.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="cursor-pointer rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="flex items-center gap-2 cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 dark:bg-accent dark:hover:bg-blue-600"
        >
          <MessageSquare className="h-4 w-4" />
          Start New Chat
        </button>
      </div>
    </Modal>
  );
}
