import OpenAI from "openai";
import { logger } from "@/lib/logger";
import { Context } from "@/types/chat";

/**
 * ResponseGenerator
 * 
 * Crafts responses pulling from knowledge base and context.
 * Handles the actual response generation using the AI model.
 */
export class ResponseGenerator {
  private openai: OpenAI;
  private assistantId: string;

  constructor(openai: OpenAI, assistantId: string) {
    this.openai = openai;
    this.assistantId = assistantId;
  }

  /**
   * Generate a response for the given message
   */
  async generate(
    threadId: string,
    message: string,
    context?: Context
  ): Promise<{
    response: string;
    success: boolean;
    error?: string;
  }> {
    try {
      logger.debug("Generating response", { threadId, message });

      // Prepare message content with context if provided
      let messageContent = message;
      if (context) {
        const contextParts: string[] = [];
        
        if (context.linkedInProfile) {
          contextParts.push(`LinkedIn Profile: ${context.linkedInProfile}`);
        }
        if (context.jobUrl) {
          contextParts.push(`Company/Job: ${context.jobUrl}`);
        }
        if (context.glassdoorJobDescription) {
          contextParts.push(`Glassdoor Job Description:\n${context.glassdoorJobDescription}`);
        }
        if (context.greenhouseJobDescription) {
          contextParts.push(`Greenhouse Job Description:\n${context.greenhouseJobDescription}`);
        }
        if (context.pastedText) {
          contextParts.push(`Additional Context:\n${context.pastedText}`);
        }
        if (context.uploadedImages) {
          contextParts.push(`Uploaded Images:\n${context.uploadedImages}`);
        }
        if (context.uploadedFiles) {
          contextParts.push(`Uploaded Files:\n${context.uploadedFiles}`);
        }
        
        if (contextParts.length > 0) {
          messageContent = `Context Information:\n${contextParts.join("\n\n")}\n\nQuestion: ${message}`;
        }
      }

      // Add message to thread
      await this.openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: messageContent,
      });

      // Create run
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId,
        stream: false,
      });

      logger.debug("Run created", { runId: run.id });

      // Poll for completion
      let runStatus = await this.openai.beta.threads.runs.retrieve(run.id, {
        thread_id: threadId,
      });

      let attempts = 0;
      const maxAttempts = 50; // 50 attempts * 1s = 50s max

      while (
        runStatus.status === "queued" ||
        runStatus.status === "in_progress"
      ) {
        if (attempts >= maxAttempts) {
          return {
            response: "",
            success: false,
            error: "Request timeout - please try again",
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await this.openai.beta.threads.runs.retrieve(run.id, {
          thread_id: threadId,
        });
        attempts++;
      }

      if (runStatus.status === "failed") {
        return {
          response: "",
          success: false,
          error: "Assistant failed to respond",
        };
      }

      if (runStatus.status !== "completed") {
        return {
          response: "",
          success: false,
          error: "Request was cancelled",
        };
      }

      // Get the assistant's response
      const messagesResponse = await this.openai.beta.threads.messages.list(
        threadId
      );
      const assistantMessage = messagesResponse.data.find(
        (msg) => msg.role === "assistant"
      );

      if (!assistantMessage) {
        return {
          response: "",
          success: false,
          error: "No response from assistant",
        };
      }

      // Extract text content
      const textContent = assistantMessage.content.find(
        (content) => content.type === "text"
      );

      let responseText = "I apologize, but I couldn't generate a response.";

      if (textContent && textContent.type === "text") {
        responseText = textContent.text.value;

        // Remove OpenAI annotations/citations like 【4:0†source】
        if (
          textContent.text.annotations &&
          textContent.text.annotations.length > 0
        ) {
          textContent.text.annotations.forEach((annotation) => {
            responseText = responseText.replace(annotation.text, "");
          });
        }
      }

      return {
        response: responseText,
        success: true,
      };
    } catch (error) {
      logger.error("Response generation error:", error);
      return {
        response: "",
        success: false,
        error: "Internal server error",
      };
    }
  }
}
