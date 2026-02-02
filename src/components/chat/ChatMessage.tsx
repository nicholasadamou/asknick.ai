"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/types/chat";
import { MermaidDiagram } from "@/components/MermaidDiagram";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[85%] sm:px-5 sm:py-3.5 ${
          message.role === "user"
            ? "bg-accent text-white"
            : "border border-gray-200 bg-gray-100 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }`}
      >
        {message.role === "assistant" ? (
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { className, children } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const code = String(children).replace(/\n$/, "");

                  // Render Mermaid diagrams
                  if (language === "mermaid") {
                    return <MermaidDiagram chart={code} />;
                  }

                  // Regular code blocks
                  if (className) {
                    return (
                      <pre className={className}>
                        <code className={className}>{children}</code>
                      </pre>
                    );
                  }

                  // Inline code
                  return <code className={className}>{children}</code>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap wrap-break-words text-sm leading-relaxed">
            {message.content}
          </p>
        )}
      </div>
    </motion.div>
  );
}
