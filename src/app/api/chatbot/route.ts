import { NextRequest } from "next/server";
import OpenAI from "openai";
import { logger } from "@/lib/logger";
import { MessageRouter } from "@/services/MessageRouter";

// Lazy-initialize OpenAI client to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Set max duration for the function (60s for Pro plan, 10s for Hobby)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await req.json();
    const message = body.message as string;
    const clientThreadId = body.threadId as string | undefined;
    const context = body.context as { 
      linkedInProfile?: string; 
      jobUrl?: string; 
      glassdoorJobDescription?: string;
      greenhouseJobDescription?: string;
      pastedText?: string;
      uploadedImages?: string;
      uploadedFiles?: string;
    } | undefined;

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    if (!assistantId) {
      return new Response(
        JSON.stringify({ error: "Assistant not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = getOpenAIClient();
    
    // Initialize the message router with all services
    const messageRouter = new MessageRouter(openai, assistantId);
    
    logger.debug("Processing message through router");

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Route the message through the multi-component architecture
          const result = await messageRouter.routeMessage(
            message,
            clientThreadId,
            context
          );

          if (!result.success) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ error: result.error }) + "\n"
              )
            );
            controller.close();
            return;
          }

          // Send the complete response
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                response: result.response,
                threadId: result.threadId,
              }) + "\n"
            )
          );
          controller.close();
        } catch (error) {
          logger.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ error: "Internal server error" }) + "\n"
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    logger.error("Chatbot API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
