"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { siteConfig } from "@/config/site";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSuggestedQuestion: (question: string) => void;
}

export function ChatMessages({
  messages,
  isLoading,
  messagesEndRef,
  onSuggestedQuestion,
}: ChatMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="space-y-6 py-8 sm:space-y-8 sm:py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            {siteConfig.welcomeHeading}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            {siteConfig.welcomeSubheading}
          </p>
        </div>
        <SuggestedQuestions onQuestionClick={onSuggestedQuestion} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <AnimatePresence key={message.id} mode="wait">
          <ChatMessage message={message} />
        </AnimatePresence>
      ))}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-100 px-5 py-3.5 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
