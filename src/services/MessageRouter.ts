import OpenAI from "openai";
import { logger } from "@/lib/logger";
import { Context } from "@/types/chat";
import { conversationStateManager } from "./ConversationStateManager";
import { KnowledgeBaseSearch } from "./KnowledgeBaseSearch";
import { ResponseGenerator } from "./ResponseGenerator";

// Simple in-memory cache for thread IDs
const threadCache = new Map<string, string>();

/**
 * MessageRouter
 * 
 * Handles incoming messages and routes them to the AI agent.
 * Coordinates between different services to process messages.
 */
export class MessageRouter {
  private openai: OpenAI;
  private assistantId: string;
  private knowledgeBaseSearch: KnowledgeBaseSearch;
  private responseGenerator: ResponseGenerator;

  constructor(openai: OpenAI, assistantId: string) {
    this.openai = openai;
    this.assistantId = assistantId;
    this.knowledgeBaseSearch = new KnowledgeBaseSearch(openai, assistantId);
    this.responseGenerator = new ResponseGenerator(openai, assistantId);
  }

  /**
   * Route an incoming message through the system
   */
  async routeMessage(
    message: string,
    clientThreadId?: string,
    context?: Context
  ): Promise<{
    response: string;
    threadId: string;
    success: boolean;
    error?: string;
  }> {
    try {
      // Step 1: Get or create thread
      let threadId: string;
      if (clientThreadId && threadCache.has(clientThreadId)) {
        threadId = clientThreadId;
        logger.debug("Using existing thread", { threadId });
      } else {
        const thread = await this.openai.beta.threads.create();
        threadId = thread.id;
        threadCache.set(threadId, threadId);
        logger.debug("Created new thread", { threadId });
      }

      // Step 2: Update conversation state
      const state = conversationStateManager.getOrCreateState(
        threadId,
        context
      );
      if (context) {
        conversationStateManager.updateContext(threadId, context);
      }
      conversationStateManager.addMessage(threadId, "user", message);

      logger.debug("Conversation state updated", {
        threadId,
        messageCount: state.metadata?.messageCount,
      });

      // Step 3: Optional: Search knowledge base
      // This is a placeholder - the OpenAI assistant handles this automatically
      const knowledgeResults = await this.knowledgeBaseSearch.search(
        message,
        threadId
      );

      if (knowledgeResults) {
        logger.debug("Knowledge base results found", { threadId });
      }

      // Step 4: Generate response
      const result = await this.responseGenerator.generate(
        threadId,
        message,
        context
      );

      if (!result.success) {
        return {
          response: "",
          threadId,
          success: false,
          error: result.error,
        };
      }

      // Step 5: Update conversation state with assistant response
      conversationStateManager.addMessage(
        threadId,
        "assistant",
        result.response
      );

      return {
        response: result.response,
        threadId,
        success: true,
      };
    } catch (error) {
      logger.error("Message routing error:", error);
      return {
        response: "",
        threadId: clientThreadId || "",
        success: false,
        error: "Internal server error",
      };
    }
  }

  /**
   * Get conversation history for debugging
   */
  getConversationHistory(threadId: string): string {
    return conversationStateManager.getRecentHistory(threadId);
  }
}
