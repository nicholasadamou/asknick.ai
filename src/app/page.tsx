"use client";

import { useState, useRef, useEffect } from "react";
import { StartNewChatModal } from "@/components/modals/StartNewChatModal";
import { MobileMenu } from "@/components/MobileMenu";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { useChatLogic } from "@/hooks/useChatLogic";

export default function ChatPage() {
  const {
    messages,
    inputValue,
    isLoading,
    context,
    setInputValue,
    setContext,
    sendMessage,
    clearChat,
  } = useChatLogic();

  const [isStartNewChatModalOpen, setIsStartNewChatModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // Cmd/Ctrl + K: Clear conversation
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (messages.length > 0) {
          setIsStartNewChatModalOpen(true);
        }
      }

      // Cmd/Ctrl + L: Toggle context drawer
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        setIsContextDrawerOpen((prev) => !prev);
      }

      // Cmd/Ctrl + Enter: Send message (only when typing in textarea)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "Enter" &&
        isTyping &&
        inputValue.trim()
      ) {
        e.preventDefault();
        sendMessage(inputValue);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [messages.length, inputValue, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-background">
      {/* Header */}
      <ChatHeader
        hasMessages={messages.length > 0}
        onNewChat={() => setIsStartNewChatModalOpen(true)}
      />

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto pb-64">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            onSuggestedQuestion={sendMessage}
          />
        </div>
      </main>

      {/* Start New Chat Modal */}
      <StartNewChatModal
        isOpen={isStartNewChatModalOpen}
        onClose={() => setIsStartNewChatModalOpen(false)}
        onConfirm={clearChat}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog />

      {/* Chat Input */}
      <ChatInput
        inputValue={inputValue}
        isLoading={isLoading}
        context={context}
        inputRef={inputRef}
        isContextDrawerOpen={isContextDrawerOpen}
        onInputChange={setInputValue}
        onSubmit={handleSubmit}
        onContextChange={setContext}
        onContextDrawerToggle={() => setIsContextDrawerOpen((prev) => !prev)}
        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
}
