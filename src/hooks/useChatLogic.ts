import { useState, useEffect, useCallback } from "react";
import { Message, Context } from "@/types/chat";

export function useChatLogic() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [context, setContext] = useState<Context>({});

  // Load chat history from session storage
  useEffect(() => {
    const savedMessages = sessionStorage.getItem("chat-messages");
    const savedThreadId = sessionStorage.getItem("chat-thread-id");

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(
          parsed.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } catch (e) {
        // Ignore parse errors
      }
    }

    if (savedThreadId) {
      setThreadId(savedThreadId);
    }
  }, []);

  // Save chat history to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chat-messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (threadId) {
      sessionStorage.setItem("chat-thread-id", threadId);
    }
  }, [threadId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      try {
        // Process files to make them serializable
        let processedImages: string | undefined;
        let processedFiles: string | undefined;

        // Process images - convert to base64
        if (context.uploadedImages && Array.isArray(context.uploadedImages) && context.uploadedImages.length > 0) {
          const imagePromises = context.uploadedImages.map(async (file) => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve(`Image: ${file.name} (${file.type})`);
              };
              reader.readAsDataURL(file);
            });
          });
          const images = await Promise.all(imagePromises);
          processedImages = images.join('\n');
        }

        // Process files - read text content or include file info
        if (context.uploadedFiles && Array.isArray(context.uploadedFiles) && context.uploadedFiles.length > 0) {
          const filePromises = context.uploadedFiles.map(async (file) => {
            // Check if it's a PDF file
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
              try {
                // Dynamically import pdf-parse (client-side)
                const pdfjsLib = await import('pdfjs-dist');
                
                // Read file as ArrayBuffer
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                
                // Configure PDF.js worker
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
                
                // Load and parse PDF
                const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
                let fullText = '';
                
                // Extract text from each page
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                  fullText += pageText + '\n';
                }
                
                return `File: ${file.name} (PDF, ${pdf.numPages} pages)\nContent:\n${fullText.trim()}`;
              } catch (error) {
                console.error('PDF parsing error:', error);
                return `File: ${file.name} (PDF - could not extract text, ${(file.size / 1024).toFixed(2)} KB)`;
              }
            }
            // Check if it's a text file
            else if (file.type.startsWith('text/') || 
                file.name.endsWith('.txt') || 
                file.name.endsWith('.md') ||
                file.name.endsWith('.json') ||
                file.name.endsWith('.csv')) {
              return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  resolve(`File: ${file.name}\nContent:\n${e.target?.result}`);
                };
                reader.readAsText(file);
              });
            } else {
              // For non-text files, just include metadata
              return `File: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB)`;
            }
          });
          const files = await Promise.all(filePromises);
          processedFiles = files.join('\n\n');
        }

        const serializableContext = {
          ...context,
          uploadedImages: processedImages,
          uploadedFiles: processedFiles,
        };

        const response = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content.trim(),
            threadId,
            context: serializableContext,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to get response");
        }

        // Read the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let hasError = false;
        let errorMessage = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Try to parse complete JSON objects from the buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);

                if (data.error) {
                  hasError = true;
                  errorMessage = data.error;
                  break;
                }

                if (data.threadId) {
                  setThreadId(data.threadId);
                }

                if (data.response) {
                  const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.response,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, assistantMessage]);
                }
              } catch (parseError) {
                // Silently skip malformed lines
              }
            }
          }

          if (hasError) break;
        }

        if (hasError) {
          throw new Error(errorMessage);
        }
      } catch (error) {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I apologize, but I'm having trouble responding right now. Please try again later.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, threadId, context]
  );

  const clearChat = () => {
    setMessages([]);
    setThreadId(null);
    sessionStorage.removeItem("chat-messages");
    sessionStorage.removeItem("chat-thread-id");
  };

  return {
    messages,
    inputValue,
    isLoading,
    context,
    setInputValue,
    setContext,
    sendMessage,
    clearChat,
  };
}
