import { Context } from "@/types/chat";

export interface ConversationState {
  threadId: string;
  context?: Context;
  messageHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  metadata?: {
    startTime: Date;
    lastActivity: Date;
    messageCount: number;
  };
}

/**
 * ConversationStateManager
 * 
 * Tracks user context, job descriptions, and previous messages.
 * Maintains conversation state across multiple interactions.
 */
export class ConversationStateManager {
  private states: Map<string, ConversationState>;

  constructor() {
    this.states = new Map();
  }

  /**
   * Create or get existing conversation state
   */
  getOrCreateState(threadId: string, context?: Context): ConversationState {
    let state = this.states.get(threadId);

    if (!state) {
      state = {
        threadId,
        context,
        messageHistory: [],
        metadata: {
          startTime: new Date(),
          lastActivity: new Date(),
          messageCount: 0,
        },
      };
      this.states.set(threadId, state);
    }

    return state;
  }

  /**
   * Update conversation state with new message
   */
  addMessage(
    threadId: string,
    role: "user" | "assistant",
    content: string
  ): void {
    const state = this.states.get(threadId);
    if (!state) return;

    state.messageHistory.push({
      role,
      content,
      timestamp: new Date(),
    });

    if (state.metadata) {
      state.metadata.lastActivity = new Date();
      state.metadata.messageCount++;
    }
  }

  /**
   * Update context for a conversation
   */
  updateContext(threadId: string, context: Context): void {
    const state = this.states.get(threadId);
    if (state) {
      state.context = { ...state.context, ...context };
    }
  }

  /**
   * Get conversation state
   */
  getState(threadId: string): ConversationState | undefined {
    return this.states.get(threadId);
  }

  /**
   * Get recent message history for context
   */
  getRecentHistory(threadId: string, count: number = 10): string {
    const state = this.states.get(threadId);
    if (!state) return "";

    const recent = state.messageHistory.slice(-count);
    return recent
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");
  }

  /**
   * Clear old conversation states (cleanup)
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = new Date();
    for (const [threadId, state] of this.states.entries()) {
      if (state.metadata) {
        const age = now.getTime() - state.metadata.lastActivity.getTime();
        if (age > maxAge) {
          this.states.delete(threadId);
        }
      }
    }
  }
}

// Singleton instance
export const conversationStateManager = new ConversationStateManager();
